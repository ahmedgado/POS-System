import { Component, OnInit } from '@angular/core';
import { FloorService, Floor } from '../../services/floor.service';

@Component({
  selector: 'app-floors',
  templateUrl: './floors.component.html',
  styleUrls: ['./floors.component.css']
})
export class FloorsComponent implements OnInit {
  floors: Floor[] = [];
  loading = false;
  showModal = false;
  editingFloor: Floor | null = null;

  floorForm = {
    name: '',
    description: '',
    sortOrder: 0
  };

  constructor(private floorService: FloorService) {}

  ngOnInit(): void {
    this.loadFloors();
  }

  loadFloors(): void {
    this.loading = true;
    this.floorService.getFloors().subscribe({
      next: (response) => {
        this.floors = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading floors:', error);
        this.loading = false;
        alert('Failed to load floors');
      }
    });
  }

  openCreateModal(): void {
    this.editingFloor = null;
    this.floorForm = {
      name: '',
      description: '',
      sortOrder: this.floors.length + 1
    };
    this.showModal = true;
  }

  openEditModal(floor: Floor): void {
    this.editingFloor = floor;
    this.floorForm = {
      name: floor.name,
      description: floor.description || '',
      sortOrder: floor.sortOrder
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingFloor = null;
  }

  saveFloor(): void {
    if (!this.floorForm.name.trim()) {
      alert('Floor name is required');
      return;
    }

    this.loading = true;

    if (this.editingFloor) {
      // Update existing floor
      this.floorService.updateFloor(this.editingFloor.id, this.floorForm).subscribe({
        next: () => {
          this.loading = false;
          this.closeModal();
          this.loadFloors();
          alert('Floor updated successfully');
        },
        error: (error) => {
          console.error('Error updating floor:', error);
          this.loading = false;
          alert('Failed to update floor');
        }
      });
    } else {
      // Create new floor
      this.floorService.createFloor(this.floorForm).subscribe({
        next: () => {
          this.loading = false;
          this.closeModal();
          this.loadFloors();
          alert('Floor created successfully');
        },
        error: (error) => {
          console.error('Error creating floor:', error);
          this.loading = false;
          alert('Failed to create floor');
        }
      });
    }
  }

  deleteFloor(floor: Floor): void {
    if (!confirm(`Are you sure you want to delete floor "${floor.name}"?`)) {
      return;
    }

    this.loading = true;
    this.floorService.deleteFloor(floor.id).subscribe({
      next: () => {
        this.loading = false;
        this.loadFloors();
        alert('Floor deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting floor:', error);
        this.loading = false;
        alert('Failed to delete floor');
      }
    });
  }

  getTableCount(floor: Floor): number {
    return floor.tables?.filter(t => t.isActive).length || 0;
  }

  getAvailableTableCount(floor: Floor): number {
    return floor.tables?.filter(t => t.isActive && t.status === 'AVAILABLE').length || 0;
  }
}
