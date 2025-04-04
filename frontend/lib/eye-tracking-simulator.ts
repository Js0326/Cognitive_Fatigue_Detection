/**
 * Eye Tracking Simulator
 * 
 * A client-side simulator for eye tracking features when the real backend is not available.
 * This module simulates eye tracking metrics without accessing the user's camera.
 */

class EyeTrackingSimulator {
  private isActive: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly API_ENDPOINT = '/api/eye-tracking';
  private onDataCallback: ((data: any) => void) | null = null;

  /**
   * Start the eye tracking simulation
   * This method simulates the process of tracking eye movements
   * and generates artificial metrics at regular intervals.
   */
  public async start(onData?: (data: any) => void): Promise<void> {
    if (this.isActive) {
      console.log('Eye tracking simulator is already running');
      return;
    }

    this.isActive = true;
    this.onDataCallback = onData || null;
    
    // Log the start of simulation - no actual camera access happens here
    console.log('Started eye tracking simulation (no camera access)');
    
    // Simulate eye tracking data at regular intervals
    // This is just a simulation - no real camera access
    this.intervalId = setInterval(() => {
      if (!this.isActive) {
        this.stop();
        return;
      }

      const data = this.generateRandomEyeData();
      
      if (this.onDataCallback) {
        this.onDataCallback(data);
      }
      
      // Also try to send data to our backend if it's available
      this.sendDataToBackend(data).catch(() => {
        // Silent fail - the backend might not be available
      });
    }, 1000);
    
    // Return a promise that resolves after a simulation period
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.isActive) {
          // Generate final data point
          const finalData = this.generateRandomEyeData();
          
          if (this.onDataCallback) {
            this.onDataCallback(finalData);
          }
          
          // Try to send the final data
          this.sendDataToBackend(finalData).catch(() => {
            // Silent fail
          });
          
          resolve();
        }
      }, 3000); // Simulate for 3 seconds
    });
  }

  /**
   * Stop the eye tracking simulation and clean up any resources
   */
  public async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }
    
    this.isActive = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.onDataCallback = null;
    console.log('Stopped eye tracking simulation');
  }

  /**
   * Generate random eye tracking data to simulate real measurements
   */
  private generateRandomEyeData(): any {
    return {
      timestamp: Date.now(),
      blink_rate: Math.floor(Math.random() * 20) + 5, // 5-25 blinks per minute
      fixation_duration: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)), // 0.1-0.4 seconds
      saccade_speed: Math.floor(Math.random() * 200) + 300, // 300-500 degrees/second
      pupil_diameter: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3-5mm
      gaze_position: {
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 600)
      }
    };
  }

  /**
   * Attempt to send simulated data to the backend API
   */
  private async sendDataToBackend(data: any): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${this.API_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
    } catch (error) {
      // Silent fail in simulation mode
    }
  }
}

// Export a singleton instance
const eyeTrackingSimulator = new EyeTrackingSimulator();
export default eyeTrackingSimulator;

// For TypeScript module resolution
export type { EyeTrackingSimulator };