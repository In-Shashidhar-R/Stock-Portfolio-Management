import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StocksPageComponent } from './stocks-page/stocks-page.component';

const routes: Routes = [
  {
    path:'stockPage',
    component:StocksPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StocksRoutingModule { }
