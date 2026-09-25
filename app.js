/**
 * Cooperative Service Marketplace – Cooperative Admin App
 * Complete Application Logic:
 * PART 1: Dashboard Metrics, Worker Verification & Skills, Appointments Workflow, Customers Directory, Cross-App Sync
 * PART 2: Service Management, Monthly Rate Management, Material Cost Management, Estimate Monitoring & Audit,
 *         Support Tickets, Worker Welfare Programs, Insurance Registry, 3-Way Chat Hub, Pre-Call Verification & Ledger
 */

(function () {
  'use strict';

  // ==============================================================
  // REAL-TIME CROSS-APP SYNCHRONIZATION BRIDGE
  // ==============================================================
  let marketplaceChannel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      marketplaceChannel = new BroadcastChannel('coop_marketplace_channel');
    }
  } catch (e) {
    console.warn('BroadcastChannel unavailable', e);
  }

  function broadcastMarketplace(action, payload) {
    const eventData = { action, payload, timestamp: Date.now() };
    if (marketplaceChannel) {
      try { marketplaceChannel.postMessage(eventData); } catch (e) {}
    }
    try {
      localStorage.setItem('coop_marketplace_event', JSON.stringify(eventData));
    } catch (e) {}
  }

  // ==============================================================
  // DATA STORE (PERSISTENT & ECOSYSTEM CONNECTED)
  // ==============================================================
  const state = {
    isAuthenticated: true, // Default to true for smooth immediate demo, or toggleable
    activeView: 'dashboard',
    currentSelectedWorkerId: null,
    currentSelectedBookingId: null,
    currentSelectedCustomerId: null,
    currentSelectedTicketId: 'TCK-801',
    workerFilter: 'ALL',
    appointmentTypeFilter: 'ALL',
    appointmentStatusFilter: 'ALL',

    // Part 2 View Filters
    servicesCategoryFilter: 'ALL',
    materialsCategoryFilter: 'ALL',
    estimatesFilter: 'ALL',
    ticketsCategoryFilter: 'ALL',
    welfareProgramFilter: 'ALL',
    insuranceStatusFilter: 'ALL',
    paymentsRangeFilter: 'Today',
    paymentsStatusFilter: 'ALL',

    // Active Chat state
    currentChatId: 'conv-1',
    currentChatPartyType: 'customer',
    currentChatPartyName: 'P. Vishnu Vardhan',
    currentChatPartyPhone: '+91 98480 22338',
    currentChatBookingId: 'CP-9104',


    // ==============================================================
    // PART 3 STATE EXTENSIONS: WORKFORCE, FORECAST & REPORTS
    // ==============================================================
    activeWorkforceSubtab: 'alloc', // 'alloc' | 'avail'
    activeForecastSubtab: 'demand', // 'demand' | 'planning'
    activeAllocationRequestId: 'CP-9104',
    activeReportId: 'WORKER_PERFORMANCE',
    reportDateFilter: '30_DAYS',
    reportTradeFilter: 'ALL',
    reportLocationFilter: 'ALL',

    // Active Requests Pool for Workforce Matching
    allocationRequests: {
      'CP-9104': {
        id: 'CP-9104',
        serviceTitle: 'Plumbing Leakage & Pipe Repair',
        category: 'Plumbing',
        location: 'Indiranagar, Sector 2',
        address: '#42, 4th Cross, 100 Feet Rd, Indiranagar',
        urgency: 'URGENT',
        urgencyBadge: 'badge-orange',
        customer: 'P. Vishnu Vardhan',
        phone: '+91 98480 22338',
        scheduledTime: 'Today, 11:30 AM',
        currentStatus: 'ALLOCATED',
        currentWorkerId: 'WRK-402'
      },
      'SOS-1092': {
        id: 'SOS-1092',
        serviceTitle: 'Main Electrical Spark & MCB Tripping',
        category: 'Electrical',
        location: 'Koramangala 4th Block',
        address: '#108, 80 Feet Road, Koramangala',
        urgency: 'EMERGENCY SOS',
        urgencyBadge: 'badge-red',
        customer: 'Ananya Sharma',
        phone: '+91 94481 00291',
        scheduledTime: 'Immediate Dispatch (<15 min)',
        currentStatus: 'PENDING_DISPATCH',
        currentWorkerId: 'WRK-108'
      },
      'CP-9208': {
        id: 'CP-9208',
        serviceTitle: 'Teakwood Bookshelf Assembly',
        category: 'Carpentry',
        location: 'HSR Layout Sector 1',
        address: '#24, 19th Main, Sector 1, HSR Layout',
        urgency: 'NORMAL',
        urgencyBadge: 'badge-blue',
        customer: 'Anil Kumble',
        phone: '+91 98450 11223',
        scheduledTime: 'Tomorrow, 10:00 AM',
        currentStatus: 'PENDING_ALLOCATION',
        currentWorkerId: null
      },
      'CP-8841': {
        id: 'CP-8841',
        serviceTitle: 'Deep Villa Sanitization & Water Tank Clean',
        category: 'Cleaning',
        location: 'Whitefield Inner Circle',
        address: '#314, Palm Meadows, Whitefield',
        urgency: 'NORMAL',
        urgencyBadge: 'badge-green',
        customer: 'Sunita Reddy',
        phone: '+91 97410 88219',
        scheduledTime: 'Yesterday, 09:00 AM',
        currentStatus: 'COMPLETED',
        currentWorkerId: 'WRK-315'
      }
    },

    // Availability Overview State
    workforceAvailability: {
      total: 48,
      online: 32,
      available: 19,
      assigned: 13,
      offline: 16,
      emergency: 8,
      trades: [
        { skill: 'Plumbing', total: 12, online: 8, assigned: 3, available: 5, color: '#1D4ED8' },
        { skill: 'Electrical', total: 10, online: 7, assigned: 3, available: 4, color: '#D97706' },
        { skill: 'Carpentry', total: 8, online: 5, assigned: 2, available: 3, color: '#7C3AED' },
        { skill: 'Painting', total: 6, online: 4, assigned: 1, available: 3, color: '#059669' },
        { skill: 'Cleaning', total: 7, online: 5, assigned: 3, available: 2, color: '#0284C7' },
        { skill: 'Appliance Repair', total: 5, online: 3, assigned: 1, available: 2, color: '#DB2777' }
      ],
      areas: [
        { name: 'Indiranagar', total: 14, online: 10, available: 6 },
        { name: 'Koramangala', total: 12, online: 9, available: 5 },
        { name: 'HSR Layout', total: 9, online: 6, available: 4 },
        { name: 'Whitefield', total: 8, online: 4, available: 2 },
        { name: 'Central / Jayanagar', total: 5, online: 3, available: 2 }
      ]
    },

    // AI Demand Forecast next 7 days state
    forecastDemand: {
      trades: [
        { trade: 'Plumbing', expectedJobs: 28, availableWorkers: 18, requiredWorkers: 25, gap: -7, trend: '+24%', demandLevel: 'High', confidence: 88, icon: 'wrench' },
        { trade: 'Electrical', expectedJobs: 24, availableWorkers: 16, requiredWorkers: 22, gap: -6, trend: '+18%', demandLevel: 'High', confidence: 86, icon: 'zap' },
        { trade: 'Carpentry', expectedJobs: 15, availableWorkers: 12, requiredWorkers: 14, gap: -2, trend: '+8%', demandLevel: 'Medium', confidence: 91, icon: 'hammer' },
        { trade: 'Painting', expectedJobs: 11, availableWorkers: 14, requiredWorkers: 10, gap: 4, trend: '-5%', demandLevel: 'Low', confidence: 84, icon: 'paint-bucket' },
        { trade: 'Cleaning', expectedJobs: 19, availableWorkers: 12, requiredWorkers: 18, gap: -6, trend: '+20%', demandLevel: 'High', confidence: 89, icon: 'sparkles' },
        { trade: 'Appliance Repair', expectedJobs: 14, availableWorkers: 10, requiredWorkers: 13, gap: -3, trend: '+12%', demandLevel: 'Medium', confidence: 87, icon: 'tool' },
        { trade: 'Other Services', expectedJobs: 8, availableWorkers: 8, requiredWorkers: 7, gap: 1, trend: '0%', demandLevel: 'Low', confidence: 82, icon: 'briefcase' }
      ],
      locations: [
        { area: 'Indiranagar', highDemandTrade: 'Plumbing & Drainage', expectedVolume: 34, surgeRisk: 'High (Pre-Monsoon)' },
        { area: 'Koramangala', highDemandTrade: 'Electrical & AC Cooling', expectedVolume: 29, surgeRisk: 'High (Grid Voltage Surges)' },
        { area: 'HSR Layout', highDemandTrade: 'Carpentry & Cabinetry', expectedVolume: 18, surgeRisk: 'Medium' },
        { area: 'Whitefield', highDemandTrade: 'Villa Sanitization & Plumbing', expectedVolume: 22, surgeRisk: 'Medium' },
        { area: 'Central Bengaluru', highDemandTrade: 'Appliance & Painting', expectedVolume: 14, surgeRisk: 'Low' }
      ],
      sevenDayDaily: [
        { day: 'Mon 24 Sep', count: 18, label: '18 jobs' },
        { day: 'Tue 25 Sep', count: 22, label: '22 jobs' },
        { day: 'Wed 26 Sep', count: 27, label: '27 jobs' },
        { day: 'Thu 27 Sep', count: 24, label: '24 jobs' },
        { day: 'Fri 28 Sep', count: 31, label: '31 jobs' },
        { day: 'Sat 29 Sep', count: 38, label: '38 jobs (Peak)' },
        { day: 'Sun 30 Sep', count: 42, label: '42 jobs (Weekend Peak)' }
      ]
    },

    // Candidate Location Inspection Modal active state
    activeInspectingCandidateId: null,

    // Admin Notifications List (10 Operational Alerts)
    adminNotifications: [
      {
        id: 'NOTIF-01',
        category: 'EMERGENCY_SOS',
        badge: 'red',
        title: 'Main Electrical Spark (#SOS-1092)',
        detail: 'Emergency request at Koramangala 4th Block. Immediate response required. Recommended: Vikram Sen (#108).',
        time: '2 mins ago',
        unread: true,
        view: 'workforce',
        subtab: 'alloc',
        requestId: 'SOS-1092'
      },
      {
        id: 'NOTIF-02',
        category: 'WORKFORCE_ALLOCATION',
        badge: 'orange',
        title: 'Artisan Allocation Pending (#CP-9104)',
        detail: 'Plumbing Leakage at Indiranagar awaiting worker confirmation. Ramesh Kumar ranked 98% match.',
        time: '12 mins ago',
        unread: true,
        view: 'workforce',
        subtab: 'alloc',
        requestId: 'CP-9104'
      },
      {
        id: 'NOTIF-03',
        category: 'INSURANCE_RENEWAL',
        badge: 'blue',
        title: 'Policy Renewal Due: Vikram Sen (#108)',
        detail: 'Cooperative Artisan Group Policy #POL-8841-COOP expires in 4 days. 1-Tap renewal pending.',
        time: '45 mins ago',
        unread: true,
        view: 'welfare',
        subtab: 'insurance',
        workerId: 'WRK-108'
      },
      {
        id: 'NOTIF-04',
        category: 'RATE_GOVERNANCE',
        badge: 'purple',
        title: 'October Rate Card Resolution (#B-2026-10)',
        detail: 'Board quorum requires 1 more signatory before publishing monthly revisions across 7 services.',
        time: '1 hour ago',
        unread: true,
        view: 'services',
        subtab: 'rates'
      },
      {
        id: 'NOTIF-05',
        category: 'ESTIMATE_AUDIT',
        badge: 'orange',
        title: 'High Estimate Flagged (#CP-9208)',
        detail: 'Suresh Patil submitted ₹2,650 estimate exceeding ₹2,000 threshold. Material markup verification required.',
        time: '2 hours ago',
        unread: true,
        view: 'services',
        subtab: 'estimates'
      },
      {
        id: 'NOTIF-06',
        category: 'DEMAND_FORECAST',
        badge: 'red',
        title: 'AI Forecast: 7-Artisan Plumbing Deficit',
        detail: 'Upcoming Saturday demand surge (38+ jobs). Recommend mobilizing standby artisans for Indiranagar.',
        time: '3 hours ago',
        unread: true,
        view: 'forecast',
        subtab: 'planning'
      },
      {
        id: 'NOTIF-07',
        category: 'WELFARE_CLAIM',
        badge: 'green',
        title: 'Benevolent Medical Aid Submitted (#WLF-409)',
        detail: 'Artisan Mohan Lal filed ₹15,000 family hospitalization reimbursement under Cooperative Welfare Scheme.',
        time: '4 hours ago',
        unread: true,
        view: 'welfare',
        subtab: 'programs'
      },
      {
        id: 'NOTIF-08',
        category: 'SUPPORT_TICKET',
        badge: 'blue',
        title: 'Customer Invoice Query (#TCK-801)',
        detail: 'P. Vishnu Vardhan requested clarification regarding GST itemization on completed invoice CP-9104.',
        time: '5 hours ago',
        unread: true,
        view: 'services',
        subtab: 'tickets'
      },
      {
        id: 'NOTIF-09',
        category: 'PAYMENTS_LEDGER',
        badge: 'green',
        title: 'Bi-Weekly Payout Batch Ready (#SETTLE-0926)',
        detail: 'Total ₹1,42,800 artisan payout ready for cooperative treasury ledger clearance.',
        time: '6 hours ago',
        unread: true,
        view: 'payments'
      },
      {
        id: 'NOTIF-10',
        category: 'WORKER_VERIFICATION',
        badge: 'blue',
        title: 'Trade Certificate Submitted: Anand Rao (#508)',
        detail: 'Uploaded Certified Wireman ITI accreditation license for administrative verification.',
        time: '8 hours ago',
        unread: true,
        view: 'workers',
        workerId: 'WRK-508'
      }
    ],

    // Cooperative Overview Statistics
    stats: {
      totalWorkers: 142,
      workersVerified: 128,
      workersPending: 14,
      activeJobs: 38,
      jobsInProgress: 18,
      jobsOnTheWay: 12,
      jobsEmergency: 8,
      todayBookings: 64,
      bookingsInstant: 28,
      bookingsPrebook: 26,
      bookingsEmergency: 10,
      availableWorkers: 96,
      workersOnline: 64,
      workersOffline: 12,
      workersAssigned: 20,
      totalServiceValue: 48650.00,
      workerDirectEarnings: 41352.50,
      cooperativeShare: 7297.50,
      pendingActions: 18
    },

    // Emergency Active State
    emergencyActive: {
      id: 'SOS-1092',
      service: 'Major Pipe Burst / Ceilings Flood',
      customerName: 'Ananya Sharma',
      customerPhone: '+91 98450 11223',
      location: 'Indiranagar 100ft Rd, Bengaluru',
      nearbyWorkersCount: 3,
      nearbyWorkerNames: ['Vikram Sen (#108)', 'Ramesh Kumar (#402)', 'Suresh Patil (#315)'],
      assignedWorker: null,
      status: 'Searching',
      responseTime: '< 15 mins target',
      timestamp: 'Just now'
    },

    // Registered Cooperative Workers (Matching Worker App profiles)
    workers: [
      {
        id: '402',
        name: 'Ramesh Kumar',
        phone: '+91 98450 40201',
        email: 'ramesh.kumar@coopguild.org',
        avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        primarySkill: 'Plumbing',
        secondarySkills: ['Pipe Repair', 'Water Pump Repair', 'Flush Valve Fix', 'Drainage Clearing'],
        experience: '6-10 years',
        serviceArea: 'Indiranagar & Domlur',
        applicationDate: '12 Jan 2024',
        verificationStatus: 'Approved',
        isOnline: true,
        isAssigned: true,
        emergencyReady: 'Available',
        maxDailyJobs: 5,
        rating: 4.9,
        reviewsCount: 142,
        completedJobs: 384,
        aadhaarMasked: 'XXXX-XXXX-4092',
        panMasked: 'ABCDE4092K',
        tradeCertificate: 'National Apprenticeship Certificate (NAC) - Master Plumber',
        bankAccountMasked: 'SBI •••• 9104 (IFSC: SBIN000402)',
        welfareBalance: 5000.00,
        insurancePolicy: 'Active (Group Health + Accident ₹5L)'
      },
      {
        id: '315',
        name: 'Suresh Patil',
        phone: '+91 98450 31502',
        email: 'suresh.patil@coopguild.org',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        primarySkill: 'Electrical',
        secondarySkills: ['Switchboard Wiring', 'MCB Tripping Fix', 'Fan Installation', 'Inverter Setup'],
        experience: '10+ years',
        serviceArea: 'Koramangala & HSR',
        applicationDate: '19 Feb 2024',
        verificationStatus: 'Approved',
        isOnline: true,
        isAssigned: false,
        emergencyReady: 'Available',
        maxDailyJobs: 6,
        rating: 4.8,
        reviewsCount: 98,
        completedJobs: 215,
        aadhaarMasked: 'XXXX-XXXX-3158',
        panMasked: 'BCDEF3158L',
        tradeCertificate: 'Wireman License Grade 1 - Karnataka Electrical Inspectorate',
        bankAccountMasked: 'Canara Bank •••• 3150 (IFSC: CNRB000315)',
        welfareBalance: 10000.00,
        insurancePolicy: 'Active (Covered under Artisan Life & Accident)'
      },
      {
        id: '108',
        name: 'Vikram Sen',
        phone: '+91 98450 10803',
        email: 'vikram.sen@coopguild.org',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        primarySkill: 'Plumbing',
        secondarySkills: ['Emergency Pipe Welding', 'High-Pressure Leakage', 'Drain Jetting'],
        experience: '3-5 years',
        serviceArea: 'Indiranagar & Ulsoor',
        applicationDate: '05 Mar 2024',
        verificationStatus: 'Approved',
        isOnline: true,
        isAssigned: false,
        emergencyReady: 'Available',
        maxDailyJobs: 4,
        rating: 4.7,
        reviewsCount: 52,
        completedJobs: 110,
        aadhaarMasked: 'XXXX-XXXX-1082',
        panMasked: 'CDEFG1082M',
        tradeCertificate: 'ITI Plumbing Trade Certificate - First Class',
        bankAccountMasked: 'HDFC Bank •••• 1080 (IFSC: HDFC000108)',
        welfareBalance: 0.00,
        insurancePolicy: 'Expiring Soon (04 Oct 2026)'
      },
      {
        id: '508',
        name: 'Anand Rao',
        phone: '+91 98450 50804',
        email: 'anand.rao@coopguild.org',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        primarySkill: 'Carpentry',
        secondarySkills: ['Door & Lock Repair', 'Furniture Assembly', 'Cabinet Hinges Fix'],
        experience: '6-10 years',
        serviceArea: 'Indiranagar & HAL',
        applicationDate: '14 Apr 2024',
        verificationStatus: 'Approved',
        isOnline: true,
        isAssigned: false,
        emergencyReady: 'Unavailable',
        maxDailyJobs: 4,
        rating: 4.9,
        reviewsCount: 88,
        completedJobs: 194,
        aadhaarMasked: 'XXXX-XXXX-5081',
        panMasked: 'DEFGH5081N',
        tradeCertificate: 'Karnataka Artisan Guild Registered Carpenter',
        bankAccountMasked: 'Bank of Baroda •••• 5080 (IFSC: BARB000508)',
        welfareBalance: 15000.00,
        insurancePolicy: 'Expiring Soon (12 Oct 2026)'
      },
      {
        id: '220',
        name: 'Rajesh Mistri',
        phone: '+91 98450 22005',
        email: 'rajesh.mistri@coopguild.org',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        primarySkill: 'Masonry',
        secondarySkills: ['Tile Jointing', 'Plastering & Crack Repair', 'Waterproofing'],
        experience: '10+ years',
        serviceArea: 'East Bengaluru',
        applicationDate: '28 Aug 2024',
        verificationStatus: 'Approved',
        isOnline: true,
        isAssigned: false,
        emergencyReady: 'Available',
        maxDailyJobs: 4,
        rating: 4.8,
        reviewsCount: 76,
        completedJobs: 165,
        aadhaarMasked: 'XXXX-XXXX-2209',
        panMasked: 'EFGHI2209P',
        tradeCertificate: 'Certified Mason Guild Certificate',
        bankAccountMasked: 'Union Bank •••• 2200 (IFSC: UBIN000220)',
        welfareBalance: 4500.00,
        insurancePolicy: 'Active (Cooperative Accident Scheme)'
      },
      {
        id: '612',
        name: 'Deepak Verma',
        phone: '+91 98450 61206',
        email: 'deepak.verma@coopguild.org',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        primarySkill: 'Appliance Repair',
        secondarySkills: ['Washing Machine Drum', 'Microwave Magnetron', 'Refrigerator Thermostat'],
        experience: '3-5 years',
        serviceArea: 'Koramangala & BTM',
        applicationDate: '10 Sep 2026',
        verificationStatus: 'Under Review',
        isOnline: false,
        isAssigned: false,
        emergencyReady: 'Unavailable',
        maxDailyJobs: 4,
        rating: 4.6,
        reviewsCount: 14,
        completedJobs: 28,
        aadhaarMasked: 'XXXX-XXXX-6124',
        panMasked: 'FGHIJ6124Q',
        tradeCertificate: 'Diploma in Consumer Electronics Repair',
        bankAccountMasked: 'Axis Bank •••• 6120 (IFSC: UTIB000612)',
        welfareBalance: 0.00,
        insurancePolicy: 'Under Cooperative Processing'
      },
      {
        id: '701',
        name: 'Mohammed Rizwan',
        phone: '+91 98450 70107',
        email: 'm.rizwan@coopguild.org',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        primarySkill: 'Electrical',
        secondarySkills: ['Concealed Wiring', 'LED Panel Lighting', 'Earthing Pit Setup'],
        experience: '1-2 years',
        serviceArea: 'Frazer Town & Shivaji Nagar',
        applicationDate: '21 Sep 2026',
        verificationStatus: 'Pending',
        isOnline: false,
        isAssigned: false,
        emergencyReady: 'Unavailable',
        maxDailyJobs: 3,
        rating: 0.0,
        reviewsCount: 0,
        completedJobs: 0,
        aadhaarMasked: 'XXXX-XXXX-7018',
        panMasked: 'GHIJK7018R',
        tradeCertificate: 'ITI Electrician Certificate (Verification Submitted)',
        bankAccountMasked: 'Canara Bank •••• 7010 (IFSC: CNRB000701)',
        welfareBalance: 0.00,
        insurancePolicy: 'Pending Approval'
      },
      {
        id: '702',
        name: 'Kiran Gowda',
        phone: '+91 98450 70208',
        email: 'kiran.gowda@coopguild.org',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        primarySkill: 'Plumbing',
        secondarySkills: ['Bathroom Sanitaryware', 'Overhead Tank Cleaning', 'Water Meter Fix'],
        experience: '3-5 years',
        serviceArea: 'Jayanagar & JP Nagar',
        applicationDate: '22 Sep 2026',
        verificationStatus: 'Pending',
        isOnline: false,
        isAssigned: false,
        emergencyReady: 'Available',
        maxDailyJobs: 4,
        rating: 0.0,
        reviewsCount: 0,
        completedJobs: 0,
        aadhaarMasked: 'XXXX-XXXX-7023',
        panMasked: 'HIJKL7023S',
        tradeCertificate: 'Karnataka Labour Welfare Board Skill Certificate',
        bankAccountMasked: 'State Bank of India •••• 7020 (IFSC: SBIN000702)',
        welfareBalance: 0.00,
        insurancePolicy: 'Pending Approval'
      }
    ],

    // Connected Appointments (Matching Customer & Worker App Booking IDs)
    appointments: [
      {
        id: 'CP-9104',
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        customerId: 'CUST-1049',
        service: 'Plumbing Leakage & Pipe Repair',
        subIssue: 'Tap & Mixer Leak • High pressure joint failure under main washbasin.',
        date: 'Today (23 Sep)',
        time: '11:30 AM',
        location: 'Indiranagar 100ft Rd, Bengaluru',
        requestType: 'INSTANT',
        status: 'Worker Assigned',
        workerId: '402',
        workerName: 'Ramesh Kumar',
        workerPhone: '+91 98450 40201',
        amount: 348.00,
        eta: '12 mins',
        materialsCost: 280.00,
        labourCost: 199.00,
        paymentStatus: 'Settled'
      },
      {
        id: 'CP-9208',
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        customerId: 'CUST-1049',
        service: 'Pipe Leakage & Joint Sealing',
        subIssue: 'Concealed pipe joint seepage in bathroom wall.',
        date: 'Tomorrow (24 Sep)',
        time: '11:30 AM – 01:30 PM',
        location: 'Indiranagar 100ft Rd, Bengaluru',
        requestType: 'PRE-BOOKING',
        status: 'Confirmed',
        workerId: '402',
        workerName: 'Ramesh Kumar',
        workerPhone: '+91 98450 40201',
        amount: 450.00,
        eta: 'Scheduled',
        materialsCost: 0.00,
        labourCost: 450.00,
        paymentStatus: 'Pending'
      },
      {
        id: 'SOS-1092',
        customerName: 'Ananya Sharma',
        customerPhone: '+91 98450 11223',
        customerId: 'CUST-1092',
        service: 'Major Pipe Burst / Ceilings Flood',
        subIssue: 'Main pipe connection fractured, flooding kitchen rapidly.',
        date: 'Today (23 Sep)',
        time: 'Just Now',
        location: 'Indiranagar 100ft Rd, Bengaluru',
        requestType: 'EMERGENCY',
        status: 'Requested',
        workerId: null,
        workerName: 'Unassigned',
        workerPhone: '',
        amount: 599.00,
        eta: '< 15 mins target',
        materialsCost: 0.00,
        labourCost: 599.00,
        paymentStatus: 'Pending'
      },
      {
        id: 'CP-8841',
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        customerId: 'CUST-1049',
        service: 'Plumbing Diagnostic & Cartridge Replacement',
        subIssue: 'Ceramic valve replacement with pressure test.',
        date: 'Today (23 Sep)',
        time: '10:00 AM',
        location: 'Indiranagar 100ft Rd, Bengaluru',
        requestType: 'INSTANT',
        status: 'In Progress',
        workerId: '402',
        workerName: 'Ramesh Kumar',
        workerPhone: '+91 98450 40201',
        amount: 479.00,
        eta: 'Repair Active',
        materialsCost: 280.00,
        labourCost: 199.00,
        paymentStatus: 'Settled'
      },
      {
        id: 'CP-8850',
        customerName: 'Karthik Reddy',
        customerPhone: '+91 98800 33445',
        customerId: 'CUST-1077',
        service: 'Washbasin Drainage Blockage',
        subIssue: 'Mechanical drain snake clearance and pipe flush.',
        date: 'Today (23 Sep)',
        time: '09:15 AM',
        location: 'Defense Colony, Indiranagar',
        requestType: 'INSTANT',
        status: 'Completed',
        workerId: '508',
        workerName: 'Anand Rao',
        workerPhone: '+91 98450 50804',
        amount: 249.00,
        eta: 'Completed',
        materialsCost: 0.00,
        labourCost: 249.00,
        paymentStatus: 'Settled'
      },
      {
        id: 'CP-8852',
        customerName: 'Deepa Krishnan',
        customerPhone: '+91 98450 11223',
        customerId: 'CUST-1011',
        service: 'Main Switchboard Spark & Trip Repair',
        subIssue: 'MCB breaker replacement and neutral load check.',
        date: 'Today (23 Sep)',
        time: '08:45 AM',
        location: 'Koramangala 4th Block, Bengaluru',
        requestType: 'INSTANT',
        status: 'Completed',
        workerId: '315',
        workerName: 'Suresh Patil',
        workerPhone: '+91 98450 31502',
        amount: 380.00,
        eta: 'Completed',
        materialsCost: 120.00,
        labourCost: 260.00,
        paymentStatus: 'Settled'
      }
    ],

    // Connected Customers
    customers: [
      {
        id: 'CUST-1049',
        name: 'P. Vishnu Vardhan',
        phone: '+91 98480 22338',
        email: 'vishnu@marketmail.com',
        location: 'Indiranagar 100ft Rd, Bengaluru',
        totalBookings: 6,
        activeBooking: 'CP-9104',
        completedJobs: 5,
        paymentStatus: 'Settled',
        patronageDividend: 420.00
      },
      {
        id: 'CUST-1092',
        name: 'Ananya Sharma',
        phone: '+91 98450 11223',
        email: 'ananya.sharma@gmail.com',
        location: 'Indiranagar 100ft Rd, Bengaluru',
        totalBookings: 4,
        activeBooking: 'SOS-1092',
        completedJobs: 3,
        paymentStatus: 'Pending',
        patronageDividend: 280.00
      },
      {
        id: 'CUST-1011',
        name: 'Deepa Krishnan',
        phone: '+91 98450 11223',
        email: 'deepa.k@yahoo.com',
        location: 'Koramangala 4th Block, Bengaluru',
        totalBookings: 5,
        activeBooking: 'None',
        completedJobs: 5,
        paymentStatus: 'Settled',
        patronageDividend: 350.00
      },
      {
        id: 'CUST-1077',
        name: 'Karthik Reddy',
        phone: '+91 98800 33445',
        email: 'karthik.r@techcorp.in',
        location: 'Defense Colony, Indiranagar',
        totalBookings: 3,
        activeBooking: 'None',
        completedJobs: 3,
        paymentStatus: 'Settled',
        patronageDividend: 190.00
      },
      {
        id: 'CUST-1034',
        name: 'Priya Venkatesh',
        phone: '+91 98450 77112',
        email: 'priya.venkat@gmail.com',
        location: 'HAL 2nd Stage, Bengaluru',
        totalBookings: 8,
        activeBooking: 'None',
        completedJobs: 8,
        paymentStatus: 'Settled',
        patronageDividend: 540.00
      }
    ],

    // Monthly Rates Board State
    ratesBoard: {
      currentMonth: 'September 2026',
      effectiveDate: '01 September 2026',
      resolutionNo: 'RES-COOP-2026/09-B4',
      status: 'Approved',
      approvedBy: 'Board of Directors (General Body Ratified)',
      notes: 'Adjusted for artisan inflation index & fuel allowance; protected 85% artisan take-home share.'
    },

    // 7 Trade Divisions & Services Catalog
    services: [
      {
        id: 'SVC-PL-01',
        name: 'Plumbing Leakage & Pipe Repair',
        category: 'Plumbing',
        description: 'Comprehensive inspection, tap & mixer servicing, leak isolation, high-pressure pipe repair.',
        requiredSkill: 'Certified Plumber',
        estimatedTime: '45 - 90 mins',
        basePrice: 380.00,
        previousPrice: 350.00,
        emergencyCharge: 599.00,
        materialCategory: 'Pipes, Fittings, Valves, Sealants',
        status: 'Active',
        history: [
          { month: 'June 2026', rate: 330.00, approvedBy: 'Board Res #B-2026-06', change: '+₹0' },
          { month: 'July 2026', rate: 350.00, approvedBy: 'Board Res #B-2026-07', change: '+₹20' },
          { month: 'August 2026', rate: 350.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 380.00, approvedBy: 'Board Res #B-2026-09', change: '+₹30' }
        ]
      },
      {
        id: 'SVC-PL-02',
        name: 'Pipe Joint Sealing & Gasket Overhaul',
        category: 'Plumbing',
        description: 'Concealed wall joints, compression fittings, Teflon seal replacement with pressure test.',
        requiredSkill: 'Certified Plumber',
        estimatedTime: '60 - 120 mins',
        basePrice: 450.00,
        previousPrice: 420.00,
        emergencyCharge: 650.00,
        materialCategory: 'Brass Connectors, Flanges, O-rings',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 420.00, approvedBy: 'Board Res #B-2026-07', change: '+₹20' },
          { month: 'August 2026', rate: 420.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 450.00, approvedBy: 'Board Res #B-2026-09', change: '+₹30' }
        ]
      },
      {
        id: 'SVC-EL-01',
        name: 'Electrical Switchboard Overhaul',
        category: 'Electrical',
        description: 'Complete inspection of gang boxes, rewire loose neutral, modular switch & socket replacement.',
        requiredSkill: 'Licensed Electrician',
        estimatedTime: '45 - 75 mins',
        basePrice: 320.00,
        previousPrice: 290.00,
        emergencyCharge: 550.00,
        materialCategory: 'Switches, Sockets, FR Wires',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 290.00, approvedBy: 'Board Res #B-2026-07', change: '+₹15' },
          { month: 'August 2026', rate: 290.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 320.00, approvedBy: 'Board Res #B-2026-09', change: '+₹30' }
        ]
      },
      {
        id: 'SVC-EL-02',
        name: 'Main Switchboard Spark & MCB Trip Repair',
        category: 'Electrical',
        description: 'Diagnose breaker trips, replace damaged MCB/RCCB, ensure proper phase balancing and earthing.',
        requiredSkill: 'Master Electrician',
        estimatedTime: '60 - 90 mins',
        basePrice: 380.00,
        previousPrice: 350.00,
        emergencyCharge: 599.00,
        materialCategory: 'MCB Breakers, Busbars, Earthing Wires',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 350.00, approvedBy: 'Board Res #B-2026-07', change: '+₹25' },
          { month: 'August 2026', rate: 350.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 380.00, approvedBy: 'Board Res #B-2026-09', change: '+₹30' }
        ]
      },
      {
        id: 'SVC-CR-01',
        name: 'Wooden Door / Lock Repair & Alignment',
        category: 'Carpentry',
        description: 'Fix stuck doors, plane uneven edges, align latches, mortise lock installation.',
        requiredSkill: 'Certified Carpenter',
        estimatedTime: '60 - 90 mins',
        basePrice: 350.00,
        previousPrice: 320.00,
        emergencyCharge: 550.00,
        materialCategory: 'Hinges, Screws, Latches, Mortise Locks',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 320.00, approvedBy: 'Board Res #B-2026-07', change: '+₹20' },
          { month: 'August 2026', rate: 320.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 350.00, approvedBy: 'Board Res #B-2026-09', change: '+₹30' }
        ]
      },
      {
        id: 'SVC-CR-02',
        name: 'Cabinet Hinge & Shutter Realignment',
        category: 'Carpentry',
        description: 'Hydraulic / soft-close kitchen hinge adjustment, channel slide replacement.',
        requiredSkill: 'Skilled Carpenter',
        estimatedTime: '45 - 60 mins',
        basePrice: 280.00,
        previousPrice: 260.00,
        emergencyCharge: 450.00,
        materialCategory: 'Soft-Close Hinges, Drawer Channels',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 260.00, approvedBy: 'Board Res #B-2026-07', change: '+₹10' },
          { month: 'August 2026', rate: 260.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 280.00, approvedBy: 'Board Res #B-2026-09', change: '+₹20' }
        ]
      },
      {
        id: 'SVC-PT-01',
        name: 'Interior Wall Painting & Touch-up',
        category: 'Painting',
        description: 'Putty application, crack sanding, two-coat premium emulsion touch up for rooms/hall.',
        requiredSkill: 'Master Painter',
        estimatedTime: '120 - 240 mins',
        basePrice: 550.00,
        previousPrice: 500.00,
        emergencyCharge: 800.00,
        materialCategory: 'Emulsion Paint, Wall Putty, Primer',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 500.00, approvedBy: 'Board Res #B-2026-07', change: '+₹30' },
          { month: 'August 2026', rate: 500.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 550.00, approvedBy: 'Board Res #B-2026-09', change: '+₹50' }
        ]
      },
      {
        id: 'SVC-PT-02',
        name: 'Waterproof Damp Wall Treatment',
        category: 'Painting',
        description: 'Dampness proofing, chemical polymer seal application, anti-fungal barrier coat.',
        requiredSkill: 'Waterproofing Specialist',
        estimatedTime: '90 - 180 mins',
        basePrice: 650.00,
        previousPrice: 600.00,
        emergencyCharge: 950.00,
        materialCategory: 'Waterproofing Polymers, Membrane Tape',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 600.00, approvedBy: 'Board Res #B-2026-07', change: '+₹40' },
          { month: 'August 2026', rate: 600.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 650.00, approvedBy: 'Board Res #B-2026-09', change: '+₹50' }
        ]
      },
      {
        id: 'SVC-CL-01',
        name: 'Deep Home Cleaning & Disinfection',
        category: 'Cleaning',
        description: 'Floor scrubbing with single-disc machine, window track de-griming, balcony sanitization.',
        requiredSkill: 'Cleaning Specialist',
        estimatedTime: '180 - 300 mins',
        basePrice: 850.00,
        previousPrice: 800.00,
        emergencyCharge: 1200.00,
        materialCategory: 'Biodegradable Chemicals, Microfiber Pads',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 800.00, approvedBy: 'Board Res #B-2026-07', change: '+₹50' },
          { month: 'August 2026', rate: 800.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 850.00, approvedBy: 'Board Res #B-2026-09', change: '+₹50' }
        ]
      },
      {
        id: 'SVC-CL-02',
        name: 'Bathroom & Tile De-scaling Deep Clean',
        category: 'Cleaning',
        description: 'Acid-free tile stain removal, grouting rejuvenation, chrome fixture de-scaling.',
        requiredSkill: 'Cleaning Technician',
        estimatedTime: '60 - 90 mins',
        basePrice: 350.00,
        previousPrice: 320.00,
        emergencyCharge: 500.00,
        materialCategory: 'Scale Removers, Grout Cleaners',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 320.00, approvedBy: 'Board Res #B-2026-07', change: '+₹20' },
          { month: 'August 2026', rate: 320.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 350.00, approvedBy: 'Board Res #B-2026-09', change: '+₹30' }
        ]
      },
      {
        id: 'SVC-AP-01',
        name: 'Washing Machine Drum & Motor Diagnostics',
        category: 'Appliance Repair',
        description: 'Front/top-load drain pump, spin motor, PCB sensor error diagnostics and repair.',
        requiredSkill: 'Appliance Technician',
        estimatedTime: '60 - 90 mins',
        basePrice: 420.00,
        previousPrice: 380.00,
        emergencyCharge: 650.00,
        materialCategory: 'Drain Pumps, Inlet Valves, Capacitors',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 380.00, approvedBy: 'Board Res #B-2026-07', change: '+₹30' },
          { month: 'August 2026', rate: 380.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 420.00, approvedBy: 'Board Res #B-2026-09', change: '+₹40' }
        ]
      },
      {
        id: 'SVC-AP-02',
        name: 'Refrigerator Cooling & Compressor Check',
        category: 'Appliance Repair',
        description: 'Frost-free defrost thermostat, relay overload, refrigerant pressure verification.',
        requiredSkill: 'HVAC / Appliance Tech',
        estimatedTime: '60 - 90 mins',
        basePrice: 450.00,
        previousPrice: 400.00,
        emergencyCharge: 700.00,
        materialCategory: 'Relays, Thermostats, Gas Refill',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 400.00, approvedBy: 'Board Res #B-2026-07', change: '+₹30' },
          { month: 'August 2026', rate: 400.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 450.00, approvedBy: 'Board Res #B-2026-09', change: '+₹50' }
        ]
      },
      {
        id: 'SVC-OT-01',
        name: 'Masonry Plaster & Tile Jointing Fix',
        category: 'Other Services',
        description: 'Crack patching, broken tile replacement, cement plastering, sill repair.',
        requiredSkill: 'Mason Artisan',
        estimatedTime: '90 - 150 mins',
        basePrice: 400.00,
        previousPrice: 380.00,
        emergencyCharge: 600.00,
        materialCategory: 'White Cement, Sand Mortar, Tile Adhesive',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 380.00, approvedBy: 'Board Res #B-2026-07', change: '+₹20' },
          { month: 'August 2026', rate: 380.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 400.00, approvedBy: 'Board Res #B-2026-09', change: '+₹20' }
        ]
      },
      {
        id: 'SVC-OT-02',
        name: 'General Handyman Minor Fixes (Multi-trade)',
        category: 'Other Services',
        description: 'Curtain rod hanging, mirror mounting, picture hanging, minor sealing.',
        requiredSkill: 'Certified Handyman',
        estimatedTime: '30 - 60 mins',
        basePrice: 250.00,
        previousPrice: 220.00,
        emergencyCharge: 400.00,
        materialCategory: 'Wall Plugs, Anchor Bolts, Brackets',
        status: 'Active',
        history: [
          { month: 'July 2026', rate: 220.00, approvedBy: 'Board Res #B-2026-07', change: '+₹10' },
          { month: 'August 2026', rate: 220.00, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
          { month: 'September 2026', rate: 250.00, approvedBy: 'Board Res #B-2026-09', change: '+₹30' }
        ]
      }
    ],

    // Materials Catalogue with Transparent Cooperative Rates
    materials: [
      {
        id: 'MAT-101',
        name: 'PVC Pipe 1-inch Heavy Gauge (10ft)',
        category: 'Plumbing',
        previousCost: 120.00,
        currentCost: 135.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 115.00 },
          { month: 'August 2026', cost: 120.00 },
          { month: 'September 2026', cost: 135.00 }
        ]
      },
      {
        id: 'MAT-102',
        name: 'Teflon Thread Seal Tape (12mm x 10m)',
        category: 'Plumbing',
        previousCost: 20.00,
        currentCost: 25.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 20.00 },
          { month: 'August 2026', cost: 20.00 },
          { month: 'September 2026', cost: 25.00 }
        ]
      },
      {
        id: 'MAT-103',
        name: 'Brass Concealed Stop Cock 1/2-inch',
        category: 'Plumbing',
        previousCost: 420.00,
        currentCost: 450.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 400.00 },
          { month: 'August 2026', cost: 420.00 },
          { month: 'September 2026', cost: 450.00 }
        ]
      },
      {
        id: 'MAT-104',
        name: 'Submersible Water Booster Pump 0.5HP',
        category: 'Plumbing',
        previousCost: 3100.00,
        currentCost: 3200.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 3000.00 },
          { month: 'August 2026', cost: 3100.00 },
          { month: 'September 2026', cost: 3200.00 }
        ]
      },
      {
        id: 'MAT-105',
        name: 'Copper Wire 2.5 sq mm FR (90m coil)',
        category: 'Electrical',
        previousCost: 1750.00,
        currentCost: 1820.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 1700.00 },
          { month: 'August 2026', cost: 1750.00 },
          { month: 'September 2026', cost: 1820.00 }
        ]
      },
      {
        id: 'MAT-106',
        name: 'Modular Switch 16A Single Pole',
        category: 'Electrical',
        previousCost: 60.00,
        currentCost: 65.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 55.00 },
          { month: 'August 2026', cost: 60.00 },
          { month: 'September 2026', cost: 65.00 }
        ]
      },
      {
        id: 'MAT-107',
        name: 'Weatherproof Exterior Emulsion (1 Litre)',
        category: 'Painting',
        previousCost: 420.00,
        currentCost: 450.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 400.00 },
          { month: 'August 2026', cost: 420.00 },
          { month: 'September 2026', cost: 450.00 }
        ]
      },
      {
        id: 'MAT-108',
        name: 'Heavy-Duty Enzymatic Drain Cleaner (500ml)',
        category: 'Plumbing',
        previousCost: 200.00,
        currentCost: 220.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 190.00 },
          { month: 'August 2026', cost: 200.00 },
          { month: 'September 2026', cost: 220.00 }
        ]
      },
      {
        id: 'MAT-109',
        name: 'Heavy Duty Soft-Close Cabinet Hinge Pair',
        category: 'Carpentry',
        previousCost: 180.00,
        currentCost: 195.00,
        month: 'Sep 2026',
        status: 'In Stock',
        history: [
          { month: 'July 2026', cost: 175.00 },
          { month: 'August 2026', cost: 180.00 },
          { month: 'September 2026', cost: 195.00 }
        ]
      }
    ],

    // Estimates connecting directly to existing bookings
    estimates: [
      {
        bookingId: 'CP-9104',
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        workerName: 'Ramesh Kumar',
        workerId: '402',
        workerTrade: 'Plumbing',
        service: 'Plumbing Leakage & Pipe Repair',
        problemDesc: 'Tap & Mixer Leak • High pressure joint failure under main washbasin.',
        labourCost: 199.00,
        materialsCost: 280.00,
        materialDetails: 'Teflon Tape (₹25) + Heavy Duty Brass Joint (₹255)',
        totalEstimate: 479.00,
        status: 'Customer Approved',
        auditStatus: 'Passed',
        auditNotes: 'Verified against Standard Rate Card.'
      },
      {
        bookingId: 'CP-8841',
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        workerName: 'Ramesh Kumar',
        workerId: '402',
        workerTrade: 'Plumbing',
        service: 'Plumbing Diagnostic & Cartridge Replacement',
        problemDesc: 'Ceramic valve replacement with pressure test.',
        labourCost: 199.00,
        materialsCost: 280.00,
        materialDetails: 'Ceramic Cartridge Replacement Kit (₹280)',
        totalEstimate: 479.00,
        status: 'Customer Approved',
        auditStatus: 'Passed',
        auditNotes: 'Standard diagnostic & parts verified.'
      },
      {
        bookingId: 'CP-8850',
        customerName: 'Karthik Reddy',
        customerPhone: '+91 98800 33445',
        workerName: 'Anand Rao',
        workerId: '508',
        workerTrade: 'Plumbing',
        service: 'Washbasin Drainage Blockage',
        problemDesc: 'Mechanical drain snake clearance and pipe flush.',
        labourCost: 249.00,
        materialsCost: 0.00,
        materialDetails: 'None (Mechanical snake clearing)',
        totalEstimate: 249.00,
        status: 'Customer Approved',
        auditStatus: 'Passed',
        auditNotes: 'Labour-only booking.'
      },
      {
        bookingId: 'CP-8852',
        customerName: 'Deepa Krishnan',
        customerPhone: '+91 98450 11223',
        workerName: 'Suresh Patil',
        workerId: '315',
        workerTrade: 'Electrical',
        service: 'Main Switchboard Spark & Trip Repair',
        problemDesc: 'MCB breaker replacement and neutral load check.',
        labourCost: 260.00,
        materialsCost: 120.00,
        materialDetails: 'Modular MCB Breaker 16A (₹65 x 1) + Wiring connector (₹55)',
        totalEstimate: 380.00,
        status: 'Customer Approved',
        auditStatus: 'Passed',
        auditNotes: 'Standard rate compliance.'
      },
      {
        bookingId: 'SOS-1092',
        customerName: 'Ananya Sharma',
        customerPhone: '+91 98450 11223',
        workerName: 'Vikram Sen',
        workerId: '108',
        workerTrade: 'Plumbing',
        service: 'Major Pipe Burst / Ceilings Flood',
        problemDesc: 'Main pipe connection fractured, flooding kitchen rapidly.',
        labourCost: 599.00,
        materialsCost: 0.00,
        materialDetails: 'Emergency Isolation Phase (Parts pending post-isolation)',
        totalEstimate: 599.00,
        status: 'Pending Customer Approval',
        auditStatus: 'Passed',
        auditNotes: 'Emergency priority tariff.'
      }
    ],

    // Customer Support Tickets
    tickets: [
      {
        id: 'TCK-801',
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        customerId: 'CUST-1049',
        bookingId: 'CP-9104',
        category: 'Booking Issue',
        subject: 'Clarification on material charge for concealed pipe joint',
        priority: 'High',
        status: 'In Progress',
        assignedTo: 'Admin Murthy (Desk Lead)',
        date: 'Today, 11:45 AM',
        lastActivity: '10 mins ago',
        notes: 'Customer inquired about why Teflon and brass elbow were billed. Admin explained high-pressure requirements; customer was satisfied.'
      },
      {
        id: 'TCK-802',
        customerName: 'Ananya Sharma',
        customerPhone: '+91 98450 11223',
        customerId: 'CUST-1092',
        bookingId: 'SOS-1092',
        category: 'Emergency Support',
        subject: 'Urgent technician ETA update needed for water burst',
        priority: 'Critical',
        status: 'Open',
        assignedTo: 'Emergency Dispatch Desk',
        date: 'Today, 12:15 PM',
        lastActivity: '3 mins ago',
        notes: 'Indiranagar 100ft Rd water pipe burst. Dispatched Vikram Sen on priority. Live location tracking enabled.'
      },
      {
        id: 'TCK-803',
        customerName: 'Karthik Reddy',
        customerPhone: '+91 98800 33445',
        customerId: 'CUST-1077',
        bookingId: 'CP-8850',
        category: 'Payment Issue',
        subject: 'Digital receipt copy requested for society reimbursement',
        priority: 'Medium',
        status: 'Resolved',
        assignedTo: 'Finance Desk',
        date: 'Yesterday, 04:30 PM',
        lastActivity: 'Yesterday',
        notes: 'Official cooperative tax receipt generated and emailed to karthik.r@techcorp.in.'
      }
    ],

    // Worker Welfare Programs & Disbursals
    welfareWorkers: [
      {
        workerId: '402',
        workerName: 'Ramesh Kumar',
        trade: 'Plumbing',
        welfareTier: 'Tier 1 Master Artisan',
        monthlyContribution: 150.00,
        totalDisbursed: 5000.00,
        status: 'Active Patron',
        lastBenefit: 'Tool Modernization Subsidy (₹5,000)'
      },
      {
        workerId: '315',
        workerName: 'Suresh Patil',
        trade: 'Electrical',
        welfareTier: 'Tier 1 Master Artisan',
        monthlyContribution: 150.00,
        totalDisbursed: 10000.00,
        status: 'Active Patron',
        lastBenefit: 'Artisan Children Education Grant (₹10,000)'
      },
      {
        workerId: '108',
        workerName: 'Vikram Sen',
        trade: 'Plumbing',
        welfareTier: 'Tier 2 Certified Artisan',
        monthlyContribution: 150.00,
        totalDisbursed: 0.00,
        status: 'Eligible',
        lastBenefit: 'None'
      },
      {
        workerId: '508',
        workerName: 'Anand Rao',
        trade: 'Carpentry',
        welfareTier: 'Tier 2 Certified Artisan',
        monthlyContribution: 150.00,
        totalDisbursed: 15000.00,
        status: 'Active Loan Repayment',
        lastBenefit: 'Monsoon Emergency Loan (₹15,000)'
      },
      {
        workerId: '220',
        workerName: 'Rajesh Mistri',
        trade: 'Masonry',
        welfareTier: 'Tier 1 Artisan',
        monthlyContribution: 150.00,
        totalDisbursed: 4500.00,
        status: 'Active Patron',
        lastBenefit: 'Safety Helmet & Boots Subsidy (₹4,500)'
      }
    ],

    welfareHistory: [
      {
        date: '18 Sep 2026',
        workerName: 'Suresh Patil (#315)',
        program: 'Artisan Children Education Scholarship',
        amount: 10000.00,
        resolutionNote: 'Res #EDU-2026/08 - Approved for B.Sc engineering admission',
        status: 'Disbursed'
      },
      {
        date: '10 Sep 2026',
        workerName: 'Anand Rao (#508)',
        program: 'Monsoon Emergency Relief Loan (0% Int)',
        amount: 15000.00,
        resolutionNote: 'Res #MON-2026/09 - 0% interest disaster relief, 12 mo tenure',
        status: 'Disbursed'
      },
      {
        date: '02 Sep 2026',
        workerName: 'Ramesh Kumar (#402)',
        program: 'Artisan Tool Modernization Grant',
        amount: 5000.00,
        resolutionNote: 'Res #TOOL-2026/09 - Electric pipe crimper subsidy',
        status: 'Disbursed'
      },
      {
        date: '28 Aug 2026',
        workerName: 'Rajesh Mistri (#220)',
        program: 'Artisan Safety Equipment Subsidy',
        amount: 4500.00,
        resolutionNote: 'Res #SAFE-2026/08 - Certified safety harness & footwear',
        status: 'Disbursed'
      }
    ],

    // Worker Insurance Registry
    insurance: [
      {
        id: 'INS-402',
        workerId: '402',
        workerName: 'Ramesh Kumar',
        trade: 'Plumbing',
        policyNo: 'GI-COOP-40291',
        provider: 'National Insurance (Co-op Pool)',
        policyType: 'Group Accident & Disability',
        coverage: '₹5,00,000 Cover',
        expiryDate: '15 Dec 2026',
        status: 'Active'
      },
      {
        id: 'INS-315',
        workerId: '315',
        workerName: 'Suresh Patil',
        trade: 'Electrical',
        policyNo: 'GI-COOP-31512',
        provider: 'United India Insurance',
        policyType: 'High-Voltage Electrical Cover',
        coverage: '₹5,00,000 Cover',
        expiryDate: '28 Nov 2026',
        status: 'Active'
      },
      {
        id: 'INS-108',
        workerId: '108',
        workerName: 'Vikram Sen',
        trade: 'Plumbing',
        policyNo: 'GI-COOP-10844',
        provider: 'United India Insurance',
        policyType: 'Group Accident & Emergency',
        coverage: '₹5,00,000 Cover',
        expiryDate: '04 Oct 2026',
        status: 'Expiring Soon'
      },
      {
        id: 'INS-508',
        workerId: '508',
        workerName: 'Anand Rao',
        trade: 'Carpentry',
        policyNo: 'GI-COOP-50882',
        provider: 'National Insurance (Co-op Pool)',
        policyType: 'Artisan Health & Accidental',
        coverage: '₹3,00,000 Cover',
        expiryDate: '12 Oct 2026',
        status: 'Expiring Soon'
      },
      {
        id: 'INS-220',
        workerId: '220',
        workerName: 'Rajesh Mistri',
        trade: 'Masonry',
        policyNo: 'GI-COOP-22019',
        provider: 'Oriental Insurance Co.',
        policyType: 'Construction & Masonry Cover',
        coverage: '₹5,00,000 Cover',
        expiryDate: '20 Jan 2027',
        status: 'Active'
      }
    ],

    // 3-Way Chat Conversations
    conversations: [
      {
        id: 'conv-1',
        targetId: 'CUST-1049',
        name: 'P. Vishnu Vardhan',
        phone: '+91 98480 22338',
        role: 'Customer',
        type: 'customer',
        bookingId: 'CP-9104',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        unread: 1,
        lastTime: '11:42 AM',
        lastMessage: 'Is he carrying the brass connector and Teflon seal tape?',
        messages: [
          { sender: 'customer', name: 'P. Vishnu Vardhan', time: '11:35 AM', text: 'Hello, I booked plumbing service CP-9104. Is the technician on the way?' },
          { sender: 'admin', name: 'Admin Murthy', time: '11:37 AM', text: 'Namaste Vishnu ji, Ramesh Kumar (#402) has been assigned and is 12 mins away.' },
          { sender: 'customer', name: 'P. Vishnu Vardhan', time: '11:42 AM', text: 'Thank you! Is he carrying the brass connector and Teflon seal tape?' }
        ]
      },
      {
        id: 'conv-2',
        targetId: '402',
        name: 'Ramesh Kumar',
        phone: '+91 98450 40201',
        role: 'Worker #402',
        type: 'worker',
        bookingId: 'CP-9104',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        unread: 0,
        lastTime: '11:44 AM',
        lastMessage: 'Arriving in 5 mins. Tool kit and parts ready.',
        messages: [
          { sender: 'admin', name: 'Admin Desk', time: '11:31 AM', text: 'Ramesh, instant booking CP-9104 assigned at Indiranagar 100ft Rd.' },
          { sender: 'worker', name: 'Ramesh Kumar', time: '11:33 AM', text: 'Understood. Heading now with heavy plumbing kit.' },
          { sender: 'worker', name: 'Ramesh Kumar', time: '11:44 AM', text: 'Arriving in 5 mins. Tool kit and parts ready.' }
        ]
      },
      {
        id: 'conv-3',
        targetId: 'CUST-1092',
        name: 'Ananya Sharma',
        phone: '+91 98450 11223',
        role: 'Customer',
        type: 'customer',
        bookingId: 'SOS-1092',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        unread: 2,
        lastTime: '12:12 PM',
        lastMessage: 'Water is leaking into the main electric box!',
        messages: [
          { sender: 'customer', name: 'Ananya Sharma', time: '12:10 PM', text: 'EMERGENCY: Ceiling pipe burst in kitchen!' },
          { sender: 'customer', name: 'Ananya Sharma', time: '12:12 PM', text: 'Water is leaking into the main electric box!' },
          { sender: 'admin', name: 'Admin Desk', time: '12:13 PM', text: 'Please turn off the main water valve and main MCB trip immediately! Vikram Sen (#108) is responding on priority.' }
        ]
      },
      {
        id: 'conv-4',
        targetId: '108',
        name: 'Vikram Sen',
        phone: '+91 98450 10803',
        role: 'Worker #108',
        type: 'worker',
        bookingId: 'SOS-1092',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        unread: 0,
        lastTime: '12:14 PM',
        lastMessage: 'Acknowledged SOS. On motorbike with emergency pump.',
        messages: [
          { sender: 'admin', name: 'Admin Desk', time: '12:13 PM', text: 'Vikram! Priority SOS-1092 at Indiranagar 100ft Rd. Major water burst.' },
          { sender: 'worker', name: 'Vikram Sen', time: '12:14 PM', text: 'Acknowledged SOS. On motorbike with emergency pump.' }
        ]
      }
    ],

    // Payments & Cooperative Ledger
    payments: [
      {
        txnId: 'TXN-9021',
        bookingId: 'CP-9104',
        customerName: 'P. Vishnu Vardhan',
        workerName: 'Ramesh Kumar',
        workerTrade: 'Plumbing',
        grossAmount: 479.00,
        workerShare: 407.15,
        coopShare: 71.85,
        mode: 'UPI / PhonePe',
        status: 'Settled',
        timestamp: 'Today, 11:55 AM',
        dateFilter: 'Today'
      },
      {
        txnId: 'TXN-8841',
        bookingId: 'CP-8841',
        customerName: 'P. Vishnu Vardhan',
        workerName: 'Ramesh Kumar',
        workerTrade: 'Plumbing',
        grossAmount: 479.00,
        workerShare: 407.15,
        coopShare: 71.85,
        mode: 'Co-op Wallet',
        status: 'Settled',
        timestamp: 'Today, 10:45 AM',
        dateFilter: 'Today'
      },
      {
        txnId: 'TXN-8850',
        bookingId: 'CP-8850',
        customerName: 'Karthik Reddy',
        workerName: 'Anand Rao',
        workerTrade: 'Plumbing',
        grossAmount: 249.00,
        workerShare: 211.65,
        coopShare: 37.35,
        mode: 'Cash on Site',
        status: 'Settled',
        timestamp: 'Today, 09:50 AM',
        dateFilter: 'Today'
      },
      {
        txnId: 'TXN-8852',
        bookingId: 'CP-8852',
        customerName: 'Deepa Krishnan',
        workerName: 'Suresh Patil',
        workerTrade: 'Electrical',
        grossAmount: 380.00,
        workerShare: 323.00,
        coopShare: 57.00,
        mode: 'UPI / GPay',
        status: 'Settled',
        timestamp: 'Today, 09:20 AM',
        dateFilter: 'Today'
      },
      {
        txnId: 'TXN-8799',
        bookingId: 'CP-8799',
        customerName: 'Priya Venkatesh',
        workerName: 'Rajesh Mistri',
        workerTrade: 'Masonry',
        grossAmount: 650.00,
        workerShare: 552.50,
        coopShare: 97.50,
        mode: 'Co-op Wallet',
        status: 'Settled',
        timestamp: 'Yesterday, 04:30 PM',
        dateFilter: 'This Week'
      },
      {
        txnId: 'TXN-8740',
        bookingId: 'CP-8740',
        customerName: 'Karthik Reddy',
        workerName: 'Vikram Sen',
        workerTrade: 'Plumbing',
        grossAmount: 520.00,
        workerShare: 442.00,
        coopShare: 78.00,
        mode: 'UPI / PhonePe',
        status: 'Settled',
        timestamp: '19 Sep 2026',
        dateFilter: 'This Month'
      }
    ]
  };

  // ==============================================================
  // UI UTILITIES & TOAST ALERTS
  // ==============================================================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-alert ${type}`;

    let iconName = 'check-circle-2';
    if (type === 'emergency') iconName = 'siren';
    else if (type === 'info') iconName = 'info';
    else if (type === 'warning') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
      <div style="flex: 1; line-height: 1.35;">${message}</div>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      modal.classList.add('active');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      modal.classList.remove('active');
    }
  }

  function openDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    if (drawer) {
      drawer.classList.add('open');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function closeDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    if (drawer) drawer.classList.remove('open');
  }

  // ==============================================================
  // NAVIGATION & VIEW SWITCHER
  // ==============================================================
  function navigateTo(viewId, filterArg = null) {
    state.activeView = viewId;

    // Update Sidebar Active Nav
    document.querySelectorAll('.admin-sidebar .nav-item').forEach(item => {
      if (item.dataset.nav === viewId) item.classList.add('active');
      else item.classList.remove('active');
    });

    // Update Sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) targetSection.classList.add('active');

    // Update Header Breadcrumbs
    const headerTitle = document.getElementById('header-view-title');
    const headerBreadcrumb = document.getElementById('header-breadcrumb-current');

    const titles = {
      'dashboard': 'Cooperative Dashboard',
      'workers': 'Worker Verification & Skill Directory',
      'customers': 'Customer Accounts & Patronage Records',
      'appointments': 'Appointment Management & Dispatch Workflow',
      'services': 'Service Catalog & Standard Rate Cards',
      'workforce': 'Workforce Deployments & GPS Sectors',
      'welfare': 'Artisan Welfare Fund & Insurance Registry',
      'messages': 'Cooperative Communication Desk',
      'payments': 'Payments, Settlements & Ledger',
      'forecast': 'AI Surge Forecast & Weather Demand',
      'reports': 'Cooperative Registrar & Audit Reports',
      'settings': 'Federation System Settings'
    };

    if (headerTitle) headerTitle.textContent = titles[viewId] || 'Cooperative Admin';
    if (headerBreadcrumb) headerBreadcrumb.textContent = viewId.charAt(0).toUpperCase() + viewId.slice(1);

    // If navigated with filter argument
    if (viewId === 'workers' && filterArg) {
      setWorkerFilter(filterArg);
    }
    // Part 3 Dynamic View Renders on Navigation
    if (viewId === 'workforce') {
      renderWorkforceAllocation();
      renderWorkforceAvailability();
    } else if (viewId === 'forecast') {
      renderAIForecast();
      renderWorkforceGap();
    } else if (viewId === 'reports') {
      renderActiveReport();
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Refresh Lucide Icons
    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleMobileSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) sidebar.classList.toggle('mobile-open');
  }

  function scrollToEmergency() {
    navigateTo('dashboard');
    const banner = document.getElementById('dash-emergency-banner');
    if (banner) {
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      banner.style.boxShadow = '0 0 0 4px rgba(220, 38, 38, 0.4)';
      setTimeout(() => { banner.style.boxShadow = ''; }, 2000);
    }
  }

  // ==============================================================
  // SUB-TAB NAVIGATION HANDLERS (PART 2)
  // ==============================================================
  function switchAppointmentSubtab(tab) {
    const btnList = document.getElementById('subtab-btn-app-list');
    const btnEst = document.getElementById('subtab-btn-app-estimates');
    const contentList = document.getElementById('subtab-content-app-list');
    const contentEst = document.getElementById('subtab-content-app-estimates');

    if (tab === 'estimates') {
      if (btnList) btnList.classList.remove('active');
      if (btnEst) btnEst.classList.add('active');
      if (contentList) contentList.style.display = 'none';
      if (contentEst) contentEst.style.display = 'block';
      renderEstimatesTable();
    } else {
      if (btnList) btnList.classList.add('active');
      if (btnEst) btnEst.classList.remove('active');
      if (contentList) contentList.style.display = 'block';
      if (contentEst) contentEst.style.display = 'none';
      renderAppointmentsTable();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function switchCustomerSubtab(tab) {
    const btnList = document.getElementById('subtab-btn-cust-list');
    const btnTickets = document.getElementById('subtab-btn-cust-tickets');
    const contentList = document.getElementById('subtab-content-cust-list');
    const contentTickets = document.getElementById('subtab-content-cust-tickets');

    if (tab === 'tickets') {
      if (btnList) btnList.classList.remove('active');
      if (btnTickets) btnTickets.classList.add('active');
      if (contentList) contentList.style.display = 'none';
      if (contentTickets) contentTickets.style.display = 'block';
      renderTicketsTable();
    } else {
      if (btnList) btnList.classList.add('active');
      if (btnTickets) btnTickets.classList.remove('active');
      if (contentList) contentList.style.display = 'block';
      if (contentTickets) contentTickets.style.display = 'none';
      renderCustomersTable();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function switchServicesSubtab(tab) {
    const btnCat = document.getElementById('subtab-btn-svc-catalog');
    const btnRates = document.getElementById('subtab-btn-svc-rates');
    const btnMat = document.getElementById('subtab-btn-svc-materials');

    const contentCat = document.getElementById('subtab-content-svc-catalog');
    const contentRates = document.getElementById('subtab-content-svc-rates');
    const contentMat = document.getElementById('subtab-content-svc-materials');

    if (btnCat) btnCat.classList.toggle('active', tab === 'catalog');
    if (btnRates) btnRates.classList.toggle('active', tab === 'rates');
    if (btnMat) btnMat.classList.toggle('active', tab === 'materials');

    if (contentCat) contentCat.style.display = tab === 'catalog' ? 'block' : 'none';
    if (contentRates) contentRates.style.display = tab === 'rates' ? 'block' : 'none';
    if (contentMat) contentMat.style.display = tab === 'materials' ? 'block' : 'none';

    if (tab === 'catalog') renderServicesTable();
    else if (tab === 'rates') renderRatesTable();
    else if (tab === 'materials') renderMaterialsTable();

    if (window.lucide) window.lucide.createIcons();
  }

  function switchWelfareSubtab(tab) {
    const btnProg = document.getElementById('subtab-btn-welfare-prog');
    const btnIns = document.getElementById('subtab-btn-welfare-ins');
    const contentProg = document.getElementById('subtab-content-welfare-prog');
    const contentIns = document.getElementById('subtab-content-welfare-ins');

    if (btnProg) btnProg.classList.toggle('active', tab === 'programs');
    if (btnIns) btnIns.classList.toggle('active', tab === 'insurance');

    if (contentProg) contentProg.style.display = tab === 'programs' ? 'block' : 'none';
    if (contentIns) contentIns.style.display = tab === 'insurance' ? 'block' : 'none';

    if (tab === 'programs') renderWelfareTables();
    else if (tab === 'insurance') renderInsuranceTable();

    if (window.lucide) window.lucide.createIcons();
  }

  // ==============================================================
  // ADMIN AUTHENTICATION
  // ==============================================================
  function handleLogin() {
    const coopId = document.getElementById('login-coop-id').value.trim();
    const username = document.getElementById('login-username').value.trim();
    const pwd = document.getElementById('login-password').value.trim();

    if (!coopId || !username || !pwd) {
      showToast('Please fill all credentials fields.', 'warning');
      return;
    }

    state.isAuthenticated = true;
    document.getElementById('view-login').style.display = 'none';
    document.getElementById('admin-app-root').style.display = 'flex';

    showToast(`Welcome Administrator A. S. Murthy! Cooperative session verified.`, 'success');
    renderAll();
  }

  function handleLogout() {
    state.isAuthenticated = false;
    document.getElementById('admin-app-root').style.display = 'none';
    document.getElementById('view-login').style.display = 'flex';
    showToast('Signed out of Cooperative Admin.', 'info');
  }

  function togglePasswordVisibility() {
    const pwdInput = document.getElementById('login-password');
    const iconEye = document.getElementById('icon-pwd-eye');
    if (!pwdInput) return;

    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      if (iconEye) iconEye.setAttribute('data-lucide', 'eye-off');
    } else {
      pwdInput.type = 'password';
      if (iconEye) iconEye.setAttribute('data-lucide', 'eye');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function fillDemoCredentials() {
    document.getElementById('login-coop-id').value = 'COOP-BLR-560038';
    document.getElementById('login-username').value = 'admin@coopguild.org';
    document.getElementById('login-password').value = 'coopadmin2026';
    showToast('Demo admin credentials filled!', 'info');
  }

  function handleForgotPasswordSubmit() {
    closeModal('modal-forgot-password');
    showToast('✓ 6-Digit reset OTP dispatched to registered mobile (+91 98450 01122).', 'success');
  }

  // ==============================================================
  // RENDER MODULES & DATA TABLES
  // ==============================================================

  // Re-calculate Dashboard Metrics
  function recalculateMetrics() {
    const totalW = state.workers.length;
    const verifiedW = state.workers.filter(w => w.verificationStatus === 'Approved').length;
    const pendingW = state.workers.filter(w => w.verificationStatus === 'Pending' || w.verificationStatus === 'Under Review').length;

    const inProg = state.appointments.filter(a => a.status === 'In Progress' || a.status === 'Arrived').length;
    const onWay = state.appointments.filter(a => a.status === 'On the Way').length;
    const emerg = state.appointments.filter(a => a.requestType === 'EMERGENCY' && a.status !== 'Completed' && a.status !== 'Cancelled').length;

    const instantCnt = state.appointments.filter(a => a.requestType === 'INSTANT').length;
    const prebookCnt = state.appointments.filter(a => a.requestType === 'PRE-BOOKING').length;
    const emergCnt = state.appointments.filter(a => a.requestType === 'EMERGENCY').length;

    const onlineW = state.workers.filter(w => w.isOnline && !w.isAssigned).length;
    const offlineW = state.workers.filter(w => !w.isOnline).length;
    const assignedW = state.workers.filter(w => w.isAssigned).length;

    // Service values
    const totalVal = state.appointments
      .filter(a => a.status !== 'Cancelled')
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    const workerEarn = totalVal * 0.85;
    const coopEarn = totalVal * 0.15;

    // Update DOM counters
    const elTotW = document.getElementById('metric-total-workers');
    const elVerW = document.getElementById('metric-workers-verified');
    const elPenW = document.getElementById('metric-workers-pending');
    if (elTotW) elTotW.textContent = totalW;
    if (elVerW) elVerW.textContent = verifiedW;
    if (elPenW) elPenW.textContent = pendingW;

    const elActJ = document.getElementById('metric-active-jobs');
    const elJProg = document.getElementById('metric-jobs-inprogress');
    const elJWay = document.getElementById('metric-jobs-ontheway');
    const elJEmg = document.getElementById('metric-jobs-emergency');
    if (elActJ) elActJ.textContent = inProg + onWay + emerg;
    if (elJProg) elJProg.textContent = inProg;
    if (elJWay) elJWay.textContent = onWay;
    if (elJEmg) elJEmg.textContent = emerg;

    const elTotB = document.getElementById('metric-today-bookings');
    const elBInst = document.getElementById('metric-bookings-instant');
    const elBPre = document.getElementById('metric-bookings-prebook');
    const elBEmg = document.getElementById('metric-bookings-emergency');
    if (elTotB) elTotB.textContent = instantCnt + prebookCnt + emergCnt;
    if (elBInst) elBInst.textContent = instantCnt;
    if (elBPre) elBPre.textContent = prebookCnt;
    if (elBEmg) elBEmg.textContent = emergCnt;

    const elAvailW = document.getElementById('metric-available-workers');
    const elWOnline = document.getElementById('metric-workers-online');
    const elWOffline = document.getElementById('metric-workers-offline');
    const elWAssigned = document.getElementById('metric-workers-assigned');
    if (elAvailW) elAvailW.textContent = onlineW + offlineW + assignedW;
    if (elWOnline) elWOnline.textContent = onlineW;
    if (elWOffline) elWOffline.textContent = offlineW;
    if (elWAssigned) elWAssigned.textContent = assignedW;

    const elValTot = document.getElementById('metric-service-value');
    const elValW = document.getElementById('metric-val-worker');
    const elValC = document.getElementById('metric-val-coop');
    if (elValTot) elValTot.textContent = `₹${totalVal.toLocaleString('en-IN')}`;
    if (elValW) elValW.textContent = `₹${workerEarn.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    if (elValC) elValC.textContent = `₹${coopEarn.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    const elBadgePending = document.getElementById('badge-pending-workers');
    const elNavPending = document.getElementById('nav-worker-pending-count');
    if (elBadgePending) elBadgePending.textContent = pendingW;
    if (elNavPending) elNavPending.textContent = `${pendingW} Pending`;

    const elPillPending = document.getElementById('pill-cnt-pending');
    const elPillReview = document.getElementById('pill-cnt-under-review');
    const elPillAppr = document.getElementById('pill-cnt-approved');
    const elPillAllW = document.getElementById('pill-cnt-all-workers');
    if (elPillPending) elPillPending.textContent = state.workers.filter(w => w.verificationStatus === 'Pending').length;
    if (elPillReview) elPillReview.textContent = state.workers.filter(w => w.verificationStatus === 'Under Review').length;
    if (elPillAppr) elPillAppr.textContent = verifiedW;
    if (elPillAllW) elPillAllW.textContent = totalW;
  }

  // 1. Render Dashboard Live Appointments Table Preview
  function renderDashboardAppointments() {
    const tbody = document.getElementById('dash-live-appointments-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const slice = state.appointments.slice(0, 5);

    slice.forEach(app => {
      const tr = document.createElement('tr');
      const statusClass = getStatusClass(app.status);

      tr.innerHTML = `
        <td><span class="table-booking-id" onclick="window.adminApp.openAppointmentDetails('${app.id}')" style="cursor: pointer;">${app.id}</span></td>
        <td>
          <div style="font-weight: 700;">${app.customerName}</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">${app.customerPhone}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${app.workerName || '<span style="color: var(--emergency-red);">Unassigned</span>'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${app.workerId ? 'Co-op #' + app.workerId : 'Pending Dispatch'}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${app.service}</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">${app.location}</div>
        </td>
        <td>
          <span class="status-pill ${app.requestType === 'EMERGENCY' ? 'emergency-type' : (app.requestType === 'INSTANT' ? 'under-review' : 'approved')}">
            ${app.requestType === 'EMERGENCY' ? '🚨 EMERGENCY' : (app.requestType === 'INSTANT' ? '⚡ INSTANT' : '📅 PRE-BOOKING')}
          </span>
        </td>
        <td>
          <span class="status-pill ${statusClass}">${app.status}</span>
        </td>
        <td style="font-weight: 800; color: var(--primary-blue);">₹${app.amount.toFixed(2)}</td>
        <td>
          <button class="table-btn-action primary" onclick="window.adminApp.openAppointmentDetails('${app.id}')">
            <span>Manage</span>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 2. Render Workers Table
  function renderWorkersTable() {
    const tbody = document.getElementById('workers-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const searchInput = document.getElementById('worker-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const skillSelect = document.getElementById('worker-skill-select');
    const selectedSkill = skillSelect ? skillSelect.value : 'ALL';
    const areaSelect = document.getElementById('worker-area-select');
    const selectedArea = areaSelect ? areaSelect.value : 'ALL';

    const filtered = state.workers.filter(w => {
      // Status filter
      if (state.workerFilter !== 'ALL' && w.verificationStatus !== state.workerFilter) {
        return false;
      }
      // Skill filter
      if (selectedSkill !== 'ALL' && w.primarySkill !== selectedSkill) {
        return false;
      }
      // Area filter
      if (selectedArea !== 'ALL' && !w.serviceArea.toLowerCase().includes(selectedArea.toLowerCase())) {
        return false;
      }
      // Search query
      if (query) {
        const matchName = w.name.toLowerCase().includes(query);
        const matchId = w.id.includes(query);
        const matchSkill = w.primarySkill.toLowerCase().includes(query);
        const matchPhone = w.phone.includes(query);
        if (!matchName && !matchId && !matchSkill && !matchPhone) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No cooperative artisans found matching filter.</td></tr>`;
      return;
    }

    filtered.forEach(worker => {
      const tr = document.createElement('tr');
      const statusClass = getStatusClass(worker.verificationStatus);

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="table-avatar">
              ${worker.avatarUrl ? `<img src="${worker.avatarUrl}" alt="${worker.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : worker.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${worker.name}</div>
              <div style="font-size: 11px; color: var(--text-muted);">ID: #${worker.id} • ${worker.phone}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 700; color: var(--primary-blue);">${worker.primarySkill}</span>
          <div style="font-size: 11px; color: var(--text-muted);">${worker.experience} exp</div>
        </td>
        <td>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 200px;">
            ${worker.secondarySkills.slice(0, 2).map(s => `<span class="badge-tag">${s}</span>`).join('')}
            ${worker.secondarySkills.length > 2 ? `<span class="badge-tag">+${worker.secondarySkills.length - 2}</span>` : ''}
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="status-indicator-dot ${worker.isOnline ? 'online' : 'offline'}"></span>
            <span style="font-weight: 600; font-size: 12.5px;">${worker.isOnline ? (worker.isAssigned ? 'On Job' : 'Online / Ready') : 'Offline'}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            ${worker.emergencyReady === 'Available' ? '<span style="color: var(--status-approved-text); font-weight: 700;">⚡ Emergency Ready</span>' : 'Standard Shifts'}
          </div>
        </td>
        <td>
          <div style="font-size: 12.5px; font-weight: 600;">${worker.serviceArea}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Bengaluru Zone</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">★ ${worker.rating > 0 ? worker.rating.toFixed(1) : 'New'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${worker.completedJobs} jobs done</div>
        </td>
        <td>
          <span class="status-pill ${statusClass}">${worker.verificationStatus}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="table-btn-action primary" onclick="window.adminApp.openWorkerDetails('${worker.id}')">
              <span>Review</span>
            </button>
            ${worker.verificationStatus === 'Pending' ? `
              <button class="table-btn-action" style="background: #ECFDF5; color: var(--status-approved-text); border: 1px solid #A7F3D0;" onclick="window.adminApp.quickApproveWorker('${worker.id}')" title="Quick Approve">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i>
              </button>
            ` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 3. Render Appointments Table
  function renderAppointmentsTable() {
    const tbody = document.getElementById('appointments-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const searchInput = document.getElementById('appointment-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const statusSelect = document.getElementById('appointment-status-select');
    const selectedStatus = statusSelect ? statusSelect.value : 'ALL';

    const filtered = state.appointments.filter(app => {
      // Type filter
      if (state.appointmentTypeFilter !== 'ALL' && app.requestType !== state.appointmentTypeFilter) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL' && app.status !== selectedStatus) {
        return false;
      }
      // Query
      if (query) {
        const mId = app.id.toLowerCase().includes(query);
        const mCust = app.customerName.toLowerCase().includes(query);
        const mWork = (app.workerName || '').toLowerCase().includes(query);
        const mSvc = app.service.toLowerCase().includes(query);
        if (!mId && !mCust && !mWork && !mSvc) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No bookings found matching selected dispatch filter.</td></tr>`;
      return;
    }

    filtered.forEach(app => {
      const tr = document.createElement('tr');
      const statusClass = getStatusClass(app.status);

      tr.innerHTML = `
        <td>
          <span class="table-booking-id" onclick="window.adminApp.openAppointmentDetails('${app.id}')" style="cursor: pointer;">${app.id}</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${app.date} • ${app.time}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${app.customerName}</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">${app.customerPhone}</div>
          <div style="font-size: 11px; color: var(--primary-blue); margin-top: 2px;">${app.location}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${app.service}</div>
          <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.3;">${app.subIssue}</div>
        </td>
        <td>
          <span class="status-pill ${app.requestType === 'EMERGENCY' ? 'emergency-type' : (app.requestType === 'INSTANT' ? 'under-review' : 'approved')}">
            ${app.requestType === 'EMERGENCY' ? '🚨 EMERGENCY' : (app.requestType === 'INSTANT' ? '⚡ INSTANT' : '📅 PRE-BOOKING')}
          </span>
        </td>
        <td>
          ${app.workerName ? `
            <div style="font-weight: 700; font-size: 13px;">${app.workerName}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Artisan #${app.workerId} • ${app.workerPhone}</div>
          ` : `
            <span style="color: var(--emergency-red); font-weight: 800; font-size: 12px; background: #FEF2F2; padding: 3px 8px; border-radius: 4px; border: 1px solid #FECACA;">Unassigned</span>
          `}
        </td>
        <td>
          <span class="status-pill ${statusClass}">${app.status}</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">ETA: ${app.eta || 'N/A'}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary-blue); font-size: 14px;">₹${app.amount.toFixed(2)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Materials: ₹${(app.materialsCost || 0).toFixed(2)}</div>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="table-btn-action primary" onclick="window.adminApp.openAppointmentDetails('${app.id}')">
              <span>Manage</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 4. Render Customers Table
  function renderCustomersTable() {
    const tbody = document.getElementById('customers-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const searchInput = document.getElementById('customer-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = state.customers.filter(c => {
      if (!query) return true;
      return c.name.toLowerCase().includes(query) || c.phone.includes(query) || c.id.toLowerCase().includes(query);
    });

    filtered.forEach(cust => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--primary-blue);">${cust.id}</div>
          <span class="badge-tag">Patron Member</span>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${cust.name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${cust.email}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px;">${cust.phone}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${cust.location}</div>
        </td>
        <td>
          <div style="font-weight: 700;">${cust.totalBookings} Total</div>
          <div style="font-size: 11px; color: var(--status-approved-text);">${cust.completedJobs} Completed</div>
        </td>
        <td>
          ${cust.activeBooking !== 'None' ? `
            <span class="table-booking-id" onclick="window.adminApp.openAppointmentDetails('${cust.activeBooking}')" style="cursor: pointer;">${cust.activeBooking}</span>
          ` : `<span style="color: var(--text-muted); font-size: 12px;">No active job</span>`}
        </td>
        <td>
          <span class="status-pill approved">${cust.paymentStatus}</span>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary-green);">₹${cust.patronageDividend.toFixed(2)}</div>
          <div style="font-size: 10.5px; color: var(--text-muted);">Annual Reserve</div>
        </td>
        <td>
          <button class="table-btn-action primary" onclick="window.adminApp.openCustomerDetails('${cust.id}')">
            <span>View Profile</span>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 5. Render Services Catalog (PART 2)
  function renderServicesTable() {
    const tbody = document.getElementById('services-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const searchInput = document.getElementById('svc-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = state.services.filter(s => {
      if (state.servicesCategoryFilter !== 'ALL' && s.category !== state.servicesCategoryFilter) {
        return false;
      }
      if (query) {
        const mName = s.name.toLowerCase().includes(query);
        const mDesc = s.description.toLowerCase().includes(query);
        const mCat = s.category.toLowerCase().includes(query);
        const mSkill = s.requiredSkill.toLowerCase().includes(query);
        if (!mName && !mDesc && !mCat && !mSkill) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No cooperative services found matching filter.</td></tr>`;
      return;
    }

    filtered.forEach(svc => {
      const tr = document.createElement('tr');
      const isActive = svc.status === 'Active';

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${svc.name}</div>
          <div style="font-size: 11px; color: var(--primary-blue); font-weight: 600;">${svc.id}</div>
        </td>
        <td>
          <span class="badge-tag" style="background: #EFF6FF; color: var(--primary-blue); font-weight: 700;">${svc.category}</span>
        </td>
        <td style="max-width: 240px;">
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.35;">${svc.description}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px; color: var(--text-main);">${svc.requiredSkill}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${svc.materialCategory}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px;">${svc.estimatedTime}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary-blue); font-size: 13.5px;">₹${svc.basePrice.toFixed(2)}</div>
          <div style="font-size: 11px; color: var(--emergency-red); font-weight: 600;">SOS: ₹${svc.emergencyCharge.toFixed(2)}</div>
        </td>
        <td>
          <span class="status-pill ${isActive ? 'approved' : 'rejected'}">${svc.status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="table-btn-action primary" onclick="window.adminApp.openEditServiceModal('${svc.id}')" title="Edit Service">
              <i data-lucide="edit-3" style="width: 13px; height: 13px;"></i>
              <span>Edit</span>
            </button>
            <button class="table-btn-action" style="background: ${isActive ? '#FEF2F2' : '#ECFDF5'}; color: ${isActive ? 'var(--emergency-red)' : 'var(--status-approved-text)'}; border: 1px solid ${isActive ? '#FECACA' : '#A7F3D0'};" onclick="window.adminApp.toggleServiceStatus('${svc.id}')">
              <span>${isActive ? 'Deactivate' : 'Reactivate'}</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 6. Render Monthly Rates Table (PART 2)
  function renderRatesTable() {
    const tbody = document.getElementById('rates-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const badge = document.getElementById('rate-board-status-badge');
    if (badge) {
      badge.textContent = `Board Status: ${state.ratesBoard.status}`;
      if (state.ratesBoard.status === 'Published & Live' || state.ratesBoard.status === 'Approved') {
        badge.className = 'status-pill approved';
      } else {
        badge.className = 'status-pill under-review';
      }
    }

    state.services.forEach(svc => {
      const tr = document.createElement('tr');
      const diff = svc.basePrice - svc.previousPrice;
      const pct = svc.previousPrice > 0 ? ((diff / svc.previousPrice) * 100).toFixed(1) : 0;
      const isPositive = diff > 0;

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${svc.name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${svc.category} • ${svc.id}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary-blue); font-size: 14.5px;">₹${svc.basePrice.toFixed(2)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Standard Shift</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-muted); font-size: 13px;">₹${svc.previousPrice.toFixed(2)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">August 2026</div>
        </td>
        <td>
          ${diff === 0 ? `
            <span class="rate-change-chip" style="background: #F1F5F9; color: var(--text-muted);">₹0 (Unchanged)</span>
          ` : `
            <span class="rate-change-chip ${isPositive ? 'positive' : 'negative'}">
              ${isPositive ? '+' : ''}₹${diff.toFixed(2)} (${isPositive ? '+' : ''}${pct}%)
            </span>
          `}
        </td>
        <td>
          <div style="font-weight: 700; color: var(--emergency-red); font-size: 13px;">₹${svc.emergencyCharge.toFixed(2)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Priority SOS Tariff</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px;">${state.ratesBoard.effectiveDate}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${state.ratesBoard.currentMonth}</div>
        </td>
        <td>
          <div style="font-size: 11.5px; font-weight: 600; color: var(--text-main);">${state.ratesBoard.resolutionNo}</div>
          <div style="font-size: 10.5px; color: var(--text-muted);">General Body Ratified</div>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="table-btn-action primary" onclick="window.adminApp.openRateEditModal('${svc.id}')" title="Adjust Rate">
              <i data-lucide="sliders" style="width: 13px; height: 13px;"></i>
              <span>Adjust</span>
            </button>
            <button class="table-btn-action" onclick="window.adminApp.openRateHistory('${svc.id}')" title="Rate History">
              <i data-lucide="history" style="width: 13px; height: 13px;"></i>
              <span>History</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 7. Render Materials Table (PART 2)
  function renderMaterialsTable() {
    const tbody = document.getElementById('materials-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const searchInput = document.getElementById('mat-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = state.materials.filter(m => {
      if (state.materialsCategoryFilter !== 'ALL' && m.category !== state.materialsCategoryFilter) {
        return false;
      }
      if (query) {
        const mName = m.name.toLowerCase().includes(query);
        const mId = m.id.toLowerCase().includes(query);
        const mCat = m.category.toLowerCase().includes(query);
        if (!mName && !mId && !mCat) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">No cooperative materials found matching filter.</td></tr>`;
      return;
    }

    filtered.forEach(mat => {
      const tr = document.createElement('tr');
      const diff = mat.currentCost - mat.previousCost;
      const isPositive = diff > 0;

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${mat.name}</div>
          <div style="font-size: 11px; color: var(--primary-blue); font-weight: 600;">Code: ${mat.id}</div>
        </td>
        <td>
          <span class="badge-tag" style="background: #EFF6FF; color: var(--primary-blue); font-weight: 700;">${mat.category}</span>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary-blue); font-size: 14px;">₹${mat.currentCost.toFixed(2)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Co-op Wholesale Card</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-muted); font-size: 13px;">₹${mat.previousCost.toFixed(2)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Last Month</div>
        </td>
        <td>
          <div style="font-size: 12.5px; font-weight: 600;">${mat.month}</div>
          <div style="font-size: 11px; color: ${isPositive ? 'var(--emergency-red)' : 'var(--status-approved-text)'};">
            ${diff === 0 ? 'Price Stable' : `${isPositive ? '+' : ''}₹${diff.toFixed(2)} fluctuation`}
          </div>
        </td>
        <td>
          <span class="status-pill ${mat.status === 'In Stock' ? 'approved' : 'rejected'}">${mat.status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="table-btn-action primary" onclick="window.adminApp.openEditMaterialModal('${mat.id}')" title="Edit Material">
              <i data-lucide="edit-2" style="width: 13px; height: 13px;"></i>
              <span>Edit</span>
            </button>
            <button class="table-btn-action" onclick="window.adminApp.openMaterialHistory('${mat.id}')" title="Price History">
              <i data-lucide="trending-up" style="width: 13px; height: 13px;"></i>
              <span>History</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 8. Render Estimates Monitoring Table (PART 2)
  function renderEstimatesTable() {
    const tbody = document.getElementById('estimates-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const searchInput = document.getElementById('estimate-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = state.estimates.filter(est => {
      if (state.estimatesFilter !== 'ALL') {
        if (state.estimatesFilter === 'APPROVED' && est.status !== 'Customer Approved') return false;
        if (state.estimatesFilter === 'PENDING' && est.status !== 'Pending Customer Approval') return false;
        if (state.estimatesFilter === 'FLAGGED' && est.auditStatus !== 'Flagged for Review') return false;
      }
      if (query) {
        const mId = est.bookingId.toLowerCase().includes(query);
        const mCust = est.customerName.toLowerCase().includes(query);
        const mWork = est.workerName.toLowerCase().includes(query);
        const mSvc = est.service.toLowerCase().includes(query);
        if (!mId && !mCust && !mWork && !mSvc) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No estimate records found matching audit filter.</td></tr>`;
      return;
    }

    filtered.forEach(est => {
      const tr = document.createElement('tr');
      const isFlagged = est.auditStatus === 'Flagged for Review';

      tr.innerHTML = `
        <td>
          <span class="table-booking-id" onclick="window.adminApp.openAppointmentDetails('${est.bookingId}')" style="cursor: pointer;">${est.bookingId}</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Co-op Job #${est.bookingId}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${est.customerName}</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">${est.customerPhone}</div>
        </td>
        <td>
          <div style="font-weight: 700; font-size: 13px;">${est.workerName}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Artisan #${est.workerId} • ${est.workerTrade}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 13px;">${est.service}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${est.materialDetails}</div>
        </td>
        <td>
          <div style="font-size: 12.5px; font-weight: 600;">Labour: ₹${est.labourCost.toFixed(2)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Parts: ₹${est.materialsCost.toFixed(2)}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary-blue); font-size: 14px;">₹${est.totalEstimate.toFixed(2)}</div>
          <span class="status-pill ${est.status === 'Customer Approved' ? 'approved' : 'under-review'}" style="font-size: 10.5px; padding: 2px 6px;">${est.status}</span>
        </td>
        <td>
          <span class="status-pill ${isFlagged ? 'rejected' : 'approved'}">
            ${isFlagged ? '⚠️ Flagged for Review' : '✓ Rate Standard: Passed'}
          </span>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">${est.auditNotes || 'Standard Card'}</div>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="table-btn-action primary" onclick="window.adminApp.openAppointmentDetails('${est.bookingId}')" title="Audit Estimate Breakdown">
              <span>Inspect</span>
            </button>
            <button class="table-btn-action" style="background: #FEF2F2; color: var(--emergency-red); border: 1px solid #FECACA;" onclick="window.adminApp.openEstimateFlagModal('${est.bookingId}')" title="Flag Estimate for Review">
              <i data-lucide="flag" style="width: 13px; height: 13px;"></i>
              <span>${isFlagged ? 'Update Flag' : 'Flag'}</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 9. Render Customer Support Tickets Table (PART 2)
  function renderTicketsTable() {
    const tbody = document.getElementById('tickets-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const searchInput = document.getElementById('ticket-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const issueFilter = document.getElementById('ticket-issue-filter');
    const selectedIssue = issueFilter ? issueFilter.value : 'ALL';

    const openCount = state.tickets.filter(t => t.status !== 'Resolved').length;
    const badge = document.getElementById('badge-tickets-open-count');
    if (badge) badge.textContent = `${openCount} Active`;

    const filtered = state.tickets.filter(t => {
      if (state.ticketsCategoryFilter !== 'ALL' && t.category !== state.ticketsCategoryFilter) {
        return false;
      }
      if (selectedIssue !== 'ALL' && t.category !== selectedIssue) {
        return false;
      }
      if (query) {
        const mId = t.id.toLowerCase().includes(query);
        const mCust = t.customerName.toLowerCase().includes(query);
        const mSub = t.subject.toLowerCase().includes(query);
        const mBook = (t.bookingId || '').toLowerCase().includes(query);
        if (!mId && !mCust && !mSub && !mBook) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">No customer support tickets found matching category.</td></tr>`;
      return;
    }

    filtered.forEach(tck => {
      const tr = document.createElement('tr');
      let prioClass = 'medium';
      if (tck.priority === 'Critical') prioClass = 'critical';
      else if (tck.priority === 'High') prioClass = 'high';

      tr.innerHTML = `
        <td>
          <span style="font-weight: 800; color: var(--primary-blue);">${tck.id}</span>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${tck.date}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${tck.customerName}</div>
          <div style="font-size: 11.5px; color: var(--text-muted);">${tck.customerPhone}</div>
        </td>
        <td>
          ${tck.bookingId ? `
            <span class="table-booking-id" onclick="window.adminApp.openAppointmentDetails('${tck.bookingId}')" style="cursor: pointer;">${tck.bookingId}</span>
          ` : `<span style="color: var(--text-muted); font-size: 11px;">General Inquiry</span>`}
        </td>
        <td>
          <div style="font-weight: 700; font-size: 13px;">${tck.category}</div>
          <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.3;">${tck.subject}</div>
        </td>
        <td>
          <span class="priority-pill ${prioClass}">${tck.priority}</span>
        </td>
        <td>
          <span class="status-pill ${tck.status === 'Resolved' ? 'approved' : (tck.status === 'Open' ? 'rejected' : 'under-review')}">${tck.status}</span>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">${tck.lastActivity}</div>
        </td>
        <td>
          <div style="font-size: 12px; font-weight: 600;">${tck.assignedTo}</div>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="table-btn-action primary" onclick="window.adminApp.openTicketDetails('${tck.id}')" title="Ticket Communication Thread">
              <i data-lucide="message-square" style="width: 13px; height: 13px;"></i>
              <span>Respond</span>
            </button>
            <button class="table-btn-action" style="background: #EFF6FF; color: var(--primary-blue);" onclick="window.adminApp.openChatWithCustomer('${tck.customerId}')" title="Open Live Direct Chat">
              <i data-lucide="messages-square" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 10. Render Worker Welfare Tables (PART 2)
  function renderWelfareTables() {
    const tbodyWorkers = document.getElementById('welfare-workers-tbody');
    const tbodyHistory = document.getElementById('welfare-history-tbody');

    if (tbodyWorkers) {
      tbodyWorkers.innerHTML = '';
      state.welfareWorkers.forEach(w => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${w.workerName}</div>
            <div style="font-size: 11px; color: var(--primary-blue); font-weight: 600;">Worker ID: #${w.workerId} • ${w.trade}</div>
          </td>
          <td>
            <span class="badge-tag" style="background: #EFF6FF; color: var(--primary-blue); font-weight: 700;">${w.welfareTier}</span>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">₹${w.monthlyContribution.toFixed(2)}/mo</div>
            <div style="font-size: 10.5px; color: var(--text-muted);">Cooperative Surplus Deduction</div>
          </td>
          <td>
            <div style="font-weight: 800; color: var(--primary-green); font-size: 14px;">₹${w.totalDisbursed.toFixed(2)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${w.lastBenefit}</div>
          </td>
          <td>
            <span class="status-pill approved">${w.status}</span>
          </td>
          <td>
            <button class="table-btn-action primary" onclick="window.adminApp.openRecordWelfareModal('${w.workerId}')">
              <i data-lucide="gift" style="width: 13px; height: 13px;"></i>
              <span>Disburse</span>
            </button>
          </td>
        `;
        tbodyWorkers.appendChild(tr);
      });
    }

    if (tbodyHistory) {
      tbodyHistory.innerHTML = '';
      state.welfareHistory.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 600; font-size: 12.5px;">${h.date}</td>
          <td style="font-weight: 700; font-size: 13px;">${h.workerName}</td>
          <td style="font-weight: 600; color: var(--primary-blue);">${h.program}</td>
          <td style="font-weight: 800; color: var(--primary-green); font-size: 13.5px;">₹${h.amount.toFixed(2)}</td>
          <td style="font-size: 12px; color: var(--text-muted); max-width: 250px;">${h.resolutionNote}</td>
          <td>
            <span class="status-pill approved">${h.status}</span>
          </td>
        `;
        tbodyHistory.appendChild(tr);
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // 11. Render Worker Insurance Table (PART 2)
  function renderInsuranceTable() {
    const tbody = document.getElementById('insurance-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const expiringSoonCount = state.insurance.filter(i => i.status === 'Expiring Soon').length;
    const badge = document.getElementById('badge-insurance-expiring');
    if (badge) badge.textContent = `${expiringSoonCount} Expiring Soon (<30d)`;

    const searchInput = document.getElementById('ins-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = state.insurance.filter(ins => {
      if (state.insuranceStatusFilter !== 'ALL') {
        if (state.insuranceStatusFilter === 'EXPIRING' && ins.status !== 'Expiring Soon') return false;
        if (state.insuranceStatusFilter === 'ACTIVE' && ins.status !== 'Active') return false;
        if (state.insuranceStatusFilter === 'EXPIRED' && ins.status !== 'Expired') return false;
      }
      if (query) {
        const mName = ins.workerName.toLowerCase().includes(query);
        const mPol = ins.policyNo.toLowerCase().includes(query);
        const mProv = ins.provider.toLowerCase().includes(query);
        if (!mName && !mPol && !mProv) return false;
      }
      return true;
    });

    filtered.forEach(ins => {
      const tr = document.createElement('tr');
      const isExpiring = ins.status === 'Expiring Soon';

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${ins.workerName}</div>
          <div style="font-size: 11px; color: var(--primary-blue); font-weight: 600;">Artisan #${ins.workerId} • ${ins.trade}</div>
        </td>
        <td>
          <div style="font-weight: 700; font-size: 13px; font-family: monospace;">${ins.policyNo}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${ins.provider}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px;">${ins.policyType}</div>
          <div style="font-size: 11.5px; color: var(--primary-green); font-weight: 700;">${ins.coverage}</div>
        </td>
        <td>
          <div style="font-weight: 700; font-size: 12.5px; color: ${isExpiring ? 'var(--emergency-red)' : 'var(--text-main)'};">${ins.expiryDate}</div>
          <div style="font-size: 10.5px; color: var(--text-muted);">${isExpiring ? 'Renewal Required (< 30 days)' : 'Annual Validity Valid'}</div>
        </td>
        <td>
          <span class="status-pill ${isExpiring ? 'emergency-type' : 'approved'}">${ins.status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${isExpiring ? `
              <button class="table-btn-action" style="background: #ECFDF5; color: var(--status-approved-text); border: 1px solid #A7F3D0; font-weight: 700;" onclick="window.adminApp.renewExpiringInsurance('${ins.id}')">
                <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i>
                <span>Renew Now</span>
              </button>
            ` : `
              <button class="table-btn-action primary" onclick="window.adminApp.openEditInsuranceModal('${ins.id}')">
                <i data-lucide="edit-3" style="width: 13px; height: 13px;"></i>
                <span>Edit</span>
              </button>
            `}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 12. Render 3-Way Chat Hub (PART 2)
  function renderChatConversations() {
    const list = document.getElementById('chat-conversations-list');
    if (!list) return;

    list.innerHTML = '';
    let totalUnread = 0;

    const searchInput = document.getElementById('chat-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    state.conversations.forEach(conv => {
      totalUnread += (conv.unread || 0);

      if (query && !conv.name.toLowerCase().includes(query) && !conv.bookingId.toLowerCase().includes(query)) {
        return;
      }

      const item = document.createElement('div');
      item.className = `chat-conversation-item ${conv.id === state.currentChatId ? 'active' : ''}`;
      item.onclick = () => selectConversation(conv.id);

      item.innerHTML = `
        <div style="position: relative; flex-shrink: 0;">
          <img src="${conv.avatar}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #E2E8F0;">
          <span class="status-indicator-dot online" style="position: absolute; bottom: 2px; right: 2px; border: 2px solid #fff;"></span>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; font-size: 13.5px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${conv.name}</span>
            <span style="font-size: 11px; color: var(--text-muted); flex-shrink: 0;">${conv.lastTime}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
            <span class="badge-tag" style="font-size: 10px; padding: 1px 6px;">${conv.role}</span>
            <span class="table-booking-id" style="font-size: 10.5px;">${conv.bookingId}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 3px;">
            ${conv.lastMessage}
          </div>
        </div>
        ${conv.unread > 0 ? `
          <div style="background: var(--primary-blue); color: #fff; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${conv.unread}
          </div>
        ` : ''}
      `;
      list.appendChild(item);
    });

    const unreadBadge = document.getElementById('chat-total-unread-badge');
    if (unreadBadge) {
      unreadBadge.textContent = `${totalUnread} New`;
      unreadBadge.style.display = totalUnread > 0 ? 'inline-block' : 'none';
    }
  }

  function filterChatConversations() {
    renderChatConversations();
  }

  function selectConversation(convId) {
    state.currentChatId = convId;
    const conv = state.conversations.find(c => c.id === convId);
    if (!conv) return;

    conv.unread = 0;
    state.currentChatPartyType = conv.type;
    state.currentChatPartyName = conv.name;
    state.currentChatPartyPhone = conv.phone;
    state.currentChatBookingId = conv.bookingId;

    // Header updates using exact IDs from index.html
    const nameEl = document.getElementById('chat-active-name');
    const roleEl = document.getElementById('chat-active-type-pill');
    const phoneEl = document.getElementById('chat-active-phone');
    const bookEl = document.getElementById('chat-active-booking-tag');
    const avatarEl = document.getElementById('chat-active-avatar');

    if (nameEl) nameEl.textContent = conv.name;
    if (roleEl) roleEl.textContent = conv.role;
    if (phoneEl) phoneEl.textContent = `${conv.phone} • ${conv.role} Verified Account`;
    if (bookEl) {
      bookEl.textContent = conv.bookingId;
      bookEl.onclick = () => openAppointmentDetails(conv.bookingId);
    }
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="${conv.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }

    renderChatConversations();
    renderChatMessages();
  }

  function renderChatMessages() {
    const scrollContainer = document.getElementById('chat-messages-scroll');
    if (!scrollContainer) return;

    scrollContainer.innerHTML = '';
    const conv = state.conversations.find(c => c.id === state.currentChatId);
    if (!conv || !conv.messages) return;

    conv.messages.forEach(msg => {
      const bubble = document.createElement('div');
      const isAdmin = msg.sender === 'admin';
      bubble.className = `chat-bubble ${isAdmin ? 'admin-out' : 'party-in'}`;

      bubble.innerHTML = `
        <div style="font-size: 11px; font-weight: 700; color: ${isAdmin ? '#EFF6FF' : 'var(--primary-blue)'}; margin-bottom: 3px;">
          ${msg.name} ${isAdmin ? '(Co-op Admin Desk)' : ''}
        </div>
        <div style="line-height: 1.4; font-size: 13.5px;">${msg.text}</div>
        <div style="font-size: 10px; color: ${isAdmin ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)'}; text-align: right; margin-top: 4px;">
          ${msg.time} ${isAdmin ? '✓✓' : ''}
        </div>
      `;
      scrollContainer.appendChild(bubble);
    });

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }

  function sendChatMessage() {
    const input = document.getElementById('chat-input-field');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const conv = state.conversations.find(c => c.id === state.currentChatId);
    if (!conv) return;

    const timeStr = 'Just now';
    conv.messages.push({
      sender: 'admin',
      name: 'Admin Murthy',
      time: timeStr,
      text: text
    });
    conv.lastMessage = text;
    conv.lastTime = timeStr;

    input.value = '';
    renderChatMessages();
    renderChatConversations();

    // Broadcast across marketplace ecosystem
    broadcastMarketplace('CHAT_MESSAGE_SENT', {
      chatId: conv.id,
      targetId: conv.targetId,
      bookingId: conv.bookingId,
      text: text
    });

    // Realistic automated simulate reply after 1.8s
    setTimeout(() => {
      let replyText = 'Understood, thank you for the confirmation!';
      if (conv.type === 'worker') {
        replyText = 'Understood Admin. Arrived at site and commencing standard work procedure.';
      } else {
        replyText = 'Thank you for following up so promptly. We appreciate the cooperative support.';
      }
      conv.messages.push({
        sender: conv.type,
        name: conv.name,
        time: 'Just now',
        text: replyText
      });
      conv.lastMessage = replyText;
      conv.lastTime = 'Just now';
      renderChatMessages();
      renderChatConversations();
      showToast(`💬 New incoming message from ${conv.name}: "${replyText}"`, 'info');
    }, 1800);
  }

  function insertQuickMessage(text) {
    const input = document.getElementById('chat-input-field');
    if (input) {
      input.value = text;
      input.focus();
    }
  }

  // 13. Render Payments & Ledger Table (PART 2)
  function renderPaymentsTable() {
    const tbody = document.getElementById('payments-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const statusSelect = document.getElementById('payment-status-select');
    const selectedStatus = statusSelect ? statusSelect.value : 'ALL';
    const searchInput = document.getElementById('payment-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = state.payments.filter(p => {
      // Date range filter
      if (state.paymentsRangeFilter !== 'All Time' && p.dateFilter !== state.paymentsRangeFilter && state.paymentsRangeFilter !== 'This Month') {
        if (state.paymentsRangeFilter === 'This Week' && p.dateFilter !== 'Today' && p.dateFilter !== 'This Week') return false;
        if (state.paymentsRangeFilter === 'Today' && p.dateFilter !== 'Today') return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) {
        return false;
      }
      // Query
      if (query) {
        const mTxn = p.txnId.toLowerCase().includes(query);
        const mBook = p.bookingId.toLowerCase().includes(query);
        const mCust = p.customerName.toLowerCase().includes(query);
        const mWork = p.workerName.toLowerCase().includes(query);
        if (!mTxn && !mBook && !mCust && !mWork) return false;
      }
      return true;
    });

    let sumGross = 0;
    let sumWorker = 0;
    let sumCoop = 0;

    filtered.forEach(p => {
      sumGross += p.grossAmount;
      sumWorker += p.workerShare;
      sumCoop += p.coopShare;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <span style="font-weight: 800; color: var(--text-main); font-family: monospace;">${p.txnId}</span>
          <div style="font-size: 11px; color: var(--text-muted);">${p.timestamp}</div>
        </td>
        <td>
          <span class="table-booking-id" onclick="window.adminApp.openAppointmentDetails('${p.bookingId}')" style="cursor: pointer;">${p.bookingId}</span>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${p.customerName}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${p.mode}</div>
        </td>
        <td>
          <div style="font-weight: 700; font-size: 13px;">${p.workerName}</div>
          <div style="font-size: 11px; color: var(--primary-blue); font-weight: 600;">${p.workerTrade}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--text-main); font-size: 14px;">₹${p.grossAmount.toFixed(2)}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary-green); font-size: 13.5px;">₹${p.workerShare.toFixed(2)}</div>
          <div style="font-size: 10.5px; color: var(--text-muted);">85% Direct Artisan</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary-blue); font-size: 13.5px;">₹${p.coopShare.toFixed(2)}</div>
          <div style="font-size: 10.5px; color: var(--text-muted);">15% Welfare & Reserve</div>
        </td>
        <td>
          <span class="status-pill approved">${p.status}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Update Payment Metric Display Cards with exact HTML IDs
    const elGross = document.getElementById('pay-total-volume');
    const elWorker = document.getElementById('pay-worker-payouts');
    const elCoop = document.getElementById('pay-coop-reserve');
    if (elGross) elGross.textContent = `₹${sumGross.toFixed(2)}`;
    if (elWorker) elWorker.textContent = `₹${sumWorker.toFixed(2)}`;
    if (elCoop) elCoop.textContent = `₹${sumCoop.toFixed(2)}`;

    if (window.lucide) window.lucide.createIcons();
  }

  // Master Render All
  function renderAll() {
    recalculateMetrics();
    renderDashboardAppointments();
    renderWorkersTable();
    renderAppointmentsTable();
    renderCustomersTable();
    // Part 2 Tables
    renderServicesTable();
    renderRatesTable();
    renderMaterialsTable();
    renderEstimatesTable();
    renderTicketsTable();
    renderWelfareTables();
    renderInsuranceTable();
    renderChatConversations();
    renderChatMessages();
    renderPaymentsTable();
    // Part 3 Renders
    renderWorkforceAllocation();
    renderWorkforceAvailability();
    renderAIForecast();
    renderWorkforceGap();
    renderActiveReport();
    renderAdminNotifications();
  }

  // ==============================================================
  // WORKER DETAILS & VERIFICATION ACTIONS (PART 1 PRESERVED)
  // ==============================================================
  function openWorkerDetails(workerId) {
    const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
    if (!worker) return;

    state.currentSelectedWorkerId = workerId;

    const nameEl = document.getElementById('wd-name');
    const metaIdEl = document.getElementById('wd-meta-id');
    const avatarWrap = document.getElementById('wd-avatar-wrap');
    const statusPill = document.getElementById('wd-status-pill');
    const eligText = document.getElementById('wd-eligibility-text');

    if (nameEl) nameEl.textContent = worker.name;
    if (metaIdEl) metaIdEl.textContent = `Worker ID: #${worker.id} • ${worker.primarySkill} Specialist`;
    if (avatarWrap) {
      avatarWrap.innerHTML = worker.avatarUrl 
        ? `<img src="${worker.avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` 
        : worker.name.split(' ').map(n=>n[0]).join('');
    }

    if (statusPill) {
      statusPill.textContent = worker.verificationStatus;
      statusPill.className = `status-pill ${getStatusClass(worker.verificationStatus)}`;
    }

    if (eligText) {
      if (worker.verificationStatus === 'Approved') {
        eligText.textContent = 'Eligible for Dispatch & Auto-Matching';
        eligText.style.color = 'var(--status-approved-text)';
      } else if (worker.verificationStatus === 'Rejected') {
        eligText.textContent = 'Application Rejected • Not Qualified';
        eligText.style.color = 'var(--emergency-red)';
      } else if (worker.verificationStatus === 'Suspended') {
        eligText.textContent = 'Suspended • Dispatch Blocked';
        eligText.style.color = 'var(--emergency-red)';
      } else {
        eligText.textContent = 'Verification in Progress';
        eligText.style.color = 'var(--warning-amber)';
      }
    }

    // Personal Details
    document.getElementById('wd-full-name').textContent = worker.name;
    document.getElementById('wd-mobile').textContent = worker.phone;
    document.getElementById('wd-email').textContent = worker.email;
    document.getElementById('wd-address').textContent = worker.serviceArea + ', Bengaluru';

    // Skill Management form inputs
    const primSkillSelect = document.getElementById('wd-edit-primary-skill');
    const secSkillsInput = document.getElementById('wd-edit-secondary-skills');
    const expInput = document.getElementById('wd-edit-experience');
    const maxJobsInput = document.getElementById('wd-edit-max-jobs');
    const sAreaInput = document.getElementById('wd-edit-service-area');
    const emergSelect = document.getElementById('wd-edit-emergency-ready');
    const availSelect = document.getElementById('wd-edit-general-avail');

    if (primSkillSelect) primSkillSelect.value = worker.primarySkill;
    if (secSkillsInput) secSkillsInput.value = worker.secondarySkills.join(', ');
    if (expInput) expInput.value = worker.experience;
    if (maxJobsInput) maxJobsInput.value = worker.maxDailyJobs;
    if (sAreaInput) sAreaInput.value = worker.serviceArea;
    if (emergSelect) emergSelect.value = worker.emergencyReady;
    if (availSelect) availSelect.value = worker.isOnline ? 'Online' : 'Offline';

    // Performance & Welfare
    document.getElementById('wd-rating').textContent = `${worker.rating} (${worker.reviewsCount} reviews)`;
    document.getElementById('wd-completed-jobs').textContent = `${worker.completedJobs} Jobs`;
    document.getElementById('wd-welfare-status').textContent = `Active Contributor (₹${worker.welfareBalance.toFixed(2)})`;
    document.getElementById('wd-insurance-status').textContent = worker.insurancePolicy;

    openDrawer('drawer-worker-details');
  }

  function approveWorkerCurrent() {
    if (!state.currentSelectedWorkerId) return;
    const worker = state.workers.find(w => w.id === state.currentSelectedWorkerId);
    if (!worker) return;

    worker.verificationStatus = 'Approved';
    showToast(`✓ Artisan #${worker.id} (${worker.name}) successfully approved & activated for dispatch!`, 'success');

    broadcastMarketplace('WORKER_VERIFICATION_UPDATED', {
      workerId: worker.id,
      workerName: worker.name,
      status: 'Approved'
    });

    closeDrawer('drawer-worker-details');
    renderAll();
  }

  function quickApproveWorker(workerId) {
    const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
    if (!worker) return;

    worker.verificationStatus = 'Approved';
    showToast(`✓ Worker #${worker.id} (${worker.name}) approved for cooperative bookings.`, 'success');

    broadcastMarketplace('WORKER_VERIFICATION_UPDATED', {
      workerId: worker.id,
      status: 'Approved'
    });

    renderAll();
  }

  function confirmRejectWorker() {
    if (!state.currentSelectedWorkerId) return;
    const worker = state.workers.find(w => w.id === state.currentSelectedWorkerId);
    if (!worker) return;

    const reason = document.getElementById('reject-reason-input').value.trim() || 'Documents did not meet cooperative accreditation standards.';
    worker.verificationStatus = 'Rejected';
    worker.rejectionReason = reason;

    closeModal('modal-worker-reject');
    closeDrawer('drawer-worker-details');
    showToast(`Worker application #${worker.id} rejected. Reason: ${reason}`, 'warning');

    broadcastMarketplace('WORKER_VERIFICATION_UPDATED', {
      workerId: worker.id,
      status: 'Rejected',
      reason: reason
    });

    renderAll();
  }

  function suspendWorkerCurrent() {
    if (!state.currentSelectedWorkerId) return;
    const worker = state.workers.find(w => w.id === state.currentSelectedWorkerId);
    if (!worker) return;

    worker.verificationStatus = 'Suspended';
    worker.isOnline = false;
    showToast(`Worker #${worker.id} (${worker.name}) suspended from dispatch platform.`, 'warning');

    broadcastMarketplace('WORKER_VERIFICATION_UPDATED', {
      workerId: worker.id,
      status: 'Suspended'
    });

    closeDrawer('drawer-worker-details');
    renderAll();
  }

  function sendWorkerInfoRequest() {
    const text = document.getElementById('request-info-input').value.trim() || 'Please re-upload a clear copy of Trade Certificate and Address Proof.';
    closeModal('modal-worker-request-info');
    showToast(`✓ Document revision request sent via SMS to worker.`, 'info');
  }

  function saveWorkerSkills() {
    if (!state.currentSelectedWorkerId) return;
    const worker = state.workers.find(w => w.id === state.currentSelectedWorkerId);
    if (!worker) return;

    worker.primarySkill = document.getElementById('wd-edit-primary-skill').value;
    const secStr = document.getElementById('wd-edit-secondary-skills').value;
    worker.secondarySkills = secStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    worker.experience = document.getElementById('wd-edit-experience').value;
    worker.maxDailyJobs = parseInt(document.getElementById('wd-edit-max-jobs').value, 10) || 5;
    worker.serviceArea = document.getElementById('wd-edit-service-area').value;
    worker.emergencyReady = document.getElementById('wd-edit-emergency-ready').value;
    worker.isOnline = document.getElementById('wd-edit-general-avail').value === 'Online';

    showToast(`✓ Skills & operational limits updated for ${worker.name}.`, 'success');
    closeDrawer('drawer-worker-details');
    renderAll();
  }

  function openNewWorkerModal() {
    const newId = (700 + state.workers.length + 1).toString();
    state.workers.unshift({
      id: newId,
      name: 'Ravi Shankar (Walk-in)',
      phone: '+91 98450 77334',
      email: 'ravi.shankar@coopguild.org',
      avatarUrl: '',
      primarySkill: 'Plumbing',
      secondarySkills: ['Leak Detection', 'PVC Welding'],
      experience: '4 years',
      serviceArea: 'Indiranagar Desk',
      applicationDate: 'Today (Walk-in)',
      verificationStatus: 'Pending',
      isOnline: false,
      isAssigned: false,
      emergencyReady: 'Available',
      maxDailyJobs: 4,
      rating: 0,
      reviewsCount: 0,
      completedJobs: 0,
      aadhaarMasked: 'XXXX-XXXX-9921',
      panMasked: 'KLMNO9921Z',
      tradeCertificate: 'ITI Plumbing (Document Received)',
      bankAccountMasked: 'SBI •••• 1122 (IFSC: SBIN000102)',
      welfareBalance: 0,
      insurancePolicy: 'Pending Accreditation'
    });
    showToast(`✓ Walk-in artisan enrolled into verification queue as #${newId}.`, 'success');
    renderWorkersTable();
    openWorkerDetails(newId);
  }

  // ==============================================================
  // APPOINTMENT WORKFLOW & ACTIONS (PART 1 PRESERVED)
  // ==============================================================
  function openAppointmentDetails(bookingId) {
    const app = state.appointments.find(a => a.id === bookingId);
    if (!app) return;

    state.currentSelectedBookingId = bookingId;

    const bIdEl = document.getElementById('ad-booking-id');
    const svcEl = document.getElementById('ad-service-title');
    const statusPill = document.getElementById('ad-status-pill');
    const typeBadge = document.getElementById('ad-type-badge');
    const amtEl = document.getElementById('ad-amount');

    if (bIdEl) bIdEl.textContent = app.id;
    if (svcEl) svcEl.textContent = app.service;
    if (amtEl) amtEl.textContent = `₹${app.amount.toFixed(2)}`;

    if (statusPill) {
      statusPill.textContent = app.status;
      statusPill.className = `status-pill ${getStatusClass(app.status)}`;
    }

    if (typeBadge) {
      typeBadge.textContent = app.requestType === 'EMERGENCY' ? '🚨 EMERGENCY' : (app.requestType === 'INSTANT' ? '⚡ INSTANT' : '📅 PRE-BOOKING');
      typeBadge.className = `status-pill ${app.requestType === 'EMERGENCY' ? 'emergency-type' : (app.requestType === 'INSTANT' ? 'under-review' : 'approved')}`;
    }

    const cName = document.getElementById('ad-cust-name');
    const cPhone = document.getElementById('ad-cust-phone');
    const cLoc = document.getElementById('ad-cust-location');

    if (cName) cName.textContent = app.customerName;
    if (cPhone) cPhone.textContent = app.customerPhone;
    if (cLoc) cLoc.textContent = app.location;

    const wName = document.getElementById('ad-worker-name');
    const wParam = document.getElementById('ad-worker-phone');
    const wEta = document.getElementById('ad-worker-eta');

    if (wName) {
      wName.textContent = app.workerName ? `${app.workerName} (#${app.workerId || '402'})` : 'Unassigned (Pending Dispatch)';
      wName.style.color = app.workerName ? 'var(--text-main)' : 'var(--emergency-red)';
    }
    if (wParam) wParam.textContent = app.workerPhone || 'Cooperative Dispatch Desk';
    if (wEta) wEta.textContent = `ETA: ${app.eta || '12 mins'}`;

    const timelineBar = document.getElementById('ad-timeline-bar');
    if (timelineBar) {
      let pct = '25%';
      if (app.status === 'Worker Assigned') pct = '40%';
      else if (app.status === 'On the Way') pct = '60%';
      else if (app.status === 'Arrived') pct = '75%';
      else if (app.status === 'In Progress') pct = '90%';
      else if (app.status === 'Completed') pct = '100%';
      timelineBar.style.width = pct;
    }

    openModal('modal-appointment-details');
  }

  function openAssignWorkerModal(bookingId) {
    state.currentSelectedBookingId = bookingId;
    const app = state.appointments.find(a => a.id === bookingId);
    if (!app) return;

    document.getElementById('assign-modal-booking-tag').textContent = `Assigning for ${app.id} (${app.service})`;

    const list = document.getElementById('assign-workers-list');
    list.innerHTML = '';

    const availWorkers = state.workers.filter(w => w.verificationStatus === 'Approved');
    availWorkers.forEach(w => {
      const card = document.createElement('div');
      card.style.background = '#F8FAFC';
      card.style.border = '1px solid var(--border-light)';
      card.style.borderRadius = 'var(--radius-sm)';
      card.style.padding = '12px 14px';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="table-avatar">
            ${w.avatarUrl ? `<img src="${w.avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : w.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 13.5px;">${w.name} (#${w.id})</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${w.primarySkill} • ★ ${w.rating} • ${w.serviceArea}</div>
          </div>
        </div>
        <button class="table-btn-action primary" onclick="window.adminApp.confirmAssignWorker('${w.id}')">
          <span>Assign Now</span>
        </button>
      `;
      list.appendChild(card);
    });

    closeModal('modal-appointment-details');
    openModal('modal-assign-worker');
  }

  function confirmAssignWorker(workerId) {
    if (!state.currentSelectedBookingId) return;
    const app = state.appointments.find(a => a.id === state.currentSelectedBookingId);
    const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
    if (!app || !worker) return;

    app.workerId = worker.id;
    app.workerName = worker.name;
    app.workerPhone = worker.phone;
    app.status = 'Worker Assigned';
    app.eta = '15 mins';

    if (app.requestType === 'EMERGENCY') {
      state.emergencyActive.assignedWorker = `${worker.name} (#${worker.id})`;
      state.emergencyActive.status = 'Worker Assigned';
    }

    closeModal('modal-assign-worker');
    showToast(`✓ Worker #${worker.id} (${worker.name}) assigned to booking #${app.id}!`, 'success');

    broadcastMarketplace('WORKER_ACCEPTED_JOB', {
      bookingId: app.id,
      requestType: app.requestType,
      workerName: worker.name,
      workerId: worker.id,
      workerPhone: worker.phone,
      service: app.service,
      assignedBy: 'Cooperative Admin Desk'
    });

    renderAll();
  }

  function openRescheduleModal(bookingId) {
    state.currentSelectedBookingId = bookingId;
    closeModal('modal-appointment-details');
    openModal('modal-reschedule-appointment');
  }

  function confirmReschedule() {
    if (!state.currentSelectedBookingId) return;
    const app = state.appointments.find(a => a.id === state.currentSelectedBookingId);
    if (!app) return;

    const date = document.getElementById('reschedule-date').value || '25 Sep 2026';
    const slot = document.getElementById('reschedule-slot').value;

    app.date = date;
    app.time = slot;
    app.status = 'Confirmed';

    closeModal('modal-reschedule-appointment');
    showToast(`Appointment #${app.id} rescheduled to ${date} (${slot}). Customer & technician notified.`, 'success');

    broadcastMarketplace('ADMIN_RESCHEDULED_JOB', {
      bookingId: app.id,
      date: date,
      time: slot
    });

    renderAll();
  }

  function openCancelModal(bookingId) {
    state.currentSelectedBookingId = bookingId;
    closeModal('modal-appointment-details');
    openModal('modal-cancel-appointment');
  }

  function confirmCancelAppointment() {
    if (!state.currentSelectedBookingId) return;
    const app = state.appointments.find(a => a.id === state.currentSelectedBookingId);
    if (!app) return;

    const reason = document.getElementById('cancel-reason-select').value;
    app.status = 'Cancelled';
    app.cancelReason = reason;

    closeModal('modal-cancel-appointment');
    showToast(`Booking #${app.id} cancelled. Reason: ${reason}.`, 'warning');

    broadcastMarketplace('ADMIN_CANCELLED_JOB', {
      bookingId: app.id,
      reason: reason
    });

    renderAll();
  }

  function openNewBookingModal() {
    const newId = 'CP-' + Math.floor(2000 + Math.random() * 7000);
    state.appointments.unshift({
      id: newId,
      customerName: 'P. Vishnu Vardhan',
      customerPhone: '+91 98480 22338',
      customerId: 'CUST-1049',
      service: 'Plumbing Leakage & Pipe Repair',
      subIssue: 'Manual booking created at Central Cooperative Dispatch Desk.',
      date: 'Today (23 Sep)',
      time: '12:00 PM',
      location: 'Indiranagar 100ft Rd, Bengaluru',
      requestType: 'INSTANT',
      status: 'Requested',
      workerId: null,
      workerName: 'Unassigned',
      workerPhone: '',
      amount: 380.00,
      eta: 'Dispatching',
      materialsCost: 0,
      labourCost: 380.00,
      paymentStatus: 'Pending'
    });
    showToast(`✓ Manual dispatch booking #${newId} registered. Assign an artisan now.`, 'success');
    renderAppointmentsTable();
    openAppointmentDetails(newId);
  }

  function contactParty(type, name, phone) {
    document.getElementById('contact-modal-title').textContent = type === 'customer' ? 'Contact Customer' : 'Contact Technician';
    document.getElementById('contact-name').textContent = name;
    document.getElementById('contact-phone').textContent = phone;
    openModal('modal-contact-party');
  }

  function triggerSimulatedCall() {
    const name = document.getElementById('contact-name').textContent;
    const phone = document.getElementById('contact-phone').textContent;
    showToast(`📞 Connecting simulated Co-op Admin desk call to ${name} (${phone})...`, 'info');
  }

  function sendSimulatedMessage() {
    const name = document.getElementById('contact-name').textContent;
    const msg = document.getElementById('contact-sms-input').value.trim() || 'This is an official update from your Cooperative Society dispatch office.';
    closeModal('modal-contact-party');
    showToast(`✓ Official SMS/Notice dispatched to ${name}: "${msg}"`, 'success');
  }

  // ==============================================================
  // CUSTOMER DETAILS DRAWER (PART 1 PRESERVED)
  // ==============================================================
  function openCustomerDetails(customerId) {
    const cust = state.customers.find(c => c.id === customerId);
    if (!cust) return;

    state.currentSelectedCustomerId = customerId;
    document.getElementById('cd-name').textContent = cust.name;
    document.getElementById('cd-id-tag').textContent = `Customer ID: ${cust.id} • Patron Member`;
    document.getElementById('cd-phone').textContent = cust.phone;
    document.getElementById('cd-location').textContent = cust.location;
    document.getElementById('cd-total-completed').textContent = `${cust.completedJobs} Bookings`;

    const list = document.getElementById('cd-booking-history-list');
    list.innerHTML = '';

    const history = state.appointments.filter(a => a.customerName === cust.name || a.customerId === cust.id);
    history.forEach(item => {
      const row = document.createElement('div');
      row.style.background = '#F8FAFC';
      row.style.border = '1px solid var(--border-light)';
      row.style.borderRadius = 'var(--radius-sm)';
      row.style.padding = '10px 12px';
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';

      row.innerHTML = `
        <div>
          <span class="table-booking-id">${item.id}</span>
          <span style="font-weight: 700; margin-left: 8px;">${item.service}</span>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">${item.date} • ${item.time}</div>
        </div>
        <div style="text-align: right;">
          <span class="status-pill ${getStatusClass(item.status)}">${item.status}</span>
          <div style="font-weight: 800; color: var(--primary-blue); margin-top: 2px;">₹${item.amount.toFixed(2)}</div>
        </div>
      `;
      list.appendChild(row);
    });

    openDrawer('drawer-customer-details');
  }

  // ==============================================================
  // PART 2: SERVICES & RATE CARD LOGIC
  // ==============================================================
  function filterServicesCategory(cat) {
    state.servicesCategoryFilter = cat;
    document.querySelectorAll('#svc-cat-filter-pills .filter-pill-btn').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.category || 'ALL') === cat);
    });
    renderServicesTable();
  }

  function filterServicesTable() {
    renderServicesTable();
  }

  function openAddServiceModal() {
    const title = document.getElementById('modal-service-title');
    if (title) title.textContent = 'Add New Cooperative Trade Service';
    document.getElementById('edit-svc-id').value = '';
    document.getElementById('edit-svc-name').value = '';
    document.getElementById('edit-svc-category').value = 'Plumbing';
    document.getElementById('edit-svc-desc').value = '';
    document.getElementById('edit-svc-skill').value = '';
    document.getElementById('edit-svc-time').value = '45 - 90 mins';
    document.getElementById('edit-svc-price').value = '350.00';
    document.getElementById('edit-svc-emergency').value = '550.00';
    document.getElementById('edit-svc-mat-cat').value = 'Standard Trade Hardware';
    openModal('modal-service-edit');
  }

  function openEditServiceModal(serviceId) {
    const svc = state.services.find(s => s.id === serviceId);
    if (!svc) return;

    const title = document.getElementById('modal-service-title');
    if (title) title.textContent = `Edit Cooperative Service: ${svc.name}`;

    document.getElementById('edit-svc-id').value = svc.id;
    document.getElementById('edit-svc-name').value = svc.name;
    document.getElementById('edit-svc-category').value = svc.category;
    document.getElementById('edit-svc-desc').value = svc.description;
    document.getElementById('edit-svc-skill').value = svc.requiredSkill;
    document.getElementById('edit-svc-time').value = svc.estimatedTime;
    document.getElementById('edit-svc-price').value = svc.basePrice.toFixed(2);
    document.getElementById('edit-svc-emergency').value = svc.emergencyCharge.toFixed(2);
    document.getElementById('edit-svc-mat-cat').value = svc.materialCategory;
    openModal('modal-service-edit');
  }

  function saveServiceItem() {
    const idInput = document.getElementById('edit-svc-id').value.trim();
    const name = document.getElementById('edit-svc-name').value.trim();
    const category = document.getElementById('edit-svc-category').value;
    const desc = document.getElementById('edit-svc-desc').value.trim();
    const skill = document.getElementById('edit-svc-skill').value.trim();
    const time = document.getElementById('edit-svc-time').value.trim();
    const price = parseFloat(document.getElementById('edit-svc-price').value) || 350;
    const emerg = parseFloat(document.getElementById('edit-svc-emergency').value) || 550;
    const matCat = document.getElementById('edit-svc-mat-cat').value.trim();

    if (!name || !skill) {
      showToast('Please enter Service Name and Required Skill.', 'warning');
      return;
    }

    if (idInput) {
      const svc = state.services.find(s => s.id === idInput);
      if (svc) {
        svc.name = name;
        svc.category = category;
        svc.description = desc;
        svc.requiredSkill = skill;
        svc.estimatedTime = time;
        svc.basePrice = price;
        svc.emergencyCharge = emerg;
        svc.materialCategory = matCat;
        showToast(`✓ Service "${svc.name}" updated successfully.`, 'success');
      }
    } else {
      const codePrefix = {
        'Plumbing': 'SVC-PL',
        'Electrical': 'SVC-EL',
        'Carpentry': 'SVC-CR',
        'Painting': 'SVC-PT',
        'Cleaning': 'SVC-CL',
        'Appliance Repair': 'SVC-AP',
        'Other Services': 'SVC-OT'
      }[category] || 'SVC-GEN';

      const newId = `${codePrefix}-0${state.services.length + 1}`;
      state.services.push({
        id: newId,
        name: name,
        category: category,
        description: desc,
        requiredSkill: skill,
        estimatedTime: time,
        basePrice: price,
        previousPrice: price,
        emergencyCharge: emerg,
        materialCategory: matCat,
        status: 'Active',
        history: [{ month: 'September 2026', rate: price, approvedBy: 'Board Resolution', change: '+₹0' }]
      });
      showToast(`✓ New Service "${name}" created under code ${newId}.`, 'success');
    }

    closeModal('modal-service-edit');
    renderAll();
  }

  function toggleServiceStatus(serviceId) {
    const svc = state.services.find(s => s.id === serviceId);
    if (!svc) return;

    svc.status = svc.status === 'Active' ? 'Inactive' : 'Active';
    showToast(`Service "${svc.name}" status switched to ${svc.status}.`, svc.status === 'Active' ? 'success' : 'warning');
    renderAll();
  }

  // ==============================================================
  // PART 2: MONTHLY SERVICE RATE MANAGEMENT
  // ==============================================================
  function openRateEditModal(serviceId = null) {
    const select = document.getElementById('edit-rate-service-select');
    if (!select) return;

    select.innerHTML = '';
    state.services.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} (${s.category}) - ₹${s.basePrice}`;
      select.appendChild(opt);
    });

    if (serviceId) select.value = serviceId;
    onRateServiceSelectChange();
    openModal('modal-rate-edit');
  }

  function onRateServiceSelectChange() {
    const select = document.getElementById('edit-rate-service-select');
    if (!select) return;
    const svc = state.services.find(s => s.id === select.value);
    if (!svc) return;

    const prevEl = document.getElementById('edit-rate-prev-display');
    const currInput = document.getElementById('edit-rate-current-input');
    const emergInput = document.getElementById('edit-rate-emergency-input');

    if (prevEl) prevEl.textContent = `₹${svc.previousPrice.toFixed(2)} (August 2026)`;
    if (currInput) currInput.value = svc.basePrice.toFixed(2);
    if (emergInput) emergInput.value = svc.emergencyCharge.toFixed(2);
  }

  function saveSingleRate() {
    const select = document.getElementById('edit-rate-service-select');
    if (!select) return;
    const svc = state.services.find(s => s.id === select.value);
    if (!svc) return;

    const newRate = parseFloat(document.getElementById('edit-rate-current-input').value) || svc.basePrice;
    const newEmerg = parseFloat(document.getElementById('edit-rate-emergency-input').value) || svc.emergencyCharge;

    const diff = newRate - svc.basePrice;
    svc.basePrice = newRate;
    svc.emergencyCharge = newEmerg;

    svc.history.push({
      month: `${state.ratesBoard.currentMonth} (Rev)`,
      rate: newRate,
      approvedBy: state.ratesBoard.resolutionNo,
      change: `${diff >= 0 ? '+' : ''}₹${diff.toFixed(2)}`
    });

    closeModal('modal-rate-edit');
    showToast(`✓ Monthly Rate updated for "${svc.name}" to ₹${newRate.toFixed(2)}.`, 'success');
    renderAll();
  }

  function openRateHistory(serviceId) {
    const svc = state.services.find(s => s.id === serviceId);
    if (!svc) return;

    const title = document.getElementById('history-modal-service-name');
    if (title) title.textContent = `Rate Audit History: ${svc.name} (${svc.category})`;

    const container = document.getElementById('history-timeline-container');
    if (!container) return;
    container.innerHTML = '';

    const history = svc.history || [
      { month: 'July 2026', rate: svc.previousPrice, approvedBy: 'Board Res #B-2026-07', change: '+₹20' },
      { month: 'August 2026', rate: svc.previousPrice, approvedBy: 'Board Res #B-2026-08', change: '₹0' },
      { month: 'September 2026', rate: svc.basePrice, approvedBy: state.ratesBoard.resolutionNo, change: '+₹30' }
    ];

    history.forEach((h, idx) => {
      const card = document.createElement('div');
      card.className = 'history-timeline-card';
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 800; font-size: 14px; color: var(--text-main);">${h.month}</span>
          <span class="rate-change-chip positive" style="font-size: 11px;">${h.change || '₹0'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
          <span style="font-weight: 800; color: var(--primary-blue); font-size: 15px;">₹${(h.rate || h.cost || 0).toFixed(2)}</span>
          <span style="font-size: 12px; color: var(--text-muted);">${h.approvedBy || 'Board Resolution'}</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
          Cooperative standard labour rate verified.
        </div>
      `;
      container.appendChild(card);
    });

    openModal('modal-rate-history');
  }

  function saveRateDraft() {
    state.ratesBoard.status = 'Draft Under Review';
    showToast('Monthly rate changes saved as Working Draft.', 'info');
    renderRatesTable();
  }

  function approveRateBoard() {
    state.ratesBoard.status = 'Approved';
    showToast(`✓ Board Resolution ${state.ratesBoard.resolutionNo} marked as APPROVED by Board of Directors.`, 'success');
    renderRatesTable();
  }

  function publishMonthlyRates() {
    state.ratesBoard.status = 'Published & Live';

    // CRITICAL PRESERVATION RULE:
    // When published, new rates apply ONLY to new upcoming bookings.
    // Existing confirmed bookings (CP-9104, CP-9208, CP-8841) maintain their historical locked price!
    broadcastMarketplace('MONTHLY_RATES_UPDATED', {
      month: state.ratesBoard.currentMonth,
      effectiveDate: state.ratesBoard.effectiveDate,
      resolutionNo: state.ratesBoard.resolutionNo,
      rates: state.services.map(s => ({ id: s.id, name: s.name, rate: s.basePrice, emergency: s.emergencyCharge }))
    });

    showToast(`✓ ${state.ratesBoard.currentMonth} Cooperative Rates published under Res ${state.ratesBoard.resolutionNo}! Applied strictly to new bookings; existing confirmed bookings remain locked.`, 'success');
    renderRatesTable();
  }

  // ==============================================================
  // PART 2: MATERIAL COST MANAGEMENT
  // ==============================================================
  function filterMaterialsCategory(cat) {
    state.materialsCategoryFilter = cat;
    document.querySelectorAll('#mat-cat-filter-pills .filter-pill-btn').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.category || 'ALL') === cat);
    });
    renderMaterialsTable();
  }

  function filterMaterialsTable() {
    renderMaterialsTable();
  }

  function openAddMaterialModal() {
    const title = document.getElementById('modal-material-title');
    if (title) title.textContent = 'Add Cooperative Material / Part';
    document.getElementById('edit-mat-id').value = '';
    document.getElementById('edit-mat-name').value = '';
    document.getElementById('edit-mat-cat').value = 'Plumbing';
    document.getElementById('edit-mat-month').value = 'September 2026';
    document.getElementById('edit-mat-prev-cost').value = '100.00';
    document.getElementById('edit-mat-curr-cost').value = '120.00';
    openModal('modal-material-edit');
  }

  function openEditMaterialModal(matId) {
    const mat = state.materials.find(m => m.id === matId);
    if (!mat) return;

    const title = document.getElementById('modal-material-title');
    if (title) title.textContent = `Edit Cooperative Material: ${mat.name}`;

    document.getElementById('edit-mat-id').value = mat.id;
    document.getElementById('edit-mat-name').value = mat.name;
    document.getElementById('edit-mat-cat').value = mat.category;
    document.getElementById('edit-mat-month').value = mat.month;
    document.getElementById('edit-mat-prev-cost').value = mat.previousCost.toFixed(2);
    document.getElementById('edit-mat-curr-cost').value = mat.currentCost.toFixed(2);
    openModal('modal-material-edit');
  }

  function saveMaterialItem() {
    const idInput = document.getElementById('edit-mat-id').value.trim();
    const name = document.getElementById('edit-mat-name').value.trim();
    const cat = document.getElementById('edit-mat-cat').value;
    const month = document.getElementById('edit-mat-month').value.trim() || 'September 2026';
    const prev = parseFloat(document.getElementById('edit-mat-prev-cost').value) || 0;
    const curr = parseFloat(document.getElementById('edit-mat-curr-cost').value) || 0;

    if (!name || curr <= 0) {
      showToast('Please enter valid Material Name and Standard Cost.', 'warning');
      return;
    }

    if (idInput) {
      const mat = state.materials.find(m => m.id === idInput);
      if (mat) {
        mat.name = name;
        mat.category = cat;
        mat.month = month;
        mat.previousCost = prev;
        mat.currentCost = curr;
        mat.history.push({ month: month, cost: curr });
        showToast(`✓ Material "${name}" cost updated to ₹${curr.toFixed(2)}.`, 'success');
      }
    } else {
      const newId = `MAT-${Math.floor(100 + Math.random() * 900)}`;
      state.materials.push({
        id: newId,
        name: name,
        category: cat,
        previousCost: prev,
        currentCost: curr,
        month: month,
        status: 'In Stock',
        history: [{ month: month, cost: curr }]
      });
      showToast(`✓ Material "${name}" added to registry under code ${newId}.`, 'success');
    }

    closeModal('modal-material-edit');
    renderMaterialsTable();
  }

  function openMaterialHistory(matId) {
    const mat = state.materials.find(m => m.id === matId);
    if (!mat) return;

    const title = document.getElementById('history-modal-service-name');
    if (title) title.textContent = `Material Wholesale Price Audit: ${mat.name}`;

    const container = document.getElementById('history-timeline-container');
    if (!container) return;
    container.innerHTML = '';

    (mat.history || []).forEach(h => {
      const card = document.createElement('div');
      card.className = 'history-timeline-card';
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 800; font-size: 14px;">${h.month}</span>
          <span class="rate-change-chip positive">Audited Price</span>
        </div>
        <div style="font-weight: 800; color: var(--primary-blue); font-size: 16px; margin-top: 4px;">
          ₹${h.cost.toFixed(2)}
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
          Certified Cooperative Supply Wholesale Rate
        </div>
      `;
      container.appendChild(card);
    });

    openModal('modal-rate-history');
  }

  // ==============================================================
  // PART 2: ESTIMATE MONITORING & AUDIT ACTIONS
  // ==============================================================
  function filterEstimates(status) {
    state.estimatesFilter = status;
    document.querySelectorAll('#estimate-filter-pills .filter-pill-btn').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.status || 'ALL') === status);
    });
    renderEstimatesTable();
  }

  function filterEstimatesTable() {
    renderEstimatesTable();
  }

  function openEstimateFlagModal(bookingId) {
    const est = state.estimates.find(e => e.bookingId === bookingId);
    if (!est) return;

    state.currentSelectedBookingId = bookingId;
    const tagEl = document.getElementById('est-modal-booking-tag');
    const svcEl = document.getElementById('est-modal-service');
    const partiesEl = document.getElementById('est-modal-parties');
    const pillEl = document.getElementById('est-modal-status-pill');
    const totalEl = document.getElementById('est-modal-total-display');

    if (tagEl) tagEl.textContent = `Job Estimate Audit: #${est.bookingId}`;
    if (svcEl) svcEl.textContent = est.service;
    if (partiesEl) partiesEl.textContent = `Customer: ${est.customerName} • Artisan: ${est.workerName} (#${est.workerId})`;
    if (pillEl) pillEl.textContent = est.status;
    if (totalEl) totalEl.textContent = `Total: ₹${est.totalEstimate.toFixed(2)} (Labour: ₹${est.labourCost} + Parts: ₹${est.materialsCost})`;

    const probEl = document.getElementById('est-modal-problem');
    const labEl = document.getElementById('est-modal-labour');
    const matEl = document.getElementById('est-modal-materials');

    if (probEl) probEl.textContent = est.problemDesc || 'Standard trade service diagnosis';
    if (labEl) labEl.textContent = `Base labour: ₹${est.labourCost.toFixed(2)}`;
    if (matEl) matEl.textContent = est.materialDetails;

    openModal('modal-estimate-flag');
  }

  function flagEstimateForReview() {
    if (!state.currentSelectedBookingId) return;
    const est = state.estimates.find(e => e.bookingId === state.currentSelectedBookingId);
    if (!est) return;

    const remarksInput = document.getElementById('est-flag-remarks');
    const reason = remarksInput && remarksInput.value.trim() ? remarksInput.value.trim() : 'Flagged for standard rate review & markup audit';

    est.auditStatus = 'Flagged for Review';
    est.auditNotes = `Flagged: ${reason}`;

    closeModal('modal-estimate-flag');
    showToast(`⚠️ Estimate #${est.bookingId} flagged for audit review: "${reason}"`, 'warning');

    broadcastMarketplace('ESTIMATE_AUDIT_FLAGGED', {
      bookingId: est.bookingId,
      customerName: est.customerName,
      workerName: est.workerName,
      reason: reason
    });

    renderEstimatesTable();
  }

  // ==============================================================
  // PART 2: SUPPORT TICKETS ACTIONS
  // ==============================================================
  function filterTickets(cat) {
    state.ticketsCategoryFilter = cat;
    renderTicketsTable();
  }

  function filterTicketsTable() {
    renderTicketsTable();
  }

  function openTicketDetails(ticketId) {
    const tck = state.tickets.find(t => t.id === ticketId);
    if (!tck) return;

    state.currentSelectedTicketId = ticketId;

    const titleEl = document.getElementById('ticket-modal-title');
    const bIdEl = document.getElementById('ticket-modal-booking-id');
    const custEl = document.getElementById('ticket-modal-customer');
    const dateEl = document.getElementById('ticket-modal-date');
    const prioEl = document.getElementById('ticket-modal-priority');
    const statEl = document.getElementById('ticket-modal-status');
    const probEl = document.getElementById('ticket-modal-problem');

    if (titleEl) titleEl.textContent = `${tck.id}: ${tck.subject}`;
    if (bIdEl) bIdEl.textContent = tck.bookingId || 'General Inquiry';
    if (custEl) custEl.textContent = `${tck.customerName} (${tck.customerPhone})`;
    if (dateEl) dateEl.textContent = tck.date;
    if (prioEl) prioEl.textContent = tck.priority;
    if (statEl) statEl.textContent = tck.status;
    if (probEl) probEl.textContent = tck.notes;

    const staffSelect = document.getElementById('ticket-assign-staff-select');
    if (staffSelect) staffSelect.value = tck.assignedTo;

    const updateSelect = document.getElementById('ticket-status-update-select');
    if (updateSelect) updateSelect.value = tck.status;

    openModal('modal-ticket-details');
  }

  function saveTicketResolution() {
    const tck = state.tickets.find(t => t.id === state.currentSelectedTicketId);
    if (!tck) return;

    const newStaff = document.getElementById('ticket-assign-staff-select').value;
    const newStatus = document.getElementById('ticket-status-update-select').value;

    tck.assignedTo = newStaff;
    tck.status = newStatus;
    tck.lastActivity = 'Just now';

    closeModal('modal-ticket-details');
    showToast(`✓ Ticket #${tck.id} updated to "${newStatus}" assigned to ${newStaff}.`, 'success');
    renderTicketsTable();
  }

  function openChatWithCustomer(customerId) {
    closeModal('modal-ticket-details');
    navigateTo('messages');
    const conv = state.conversations.find(c => c.targetId === customerId || c.type === 'customer');
    if (conv) {
      selectConversation(conv.id);
    }
  }

  // ==============================================================
  // PART 2: WELFARE PROGRAMS & DISBURSEMENT
  // ==============================================================
  function filterWelfareProgram(prog) {
    state.welfareProgramFilter = prog;
    renderWelfareTables();
  }

  function openRecordWelfareModal(workerId = null) {
    const select = document.getElementById('welfare-worker-select');
    if (select) {
      select.innerHTML = '';
      state.workers.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${w.name} (#${w.id}) - ${w.primarySkill}`;
        select.appendChild(opt);
      });
      if (workerId) select.value = workerId;
    }
    openModal('modal-welfare-record');
  }

  function confirmRecordWelfare() {
    const workerId = document.getElementById('welfare-worker-select').value;
    const prog = document.getElementById('welfare-program-select').value;
    const amt = parseFloat(document.getElementById('welfare-amount-input').value) || 5000;
    const notes = document.getElementById('welfare-remarks-input').value.trim() || 'Board welfare committee approval';

    const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
    const workerName = worker ? `${worker.name} (#${worker.id})` : `Artisan #${workerId}`;

    state.welfareHistory.unshift({
      date: 'Today (23 Sep)',
      workerName: workerName,
      program: prog,
      amount: amt,
      resolutionNote: `Res #WEL-2026/09 - ${notes}`,
      status: 'Disbursed'
    });

    const wRecord = state.welfareWorkers.find(w => w.workerId === workerId);
    if (wRecord) {
      wRecord.totalDisbursed += amt;
      wRecord.lastBenefit = `${prog} (₹${amt.toFixed(2)})`;
    }

    closeModal('modal-welfare-record');
    showToast(`✓ Welfare benefit of ₹${amt.toFixed(2)} disbursed to ${workerName} under ${prog}!`, 'success');
    renderWelfareTables();
  }

  // ==============================================================
  // PART 2: WORKER INSURANCE ACTIONS
  // ==============================================================
  function filterInsuranceStatus(status) {
    state.insuranceStatusFilter = status;
    document.querySelectorAll('#insurance-status-filter-pills .filter-pill-btn').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.status || 'ALL') === status);
    });
    renderInsuranceTable();
  }

  function filterInsuranceTable() {
    renderInsuranceTable();
  }

  function renewExpiringInsurance(policyId = null) {
    if (policyId) {
      const ins = state.insurance.find(i => i.id === policyId);
      if (ins) {
        ins.status = 'Active';
        ins.expiryDate = '23 Sep 2027';
        showToast(`✓ Insurance Policy ${ins.policyNo} for ${ins.workerName} successfully renewed for +1 Year!`, 'success');
      }
    } else {
      // Renew all expiring policies
      state.insurance.forEach(ins => {
        if (ins.status === 'Expiring Soon') {
          ins.status = 'Active';
          ins.expiryDate = '23 Sep 2027';
        }
      });
      showToast('✓ All expiring artisan insurance policies successfully renewed for +1 Year under Cooperative Pool!', 'success');
    }
    renderInsuranceTable();
  }

  function openAddInsuranceModal() {
    const title = document.getElementById('modal-insurance-title');
    if (title) title.textContent = 'Enroll Worker in Group Insurance';

    const select = document.getElementById('ins-worker-select');
    if (select) {
      select.innerHTML = '';
      state.workers.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${w.name} (#${w.id}) - ${w.primarySkill}`;
        select.appendChild(opt);
      });
    }

    document.getElementById('ins-provider-input').value = 'National Insurance Co. Ltd.';
    document.getElementById('ins-policy-input').value = `GI-COOP-${Math.floor(10000 + Math.random() * 90000)}`;
    document.getElementById('ins-coverage-input').value = '₹5,00,000 Group Accident + ₹3,00,000 Medical';
    document.getElementById('ins-expiry-input').value = '23 Sep 2027';
    openModal('modal-insurance-edit');
  }

  function openEditInsuranceModal(insId) {
    const ins = state.insurance.find(i => i.id === insId);
    if (!ins) return;

    const title = document.getElementById('modal-insurance-title');
    if (title) title.textContent = `Edit Insurance Policy: ${ins.policyNo}`;

    const select = document.getElementById('ins-worker-select');
    if (select) {
      select.innerHTML = `<option value="${ins.workerId}">${ins.workerName} (#${ins.workerId})</option>`;
      select.value = ins.workerId;
    }

    document.getElementById('ins-provider-input').value = ins.provider;
    document.getElementById('ins-policy-input').value = ins.policyNo;
    document.getElementById('ins-coverage-input').value = ins.coverage;
    document.getElementById('ins-expiry-input').value = ins.expiryDate;
    openModal('modal-insurance-edit');
  }

  function saveInsurancePolicy() {
    const workerId = document.getElementById('ins-worker-select').value;
    const provider = document.getElementById('ins-provider-input').value.trim();
    const policyNo = document.getElementById('ins-policy-input').value.trim();
    const coverage = document.getElementById('ins-coverage-input').value.trim();
    const expiry = document.getElementById('ins-expiry-input').value.trim();

    const existing = state.insurance.find(i => i.workerId === workerId);
    if (existing) {
      existing.provider = provider;
      existing.policyNo = policyNo;
      existing.coverage = coverage;
      existing.expiryDate = expiry;
      existing.status = 'Active';
      showToast(`✓ Insurance Policy ${policyNo} updated for ${existing.workerName}.`, 'success');
    } else {
      const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
      const name = worker ? worker.name : `Artisan #${workerId}`;
      const trade = worker ? worker.primarySkill : 'Plumbing';
      state.insurance.push({
        id: `INS-${workerId}`,
        workerId: workerId,
        workerName: name,
        trade: trade,
        policyNo: policyNo,
        provider: provider,
        policyType: 'Group Accident & Medical',
        coverage: coverage,
        expiryDate: expiry,
        status: 'Active'
      });
      showToast(`✓ Worker ${name} enrolled into policy ${policyNo}.`, 'success');
    }

    closeModal('modal-insurance-edit');
    renderInsuranceTable();
  }

  function openRecordClaimModal() {
    const select = document.getElementById('claim-worker-select');
    if (select) {
      select.innerHTML = '';
      state.workers.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `${w.name} (#${w.id}) - Policy Active`;
        select.appendChild(opt);
      });
    }
    openModal('modal-insurance-claim');
  }

  function saveInsuranceClaim() {
    const workerId = document.getElementById('claim-worker-select').value;
    const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
    const name = worker ? worker.name : `Artisan #${workerId}`;
    const amt = document.getElementById('claim-amount-input').value || '15,000';

    closeModal('modal-insurance-claim');
    showToast(`✓ Insurance claim of ₹${amt} logged for ${name}. Dispatched to National Insurance desk.`, 'success');
  }

  // ==============================================================
  // PART 2: PRE-CALL VERIFICATION MODAL
  // ==============================================================
  function openPreCallModal(partyType, targetName = null, phone = null, bookingId = null) {
    const isWorker = partyType === 'worker';

    let finalName = targetName;
    let finalPhone = phone;
    let finalBooking = bookingId || state.currentSelectedBookingId || 'CP-9104';

    if (!finalName) {
      if (isWorker) {
        finalName = 'Ramesh Kumar';
        finalPhone = '+91 98450 40201';
      } else {
        finalName = 'P. Vishnu Vardhan';
        finalPhone = '+91 98480 22338';
      }
    }

    const titleEl = document.getElementById('precall-modal-title');
    const typeEl = document.getElementById('precall-target-type');
    const nameEl = document.getElementById('precall-target-name');
    const phoneEl = document.getElementById('precall-target-phone');
    const bookEl = document.getElementById('precall-booking-id');

    if (titleEl) titleEl.textContent = `Pre-Call Verification: ${isWorker ? 'Technician Dispatch' : 'Customer Support'}`;
    if (typeEl) typeEl.textContent = isWorker ? 'Cooperative Registered Artisan' : 'Patron Customer';
    if (nameEl) nameEl.textContent = finalName;
    if (phoneEl) phoneEl.textContent = finalPhone;
    if (bookEl) bookEl.textContent = finalBooking;

    openModal('modal-pre-call-verification');
  }

  function confirmInitiateCall() {
    const name = document.getElementById('precall-target-name').textContent;
    const phone = document.getElementById('precall-target-phone').textContent;
    const purpose = document.getElementById('precall-purpose-select').value;

    closeModal('modal-pre-call-verification');
    showToast(`📞 Connecting secured recorded call to ${name} (${phone}) for "${purpose}"... Line connected.`, 'info');
  }

  // ==============================================================
  // PART 2: PAYMENTS & FINANCIAL FILTERS
  // ==============================================================
  function filterPaymentsRange(range) {
    state.paymentsRangeFilter = range;
    document.querySelectorAll('#payment-date-filter-pills .filter-pill-btn').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.range || 'Today') === range);
    });
    renderPaymentsTable();
  }

  function filterPaymentsTable() {
    renderPaymentsTable();
  }

  // ==============================================================
  // CROSS-APP EVENT LISTENER (FROM CUSTOMER & WORKER APPS)
  // ==============================================================
  function handleCrossAppMarketplaceEvent(eventData) {
    if (!eventData || !eventData.action) return;
    const action = eventData.action;
    const payload = eventData.payload || {};

    console.log('Admin received ecosystem event:', action, payload);

    if (action === 'NEW_BOOKING_REQUEST') {
      const bId = payload.bookingId || ('CP-' + Math.floor(1000 + Math.random() * 9000));
      const reqType = payload.requestType || 'INSTANT';

      const existingIndex = state.appointments.findIndex(a => a.id === bId);
      const newBooking = {
        id: bId,
        customerName: payload.customerName || 'P. Vishnu Vardhan',
        customerPhone: payload.customerPhone || '+91 98480 22338',
        customerId: 'CUST-1049',
        service: payload.service || 'Plumbing Leakage & Pipe Repair',
        subIssue: payload.problem || 'Customer requested service via mobile app.',
        date: payload.selectedDate || 'Today (23 Sep)',
        time: payload.selectedTime || 'Just Now',
        location: payload.customerLocation || 'Indiranagar 100ft Rd, Bengaluru',
        requestType: reqType,
        status: reqType === 'EMERGENCY' ? 'Requested' : 'Matching',
        workerId: null,
        workerName: null,
        workerPhone: '',
        amount: payload.amount || (reqType === 'EMERGENCY' ? 599.00 : 348.00),
        eta: reqType === 'EMERGENCY' ? '< 15 mins target' : '15-20 mins'
      };

      if (existingIndex >= 0) {
        state.appointments[existingIndex] = { ...state.appointments[existingIndex], ...newBooking };
      } else {
        state.appointments.unshift(newBooking);
      }

      if (reqType === 'EMERGENCY') {
        state.emergencyActive.id = bId;
        state.emergencyActive.service = newBooking.service;
        state.emergencyActive.customerName = newBooking.customerName;
        state.emergencyActive.status = 'Searching';
        showToast(`🚨 CRITICAL EMERGENCY SOS: #${bId} received from ${newBooking.customerName}!`, 'emergency');
      } else {
        showToast(`New Customer Booking: #${bId} (${newBooking.service}) received!`, 'info');
      }

      renderAll();
    } else if (action === 'WORKER_ACCEPTED_JOB') {
      const bId = payload.bookingId || 'CP-9104';
      const app = state.appointments.find(a => a.id === bId);
      if (app) {
        app.status = 'Worker Assigned';
        app.workerName = payload.workerName || 'Ramesh Kumar';
        app.workerId = payload.workerId || '402';
        app.workerPhone = payload.workerPhone || '+91 98450 40201';
      }

      showToast(`Worker Assigned: ${payload.workerName || 'Ramesh Kumar'} accepted booking #${bId}.`, 'success');
      renderAll();
    } else if (action === 'JOB_STATUS_UPDATED') {
      const bId = payload.bookingId || 'CP-9104';
      const app = state.appointments.find(a => a.id === bId);
      if (app) {
        if (payload.status === 'ON_THE_WAY') {
          app.status = 'On the Way';
          app.eta = payload.eta || '10 mins';
          showToast(`Worker is on the way for booking #${bId} (ETA ${app.eta}).`, 'info');
        } else if (payload.status === 'WORKER_ARRIVED') {
          app.status = 'Arrived';
          showToast(`Worker has arrived at customer doorstep for #${bId}.`, 'success');
        } else if (payload.status === 'JOB_IN_PROGRESS' || payload.status === 'CUSTOMER_VERIFIED') {
          app.status = 'In Progress';
          showToast(`Repair started: In Progress on #${bId}.`, 'info');
        }
      }
      renderAll();
    } else if (action === 'WORK_STARTED') {
      const bId = payload.bookingId || 'CP-9104';
      const app = state.appointments.find(a => a.id === bId);
      if (app) {
        app.status = 'In Progress';
        showToast(`Work in Progress for #${bId}. Technician actively repairing.`, 'info');
      }
      renderAll();
    } else if (action === 'WORK_COMPLETED') {
      const bId = payload.bookingId || 'CP-9104';
      const app = state.appointments.find(a => a.id === bId);
      if (app) {
        app.status = 'Completed';
        showToast(`✓ Work Completed for #${bId}! Payment due.`, 'success');
      }
      renderAll();
    } else if (action === 'PAYMENT_COMPLETED') {
      const bId = payload.bookingId || 'CP-9104';
      const app = state.appointments.find(a => a.id === bId);
      if (app) {
        app.status = 'Completed';
        app.paymentStatus = 'Settled';
      }
      showToast(`✓ Payment Completed for #${bId}! Service ledger updated.`, 'success');
      renderAll();
    }
  }

  // Cross-App Listener Initialization
  if (marketplaceChannel) {
    marketplaceChannel.onmessage = (e) => {
      handleCrossAppMarketplaceEvent(e.data);
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'coop_marketplace_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleCrossAppMarketplaceEvent(parsed);
      } catch (err) {}
    }
  });

  // ==============================================================
  // SIMULATION TOOLS (FOR 1-TAP REVIEW & VERIFICATION)
  // ==============================================================
  function simulateBooking(type) {
    const bookingId = type === 'EMERGENCY' ? 'SOS-' + Math.floor(1000 + Math.random() * 9000) : 'CP-' + Math.floor(1000 + Math.random() * 9000);
    const services = {
      'INSTANT': 'Plumbing Leakage & Pipe Repair',
      'PRE-BOOKING': 'Electrical Switchboard Overhaul',
      'EMERGENCY': 'Major Pipe Burst / Ceilings Flood'
    };

    handleCrossAppMarketplaceEvent({
      action: 'NEW_BOOKING_REQUEST',
      payload: {
        bookingId: bookingId,
        requestType: type,
        service: services[type],
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        customerLocation: 'Indiranagar 100ft Rd, Bengaluru',
        amount: type === 'EMERGENCY' ? 599.00 : 348.00
      }
    });

    broadcastMarketplace('NEW_BOOKING_REQUEST', {
      bookingId: bookingId,
      requestType: type,
      service: services[type],
      customerName: 'P. Vishnu Vardhan',
      customerPhone: '+91 98480 22338',
      customerLocation: 'Indiranagar 100ft Rd, Bengaluru'
    });
  }

  function simulateWorkerAccept(bookingId = 'CP-9104') {
    handleCrossAppMarketplaceEvent({
      action: 'WORKER_ACCEPTED_JOB',
      payload: {
        bookingId: bookingId,
        requestType: 'INSTANT',
        workerName: 'Ramesh Kumar',
        workerId: '402',
        workerPhone: '+91 98450 40201'
      }
    });

    broadcastMarketplace('WORKER_ACCEPTED_JOB', {
      bookingId: bookingId,
      requestType: 'INSTANT',
      workerName: 'Ramesh Kumar',
      workerId: '402',
      workerPhone: '+91 98450 40201'
    });
  }

  function simulateWorkerStatus(bookingId, status) {
    const targetStatus = status || 'On the Way';
    let wireStatus = 'ON_THE_WAY';
    if (targetStatus === 'Arrived') wireStatus = 'WORKER_ARRIVED';
    else if (targetStatus === 'In Progress') wireStatus = 'JOB_IN_PROGRESS';
    else if (targetStatus === 'Completed') wireStatus = 'COMPLETED';

    if (targetStatus === 'Completed') {
      handleCrossAppMarketplaceEvent({
        action: 'WORK_COMPLETED',
        payload: { bookingId: bookingId, service: 'Plumbing Leakage & Pipe Repair', finalAmount: 479.00 }
      });
      broadcastMarketplace('WORK_COMPLETED', {
        bookingId: bookingId,
        service: 'Plumbing Leakage & Pipe Repair',
        finalAmount: 479.00
      });
    } else {
      handleCrossAppMarketplaceEvent({
        action: 'JOB_STATUS_UPDATED',
        payload: { bookingId: bookingId, status: wireStatus, eta: '8 mins' }
      });
      broadcastMarketplace('JOB_STATUS_UPDATED', {
        bookingId: bookingId,
        status: wireStatus,
        eta: '8 mins'
      });
    }
  }

  function setWorkerFilter(status) {
    state.workerFilter = status;
    document.querySelectorAll('#worker-status-filter-pills .filter-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.status === status);
    });
    renderWorkersTable();
  }

  function filterWorkersTable() {
    renderWorkersTable();
  }

  function filterAppointmentsTable() {
    renderAppointmentsTable();
  }

  function filterCustomersTable() {
    renderCustomersTable();
  }

  function refreshData(userTriggered = false) {
    renderAll();
    if (userTriggered) showToast('Data synchronized across cooperative channels.', 'success');
  }

  // ==============================================================
  // HELPER STATUS CSS MAPPER
  // ==============================================================
  function getStatusClass(status) {
    switch (status) {
      case 'Approved':
      case 'Active':
      case 'Customer Approved':
      case 'Confirmed':
      case 'Completed':
      case 'Settled':
      case 'In Stock':
        return 'approved';
      case 'Under Review':
      case 'Matching':
      case 'On the Way':
      case 'Arrived':
      case 'In Progress':
      case 'Worker Assigned':
      case 'Pending Customer Approval':
      case 'Expiring Soon':
        return 'under-review';
      case 'Pending':
      case 'Requested':
      case 'Open':
        return 'pending';
      case 'Rejected':
      case 'Suspended':
      case 'Cancelled':
      case 'Discontinued':
      case 'Disputed':
      case 'Flagged for Review':
        return 'rejected';
      default:
        return 'pending';
    }
  }

  // ==============================================================
  // INITIALIZATION & EVENT SETUP
  // ==============================================================

  // ==============================================================
  // PART 3: WORKFORCE ALLOCATION & MATCHING ENGINE
  // ==============================================================

  function switchWorkforceSubtab(tab) {
    state.activeWorkforceSubtab = tab;
    const btnAlloc = document.getElementById('subtab-btn-wf-alloc');
    const btnAvail = document.getElementById('subtab-btn-wf-avail');
    const contentAlloc = document.getElementById('subtab-content-wf-alloc');
    const contentAvail = document.getElementById('subtab-content-wf-avail');

    if (tab === 'alloc') {
      if (btnAlloc) btnAlloc.classList.add('active');
      if (btnAvail) btnAvail.classList.remove('active');
      if (contentAlloc) contentAlloc.classList.add('active');
      if (contentAvail) contentAvail.classList.remove('active');
      renderWorkforceAllocation();
    } else {
      if (btnAlloc) btnAlloc.classList.remove('active');
      if (btnAvail) btnAvail.classList.add('active');
      if (contentAlloc) contentAlloc.classList.remove('active');
      if (contentAvail) contentAvail.classList.add('active');
      renderWorkforceAvailability();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function onAllocationRequestChange() {
    const select = document.getElementById('alloc-request-select');
    if (!select) return;
    state.activeAllocationRequestId = select.value;
    renderWorkforceAllocation();
  }


  // Helper to safely get worker presence status string ('Online' | 'Standby' | 'Offline' | 'Busy')
  function getWorkerStatus(w) {
    if (!w) return 'Offline';
    if (w.status) return w.status;
    if (w.isOnline) {
      return w.isAssigned ? 'Busy' : 'Online';
    }
    return 'Offline';
  }

  function getWorkerId(w) {
    if (!w) return '';
    return String(w.id || '').replace('WRK-', '');
  }

  function getWorkerAvatar(w) {
    if (!w) return 'assets/images/default-avatar.svg';
    return w.avatarUrl || w.avatar || 'assets/images/default-avatar.svg';
  }

  function getCandidatesForRequest(reqId) {
    const req = state.allocationRequests[reqId] || state.allocationRequests['CP-9104'];
    const candidates = state.workers.map(w => {
      // 1. Skill Match
      let skillScore = 12;
      let skillLevel = 'Basic';
      let skillBadge = 'badge-gray';
      if (w.primarySkill.toLowerCase() === req.category.toLowerCase()) {
        skillScore = 30;
        skillLevel = 'High (Primary Specialist)';
        skillBadge = 'badge-green';
      } else if (w.secondarySkills.some(s => s.toLowerCase().includes(req.category.toLowerCase()) || req.category.toLowerCase().includes(s.toLowerCase()))) {
        skillScore = 20;
        skillLevel = 'Medium (Cross-Trained)';
        skillBadge = 'badge-blue';
      }

      // 2. Distance Calculation
      let distKm = 2.5;
      const cleanReqLoc = (req.location || '').split(',')[0].trim().toLowerCase();
      const cleanWorkerArea = (w.serviceArea || '').toLowerCase();
      const numId = getWorkerId(w);
      if (cleanWorkerArea.includes(cleanReqLoc) || cleanReqLoc.includes(cleanWorkerArea)) {
        distKm = (numId === '402' ? 1.2 : (numId === '108' ? 0.8 : 2.1));
      } else {
        distKm = (numId === '315' ? 2.8 : (numId === '508' ? 5.4 : 6.2));
      }
      let distScore = Math.max(5, Math.round(25 - (distKm * 2.5)));

      // 3. Worker Availability
      const wStatus = getWorkerStatus(w);
      let availScore = (wStatus === 'Online' ? 15 : (wStatus === 'Standby' ? 10 : 3));

      // 4. Current Workload & Active Assignments
      let activeJobs = (numId === '402' ? 1 : (numId === '108' ? 1 : 0));
      let workloadScore = activeJobs === 0 ? 10 : (activeJobs === 1 ? 8 : 4);

      // 5. Service Area Match
      let areaScore = cleanWorkerArea.includes(cleanReqLoc) ? 10 : 6;

      // 6. Emergency Availability
      const isEmergencyReady = (w.emergencyReady === 'Available' || w.emergencyReady === true);
      let emgScore = isEmergencyReady ? 5 : 0;
      if (req.urgency.includes('EMERGENCY') && isEmergencyReady) emgScore = 10;

      // 7. Previous Assignments & Rating
      let ratingScore = Math.round(((w.rating || 4.5) / 5) * 5);

      // Total Composite Score %
      let totalScore = Math.min(99, skillScore + distScore + availScore + workloadScore + areaScore + emgScore + ratingScore);

      // Deterministic realism overrides for demo requests
      if (reqId === 'CP-9104' && numId === '402') totalScore = 98; // Ramesh Kumar for Indiranagar Plumbing
      if (reqId === 'SOS-1092' && numId === '108') totalScore = 99; // Vikram Sen for Koramangala SOS
      if (reqId === 'CP-9208' && numId === '204') totalScore = 96; // Mohan Lal for HSR Carpentry

      return {
        worker: w,
        score: totalScore,
        skillLevel,
        skillBadge,
        distanceKm: distKm.toFixed(1),
        currentJobs: activeJobs,
        availability: wStatus,
        serviceArea: w.serviceArea,
        emergencyReady: isEmergencyReady,
        completedJobs: w.completedJobs || 0,
        rating: w.rating || 4.5
      };
    });

    return candidates.sort((a, b) => b.score - a.score);
  }

  function renderWorkforceAllocation() {
    const reqId = state.activeAllocationRequestId || 'CP-9104';
    const req = state.allocationRequests[reqId] || state.allocationRequests['CP-9104'];

    // Update Request Banner UI
    const elId = document.getElementById('alloc-active-booking-id');
    const elTitle = document.getElementById('alloc-active-service-title');
    const elMeta = document.getElementById('alloc-active-meta');
    const elUrgency = document.getElementById('alloc-active-urgency');
    const select = document.getElementById('alloc-request-select');

    if (select && select.value !== reqId) select.value = reqId;
    if (elId) elId.textContent = req.id;
    if (elTitle) elTitle.textContent = req.serviceTitle;
    if (elMeta) {
      elMeta.textContent = `Location: ${req.location} • Customer: ${req.customer} (${req.phone}) • Scheduled: ${req.scheduledTime}`;
    }
    if (elUrgency) {
      elUrgency.textContent = req.urgency;
      elUrgency.className = `status-badge ${req.urgencyBadge}`;
    }

    // Render Candidates Grid
    const container = document.getElementById('allocation-candidates-container');
    if (!container) return;

    const candidates = getCandidatesForRequest(reqId);
    let html = '';

    candidates.forEach((cand, index) => {
      const isRecommended = index === 0;
      const w = cand.worker;
      const numId = getWorkerId(w);
      const isCurrentlyAssigned = (req.currentWorkerId === w.id || req.currentWorkerId === numId || req.currentWorkerId === 'WRK-' + numId);
      const wStatus = getWorkerStatus(w);
      const avatarSrc = getWorkerAvatar(w);

      html += `
        <div class="candidate-card ${isRecommended ? 'recommended' : ''}" id="cand-card-${numId}">
          <div class="candidate-card-header">
            <div class="candidate-avatar">
              <img src="${avatarSrc}" alt="${w.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=1D4ED8&color=fff'">
              <span class="status-indicator-dot ${wStatus.toLowerCase()}"></span>
            </div>
            <div class="candidate-title-block">
              <div class="candidate-name-row">
                <h4>${w.name}</h4>
                <span class="artisan-id-tag">#${numId}</span>
                ${isRecommended ? '<span class="recommended-badge"><i data-lucide="award" style="width: 12px; height: 12px;"></i> Recommended Worker</span>' : ''}
              </div>
              <p class="candidate-trade-sub">${w.primarySkill} Specialist • ${w.experience} • Zone: <strong>${w.serviceArea}</strong></p>
            </div>
            <div class="candidate-score-badge ${cand.score >= 90 ? 'score-high' : (cand.score >= 75 ? 'score-medium' : 'score-low')}">
              <span class="score-num">${cand.score}%</span>
              <span class="score-lbl">Match Score</span>
            </div>
          </div>

          <!-- 8 Matching Criteria Grid -->
          <div class="candidate-criteria-grid">
            <div class="criteria-cell">
              <span class="crit-label"><i data-lucide="sparkles" style="width: 12px; height: 12px;"></i> 1. Skill Match</span>
              <span class="crit-value"><span class="status-badge ${cand.skillBadge}">${cand.skillLevel}</span></span>
            </div>
            <div class="criteria-cell">
              <span class="crit-label"><i data-lucide="map-pin" style="width: 12px; height: 12px;"></i> 2. Distance</span>
              <span class="crit-value font-mono"><strong>${cand.distanceKm} km</strong> from client</span>
            </div>
            <div class="criteria-cell">
              <span class="crit-label"><i data-lucide="activity" style="width: 12px; height: 12px;"></i> 3. Availability</span>
              <span class="crit-value"><span class="status-badge ${wStatus === 'Online' ? 'badge-green' : (wStatus === 'Standby' ? 'badge-blue' : 'badge-gray')}">${wStatus}</span></span>
            </div>
            <div class="criteria-cell">
              <span class="crit-label"><i data-lucide="briefcase" style="width: 12px; height: 12px;"></i> 4. Current Workload</span>
              <span class="crit-value"><strong>${cand.currentJobs} Active Job</strong> today</span>
            </div>
            <div class="criteria-cell">
              <span class="crit-label"><i data-lucide="navigation" style="width: 12px; height: 12px;"></i> 5. Service Area</span>
              <span class="crit-value">Primary: <strong>${w.serviceArea}</strong></span>
            </div>
            <div class="criteria-cell">
              <span class="crit-label"><i data-lucide="siren" style="width: 12px; height: 12px;"></i> 6. Emergency Ready</span>
              <span class="crit-value">${cand.emergencyReady ? '<span class="status-badge badge-green"><i data-lucide="check" style="width: 10px; height: 10px;"></i> Rapid Responder</span>' : '<span class="status-badge badge-gray">Standard Only</span>'}</span>
            </div>
            <div class="criteria-cell">
              <span class="crit-label"><i data-lucide="layers" style="width: 12px; height: 12px;"></i> 7. Current Assignments</span>
              <span class="crit-value font-mono">${cand.currentJobs} allocated / 4 cap</span>
            </div>
            <div class="criteria-cell">
              <span class="crit-label"><i data-lucide="star" style="width: 12px; height: 12px;"></i> 8. Previous Assignments</span>
              <span class="crit-value"><strong>${cand.rating}★</strong> (${cand.completedJobs} completed)</span>
            </div>
          </div>

          <!-- Admin Action Bar -->
          <div class="candidate-actions-footer">
            <div class="footer-left">
              ${isCurrentlyAssigned 
                ? '<span class="status-badge badge-green"><i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Currently Assigned to this Request</span>'
                : `<button class="btn btn-primary btn-sm" onclick="window.adminApp.assignCandidateWorker('${w.id}')" title="Allocate this worker to request ${reqId}">
                    <i data-lucide="user-check" style="width: 13px; height: 13px;"></i> Assign Artisan
                  </button>`
              }
              ${isCurrentlyAssigned
                ? `<button class="btn btn-outline btn-sm" onclick="window.adminApp.reassignCandidateWorker('${w.id}')" title="Reassign to another candidate">
                    <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i> Reassign
                  </button>`
                : ''
              }
              <button class="btn btn-secondary btn-sm" onclick="window.adminApp.viewCandidateLocation('${w.id}')" title="View live GPS coordinates & transit ETA">
                <i data-lucide="map" style="width: 13px; height: 13px;"></i> View Location
              </button>
            </div>
            <div class="footer-right">
              <button class="btn btn-outline btn-sm" onclick="window.adminApp.openWorkerDetails('${w.id}')" title="View complete worker profile & credentials">
                <i data-lucide="user" style="width: 13px; height: 13px;"></i> Profile
              </button>
              <button class="btn btn-outline btn-sm" onclick="window.adminApp.openPreCallModal('${w.id}')" title="Call artisan with pre-call verification">
                <i data-lucide="phone" style="width: 13px; height: 13px;"></i> Call
              </button>
              <button class="btn btn-outline btn-sm" style="color: #6B7280;" onclick="window.adminApp.manualOverrideCandidate('${w.id}')" title="Manual administrative override">
                <i data-lucide="shield-alert" style="width: 13px; height: 13px;"></i> Override
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  function assignCandidateWorker(workerId) {
    const reqId = state.activeAllocationRequestId || 'CP-9104';
    const req = state.allocationRequests[reqId];
    const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
    if (!req || !worker) return;

    req.currentWorkerId = workerId;
    req.currentStatus = 'ALLOCATED';

    // Update appointment if in state.appointments
    const appt = state.appointments.find(a => a.id === reqId);
    if (appt) {
      appt.workerId = worker.id;
      appt.workerName = worker.name;
      appt.status = 'ASSIGNED';
      renderAppointmentsTable();
      renderDashboardAppointments();
    }

    // Broadcast allocation event across cooperative ecosystem
    const eventPayload = {
      type: 'WORKER_ALLOCATED',
      bookingId: reqId,
      workerId: worker.id,
      workerName: worker.name,
      customer: req.customer,
      service: req.serviceTitle,
      timestamp: new Date().toISOString()
    };

    try {
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel('coop_marketplace_channel');
        bc.postMessage(eventPayload);
      }
      localStorage.setItem('coop_marketplace_event', JSON.stringify(eventPayload));
    } catch (e) {
      console.warn('Broadcast channel unavailable:', e);
    }

    showToast(`Artisan ${worker.name} successfully assigned to booking ${reqId}! Broadcast dispatched to Customer & Worker apps.`, 'success');
    renderWorkforceAllocation();
    recalculateMetrics();
  }

  function reassignCandidateWorker(workerId) {
    const reqId = state.activeAllocationRequestId || 'CP-9104';
    const req = state.allocationRequests[reqId];
    if (!req) return;

    req.currentWorkerId = null;
    req.currentStatus = 'PENDING_ALLOCATION';

    showToast(`Booking ${reqId} reopened for allocation. Choose another candidate worker.`, 'info');
    renderWorkforceAllocation();
  }

  function manualOverrideCandidate(workerId) {
    const reqId = state.activeAllocationRequestId || 'CP-9104';
    const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
    if (!worker) return;

    const reason = prompt(`Enter administrative override justification for allocating ${worker.name} to ${reqId}:`, 'Emergency field proximity directive by Cooperative Operations Desk');
    if (!reason) return;

    assignCandidateWorker(workerId);
    showToast(`Manual override logged: "${reason}". Artisan ${worker.name} allocated.`, 'success');
  }

  function viewCandidateLocation(workerId) {
    const reqId = state.activeAllocationRequestId || 'CP-9104';
    const req = state.allocationRequests[reqId] || state.allocationRequests['CP-9104'];
    const worker = state.workers.find(w => w.id === workerId || getWorkerId(w) === String(workerId).replace('WRK-', ''));
    if (!worker || !req) return;

    state.activeInspectingCandidateId = workerId;
    const modal = document.getElementById('modal-candidate-location');
    if (!modal) return;

    const cand = getCandidatesForRequest(reqId).find(c => c.worker.id === workerId) || { distanceKm: '1.2' };
    const etaMinutes = Math.round(parseFloat(cand.distanceKm) * 5 + 4);

    const elName = document.getElementById('loc-modal-worker-name');
    const elMeta = document.getElementById('loc-modal-worker-meta');
    const elDist = document.getElementById('loc-modal-distance-text');
    const elEta = document.getElementById('loc-modal-eta-text');
    const elCust = document.getElementById('loc-modal-customer-addr');
    const elPos = document.getElementById('loc-modal-worker-pos');

    if (elName) elName.textContent = `${worker.name} (#${worker.id.replace('WRK-', '')}) — Proximity Radar`;
    if (elMeta) elMeta.textContent = `Current Zone: ${worker.serviceArea} • Trade: ${worker.primarySkill} (${worker.status})`;
    if (elDist) elDist.textContent = `${cand.distanceKm} km`;
    if (elEta) elEta.textContent = `~${etaMinutes} mins`;
    if (elCust) elCust.textContent = `${req.location} (${req.customer})`;
    if (elPos) elPos.textContent = `${worker.serviceArea} Sector Base (${worker.status})`;

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  function confirmAssignCandidateFromLocation() {
    if (state.activeInspectingCandidateId) {
      assignCandidateWorker(state.activeInspectingCandidateId);
      closeModal('modal-candidate-location');
    }
  }

  // ==============================================================
  // WORKFORCE AVAILABILITY & SECTOR DEPLOYMENTS
  // ==============================================================

  function renderWorkforceAvailability() {
    const avail = state.workforceAvailability;

    // Update Availability KPIs
    const elTotal = document.getElementById('avail-kpi-total');
    const elOnline = document.getElementById('avail-kpi-online');
    const elAvail = document.getElementById('avail-kpi-available');
    const elAssigned = document.getElementById('avail-kpi-assigned');
    const elOffline = document.getElementById('avail-kpi-offline');
    const elEmergency = document.getElementById('avail-kpi-emergency');

    if (elTotal) elTotal.textContent = avail.total;
    if (elOnline) elOnline.textContent = avail.online;
    if (elAvail) elAvail.textContent = avail.available;
    if (elAssigned) elAssigned.textContent = avail.assigned;
    if (elOffline) elOffline.textContent = avail.offline;
    if (elEmergency) elEmergency.textContent = avail.emergency;

    // Render Trade Skill Availability Bars
    const skillContainer = document.getElementById('skill-availability-bars-container');
    if (skillContainer) {
      let skillHtml = '';
      avail.trades.forEach(t => {
        const pctOnline = Math.round((t.online / t.total) * 100);
        skillHtml += `
          <div class="skill-avail-item">
            <div class="skill-avail-header">
              <span class="skill-avail-name">${t.skill}</span>
              <span class="skill-avail-stats">${t.online} Online / ${t.total} Total (${t.available} Available)</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pctOnline}%; background: ${t.color};"></div>
            </div>
          </div>
        `;
      });
      skillContainer.innerHTML = skillHtml;
    }

    // Render Service Area Deployment Bars
    const areaContainer = document.getElementById('area-availability-bars-container');
    if (areaContainer) {
      let areaHtml = '';
      avail.areas.forEach(a => {
        const pct = Math.round((a.online / a.total) * 100);
        areaHtml += `
          <div class="skill-avail-item">
            <div class="skill-avail-header">
              <span class="skill-avail-name">${a.name}</span>
              <span class="skill-avail-stats">${a.online} Active / ${a.total} Deployed (${a.available} Free)</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pct}%; background: #059669;"></div>
            </div>
          </div>
        `;
      });
      areaContainer.innerHTML = areaHtml;
    }

    // Render Live Artisan Roster Table
    const tbody = document.getElementById('workforce-deployments-tbody');
    if (tbody) {
      let rosterHtml = '';
      state.workers.forEach(w => {
        const numId = getWorkerId(w);
        const wStatus = getWorkerStatus(w);
        const avatarSrc = getWorkerAvatar(w);
        const isEmg = (w.emergencyReady === 'Available' || w.emergencyReady === true);
        rosterHtml += `
          <tr>
            <td>
              <div class="table-user-cell">
                <img src="${avatarSrc}" class="table-avatar" alt="${w.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=1D4ED8&color=fff'">
                <div>
                  <strong style="color: var(--text-main);">${w.name}</strong>
                  <span class="text-xs text-muted" style="display: block;">#${numId} • ${w.phone}</span>
                </div>
              </div>
            </td>
            <td><span class="status-badge badge-blue">${w.primarySkill}</span></td>
            <td><strong>${w.serviceArea}</strong></td>
            <td>
              <span class="status-badge ${wStatus === 'Online' ? 'badge-green' : (wStatus === 'Standby' ? 'badge-blue' : 'badge-gray')}">
                <span class="status-indicator-dot ${wStatus.toLowerCase()}" style="display: inline-block; margin-right: 4px;"></span>
                ${wStatus}
              </span>
            </td>
            <td>
              ${numId === '402' ? '<span class="status-badge badge-orange font-mono">CP-9104</span>' : (numId === '108' ? '<span class="status-badge badge-red font-mono">SOS-1092</span>' : '<span class="text-muted">None (Available)</span>')}
            </td>
            <td>
              ${isEmg ? '<span class="status-badge badge-green"><i data-lucide="check" style="width: 10px; height: 10px;"></i> Ready</span>' : '<span class="text-muted">Standard</span>'}
            </td>
            <td>
              <div class="table-actions">
                <button class="action-icon-btn" onclick="window.adminApp.viewCandidateLocation('${w.id}')" title="Live Sector GPS">
                  <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                </button>
                <button class="action-icon-btn" onclick="window.adminApp.openPreCallModal('${w.id}')" title="Pre-Call Artisan">
                  <i data-lucide="phone" style="width: 14px; height: 14px;"></i>
                </button>
                <button class="action-icon-btn" onclick="window.adminApp.openWorkerDetails('${w.id}')" title="Worker File">
                  <i data-lucide="user" style="width: 14px; height: 14px;"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = rosterHtml;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function rebalanceArtisanShifts() {
    showToast('Rebalancing active shifts across Indiranagar & Koramangala sectors based on current live queue.', 'info');
    state.workforceAvailability.available += 2;
    state.workforceAvailability.online = Math.min(48, state.workforceAvailability.online + 2);
    renderWorkforceAvailability();
  }

  function openShiftPlanningModal() {
    openModal('modal-plan-shifts');
  }

  function saveShiftPlan() {
    const trade = document.getElementById('shift-plan-trade-select')?.value || 'Plumbing';
    const slot = document.getElementById('shift-plan-slot-select')?.value || 'Morning (08:00 - 14:00)';
    const count = document.getElementById('shift-plan-count-input')?.value || '4';

    showToast(`Shift Plan Committed: ${count} artisans scheduled for ${trade} during ${slot}.`, 'success');
    closeModal('modal-plan-shifts');
    renderWorkforceAvailability();
  }

  // ==============================================================
  // AI DEMAND FORECASTING & WORKFORCE GAP PLANNING
  // ==============================================================

  function switchForecastSubtab(tab) {
    state.activeForecastSubtab = tab;
    const btnDemand = document.getElementById('subtab-btn-fc-demand');
    const btnPlan = document.getElementById('subtab-btn-fc-planning');
    const contentDemand = document.getElementById('subtab-content-fc-demand');
    const contentPlan = document.getElementById('subtab-content-fc-planning');

    if (tab === 'demand') {
      if (btnDemand) btnDemand.classList.add('active');
      if (btnPlan) btnPlan.classList.remove('active');
      if (contentDemand) contentDemand.classList.add('active');
      if (contentPlan) contentPlan.classList.remove('active');
      renderAIForecast();
    } else {
      if (btnDemand) btnDemand.classList.remove('active');
      if (btnPlan) btnPlan.classList.add('active');
      if (contentDemand) contentDemand.classList.remove('active');
      if (contentPlan) contentPlan.classList.add('active');
      renderWorkforceGap();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function renderAIForecast() {
    const container = document.getElementById('forecast-trade-cards-container');
    if (!container) return;

    let html = '';
    state.forecastDemand.trades.forEach(t => {
      const isDeficit = t.gap < 0;
      html += `
        <div class="forecast-trade-card">
          <div class="forecast-trade-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="background: var(--bg-hover); padding: 6px; border-radius: var(--radius-sm); color: var(--primary);">
                <i data-lucide="${t.icon || 'briefcase'}" style="width: 16px; height: 16px;"></i>
              </div>
              <strong style="font-size: 0.95rem; color: var(--text-main);">${t.trade}</strong>
            </div>
            <span class="demand-level-pill ${t.demandLevel.toLowerCase()}">
              Predicted Demand: ${t.demandLevel}
            </span>
          </div>

          <div class="forecast-metrics-grid">
            <div class="fc-metric">
              <span class="fc-label">Expected Jobs (7d)</span>
              <span class="fc-val">${t.expectedJobs}</span>
            </div>
            <div class="fc-metric">
              <span class="fc-label">Available Workers</span>
              <span class="fc-val">${t.availableWorkers}</span>
            </div>
            <div class="fc-metric">
              <span class="fc-label">Required Capacity</span>
              <span class="fc-val">${t.requiredWorkers}</span>
            </div>
            <div class="fc-metric">
              <span class="fc-label">Forecast Gap</span>
              <span class="fc-val ${isDeficit ? 'gap-negative' : 'gap-positive'}">
                ${isDeficit ? `${t.gap} (Deficit)` : `+${t.gap} (Surplus)`}
              </span>
            </div>
          </div>

          <div class="forecast-footer-row">
            <span class="fc-trend ${t.trend.startsWith('+') ? 'trend-up' : 'trend-down'}">
              <i data-lucide="${t.trend.startsWith('+') ? 'trending-up' : 'trending-down'}" style="width: 12px; height: 12px;"></i>
              ${t.trend} vs Prior Week
            </span>
            <span class="ai-confidence-pill">
              Forecast Confidence: ${t.confidence}%
            </span>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;

    // Render Location Forecast Matrix
    const locContainer = document.getElementById('location-forecast-container');
    if (locContainer) {
      let locHtml = '';
      state.forecastDemand.locations.forEach(l => {
        locHtml += `
          <div class="location-fc-item">
            <div>
              <strong style="color: var(--text-main); font-size: 0.9rem;">${l.area}</strong>
              <span class="text-xs text-muted" style="display: block;">Dominant Service: ${l.highDemandTrade}</span>
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 1rem; color: var(--primary);">${l.expectedVolume} Jobs</strong>
              <span class="status-badge ${l.surgeRisk.startsWith('High') ? 'badge-red' : (l.surgeRisk.startsWith('Medium') ? 'badge-orange' : 'badge-green')}" style="display: block; margin-top: 3px;">
                ${l.surgeRisk}
              </span>
            </div>
          </div>
        `;
      });
      locContainer.innerHTML = locHtml;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function recalculateAIForecast() {
    showToast('Recalculating AI Demand Forecast based on live weather data and recent booking surge velocity...', 'info');
    setTimeout(() => {
      state.forecastDemand.trades.forEach(t => {
        t.confidence = Math.min(96, Math.max(82, t.confidence + (Math.floor(Math.random() * 5) - 2)));
      });
      renderAIForecast();
      showToast('AI Demand Forecast updated with latest confidence metrics.', 'success');
    }, 600);
  }

  function renderWorkforceGap() {
    const tbody = document.getElementById('workforce-gap-tbody');
    if (!tbody) return;

    let html = '';
    state.forecastDemand.trades.forEach(t => {
      const isDeficit = t.gap < 0;
      const absGap = Math.abs(t.gap);
      let recommendation = '';
      if (isDeficit) {
        recommendation = `<strong>${absGap} additional worker capacity may be required.</strong> Mobilize standby roster for Indiranagar & Koramangala.`;
      } else {
        recommendation = `Sufficient artisan capacity. Option to re-cluster ${absGap} workers to high-demand trade zones.`;
      }

      html += `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="background: var(--bg-hover); padding: 5px; border-radius: var(--radius-sm); color: var(--primary);">
                <i data-lucide="${t.icon || 'briefcase'}" style="width: 14px; height: 14px;"></i>
              </div>
              <strong>${t.trade}</strong>
            </div>
          </td>
          <td class="font-mono"><strong>${t.expectedJobs}</strong></td>
          <td class="font-mono">${t.availableWorkers}</td>
          <td class="font-mono"><strong>${t.requiredWorkers}</strong></td>
          <td>
            ${isDeficit 
              ? `<span class="gap-chip-deficit"><i data-lucide="alert-circle" style="width: 12px; height: 12px;"></i> Deficit: ${t.gap}</span>`
              : `<span class="gap-chip-surplus"><i data-lucide="check" style="width: 12px; height: 12px;"></i> Surplus: +${t.gap}</span>`
            }
          </td>
          <td><span class="demand-level-pill ${t.demandLevel.toLowerCase()}">${t.demandLevel} (${t.confidence}%)</span></td>
          <td style="font-size: 0.85rem; color: var(--text-main);">${recommendation}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  function mobilizeStandbyWorkers() {
    showToast('Mobilizing 8 standby cooperative artisans to active online status for weekend surge.', 'success');
    state.workforceAvailability.online += 8;
    state.workforceAvailability.available += 8;
    state.workforceAvailability.emergency = Math.max(0, state.workforceAvailability.emergency - 4);
    // Reduce plumbing and electrical deficits
    state.forecastDemand.trades[0].availableWorkers += 4;
    state.forecastDemand.trades[0].gap = state.forecastDemand.trades[0].availableWorkers - state.forecastDemand.trades[0].requiredWorkers;
    state.forecastDemand.trades[1].availableWorkers += 4;
    state.forecastDemand.trades[1].gap = state.forecastDemand.trades[1].availableWorkers - state.forecastDemand.trades[1].requiredWorkers;
    renderWorkforceAvailability();
    renderWorkforceGap();
  }

  function reclusterServiceAreas() {
    showToast('Re-clustering 5 artisans from surplus zones (Central & Jayanagar) to high-demand Indiranagar & Koramangala.', 'success');
    renderWorkforceAvailability();
    renderWorkforceGap();
  }

  function increaseEmergencyCoverage() {
    showToast('Emergency standby coverage expanded by +50%. 12 artisans designated for Rapid Response.', 'success');
    state.workforceAvailability.emergency = 12;
    renderWorkforceAvailability();
  }

  function executeRecommendedAllocation() {
    showToast('Bulk Recommended Allocation executed for all pending requests. Workers dispatched based on 8-factor score.', 'success');
    assignCandidateWorker('WRK-402'); // Ramesh Kumar for CP-9104
    renderWorkforceAllocation();
    recalculateMetrics();
  }

  // ==============================================================
  // 12 STATUTORY & OPERATIONAL COOPERATIVE REPORTS
  // ==============================================================

  const reportDefinitions = {
    'WORKER_PERFORMANCE': {
      title: 'Artisan Performance & Quality Audit Report',
      subtitle: 'Evaluation of worker ratings, on-time arrivals, job completion times, and cooperative welfare equity shares.',
      columns: ['Artisan ID', 'Name & Trade', 'Service Area', 'Customer Rating', 'Jobs Completed', 'On-Time Arrival %', 'Repeat Request %', 'Artisan Earnings (88%)', 'Coop Welfare Margin (12%)'],
      getData: () => [
        ['#402', 'Ramesh Kumar (Plumbing)', 'Indiranagar', '4.9★', '142', '98.5%', '24%', '₹68,400', '₹9,320'],
        ['#108', 'Vikram Sen (Electrical)', 'Koramangala', '4.8★', '115', '96.2%', '19%', '₹54,200', '₹7,390'],
        ['#315', 'Suresh Patil (Plumbing)', 'Indiranagar', '4.7★', '89', '94.0%', '15%', '₹39,800', '₹5,430'],
        ['#204', 'Mohan Lal (Carpentry)', 'HSR Layout', '4.7★', '78', '95.1%', '18%', '₹41,200', '₹5,620'],
        ['#508', 'Anand Rao (Electrical)', 'Central Bengaluru', '4.6★', '64', '92.8%', '11%', '₹32,500', '₹4,430']
      ],
      kpis: [
        { label: 'Active Artisans Audited', value: '48', meta: '100% verified registry' },
        { label: 'Cooperative Rating Avg', value: '4.81★', meta: 'Exceeds 4.50 SLA target' },
        { label: 'On-Time Dispatch Rate', value: '96.4%', meta: 'Within 15-min emergency window' },
        { label: 'Artisan Equity Share', value: '88.0%', meta: 'Guaranteed cooperative distribution' }
      ]
    },
    'CUSTOMER_BOOKINGS': {
      title: 'Customer Bookings & Patronage Volume Report',
      subtitle: 'Complete breakdown of scheduled appointments, completed services, cancellations, and repeat patronage rates.',
      columns: ['Booking ID', 'Customer Name', 'Trade / Service', 'Scheduled Slot', 'Status', 'Assigned Artisan', 'Billed Amount', 'Payment Method'],
      getData: () => [
        ['CP-9104', 'P. Vishnu Vardhan', 'Plumbing Leakage & Pipe Repair', 'Today, 11:30 AM', 'ALLOCATED', 'Ramesh Kumar (#402)', '₹680.00', 'UPI (Escrowed)'],
        ['SOS-1092', 'Ananya Sharma', 'Main Electrical Spark & MCB', 'Immediate SOS', 'DISPATCHED', 'Vikram Sen (#108)', '₹950.00', 'Coop Credit'],
        ['CP-9208', 'Anil Kumble', 'Teakwood Bookshelf Assembly', 'Tomorrow, 10:00 AM', 'PENDING', 'Mohan Lal (#204)', '₹1,450.00', 'Card'],
        ['CP-8841', 'Sunita Reddy', 'Deep Villa Sanitization', 'Yesterday, 09:00 AM', 'COMPLETED', 'Suresh Patil (#315)', '₹3,200.00', 'Net Banking'],
        ['CP-8830', 'Devendra Murthy', 'Ceiling Fan Installation', '22 Sep 2026', 'COMPLETED', 'Vikram Sen (#108)', '₹450.00', 'UPI']
      ],
      kpis: [
        { label: 'Total Bookings (Month)', value: '156', meta: '+18% growth vs Aug' },
        { label: 'Completed Jobs', value: '142', meta: '91% completion rate' },
        { label: 'Cancellation Rate', value: '3.2%', meta: 'Lowest in regional benchmark' },
        { label: 'Repeat Customer Ratio', value: '68%', meta: 'Loyal cooperative patrons' }
      ]
    },
    'SERVICE_DEMAND': {
      title: 'Service Category Demand & Trend Analysis',
      subtitle: 'Comparative request volume, emergency vs scheduled distribution, and seasonal surge trends across 7 trade sectors.',
      columns: ['Trade Sector', 'Monthly Bookings', 'Demand Share %', 'Emergency SOS %', 'Avg Lead Time', 'Peak Request Hours', 'Revenue Generated'],
      getData: () => [
        ['Plumbing', '54', '34.6%', '22%', '1.8 hrs', '08:00 - 12:00', '₹1,58,400'],
        ['Electrical', '42', '26.9%', '38%', '1.2 hrs', '17:00 - 21:00', '₹1,32,600'],
        ['Carpentry', '24', '15.4%', '4%', '6.5 hrs', '10:00 - 16:00', '₹84,200'],
        ['Cleaning & Sanitization', '18', '11.5%', '0%', '24 hrs (Pre-book)', '09:00 - 14:00', '₹57,600'],
        ['Painting & Waterproofing', '10', '6.4%', '0%', '48 hrs', '09:00 - 17:00', '₹38,000'],
        ['Appliance Repair', '8', '5.2%', '12%', '3.4 hrs', '11:00 - 18:00', '₹15,700']
      ],
      kpis: [
        { label: 'Top Demand Sector', value: 'Plumbing (34.6%)', meta: '54 monthly dispatches' },
        { label: 'Emergency Surge Share', value: '24.2%', meta: 'Mainly electrical sparks & leaks' },
        { label: 'Unserved Requests', value: '0', meta: '100% fulfilled via cooperative' },
        { label: 'Weekend Demand Spike', value: '+42%', meta: 'Saturday & Sunday peaks' }
      ]
    },
    'REVENUE_MARGIN': {
      title: 'Revenue, Cooperative Margin & Artisan Share Report',
      subtitle: 'Audit of gross transaction volume, artisan earnings distribution (88%), and cooperative reserve allocations (12%).',
      columns: ['Service Category', 'Gross GMV (₹)', 'Artisan Payout 88% (₹)', 'Cooperative Margin 12% (₹)', 'Welfare Corpus Share (₹)', 'Net Reserve Fund (₹)'],
      getData: () => [
        ['Plumbing', '₹1,58,400', '₹1,39,392', '₹19,008', '₹7,920', '₹11,088'],
        ['Electrical', '₹1,32,600', '₹1,16,688', '₹15,912', '₹6,630', '₹9,282'],
        ['Carpentry', '₹84,200', '₹74,096', '₹10,104', '₹4,210', '₹5,894'],
        ['Cleaning', '₹57,600', '₹50,688', '₹6,912', '₹2,880', '₹4,032'],
        ['Painting', '₹38,000', '₹33,440', '₹4,560', '₹1,900', '₹2,660'],
        ['Appliance', '₹15,700', '₹13,816', '₹1,884', '₹785', '₹1,099']
      ],
      kpis: [
        { label: 'Total Gross GMV', value: '₹4,86,500', meta: 'September 2026 MTD' },
        { label: 'Artisan Distribution', value: '₹4,28,120', meta: '88% direct to worker ledger' },
        { label: 'Cooperative Margin', value: '₹58,380', meta: '12% administrative & reserve' },
        { label: 'Welfare Corpus Addition', value: '₹24,325', meta: 'Statutory artisan security' }
      ]
    },
    'MATERIAL_COSTS': {
      title: 'Material Consumption & Standard Rate Audit Report',
      subtitle: 'Comparison between cooperative bulk catalog prices, artisan billed materials, and client markup governance.',
      columns: ['Material Item', 'Category', 'Billed Units', 'Coop Approved Rate (₹)', 'Actual Billed Rate (₹)', 'Variance (₹)', 'Audit Compliance'],
      getData: () => [
        ['PVC Pipe 1 inch (per meter)', 'Plumbing', '420 m', '₹135.00', '₹135.00', '₹0.00', 'COMPLIANT'],
        ['Teflon Thread Seal Tape', 'Plumbing', '180 rolls', '₹25.00', '₹25.00', '₹0.00', 'COMPLIANT'],
        ['Brass Bib Tap 0.5 inch', 'Plumbing', '64 pcs', '₹450.00', '₹450.00', '₹0.00', 'COMPLIANT'],
        ['Copper Wire 2.5 sq mm (90m coil)', 'Electrical', '28 coils', '₹3,200.00', '₹3,200.00', '₹0.00', 'COMPLIANT'],
        ['MCB Double Pole 32A', 'Electrical', '35 pcs', '₹450.00', '₹450.00', '₹0.00', 'COMPLIANT'],
        ['Waterproof Exterior Emulsion 20L', 'Painting', '14 drums', '₹5,800.00', '₹5,800.00', '₹0.00', 'COMPLIANT']
      ],
      kpis: [
        { label: 'Total Materials Billed', value: '₹64,200', meta: 'Across 142 completed jobs' },
        { label: 'Cooperative Base Total', value: '₹64,200', meta: 'Zero unapproved markups' },
        { label: 'Bulk Wholesale Savings', value: '₹14,800', meta: 'Saved for customers & artisans' },
        { label: 'Audit Verification Rate', value: '100%', meta: 'Fully reconciled with invoices' }
      ]
    },
    'RATE_CHANGES': {
      title: 'Monthly Rate Card Revisions & Board Governance Log',
      subtitle: 'Historical record of monthly labor rates, board resolutions, quorum signatures, and customer notice periods.',
      columns: ['Resolution #', 'Effective Month', 'Trade Service', 'Prior Base Rate (₹)', 'Revised Rate (₹)', 'Change %', 'Board Quorum Status', 'Published Date'],
      getData: () => [
        ['RES-2026-09', 'Sep 2026', 'Plumbing Leakage & Pipe Repair', '₹350.00', '₹380.00', '+8.6%', 'ADOPTED (3/3 Signed)', '28 Aug 2026'],
        ['RES-2026-09', 'Sep 2026', 'Main MCB & Electrical Spark', '₹420.00', '₹450.00', '+7.1%', 'ADOPTED (3/3 Signed)', '28 Aug 2026'],
        ['RES-2026-08', 'Aug 2026', 'Water Tank & Pipe Sanitization', '₹500.00', '₹550.00', '+10.0%', 'ADOPTED (3/3 Signed)', '28 Jul 2026'],
        ['RES-2026-07', 'Jul 2026', 'Teakwood Furniture Assembly', '₹320.00', '₹350.00', '+9.4%', 'ADOPTED (3/3 Signed)', '27 Jun 2026'],
        ['RES-2026-10', 'Oct 2026', 'All 7 Service Categories', 'Variable', 'Variable', '+5.0% Index', 'PENDING (2/3 Signed)', 'Scheduled 28 Sep']
      ],
      kpis: [
        { label: 'Resolutions Passed (2026)', value: '4', meta: 'Strict democratic quorum' },
        { label: 'Avg Rate Revision', value: '+7.4%', meta: 'Indexed to state CPI inflation' },
        { label: 'Customer Notice Window', value: '14 Days', meta: 'Advance publication compliance' },
        { label: 'Historical Grandfathering', value: 'Active', meta: 'Old rates locked for old bookings' }
      ]
    },
    'WELFARE_SUPPORT': {
      title: 'Artisan Welfare Fund & Social Security Disbursement Report',
      subtitle: 'Statutory accounting of cooperative welfare contributions, emergency medical grants, tool subsidies, and education aid.',
      columns: ['Grant ID', 'Artisan Beneficiary', 'Welfare Scheme', 'Amount Disbursed (₹)', 'Disbursement Date', 'Committee Approval', 'Disbursement Channel'],
      getData: () => [
        ['WLF-401', 'Mohan Lal (#204)', 'Artisan Child Education Grant', '₹15,000.00', '04 Sep 2026', 'Welfare Sub-committee', 'Direct Bank Transfer'],
        ['WLF-398', 'Suresh Patil (#315)', 'Tool Upgrade & Safety Kit Subsidy', '₹8,500.00', '28 Aug 2026', 'Technical Board', 'Voucher Redeemed'],
        ['WLF-382', 'Vikram Sen (#108)', 'Emergency Health Treatment Aid', '₹18,000.00', '15 Aug 2026', 'Board President', 'Hospital Direct Pay'],
        ['WLF-370', 'Ramesh Kumar (#402)', 'Annual Health Checkup & Dental', '₹4,500.00', '02 Aug 2026', 'Welfare Desk', 'Cooperative Clinic'],
        ['WLF-365', 'Anand Rao (#508)', 'Digital Smartphone Tool Grant', '₹12,000.00', '18 Jul 2026', 'Digital Division', 'Direct Bank Transfer']
      ],
      kpis: [
        { label: 'Total Welfare Corpus', value: '₹4,68,500', meta: 'Held in Nationalized Bank' },
        { label: 'Grants Disbursed (2026)', value: '₹58,000', meta: '14 artisan families assisted' },
        { label: 'Education Aid Disbursed', value: '₹22,500', meta: 'Scholarships for artisan kids' },
        { label: 'Artisan Participation', value: '100%', meta: 'All 48 enrolled members' }
      ]
    },
    'INSURANCE_STATUS': {
      title: 'Artisan Insurance Compliance & Policy Status Report',
      subtitle: 'Monitoring of Group Personal Accident (GPA), workman compensation policies, claim settlement ratios, and 30-day renewal queues.',
      columns: ['Policy Number', 'Artisan Name', 'Coverage Type', 'Sum Insured (₹)', 'Premium Paid (₹)', 'Expiration Date', 'Status', 'Claim History'],
      getData: () => [
        ['POL-8841-COOP', 'Vikram Sen (#108)', 'Group Personal Accident & Disability', '₹5,00,000', '₹900.00', '27 Sep 2026', 'EXPIRING SOON', '0 Claims'],
        ['POL-9104-COOP', 'Ramesh Kumar (#402)', 'Workman Compensation + Medical', '₹5,00,000', '₹900.00', '14 Oct 2026', 'ACTIVE', '1 Settled (₹12k)'],
        ['POL-7729-COOP', 'Suresh Patil (#315)', 'Group Personal Accident', '₹5,00,000', '₹900.00', '19 Nov 2026', 'ACTIVE', '0 Claims'],
        ['POL-6218-COOP', 'Mohan Lal (#204)', 'Group Personal Accident & Tool Cover', '₹6,00,000', '₹1,100.00', '05 Dec 2026', 'ACTIVE', '0 Claims'],
        ['POL-5541-COOP', 'Anand Rao (#508)', 'High Voltage Hazard Protection', '₹7,50,000', '₹1,350.00', '22 Jan 2027', 'ACTIVE', '0 Claims']
      ],
      kpis: [
        { label: 'Artisans Insured', value: '48 of 48', meta: '100% universal protection' },
        { label: 'Policies Due (30 Days)', value: '4', meta: 'Automatic renewal queued' },
        { label: 'Claim Settlement Ratio', value: '100%', meta: 'Zero rejected claims' },
        { label: 'Cooperative Premium Pool', value: '₹43,200', meta: 'Subsidized 50% by coop fund' }
      ]
    },
    'ALLOCATION_QUALITY': {
      title: 'AI Workforce Allocation Quality & Matching SLA Report',
      subtitle: 'Performance audit of the 8-factor automated matching engine, artisan dispatch distances, travel latencies, and manual overrides.',
      columns: ['Request ID', 'Trade', 'Sector', 'Top Candidate', 'Calculated Match %', 'Selected Worker', 'Dispatch Distance', 'Admin Override Reason', 'Customer Rating'],
      getData: () => [
        ['CP-9104', 'Plumbing', 'Indiranagar', 'Ramesh Kumar (#402)', '98%', 'Ramesh Kumar (#402)', '1.2 km', 'None (Auto-Match)', '5.0★'],
        ['SOS-1092', 'Electrical', 'Koramangala', 'Vikram Sen (#108)', '99%', 'Vikram Sen (#108)', '0.8 km', 'None (Auto-Match)', '5.0★ (Pending)'],
        ['CP-9208', 'Carpentry', 'HSR Layout', 'Mohan Lal (#204)', '96%', 'Mohan Lal (#204)', '1.1 km', 'None (Auto-Match)', 'Scheduled'],
        ['CP-8841', 'Cleaning', 'Whitefield', 'Suresh Patil (#315)', '89%', 'Suresh Patil (#315)', '2.4 km', 'None (Auto-Match)', '4.8★'],
        ['CP-8812', 'Plumbing', 'Indiranagar', 'Suresh Patil (#315)', '88%', 'Ramesh Kumar (#402)', '1.5 km', 'Specialist requested by client', '4.9★']
      ],
      kpis: [
        { label: 'Automated Match Acceptance', value: '94.8%', meta: 'Adhered to top recommendation' },
        { label: 'Avg Dispatch Distance', value: '1.4 km', meta: 'Minimizes carbon footprint' },
        { label: 'Avg Travel Latency', value: '8.2 mins', meta: 'Well within customer SLA' },
        { label: 'Manual Admin Overrides', value: '5.2%', meta: 'Special client requests only' }
      ]
    },
    'EMERGENCY_REQUESTS': {
      title: 'Emergency SOS Response & Safety Incident Report',
      subtitle: 'Critical audit of emergency requests, response times (<15 min SLA), rapid responder deployments, and resolved hazards.',
      columns: ['SOS Incident ID', 'Customer', 'Location Sector', 'Hazard Description', 'Responder Artisan', 'Dispatch Latency', 'Time to Site', 'Resolution Outcome'],
      getData: () => [
        ['SOS-1092', 'Ananya Sharma', 'Koramangala 4th Block', 'Main MCB Sparks & Burning Smell', 'Vikram Sen (#108)', '45 seconds', '9.2 mins', 'IN TRANSIT (Active)'],
        ['SOS-1088', 'Rajesh Gupta', 'Indiranagar 100ft Rd', 'Major Overhead Pipe Burst', 'Ramesh Kumar (#402)', '1.2 mins', '11.4 mins', 'RESOLVED (Isolated & Repaired)'],
        ['SOS-1081', 'Kavita Menon', 'HSR Sector 2', 'Geyser Electrical Short & Shock', 'Vikram Sen (#108)', '55 seconds', '8.5 mins', 'RESOLVED (Thermostat Replaced)'],
        ['SOS-1074', 'Dr. Arvind Rao', 'Whitefield Inner Circle', 'Basement Sump Pump Flooding', 'Suresh Patil (#315)', '2.1 mins', '14.0 mins', 'RESOLVED (Pump Cleared)'],
        ['SOS-1065', 'Pooja Hegde', 'Central Bengaluru', 'Main Distribution Board Failure', 'Anand Rao (#508)', '1.1 mins', '12.8 mins', 'RESOLVED (Phase Fuse Restored)']
      ],
      kpis: [
        { label: 'Total Emergency Dispatches', value: '18', meta: 'Past 30 calendar days' },
        { label: 'Avg Response Time', value: '11.4 mins', meta: 'Well below 15-min emergency SLA' },
        { label: 'Zero Incident Mishaps', value: '100% Safe', meta: 'Zero worker electrical injuries' },
        { label: 'Rapid Responders On-Call', value: '12', meta: 'Certified first-aid & safety' }
      ]
    },
    'COMPLAINTS_SLA': {
      title: 'Member Grievance, Customer Feedback & SLA Compliance Report',
      subtitle: 'Detailed log of client and artisan grievance tickets, investigation resolutions, and cooperative mediation turnaround.',
      columns: ['Ticket ID', 'Complainant', 'Type', 'Subject Matter', 'Priority', 'Assigned Mediator', 'Turnaround Time', 'Resolution Status'],
      getData: () => [
        ['TCK-801', 'P. Vishnu Vardhan (Customer)', 'Billing Inquiry', 'Clarification on GST vs Labor component on CP-9104', 'NORMAL', 'Admin Desk', '22 mins', 'RESOLVED (Explanation Sent)'],
        ['TCK-794', 'Anand Rao (Artisan)', 'Payment Inquiry', 'Clarification on weekly bonus calculation', 'NORMAL', 'Coop Accountant', '1.5 hrs', 'RESOLVED (Recalculated)'],
        ['TCK-782', 'Sunita Reddy (Customer)', 'Schedule Delay', 'Artisan arrived 8 mins late due to rain', 'LOW', 'Support Desk', '35 mins', 'CLOSED (Patron Apology & Credit)'],
        ['TCK-765', 'Karthik N. (Customer)', 'Work Quality', 'Cabinet door hinge loose after fitting', 'HIGH', 'Chief Inspector', '4.0 hrs', 'RESOLVED (Re-serviced Free)'],
        ['TCK-750', 'Vikram Sen (Artisan)', 'Material Delay', 'Hardware shop out of 32A MCB stock', 'NORMAL', 'Inventory Desk', '45 mins', 'RESOLVED (Alternative Store)']
      ],
      kpis: [
        { label: 'Total Tickets Filed', value: '6', meta: 'Extremely low 3.8% ticket rate' },
        { label: 'Avg Resolution Time', value: '1.4 hrs', meta: 'Within 4-hour SLA standard' },
        { label: 'Resolution Satisfaction', value: '4.85★', meta: 'Post-resolution client feedback' },
        { label: 'Open Disputes', value: '0', meta: '100% mediated amicably' }
      ]
    },
    'PAYMENT_REPORTS': {
      title: 'Cooperative Treasury, Digital Collections & Artisan Settlements Report',
      subtitle: 'Complete financial ledger of customer payments, gateway charges, cooperative margins, and scheduled artisan payouts.',
      columns: ['Transaction ID', 'Booking ID', 'Payment Mode', 'Gross Billed (₹)', 'Artisan Share 88% (₹)', 'Coop Retention 12% (₹)', 'Settlement Batch', 'Payout Status'],
      getData: () => [
        ['TXN-9021', 'CP-9104', 'UPI (Instant)', '₹680.00', '₹598.40', '₹81.60', 'BATCH-2026-W38', 'READY FOR PAYOUT'],
        ['TXN-9018', 'CP-8841', 'Net Banking', '₹3,200.00', '₹2,816.00', '₹384.00', 'BATCH-2026-W38', 'SETTLED TO BANK'],
        ['TXN-9014', 'CP-8830', 'UPI', '₹450.00', '₹396.00', '₹54.00', 'BATCH-2026-W38', 'SETTLED TO BANK'],
        ['TXN-9008', 'CP-8812', 'Debit Card', '₹850.00', '₹748.00', '₹102.00', 'BATCH-2026-W38', 'SETTLED TO BANK'],
        ['TXN-8994', 'CP-8790', 'Cash on Delivery', '₹550.00', '₹484.00', '₹66.00', 'CASH-RECON-09', 'AUDITED & CLEARED']
      ],
      kpis: [
        { label: 'Gross Digital Inflow', value: '₹4,86,500', meta: '82% UPI, 12% Card, 6% NetBanking' },
        { label: 'Artisan Bi-Weekly Cleared', value: '₹4,28,120', meta: 'Zero pending wage arrears' },
        { label: 'Cooperative Treasury Pool', value: '₹58,380', meta: 'Liquid operating reserve' },
        { label: 'Reconciliation Variance', value: '₹0.00', meta: '100% balanced ledger' }
      ]
    }
  };

  function selectReport(reportId) {
    state.activeReportId = reportId;

    // Update active state in tabs grid
    document.querySelectorAll('.report-tab-btn').forEach(btn => {
      if (btn.dataset.report === reportId) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    renderActiveReport();
  }

  function applyReportFilters() {
    state.reportDateFilter = document.getElementById('report-filter-date')?.value || '30_DAYS';
    state.reportTradeFilter = document.getElementById('report-filter-trade')?.value || 'ALL';
    state.reportLocationFilter = document.getElementById('report-filter-location')?.value || 'ALL';

    const meta = document.getElementById('report-status-meta');
    if (meta) {
      meta.textContent = `Filtered by Date: ${state.reportDateFilter} • Trade: ${state.reportTradeFilter} • Location: ${state.reportLocationFilter}`;
    }

    renderActiveReport();
  }

  function renderActiveReport() {
    const reportId = state.activeReportId || 'WORKER_PERFORMANCE';
    const repDef = reportDefinitions[reportId] || reportDefinitions['WORKER_PERFORMANCE'];
    const container = document.getElementById('report-active-container');
    if (!container) return;

    let kpisHtml = '';
    repDef.kpis.forEach(k => {
      kpisHtml += `
        <div class="report-kpi-card">
          <span class="report-kpi-label">${k.label}</span>
          <span class="report-kpi-value">${k.value}</span>
          <span class="report-kpi-meta">${k.meta}</span>
        </div>
      `;
    });

    let thHtml = '';
    repDef.columns.forEach(col => {
      thHtml += `<th>${col}</th>`;
    });

    let rowsHtml = '';
    const rows = repDef.getData();
    rows.forEach(r => {
      rowsHtml += '<tr>';
      r.forEach((cell, idx) => {
        if (cell.includes('COMPLIANT') || cell.includes('ACTIVE') || cell.includes('SETTLED') || cell.includes('RESOLVED') || cell.includes('ADOPTED')) {
          rowsHtml += `<td><span class="status-badge badge-green">${cell}</span></td>`;
        } else if (cell.includes('ALLOCATED') || cell.includes('DISPATCHED') || cell.includes('EXPIRING')) {
          rowsHtml += `<td><span class="status-badge badge-orange">${cell}</span></td>`;
        } else if (cell.includes('PENDING')) {
          rowsHtml += `<td><span class="status-badge badge-blue">${cell}</span></td>`;
        } else if (cell.includes('₹') || cell.includes('%') || (cell.startsWith('#') && idx === 0)) {
          rowsHtml += `<td class="font-mono"><strong>${cell}</strong></td>`;
        } else {
          rowsHtml += `<td>${cell}</td>`;
        }
      });
      rowsHtml += '</tr>';
    });

    container.innerHTML = `
      <div class="report-header-banner">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <h3 style="margin: 0; font-size: 1.25rem; color: var(--text-main); font-weight: 700;">${repDef.title}</h3>
            <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-muted);">${repDef.subtitle}</p>
          </div>
          <span class="status-badge badge-green" style="font-size: 0.8rem; padding: 6px 12px;">
            <i data-lucide="shield-check" style="width: 14px; height: 14px;"></i> Cooperative Board Certified Audit
          </span>
        </div>
      </div>

      <!-- Report KPI Cards -->
      <div class="report-kpi-grid">
        ${kpisHtml}
      </div>

      <!-- Report Structured Table -->
      <div class="card-panel" style="padding: 0; overflow: hidden; border-radius: var(--radius-md);">
        <div class="table-responsive">
          <table class="data-table" id="active-report-table">
            <thead>
              <tr>
                ${thHtml}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  function exportReportCSV() {
    const reportId = state.activeReportId || 'WORKER_PERFORMANCE';
    const repDef = reportDefinitions[reportId] || reportDefinitions['WORKER_PERFORMANCE'];

    const headers = repDef.columns.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
    const rows = repDef.getData().map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Cooperative_Report_${reportId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Report exported successfully as CSV (${repDef.columns.length} columns, ${rows.length} rows).`, 'success');
  }

  function printReportPDF() {
    window.print();
  }

  // ==============================================================
  // ADMIN NOTIFICATIONS MODAL & LIVE ALERTS
  // ==============================================================

  function toggleNotificationsModal() {
    const modal = document.getElementById('modal-admin-notifications');
    if (!modal) return;
    if (modal.classList.contains('open') || modal.classList.contains('active')) {
      closeModal('modal-admin-notifications');
    } else {
      openModal('modal-admin-notifications');
      renderAdminNotifications();
    }
  }

  function renderAdminNotifications() {
    const list = document.getElementById('admin-notifications-list');
    const badge = document.getElementById('header-notif-badge');
    if (!list) return;

    const unreadCount = state.adminNotifications.filter(n => n.unread).length;
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    let html = '';
    state.adminNotifications.forEach(n => {
      html += `
        <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="window.adminApp.handleNotificationClick('${n.id}')">
          <div class="notif-item-header">
            <span class="status-badge badge-${n.badge}" style="font-size: 0.7rem; font-weight: 700;">
              ${n.category.replace('_', ' ')}
            </span>
            <span class="notif-time">${n.time}</span>
          </div>
          <h4 class="notif-title">${n.title}</h4>
          <p class="notif-detail">${n.detail}</p>
          <div class="notif-action-row">
            <span class="notif-deep-link"><i data-lucide="arrow-right" style="width: 12px; height: 12px;"></i> View in Admin Console</span>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  function markAllNotificationsRead() {
    state.adminNotifications.forEach(n => { n.unread = false; });
    renderAdminNotifications();
    showToast('All 10 cooperative alerts marked as read.', 'info');
  }

  function handleNotificationClick(notifId) {
    const notif = state.adminNotifications.find(n => n.id === notifId);
    if (!notif) return;

    notif.unread = false;
    closeModal('modal-admin-notifications');

    // Navigate to target view and subtab
    navigateTo(notif.view);

    if (notif.view === 'workforce') {
      if (notif.subtab) switchWorkforceSubtab(notif.subtab);
      if (notif.requestId) {
        state.activeAllocationRequestId = notif.requestId;
        renderWorkforceAllocation();
      }
    } else if (notif.view === 'forecast') {
      if (notif.subtab) switchForecastSubtab(notif.subtab);
    } else if (notif.view === 'welfare') {
      if (notif.subtab) switchWelfareSubtab(notif.subtab);
    } else if (notif.view === 'services') {
      if (notif.subtab) switchServicesSubtab(notif.subtab);
    } else if (notif.view === 'workers' && notif.workerId) {
      openWorkerDetails(notif.workerId);
    }

    renderAdminNotifications();
  }

  // ==============================================================
  // SIMULATOR EXTENSION: WORKFORCE MATCHING
  // ==============================================================

  function simulateWorkforceMatch(bookingId = 'CP-9104') {
    navigateTo('workforce');
    switchWorkforceSubtab('alloc');
    state.activeAllocationRequestId = bookingId;
    renderWorkforceAllocation();
    showToast(`Simulation: 8-Factor Workforce Matching active for booking ${bookingId}. Top recommendation highlighted!`, 'info');
  }

  function setupUIEventListeners() {
    // Worker filter pills
    document.querySelectorAll('#worker-status-filter-pills .filter-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setWorkerFilter(btn.dataset.status || 'ALL');
      });
    });

    // Appointment filter pills
    document.querySelectorAll('#appointment-type-filter-pills .filter-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#appointment-type-filter-pills .filter-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.appointmentTypeFilter = btn.dataset.type || 'ALL';
        renderAppointmentsTable();
      });
    });

    // Close overlays on outside click
    document.querySelectorAll('.drawer-overlay, .modal-overlay').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          el.classList.remove('open');
        }
      });
    });
  }

  function init() {
    // 1. Expose Global Public API FIRST so window.adminApp is ALWAYS defined!
    window.adminApp = {
      handleLogin,
      handleLogout,
      togglePasswordVisibility,
      fillDemoCredentials,
      handleForgotPasswordSubmit,
      navigateTo,
      toggleMobileSidebar,
      scrollToEmergency,
      openModal,
      closeModal,
      openDrawer,
      closeDrawer,

      // Subtabs
      switchAppointmentSubtab,
      switchCustomerSubtab,
      switchServicesSubtab,
      switchWelfareSubtab,

      // Worker Verification
      openWorkerDetails,
      approveWorkerCurrent,
      quickApproveWorker,
      confirmRejectWorker,
      suspendWorkerCurrent,
      sendWorkerInfoRequest,
      saveWorkerSkills,
      filterWorkersTable,
      setWorkerFilter,
      openNewWorkerModal,

      // Appointments
      openAppointmentDetails,
      openAssignWorkerModal,
      confirmAssignWorker,
      openRescheduleModal,
      confirmReschedule,
      openCancelModal,
      confirmCancelAppointment,
      contactParty,
      triggerSimulatedCall,
      sendSimulatedMessage,
      filterAppointmentsTable,
      openNewBookingModal,

      // Customers
      openCustomerDetails,
      filterCustomersTable,

      // Services Management
      filterServicesCategory,
      filterServicesTable,
      openAddServiceModal,
      openEditServiceModal,
      saveServiceItem,
      toggleServiceStatus,

      // Monthly Rates Management
      openRateEditModal,
      onRateServiceSelectChange,
      saveSingleRate,
      openRateHistory,
      saveRateDraft,
      approveRateBoard,
      publishMonthlyRates,

      // Materials Management
      filterMaterialsCategory,
      filterMaterialsTable,
      openAddMaterialModal,
      openEditMaterialModal,
      saveMaterialItem,
      openMaterialHistory,

      // Estimate Monitoring & Audit
      filterEstimates,
      filterEstimatesTable,
      openEstimateFlagModal,
      flagEstimateForReview,

      // Customer Tickets
      filterTickets,
      filterTicketsTable,
      openTicketDetails,
      saveTicketResolution,
      openChatWithCustomer,

      // Welfare Programs
      filterWelfareProgram,
      openRecordWelfareModal,
      confirmRecordWelfare,

      // Insurance Registry
      filterInsuranceStatus,
      filterInsuranceTable,
      renewExpiringInsurance,
      openAddInsuranceModal,
      openEditInsuranceModal,
      saveInsurancePolicy,
      openRecordClaimModal,
      saveInsuranceClaim,

      // 3-Way Chat Hub
      renderChatConversations,
      filterChatConversations,
      selectConversation,
      sendChatMessage,
      insertQuickMessage,

      // Pre-Call Verification
      openPreCallModal,
      confirmInitiateCall,

      // Payments & Settlements
      filterPaymentsRange,
      filterPaymentsTable,

      // Simulation & Refresh
      simulateBooking,
      simulateWorkerAccept,
      simulateWorkerStatus,
      refreshData,

      // Part 3 Workforce Allocation & Availability
      switchWorkforceSubtab,
      onAllocationRequestChange,
      assignCandidateWorker,
      reassignCandidateWorker,
      manualOverrideCandidate,
      viewCandidateLocation,
      confirmAssignCandidateFromLocation,
      renderWorkforceAllocation,
      renderWorkforceAvailability,
      rebalanceArtisanShifts,
      openShiftPlanningModal,
      saveShiftPlan,

      // Part 3 AI Demand Forecast & Workforce Gap
      switchForecastSubtab,
      renderAIForecast,
      recalculateAIForecast,
      renderWorkforceGap,
      mobilizeStandbyWorkers,
      reclusterServiceAreas,
      increaseEmergencyCoverage,
      executeRecommendedAllocation,

      // Part 3 Reports & CSV Export
      selectReport,
      applyReportFilters,
      renderActiveReport,
      exportReportCSV,
      printReportPDF,

      // Part 3 Notifications Modal
      toggleNotificationsModal,
      renderAdminNotifications,
      markAllNotificationsRead,
      handleNotificationClick,

      // Part 3 Simulator
      simulateWorkforceMatch,

      get state() { return state; },
      get currentChatPartyType() { return state.currentChatPartyType; },
      get currentSelectedBookingId() { return state.currentSelectedBookingId; }
    };

    // 2. Authentication view display sync
    if (state.isAuthenticated) {
      const loginView = document.getElementById('view-login');
      const appRoot = document.getElementById('admin-app-root');
      if (loginView) loginView.style.display = 'none';
      if (appRoot) appRoot.style.display = 'flex';
    }

    // 3. Setup event listeners and initial render with try-catch
    setupUIEventListeners();
    try {
      renderAll();
    } catch(err) {
      console.error('Error during initial renderAll:', err);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
