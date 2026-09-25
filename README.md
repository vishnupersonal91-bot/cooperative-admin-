# Cooperative Service Marketplace – Cooperative Admin App

A professional, modern command center web application for managing the registered labour cooperative society in the **Cooperative Service Marketplace** ecosystem.

The Admin App connects directly and bidirectionally with the **Customer App** and **Worker App** via `BroadcastChannel('coop_marketplace_channel')` and persistent `localStorage` synchronization using identical **Booking IDs** (`CP-9104`, `CP-9208`, `SOS-1092`, `CP-8841`), worker profiles (`Ramesh Kumar #402`, `Suresh Patil #315`, `Vikram Sen #108`), customer accounts, and real-time appointment statuses.

---

## 🏛️ Cooperative Society Overview
- **Society**: Bengaluru Artisans & Labour Labour Cooperative Society Ltd.
- **Registration**: `Reg. No: KA/BLR/COOP/2021/04` (Govt. of Karnataka Cooperative Department)
- **Governance**: 100% Member-Owned Quality, 0% Middleman Platform Commission, Transparent 85% Worker Direct Earnings & 15% Cooperative Welfare Pool.

---

## 🌟 Key Modules & Features

### 1. Admin Login & Authentication
- **Cooperative Society ID**: Pre-filled with `COOP-BLR-560038`.
- **Username / Mobile**: Pre-filled with `admin@coopguild.org`.
- **Password**: Secure password input with eye visibility toggle.
- **1-Click Auto-Fill**: `Auto-fill Demo Admin Credentials` button for instant testing.
- **Forgot Password Modal**: Dispatches 6-digit verification OTP to the registered mobile terminal.
- **Session Management**: Direct navigation to Admin Dashboard on login, with quick sign-out from the sidebar footer.

---

### 2. Admin Dashboard
- **Top Summary Metrics**:
  - **TOTAL WORKERS**: Total count (142), Verified (128), Pending Verification (14).
  - **ACTIVE JOBS**: In Progress (18), On the Way (12), Emergency (8).
  - **TODAY'S BOOKINGS**: Instant (28), Pre-Booking (26), Emergency (10).
  - **AVAILABLE WORKERS**: Online (64), Offline (12), Assigned (20).
  - **TODAY'S SERVICE VALUE**: Total Value (₹48,650), Worker Direct Earnings (85% = ₹41,352.50), Cooperative Welfare Share (15% = ₹7,297.50).
  - **PENDING ACTIONS**: Worker Verification (14), Customer Complaints (2), Unassigned Jobs (1), Payment Issues (1).
- **🚨 Emergency Monitoring Banner**:
  - Prominent emergency dispatch card with red pulsating alert siren.
  - Active request: `Major Pipe Burst / Ceilings Flood`, Customer `Ananya Sharma`, Location `Indiranagar 100ft Rd`.
  - Nearby qualified workers count (3 workers), target response window (< 15 mins).
  - Quick action buttons: `Assign Worker` and `Contact Customer`.
- **Interactive SVG Analytics**:
  - Today's Service Value & Dividend Distribution stacked timeline chart.
  - Transparent 0% Middleman markup breakdown.
- **Priority Pending Actions Box**:
  - Quick links to Worker Verification backlog, emergency dispatch, and customer complaints.
- **Live Service Workflow Table**:
  - Real-time preview of recent appointments with 1-click `Manage` modal.

---

### 3. Worker Verification & Skill Management
- **Worker List Table**:
  - Columns: Worker Name & Avatar, Worker ID (`#402`, `#315`, `#108`, etc.), Mobile Number, Primary Skill, Experience, Service Area, Application Date, Verification Status badge, Actions.
  - Statuses: `Pending`, `Under Review`, `Approved`, `Rejected`, `Suspended`.
  - Filters: Status pills, Trade Skill dropdown, Service Area dropdown, and live text search.
- **Worker Details Drawer**:
  - **PERSONAL DETAILS**: Full Name, Mobile, Email, Residential Address.
  - **GOVERNMENT ID**: Aadhaar DigiLocker verification badge and document preview.
  - **TRADE CERTIFICATE**: Skill Council / ITI certificate preview and verification status.
  - **PERFORMANCE & WELFARE**: Customer rating (4.9★), completed jobs count, welfare balance, group insurance policy number.
