from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Course(BaseModel):
    City: str
    Country: str
    CourseDescription: str
    CourseName: str
    Currency: str
    EndDate: datetime
    Price: float
    StartDate: datetime
    University: str
    _id: Optional[str]
    timestamp: Optional[datetime]
