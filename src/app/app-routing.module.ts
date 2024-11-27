import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { LoadComponent } from './load/load.component';

const routes: Routes = [
  {
    path:"login",
    loadChildren:()=>import('./login/login.module').then(mod=>mod.LoginModule)
  },
  {
    path:"signup",
    loadChildren:()=>import('./signup/signup.module').then(mod=>mod.SignupModule)
  },
  {
    path:"dashboard",
    loadChildren:()=>import('./dashboard/dashboard.module').then(mod=>mod.DashboardModule)
  },
  {
    path:"add",
    loadChildren:()=>import('./add-stocks/add-stocks.module').then(mod=>mod.AddStocksModule)
  },
  {
    path:"view",
    loadChildren:()=>import('./stocks/stocks.module').then(mod=>mod.StocksModule)
  },
  {
    path:"home",
    loadChildren:()=>import('./home/home.module').then(mod=>mod.HomeModule)
  },
  {
    path:"settings",
    loadChildren:()=>import('./settings/settings.module').then(mod=>mod.SettingsModule)
  },
  {
    path:"set",
    loadChildren:()=>import('./stockcheck/stockcheck.module').then(mod=>mod.StockcheckModule)
  },
  {
    path:"index",
    component:IndexComponent
  },
  {
    path:"load",
    component:LoadComponent
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
