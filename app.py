from flask import Flask, jsonify, request
import requests
from flask_pymongo import PyMongo
from pymongo import MongoClient, ASCENDING
import pandas as pd
from io import StringIO
from datetime import datetime
from bson import ObjectId
from pydantic import ValidationError
from models import Course
import math
from flask_cors import CORS 

app = Flask(__name__)
#add cors
CORS(app)

app.config["MONGO_URI"] =  "mongodb+srv://adilsaju:HyutFcJn6uLxRqQl@cluster0.sovhz.mongodb.net/adcodedb?retryWrites=true&w=majority&appName=Cluster0"
mongo = PyMongo(app)
mongo.db.course.create_index([("timestamp", ASCENDING)], expireAfterSeconds=600)


def check_expiration():
    print("#"*40)
    if mongo.db.course.count_documents({}) == 0:
        print("No data found or data is expired. Fetching new data...")
        r = requests.get("https://api.mockaroo.com/api/501b2790?count=100&key=8683a1c0")
        # print(f"Status Code: {r.status_code}")
        # print(f"Content-Type: {r.headers.get('Content-Type')}")
        if r.status_code == 200:
            csv_data = StringIO(r.text)
            df = pd.read_csv(csv_data)
            print(df)
            #TODO:
            d2 = df.to_dict(orient='records')

            for record in d2:
                record['timestamp'] = datetime.utcnow()

            mongo.db.course.insert_many(d2)
        else:
            print("error")
    else:
        print("not downloading anything")

check_expiration()

@app.route('/')
def home():
    return "Hello, Flask!"

#WEB SERVICES ##########################################
def serialize_document(doc):
    doc['_id'] = str(doc['_id'])
    return doc

@app.get('/get_courses')
def get_courses():
    try:

        page = int(request.args.get("page",1))
        per_page_limit = int(request.args.get("per_page_limit",10))

        # search = request.args.get('search', '')
        # query = {"$or": [
        #     {"City": {"$regex": search, "$options": "i"}},
        #     {"Country": {"$regex": search, "$options": "i"}},
        #     {"CourseDescription": {"$regex": search, "$options": "i"}},
        #     {"CourseName": {"$regex": search, "$options": "i"}},
        #     {"Currency": {"$regex": search, "$options": "i"}},
        #     {"University": {"$regex": search, "$options": "i"}}
        # ]}

        query = {}
        for key, value in request.args.items():
            if key not in ["page", "per_page_limit"]:
                query[key.capitalize()] = {"$regex": value, "$options": "i"}

        total_courses = mongo.db.course.count_documents(query)

        # data = mongo.db.course.find()
        #acutal filtered dataa
        data = mongo.db.course.find(query).skip((page - 1) * per_page_limit).limit(per_page_limit)

        serialized_data = [serialize_document(item) for item in data]
    except Exception as e:
        print("DB error: " + str(e))
        return jsonify({"error": "Database error"}), 500
    else:
        # return jsonify(serialized_data)
        return jsonify({
            "total_courses": total_courses,
            "total_pages": math.ceil(total_courses / per_page_limit),
            "current_page": page,
            "per_page_limit": per_page_limit,
            "courses": serialized_data
        })


@app.get('/get_courses/<id>')
def get_course_by_id(id):
    try:
        try:
            object_id = ObjectId(id)
        except Exception as e:
            print(f"Invalid ObjectId: {e}")
            return jsonify({"error": "Invalid ObjectId format"}), 400
        
        course = mongo.db.course.find_one({"_id": object_id})
        
        if course is None:
            return jsonify({"error": "course not found"}), 404
        
        serialized_course = serialize_document(course)
        
        return jsonify(serialized_course)
    except Exception as e:
        print("DB error: " + str(e))
        return jsonify({"error": "daatabase error"}), 500

@app.put('/update_course')
def update_course():
    try:
        course_update_data = request.get_json()

        course_id = course_update_data.get("_id")
        if not course_id or not ObjectId.is_valid(course_id):
            return jsonify({"error": "Invalid or missing course ID"}), 400

        course_update_data['timestamp'] = datetime.utcnow()
        # print(course_update_data)
        course = Course(**course_update_data)

        result =  mongo.db.course.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": course.model_dump()}
        )

        if result.matched_count == 0:
            return jsonify( {"error": "Course not found"} ), 404

    except ValidationError as e:
        return jsonify({"error":  e.errors()}), 400
    except Exception as e:
        print("Error: " + str(e))
        return jsonify({"error": "error " + str(e)}), 500 
    else:
        return jsonify({"message": "updated course with id: " + str(course_id) })


@app.delete('/delete_course/<string:id>')
def delete_course(id):
    try:
        res = mongo.db.course.delete_one({"_id": ObjectId(id)})
        # print(res)

        if res.deleted_count == 0:
            return jsonify({"message": "No document found with the given ID"}), 400
    except Exception as e:
        print("error "+e)
        return jsonify({"error": "database error"}), 500
    else:
        return jsonify({"message": "Deleted course with id " + id })

@app.post('/create_course')
def create_course():
    #add
    try:
        course1 = request.get_json()
        course1['timestamp'] = datetime.utcnow()
        print(course1)

        course = Course(**course1)
        result = mongo.db.course.insert_one(course.model_dump())
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    except Exception as e:
        print("Error: " + str(e))
        return jsonify({"error": "error " + str(e)}), 500 
    else:
        return jsonify({"message": "added the couse, id: "+ str(result.inserted_id)})



if __name__ == '__main__':
    app.run(debug=True)
