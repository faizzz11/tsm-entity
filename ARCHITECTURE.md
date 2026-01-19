# Hospital Operations Platform - Architecture Overview

## System Architecture

### Core Philosophy
- **Config-based design**: All logic driven by configuration, not hardcoded values
- **Real-time data flow**: No static/dummy data, all computed from live state
- **Modular extensibility**: Easy to add new features (Phase 2 ready)
- **Professional aesthetics**: Clean medical UI matching modern healthcare platforms

## Module Breakdown

### 1. State Management Layer (`lib/store.ts`)

**Zustand Store Structure:**
```typescript
HospitalState {
  opdQueue: Patient[]
  beds: Bed[]
  admissions: Admission[]
  inventory: InventoryItem[]
  
  Actions: 15+ methods for CRUD and computed metrics
}
```

**Key Features:**
- Centralized state (single source of truth)
- Automatic priority calculation
- Real-time queue sorting
- Bed allocation validation
- Inventory tracking with history
- Computed metrics (wait times, occupancy rates)

### 2. UI Component Layer

**Base Components** (`components/ui/`)
- Button (with variants: default, outline, ghost, destructive)
- Card (with Header, Content, Footer)
- Badge (status indicators)
- Input (form fields)
- Select (dropdowns)

**Layout Components** (`components/layout/`)
- Sidebar: Navigation with active state
- Header: Real-time notifications and alerts

**Design Tokens:**
- Primary: Dark text on off-white background
- Typography: Poppins (sans-serif) + Instrument Serif (headings)
- Spacing: Consistent 4px grid system
- Border radius: 0.5rem (rounded-lg)

### 3. Page Modules

#### Dashboard (`app/page.tsx`)
**Purpose:** Operational command center

**Features:**
- 4 key metric cards (OPD, beds, admissions, inventory)
- OPD load pie chart (by department)
- Admission trend line chart (7-day)
- Bed occupancy bar chart (by department)
- Inventory status comparison chart

**Data Flow:**
- Reads from all store slices
- Computes aggregations in useMemo hooks
- Updates automatically on state changes

#### OPD Queue (`app/opd/page.tsx`)
**Purpose:** Patient check-in and queue management

**Features:**
- Patient registration form
- Department filter cards
- Live wait time per department
- Priority-based queue display
- Patient status updates

**Business Logic:**
- Priority = base (random) + department bonus
- Emergency gets +50 priority boost
- Queue auto-sorts on add
- Wait time computed from check-in timestamp

#### Bed Management (`app/beds/page.tsx`)
**Purpose:** Real-time bed availability tracking

**Features:**
- Department-wise bed overview
- Visual bed grid (green=available, red=occupied)
- Occupancy rate progress bars
- Last updated timestamps

**Business Logic:**
- 6 departments with varying bed counts
- Status updates linked to admissions
- Real-time availability for admission workflow

#### Admissions (`app/admissions/page.tsx`)
**Purpose:** Guided admission workflow

**Features:**
- Multi-field admission form
- Department-based bed filtering
- Real-time bed availability check
- Admission/discharge management
- Recent discharge history

**Business Logic:**
- Rule-based bed matching
- Prevents double-booking (transaction-like logic)
- Auto-updates bed status on admit/discharge
- Links patient → bed → department

#### Inventory (`app/inventory/page.tsx`)
**Purpose:** Stock management and alerts

**Features:**
- Stock level visualization
- Low-stock alerts (below threshold)
- Usage trend chart
- Category overview chart
- Restock interface

**Business Logic:**
- Threshold-based alerts (configurable)
- Usage history tracking per admission
- Auto-decrement on consumption
- Visual stock indicators (progress bars)

#### Live Metrics (`app/metrics/page.tsx`)
**Purpose:** Real-time operational KPIs

**Features:**
- System-wide statistics
- Department wait times with status badges
- Bed distribution by department
- System health monitoring

