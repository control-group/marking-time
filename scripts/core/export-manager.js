import { MODULE_NAME, TIMESTAMPS } from '../config.js';
import { SettingsManager } from '../settings.js';

/**
 * Manages exporting timestamp data
 */
export class ExportManager {
  /**
   * Export timestamps to CSV
   */
  static exportTimestamps() {
    const timestamps = SettingsManager.getSetting(TIMESTAMPS);
    
    if (!timestamps || timestamps.length === 0) {
      ui.notifications.warn("Marking Time: No timestamps to export");
      return;
    }
    
    // Create CSV content
    let csv = "Type,AbsoluteTime,ElapsedTime,Description,Details\n";
    
    for (const ts of timestamps) {
      // Escape fields for CSV
      const description = ts.description.replace(/"/g, '""');
      const details = ts.details.replace(/"/g, '""');
      
      csv += `"${ts.type}","${ts.absoluteTime}","${ts.elapsedTime}","${description}","${details}"\n`;
    }
    
    // Create a blob and download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const date = new Date().toISOString().split('T')[0];
    const filename = `marking-time-${date}.csv`;
    
    // Create a temporary download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    }, 100);
    
    ui.notifications.info(`Marking Time: Exported ${timestamps.length} timestamps to ${filename}`);
  }
}