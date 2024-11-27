import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
  animations: [
    trigger('welcomeMessage', [
      state('void', style({ opacity: 0, transform: 'translateY(-100%)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        animate('1s ease-out')
      ]),
      transition('* => void', [
        animate('0.5s ease-in')
      ])
    ])
  ]
})
export class SignupPageComponent implements OnInit {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      name: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', Validators.required],
      contact_number: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.registerForm.valid) {
      const dob = new Date(this.registerForm.value.dob);
      const age = this.calculateAge(dob);
      this.registerForm.patchValue({ age }); // Update age in form data

      this.http.post<any>('http://localhost:3000/api/register', this.registerForm.value).subscribe(
        (response) => {
          if (response.success) {
            alert('Registration successful!');
            this.router.navigate(['/login/login']);
          } else {
            alert(response.message);
          }
        },
        error => {
          alert('An error occurred. Please try again.');
        }
      );
    }
  }

  private calculateAge(dob: Date): number {
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs); // milliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
}
