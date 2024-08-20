import { Component } from '@angular/core';
import { CourseService } from '../course.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css'
})
export class CourseListComponent {
  courses: any[] = [];
  currentPage: number = 1;
  totalCourses: number = 0;
  totalPages: number = 0;

  constructor(private courseService: CourseService, private router: Router) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe(data => {
      this.courses = data.courses;
      this.currentPage = data.current_page;
      this.totalCourses = data.total_courses;
      this.totalPages = data.total_pages;
    });
  }

  deleteCourse(id: string): void {
    this.courseService.deleteCourse(id).subscribe((res) => {
      // console.log("DELETED: ");
      console.log(res.message);
      this.loadCourses();
    });
  }

  editCourse(): void {
    this.router.navigate(['/edit-course']);
  }
}
