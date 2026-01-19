# Hospital Operations Platform

Intelligent hospital operations platform for optimizing patient flow and resource utilization.

## Phase 1 - Completed Modules

### 1. Operational Command View (Dashboard)
- Real-time overview of all hospital operations
- Live metrics: OPD queue, bed occupancy, admissions, inventory alerts
- Dynamic charts: OPD load by department, admission trends, bed occupancy, inventory status
- All data computed from real-time state (no dummy data)

### 2. Dynamic OPD Queue Management
- Real-time patient check-in system
- Department-wise queue visualization
- Priority-based sequencing (check-in time + department priority)
- Average wait time calculation per department
- Patient status tracking (waiting, in-consultation, completed)
- Live queue updates

### 3. Live Bed Availability Dashboard
- Real-time bed status across all departments
- Department-wise bed categorization
- Visual indicators (available/occupied)
- Occupancy rate tracking
- Bed allocation for admissions
- Last updated timestamps

### 4. Rule-Based Admission Workflow
- Guided admission form with validation
- Department-based bed matching
- Real-time bed availability checking
- Prevents double-booking of beds
- Admission and discharge tracking
- Patient-bed-department linkage

### 5. Inventory Usage Tracking
- Medicines, consumables, and equipment tracking
- Real-time stock levels
- Low-stock alerts (threshold-based)
- Usage trend charts
- Category-wise inventory overview
- Restock functionality
- Consumption history

### 6. Live Metrics Dashboard
- Real-time operational KPIs
- Department-wise wait times
- Bed distribution analytics
- System health monitoring
- Patient flow metrics

### 7. Inter-Hospital Capacity Sharing API
- REST API endpoint: `/api/capacity`
- Exposes anonymized operational data
- Designed for city-level health coordination
- Returns: bed availability, patient load, wait times, operational status

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Architecture

### State Management
- Centralized store using Zustand (`lib/store.ts`)
- Real-time data synchronization
- Computed metrics and aggregations
- Modular actions for each domain

### Component Structure
```
components/
  ui/           - Reusable UI components (Button, Card, Badge, etc.)
  layout/       - Layout components (Sidebar, Header)
  
app/
  page.tsx      - Dashboard
  opd/          - OPD Queue Management
  beds/         - Bed Availability
  admissions/   - Admission Workflow
  inventory/    - Inventory Tracking
  metrics/      - Live Metrics
  api/capacity/ - Public API for city integration
```

### Data Models
- **Patient**: OPD queue entries with priority calculation
- **Bed**: Department-wise bed tracking with status
- **Admission**: Patient admission records with bed allocation
- **InventoryItem**: Stock tracking with usage history

## Features

### Real-Time Updates
- All dashboards update dynamically
- No page refresh needed
- Live calculations for wait times, occupancy rates
- Instant inventory alerts

### Rule-Based Logic
- Priority sequencing for OPD (Emergency department gets +50 priority)
- Bed allocation validation (prevents double-booking)
- Inventory threshold alerts
- Department-specific bed matching

### Data Integrity
- Bed status automatically updates on admission/discharge
- Queue automatically sorted by priority
- Inventory decrements tracked per admission
- Historical data preserved

## Design System

- **Primary Color**: Dark (oklch format)
- **Background**: Off-white (#FFFFF4)
- **Typography**: Poppins (body), Instrument Serif (headings)
- **Border Radius**: 0.5rem (rounded-lg)
- **Consistent spacing and padding
- Professional medical UI aesthetic

## API Documentation

### GET /api/capacity

Returns anonymized hospital capacity data for city-level coordination.

**Response:**
```json
{
  "hospitalId": "HSP-001",
  "hospitalName": "City General Hospital",
  "timestamp": "2026-01-19T...",
  "bedAvailability": {
    "cardiology": { "total": 10, "available": 4 },
    "neurology": { "total": 10, "available": 2 },
    ...
  },
  "patientLoad": {
    "opdQueue": 12,
    "activeAdmissions": 42,
    "emergencyCases": 3
  },
  "averageWaitTime": {
    "cardiology": 25,
    "neurology": 35,
    ...
  },
  "status": "operational"
}
```

## Running the Project

```bash
npm install
npm run dev
```

Navigate to http://localhost:3000

## Phase 2 - Future Extensions (Prepared)

The codebase is structured to easily integrate CuraLink AI features:

### Doctor Dashboard
- Multi-agent orchestration
- AI-assisted diagnostics
- RAG system for medical cases
- Doctor control interface

### Patient Dashboard
- Gamification system (coins, leaderboard)
- AI task verification
- Medicine analyzer with OCR
- Telegram reminders
- AI medical support
- Appointment booking

### Extensibility Points
- Modular component structure
- Separate route structure ready
- State management can be extended
- API layer prepared for expansion
- Design system consistent for new features

## Development Notes

- All data is computed from real state (no hardcoded values)
- Charts use actual aggregated data
- Responsive design for mobile/tablet/desktop
- Clean, human-like code structure
- Config-based approach throughout
- No unnecessary comments (self-documenting code)
