import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) { }
  
  searchQuery = '';
  title = 'client';
  navigateToAddCourse(): void {
    this.router.navigate(['/add-course']);
  }
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.router.navigate(['/'], { queryParams: { search: this.searchQuery } });
  }
}
