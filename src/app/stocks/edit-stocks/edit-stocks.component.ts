import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-stocks',
  templateUrl: './edit-stocks.component.html',
  styleUrls: ['./edit-stocks.component.scss']
})
export class EditStocksComponent implements OnInit {
  updatedPrice: number = 0;
  updatedQuantity: number = 0;
  accountName: string = '';
  stockName: string = '';
  username: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EditStocksComponent>
  ) {}

  ngOnInit(): void {
    this.updatedQuantity = this.data.Quantity; // Set initial quantity from data
    this.updatedPrice = this.data.Price; // Set initial price from data
    this.accountName = this.data.Acc_Name; // Set initial account name from data
    this.stockName = this.data.stock_Name;
    this.username = this.data.username; // Set initial stock name from data
    
  }

  update(): void {
    const stock = { 
      ...this.data, 
      Price: this.updatedPrice, 
      quantity: this.updatedQuantity,
      Account_Name: this.accountName,
      Stock_Name: this.stockName,
      username: this.username
    };
    
    this.http.put<any>(`http://localhost:3000/api/editstock/${this.data.id}`, stock).subscribe(
      response => {
        if (response.success) {
          this.snackBar.open('Stock updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(stock); // Close dialog with updated stock data
        } else {
          this.snackBar.open('Failed to update stock', 'Close', { duration: 3000 });
        }
      },
      () => this.snackBar.open('An error occurred while updating the stock', 'Close', { duration: 3000 })
    );
  }

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without saving
  }
}
