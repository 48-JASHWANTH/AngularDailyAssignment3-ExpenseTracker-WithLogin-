import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = signal('');
  password = signal('');
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.authService.login(this.username(), this.password()).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set('Invalid username or password');
        }
      },
      error: () => {
        this.errorMessage.set('Login failed. Please try again.');
      }
    });
  }

  updateUsername(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.username.set(value);
  }

  updatePassword(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.password.set(value);
  }
}
