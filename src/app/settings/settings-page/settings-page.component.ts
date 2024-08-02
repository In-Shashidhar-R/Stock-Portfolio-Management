import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {
  profile = {
    username: '',
    email: ''
  };

  notifications = {
    email: false,
    sms: false
  };

  apiKeys = {
    alphaVantage: ''
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.http.get<any>('/api/settings').subscribe(data => {
      this.profile = data.profile;
      this.notifications = data.notifications;
      this.apiKeys = data.apiKeys;
    });
  }

  onSubmitProfile(): void {
    this.http.put('/api/settings/profile', this.profile).subscribe(response => {
      console.log('Profile updated');
    });
  }

  onSubmitNotifications(): void {
    this.http.put('/api/settings/notifications', this.notifications).subscribe(response => {
      console.log('Notifications updated');
    });
  }

  onSubmitApiKeys(): void {
    this.http.put('/api/settings/api-keys', this.apiKeys).subscribe(response => {
      console.log('API Keys updated');
    });
  }
}
