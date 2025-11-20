import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BackendConfig {
  url: string;
  type: 'local' | 'cloud';
  isAvailable: boolean;
  lastChecked?: Date;
}

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  // Development Mode: Set to true for local development (disables auto-detection)
  private readonly DEV_MODE = true; // Set to false for production hybrid setup

  private localBackendUrl = 'http://localhost:3000'; // Default local server IP
  private cloudBackendUrl = 'https://your-cloud-domain.com'; // Your cloud domain

  private currentBackendSubject = new BehaviorSubject<BackendConfig>({
    url: this.localBackendUrl,
    type: 'local',
    isAvailable: true // Start as available in dev mode
  });

  public currentBackend$ = this.currentBackendSubject.asObservable();

  private backends: BackendConfig[] = [
    { url: this.localBackendUrl, type: 'local', isAvailable: false },
    { url: this.cloudBackendUrl, type: 'cloud', isAvailable: false }
  ];

  constructor() {
    if (this.DEV_MODE) {
      // Development mode: Just use localhost, no detection
      console.log('🔧 DEV MODE: Using localhost:3000 (no auto-detection)');
      this.currentBackendSubject.next({
        url: this.localBackendUrl,
        type: 'local',
        isAvailable: true
      });
      this.backends[0].isAvailable = true;
    } else {
      // Production mode: Full auto-detection
      this.initializeBackendDetection();
    }
  }

  private async initializeBackendDetection(): Promise<void> {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('backendConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.localBackendUrl) this.localBackendUrl = config.localBackendUrl;
        if (config.cloudBackendUrl) this.cloudBackendUrl = config.cloudBackendUrl;

        this.backends = [
          { url: this.localBackendUrl, type: 'local', isAvailable: false },
          { url: this.cloudBackendUrl, type: 'cloud', isAvailable: false }
        ];
      } catch (e) {
        console.error('Failed to load backend config:', e);
      }
    }

    // Try to detect and connect to available backend
    await this.detectAvailableBackend();

    // Check backend availability every 15 seconds
    setInterval(() => {
      this.detectAvailableBackend();
    }, 15000);
  }

  private async detectAvailableBackend(): Promise<void> {
    // Priority: Local first, then Cloud
    for (const backend of this.backends) {
      const isAvailable = await this.checkBackendAvailability(backend.url);
      backend.isAvailable = isAvailable;
      backend.lastChecked = new Date();

      if (isAvailable) {
        // Found available backend - use it
        const currentBackend = this.currentBackendSubject.value;

        // Only switch if current backend is not available or if local becomes available
        if (!currentBackend.isAvailable || (backend.type === 'local' && currentBackend.type === 'cloud')) {
          console.log(`🔄 Switching to ${backend.type} backend: ${backend.url}`);
          this.currentBackendSubject.next({
            url: backend.url,
            type: backend.type,
            isAvailable: true,
            lastChecked: new Date()
          });

          this.showNotification(
            `Connected to ${backend.type === 'local' ? 'Local' : 'Cloud'} Server`,
            `Backend: ${backend.url}`
          );
        }

        // If local is available, use it (even if cloud is also available)
        if (backend.type === 'local') {
          break;
        }
      }
    }

    // If no backend is available
    const hasAvailableBackend = this.backends.some(b => b.isAvailable);
    if (!hasAvailableBackend) {
      const currentBackend = this.currentBackendSubject.value;
      if (currentBackend.isAvailable) {
        console.error('❌ All backends are unavailable!');
        this.currentBackendSubject.next({
          ...currentBackend,
          isAvailable: false
        });

        this.showNotification(
          '⚠️ Server Connection Lost',
          'Unable to connect to local or cloud server'
        );
      }
    }
  }

  private async checkBackendAvailability(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${url}/api/health`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  getCurrentBackend(): BackendConfig {
    return this.currentBackendSubject.value;
  }

  getApiUrl(): string {
    return this.currentBackendSubject.value.url;
  }

  isUsingLocalBackend(): boolean {
    return this.currentBackendSubject.value.type === 'local';
  }

  isUsingCloudBackend(): boolean {
    return this.currentBackendSubject.value.type === 'cloud';
  }

  getBackendStatus(): BackendConfig[] {
    return [...this.backends];
  }

  // Manual configuration
  setLocalBackendUrl(url: string): void {
    this.localBackendUrl = url;
    this.backends[0].url = url;
    this.saveConfiguration();
    this.detectAvailableBackend();
  }

  setCloudBackendUrl(url: string): void {
    this.cloudBackendUrl = url;
    this.backends[1].url = url;
    this.saveConfiguration();
    this.detectAvailableBackend();
  }

  private saveConfiguration(): void {
    const config = {
      localBackendUrl: this.localBackendUrl,
      cloudBackendUrl: this.cloudBackendUrl
    };
    localStorage.setItem('backendConfig', JSON.stringify(config));
  }

  // Force switch to specific backend
  async switchToBackend(type: 'local' | 'cloud'): Promise<boolean> {
    const backend = this.backends.find(b => b.type === type);
    if (!backend) return false;

    const isAvailable = await this.checkBackendAvailability(backend.url);
    if (isAvailable) {
      this.currentBackendSubject.next({
        url: backend.url,
        type: backend.type,
        isAvailable: true,
        lastChecked: new Date()
      });
      console.log(`✅ Manually switched to ${type} backend`);
      return true;
    } else {
      console.error(`❌ ${type} backend is not available`);
      return false;
    }
  }

  private showNotification(title: string, message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/favicon.ico' });
    }
    console.log(`${title}: ${message}`);
  }
}
