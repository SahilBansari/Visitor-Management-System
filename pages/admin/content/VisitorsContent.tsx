import React, { useState, useEffect, useMemo } from 'react';
import type { Language } from '../../../App';
import type { Tenant } from '../../../utils/mockDatabase';
import { useAuth } from '../../../contexts/AuthContext';
import { notifyVisitor, getOfficerSchedule, ScheduleSlot } from '../../../utils/mockDatabase';
import {
  Button,
  Input,
  Avatar,
  Badge,
  TabList,
  Tab,
  SelectTabData,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import ScheduleBoard from '../../../components/admin/schedule/ScheduleBoard';

interface VisitorsContentProps {
  lang: Language;
  tenant: Tenant; // Added Tenant Prop
}

// --- Types ---
type VisitorStatus = 'pending' | 'checked-in' | 'checked-out' | 'expected' | 'overstay' | 'rejected' | 'waiting';

interface Visitor {
  id: string;
  passId: string;
  name: string;
  userType?: 'Visitor' | 'Vendor' | 'Officer';
  mobile: string;
  hostName: string;
  hostDept: string;
  purpose: string;
  inTime: string | null;
  outTime: string | null;
  expectedTime: string; 
  status: VisitorStatus;
  idProofImage?: string; // Visitor photo for avatar display
  documentUrl?: string; // ID proof document for document preview
}

const content = {
  en: {
    title: 'Visitor Requests & Master Data',
    subtitle: 'Approve pending requests, monitor footfall, and manage security.',
    tabs: { pending: 'Pending Approval', inside: 'Checked In', expected: 'Expected/Approved', overstay: 'Overstay / Alerts', history: 'History' },
    searchPlaceholder: 'Search by visitor name, pass ID, or mobile...',
    columns: { visitor: 'Visitor Details', host: 'Host & Department', purpose: 'Purpose', timing: 'Timing', status: 'Status', actions: 'Actions' },
    actions: { approve: 'Approve', reject: 'Disapprove', wait: 'Wait', details: 'View Details', confirm: 'Confirm Approval', cancel: 'Cancel', reschedule: 'Confirm & Reschedule', dismiss: 'Remove from list' },
    status: { 'pending': 'Pending', 'waiting': 'Waiting List', 'checked-in': 'Checked In', 'checked-out': 'Checked Out', 'expected': 'Approved', 'overstay': 'Overstay', 'rejected': 'Disapproved' },
    approvalModal: { title: 'Process Visitor Request', desc: 'Check the officer\'s availability before confirming this visitor.', purpose: 'PURPOSE', reqTime: 'REQUESTED TIME', idProof: 'Identity Proof', checkAvail: 'Check Your Availability', selectedSlot: 'Selected Slot:', instructions: '* Hover over Red/Yellow slots to see meeting details. Click a Green slot to select it for this visitor.' },
    idModal: { title: 'ID Proof Preview', noDoc: 'No document available to preview.' }
  },
  hi: {
    title: 'आगंतुक अनुरोध और डेटा',
    subtitle: 'लंबित अनुरोधों को अनुमोदित करें और सुरक्षा प्रबंधित करें।',
    tabs: { pending: 'लंबित स्वीकृति', inside: 'चेक इन', expected: 'अपेक्षित/स्वीकृत', overstay: 'ओवरस्टे / अलर्ट', history: 'इतिहास' },
    searchPlaceholder: 'नाम, पास आईडी या मोबाइल से खोजें...',
    columns: { visitor: 'आगंतुक विवरण', host: 'मेजबान', purpose: 'उद्देश्य', timing: 'समय', status: 'स्थिति', actions: 'क्रियाएँ' },
    actions: { approve: 'स्वीकार करें', reject: 'अस्वीकार करें', wait: 'प्रतीक्षा करें', details: 'विवरण देखें', confirm: 'पुष्टि करें', cancel: 'रद्द करें', reschedule: 'पुष्टि करें और पुनर्निर्धारित करें', dismiss: 'सूची से हटाएं' },
    status: { 'pending': 'लंबित', 'waiting': 'प्रतीक्षा सूची', 'checked-in': 'चेक इन', 'checked-out': 'चेक आउट', 'expected': 'स्वीकृत', 'overstay': 'ओवरस्टे', 'rejected': 'अस्वीकृत' },
    approvalModal: { title: 'आगंतुक अनुरोध संसाधित करें', desc: 'इस आगंतुक की पुष्टि करने से पहले अधिकारी की उपलब्धता की जाँच करें।', purpose: 'उद्देश्य', reqTime: 'अनुरोधित समय', idProof: 'पहचान प्रमाण', checkAvail: 'अपनी उपलब्धता की जाँच करें', selectedSlot:'चयनित स्लॉट:', instructions: '* विवरण देखने के लिए लाल/पीले स्लॉट पर होवर करें। इसे चुनने के लिए हरे स्लॉट पर क्लिक करें।' },
    idModal: { title: 'आईडी प्रमाण पूर्वावलोकन', noDoc: 'पूर्वावलोकन के लिए कोई दस्तावेज़ उपलब्ध नहीं है।' }
  },
  mr: {
    title: 'अभ्यागत विनंत्या आणि मास्टर डेटा',
    subtitle: 'प्रलंबित विनंत्या मंजूर करा, फूटफॉलचे निरीक्षण करा आणि सुरक्षा व्यवस्थापित करा.',
    tabs: { pending: 'मंजूरी प्रलंबित', inside: 'चेक इन', expected: 'अपेक्षित/मंजूर', overstay: 'ओव्हरस्टे / अलर्ट', history: 'इतिहास' },
    searchPlaceholder: 'अभ्यागताचे नाव, पास आयडी किंवा मोबाईलद्वारे शोधा...',
    columns: { visitor: 'अभ्यागत तपशील', host: 'यजमान आणि विभाग', purpose: 'उद्देश', timing: 'वेळ', status: 'स्थिती', actions: 'क्रिया' },
    actions: { approve: 'मंजूर करा', reject: 'नाकारा', wait: 'प्रतीक्षा करा', details: 'तपशील पहा', confirm: 'मंजुरीची पुष्टी करा', cancel: 'रद्द करा', reschedule: 'पुष्टि करा आणि पुन्हा शेड्यूल करा', dismiss: 'यादीतून काढा' },
    status: { 'pending': 'प्रलंबित', 'waiting': 'प्रतीक्षा यादी', 'checked-in': 'चेक इन', 'checked-out': 'चेक आउट', 'expected': 'मंजूर', 'overstay': 'ओव्हरस्टे', 'rejected': 'नाकारले' },
    approvalModal: { title: 'अभ्यागत विनंतीवर प्रक्रिया करा', desc: 'या अभ्यागताची पुष्टी करण्यापूर्वी अधिकाऱ्याची उपलब्धता तपासा.', purpose: 'उद्देश', reqTime: 'विनंती केलेली वेळ', idProof: 'ओळख पुरावा', checkAvail: 'तुमची उपलब्धता तपासा', selectedSlot: 'निवडलेला स्लॉट:', instructions: '* तपशील पाहण्यासाठी लाल/पिवळ्या स्लॉटवर फिरवा. निवडण्यासाठी हिरव्या स्लॉटवर क्लिक करा.' },
    idModal: { title: 'ओळख पुरावा पूर्वावलोकन', noDoc: 'पूर्वावलोकन करण्यासाठी कोणताही दस्तऐवज उपलब्ध नाही.' }
  },
};

const VisitorsContent: React.FC<VisitorsContentProps> = ({ lang, tenant }) => {
  const t = content[lang];
  const { user } = useAuth();
   
  const [visitors, setVisitors] = useState<Visitor[]>([]); // Initialized empty
  const [selectedTab, setSelectedTab] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Track IDs of visitors who were processed but should stay visible until dismissed
  const [recentlyProcessedIds, setRecentlyProcessedIds] = useState<string[]>([]);

  // Approval Modal State
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
   
  // ID Preview Modal State
  const [isIdPreviewOpen, setIsIdPreviewOpen] = useState(false);

  // Avatar Preview Modal State (New)
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [avatarPreviewVisitor, setAvatarPreviewVisitor] = useState<Visitor | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    purpose: '',
    expectedTime: ''
  });
  const [photoErrors, setPhotoErrors] = useState<Record<string, boolean>>({});
  const [documentErrors, setDocumentErrors] = useState<Record<string, boolean>>({}); 
  const [loadingPhotos, setLoadingPhotos] = useState<Record<string, boolean>>({});
  
