// API Configuration and Services
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  
  // Visitors
  CREATE_VISITOR: `${API_BASE_URL}/visitors`,
  SUBMIT_VISITOR_REQUEST: `${API_BASE_URL}/visitors/submit-request`,
  GET_VISITOR_REQUESTS: `${API_BASE_URL}/visitors/requests`,
  GET_VISITOR_REQUEST_BY_PASS: `${API_BASE_URL}/visitors/request/:passId`,
  
  // Appointments
  CREATE_APPOINTMENT: `${API_BASE_URL}/appointments`,
  GET_APPOINTMENTS: `${API_BASE_URL}/appointments`,
  GET_APPOINTMENT_SLOTS: `${API_BASE_URL}/appointments/slots`,
  
  // Admin
  GET_PENDING_APPOINTMENTS: `${API_BASE_URL}/admin/appointments/pending`,
  APPROVE_APPOINTMENT: `${API_BASE_URL}/admin/appointments/:id/approve`,
  WAIT_APPOINTMENT: `${API_BASE_URL}/admin/appointments/:id/wait`,
  REJECT_APPOINTMENT: `${API_BASE_URL}/admin/appointments/:id/disapprove`,
  
  // Officers
  GET_OFFICERS: `${API_BASE_URL}/officers`,
  
  // Offices
  GET_OFFICES: `${API_BASE_URL}/offices`,
  
  // Purposes
  GET_PURPOSES: `${API_BASE_URL}/purposes`,
  
  // Audit
  GET_AUDIT_LOGS: `${API_BASE_URL}/audit`,
  CREATE_AUDIT_LOG: `${API_BASE_URL}/audit`,
};

// Generic API Call Handler
async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  console.log(`🔗 API Call: ${options?.method || 'GET'} ${url}`);
  console.log(`   Token in localStorage: ${token ? token.substring(0, 20) + '...' : 'MISSING'}`);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`   ✅ Authorization header set`);
  } else {
    console.log(`   ⚠️ No token - request may fail`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`   Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ HTTP Error:`, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText };
      }
      
      // Create error with details if available
      const errorMessage = error.error || `HTTP ${response.status}`;
      const err = new Error(errorMessage);
      // Attach details to error object for later extraction
      (err as any).details = error.details;
      (err as any).statusCode = response.status;
      console.error(`   ❌ Error details:`, error.details);
      throw err;
    }

    const data = await response.json();
    console.log(`   ✅ Response:`, typeof data === 'object' && Array.isArray(data) ? `Array[${data.length}]` : data);
    return data;
  } catch (err) {
    console.error(`   ❌ Fetch Error:`, err instanceof Error ? err.message : String(err));
    throw err;
  }
}

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const data = await apiCall<{ access_token: string; token_type: string; role: string }>(
      API_ENDPOINTS.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_role', data.role);
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
  },
};