- **Worker Skill Management Editor**:
  - Admin can update:
    - Primary Skill (Plumbing, Electrical, Carpentry, Painting, Cleaning, Appliance Repair, Other)
    - Secondary Skills list (e.g., `Pipe Repair, Water Pump Repair, Flush Valve Fix`)
    - Experience bracket (e.g., `6-10 years`)
    - Service Area sectors (e.g., `Indiranagar, Domlur, HAL`)
    - Emergency Availability (`Available`, `Standby`, `Unavailable`)
    - General Live Availability (`Online`, `Offline`)
    - Maximum Daily Jobs Limit
- **Admin Decision Actions**:
  - **APPROVE**: Marks the worker eligible for normal customer jobs and broadcasts event.
  - **REJECT**: Opens rejection reason modal, prompts Admin to input specific feedback.
  - **REQUEST MORE INFORMATION**: Sends notification to the applicant and sets status to `Under Review`.
  - **SUSPEND**: Revokes dispatch access and suspends account.
  - **REGISTER WALK-IN ARTISAN**: Enrolls walk-in applicants directly into verification queue.

---

### 4. Appointment Management & Estimate Oversight (PART 2)
- **Connected Ecosystem Booking IDs**:
  - `CP-9104`: Plumbing Leakage & Pipe Repair (Instant booking, Customer P. Vishnu Vardhan).
  - `CP-9208`: Pipe Leakage & Joint Sealing (Pre-Booking, Scheduled tomorrow).
  - `SOS-1092`: Major Pipe Burst / Ceilings Flood (Emergency SOS request).
  - `CP-8841`: Ceramic Valve Replacement & Pressure Test (In Progress).
- **Sub-Tabs**:
  - **Appointments Directory**: Full dispatch lifecycle, worker assignment, and rescheduling.
  - **Estimate Monitoring & Audit**: Oversight table showing labour breakdown, material costs, and audit check status (`Passed` or `Flagged for Review`).
- **Estimate Flagging Modal**:
  - Allows admin to flag estimates for review with specific reasons (e.g., "Discrepancy in parts and labour markup", "Unapproved Part Substitution", "Customer Dispute").
  - Broadcasts `ESTIMATE_AUDIT_FLAGGED` across the marketplace.

---

### 5. Customer Accounts & Support Tickets (PART 2)
- **Sub-Tabs**:
  - **Customer Directory**: Customer profiles, patronage dividend wallet balance, and full booking history.
  - **Support Tickets**: Support ticket triage center (`TCK-801`, `TCK-802`, `TCK-803`).
- **Ticket Categories & Priorities**:
  - Categories: `Booking Issue`, `Emergency Support`, `Payment Issue`, `Worker Delay`, `Quality Dispute`.
  - Priority levels with distinct badges: `Critical` (pulsing red), `High`, `Medium`.
- **Admin Actions**:
  - Update ticket resolution and staff assignment.
  - Deep-link 1-click jump from ticket directly to live chat with customer.

---

### 6. Service Management & Catalog (PART 2)
- **7 Trade Divisions**:
  1. Plumbing
  2. Electrical
  3. Carpentry
  4. Painting
  5. Cleaning
  6. Appliance Repair
  7. Other Services
- **Service Details**:
  - Service Name, Category, Description, Required Skill, Estimated Labour Time, Base Labour Charge, Emergency Charge, Material Category, Status (`Active` / `Inactive`).
- **Admin Actions**:
  - Add Service modal with auto-generated division codes (`SVC-PL-01`, `SVC-EL-01`, etc.).
  - Edit Service modal.
  - Deactivate / Reactivate service toggles.

---

### 7. Monthly Service Rate Management (PART 2)
- **Board Ratified Pricing**:
  - Displays Current Month (September 2026), Previous Month (August 2026), Rate Change chips (`+₹30 (+8.6%)`), Emergency Rate, Effective Date, and Board Resolution (`RES-COOP-2026/09-B4`).
- **Admin Actions**:
  - Adjust Single Rate with remarks.
  - Save Working Draft.
  - Board Approval action.
  - **Publish Monthly Rates**: Broadcasts official rate cards.
  - **CRITICAL PRESERVATION RULE**: Publishing new monthly rates applies **strictly to newly initiated bookings**; existing confirmed and ongoing bookings (`CP-9104`, `CP-9208`, `CP-8841`) remain strictly locked at their historical agreed rates.
- **Audit Rate History**:
  - Timeline view showing month-by-month historical rate changes, percentage fluctuations, and Board Resolution numbers.

---

### 8. Material Cost Management (PART 2)
- **Cooperative Wholesale Material Pricing**:
  - Transparent price catalogue for repair parts (PVC pipes, Teflon tape, Brass stop cocks, Booster pumps, Copper wire, MCB switches, Waterproof paint, Drain cleaners).
