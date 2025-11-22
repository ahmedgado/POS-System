import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import interact from 'interactjs';
import { TableService, Table } from '../../services/table.service';
import { FloorService, Floor } from '../../services/floor.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit, AfterViewInit {
  tables: Table[] = [];
  floors: Floor[] = [];
  loading = false;
  showModal = false;
  editingTable: Table | null = null;
  selectedFloorId: string | null = null;
  showStatusMenu: string | null = null;

  tableForm: {
    floorId: string;
    tableNumber: string;
    capacity: number;
    shape: 'SQUARE' | 'ROUND' | 'RECTANGLE';
  } = {
      floorId: '',
      tableNumber: '',
      capacity: 4,
      shape: 'SQUARE',
    };

  shapes: ('SQUARE' | 'ROUND' | 'RECTANGLE')[] = ['SQUARE', 'ROUND', 'RECTANGLE'];
  statuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'];

  constructor(
    private tableService: TableService,
    private floorService: FloorService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedFloorId = params['floorId'] || null;
      this.tableForm.floorId = this.selectedFloorId || '';
    });

    this.loadFloors();
    this.loadTables();
  }

  ngAfterViewInit(): void {
    // Initialize interact.js after view is ready
    setTimeout(() => this.initializeDragAndDrop(), 500);
  }

  initializeDragAndDrop(): void {
    // Make all table elements draggable
    interact('.draggable-table')
      .draggable({
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
          })
        ],
        autoScroll: true,
        listeners: {
          move: this.dragMoveListener.bind(this),
          end: this.dragEndListener.bind(this)
        }
      });
  }

  dragMoveListener(event: any): void {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  dragEndListener(event: any): void {
    const target = event.target;
    const tableId = target.getAttribute('data-table-id');
    const x = parseFloat(target.getAttribute('data-x')) || 0;
    const y = parseFloat(target.getAttribute('data-y')) || 0;

    // Update table position in the array
    const table = this.tables.find(t => t.id === tableId);
    if (table) {
      table.positionX = (table.positionX || 0) + x;
      table.positionY = (table.positionY || 0) + y;

      // Reset transform and data attributes
      target.style.transform = '';
      target.setAttribute('data-x', '0');
      target.setAttribute('data-y', '0');

      console.log(`Table ${table.tableNumber} moved to:`, { x: table.positionX, y: table.positionY });
    }
  }

  loadFloors(): void {
    this.floorService.getFloors().subscribe({
      next: (response) => {
        this.floors = response.data || [];
      },
      error: (error) => console.error('Error loading floors:', error)
    });
  }

  loadTables(): void {
    this.loading = true;
    this.tableService.getTables().subscribe({
      next: (response) => {
        this.tables = response.data || [];
        if (this.selectedFloorId) {
          this.tables = this.tables.filter(t => t.floorId === this.selectedFloorId);
        }
        this.loading = false;

        // Reinitialize drag and drop after tables are loaded
        setTimeout(() => this.initializeDragAndDrop(), 100);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading tables:', error);
      }
    });
  }

  saveLayout(): void {
    this.loading = true;
    const updates = this.tables.map(t => ({
      id: t.id,
      positionX: Math.round(t.positionX || 0),
      positionY: Math.round(t.positionY || 0)
    }));

    this.tableService.updateLayout(updates).subscribe({
      next: () => {
        this.loading = false;
        alert('Layout saved successfully!');
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving layout:', error);
        alert('Failed to save layout.');
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
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveTable(): void {
    if (!this.tableForm.floorId || !this.tableForm.tableNumber.trim()) return;

    this.loading = true;
    const tableData = { ...this.tableForm };

    const operation = this.editingTable
      ? this.tableService.updateTable(this.editingTable.id, tableData)
      : this.tableService.createTable({ ...tableData, positionX: 100, positionY: 100 });

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.closeModal();
        this.loadTables();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error saving table:', err);
        alert('Failed to save table.');
      }
    });
  }

  openStatusMenu(table: Table): void {
    this.showStatusMenu = this.showStatusMenu === table.id ? null : table.id;
  }

  updateTableStatus(table: Table, newStatus: string): void {
    this.tableService.updateTableStatus(table.id, newStatus).subscribe({
      next: () => {
        table.status = newStatus as any;
        this.showStatusMenu = null;
      },
      error: (err) => console.error('Error updating status:', err)
    });
  }

  deleteTable(table: Table): void {
    if (confirm(`Delete table "${table.tableNumber}"?`)) {
      this.tableService.deleteTable(table.id).subscribe({
        next: () => this.loadTables(),
        error: (err) => console.error('Error deleting table:', err)
      });
    }
  }

  filterByFloor(floorId: string): void {
    this.selectedFloorId = floorId;
    this.loadTables();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'AVAILABLE': return '#28a745';
      case 'OCCUPIED': return '#dc3545';
      case 'RESERVED': return '#ffc107';
      case 'CLEANING': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'fa-check-circle';
      case 'OCCUPIED': return 'fa-users';
      case 'RESERVED': return 'fa-calendar-check';
      case 'CLEANING': return 'fa-broom';
      default: return 'fa-question-circle';
    }
  }
}
