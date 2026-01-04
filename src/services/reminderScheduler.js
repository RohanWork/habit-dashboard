// Reminder Scheduler Service
// Manages scheduled reminders for habits

class ReminderScheduler {
  constructor() {
    this.scheduledReminders = new Map(); // habitId -> timeoutId
    this.checkInterval = null;
    this.sentRemindersToday = new Set(); // Track reminders sent today to avoid duplicates
  }

  // Schedule a recurring reminder for a habit
  scheduleReminder(habitId, habitName, reminderTime, onNotify) {
    // Clear existing reminder if any
    this.cancelReminder(habitId);

    const scheduleNext = () => {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const now = new Date();
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes, 0, 0);
      reminderDate.setSeconds(0);
      reminderDate.setMilliseconds(0);

      // If reminder time has passed today, schedule for tomorrow
      if (reminderDate <= now) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }

      const timeUntilReminder = reminderDate.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        // Send notification
        if (onNotify) {
          onNotify(habitId, habitName);
        }
        
        // Schedule next reminder (recurring)
        scheduleNext();
      }, timeUntilReminder);

      this.scheduledReminders.set(habitId, timeoutId);
    };

    scheduleNext();
  }

  // Cancel a scheduled reminder
  cancelReminder(habitId) {
    const timeoutId = this.scheduledReminders.get(habitId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledReminders.delete(habitId);
    }
  }

  // Cancel all reminders
  cancelAll() {
    this.scheduledReminders.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledReminders.clear();
  }

  // Start daily check for habits that need reminders
  startDailyCheck(habits, notificationSettings, sendNotification) {
    // Clear existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Also clear any existing scheduled reminders
    this.cancelAll();

    if (!notificationSettings?.browserEnabled) {
      console.log('[Reminder] Browser notifications are disabled');
      return;
    }

    console.log(`[Reminder] Starting daily check for ${habits.length} habits`);

    // Schedule individual reminders for each habit
    habits.forEach(habit => {
      if (habit.reminderEnabled && habit.reminderTime && habit.active && !habit.archived) {
        console.log(`[Reminder] Scheduling reminder for "${habit.name}" at ${habit.reminderTime}`);
        this.scheduleReminderForHabit(habit, notificationSettings, sendNotification);
      } else {
        console.log(`[Reminder] Skipping "${habit.name}":`, {
          reminderEnabled: habit.reminderEnabled,
          reminderTime: habit.reminderTime,
          active: habit.active,
          archived: habit.archived
        });
      }
    });

    // Also check every minute as a backup (in case page was closed and reopened)
    this.checkInterval = setInterval(() => {
      if (!notificationSettings?.browserEnabled) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();
      const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      
      // Log every minute check (only at :00 seconds to avoid spam)
      if (currentSecond === 0) {
        console.log(`[Reminder] ⏱️ Minute check at ${currentTime}`);
      }
      
      habits.forEach(habit => {
        if (habit.reminderEnabled && habit.reminderTime && habit.active && !habit.archived) {
          // Normalize reminder time format (handle both "2:30" and "02:30")
          const [reminderHours, reminderMinutes] = habit.reminderTime.split(':').map(Number);
          const normalizedReminderTime = `${String(reminderHours).padStart(2, '0')}:${String(reminderMinutes).padStart(2, '0')}`;
          
          // Check if it's time for reminder (within the same minute)
          const timeMatch = currentHour === reminderHours && currentMinute === reminderMinutes;
          
          if (timeMatch && currentSecond === 0) {
            console.log(`[Reminder] 🎯 Time match found for "${habit.name}" at ${currentTime}`);
            
            // Check if habit is scheduled for today based on frequency
            const shouldRemind = this.shouldRemindToday(habit, now);
            console.log(`[Reminder] Should remind today: ${shouldRemind} (frequency: ${habit.frequency || 'daily'})`);
            
            if (shouldRemind) {
              // Check if we already sent a reminder for this habit today
              const reminderKey = `${habit.id}-${now.toDateString()}`;
              if (!this.sentRemindersToday || !this.sentRemindersToday.has(reminderKey)) {
                console.log(`[Reminder] 🔔 Triggering reminder for "${habit.name}" at ${currentTime}`);
                sendNotification(`Time for: ${habit.name}`, {
                  body: `Don't forget to complete "${habit.name}" today!`,
                  data: { habitId: habit.id, habitName: habit.name, type: 'reminder' },
                });
                
                // Track that we sent this reminder
                if (!this.sentRemindersToday) {
                  this.sentRemindersToday = new Set();
                }
                this.sentRemindersToday.add(reminderKey);
                console.log(`[Reminder] ✅ Reminder sent and tracked for "${habit.name}"`);
              } else {
                console.log(`[Reminder] ⏭️ Already sent reminder for "${habit.name}" today`);
              }
            } else {
              console.log(`[Reminder] ⏭️ "${habit.name}" not scheduled for today (frequency: ${habit.frequency || 'daily'})`);
            }
          }
        }
      });
    }, 60000); // Check every minute
  }

  // Schedule a reminder for a specific habit
  scheduleReminderForHabit(habit, notificationSettings, sendNotification) {
    if (!habit.reminderEnabled || !habit.reminderTime || !notificationSettings?.browserEnabled) {
      console.log(`[Reminder] Cannot schedule "${habit.name}":`, {
        reminderEnabled: habit.reminderEnabled,
        reminderTime: habit.reminderTime,
        browserEnabled: notificationSettings?.browserEnabled
      });
      return;
    }

    // Cancel existing reminder for this habit
    this.cancelReminder(habit.id);

    const scheduleNext = () => {
      const [hours, minutes] = habit.reminderTime.split(':').map(Number);
      const now = new Date();
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes, 0, 0);
      reminderDate.setSeconds(0);
      reminderDate.setMilliseconds(0);

      // Log current time and timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log(`[Reminder] Current time: ${now.toLocaleString()} (${timezone})`);
      console.log(`[Reminder] Reminder time set for: ${hours}:${String(minutes).padStart(2, '0')}`);

      // If reminder time has passed today, schedule for tomorrow
      if (reminderDate <= now) {
        console.log(`[Reminder] Reminder time (${reminderDate.toLocaleString()}) has passed, scheduling for tomorrow`);
        reminderDate.setDate(reminderDate.getDate() + 1);
      }

      // Check if habit should remind on the scheduled date
      const shouldRemind = this.shouldRemindOnDate(habit, reminderDate);
      
      if (!shouldRemind) {
        // If not scheduled for that day, find next valid day
        let nextDate = new Date(reminderDate);
        let attempts = 0;
        while (!this.shouldRemindOnDate(habit, nextDate) && attempts < 7) {
          nextDate.setDate(nextDate.getDate() + 1);
          attempts++;
        }
        reminderDate.setTime(nextDate.getTime());
        console.log(`[Reminder] Habit not scheduled for that day, found next valid day: ${reminderDate.toLocaleString()}`);
      }

      const timeUntilReminder = reminderDate.getTime() - now.getTime();
      const minutesUntilReminder = Math.round(timeUntilReminder / 1000 / 60);
      const hoursUntilReminder = Math.round(minutesUntilReminder / 60);

      // Only schedule if time is positive and reasonable (not more than 7 days)
      if (timeUntilReminder > 0 && timeUntilReminder < 7 * 24 * 60 * 60 * 1000) {
        console.log(`[Reminder] ✅ Scheduled reminder for "${habit.name}"`);
        console.log(`[Reminder]   - Scheduled time: ${reminderDate.toLocaleString()} (${timezone})`);
        console.log(`[Reminder]   - Time until reminder: ${hoursUntilReminder}h ${minutesUntilReminder % 60}m (${minutesUntilReminder} minutes)`);
        console.log(`[Reminder]   - Frequency: ${habit.frequency || 'daily'}`);
        console.log(`[Reminder]   - Should remind on scheduled date: ${shouldRemind}`);
        
        const timeoutId = setTimeout(() => {
          const currentTime = new Date();
          console.log(`[Reminder] ⏰ Timeout fired for "${habit.name}" at ${currentTime.toLocaleString()}`);
          
          // Check again if we should remind today
          const shouldRemindNow = this.shouldRemindToday(habit, currentTime);
          console.log(`[Reminder] Should remind now: ${shouldRemindNow}`);
          
          if (shouldRemindNow) {
            console.log(`[Reminder] 🔔 Sending reminder for "${habit.name}"`);
            sendNotification(`Time for: ${habit.name}`, {
              body: `Don't forget to complete "${habit.name}" today!`,
              data: { habitId: habit.id, habitName: habit.name, type: 'reminder' },
            });
          } else {
            console.log(`[Reminder] Skipping reminder for "${habit.name}" - not scheduled for today`);
          }
          
          // Schedule next reminder
          scheduleNext();
        }, timeUntilReminder);

        this.scheduledReminders.set(habit.id, timeoutId);
      } else {
        console.warn(`[Reminder] ❌ Could not schedule reminder for "${habit.name}": invalid time`, { 
          timeUntilReminder, 
          reminderDate: reminderDate.toLocaleString(),
          minutesUntilReminder 
        });
      }
    };

    scheduleNext();
  }

  // Check if habit should remind on a specific date
  shouldRemindOnDate(habit, date = new Date()) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (habit.frequency === 'daily') {
      return true;
    } else if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
      const schedule = habit.schedule || {};
      const daysOfWeek = schedule.daysOfWeek || [];
      return daysOfWeek.includes(dayOfWeek);
    }
    
    return false;
  }

  // Check if habit should remind today based on frequency
  shouldRemindToday(habit, date = new Date()) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (habit.frequency === 'daily') {
      return true;
    } else if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
      const schedule = habit.schedule || {};
      const daysOfWeek = schedule.daysOfWeek || [];
      return daysOfWeek.includes(dayOfWeek);
    }
    
    return false;
  }

  // Stop the daily check
  stopDailyCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.cancelAll();
    // Reset daily reminder tracking at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    setTimeout(() => {
      this.sentRemindersToday = new Set();
    }, msUntilMidnight);
  }

  // Debug: Get all scheduled reminders
  getScheduledReminders(habits = []) {
    const scheduled = [];
    this.scheduledReminders.forEach((timeoutId, habitId) => {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        scheduled.push({
          habitId,
          habitName: habit.name,
          reminderTime: habit.reminderTime,
          frequency: habit.frequency,
        });
      }
    });
    return scheduled;
  }

  // Debug: Log all scheduled reminders
  logScheduledReminders(habits = []) {
    console.log('[Reminder] ====== SCHEDULED REMINDERS ======');
    const scheduled = this.getScheduledReminders(habits);
    if (scheduled.length === 0) {
      console.log('[Reminder] No reminders currently scheduled');
    } else {
      scheduled.forEach(({ habitName, reminderTime, frequency }) => {
        console.log(`[Reminder] - "${habitName}" at ${reminderTime} (${frequency || 'daily'})`);
      });
    }
    console.log(`[Reminder] Total scheduled: ${scheduled.length}`);
    console.log(`[Reminder] Minute check interval: ${this.checkInterval ? 'Active' : 'Inactive'}`);
    console.log('[Reminder] ====================================');
  }
}

// Export singleton instance
export const reminderScheduler = new ReminderScheduler();