- **Price Audit & Tracking**:
  - Standard Wholesale Cost, Previous Cost, Fluctuation Delta, Stock Status.
  - Price History modal tracing certified supplier rate history.
  - Add / Edit Material modals.

---

### 9. Worker Welfare Programs & Insurance Registry (PART 2)
- **Sub-Tab 1: Cooperative Welfare Programs**:
  - Programs: Monsoon Emergency Relief Loan (0% Interest up to ₹15,000), Artisan Tool Modernization Grant (50% Subsidy up to ₹5,000), Children Education Scholarship (₹10,000/yr), Medical Benevolent Relief Fund (up to ₹25,000).
  - Worker Welfare Eligibility Ledger: Tracks monthly ₹150 member contribution, tier status, and total benefits disbursed.
  - Disburse Benefit modal with live history logging.
- **Sub-Tab 2: Worker Insurance Registry**:
  - Group Accident & Disability, High-Voltage Cover, and Health policies per worker.
  - **Expiring Soon Banner**: Highlights policies expiring within 30 days.
  - **1-Tap Renewal**: Instantly renews all expiring policies for +1 year under the Cooperative Pool.
  - Policy enrollment and Insurance Claim filing modals.

---

### 10. 3-Way Communication Desk (Customer ↔ Admin ↔ Worker) (PART 2)
- **Multi-Party Chat Hub**:
  - Split layout with conversations list (Customer threads, Worker dispatch threads).
  - Real-time message bubbles, timestamps, delivery receipts, and unread badges.
  - Quick response dispatch pills ("Technician is 8 mins away", "Standard rate card confirmed", etc.).
  - Instant simulated automated replies from customers and technicians.
  - Pre-call verification trigger directly from the chat header.

---

### 11. Pre-Call Verification Modal (PART 2)
- **Security & Quality Protocol**:
  - Triggered from Worker Drawer (`Call Worker`), Customer Drawer (`Call Customer`), or Chat Hub.
  - Displays target party name, role, phone number, and linked booking ID.
  - Verification checklist for identity confirmation, booking reference check, and quality recording notice.
  - Initiates simulated recorded VoIP desk call.

---

### 12. Payments, Settlements & Cooperative Ledger (PART 2)
- **Transparent Cooperative Economics**:
  - **Gross Volume**: Total value of completed services.
  - **85% Worker Direct Share**: Transferred directly to artisan dividend/wallet.
  - **15% Cooperative Welfare Pool**: Reserved for artisan welfare, emergency loans, insurance, and cooperative operations.
- **Filter Controls**:
  - Date Range pills: `Today`, `This Week`, `This Month`, `All Time`.
  - Settlement Status select: `All`, `Settled`, `Pending`.
  - Live search across transaction IDs, booking IDs, and participant names.

---


---

### 13. Workforce Allocation & 8-Criteria Matching Engine (PART 3)
- **Workforce Matching Engine**:
  - Automatically evaluates candidates for any selected active request based on 8 core criteria:
    1. **Skill Match**: Primary Trade Specialist (30 pts) vs Cross-Trained (20 pts) vs Basic (12 pts).
    2. **Distance**: Real-time GPS distance in kilometers (e.g. 1.2 km vs 2.8 km vs 5.4 km).
    3. **Worker Availability**: Current presence status (`Online`, `Standby`, `Busy`).
    4. **Current Workload**: Number of active jobs currently assigned today (0, 1, or 2).
    5. **Service Area**: Primary cluster match (Indiranagar, Koramangala, HSR Layout, Whitefield, Central).
    6. **Emergency Availability**: Certified Rapid Responder status for urgent / SOS hazard calls.
    7. **Number of Current Assignments**: Today's active allocations compared against daily workload cap (4).
    8. **Previous Assignments & Rating**: Historical customer satisfaction rating (e.g. 4.9★) and total completed jobs (e.g. 142 jobs).
