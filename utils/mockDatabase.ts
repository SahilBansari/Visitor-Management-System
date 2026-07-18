// utils/mockDatabase.ts

export type Tenant = 'irrigation' | 'agriculture';

// --- SHARED TYPES & OFFICE DATA ---

export interface Visitor {
    id: string;
    timestamp: Date;
    department: string;
    tenant: Tenant;
    // Expanded fields for Admin Visitor List
    name?: string;
    mobile?: string;
    hostName?: string;
    purpose?: string;
    status?: 'checked-in' | 'checked-out' | 'pending' | 'rejected';
    checkInTime?: string;
    checkOutTime?: string;
    photoUrl?: string;
}

export interface OfficeNode {
    id: string;
    name: string;
    name_hi: string;
    type: 'ministry' | 'dept' | 'office';
    address?: string;
    pincode?: string;
    geo?: [number, number];
    capacity?: number;
    workingHours?: [string, string];
    devices?: string[];
    children?: OfficeNode[];
}

// Data for Irrigation (Uttarakhand Context)
const mockIrrigationTree: OfficeNode[] = [
    { 
        id: 'irrigation_hq', name: 'Irrigation Dept. HQ', name_hi: 'सिंचाई विभाग मुख्यालय', type: 'ministry', children: [
            { id: 'dept_hydrology', name: 'Hydrology Division', name_hi: 'जल विज्ञान प्रभाग', type: 'dept', children: [
                { id: 'off_roorkee_hydro', name: 'Roorkee Research Inst.', name_hi: 'रुड़की अनुसंधान संस्थान', type: 'office', address: 'Civil Lines, Roorkee', pincode: '247667', capacity: 300, workingHours: ['09:30', '18:00'] },
            ]},
            { id: 'dept_canals', name: 'Ganga Canal Mgmt', name_hi: 'गंगा नहर प्रबंधन', type: 'dept', children: [
                 { id: 'off_haridwar_canal', name: 'Haridwar Zone', name_hi: 'हरिद्वार जोन', type: 'office', address: 'Bhimgoda Barrage, Haridwar', pincode: '249401', capacity: 150, workingHours: ['10:00', '17:00'] },
            ]}
        ]
    }
];

// Data for Agriculture (Uttarakhand Context)
const mockAgricultureTree: OfficeNode[] = [
    { 
        id: 'agri_hq', name: 'Agriculture Dept. HQ', name_hi: 'कृषि विभाग मुख्यालय', type: 'ministry', children: [
            { id: 'dept_crops', name: 'Crop Science Div', name_hi: 'फसल विज्ञान प्रभाग', type: 'dept', children: [
                { id: 'off_dehradun_agri', name: 'Krishi Bhavan Dehradun', name_hi: 'कृषि भवन देहरादून', type: 'office', address: 'Nanda Ki Chowki, Dehradun', pincode: '248007', capacity: 400, workingHours: ['09:00', '17:00'] },
            ]},
            { id: 'dept_research', name: 'Research Centre', name_hi: 'अनुसंधान केंद्र', type: 'dept', children: [
                 { id: 'off_pantnagar_res', name: 'Pantnagar Unit', name_hi: 'पंतनगर इकाई', type: 'office', address: 'Udham Singh Nagar', pincode: '263145', capacity: 100, workingHours: ['10:00', '16:00'] },
            ]}
        ]
    }
];

export const getOfficeTree = async (tenant: Tenant = 'irrigation'): Promise<OfficeNode[]> => {
    return new Promise(resolve => setTimeout(() => {
        resolve(tenant === 'agriculture' ? mockAgricultureTree : mockIrrigationTree);
    }, 300));
}

// --- VISITOR DATA (FIXED: Added getVisitors) ---