// Visitor Service
export const visitorService = {
  createVisitor: async (data: {
    full_name: string;
    visitor_mobile_no: string;
    visitor_email?: string;
    visitor_photo_url?: string;
    document_url?: string;
  }) => {
    return apiCall<{ visitor_id: number }>(API_ENDPOINTS.CREATE_VISITOR, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  submitRequest: async (data: {
    visitor_name: string;
    visitor_type?: string;
    mobile_number: string;
    host_name?: string;
    department?: string;
    visit_date: string;
    visit_start_time: string;
    visit_end_time: string;
    number_of_visitors?: number;
    visitor_id?: number;
  }) => {
    return apiCall<{ success: boolean; request_id: number; pass_id: string; status: string }>(
      API_ENDPOINTS.SUBMIT_VISITOR_REQUEST,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  getRequests: async (status?: string) => {
    const url = status
      ? `${API_ENDPOINTS.GET_VISITOR_REQUESTS}?status=${status}`
      : API_ENDPOINTS.GET_VISITOR_REQUESTS;
    return apiCall<any[]>(url);
  },

  getRequestByPassId: async (passId: string) => {
    return apiCall<any>(API_ENDPOINTS.GET_VISITOR_REQUEST_BY_PASS.replace(':passId', passId));
  },

  updateRequestStatus: async (requestId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'WAITING') => {
    return apiCall<{ success: boolean; data: any }>(
      `${API_BASE_URL}/visitors/request/${requestId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  updateVisitorRequest: async (requestId: number, data: {
    visitor_name?: string;
    visitor_type?: string;
    visit_start_time?: string;
    visit_end_time?: string;
  }) => {
    return apiCall<{ success: boolean; data: any }>(
      `${API_BASE_URL}/visitors/request/${requestId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },
};

// Appointment Service
export const appointmentService = {
  createAppointment: async (data: {
    visitor_id: number;
    officer_id?: number;
    office_id?: number;
    purpose_id?: number;
    appointment_visit_date: string;
    appointments_time_slot: number;
    number_of_visitors?: number;
    visitor_name?: string;
    visitor_type?: string;
    mobile_number?: string;
    host_name?: string;
    department?: string;
  }) => {
    return apiCall<{ success: boolean; appointment_id: number; pass_id: string }>(
      API_ENDPOINTS.CREATE_APPOINTMENT,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  getSlots: async () => {
    return apiCall<any[]>(API_ENDPOINTS.GET_APPOINTMENT_SLOTS);
  },
};

// Admin Service
export const adminService = {
  getPendingAppointments: async () => {
    try {
      console.log('🔄 Fetching pending appointments with photos and documents...');
      const appointments = await apiCall<any[]>(API_ENDPOINTS.GET_PENDING_APPOINTMENTS);
      console.log('✅ Pending appointments response:', appointments);
      console.log(`📊 Found ${appointments?.length || 0} pending appointments`);
      
      // Log first appointment to debug photo/document inclusion
      if (appointments && appointments.length > 0) {
        console.log('🔍 First appointment data:', appointments[0]);
        console.log('📸 Photo URL:', appointments[0].visitor_photo_url);
        console.log('📄 Document URL:', appointments[0].document_url);
      }
      
      return appointments || [];
    } catch (error) {
      console.error('❌ Error fetching pending appointments:', error);
      return [];
    }
  },

  getPendingVisitorRequests: async () => {
    try {
      console.log('🔄 Fetching visitor requests (PENDING + APPROVED + WAITING + CHECKED_IN)...');
      
      // Fetch pending requests
      const pendingResponse = await apiCall<any>(`${API_BASE_URL}/visitors/requests?status=PENDING`);
      console.log('✅ Pending requests response:', pendingResponse);
      
      // Fetch approved requests
      const approvedResponse = await apiCall<any>(`${API_BASE_URL}/visitors/requests?status=APPROVED`);
      console.log('✅ Approved requests response:', approvedResponse);
      
      // Fetch waiting requests
      const waitingResponse = await apiCall<any>(`${API_BASE_URL}/visitors/requests?status=WAITING`);
      console.log('✅ Waiting requests response:', waitingResponse);
      
      // Fetch checked-in requests
      const checkedInResponse = await apiCall<any>(`${API_BASE_URL}/visitors/requests?status=CHECKED_IN`);
      console.log('✅ Checked-in requests response:', checkedInResponse);
      
      // Merge all responses
      let allRequests: any[] = [];
      
      // Extract data from pending - API returns { success, count, data: [...] }
      if (pendingResponse?.data && Array.isArray(pendingResponse.data)) {
        console.log(`   ℹ️ Pending: ${pendingResponse.data.length} requests`);
        allRequests = allRequests.concat(pendingResponse.data);
      } else if (Array.isArray(pendingResponse)) {
        console.log(`   ℹ️ Pending (direct array): ${pendingResponse.length} requests`);
        allRequests = allRequests.concat(pendingResponse);
      }
      
      // Extract data from approved
      if (approvedResponse?.data && Array.isArray(approvedResponse.data)) {
        console.log(`   ℹ️ Approved: ${approvedResponse.data.length} requests`);
        allRequests = allRequests.concat(approvedResponse.data);
      } else if (Array.isArray(approvedResponse)) {
        console.log(`   ℹ️ Approved (direct array): ${approvedResponse.length} requests`);
        allRequests = allRequests.concat(approvedResponse);
      }
      
      // Extract data from waiting
      if (waitingResponse?.data && Array.isArray(waitingResponse.data)) {
        console.log(`   ℹ️ Waiting: ${waitingResponse.data.length} requests`);
        allRequests = allRequests.concat(waitingResponse.data);
      } else if (Array.isArray(waitingResponse)) {
        console.log(`   ℹ️ Waiting (direct array): ${waitingResponse.length} requests`);
        allRequests = allRequests.concat(waitingResponse);
      }
      
      // Extract data from checked-in
      if (checkedInResponse?.data && Array.isArray(checkedInResponse.data)) {
        console.log(`   ℹ️ Checked-in: ${checkedInResponse.data.length} requests`);
        allRequests = allRequests.concat(checkedInResponse.data);
      } else if (Array.isArray(checkedInResponse)) {
        console.log(`   ℹ️ Checked-in (direct array): ${checkedInResponse.length} requests`);
        allRequests = allRequests.concat(checkedInResponse);
      }
      
      console.log(`📊 Found ${allRequests.length} total requests (Pending + Approved + Waiting + Checked-in)`);
      
      // Log first request to check photo/document URLs
      if (allRequests.length > 0) {
        console.log('🔍 First request with photo/document check:');
        console.log(`   visitor_photo_url: ${allRequests[0].visitor_photo_url}`);
        console.log(`   document_url: ${allRequests[0].document_url}`);
        console.log(`   visitor_id: ${allRequests[0].visitor_id}`);
        console.log(`   Full request data keys:`, Object.keys(allRequests[0]));
      }
      
      return allRequests;
    } catch (error) {
      console.error('❌ Failed to fetch visitor requests:', error);
      return [];
    }
  },

  getAllAppointments: async () => {
    try {
      console.log('🔄 Calling /admin/requests endpoint...');
      const requests = await apiCall<any[]>(`${API_BASE_URL}/admin/requests`);
      console.log('✅ /admin/requests returned:', requests?.length, 'records');
      return requests || [];
    } catch (error) {
      console.warn('⚠️ Failed to fetch from /admin/requests:', error);
      console.log('📍 Trying fallback endpoint /admin/appointments/pending...');
      try {
        const fallbackRequests = await apiCall<any[]>(API_ENDPOINTS.GET_PENDING_APPOINTMENTS);
        console.log('✅ Fallback endpoint returned:', fallbackRequests?.length, 'records');
        return fallbackRequests || [];
      } catch (fallbackError) {
        console.error('❌ Both endpoints failed:', fallbackError);
        return [];
      }
    }
  },

  approveAppointment: async (id: number) => {
    return apiCall<{ status: string }>(
      API_ENDPOINTS.APPROVE_APPOINTMENT.replace(':id', String(id)),
      { method: 'POST' }
    );
  },

  waitAppointment: async (id: number) => {
    return apiCall<{ status: string }>(
      API_ENDPOINTS.WAIT_APPOINTMENT.replace(':id', String(id)),
      { method: 'POST' }
    );
  },

  rejectAppointment: async (id: number) => {
    return apiCall<{ status: string }>(
      API_ENDPOINTS.REJECT_APPOINTMENT.replace(':id', String(id)),
      { method: 'POST' }
    );
  },

  updateRequestStatus: async (id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'WAITING' | 'CHECKED_IN', additionalData?: any) => {
    console.log(`📤 Updating request ${id} status to ${status}`, additionalData ? `with payload: ${JSON.stringify(additionalData)}` : '');
    const payload: any = { status };
    
    // Include additional data like time_slots_id if provided
    if (additionalData) {
      Object.assign(payload, additionalData);
    }
    
    return apiCall<{ success: boolean; request_id: number; status: string }>(
      `${API_BASE_URL}/visitors/request/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },
};

// Officers Service
export const officersService = {
  getOfficers: async () => {
    return apiCall<any[]>(`${API_BASE_URL}/officers`);
  },

  addOfficer: async (data: {
    name: string;
    rank: string;
    email?: string;
    phone?: string;
    cabin?: string;
    department?: string;
    user_id?: string | number;
  }) => {
    return apiCall<{ success: boolean; officer: any }>(
      `${API_BASE_URL}/officers`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  updateOfficer: async (id: number, data: Partial<{
    name: string;
    rank: string;
    email: string;
    phone: string;
    cabin: string;
    user_id: string | number;
  }>) => {
    return apiCall<{ success: boolean; officer: any }>(
      `${API_BASE_URL}/officers/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  deactivateOfficer: async (id: number) => {
    return apiCall<{ success: boolean }>(
      `${API_BASE_URL}/officers/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

// Audit Service
export const auditService = {
  getLogs: async () => {
    return apiCall<any[]>(API_ENDPOINTS.GET_AUDIT_LOGS);
  },

  createLog: async (data: {
    action: string;
    user_id?: number;
    details?: string;
  }) => {
    return apiCall<any>(API_ENDPOINTS.CREATE_AUDIT_LOG, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
