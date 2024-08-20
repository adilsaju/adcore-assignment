import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../course.service';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.css'
})
export class CourseFormComponent {
  courseForm: FormGroup;
  @Input() courseId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      City: ['', Validators.required],
      Country: ['', Validators.required],
      CourseName: ['', Validators.required],
      CourseDescription: [''],
      Currency: [''],
      EndDate: [''],
      Price: [''],
      StartDate: [''],
      University: ['']
    });
  }

  ngOnInit(): void {
    if (this.courseId) {
      this.courseService.getCourseById(this.courseId).subscribe(course => {
        this.courseForm.patchValue(course);
      });
    }
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const formData = this.courseForm.value;
      if (this.courseId) {
        this.courseService.updateCourse(formData).subscribe(() => {
          this.router.navigate(['/']);
        });
      } else {
        this.courseService.createCourse(formData).subscribe(() => {
          this.router.navigate(['/']);
        });
      }
    }
  }
}
