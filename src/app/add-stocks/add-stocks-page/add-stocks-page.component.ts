import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition,keyframes } from '@angular/animations';


@Component({
  selector: 'app-add-stocks-page',
  templateUrl: './add-stocks-page.component.html',
  styleUrls: ['./add-stocks-page.component.scss'],
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
export class AddStocksPageComponent implements OnInit {
  addstocks: FormGroup;
  accountNames: string[] = [];
  stockNames: string[] = [];
  isSelectMode: boolean = true;
  username: string = '';

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
    this.username = localStorage.getItem('username') || 'Guest';
    this.fetchAccountNames();
    this.getStockNames();
    this.addstocks.get('accountType')!.valueChanges.subscribe(value => {
      this.isSelectMode = value;
      this.updateAccountNameValidator();
    });
  }
  

  getStockNames(): void {
    this.http.get<{ success: boolean; stockNames: string[] }>('http://localhost:3000/api/indianstocks')
      .subscribe(response => {
        if (response.success) {
          this.stockNames = response.stockNames; // Ensure stockNames is an array
        }
      }, error => {
        console.error('Error fetching stock names', error);
      });
}

  fetchAccountNames(): void {
    this.http.get<any>(`http://localhost:3000/api/accountnames?username=${this.username}`).subscribe(
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

      this.http.post<any>(`http://localhost:3000/api/addstocks?username=${this.username}`, payload).subscribe(
        response => {
          if (response.success) {
            alert('Stock added successfully!');
            this.router.navigate(['/stocks']); 
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
