import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddStocksPageComponent } from './add-stocks-page/add-stocks-page.component';

const routes: Routes = [
  {
    path:'add-stocks',
    component:AddStocksPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddStocksRoutingModule { }
