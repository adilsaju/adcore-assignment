import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../course.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgbTypeaheadModule, CommonModule],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.css'
})
export class CourseFormComponent {
  courseForm: FormGroup;
  @Input() courseId: string | null = null;
  universities: string[] = [];
  countries: string[] = [];
  cities: string[] = [];
  currencies: string[] = ['USD', 'EUR', 'GBP', 'UGX', 'CAD'];
  title1: string = this.courseId? "Edit Course" : "New Course"

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
      Currency: ['', Validators.required],
      StartDate: ['',Validators.required],
      EndDate: ['',Validators.required],
      Price: ['', Validators.required],
      University: ['', Validators.required]
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      
      if (this.courseId) {
        console.log(" FOUND");
        this.title1 = "Edit Course"

        this.courseService.getCourseById(this.courseId).subscribe(course => {
          this.courseForm.patchValue(course);
        });

      //only during edit disable
      this.courseForm.get('City')?.disable();
      this.courseForm.get('Country')?.disable();
      this.courseForm.get('CourseName')?.disable();
      this.courseForm.get('University')?.disable();

      }
      else{
        console.log("NOT3 FOUND");
  
      }
      this.loadAutoCompleteOptions();
    })

  }
  loadAutoCompleteOptions(): void {
    this.courseService.getCourses(1, 100) // Load a large number to get all unique values
      .subscribe(data => {
        this.universities = Array.from(new Set(data.courses.map((course:any) => course.University)));
        this.countries = Array.from(new Set(data.courses.map((course:any) => course.Country)));
        this.cities = Array.from(new Set(data.courses.map((course:any) => course.City)));
        this.currencies = Array.from(new Set(data.courses.map((course:any) => course.Currency)));

      });
  }
  searchUniversity = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.universities.filter(v => v.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  searchCountry = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.countries.filter(v => v.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  searchCity = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.cities.filter(v => v.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  onSubmit(): void {
    if (this.courseForm.valid) {
      // const formData = this.courseForm.value;
      const formData = this.courseForm.getRawValue();

      if (this.courseId) {
        this.courseService.updateCourse(this.courseId, formData).subscribe(() => {
          this.router.navigate(['/']);
        });
      } else {
        this.courseService.createCourse(formData).subscribe(() => {
          this.router.navigate(['/']);
        });
      }
    }
    else {
      Object.keys(this.courseForm.controls).forEach(field => {
        const control = this.courseForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }
  }
}
