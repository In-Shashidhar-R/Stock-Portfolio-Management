import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-stocks-page',
  templateUrl: './add-stocks-page.component.html',
  styleUrls: ['./add-stocks-page.component.scss']
})
export class AddStocksPageComponent implements OnInit {
  addstocks: FormGroup;
  accountNames: string[] = [];
  isSelectMode: boolean = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.addstocks = this.fb.group({
      Stocks_Name: ['', Validators.required],
      Quantity: ['', Validators.required],
      Price: ['', Validators.required],
      Charges: ['', Validators.required],
      accountType: [true, Validators.required],
      Account_Name: ['', Validators.required],
      Purchase_Date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchAccountNames();
    this.addstocks.get('accountType')!.valueChanges.subscribe(value => {
      this.isSelectMode = value;
      this.updateAccountNameValidator();
    });
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

  updateAccountNameValidator(): void {
    this.addstocks.get('Account_Name')!.setValidators([Validators.required]);
    this.addstocks.get('Account_Name')!.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.addstocks.valid) {
      const formValue = this.addstocks.value;
      const quantity = parseFloat(formValue.Quantity);
      const price = parseFloat(formValue.Price);
      const charges = parseFloat(formValue.Charges);
      
      const amountInvested = (quantity * price) + charges;
      const payload = {
        ...formValue,
        Amount_invested: amountInvested
      };

      this.http.post<any>('http://localhost:3000/api/addstocks', payload).subscribe(
        response => {
          if (response.success) {
            alert('Stock added successfully!');
          } else {
            alert(response.message);
          }
        },
        error => {
          alert('An error occurred. Please try again.');
        }
      );
    }
  }
}
