import { Component, OnInit,ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-stocks-page',
  templateUrl: './stocks-page.component.html',
  styleUrls: ['./stocks-page.component.scss']
})
export class StocksPageComponent implements OnInit {
  stockData: any;
  filterForm: FormGroup;
  stockNames: string[] = [];
  accountNames: string[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['Account_Name', 'Stock_Name', 'Quantity', 'Price', 'Current_Price', 'Amount_invested', 'Current_Value', 'Profit_or_Loss', 'Delete'];
  totalStocks: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      Stock_Name: [''],
      Account_Name: ['']
    });
  }

  ngOnInit(): void {
    this.fetchStockNames();
    this.fetchAccountNames();
    this.fetchStocks();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  fetchStockNames(): void {
    this.http.get<any>('http://localhost:3000/api/stocknames').subscribe(
      response => {
        if (response.success) {
          this.stockNames = response.stockNames;
        } else {
          alert('Failed to fetch stock names');
        }
      },
      error => {
        alert('An error occurred while fetching stock names');
      }
    );
  }

  fetchAccountNames(): void {
    this.http.get<any>('http://localhost:3000/api/accountnames').subscribe(
      response => {
        if (response.success) {
          this.accountNames = response.accountNames;
        } else {
          alert('Failed to fetch account names');
        }
      },
      error => {
        alert('An error occurred while fetching account names');
      }
    );
  }

  fetchStocks(filter: any = {}): void {
    const params = {
      ...filter,
      pageSize: this.pageSize.toString(),
      pageIndex: this.pageIndex.toString()
    };
    this.http.get<any>('http://localhost:3000/api/stocks', { params }).subscribe(
      response => {
        if (response.success) {
          this.dataSource.data = response.stocks;
          this.totalStocks = response.totalStocks;
          this.updateCurrentValues(response.stocks);
        } else {
          alert('Failed to fetch stocks');
        }
      },
      error => {
        alert('An error occurred while fetching stocks');
      }
    );
  }

  updateCurrentValues(stocks: any[]): void {
    const stockNames = stocks.map(stock => stock.stock_Name).join(',');
    this.http.get<any>(`http://localhost:3000/api/current-prices?stockNames=${stockNames}`).subscribe(
        prices => {
            this.dataSource.data = this.dataSource.data.map(stock => {
                const currentPrice = prices[stock.stock_Name];
                const investedValue = stock.Price * stock.Quantity;
                const totalInvested = investedValue + (stock.charges || 0); // Assuming charges are available in response
                const currentValue = currentPrice ? parseFloat(currentPrice) * stock.Quantity : investedValue;
                const profitOrLoss = currentValue - totalInvested;

                return {
                    ...stock,
                    Current_Price: currentPrice || 'Not available',
                    Current_Value: currentValue,
                    Amount_invested: totalInvested.toFixed(2), // Format to 2 decimal places
                    Profit_or_Loss: profitOrLoss
                };
            });
        },
        error => {
            console.error('Failed to fetch current prices', error);
        }
    );
}

  onFilter(): void {
    if (this.filterForm.valid) {
      this.pageIndex = 0; // Reset to the first page on new filter
      this.fetchStocks(this.filterForm.value);
    }
  }

  onPaginateChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchStocks(this.filterForm.value);
  }

  deleteStock(stock: any): void {
    if (confirm('Are you sure you want to delete this stock?')) {
      this.http.delete<any>(`http://localhost:3000/api/deletestocks/${stock.id}`).subscribe(
        response => {
          if (response.success) {
            this.snackBar.open('Stock deleted successfully', 'Close', {
              duration: 3000,
            });
            this.fetchStocks(this.filterForm.value);
          } else {
            alert('Failed to delete stock');
          }
        },
        error => {
          alert('An error occurred while deleting the stock');
        }
      );
    }
  }
}