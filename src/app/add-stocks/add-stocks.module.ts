import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddStocksRoutingModule } from './add-stocks-routing.module';
import { AddStocksPageComponent } from './add-stocks-page/add-stocks-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    AddStocksPageComponent
  ],
  imports: [
    CommonModule,
    AddStocksRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatAutocompleteModule
  ]
})
export class AddStocksModule { }
