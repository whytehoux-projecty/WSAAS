# Admin Portal Control Interface - Design Specification

## Overview

This document outlines the admin interface for controlling the e-banking portal status. This interface will be part of the admin dashboard.

## 🎯 Requirements

### Functional Requirements

1. **Status Control**: Toggle portal on/off with one click
2. **Status Types**: Support all four status types
3. **Custom Messages**: Allow admin to set custom status messages
4. **Maintenance Scheduling**: Schedule future maintenance windows
5. **Status History**: View audit log of all status changes
6. **Real-time Monitoring**: Show current portal status and recent activity

### Non-Functional Requirements

1. **Performance**: Status changes should take effect immediately
2. **Security**: Only admins with proper permissions can change status
3. **Auditability**: All changes must be logged with reason
4. **Usability**: Simple, intuitive interface requiring minimal training

## 🎨 UI Components

### 1. Portal Control Card

**Location**: Admin Dashboard → Portal Management

**Layout**:

```
┌─────────────────────────────────────────────────┐
│  Portal Control                           [🔄]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  Current Status:  [●] ONLINE                    │
│  Last Updated:    Jan 15, 2026 11:30 PM         │
│  Updated By:      John Admin (john@bank.com)    │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Quick Actions                             │ │
│  │                                            │ │
│  │  [ Set Online ]  [ Set Offline ]          │ │
│  │  [ Maintenance ] [ Schedule Downtime ]    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Features**:

- Real-time status indicator (updates every 5 seconds)
- Quick action buttons for common operations
- Shows who made the last change and when
- Refresh button to manually update status

---

### 2. Status Change Modal

**Triggered By**: Clicking any quick action button

**Layout**:

```
┌─────────────────────────────────────────────────┐
│  Change Portal Status                      [✕]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  New Status:                                     │
│  ○ Online                                        │
│  ○ Offline                                       │
│  ● Maintenance                                   │
│  ○ Scheduled Downtime                            │
│                                                  │
│  Status Message:                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ System upgrade in progress. ETA: 2 hours  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Reason for Change (required for audit):         │
│  ┌────────────────────────────────────────────┐ │
│  │ Quarterly system maintenance              │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [ Cancel ]              [ Update Status ]       │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Validation**:

- Status selection required
- Reason required (for audit trail)
- Message optional but recommended
- Confirmation dialog for "Offline" status

---

### 3. Maintenance Scheduler

**Triggered By**: Click "Schedule Downtime" button

**Layout**:

```
┌─────────────────────────────────────────────────┐
│  Schedule Maintenance                      [✕]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  Maintenance Window:                             │
│                                                  │
│  Start Date/Time:                                │
│  ┌─────────────────────┐                        │
│  │ 01/16/2026  02:00 AM │ [📅]                  │
│  └─────────────────────┘                        │
│                                                  │
│  Duration:                                       │
│  ┌──────┐      hours                            │
│  │  2   │                                       │
│  └──────┘                                        │
│                                                  │
│  Maintenance Message:                            │
│  ┌────────────────────────────────────────────┐ │
│  │ Scheduled system upgrade. Portal will be  │ │
│  │ offline for approximately 2 hours.        │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Notifications:                                  │
│  ☑ Email users 24 hours before                  │
│  ☑ Show warning on login page 1 hour before     │
│  ☑ Auto-set status at scheduled time            │
│  ☑ Auto-restore status after maintenance        │
│                                                  │
│  [ Cancel ]              [ Schedule ]            │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Features**:

- Date/time picker for maintenance window
- Duration selector
- Custom message for users
- Automated notifications
- Auto-status changes

---

### 4. Status History Table

**Location**: Admin Dashboard → Portal Management → History Tab

**Layout**:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Status Change History                                     [Export]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Filters: [All Statuses ▼] [Last 30 Days ▼] [All Admins ▼]         │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Date/Time         │ From      │ To        │ Admin    │ Reason  │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │ Jan 15, 11:30 PM │ Offline   │ Online    │ John A.  │ Issue   │  │
│  │                   │           │           │          │ resolved│  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │ Jan 15, 9:00 PM  │ Online    │ Offline   │ Jane D.  │ Server  │  │
│  │                   │           │           │          │ crash   │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │ Jan 15, 2:30 AM  │ Maint.    │ Online    │ Auto     │ Sched.  │  │
│  │                   │           │           │          │ complete│  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │ Jan 15, 2:00 AM  │ Online    │ Maint.    │ Auto     │ Sched.  │  │
│  │                   │           │           │          │ maint.  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  « Previous   Page 1 of 5   Next »                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Features**:

- Filterable by status, date range, admin
- Exportable to CSV
- Pagination for large datasets
- Click row to see full details

---

### 5. Current Status Dashboard Widget

**Location**: Admin Dashboard → Overview

**Compact Widget**:

```
┌─────────────────────────────────┐
│  E-Banking Portal               │
├─────────────────────────────────┤
│                                 │
│  [●] ONLINE                     │
│                                 │
│  Last 24h: 2 status changes     │
│  Uptime: 99.2%                  │
│                                 │
│  [Manage Portal →]              │
│                                 │
└─────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### API Endpoints (Already Created)