- **Candidate Presentation**:
  - Candidates ranked with animated **Match Score %** badge.
  - Top candidate highlighted with `.candidate-card.recommended`, green halo border, and prominent `RECOMMENDED WORKER` badge.
  - Example: For Plumbing Request `CP-9104` in Indiranagar, **Ramesh Kumar (#402)** ranks #1 with 98% Match Score (1.2 km away, online, 1 job today, 4.9★ rating).
- **Admin Allocation Controls**:
  - **Assign Artisan**: Allocates candidate, updates booking status to `CONFIRMED` / `ALLOCATED`, and broadcasts real-time event.
  - **Reassign**: Frees up the booking to allow alternative candidate allocation.
  - **View Profile**: Opens complete artisan personal, credential, and insurance drawer.
  - **View Location**: Opens proximity radar modal with distance, transit ETA (~10 mins), waypoint route, and one-tap confirm dispatch.
  - **Pre-Call Artisan**: Initiates pre-call verification dialog with recorded desk call.
  - **Manual Override**: Allows cooperative administrator to bypass automated scoring with mandatory audit justification logged.

---

### 14. Workforce Availability & Sector Deployments (PART 3)
- **Summary Availability KPIs**:
  - **Total Artisans**: 48 registered members.
  - **Online**: 32 active on platform.
  - **Available Now**: 19 artisans free for immediate dispatch.
  - **Assigned / In Progress**: 13 artisans executing active jobs.
  - **Offline**: 16 off-duty or resting.
  - **Standby Emergency**: 8 rapid responders held for SOS calls.
- **Breakdown by 6 Trade Skills**:
  - Plumbing, Electrical, Carpentry, Painting, Cleaning, and Appliance Repair with real-time percentage progress bars and online/available statistics.
- **Breakdown by 5 Service Areas**:
  - Indiranagar, Koramangala, HSR Layout, Whitefield, and Central Bengaluru.
- **Live Artisan Roster Table**:
  - Real-time roster with avatar, trade badge, sector, live presence dot, current active job ID, emergency readiness, and action icons.
- **Shift Planning & Rebalancing**:
  - Rebalance Shifts button to automatically redistribute artisans between peak zones.
  - Shift Planning Modal to schedule morning, afternoon, evening, and on-call emergency rosters per trade.

---

### 15. AI Demand Forecasting & Workforce Gap Planning (PART 3)
- **AI Demand Forecasting Sub-Tab**:
  - **Explicit Decision Support Disclaimer**: Clear prominent banner stating that AI Forecast provides predictive decision support based on seasonal trends, historical booking frequency, and weather patterns, and does not guarantee outcomes.
  - **Predicted Demand Labels & Confidence Indicators**:
    - Each trade division features an explicit demand level (`High`, `Medium`, `Low`) and a confidence pill (e.g. `Forecast Confidence: 88%`).
  - **Interactive 7-Day Predicted Demand SVG Curve**:
    - Smooth curve showing expected daily job volume (Mon: 18, Tue: 22, Wed: 27, Thu: 24, Fri: 31, Sat: 38, Sun: 42 peak jobs).
  - **Location Forecast Matrix**:
    - Area vs Dominant Trade vs Expected Volume vs Surge Risk (e.g. Indiranagar Pre-Monsoon Plumbing Surge).
- **Workforce Gap & Planning Sub-Tab**:
  - Detailed comparison table:
    - **Service Category**
    - **Expected Jobs (7 Days)**
    - **Available Workers**
    - **Required Workers**
    - **Workforce Gap**: Color-coded deficit chips (e.g. `-7 Deficit`) or surplus chips (`+4 Surplus`).
    - **Planning Recommendation**: Specific operational actions (e.g. *"7 additional worker capacity may be required. Mobilize standby roster for Indiranagar & Koramangala."*).
- **Planning Controls**:
  - **Mobilize Standby Workers**: Activates 8 standby artisans to reduce plumbing/electrical deficits.
  - **Re-cluster Service Areas**: Shifts surplus artisans from low-demand sectors to high-demand clusters.
  - **Expand Emergency Coverage**: Increases rapid response capacity by +50% for weekend storm hazards.
  - **Bulk Recommended Allocation**: Dispatches best-matched artisans to all pending jobs with 1-click.

---

### 16. 12 Statutory & Operational Cooperative Reports (PART 3)
Complete reporting module compliant with cooperative society governance standards, featuring an interactive report selector grid, filter toolbar (Date Range, Trade Sector, Location Zone), summary KPI cards, structured data tables, and real CSV / PDF export:
1. **Worker Performance Report**: Ratings (4.81★ avg), completed jobs, on-time arrival rate (96.4%), repeat request %, artisan earnings (88%), and cooperative welfare contributions (12%).
2. **Customer Bookings Report**: Total bookings (156), completed jobs (142), cancellation rate (3.2%), and repeat patronage ratio (68%).
3. **Service Demand Report**: Request share by trade (Plumbing 34.6%, Electrical 26.9%), emergency SOS share (24.2%), and peak demand hours.
4. **Revenue & Margin Report**: Gross GMV (₹4,86,500), artisan direct share (₹4,28,120), cooperative 12% margin (₹58,380), and welfare corpus allocation.
5. **Material Costs Report**: Wholesale material consumption, standard cooperative rates, artisan billed rates, and variance audit (100% compliant).
6. **Rate Changes Report**: Historical rate card revisions, board resolution numbers, price change % (+7.4% avg), and customer notice compliance.
7. **Welfare Support Report**: Welfare fund balance (₹4,68,500), disbursed education aid, medical grants, and tool modernization subsidies.
8. **Insurance Status Report**: Universal artisan insurance status (48 of 48 covered), policies expiring in 30 days, and claim settlement ratio (100%).
9. **Allocation Quality Report**: AI matching efficiency (94.8%), average dispatch distance (1.4 km), travel latency (8.2 mins), and manual override rate (5.2%).
10. **Emergency Requests Report**: SOS dispatches (18), average response time (11.4 mins vs <15 min target), and zero workplace safety mishaps.
11. **Complaints & SLA Report**: Grievance tickets logged (6), average resolution turnaround (1.4 hrs), customer satisfaction (4.85★), and open dispute count (0).
12. **Payment Reports**: Gross digital inflows (₹4,86,500), UPI/Card breakdown, bi-weekly artisan settlements, and cooperative liquid reserves.
- **Export Capabilities**:
  - **Export CSV**: Generates standard comma-separated file with quoted fields and triggers browser download (`Cooperative_Report_<ReportID>_<Date>.csv`).
  - **Print / PDF**: Triggers clean, print-formatted page layout for board audits.

---

### 17. Admin Notifications Modal & Live Alerts (PART 3)
- Header bell button `#btn-header-notifications` with dynamic unread badge count (`10`).
- Modal displaying 10 operational alerts:
  - Emergency SOS alerts with immediate dispatch links.
  - Allocation pending notifications with recommended worker links.
  - Upcoming insurance policy expiration notices (e.g. Vikram Sen policy due in 4 days).
  - Rate card board resolution quorum notices.
  - High estimate audit review flags (> ₹2,000 threshold).
  - AI demand forecast weekend deficit alerts.
  - Welfare claim filings by artisan families.
  - Customer invoice and grievance queries.
  - Bi-weekly payout batch treasury release notices.
  - New artisan walk-in trade certificate verification submissions.
- Clicking any notification automatically deep-links to the exact module, subtab, and worker/booking item.
- "Mark All as Read" button clears the notification badge count.

---

## ⚡ Real-Time Cross-App Sync & Simulation Controls

The top toolbar features a **Live Ecosystem Simulation Bar** allowing 1-tap testing:
- `+ Instant (CP-9104)`: Simulates customer booking an instant plumbing service.
- `+ Pre-Booking (CP-9208)`: Simulates customer booking for tomorrow.
- `+ Emergency SOS`: Simulates urgent SOS pipe burst request.
- `Worker Accepts`: Advances `CP-9104` to `Worker Assigned`.
- `On the Way`: Advances status to `On the Way` (ETA 8 mins).
- `Arrived`: Advances status to `Arrived` at customer doorstep.
- `In Progress`: Advances status to `In Progress` active repair.
- `Completed`: Closes booking as `Completed`.

When `customer/index.html` and `worker/index.html` are opened in adjacent browser tabs, all status transitions and worker assignments update bidirectionally in real-time across all 3 interfaces without page reloads.

---

## 🧪 Testing & Verification Guide

### Quick Start
1. Double-click `run.bat` or run:
   ```cmd
   python -m http.server 8080
   ```
2. Open `http://localhost:8080/index.html` in your browser.
3. Click `Sign In to Admin Dashboard` (credentials are pre-filled).

### Cross-App Multi-Tab Verification
1. **Tab 1 (Customer App)**: Open `http://localhost:8000/index.html` (or `customer/index.html`).
2. **Tab 2 (Worker App)**: Open `worker/index.html`.
3. **Tab 3 (Admin App)**: Open `http://localhost:8080/index.html`.
4. Trigger an action in the Customer App (e.g. Instant Service booking `CP-9104`).
5. Notice how the Admin App immediately displays the new booking as `Requested` / `Matching`.
6. Accept the job in the Worker App: Admin App instantly displays `Worker Assigned` with Ramesh Kumar (#402).
7. Progress the worker status to `On the Way` &rarr; `Arrived` &rarr; `In Progress` &rarr; `Completed`: Admin App table and metrics update instantaneously in real-time!