const mockVisitorsList: Visitor[] = [
    // Irrigation Visitors
    { 
        id: 'V-001', 
        timestamp: new Date(), 
        department: 'Hydrology', 
        tenant: 'irrigation',
        name: 'Ramesh Gupta',
        mobile: '9876543210',
        hostName: 'Rajesh Kumar',
        purpose: 'Vendor Meeting',
        status: 'checked-in',
        checkInTime: '10:00 AM'
    },
    { 
        id: 'V-002', 
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        department: 'Canal Mgmt', 
        tenant: 'irrigation',
        name: 'Suresh Raina',
        mobile: '9876543211',
        hostName: 'Amit Verma',
        purpose: 'Site Visit',
        status: 'checked-out',
        checkInTime: '11:00 AM',
        checkOutTime: '01:00 PM'
    },
    // Agriculture Visitors
    { 
        id: 'V-003', 
        timestamp: new Date(), 
        department: 'Crop Science', 
        tenant: 'agriculture',
        name: 'Kisan Lal',
        mobile: '9876543212',
        hostName: 'Dr. Negi',
        purpose: 'Seed Inquiry',
        status: 'pending'
    },
    { 
        id: 'V-004', 
        timestamp: new Date(), 
        department: 'Soil Tech', 
        tenant: 'agriculture',
        name: 'Vijay Singh',
        mobile: '9876543213',
        hostName: 'Vikram Rawat',
        purpose: 'Lab Testing',
        status: 'checked-in',
        checkInTime: '09:30 AM'
    }
];

export const getVisitors = async (tenant?: Tenant): Promise<Visitor[]> => {
    return new Promise(resolve => setTimeout(() => {
        if (!tenant) resolve(mockVisitorsList);
        else resolve(mockVisitorsList.filter(v => v.tenant === tenant));
    }, 600));
};

// --- OFFICER DIRECTORY DATA ---
export type OfficerStatus = 'active' | 'meeting' | 'leave' | 'inactive';

export interface Officer {
  id: string;
  name: string;
  rank: string;
  department: string;
  email: string;
  phone: string;
  status: OfficerStatus;
  cabin: string;
  lastActive: string;
  tenant: Tenant;
}

// Combined mock list 
let mockOfficers: Officer[] = [
  // Irrigation Officers
  { id: 'OFF-001', name: 'Rajesh Kumar', rank: 'Joint Secretary', department: 'Internal Security', email: 'rajesh.k@uk.gov.in', phone: '+91 98765-43210', status: 'active', cabin: 'NB-204', lastActive: 'Just now', tenant: 'irrigation' },
  { id: 'OFF-002', name: 'Priya Sharma', rank: 'Director', department: 'Hydrology', email: 'priya.s@uk.gov.in', phone: '+91 98765-43211', status: 'meeting', cabin: 'SB-102', lastActive: '10 mins ago', tenant: 'irrigation' },
  // Agriculture Officers
  { id: 'AGRI-001', name: 'Dr. Negi', rank: 'Chief Scientist', department: 'Hill Crops', email: 'negi@agri.uk.gov.in', phone: '+91 98765-11111', status: 'active', cabin: 'KB-101', lastActive: '1 hr ago', tenant: 'agriculture' },
  { id: 'AGRI-002', name: 'Vikram Rawat', rank: 'Director', department: 'Soil Tech', email: 'v.rawat@agri.uk.gov.in', phone: '+91 98765-22222', status: 'leave', cabin: 'KB-304', lastActive: 'Yesterday', tenant: 'agriculture' },
];

export const getOfficers = async (tenant?: Tenant): Promise<Officer[]> => {
    return new Promise(resolve => setTimeout(() => {
        if (!tenant) resolve(mockOfficers);
        else resolve(mockOfficers.filter(o => o.tenant === tenant));
    }, 400));
};

export const addOfficer = async (officer: Officer): Promise<void> => {
    mockOfficers = [officer, ...mockOfficers];
    return new Promise(resolve => setTimeout(resolve, 400));
};

export const updateOfficer = async (updatedOfficer: Officer): Promise<void> => {
    mockOfficers = mockOfficers.map(o => o.id === updatedOfficer.id ? updatedOfficer : o);
    return new Promise(resolve => setTimeout(resolve, 400));
};

export const toggleOfficerStatus = async (id: string): Promise<OfficerStatus> => {
    let newStatus: OfficerStatus = 'active';
    mockOfficers = mockOfficers.map(o => {
        if (o.id === id) {
            newStatus = o.status === 'inactive' ? 'active' : 'inactive';
            return { ...o, status: newStatus };
        }
        return o;
    });
    return new Promise(resolve => setTimeout(() => resolve(newStatus), 400));
};

// --- APPOINTMENT / WIZARD DATA ---
export interface AppointmentData {
    passId: string;
    mobile: string;
    status: string;
    visitorName: string;
    office: string;
    officer: string;
    date: string;
    time: string;
    tenant: Tenant;
}

