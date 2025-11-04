import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { ProductsComponent } from './products/products.component';
import { POSComponent } from './pos/pos.component';
import { SalesComponent } from './sales/sales.component';
import { CategoriesComponent } from './categories/categories.component';
import { CustomersComponent } from './customers/customers.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { UsersComponent } from './users/users.component';
import { ReportsComponent } from './reports/reports.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pos', component: POSComponent },
      { path: 'sales', component: SalesComponent },
      { path: 'shifts', component: ShiftsComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
