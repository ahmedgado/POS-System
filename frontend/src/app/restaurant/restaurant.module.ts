import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

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
        RouterModule,
        DragDropModule
    ],
    exports: [
        FloorsComponent,
        TablesComponent
    ]
})
export class RestaurantModule { }
