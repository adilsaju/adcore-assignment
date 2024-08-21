import { Component } from '@angular/core';
import { CourseService } from '../course.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { CURRENCY_SYMBOLS } from './cur';
@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule,NgbTooltipModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css'
})
export class CourseListComponent {
  courses: any[] = [];
  currentPage: number = 1;
  totalCourses: number = 0;
  totalPages: number = 0;

  perPageLimit: number = 10;
  searchQuery: string = '';

  CURRENCY_SYMBOLS = CURRENCY_SYMBOLS

  constructor(private courseService: CourseService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.loadCourses();
      this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.loadCourses(this.currentPage, this.perPageLimit, this.searchQuery);
    });
  }

  getLength(id: string): Number {
    let c = this.courses.find((x)=>x._id === id)
    // console.log(c[0]);
    let dd = new Date(c.EndDate).getTime()-new Date(c.StartDate).getTime()
    let days = dd/ (1000*60*60*24)
    console.log(days);
    // console.log(id);
    return days
  }

  loadCourses(page: number = 1, perPageLimit: number = 10, search: string = this.searchQuery): void {
    this.courseService.getCourses(page, perPageLimit, search).subscribe(data => {
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

  editCourse(id: string): void {
    this.router.navigate([`/edit-course/${id}`]);
  }

  get totalPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  getCurrencySymbol(currencyCode: string): string {
    return this.CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  }

}
