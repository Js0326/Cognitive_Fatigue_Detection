// Activity tracking module to monitor user interactions

class ActivityTracker {
  private isTracking: boolean = false;
  private lastActivity: number = Date.now();
  private mouseMovements: number = 0;
  private keyPresses: number = 0;
  private activityInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.resetCounters();
  }

  private resetCounters() {
    this.mouseMovements = 0;
    this.keyPresses = 0;
  }

  private handleMouseMove = () => {
    this.mouseMovements++;
    this.lastActivity = Date.now();
  }

  private handleKeyPress = () => {
    this.keyPresses++;
    this.lastActivity = Date.now();
  }

  private calculateActivityLevel(): string {
    const totalActions = this.mouseMovements + this.keyPresses;
    if (totalActions > 100) return "High";
    if (totalActions > 50) return "Medium";
    return "Low";
  }

  public startTracking() {
    if (this.isTracking) return;

    // Check if window is available (client-side only)
    if (typeof window !== 'undefined') {
      this.isTracking = true;
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('keydown', this.handleKeyPress);

      // Reset counters periodically
      this.activityInterval = setInterval(() => {
        this.resetCounters();
      }, 30000); // Reset every 30 seconds
    }
  }

  public stopTracking() {
    if (!this.isTracking) return;

    // Check if window is available (client-side only)
    if (typeof window !== 'undefined') {
      this.isTracking = false;
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('keydown', this.handleKeyPress);

      if (this.activityInterval) {
        clearInterval(this.activityInterval);
        this.activityInterval = null;
      }
    }
  }

  public getActivityData() {
    return {
      mouseActivity: this.calculateActivityLevel(),
      activeTime: Math.floor((Date.now() - this.lastActivity) / 1000) + " seconds ago",
      isActive: Date.now() - this.lastActivity < 60000 // Consider inactive after 1 minute
    };
  }
}

// Create a singleton instance
const activityTracker = new ActivityTracker();

// Make sure it's properly exported as default
export default activityTracker;

// For TypeScript module resolution
export type { ActivityTracker };
