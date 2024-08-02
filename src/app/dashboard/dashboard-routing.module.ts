import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { AddStocksPageComponent } from '../add-stocks/add-stocks-page/add-stocks-page.component';

const routes: Routes = [
  {
    path:"User-Page",
    component:DashboardPageComponent
  },
  {
    path:"add-stocks",
    component:AddStocksPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
