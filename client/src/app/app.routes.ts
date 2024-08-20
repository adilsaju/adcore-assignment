import { Routes } from '@angular/router';
import { CourseListComponent } from './course-list/course-list.component';
import { CourseFormComponent } from './course-form/course-form.component';

export const routes: Routes = [
    { path: '', component: CourseListComponent },
    { path: 'add-course', component: CourseFormComponent },
    { path: 'edit-course/:id', component: CourseFormComponent }
];
