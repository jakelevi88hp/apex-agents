/**
 * Advanced Scheduling System
 * 
 * Schedule workflows and agents to run at specific times or intervals
 */

export type ScheduleType = 'once' | 'recurring' | 'cron';

export interface Schedule {
  id: string;
  name: string;
  type: ScheduleType;
  workflowId?: string;
  agentId?: string;
  enabled: boolean;
  
  // For 'once' type
  runAt?: Date;
  
  // For 'recurring' type
  interval?: number; // in minutes
  
  // For 'cron' type
  cronExpression?: string;
  
  // Execution window
  startDate?: Date;
  endDate?: Date;
  
  // Execution limits
  maxExecutions?: number;
  executionCount: number;
  
  // Last execution
  lastRunAt?: Date;
  nextRunAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

class SchedulingSystem {
  private schedules: Map<string, Schedule> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new schedule
   */
  createSchedule(schedule: Omit<Schedule, 'id' | 'executionCount' | 'createdAt' | 'updatedAt'>): Schedule {
    const newSchedule: Schedule = {
      ...schedule,
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.schedules.set(newSchedule.id, newSchedule);
    
    if (newSchedule.enabled) {
      this.startSchedule(newSchedule.id);
    }

    return newSchedule;
  }

  /**
   * Start a schedule
   */
  startSchedule(scheduleId: string) {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule || !schedule.enabled) return;

    // Clear existing timer
    this.stopSchedule(scheduleId);

    const now = new Date();

    // Check if schedule is within execution window
    if (schedule.startDate && now < schedule.startDate) {
      // Schedule to start at startDate
      const delay = schedule.startDate.getTime() - now.getTime();
      const timer = setTimeout(() => this.startSchedule(scheduleId), delay);
      this.timers.set(scheduleId, timer);
      return;
    }

    if (schedule.endDate && now > schedule.endDate) {
      // Schedule has expired
      this.disableSchedule(scheduleId);
      return;
    }

    // Check execution limits
    if (schedule.maxExecutions && schedule.executionCount >= schedule.maxExecutions) {
      this.disableSchedule(scheduleId);
      return;
    }

    switch (schedule.type) {
      case 'once':
        if (schedule.runAt) {
          const delay = schedule.runAt.getTime() - now.getTime();
          if (delay > 0) {
            const timer = setTimeout(() => this.executeSchedule(scheduleId), delay);
            this.timers.set(scheduleId, timer);
          }
        }
        break;

      case 'recurring':
        if (schedule.interval) {
          const delay = schedule.interval * 60 * 1000; // Convert minutes to ms
          const timer = setInterval(() => this.executeSchedule(scheduleId), delay);
          this.timers.set(scheduleId, timer);
          
          // Execute immediately if no lastRunAt
          if (!schedule.lastRunAt) {
            this.executeSchedule(scheduleId);
          }
        }
        break;

      case 'cron':
        if (schedule.cronExpression) {
          const nextRun = this.getNextCronRun(schedule.cronExpression);
          if (nextRun) {
            const delay = nextRun.getTime() - now.getTime();
            const timer = setTimeout(() => {
              this.executeSchedule(scheduleId);
              this.startSchedule(scheduleId); // Reschedule
            }, delay);
            this.timers.set(scheduleId, timer);
            
            schedule.nextRunAt = nextRun;
          }
        }
        break;
    }
  }

  /**
   * Stop a schedule
   */
  stopSchedule(scheduleId: string) {
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      this.timers.delete(scheduleId);
    }
  }

  /**
   * Execute a schedule
   */
  async executeSchedule(scheduleId: string) {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return;

    console.log(`Executing schedule: ${schedule.name}`);

    // Update execution count and last run
    schedule.executionCount++;
    schedule.lastRunAt = new Date();
    schedule.updatedAt = new Date();

    // Execute the workflow or agent
    if (schedule.workflowId) {
      // Execute workflow
      console.log(`Executing workflow: ${schedule.workflowId}`);
    } else if (schedule.agentId) {
      // Execute agent
      console.log(`Executing agent: ${schedule.agentId}`);
    }

    // Check if schedule should be disabled
    if (schedule.type === 'once' || 
        (schedule.maxExecutions && schedule.executionCount >= schedule.maxExecutions)) {
      this.disableSchedule(scheduleId);
    }
  }

  /**
   * Disable a schedule
   */
  disableSchedule(scheduleId: string) {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      schedule.enabled = false;
      schedule.updatedAt = new Date();
      this.stopSchedule(scheduleId);
    }
  }

  /**
   * Enable a schedule
   */
  enableSchedule(scheduleId: string) {
    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      schedule.enabled = true;
      schedule.updatedAt = new Date();
      this.startSchedule(scheduleId);
    }
  }

  /**
   * Delete a schedule
   */
  deleteSchedule(scheduleId: string) {
    this.stopSchedule(scheduleId);
    this.schedules.delete(scheduleId);
  }

  /**
   * Get all schedules for a user
   */
  getUserSchedules(userId: string): Schedule[] {
    return Array.from(this.schedules.values())
      .filter(s => s.userId === userId);
  }

  /**
   * Parse cron expression and get next run time
   */
  private getNextCronRun(cronExpression: string): Date | null {
    // Simple cron parser (supports basic expressions)
    // Format: minute hour day month dayOfWeek
    // Example: "0 9 * * 1-5" = 9 AM on weekdays
    
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return null;

    const [minute, hour, day, month, dayOfWeek] = parts;
    const now = new Date();
    const next = new Date(now);

    // Set to next occurrence
    if (minute !== '*') next.setMinutes(parseInt(minute), 0, 0);
    if (hour !== '*') next.setHours(parseInt(hour));

    // If time has passed today, move to tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }
}

// Singleton instance
export const schedulingSystem = new SchedulingSystem();

// Helper functions
export const scheduleWorkflow = (
  name: string,
  workflowId: string,
  type: ScheduleType,
  config: Partial<Schedule>,
  userId: string
): Schedule => {
  return schedulingSystem.createSchedule({
    name,
    workflowId,
    type,
    enabled: true,
    userId,
    ...config,
  });
};

export const scheduleAgent = (
  name: string,
  agentId: string,
  type: ScheduleType,
  config: Partial<Schedule>,
  userId: string
): Schedule => {
  return schedulingSystem.createSchedule({
    name,
    agentId,
    type,
    enabled: true,
    userId,
    ...config,
  });
};

