import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
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
    ]),
    trigger('boxAnimationLeft', [
      state('void', style({ opacity: 0, transform: 'translateX(-100%)' })),
      state('*', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        animate('1s ease-out')
      ])
    ]),
    trigger('boxAnimationUp', [
      state('void', style({ opacity: 0, transform: 'translateY(100%)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        animate('1s ease-out')
      ])
    ]),
    trigger('boxAnimationDown', [
      state('void', style({ opacity: 0, transform: 'translateY(-100%)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        animate('1s ease-out')
      ])
    ]),
    trigger('boxAnimationRight', [
      state('void', style({ opacity: 0, transform: 'translateX(100%)' })),
      state('*', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        animate('1s ease-out')
      ])
    ]),
    trigger('contentFadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [
        animate('1s 1s ease-out') // Delayed animation
      ])
    ]),
    trigger('authBoxRight', [
      state('void', style({ opacity: 0, transform: 'translateX(-100%)' })),
      state('*', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        animate('1s ease-out')
      ])
    ]),
    trigger('authBoxLeft', [
      state('void', style({ opacity: 0, transform: 'translateX(100%)' })),
      state('*', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        animate('1s ease-out')
      ])
    ])
  ]
})
export class HomePageComponent implements OnInit {
  username: string = '';  // Store the username here
  investmentSummary: any[] = [];
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['Acc_Name', 'Amount_Invested', 'Realized_Profit'];  

  constructor(private http: HttpClient) {
    this.dataSource = new MatTableDataSource(this.investmentSummary);
  }

  ngOnInit(): void {
    // Retrieve the username from localStorage
    this.username = localStorage.getItem('username') || 'Guest';
    this.fetchInvestmentSummary();
  }

  fetchInvestmentSummary(): void {
    this.http.get<any>(`http://localhost:3000/api/dashboard?username=${this.username}`).subscribe(
      response => {
        if (response.success) {
          this.investmentSummary = response.investmentSummary;
          this.dataSource.data = this.investmentSummary; 
        } else {
          alert('Failed to fetch investment summary');
        }
      },
      error => {
        alert('An error occurred while fetching investment summary');
      }
    );
}


  activateLink(event: Event): void {
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => link.classList.remove('active-link'));
    const target = event.currentTarget as HTMLElement;
    target.classList.add('active-link');
  }
}
