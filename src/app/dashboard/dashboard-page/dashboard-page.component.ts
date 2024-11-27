import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { HttpParams } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
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
export class DashboardPageComponent implements OnInit {
  
  username: string = '';
  investmentSummary: any[] = []; // Original investment data
  filteredInvestmentSummary: any[] = []; // Filtered investment data
  accountNames: string[] = []; 
  selectedAccounts: string[] = []; 
  fromDate: Date | null = null; 
  toDate: Date | null = null; 

  dataSource: MatTableDataSource<any>; // Data source for Account Investment Summary table
  filteredDataSource: MatTableDataSource<any>; // Data source for the filtered table
  displayedColumns: string[] = ['Acc_Name', 'Amount_Invested', 'Realized_Profit'];
  filteredDisplayedColumns: string[] = ['Acc_name', 'stock_name', 'date_purch', 'Quantity', 'profit_made'];
  totalProfit: number = 0;

  constructor(private http: HttpClient) {
    this.dataSource = new MatTableDataSource(this.investmentSummary);
    this.filteredDataSource = new MatTableDataSource(this.filteredInvestmentSummary);
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Guest';
    this.fetchInvestmentSummary();
    this.fetchAccountNames();
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

  fetchAccountNames(): void {
    this.http.get<any>(`http://localhost:3000/api/accountNames?username=${this.username}`).subscribe(
      response => {
        if (response.success) {
          this.accountNames = response.accountNames; // Set account names
        } else {
          alert('Failed to fetch account names');
        }
      },
      error => {
        alert('An error occurred while fetching account names');
      }
    );
  }

  filterData(): void {
    const selectedAccountsStr = this.selectedAccounts.join(','); 
    const fromDateStr = this.fromDate ? this.fromDate.toISOString() : ''; 
    const toDateStr = this.toDate ? this.toDate.toISOString() : ''; 

    const params = new HttpParams()
        .set('username', this.username)
        .set('accounts', selectedAccountsStr)
        .set('fromDate', fromDateStr)
        .set('toDate', toDateStr);

    this.http.get<any>(`http://localhost:3000/api/filteredInvestments`, { params }).subscribe(
        response => {
            if (response && response.success) {
                this.filteredInvestmentSummary = response.investmentSummary;
                this.filteredDataSource.data = this.filteredInvestmentSummary;
                this.calculateTotalProfit();
            } else {
                alert('Failed to fetch filtered investment summary');
            }
        },
        error => {
            alert('An error occurred while fetching filtered investment summary');
        }
    );
  }

  calculateTotalProfit(): void {
    this.totalProfit = this.filteredInvestmentSummary.reduce((sum, item) => {
      const profit = Number(item.profit_made); 
      return sum + (isNaN(profit) ? 0 : profit); 
    }, 0);
  
    console.log("Total Profit:", this.totalProfit);
  }
  
}

