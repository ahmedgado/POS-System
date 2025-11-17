import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { FloorsComponent } from './floors/floors.component';
import { TablesComponent } from './tables/tables.component';

@NgModule({
  declarations: [
    FloorsComponent,
    TablesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    FloorsComponent,
    TablesComponent
  ]
})
export class RestaurantModule { }
