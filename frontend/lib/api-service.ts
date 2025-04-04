// API service module for backend communication

interface FatigueData {
  fatigue_score: number | null;
  fatigue_level: string | null;
  eye_metrics: {
    blink_rate: number | null;
    fixation_duration: number | null;
    saccade_speed: number | null;
  } | null;
  activity_summary: {
    mouse_activity: string | null;
    active_time: string | null;
    cognitive_load: string | null;
    blink_rate: string | null;
  } | null;
  trend_data: {
    date: string;
    fatigue: number;
    eyeStrain: number;
  }[] | null;
  recent_activity: {
    id: number;
    type: string;
    message: string;
    time: string;
    severity: string;
  }[] | null;
}

class ApiService {
  private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  private isBackendDown: boolean = false;
  private lastErrorTime: number = 0;
  private readonly ERROR_COOLDOWN: number = 10000; // 10 seconds between logged errors

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Don't try to contact the backend again if we know it's down 
    // and it's been less than 10 seconds since the last attempt
    const now = Date.now();
    if (this.isBackendDown && now - this.lastErrorTime < this.ERROR_COOLDOWN) {
      throw new Error('Backend server is currently unavailable');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      this.isBackendDown = false;
      return response.json();
    } catch (error) {
      // Update the error state and time
      this.isBackendDown = true;
      this.lastErrorTime = now;
      
      // Only log detailed error message once every ERROR_COOLDOWN period
      if (now - this.lastErrorTime > this.ERROR_COOLDOWN) {
        console.log('Backend server is currently unavailable');
      }
      
      throw new Error(`Backend server unavailable`);
    }
  }

  public async checkApiHealth(): Promise<boolean> {
    try {
      await this.request('/api/health');
      return true;
    } catch (error) {
      // Don't log here since the request method already handles it
      return false;
    }
  }

  public async getFatigueData(): Promise<FatigueData> {
    try {
      return await this.request<FatigueData>('/api/fatigue-data');
    } catch (error) {
      // Create mock data if the backend is not available
      throw error;
    }
  }

  public async startEyeTracking(options: { mode?: 'test' | 'continuous', duration?: number } = {}): Promise<boolean> {
    try {
      const { mode = 'test', duration = 30 } = options;
      
      await this.request('/api/start-eye-tracking', {
        method: 'POST',
        body: JSON.stringify({ mode, duration }),
      });
      return true;
    } catch (error) {
      // Don't log here since the request method already handles it
      return false;
    }
  }

  public async submitTestResults(testType: string, results: any): Promise<boolean> {
    try {
      await this.request(`/api/tests/${testType}`, {
        method: 'POST',
        body: JSON.stringify(results),
      });
      return true;
    } catch (error) {
      // Don't log here since the request method already handles it
      return false;
    }
  }

  public async predictFatigue(features: any): Promise<any> {
    try {
      return await this.request<any>('/api/predict', {
        method: 'POST',
        body: JSON.stringify(features),
      });
    } catch (error) {
      // Create mock prediction if the backend is not available
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;

// Export types for TypeScript module resolution
export type { FatigueData, ApiService };