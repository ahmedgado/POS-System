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
import { FloorsComponent } from './restaurant/floors/floors.component';
import { TablesComponent } from './restaurant/tables/tables.component';
import { ModifiersComponent } from './modifiers/modifiers.component';
import { ProductModifiersComponent } from './modifiers/product-modifiers.component';
import { KdsComponent } from './kds/kds.component';
import { ProductStationsComponent } from './restaurant/product-stations.component';
import { RestaurantModule } from './restaurant/restaurant.module';
import { IngredientsComponent } from './ingredients/ingredients.component';
import { RecipesComponent } from './recipes/recipes.component';

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
      { path: 'settings', component: SettingsComponent },
      { path: 'restaurant/floors', component: FloorsComponent },
      { path: 'restaurant/tables', component: TablesComponent },
      { path: 'restaurant/modifiers', component: ModifiersComponent },
      { path: 'restaurant/product-modifiers', component: ProductModifiersComponent },
      { path: 'restaurant/product-stations', component: ProductStationsComponent },
      { path: 'kds', component: KdsComponent },
      { path: 'ingredients', component: IngredientsComponent },
      { path: 'recipes', component: RecipesComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