export const saveAppointment = async (data: AppointmentData): Promise<void> => {
    console.log(`[${data.tenant?.toUpperCase() || 'UNKNOWN'}] Mock Database: Saving appointment...`, data);
    return new Promise(resolve => setTimeout(resolve, 800));
};

// --- DASHBOARD DATA ---
export type DateRange = 'Today' | 'Yesterday' | 'This Week';

export interface DashboardData {
    kpi: { visitors: string; liveInside: string; overstay: string; health: string; };
    trendChart: { xAxis: string[]; data: number[]; type: 'line' | 'bar'; };
    departmentData: { value: number; name: string }[];
    statusData: { value: number; name: string }[];
}

export const getFilteredDashboardData = async (range: DateRange, tenant: Tenant = 'irrigation'): Promise<DashboardData> => {
    return new Promise(resolve => setTimeout(() => {
        if (tenant === 'agriculture') {
            resolve({
                kpi: { visitors: '85', liveInside: '12', overstay: '0', health: '99%' },
                trendChart: { xAxis: ['9AM', '10AM', '11AM'], data: [2, 8, 15], type: 'line' },
                departmentData: [{ value: 60, name: 'Crop Science' }],
                statusData: [{ value: 73, name: 'Checked Out' }]
            });
        } else {
            resolve({
                kpi: { visitors: '142', liveInside: '34', overstay: '2', health: '98%' },
                trendChart: { xAxis: ['9AM', '10AM', '11AM'], data: [5, 12, 28], type: 'line' },
                departmentData: [{ value: 45, name: 'Hydrology' }],
                statusData: [{ value: 106, name: 'Checked Out' }]
            });
        }
    }, 500));
};

// --- HOD & CLERK DATA --- 
export interface HodDashboardData {
    stats: { pendingRequests: number; todaysVisits: number; deptOccupancy: number; totalCapacity: number; };
    mySchedule: { time: string; title: string; type: 'internal' | 'visitor' | 'free'; status: string }[];
    pendingApprovals: { id: string; name: string; type: string; purpose: string; time: string; avatar?: string }[];
    weeklyTraffic: { day: string; count: number }[];
}

export const getHodDashboardData = async (deptId: string): Promise<HodDashboardData> => {
    return new Promise(resolve => setTimeout(() => resolve({
        stats: { pendingRequests: 3, todaysVisits: 12, deptOccupancy: 8, totalCapacity: 40 },
        mySchedule: [{ time: '09:00 - 10:00', title: 'Internal Budget Review', type: 'internal', status: 'Completed' }],
        pendingApprovals: [{ id: '1', name: 'Amit Joshi', type: 'Vendor', purpose: 'Discussion', time: 'Today, 2:00 PM' }],
        weeklyTraffic: [{ day: 'Mon', count: 45 }]
    }), 600));
}

export interface ClerkDashboardData {
    stats: { expected: number; checkedIn: number; pending: number; };
    hourlyInflux: { hour: string; count: number }[];
    recentActivity: { id: string; name: string; host: string; time: string; status: 'in' | 'out' }[];
}

export const getClerkDashboardData = async (): Promise<ClerkDashboardData> => {
    return new Promise(resolve => setTimeout(() => resolve({
        stats: { expected: 45, checkedIn: 18, pending: 27 },
        hourlyInflux: [{ hour: '9 AM', count: 12 }],
        recentActivity: [{ id: '1', name: 'Suresh Rana', host: 'Chief Engineer', time: '10:45 AM', status: 'in' }]
    }), 600));
}

// --- NOTIFICATIONS & ALERTS ---

export interface AdminNotification { 
    id: string; 
    text: string; 
    time: string; 
    isUnread: boolean; 
    type: 'request' | 'meeting' | 'alert' | 'info'; 
}

export const getAdminNotifications = async (): Promise<AdminNotification[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
        { id: 'n1', text: 'New Visit Request: Ramesh Gupta (Vendor)', time: '2m ago', isUnread: true, type: 'request' },
        { id: 'n2', text: 'Meeting Alert: "Flood Protocol" starts in 12 mins', time: 'Just now', isUnread: true, type: 'meeting' },
        { id: 'n3', text: 'Request Approved: In-Person meet with Amit Verma', time: '10m ago', isUnread: true, type: 'meeting' },
    ]), 400));
};

export interface MeetingAlertData {
    minutes: number;
    subject: string;
    sender: string;
    type: 'All Staff' | 'In-Person';
    time: string;
    date: string;
}

