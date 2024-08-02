import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  activateLink(event: Event): void {
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => link.classList.remove('active-link'));
    const target = event.currentTarget as HTMLElement;
    target.classList.add('active-link');
  }

  investmentSummary: any[] = []; 
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['Acc_Name', 'Total_Investment'];

  constructor(private http: HttpClient) {
    this.dataSource = new MatTableDataSource(this.investmentSummary);
  }

  ngOnInit(): void {
    this.fetchInvestmentSummary();
  }

  fetchInvestmentSummary(): void {
    this.http.get<any>('http://localhost:3000/api/dashboard').subscribe(
      response => {
        if (response.success) {
          this.investmentSummary = response.investmentSummary;
          this.dataSource.data = this.investmentSummary; // Update dataSource
        } else {
          alert('Failed to fetch investment summary');
        }
      },
      error => {
        alert('An error occurred while fetching investment summary');
      }
    );
  }
}