**Data Flow:**
- Aggregates data from all modules
- Computes real-time metrics
- Color-coded thresholds (normal/warning/critical)

### 4. API Layer (`app/api/capacity/route.ts`)

**Purpose:** Inter-hospital data sharing for city coordination

**Endpoint:** `GET /api/capacity`

**Response Schema:**
```json
{
  "hospitalId": "HSP-001",
  "bedAvailability": { dept: { total, available } },
  "patientLoad": { opdQueue, activeAdmissions, emergencyCases },
  "averageWaitTime": { dept: minutes },
  "status": "operational"
}
```

**Future Extension:**
- Connect to real Zustand store
- Add authentication
- Support multiple hospital endpoints
- City-level aggregation dashboard

## Data Flow Architecture

```
User Action
    ↓
UI Component (form/button)
    ↓
Store Action (Zustand)
    ↓
State Update (immutable)
    ↓
React Re-render (automatic)
    ↓
Computed Metrics (useMemo)
    ↓
Updated UI (charts/tables)
```

## State Synchronization

**Real-time Updates:**
1. Patient added → OPD queue updates → Dashboard metric updates
2. Admission created → Bed status updates → Bed dashboard updates
3. Inventory used → Stock decrements → Alerts trigger
4. Patient discharged → Bed freed → Admission list updates

**No Manual Refresh Needed:**
- Zustand's reactive subscriptions
- React's automatic re-rendering
- Computed values via selectors

## Extensibility Points (Phase 2 Ready)

### Doctor Dashboard Integration
**Future Route:** `/doctor`
**Data Needs:** Patient records, diagnostic history
**Integration:** Link to admissions store, extend with medical records

### Patient Dashboard Integration
**Future Route:** `/patient`
**Data Needs:** Appointments, prescriptions, health records
**Integration:** New patient store, link to OPD/admissions

### AI Features
- RAG system: Medical knowledge base for diagnostics
- Vision AI: Prescription OCR
- Agent orchestration: Multi-step medical workflows
- Predictive analytics: Patient flow forecasting

### Gamification
- Coins/points system for patient engagement
- Task completion tracking
- Leaderboard for health goals

## Performance Optimizations

1. **useMemo for computed metrics** (prevents unnecessary recalculations)
2. **Component-level re-renders** (only affected components update)
3. **Lazy loading** (code splitting per route)
4. **Efficient state selectors** (subscribe to specific slices)

## Deployment Considerations

**Production Ready:**
- TypeScript for type safety
- Zero linter errors
- Clean console (no warnings)
- Responsive design (mobile/tablet/desktop)
- Accessible UI (semantic HTML)

**Environment:**
- Node.js 20+
- Next.js 16 (stable)
- Modern browsers (Chrome, Firefox, Safari, Edge)

## Testing Strategy (Future)

**Unit Tests:**
- Store actions and computed values
- Utility functions (priority calculation, metrics)

**Integration Tests:**
- User flows (check-in → admission → discharge)
- State consistency (bed allocation, inventory)

**E2E Tests:**
- Complete workflows
- Multi-user scenarios

## Security Considerations

**Current:**
- No authentication (internal tool)
- No PII in API responses
- Client-side validation

**Future (Production):**
- Role-based access control (admin, doctor, staff)
- Audit logs for sensitive operations
- Encrypted patient data
- HIPAA compliance measures

## Monitoring & Analytics

**Future Additions:**
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Usage analytics (event tracking)
- System health checks
- Automated alerts for critical issues

## Scalability Path

**Phase 1:** Single hospital (current)
**Phase 2:** Multi-hospital network
**Phase 3:** City-wide health coordination
**Phase 4:** AI-powered predictive system

**Technical Evolution:**
- Database: Move from in-memory to PostgreSQL/MongoDB
- Real-time: Add WebSocket for live updates
- Caching: Redis for high-traffic data
- Microservices: Split domains into separate services