export const getNextStaffMeeting = async (): Promise<MeetingAlertData | null> => {
    return new Promise(resolve => setTimeout(() => {
        resolve({ 
            minutes: 12, 
            subject: 'Flood Protocol Briefing',
            sender: 'Rajesh Kumar (Chief Engineer)',
            type: 'All Staff',
            time: '02:30 PM',
            date: 'Today'
        });
    }, 600));
};

// --- SCHEDULE & AVAILABILITY MODULE ---

export interface ScheduleSlot {
    time: string;
    status: 'busy' | 'waiting' | 'available';
    title: string;
    description?: string;
    visitorName?: string;
    visitorRole?: string; 
}

export interface ScheduleUser {
    id: string;
    name: string;
    role: 'admin' | 'hod' | 'clerk';
    designation: string;
}

const mockScheduleUsers: ScheduleUser[] = [
    { id: 'admin_1', name: 'System Admin', role: 'admin', designation: 'Administrator' },
    { id: 'clerk_1', name: 'Reception Desk', role: 'clerk', designation: 'Front Desk' },
    { id: 'off_1', name: 'Rajesh Kumar', role: 'hod', designation: 'Chief Engineer' },
    { id: 'off_2', name: 'Priya Sharma', role: 'hod', designation: 'Director (Hydrology)' },
    { id: 'off_3', name: 'Amit Verma', role: 'hod', designation: 'Executive Engineer' },
];

export const getScheduleUsers = async (): Promise<ScheduleUser[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockScheduleUsers), 300));
};

export const getOfficerSchedule = async (userId: string, date: Date): Promise<ScheduleSlot[]> => {
    return new Promise(resolve => setTimeout(() => {
        resolve([
            { time: '09:00 - 10:00', status: 'busy', title: 'Internal Budget Review', description: 'Monthly Planning with Finance', visitorName: 'Finance Dept', visitorRole: 'Internal Staff' },
            { time: '10:00 - 11:30', status: 'available', title: 'Open Slot' },
            { time: '11:30 - 12:00', status: 'waiting', title: 'Visitor Request', visitorName: 'Vikram Singh', visitorRole: 'Vendor (Construction)' },
            { time: '12:00 - 13:00', status: 'busy', title: 'Site Inspection', description: 'Ganga Canal Zone A' },
            { time: '14:00 - 15:00', status: 'available', title: 'Open Slot' },
            { time: '15:00 - 16:00', status: 'available', title: 'Open Slot' },
            { time: '16:00 - 17:00', status: 'waiting', title: 'Staff Request', visitorName: 'Amit Verma', visitorRole: 'Executive Engineer' },
        ]);
    }, 500));
};

export interface MeetingRequest {
    targetUserId: string;
    time: string;
    type: 'internal' | 'in-person';
    subject: string;
    priority: string;
}

export const requestMeeting = async (req: MeetingRequest): Promise<boolean> => {
    console.log("MockDB: Request Processed", req);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
};

// --- INCOMING REQUESTS MODULE ---

export interface IncomingRequest {
    id: string;
    requesterName: string;
    requesterRole: string; 
    subject: string;
    time: string;
    type: 'internal' | 'in-person';
    status: 'pending' | 'approved' | 'rejected' | 'waitlist';
    priority: 'normal' | 'urgent';
    timestamp: string;
}

export const getIncomingRequests = async (userId: string): Promise<IncomingRequest[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
        { 
            id: 'r1', requesterName: 'Amit Verma', requesterRole: 'Executive Engineer', 
            subject: 'Site Report Review', time: '14:00 - 15:00', type: 'internal', 
            status: 'pending', priority: 'urgent', timestamp: '10 mins ago'
        },
        { 
            id: 'r2', requesterName: 'Vikram Singh', requesterRole: 'Vendor', 
            subject: 'Tender Discussion', time: '16:00 - 16:30', type: 'in-person', 
            status: 'pending', priority: 'normal', timestamp: '1 hour ago'
        },
    ]), 600));
};

export const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected' | 'waitlist'): Promise<boolean> => {
    console.log(`Request ${requestId} updated to ${status}`);
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

// --- LEGACY STUBS (Restored for Compatibility) ---
export const getDepartmentMeetings = async (deptId: string, date: Date) => { return []; }
export const notifyVisitor = async (name: string, mobile: string, status: string) => { console.log("Notified", name); }
export const getAllOfficers = async () => getScheduleUsers();
export const getDashboardAlert = async () => null;