import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StockSaleDialogComponent } from 'src/app/stock-sale-dialog/stock-sale-dialog.component';
import { trigger, state, style, animate, transition,keyframes } from '@angular/animations';
import { EditStocksComponent } from '../edit-stocks/edit-stocks.component';

@Component({
  selector: 'app-stocks-page',
  templateUrl: './stocks-page.component.html',
  styleUrls: ['./stocks-page.component.scss'],
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
    trigger('bounceDown', [
      state('void', style({ opacity: 0, transform: 'translateY(-100%)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        animate('0.5s ease-in-out', keyframes([
          style({ transform: 'translateY(-30%)', offset: 0.5 }),
          style({ transform: 'translateY(0)', offset: 1 })
        ]))
      ])
    ]),    
    trigger('fadeSlideUp', [
      state('void', style({ opacity: 0, transform: 'translateY(50%)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        animate('0.6s ease-out')
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
export class StocksPageComponent implements OnInit, AfterViewInit {
  stockData: any;
  filterForm: FormGroup;
  stockNames: string[] = [];
  accountNames: string[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['Account_Name', 'Stock_Name', 'Quantity', 'Price', 'Current_Price', 'Amount_invested', 'Current_Value', 'Profit_or_Loss', 'Actions'];
  totalStocks: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  username: string = '';
  totalProfitOrLoss: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public dialog: MatDialog,
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
    this.username = localStorage.getItem('username') || 'Guest';
    this.fetchStockNames();
    this.fetchAccountNames();
    this.fetchStocks();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  fetchStockNames(): void {
    this.http.get<any>(`http://localhost:3000/api/stocknames?username=${this.username}`).subscribe(
      response => {
        if (response.success) {
          this.stockNames = response.stockNames;
        } else {
          this.showError('Failed to fetch stock names');
        }
      },
      () => this.showError('An error occurred while fetching stock names')
    );
  }

  fetchAccountNames(): void {
    this.http.get<any>(`http://localhost:3000/api/accountnames?username=${this.username}`).subscribe(
      response => {
        if (response.success) {
          this.accountNames = response.accountNames;
        } else {
          this.showError('Failed to fetch account names');
        }
      },
      () => this.showError('An error occurred while fetching account names')
    );
  }

  fetchStocks(filter: any = {}): void {
    const params = {
      ...filter,
      username: this.username,
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
          this.showError('Failed to fetch stocks');
        }
      },
      () => this.showError('An error occurred while fetching stocks')
    );
  }

  updateCurrentValues(stocks: any[]): void {
    const stockNames = stocks.map(stock => stock.stock_Name).join(',');
    this.http.get<any>(`http://localhost:3000/api/current-prices?stockNames=${stockNames}`).subscribe(
      prices => {
        this.dataSource.data = this.dataSource.data.map(stock => {
          const currentPrice = prices[stock.stock_Name];
          const investedValue = stock.Price * stock.Quantity;
          const totalInvested = investedValue + (stock.charges || 0); // Assuming charges are available
          const currentValue = currentPrice ? parseFloat(currentPrice) * stock.Quantity : investedValue;
          const profitOrLoss = currentValue - totalInvested;

          return {
            ...stock,
            Current_Price: currentPrice || 'Not available',
            Current_Value: currentValue,
            Amount_invested: totalInvested.toFixed(2), // Format to 2 decimal places
            Profit_or_Loss: profitOrLoss.toFixed(2)
             // Format profit/loss to 2 decimal places
             
          };
        });
        this.calculateTotalProfitOrLoss();
      },
      () => console.error('Failed to fetch current prices')
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

  sellstock(stock: any): void {
    const dialogRef = this.dialog.open(StockSaleDialogComponent, {
      width: '300px',
      data: { sellingPrice: 0, quantity: stock.Quantity }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.sellingPrice && result.quantity) {
        this.handleStockSale(stock, result.sellingPrice, result.quantity);
      }
    });
  }

  editStock(stock: any): void {
    const username = localStorage.getItem('username');
    const dialogRef = this.dialog.open(EditStocksComponent, {
      width: '1400px',
      data: {
        ...stock,  // existing stock data
        username   // pass username along with stock data
      },
    });

    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchStocks(); 
      }
    });
  }

  handleStockSale(stock: any, sellingPrice: number, quantitySold: number): void {
    const sellingAmount = sellingPrice * quantitySold;
    const investedAmount = stock.Price * quantitySold;
    const profitOrLoss = sellingAmount - investedAmount;
    const balance = stock.Amount_invested - investedAmount;

    const remainingQuantity = stock.Quantity - quantitySold;
    const updatedStock = {
      ...stock,
      Quantity: remainingQuantity > 0 ? remainingQuantity : 0,
      Status: remainingQuantity === 0 ? 'Sold' : stock.Status
    };

    this.updateStockInDB(updatedStock, profitOrLoss, sellingPrice, investedAmount, balance);
  }

  updateStockInDB(stock: any, profitOrLoss: number, sellingPrice: number, investedAmount: number, balance: number): void {
    const username = localStorage.getItem('username'); // Ensure username is fetched from local storage

    this.http.put<any>(`http://localhost:3000/api/updatestock/${stock.id}?username=${username}`, { stock, profitOrLoss, sellingPrice, investedAmount, balance }).subscribe(
      response => {
        if (response.success) {
          this.snackBar.open('Stock updated successfully', 'Close', { duration: 3000 });
          this.fetchStocks(this.filterForm.value);
        } else {
          this.showError('Failed to update stock');
        }
      },
      () => this.showError('An error occurred while updating the stock')
    );
  }

  deleteStock(stock: any): void {
    if (confirm('Are you sure you want to delete this stock?')) {
      this.http.delete<any>(`http://localhost:3000/api/deletestocks/${stock.id}?username=${this.username}`).subscribe(
        response => {
          if (response.success) {
            this.snackBar.open('Stock deleted successfully', 'Close', { duration: 3000 });
            this.fetchStocks(this.filterForm.value);
          } else {
            this.showError('Failed to delete stock');
          }
        },
        () => this.showError('An error occurred while deleting the stock')
      );
    }
  }

  calculateTotalProfitOrLoss(): void {
    this.totalProfitOrLoss = this.dataSource.data.reduce((total, stock) => {
      return total + parseFloat(stock.Profit_or_Loss || 0);
    }, 0);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
