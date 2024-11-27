import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Portfolio-Management';
  constructor(private router: Router) {}  
  
  ngOnInit(): void {
    const isFirstVisit = sessionStorage.getItem('isFirstVisit');

    if (!isFirstVisit) {
      this.router.navigate(['/load']); 
      sessionStorage.setItem('isFirstVisit', 'true');
  }
}
}