import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {
  userForm: FormGroup;
  isEditing: boolean = false;
  username: string = ''; // Store the username

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.userForm = this.fb.group({
      username: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required],
      gender: ['Male', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(0)]],
      dob: ['', Validators.required],
      contact_number: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Guest';
    this.fetchUserData();
  }

  fetchUserData(): void {
    this.http.get<any>(`http://localhost:3000/api/user/${this.username}`).subscribe(data => {
      if (data.success) {
        this.userForm.patchValue(data.user);
      } else {
        alert('User not found');
      }
    }, error => {
      alert('Error fetching user data');
      console.error(error);
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.fetchUserData();
    }
  }

  onUpdate(): void {
    if (this.userForm.valid) {
      this.http.put<any>(`http://localhost:3000/api/user/${this.username}`, this.userForm.value).subscribe(response => {
        if (response.success) {
          alert('User details updated successfully!');
          this.isEditing = false; // Exit edit mode
        } else {
          alert('Failed to update user details.');
        }
      }, error => {
        alert('Error updating user data');
        console.error(error);
      });
    }
  }
}