```typescript
POST   /api/portal/status        // Update status
GET    /api/portal/status        // Get current status  
GET    /api/portal/status/history // Get audit log
```

### Frontend Components (To Create)

```
/admin-interface/
  └── portal-management/
      ├── PortalControlCard.tsx      // Main control interface
      ├── StatusChangeModal.tsx      // Change status modal
      ├── MaintenanceScheduler.tsx   // Scheduling interface
      ├── StatusHistoryTable.tsx     // Audit log display
      └── StatusDashboardWidget.tsx  // Dashboard widget
```

### State Management

```typescript
interface PortalState {
  currentStatus: PortalStatus;
  lastUpdated: string;
  updatedBy: AdminUser;
  scheduledMaintenance: MaintenanceWindow | null;
  recentChanges: StatusChange[];
}
```

---

## 🎯 User Flows

### Flow 1: Quick Status Change

```
1. Admin opens Portal Management page
2. Current status displayed
3. Admin clicks "Set Offline" button
4. Modal appears requesting reason
5. Admin enters reason and confirms
6. Status updates immediately
7. Audit log records change
8. Admin sees confirmation message
```

### Flow 2: Schedule Maintenance

```
1. Admin opens Portal Management
2. Clicks "Schedule Downtime"
3. Scheduler modal opens
4. Admin selects date, time, duration
5. Admin writes maintenance message
6. Admin enables notifications
7. Clicks "Schedule"
8. System creates calendar event
9. Status auto-changes at scheduled time
10. Users see warning message before downtime
11. Portal auto-restores after duration
```

### Flow 3: View Status History

```
1. Admin navigates to History tab
2. Table loads with recent changes
3. Admin filters by date range
4. Admin clicks row to see details
5. Modal shows full change information
6. Admin exports to CSV for reporting
```

---

## 🎨 Design Specifications

### Colors

- **Online**: `#059669` (Green)
- **Offline**: `#DC2626` (Red)
- **Maintenance**: `#6B7280` (Gray)
- **Scheduled**: `#F59E0B` (Yellow)

### Typography

- **Headings**: Inter, 18px, Semi-bold
- **Body**: Inter, 14px, Regular
- **Labels**: Inter, 12px, Medium

### Spacing

- **Card padding**: 24px
- **Section spacing**: 16px
- **Button spacing**: 12px

### Interactions

- **Button hover**: Darken 10%
- **Button active**: Darken 20%
- **Transition**: 200ms ease-in-out
- **Status indicator**: Pulse animation when online

---

## 📊 Analytics & Monitoring

### Metrics to Track

1. **Status Changes Per Day**
2. **Average Downtime Duration**
3. **Most Common Status**
4. **Admin Activity**
5. **Scheduled vs. Unscheduled Changes**

### Dashboard Stats

```
┌─────────────────────────────────────────────┐
│  Portal Statistics (Last 30 Days)           │
├─────────────────────────────────────────────┤
│                                             │
│  Uptime:                         99.5%      │
│  Total Status Changes:           12         │
│  Scheduled Maintenance:          3          │
│  Emergency Downtime:             1          │
│  Average Maintenance Duration:   2.5 hrs    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔔 Notifications

### Email Notifications

- **To**: All registered users
- **When**: 24 hours before scheduled maintenance
- **Content**: Maintenance window, expected duration, message

### In-App Notifications

- **To**: Admins
- **When**: Status change occurs
- **Content**: Who changed it, new status, reason

### Slack/Discord Integration (Optional)

- **Channel**: #portal-status
- **When**: Any status change
- **Content**: Full details with admin, reason, timestamp

---

## 🚀 Implementation Priority

### Phase 1 (Essential)

- [ ] Portal Control Card
- [ ] Status Change Modal
- [ ] API integration with existing endpoints
- [ ] Basic status history table

### Phase 2 (Important)

- [ ] Maintenance Scheduler
- [ ] Automated status changes
- [ ] Email notifications
- [ ] Dashboard widget

### Phase 3 (Nice to Have)

- [ ] Advanced analytics
- [ ] CSV export
- [ ] Slack/Discord integration
- [ ] Uptime monitoring charts

---

## 🧪 Testing Checklist

- [ ] Admin can change status to each type
- [ ] Reason field is required
- [ ] Changes appear in audit log immediately
- [ ] Dashboard widget updates in real-time
- [ ] Scheduled maintenance triggers automatically
- [ ] Notifications sent correctly
- [ ] Non-admin users cannot access interface
- [ ] Status history filters work correctly
- [ ] CSV export includes all data
- [ ] Mobile responsive design

---

## 📝 Notes

- Ensure all status changes are atomic (no partial updates)
- Consider adding "draft" schedules that need approval
- Add confirmation dialogs for destructive actions
- Implement optimistic UI updates for better UX
- Cache current status to reduce API calls
- Use WebSocket for real-time updates (future enhancement)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-15
**Status**: Design Specification Ready for Implementation