// Schedule Logic
  const [mySlots, setMySlots] = useState<ScheduleSlot[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(''); 
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(null); // Store slot ID for database

  // Fetch Visitors from Backend API
  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        console.log('📡 Fetching visitor requests from backend...');
        // Fetch from real backend API - use visitor requests endpoint
        const { adminService } = await import('../../../services/api');
        const data = await adminService.getPendingVisitorRequests();
        
        console.log('✅ Received data from backend:', data);
        
        if (!data || !Array.isArray(data)) {
          console.warn('⚠️ Invalid data format:', data);
          setVisitors([]);
          return;
        }

        // Map backend response to UI format
        const mappedVisitors: Visitor[] = data.map((v: any) => {
          const passId = v.pass_id || `REQ-${v.request_id}`;
           
          // Map backend status (UPPERCASE) to UI status (lowercase with hyphens)
          const backendStatus = (v.status || 'PENDING').toUpperCase();
          const statusMap: { [key: string]: VisitorStatus } = {
            'PENDING': 'pending',
            'APPROVED': 'expected',
            'WAITING': 'waiting',
            'REJECTED': 'rejected',
            'CHECKED_IN': 'checked-in',
            'COMPLETED': 'checked-out'
          };
          const status: VisitorStatus = statusMap[backendStatus] || 'pending';
           
          // ✅ Construct photo URL with proper encoding
          let photoUrl: string | undefined;
          if (v.visitor_photo_url) {
            const photoPath = v.visitor_photo_url;
            photoUrl = `http://localhost:3001/ftp/serve-file?path=${encodeURIComponent(photoPath)}`;
            console.log(`📸 Photo URL for ${v.visitor_name}:`, photoUrl);
          }

          // ✅ Construct document URL with proper encoding
          let docUrl: string | undefined;
          if (v.document_url) {
            const docPath = v.document_url;
            docUrl = `http://localhost:3001/ftp/serve-file?path=${encodeURIComponent(docPath)}`;
            console.log(`📄 Document URL for ${v.visitor_name}:`, docUrl);
          }

          return {
            id: String(v.request_id),
            passId: passId,
            name: v.visitor_name || 'Unknown',
            mobile: v.mobile_number || 'N/A',
            hostName: v.host_name || 'Not Assigned',
            hostDept: v.department || 'General',
            purpose: v.purpose || 'Not Specified',
            inTime: null,
            outTime: null,
            expectedTime: `${v.visit_start_time} - ${v.visit_end_time}` || '09:00 - 09:30',
            status: status,
            userType: v.visitor_type || 'Visitor',
            idProofImage: photoUrl,  // ✅ Visitor photo for avatar display
            documentUrl: docUrl  // ✅ ID proof document for document preview
          };
        });
        
        console.log('📊 Mapped visitors:', mappedVisitors);
        setVisitors(mappedVisitors);
      } catch (error) {
        console.error('❌ Error fetching visitors:', error);
        setVisitors([]);
      }
    };

    fetchVisitors();
     
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchVisitors, 5000);
    return () => clearInterval(interval);
  }, [tenant]);

  const myId = useMemo(() => {
        if (user?.role === 'admin') return 'admin_1';
        if (user?.role === 'clerk') return 'clerk_1';
        return 'off_1'; 
  }, [user]);
  // --- Actions ---
  const handleStatusChange = async (id: string, newStatus: VisitorStatus) => {
    const visitor = visitors.find(v => v.id === id);
    if (!visitor) return;

    try {
      console.log(`🔄 Updating visitor ${id} status to ${newStatus}...`);
       
      // Update UI immediately for better UX
      setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
       
      // Map UI status to backend status format
      const statusMap: { [key: string]: string } = {
        'pending': 'PENDING',
        'expected': 'APPROVED',
        'waiting': 'WAITING',
        'rejected': 'REJECTED',
        'checked-in': 'CHECKED_IN',
        'checked-out': 'COMPLETED'
      };
       
      const backendStatus = statusMap[newStatus] || 'PENDING';
       
      // Call backend API to update status with time slot ID if approving
      const { adminService } = await import('../../../services/api');
      const updatePayload: any = {
        status: backendStatus
      };
      
      // Include time slot ID when approving with a selected slot
      if (newStatus === 'expected' && selectedTimeSlotId) {
        updatePayload.time_slots_id = selectedTimeSlotId;
        console.log(`   📅 Including time slot ID: ${selectedTimeSlotId}`);
      }
      
      await adminService.updateRequestStatus(Number(id), backendStatus as 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'WAITING' | 'CHECKED_IN', updatePayload);
       
      console.log('✅ Status updated in backend');
       
      // Notify visitor of status change
      await notifyVisitor(visitor.name, visitor.mobile, newStatus);
       
      // Add to processed list
      if (newStatus === 'expected' || newStatus === 'rejected' || newStatus === 'waiting' || newStatus === 'checked-in') {
        setRecentlyProcessedIds(prev => [...prev, id]);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      console.error('   Error details:', error instanceof Error ? error.message : JSON.stringify(error));
      // Revert UI on error
      setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: visitor.status } : v));
      alert(`Failed to update visitor status: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
    
    if (isApprovalOpen) closeApprovalModal();
  };

  const handleDismiss = (id: string) => {
    // Remove from processed list, effectively hiding it from the "Pending" tab
    setRecentlyProcessedIds(prev => prev.filter(pid => pid !== id));
  };

  const openEditModal = (visitor: Visitor) => {
    setEditingVisitor(visitor);
    setEditFormData({
      name: visitor.name,
      purpose: visitor.purpose,
      expectedTime: visitor.expectedTime
    });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingVisitor(null);
  };

  const handleEditSave = async () => {
    if (!editingVisitor) return;

    try {
      console.log('💾 Saving edited visitor data:', editFormData);

      // Parse time slots properly
      const timeParts = editFormData.expectedTime.includes('-') 
        ? editFormData.expectedTime.split('-').map(t => t.trim())
        : [editFormData.expectedTime, editFormData.expectedTime];
       
      const startTime = timeParts[0] || editFormData.expectedTime;
      const endTime = timeParts[1] || editFormData.expectedTime;

      console.log('   Parsed times:', { startTime, endTime });

      // Update backend
      const { visitorService } = await import('../../../services/api');
      const response = await visitorService.updateVisitorRequest(Number(editingVisitor.id), {
        visitor_name: editFormData.name,
        visitor_type: editFormData.purpose,
        visit_start_time: startTime,
        visit_end_time: endTime
      });

      console.log('✅ API Response:', response);

      // Update local state
      setVisitors(prev => 
        prev.map(v =>
          v.id === editingVisitor.id
            ? {
                ...v,
                name: editFormData.name,
                purpose: editFormData.purpose,
                expectedTime: editFormData.expectedTime
              }
            : v
        )
      );

      console.log('✅ Visitor updated successfully');
      alert('Visitor information updated successfully!');
      closeEditModal();
    } catch (error) {
      console.error('❌ Error updating visitor:', error);
      console.error('   Full error details:', JSON.stringify(error, null, 2));
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`Failed to update visitor: ${errorMsg}`);
    }
  };

  const openApprovalModal = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setSelectedTimeSlot(visitor.expectedTime);
    setSelectedTimeSlotId(null); // Reset time slot ID
    setIsApprovalOpen(true);
    
    setLoadingSchedule(true);
    getOfficerSchedule(myId, new Date()).then(slots => {
        setMySlots(slots);
        setLoadingSchedule(false);
        
        // Auto-select the visitor's requested time slot if available
        const visitSlot = slots.find(s => s.time === visitor.expectedTime);
        if (visitSlot) {
          const slotId = (visitSlot as any).id || extractTimeSlotId(visitor.expectedTime);
          setSelectedTimeSlotId(slotId);
          console.log(`✅ Pre-selected visitor's requested slot: ${visitor.expectedTime}, ID: ${slotId}`);
        }
    });
  };

  const closeApprovalModal = () => {
    setIsApprovalOpen(false);
    setSelectedVisitor(null);
    setSelectedTimeSlot('');
  };

  // Avatar Preview Logic
  const openAvatarPreview = (visitor: Visitor) => {
    setAvatarPreviewVisitor(visitor);
    setIsAvatarPreviewOpen(true);
  };

  const closeAvatarPreview = () => {
    setIsAvatarPreviewOpen(false);
    setAvatarPreviewVisitor(null);
  };

  // Photo Loading Handlers
  const handlePhotoLoad = (visitorId: string) => {
    setLoadingPhotos(prev => ({ ...prev, [visitorId]: false }));
  };

  const handlePhotoError = (visitorId: string) => {
    setPhotoErrors(prev => ({ ...prev, [visitorId]: true }));
    setLoadingPhotos(prev => ({ ...prev, [visitorId]: false }));
    console.warn(`⚠️ Photo failed to load for visitor ${visitorId}`);
  };

  const handleSlotSelect = (slot: ScheduleSlot) => {
      if (slot.status === 'available') {
          setSelectedTimeSlot(slot.time);
          // Extract time slot ID from slot - if it has an id field use it
          const slotId = (slot as any).id || extractTimeSlotId(slot.time);
          setSelectedTimeSlotId(slotId);
          console.log(`✅ Selected time slot: ${slot.time}, ID: ${slotId}`);
      }
  };

  // Helper function to extract time slot ID from time string
  const extractTimeSlotId = (timeStr: string): number | null => {
    if (!timeStr || !mySlots) return null;
    const slot = mySlots.find(s => s.time === timeStr);
    return (slot as any)?.id || null;
  };

  // --- Filter Logic ---
  const handleTabSelect = (_: unknown, data: SelectTabData) => setSelectedTab(String(data.value));

  const filteredVisitors = useMemo(() => {
    let filtered = visitors;
     
    if (selectedTab !== 'all') {
       if (selectedTab === 'pending') {
           // Show Pending, Waiting OR items that were just processed (Approved/Rejected) and not dismissed
           filtered = filtered.filter(v => 
               v.status === 'pending' || 
               v.status === 'waiting' || 
               recentlyProcessedIds.includes(v.id)
           );
       }
       else if (selectedTab === 'inside') filtered = filtered.filter(v => v.status === 'checked-in');
       else if (selectedTab === 'expected') filtered = filtered.filter(v => v.status === 'expected');
       else if (selectedTab === 'overstay') filtered = filtered.filter(v => v.status === 'overstay');
       else if (selectedTab === 'history') filtered = filtered.filter(v => v.status === 'checked-out' || v.status === 'rejected');
    }
 if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v => v.name.toLowerCase().includes(term) || v.passId.toLowerCase().includes(term));
    }
    return filtered;
  }, [selectedTab, searchTerm, visitors, recentlyProcessedIds]);

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
       
      {/* Header Section */}
      <div className="p-6 pb-0">
        <div className="flex justify-between items-start mb-4">
             <div>
                <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100">{t.title}</h1>
                <p className="text-neutral-500 mt-1">{t.subtitle}</p>
             </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-2 overflow-x-auto">
             <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect}>
                <Tab value="pending" icon={<span className="material-symbols-outlined text-brand">pending_actions</span>}>{t.tabs.pending}</Tab>
                <Tab value="expected" icon={<span className="material-symbols-outlined text-success">event_available</span>}>{t.tabs.expected}</Tab>
                <Tab value="inside" icon={<span className="material-symbols-outlined text-neutral-500">login</span>}>{t.tabs.inside}</Tab>
                <Tab value="history">{t.tabs.history}</Tab>
            </TabList>
          </div>
          <Input 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e, data) => setSearchTerm(data.value)}
            contentAfter={<span className="material-symbols-outlined text-neutral-500">search</span>}
            className="w-full md:max-w-md"
          />
        </div>
      </div>

      {/* Data Grid Section */}
      <div className="flex-grow p-6 overflow-hidden">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 h-full overflow-y-auto">
          <Table aria-label="Visitor Data Table" style={{ width: '100%', minWidth: 'auto' }}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell className="font-semibold">{t.columns.visitor}</TableHeaderCell>
                <TableHeaderCell className="font-semibold">{t.columns.host}</TableHeaderCell>
                <TableHeaderCell className="font-semibold">{t.columns.purpose}</TableHeaderCell>
                <TableHeaderCell className="font-semibold">{t.columns.timing}</TableHeaderCell>
                <TableHeaderCell className="font-semibold">{t.columns.status}</TableHeaderCell>
                <TableHeaderCell className="text-right font-semibold pr-4">{t.columns.actions}</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
{filteredVisitors.map((visitor) => {
                 return (
                  <TableRow key={visitor.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    {/* Visitor Details */}
                    <TableCell>
                      <TableCellLayout 
                        media={
                          <div 
                            className="cursor-pointer hover:opacity-80 transition-opacity relative" 
                            onClick={(e) => { e.stopPropagation(); openAvatarPreview(visitor); }}
                            title="Click to view photo"
                          >
                            {loadingPhotos[visitor.id] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 rounded-full">
                                <span className="text-xs text-neutral-500">⟳</span>
                              </div>
                            )}
                            <Avatar 
                              name={visitor.name} 
                              size={36} 
                              color="colorful" 
                              image={visitor.idProofImage ? { src: visitor.idProofImage } : undefined}
                              onLoad={() => handlePhotoLoad(visitor.id)}
                              onError={() => handlePhotoError(visitor.id)}
                            />
                          </div>
                        }
                      >
                          <div className="flex flex-col max-w-[140px]">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{visitor.name}</span>
                            <span className="text-xs text-neutral-500 font-mono truncate">{visitor.passId}</span>
                            {visitor.userType && <span className="text-xs font-bold text-primary truncate">{visitor.userType}</span>}
                          </div>
                      </TableCellLayout>
                    </TableCell>

                    {/* Host */}
                    <TableCell>
                      <TableCellLayout>
                          <div className="flex flex-col max-w-[120px]">
                            <span className="text-neutral-900 dark:text-neutral-100 truncate">{visitor.hostName}</span>
                            <span className="text-xs text-neutral-500 truncate">{visitor.hostDept}</span>
                          </div>
                      </TableCellLayout>
                    </TableCell>

                    {/* Purpose */}
                    <TableCell>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300 text-sm truncate max-w-[100px] block">
                          {visitor.purpose}
                      </span>
                    </TableCell>

                    {/* Timing */}
                    <TableCell>
                      <TableCellLayout>
                        <div className="flex flex-col gap-1 text-sm whitespace-nowrap">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span>{visitor.expectedTime}</span>
                        </div>
                      </TableCellLayout>
                    </TableCell>

                    {/* Status Column - CUSTOM UI FOR ACTIONS */}
                    <TableCell>
                      <TableCellLayout>
                        {/* Logic: If pending/waiting, show normal badge. 
                            If Approved (expected), show GREEN border UI.
                            If Rejected, show RED border UI.
                        */}
                        {visitor.status === 'expected' ? ( <div className="inline-flex items-center px-2 py-1 rounded-full border border-[#107c10] bg-green-50 text-[#107c10] text-xs font-bold gap-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                {t.status.expected}
                            </div>
                        ) : visitor.status === 'rejected' ? (
                            <div className="inline-flex items-center px-2 py-1 rounded-full border border-[#c50f1f] bg-red-50 text-[#c50f1f] text-xs font-bold gap-1">
                                <span className="material-symbols-outlined text-[14px]">block</span>
                                {t.status.rejected}
                            </div>
                        ) : visitor.status === 'waiting' ? (
                             <Badge appearance="tint" color="warning" icon={<span className="material-symbols-outlined text-[14px]">hourglass_top</span>}>
                                {t.status.waiting}
                             </Badge>
                        ) : (
                             <Badge appearance="tint" color="brand" icon={<span className="material-symbols-outlined text-[14px]">pending</span>}>
                                {t.status.pending}
                             </Badge>
                        )}
                      </TableCellLayout>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <TableCellLayout className="justify-end pr-2">
                          <div className="flex justify-end gap-1.5">
                            {/* If item is recently processed (Approved/Rejected), show Dismiss Button */}
                            {(visitor.status === 'expected' || visitor.status === 'rejected') && recentlyProcessedIds.includes(visitor.id) ? (
                                <Tooltip content={t.actions.dismiss} relationship="label">
                                    <Button 
                                        size="small"
                                        appearance="subtle"
                                        icon={<span className="material-symbols-outlined text-neutral-400 hover:text-neutral-800">close</span>}
                                        onClick={() => handleDismiss(visitor.id)}
                                    />
                                </Tooltip>
                            ) : (visitor.status === 'pending' || visitor.status === 'waiting') ? (
                                <>
                                    <Tooltip content="View & Edit" relationship="label">
                                        <Button 
                                            size="small"
                                            appearance="outline"
                                            icon={<span className="material-symbols-outlined text-blue-600">visibility</span>}
                                            onClick={() => openEditModal(visitor)} className="!border-blue-300 hover:!bg-blue-50"
                                        />
                                    </Tooltip>

                                    <Button 
                                        size="small" 
                                        appearance="outline" 
                                        className="!border-green-600 !text-green-600 hover:!bg-green-50 px-3 min-w-[70px]"
                                        onClick={() => openApprovalModal(visitor)}
                                    >
                                        {t.actions.approve}
                                    </Button>
                                    
                                    {/* Wait button */}
                                    <Button 
                                        size="small" 
                                        appearance="outline"
                                        className={`!border-neutral-300 !text-neutral-700 hover:!bg-neutral-50 px-3 min-w-[60px] ${visitor.status === 'waiting' ? 'bg-neutral-100' : ''}`}
                                        onClick={() => handleStatusChange(visitor.id, 'waiting')}
                                    >
                                        {t.actions.wait}
                                    </Button>

                                    <Button 
                                        size="small" 
                                        appearance="outline" 
                                        className="!border-red-600 !text-red-600 hover:!bg-red-50 px-3 min-w-[80px]"
                                        onClick={() => handleStatusChange(visitor.id, 'rejected')}
                                    >
                                        {t.actions.reject}
                                    </Button>
                                </>
                            ) : visitor.status === 'expected' ? (
                                <>
                                    <Tooltip content={t.actions.details} relationship="label">
                                        <Button 
                                            size="small"
                                            appearance="outline"
                                            icon={<span className="material-symbols-outlined text-blue-600">visibility</span>}
                                            onClick={() => openApprovalModal(visitor)}
                                            className="!border-blue-300 hover:!bg-blue-50"
                                        />
                                    </Tooltip>
                                    <Tooltip content="Mark as Checked In" relationship="label">
                                        <Button 
                                            size="small"
                                            appearance="outline" icon={<span className="material-symbols-outlined text-green-600">check_circle</span>}
                                            onClick={() => handleStatusChange(visitor.id, 'checked-in')}
                                            className="!border-green-300 hover:!bg-green-50"
                                        />
                                    </Tooltip>
                                    <Tooltip content="Disapprove" relationship="label">
                                        <Button 
                                            size="small"
                                            appearance="outline"
                                            icon={<span className="material-symbols-outlined text-red-600">cancel</span>}
                                            onClick={() => handleStatusChange(visitor.id, 'rejected')}
                                            className="!border-red-300 hover:!bg-red-50"
                                        />
                                    </Tooltip>
                                </>
                            ) : (
                                <Button appearance="subtle" icon={<span className="material-symbols-outlined">more_vert</span>} />
                            )}
                          </div>
                      </TableCellLayout>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- PROCESS REQUEST MODAL --- */}
      <Dialog open={isApprovalOpen} onOpenChange={(e, data) => !data.open && closeApprovalModal()}>
        <DialogSurface className="w-full max-w-5xl max-h-[90vh] relative">
            <div className="absolute top-4 right-4 z-10">
                <Button 
                    appearance="subtle" 
                    icon={<span className="material-symbols-outlined">close</span>} 
                    onClick={closeApprovalModal} 
                    aria-label="Close"
                />
            </div>

            <DialogBody>
                <DialogTitle className="pr-10">{t.approvalModal.title}</DialogTitle>
                <DialogContent>
                    {selectedVisitor && (
                        <div className="space-y-6 mt-4">
                            
                            <div className="flex flex-col md:flex-row gap-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    {/* Updated to allow clicking for preview even inside modal */}
                                    <div 
                                        className="cursor-pointer hover:opacity-80 transition-opacity" 
                                        onClick={() => openAvatarPreview(selectedVisitor)}
                                        title="View photo"
                                    >
                                        <Avatar   name={selectedVisitor.name} 
                                            size={64} 
                                            color="colorful" 
                                            image={selectedVisitor.idProofImage ? { src: selectedVisitor.idProofImage } : undefined}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-neutral-900 dark:text-neutral-100">{selectedVisitor.name}</p>
                                        <p className="text-sm text-neutral-500">{selectedVisitor.userType || 'Visitor'}</p>
                                    </div>
                                </div>
                                <div className="h-px md:h-auto w-full md:w-px bg-blue-200 dark:bg-blue-800"></div>
                                
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <p className="text-xs uppercase font-bold text-neutral-400">{t.approvalModal.purpose}</p>
                                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{selectedVisitor.purpose}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold text-neutral-400">{t.approvalModal.reqTime}</p>
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{selectedVisitor.expectedTime}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start justify-start sm:justify-end">
                                        <Button 
                                            appearance="outline" 
                                            icon={<span className="material-symbols-outlined text-[18px]">visibility</span>}
                                            // Removed 'disabled' check to allow preview of Initials/No-doc state
                                            onClick={() => setIsIdPreviewOpen(true)}
                                            className="w-full sm:w-auto"
                                        >
                                            {t.approvalModal.idProof}
                                        </Button>
                                    </div>
                                </div>
                            </div>
  <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">calendar_month</span>
                                        {t.approvalModal.checkAvail}
                                    </h3>
                                    <div className="text-sm bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700">
                                        {t.approvalModal.selectedSlot} <span className="font-bold text-blue-600 font-mono">{selectedTimeSlot || "None"}</span>
                                    </div>
                                </div>

                                <div className="relative border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden p-4 bg-neutral-50/50 dark:bg-neutral-900">
                                    <ScheduleBoard 
                                        slots={mySlots} 
                                        loading={loadingSchedule} 
                                        isViewingSelf={true} 
                                        onRequest={(slot) => handleSlotSelect(slot)} 
                                    />
                                    
                                    <div className="text-center mt-4 text-xs text-neutral-400 italic">
                                        {t.approvalModal.instructions}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button appearance="secondary" onClick={closeApprovalModal}>{t.actions.cancel}</Button>
                    <Button appearance="outline" onClick={() => { if(selectedVisitor) handleStatusChange(selectedVisitor.id, 'rejected'); }}>{t.actions.reject}</Button>
                    <Button 
                        appearance="primary" 
                        disabled={!selectedTimeSlot}
                        onClick={() => { if(selectedVisitor) handleStatusChange(selectedVisitor.id, 'expected'); }}
                    >
                        {selectedTimeSlot !== selectedVisitor?.expectedTime ? t.actions.reschedule : t.actions.confirm}
                    </Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* --- ID PREVIEW MODAL --- */}
      <Dialog open={isIdPreviewOpen} onOpenChange={(e, data) => !data.open && setIsIdPreviewOpen(false)}>
        <DialogSurface className="w-full max-w-3xl relative"> 
            <div className="absolute top-4 right-4 z-10">
                <Button 
                    appearance="subtle" 
                    icon={<span className="material-symbols-outlined">close</span>} 
                    onClick={() => setIsIdPreviewOpen(false)} 
                    aria-label="Close Preview"
                />
            </div>

            <DialogBody>
                <DialogTitle>{t.idModal.title}</DialogTitle>
                <DialogContent> {selectedVisitor ? (
                       <div className="flex justify-center bg-black/5 dark:bg-black/50 rounded-lg p-8 mt-2 min-h-[300px] items-center flex-col gap-4">
                          {loadingPhotos[selectedVisitor.id] && (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-16 h-16 rounded-full border-4 border-neutral-200 border-t-blue-500 animate-spin"></div>
                              <span className="text-sm text-neutral-500">Loading document...</span>
                            </div>
                          )}
                          {/* Display document image/PDF if available, otherwise show placeholder */}
                          {selectedVisitor.documentUrl ? (
                            selectedVisitor.documentUrl.toLowerCase().endsWith('.pdf') ? (
                              <iframe
                                src={selectedVisitor.documentUrl}
                                title="ID Proof Document"
                                className="w-full h-[400px] shadow-md rounded-lg border border-neutral-200"
                                onError={() => setPhotoErrors(prev => ({ ...prev, [selectedVisitor.id]: true }))}
                                onLoad={() => setLoadingPhotos(prev => ({ ...prev, [selectedVisitor.id]: false }))}
                              />
                            ) : (
                              <img 
                                src={selectedVisitor.documentUrl} 
                                alt="ID Proof Document"
                                className="max-h-[400px] max-w-full shadow-md rounded-lg"
                                onError={() => setPhotoErrors(prev => ({ ...prev, [selectedVisitor.id]: true }))}
                                onLoad={() => setLoadingPhotos(prev => ({ ...prev, [selectedVisitor.id]: false }))}
                              />
                            )
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-center">
                              <span className="material-symbols-outlined text-5xl text-neutral-300">description</span>
                              <p className="text-sm text-neutral-500">Document not available</p>
                              <p className="text-xs text-neutral-400">{t.idModal.noDoc}</p>
                            </div>
                          )}
                       </div>
                    ) : (
                        <div className="p-8 text-center text-neutral-500">
                            {t.idModal.noDoc}
                        </div>
                    )}
                </DialogContent>
            </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* --- AVATAR PREVIEW MODAL (NEW) --- */}
      <Dialog open={isAvatarPreviewOpen} onOpenChange={(e, data) => !data.open && closeAvatarPreview()}>
        <DialogSurface className="w-full max-w-md relative"> 
            <div className="absolute top-4 right-4 z-10">
                <Button 
                    appearance="subtle" 
                    icon={<span className="material-symbols-outlined">close</span>} 
                    onClick={closeAvatarPreview} 
                    aria-label="Close Preview"
                />
            </div>

            <DialogBody>
                <DialogTitle>Visitor Photo</DialogTitle>
                <DialogContent>
                    {avatarPreviewVisitor && (
                       <div className="flex justify-center bg-neutral-50 dark:bg-neutral-900 rounded-lg p-8 mt-2 items-center flex-col gap-4 min-h-[300px]">
                          {loadingPhotos[avatarPreviewVisitor.id] && (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-16 h-16 rounded-full border-4 border-neutral-200 border-t-blue-500 animate-spin"></div>
                              <span className="text-sm text-neutral-500">Loading photo...</span>
                            </div>
                          )}
                          {/* Display photo image if available, otherwise show Avatar with initials */}
                          {avatarPreviewVisitor.idProofImage ? (
                            <img 
                              src={avatarPreviewVisitor.idProofImage} 
                              alt="Visitor Photo"
                              className="w-32 h-32 rounded-full shadow-md object-cover border-4 border-neutral-200"
                              onError={() => setPhotoErrors(prev => ({ ...prev, [avatarPreviewVisitor.id]: true }))}
                              onLoad={() => setLoadingPhotos(prev => ({ ...prev, [avatarPreviewVisitor.id]: false }))}
                            />
                          ) : (
                            <Avatar
                               name={avatarPreviewVisitor.name}
                               color="colorful"
                               size={128}
                               className="shadow-md scale-150"
                            />
                          )}
                          {photoErrors[avatarPreviewVisitor.id] && (
                            <div className="flex flex-col items-center gap-2 text-center">
                              <span className="material-symbols-outlined text-5xl text-neutral-300">image_not_supported</span>
                              <p className="text-sm text-neutral-500">Photo not available</p>
                              <p className="text-xs text-neutral-400">Showing initials instead</p>
                            </div>
                          )}
                       </div>
                    )}
                </DialogContent>
            </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* --- EDIT VISITOR MODAL --- */}
      <Dialog open={isEditOpen} onOpenChange={(e, data) => !data.open && closeEditModal()}>
        <DialogSurface className="w-full max-w-2xl relative">
            <div className="absolute top-4 right-4 z-10">
                <Button 
                    appearance="subtle" 
                    icon={<span className="material-symbols-outlined">close</span>} 
                    onClick={closeEditModal} 
                    aria-label="Close"
                />
            </div>
 <DialogBody>
                <DialogTitle>Edit Visitor Information</DialogTitle>
                <DialogContent>
                    {editingVisitor && (
                        <div className="flex flex-col gap-4 py-4">
                            {/* Visitor Name Field */}
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                                    Visitor Name
                                </label>
                                <Input
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    placeholder="Enter visitor name"
                                    className="w-full"
                                />
                            </div>

                            {/* Purpose Field */}
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                                    Purpose/Reason
                                </label>
                                <Dropdown
                                    value={editFormData.purpose}
                                    onOptionSelect={(e, data) => setEditFormData({ ...editFormData, purpose: data.optionValue || '' })}
                                    placeholder="Select visitor type"
                                    className="w-full"
                                >
                                    <Option value="Visitor">Visitor</Option>
                                    <Option value="Vendor">Vendor</Option>
                                    <Option value="Officer">Officer</Option>
                                </Dropdown>
                            </div>

                            {/* Timing Field */}
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                                    Expected Time
                                </label>
                                <Input
                                    value={editFormData.expectedTime}
                                    onChange={(e) => setEditFormData({ ...editFormData, expectedTime: e.target.value })}
                                    placeholder="e.g., 09:00 - 10:00"
                                    className="w-full"
                                />
                                <span className="text-xs text-neutral-500">Format: HH:MM - HH:MM (e.g., 09:00 - 10:00)</span>
                            </div>

                            {/* Pass ID (Read-only) */}
                            <div className="flex flex-col gap-2">
                                <label className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                                    Pass ID (Read-only)    </label>
                                <Input
                                    value={editingVisitor.passId}
                                    disabled
                                    className="w-full bg-neutral-50 dark:bg-neutral-800"
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        appearance="secondary"
                        onClick={closeEditModal}
                    >
                        Cancel
                    </Button>
                    <Button 
                        appearance="primary"
                        onClick={handleEditSave}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
      </Dialog>

    </div>
  );
};

export default VisitorsContent;