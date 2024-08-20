import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://127.0.0.1:5000/';

  constructor(private http: HttpClient) { }

  getCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_courses`);
  }

  //TODO: getCourses with query params

  createCourse(course: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create_course`, course);
  }

  updateCourse(course: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_course`, course );
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_course/${id}`);
  }
}
