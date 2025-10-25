export interface AdminLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminUsername: string;
  action: string; // e.g., 'TAKEDOWN', 'DISMISS_REPORT'
  targetId: string; // e.g., adId or userId
  reason: string;
}
