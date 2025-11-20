import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnvironmentService, BackendConfig } from '../services/environment.service';

@Component({
  selector: 'app-backend-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="position:fixed;top:70px;right:20px;z-index:1000;">
      <!-- Compact Status Badge -->
      <div (click)="toggleDetails()"
        [style.background]="getStatusColor()"
        style="padding:8px 16px;border-radius:20px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,0.2);display:flex;align-items:center;gap:8px;transition:all 0.3s;">
        <span style="font-size:10px;">{{ getStatusIcon() }}</span>
        <span style="color:#fff;font-size:12px;font-weight:600;">
          {{ currentBackend?.type === 'local' ? 'LOCAL' : 'CLOUD' }}
        </span>
      </div>

      <!-- Detailed Panel (when clicked) -->
      <div *ngIf="showDetails"
        style="position:absolute;top:50px;right:0;background:linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);border-radius:12px;padding:16px;min-width:300px;box-shadow:0 4px 20px rgba(0,0,0,0.4);border:1px solid rgba(212,175,55,0.2);">

        <h3 style="color:#d4af37;margin:0 0 12px 0;font-size:14px;font-weight:700;letter-spacing:1px;">SERVER STATUS</h3>

        <!-- Current Backend -->
        <div style="background:#0a0a0a;padding:12px;border-radius:8px;margin-bottom:12px;border-left:3px solid #d4af37;">
          <div style="color:#d4af37;font-size:11px;font-weight:600;margin-bottom:4px;">ACTIVE CONNECTION</div>
          <div style="color:#fff;font-size:13px;font-weight:600;">
            {{ currentBackend?.type === 'local' ? '🏠 Local Server' : '☁️ Cloud Server' }}
          </div>
          <div style="color:#999;font-size:11px;margin-top:4px;font-family:monospace;">
            {{ currentBackend?.url }}
          </div>
          <div style="color:#999;font-size:10px;margin-top:4px;">
            Last checked: {{ getLastChecked(currentBackend?.lastChecked) }}
          </div>
        </div>

        <!-- All Backends Status -->
        <div style="margin-bottom:12px;">
          <div *ngFor="let backend of backends"
            style="display:flex;align-items:center;justify-content:space-between;padding:8px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:6px;">
            <div>
              <div style="color:#fff;font-size:12px;font-weight:600;">
                {{ backend.type === 'local' ? '🏠 Local' : '☁️ Cloud' }}
              </div>
              <div style="color:#666;font-size:10px;font-family:monospace;">
                {{ backend.url }}
              </div>
            </div>
            <div [style.color]="backend.isAvailable ? '#28a745' : '#dc3545'" style="font-size:20px;">
              {{ backend.isAvailable ? '●' : '○' }}
            </div>
          </div>
        </div>

        <!-- Manual Switch Buttons -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          <button (click)="switchToLocal()" [disabled]="!isLocalAvailable()"
            style="padding:8px;background:#28a745;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;"
            [style.opacity]="!isLocalAvailable() ? '0.4' : '1'">
            Use Local
          </button>
          <button (click)="switchToCloud()" [disabled]="!isCloudAvailable()"
            style="padding:8px;background:#007bff;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;"
            [style.opacity]="!isCloudAvailable() ? '0.4' : '1'">
            Use Cloud
          </button>
        </div>

        <!-- Configuration Link -->
        <div style="text-align:center;padding-top:12px;border-top:1px solid rgba(212,175,55,0.1);">
          <button (click)="openSettings()"
            style="background:transparent;color:#d4af37;border:1px solid #d4af37;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">
            ⚙️ Configure Servers
          </button>
        </div>
      </div>

      <!-- Settings Modal -->
      <div *ngIf="showSettings"
        style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:2000;"
        (click)="closeSettings()">
        <div (click)="$event.stopPropagation()"
          style="background:linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);border-radius:12px;padding:24px;max-width:500px;width:90%;border:1px solid rgba(212,175,55,0.2);">

          <h2 style="color:#d4af37;margin:0 0 20px 0;font-size:18px;font-weight:700;letter-spacing:1px;">SERVER CONFIGURATION</h2>

          <!-- Local Server URL -->
          <div style="margin-bottom:16px;">
            <label style="display:block;color:#d4af37;font-size:12px;font-weight:600;margin-bottom:6px;">LOCAL SERVER URL</label>
            <input [(ngModel)]="localUrl" type="text"
              placeholder="http://192.168.1.100:3000"
              style="width:100%;padding:10px;background:#0a0a0a;border:2px solid #3a3a3a;border-radius:8px;color:#fff;font-family:monospace;font-size:13px;">
            <div style="color:#666;font-size:10px;margin-top:4px;">
              Example: http://192.168.1.100:3000 or http://localhost:3000
            </div>
          </div>

          <!-- Cloud Server URL -->
          <div style="margin-bottom:20px;">
            <label style="display:block;color:#d4af37;font-size:12px;font-weight:600;margin-bottom:6px;">CLOUD SERVER URL</label>
            <input [(ngModel)]="cloudUrl" type="text"
              placeholder="https://your-domain.com"
              style="width:100%;padding:10px;background:#0a0a0a;border:2px solid #3a3a3a;border-radius:8px;color:#fff;font-family:monospace;font-size:13px;">
            <div style="color:#666;font-size:10px;margin-top:4px;">
              Example: https://pos.stregiscairo.com
            </div>
          </div>

          <!-- Save Button -->
          <div style="display:flex;gap:8px;">
            <button (click)="saveSettings()"
              style="flex:1;padding:12px;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#0a0a0a;border:none;border-radius:8px;font-weight:700;cursor:pointer;">
              💾 Save Configuration
            </button>
            <button (click)="closeSettings()"
              style="padding:12px 20px;background:#dc3545;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    button:not(:disabled):hover {
      opacity: 0.8;
      transform: translateY(-1px);
      transition: all 0.2s;
    }
    button:disabled {
      cursor: not-allowed;
    }
    input:focus {
      outline: none;
      border-color: #d4af37;
    }
  `]
})
export class BackendStatusComponent implements OnInit {
  currentBackend: BackendConfig | null = null;
  backends: BackendConfig[] = [];
  showDetails = false;
  showSettings = false;

  localUrl = '';
  cloudUrl = '';

  constructor(private envService: EnvironmentService) {}

  ngOnInit(): void {
    this.envService.currentBackend$.subscribe(backend => {
      this.currentBackend = backend;
    });

    // Update backend list periodically
    setInterval(() => {
      this.backends = this.envService.getBackendStatus();
    }, 1000);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  getStatusColor(): string {
    if (!this.currentBackend?.isAvailable) return '#dc3545'; // Red - offline
    if (this.currentBackend.type === 'local') return '#28a745'; // Green - local
    return '#007bff'; // Blue - cloud
  }

  getStatusIcon(): string {
    if (!this.currentBackend?.isAvailable) return '⚠️';
    if (this.currentBackend.type === 'local') return '🏠';
    return '☁️';
  }

  getLastChecked(date?: Date): string {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  }

  isLocalAvailable(): boolean {
    return this.backends.find(b => b.type === 'local')?.isAvailable || false;
  }

  isCloudAvailable(): boolean {
    return this.backends.find(b => b.type === 'cloud')?.isAvailable || false;
  }

  switchToLocal(): void {
    this.envService.switchToBackend('local');
  }

  switchToCloud(): void {
    this.envService.switchToBackend('cloud');
  }

  openSettings(): void {
    const status = this.envService.getBackendStatus();
    this.localUrl = status.find(b => b.type === 'local')?.url || '';
    this.cloudUrl = status.find(b => b.type === 'cloud')?.url || '';
    this.showSettings = true;
    this.showDetails = false;
  }

  closeSettings(): void {
    this.showSettings = false;
  }

  saveSettings(): void {
    if (this.localUrl) {
      this.envService.setLocalBackendUrl(this.localUrl);
    }
    if (this.cloudUrl) {
      this.envService.setCloudBackendUrl(this.cloudUrl);
    }
    this.showSettings = false;
    alert('✅ Configuration saved! Detecting servers...');
  }
}
