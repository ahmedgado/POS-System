import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableService, Table } from '../../services/table.service';
import { FloorService, Floor } from '../../services/floor.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  tables: Table[] = [];
  floors: Floor[] = [];
  loading = false;
  showModal = false;
  editingTable: Table | null = null;
  selectedFloorId: string | null = null;

  tableForm: {
    floorId: string;
    tableNumber: string;
    capacity: number;
    shape: 'SQUARE' | 'ROUND' | 'RECTANGLE';
    positionX: number;
    positionY: number;
  } = {
    floorId: '',
    tableNumber: '',
    capacity: 4,
    shape: 'SQUARE',
    positionX: 0,
    positionY: 0
  };

  shapes: ('SQUARE' | 'ROUND' | 'RECTANGLE')[] = ['SQUARE', 'ROUND', 'RECTANGLE'];
  statuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'];

  constructor(
    private tableService: TableService,
    private floorService: FloorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedFloorId = params['floorId'] || null;
      this.tableForm.floorId = this.selectedFloorId || '';
    });

    this.loadFloors();
    this.loadTables();
  }

  loadFloors(): void {
    this.floorService.getFloors().subscribe({
      next: (response) => {
        this.floors = response.data || [];
      },
      error: (error) => {
        console.error('Error loading floors:', error);
      }
    });
  }

  loadTables(): void {
    this.loading = true;
    this.tableService.getTables().subscribe({
      next: (response) => {
        let allTables = response.data || [];

        // Filter by floor if selected
        if (this.selectedFloorId) {
          allTables = allTables.filter((t: Table) => t.floorId === this.selectedFloorId);
        }

        this.tables = allTables;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tables:', error);
        this.loading = false;
        alert('Failed to load tables');
      }
    });
  }

  openCreateModal(): void {
    this.editingTable = null;
    this.tableForm = {
      floorId: this.selectedFloorId || (this.floors[0]?.id || ''),
      tableNumber: `T${this.tables.length + 1}`,
      capacity: 4,
      shape: 'SQUARE',
      positionX: 0,
      positionY: 0
    };
    this.showModal = true;
  }

  openEditModal(table: Table): void {
    this.editingTable = table;
    this.tableForm = {
      floorId: table.floorId,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      shape: table.shape || 'SQUARE',
      positionX: table.positionX || 0,
      positionY: table.positionY || 0
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTable = null;
  }

  saveTable(): void {
    if (!this.tableForm.floorId || !this.tableForm.tableNumber.trim()) {
      alert('Floor and table number are required');
      return;
    }

    if (this.tableForm.capacity < 1) {
      alert('Capacity must be at least 1');
      return;
    }

    this.loading = true;

    if (this.editingTable) {
      // Update existing table
      this.tableService.updateTable(this.editingTable.id, this.tableForm).subscribe({
        next: () => {
          this.loading = false;
          this.closeModal();
          this.loadTables();
          alert('Table updated successfully');
        },
        error: (error) => {
          console.error('Error updating table:', error);
          this.loading = false;
          alert('Failed to update table');
        }
      });
    } else {
      // Create new table
      this.tableService.createTable(this.tableForm).subscribe({
        next: () => {
          this.loading = false;
          this.closeModal();
          this.loadTables();
          alert('Table created successfully');
        },
        error: (error) => {
          console.error('Error creating table:', error);
          this.loading = false;
          alert('Failed to create table');
        }
      });
    }
  }

  updateTableStatus(table: Table, newStatus: string): void {
    this.tableService.updateTableStatus(table.id, newStatus).subscribe({
      next: () => {
        table.status = newStatus as any;
        alert('Table status updated');
      },
      error: (error) => {
        console.error('Error updating table status:', error);
        alert('Failed to update table status');
      }
    });
  }

  deleteTable(table: Table): void {
    if (!confirm(`Are you sure you want to delete table "${table.tableNumber}"?`)) {
      return;
    }

    this.loading = true;
    this.tableService.deleteTable(table.id).subscribe({
      next: () => {
        this.loading = false;
        this.loadTables();
        alert('Table deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting table:', error);
        this.loading = false;
        alert('Failed to delete table');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      'AVAILABLE': 'badge-success',
      'OCCUPIED': 'badge-danger',
      'RESERVED': 'badge-warning',
      'CLEANING': 'badge-info'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      'AVAILABLE': 'fa-check-circle',
      'OCCUPIED': 'fa-users',
      'RESERVED': 'fa-clock',
      'CLEANING': 'fa-broom'
    };
    return icons[status] || 'fa-circle';
  }

  filterByFloor(floorId: string): void {
    this.selectedFloorId = floorId || null;
    this.loadTables();
  }

  getFilteredTablesByFloor(): { [key: string]: Table[] } {
    const grouped: { [key: string]: Table[] } = {};

    this.tables.forEach(table => {
      const floorName = table.floor?.name || 'Unknown Floor';
      if (!grouped[floorName]) {
        grouped[floorName] = [];
      }
      grouped[floorName].push(table);
    });

    return grouped;
  }

  getSelectedFloorName(): string {
    if (!this.selectedFloorId) return '';
    const floor = this.floors.find(f => f.id === this.selectedFloorId);
    return floor?.name || '';
  }
}
