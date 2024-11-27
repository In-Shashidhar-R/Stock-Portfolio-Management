import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-stock-sale-dialog',
  templateUrl: './stock-sale-dialog.component.html'
})
export class StockSaleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StockSaleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sellingPrice: number, quantity: number }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(this.data);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
