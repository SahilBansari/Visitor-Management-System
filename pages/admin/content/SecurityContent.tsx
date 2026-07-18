import React, { useState } from 'react';
import type { Language } from '../../../App';
import SecurityDashboard from '../../SecurityDashboard'; 
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
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  Card,
  CardHeader,
  Text,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  PresenceBadgeStatus
} from '@fluentui/react-components';

interface SecurityContentProps {
  lang: Language;
}

// --- Types ---
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
type AlertType = 'overstay' | 'blacklist_attempt' | 'unauthorized_zone' | 'tailgating';

interface SecurityAlert {
  id: string;
  timestamp: string;
  type: AlertType;
  severity: AlertSeverity;
  location: string;
  subjectName: string;
  subjectId: string;
  status: 'active' | 'investigating' | 'resolved';
}

interface BlacklistEntry {
  id: string;
  name: string;
  govtId: string;
  reason: string;
  addedBy: string;
  dateAdded: string;
  status: 'active' | 'appealed';
}

// --- Localization Content ---
const content = {
  en: {
    title: 'Security Operations Center',
    subtitle: 'Real-time threat monitoring, blacklist management, and zone control.',
    stats: {
      active: 'Active Alerts',
      blacklisted: 'Blacklisted Profiles',
      zones: 'Zone Integrity',
    },
    tabs: {
      surveillance: 'Live Surveillance', 
      alerts: 'Live Alerts',
      blacklist: 'Blacklist Management',
      zones: 'Zone Status',
    },
    actions: {
      lockdown: 'Initiate Lockdown',
      addBlacklist: 'Add to Blacklist',
      dispatch: 'Dispatch Guard',
      resolve: 'Mark Resolved',
      viewFeed: 'View CCTV',
      liftLockdown: 'LIFT LOCKDOWN',
      confirm: 'Confirm',
      cancel: 'Cancel'
    },
    columns: {
      severity: 'Severity',
      time: 'Time',
      type: 'Incident Type',
      subject: 'Subject',
      location: 'Location',
      status: 'Status',
      actions: 'Actions',
      reason: 'Reason for Ban',
      added: 'Added On',
    },
    alerts: {
      overstay: 'Overstay Violation',
      blacklist_attempt: 'Blacklist Entry Attempt',
      unauthorized_zone: 'Unauthorized Zone Access',
      tailgating: 'Tailgating Detected',
    },
    dialog: {
        title: 'Confirm Emergency Action',
        lockdownBody: 'Are you sure you want to INITIATE a lockdown? This will seal all exits and trigger alarms.',
        liftBody: 'Are you sure you want to LIFT the lockdown? This will unlock all turnstiles and elevators.'
    },
    toast: {
        initiated: 'SYSTEM ALERT: Facility Lockdown Initiated!',
        lifted: 'SYSTEM UPDATE: Lockdown Lifted. Operations Normal.'
    }
  },
  hi: {
    title: 'सुरक्षा संचालन केंद्र',
    subtitle: 'वास्तविक समय खतरा निगरानी, ब्लैकलिस्ट प्रबंधन और क्षेत्र नियंत्रण।',
    stats: {
      active: 'सक्रिय अलर्ट',
      blacklisted: 'ब्लैकलिस्टेड प्रोफाइल',
      zones: 'क्षेत्र अखंडता',
    },
    tabs: {
      surveillance: 'लाइव सर्विलांस', 
      alerts: 'लाइव अलर्ट',
      blacklist: 'ब्लैकलिस्ट प्रबंधन',
      zones: 'क्षेत्र की स्थिति',
    },
    actions: {
      lockdown: 'लॉकडाउन शुरू करें',
      addBlacklist: 'ब्लैकलिस्ट में जोड़ें',
      dispatch: 'गार्ड भेजें',
      resolve: 'हल किया गया चिह्नित करें',
      viewFeed: 'CCTV देखें',
      liftLockdown: 'लॉकडाउन हटाएं',
      confirm: 'पुष्टि करें',
      cancel: 'रद्द करें'
    },
    columns: {
      severity: 'गंभीरता',
      time: 'समय',
      type: 'घटना का प्रकार',
      subject: 'विषय',
      location: 'स्थान',
      status: 'स्थिति',
      actions: 'क्रियाएँ',
      reason: 'प्रतिबंध का कारण',
      added: 'को जोड़ा गया',
    },
    alerts: {
      overstay: 'ओवरस्टे उल्लंघन',
      blacklist_attempt: 'ब्लैकलिस्ट प्रवेश प्रयास',
      unauthorized_zone: 'अनधिकृत क्षेत्र पहुंच',
      tailgating: 'टेलगेटिंग का पता चला',
    },
    dialog: {
        title: 'आपातकालीन कार्रवाई की पुष्टि करें',
        lockdownBody: 'क्या आप वाकई लॉकडाउन शुरू करना चाहते हैं? यह सभी निकासों को सील कर देगा और अलार्म सक्रिय कर देगा।',
        liftBody: 'क्या आप वाकई लॉकडाउन हटाना चाहते हैं? यह सभी टर्नस्टाइल और लिफ्ट को अनलॉक कर देगा।'
    },
    toast: {
        initiated: 'सिस्टम अलर्ट: सुविधा लॉकडाउन शुरू किया गया!',
        lifted: 'सिस्टम अपडेट: लॉकडाउन हटा दिया गया। संचालन सामान्य।'
    }
  },
  mr: {
    title: 'सुरक्षा ऑपरेशन्स केंद्र',
    subtitle: 'रिअल-टाइम धोका देखरेख, ब्लॅकलिस्ट व्यवस्थापन आणि झोन नियंत्रण.',
    stats: {
      active: 'सक्रिय अलर्ट',
      blacklisted: 'ब्लॅकलिस्टेड प्रोफाइल',
      zones: 'झोन अखंडता',
    },
    tabs: {
      surveillance: 'थेट पाळत ठेवणे', 
      alerts: 'लाइव्ह अलर्ट',
      blacklist: 'ब्लॅकलिस्ट व्यवस्थापन',
      zones: 'झोन स्थिती',
    },
    actions: {
      lockdown: 'लॉकडाऊन सुरू करा',
      addBlacklist: 'ब्लॅकलिस्टमध्ये जोडा',
      dispatch: 'गार्ड पाठवा',
      resolve: 'सोडवलेले चिन्हांकित करा',
      viewFeed: 'CCTV पहा',
      liftLockdown: 'लॉकडाऊन उठवा',
      confirm: 'पुष्टी करा',
      cancel: 'रद्द करा'
    },
    columns: {
      severity: 'तीव्रता',
      time: 'वेळ',
      type: 'घटनेचा प्रकार',
      subject: 'विषय',
      location: 'स्थान',
      status: 'स्थिती',
      actions: 'क्रिया',
      reason: 'बंदीचे कारण',
      added: 'या दिवशी जोडले',
    },
    alerts: {
      overstay: 'ओव्हरस्टे उल्लंघन',
      blacklist_attempt: 'ब्लॅकलिस्ट प्रवेश प्रयत्न',
      unauthorized_zone: 'अनधिकृत झोन प्रवेश',
      tailgating: 'टेलगेटिंग आढळले',
    },
    dialog: {
        title: 'आणीबाणीच्या कारवाईची पुष्टी करा',
        lockdownBody: 'तुम्ही नक्की लॉकडाऊन सुरू करू इच्छिता? यामुळे सर्व बाहेर पडण्याचे मार्ग सील केले जातील आणि अलार्म ट्रिगर होतील.',
        liftBody: 'तुम्ही नक्की लॉकडाऊन उठवू इच्छिता? यामुळे सर्व टर्नस्टाइल आणि लिफ्ट अनलॉक होतील.'
    },
    toast: {
        initiated: 'सिस्टम अलर्ट: सुविधा लॉकडाऊन सुरू केले!',
        lifted: 'सिस्टम अपडेट: लॉकडाऊन उठवले. ऑपरेशन्स सामान्य.'
    }
  },
};

// --- Mock Data ---
const mockAlerts: SecurityAlert[] = [
  { id: 'AL-901', timestamp: '10:42 AM', type: 'blacklist_attempt', severity: 'critical', location: 'Gate 1 (Main Entry)', subjectName: 'Rakesh Gulati', subjectId: 'BL-092', status: 'active' },
  { id: 'AL-902', timestamp: '11:15 AM', type: 'overstay', severity: 'high', location: 'Meeting Room 404', subjectName: 'Unknown Visitor', subjectId: 'PASS-882', status: 'active' },
  { id: 'AL-903', timestamp: '09:30 AM', type: 'unauthorized_zone', severity: 'medium', location: 'Server Room Corridor', subjectName: 'Staff: Amit S.', subjectId: 'EMP-442', status: 'investigating' },
  { id: 'AL-904', timestamp: 'Yesterday', type: 'tailgating', severity: 'low', location: 'Turnstile B', subjectName: 'N/A', subjectId: '-', status: 'resolved' },
];

const mockBlacklist: BlacklistEntry[] = [
  { id: 'BL-001', name: 'Rakesh Gulati', govtId: 'AADHAAR-XXXX-9921', reason: 'Previous Altercation with Staff', addedBy: 'Chief Security Officer', dateAdded: '2023-11-12', status: 'active' },
  { id: 'BL-002', name: 'Suresh Menon', govtId: 'PAN-XXXXX992A', reason: 'Trespassing attempt', addedBy: 'Admin', dateAdded: '2024-01-15', status: 'active' },
  { id: 'BL-003', name: 'Jenny Doe', govtId: 'PASS-INT-001', reason: 'Forged Documents', addedBy: 'System AI', dateAdded: '2024-02-20', status: 'appealed' },
];

const SecurityContent: React.FC<SecurityContentProps> = ({ lang }) => {
  const t = content[lang];
  const [selectedTab, setSelectedTab] = useState<string>('surveillance');
  const [isLockdown, setIsLockdown] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'danger' | 'success'}>({show: false, message: '', type: 'success'});

  // --- Handlers ---
  const triggerToast = (message: string, type: 'danger' | 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleConfirmAction = () => {
      const newLockdownState = !isLockdown;
      setIsLockdown(newLockdownState);
      setIsDialogOpen(false); // Close modal on confirm

      // Show action popup
      if (newLockdownState) {
          triggerToast(t.toast.initiated, 'danger');
      } else {
          triggerToast(t.toast.lifted, 'success');
      }
  };

  // --- Helpers ---
  const getSeverityColor = (severity: AlertSeverity): "danger" | "severe" | "warning" | "informative" => {
    switch (severity) {
      case 'critical': return 'danger'; 
      case 'high': return 'severe'; 
      case 'medium': return 'warning'; 
      case 'low': return 'informative'; 
      default: return 'informative';
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'blacklist_attempt': return 'person_off';
      case 'overstay': return 'timer_off';
      case 'unauthorized_zone': return 'no_meeting_room';
      case 'tailgating': return 'groups_2';
      default: return 'warning';
    }
  };

  // --- Renderers ---
  const renderAlerts = () => (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <Table aria-label="Security Alerts">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>{t.columns.severity}</TableHeaderCell>
            <TableHeaderCell>{t.columns.type}</TableHeaderCell>
            <TableHeaderCell>{t.columns.location}</TableHeaderCell>
            <TableHeaderCell>{t.columns.subject}</TableHeaderCell>
            <TableHeaderCell>{t.columns.time}</TableHeaderCell>
            <TableHeaderCell>{t.columns.status}</TableHeaderCell>
            <TableHeaderCell className="text-right">{t.columns.actions}</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAlerts.map((alert) => (
            <TableRow key={alert.id} className={alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
              <TableCell>
                 <Badge appearance="filled" color={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                 </Badge>
              </TableCell>
              <TableCell>
                <TableCellLayout media={<span className="material-symbols-outlined text-neutral-500">{getAlertIcon(alert.type)}</span>}>
                    {t.alerts[alert.type]}
                </TableCellLayout>
              </TableCell>
              <TableCell>{alert.location}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                    <span className="font-semibold">{alert.subjectName}</span>
                    <span className="text-xs text-neutral-500">{alert.subjectId}</span>
                </div>
              </TableCell>
              <TableCell>{alert.timestamp}</TableCell>
              <TableCell>
                 <span className={`uppercase text-xs font-bold ${alert.status === 'active' ? 'text-red-600 animate-pulse' : 'text-neutral-500'}`}>
                    {alert.status}
                 </span>
              </TableCell>
              <TableCell>
                 <div className="flex justify-end gap-2">
                    <Button size="small" icon={<span className="material-symbols-outlined">videocam</span>}>{t.actions.viewFeed}</Button>
                    <Menu>
                        <MenuTrigger disableButtonEnhancement>
                             <Button appearance="primary" size="small">{t.actions.dispatch}</Button>
                        </MenuTrigger>
                        <MenuList>
                            <MenuItem>Nearest Guard (Gate 1)</MenuItem>
                            <MenuItem>QRT Team A</MenuItem>
                            <MenuItem>Local Police</MenuItem>
                        </MenuList>
                    </Menu>
                 </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderBlacklist = () => (
    <div className="space-y-4">
        <div className="flex justify-between">
             <Input placeholder="Search blocked persons..." contentAfter={<span className="material-symbols-outlined">search</span>} />
             <Button appearance="primary" icon={<span className="material-symbols-outlined">person_add_disabled</span>}>{t.actions.addBlacklist}</Button>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHeaderCell>{t.columns.subject}</TableHeaderCell>
                <TableHeaderCell>{t.columns.reason}</TableHeaderCell>
                <TableHeaderCell>{t.columns.added}</TableHeaderCell>
                <TableHeaderCell>{t.columns.status}</TableHeaderCell>
                <TableHeaderCell className="text-right">{t.columns.actions}</TableHeaderCell>
            </TableRow>
            </TableHeader>
            <TableBody>
            {mockBlacklist.map((item) => (
                <TableRow key={item.id}>
                <TableCell>
                    <TableCellLayout media={<Avatar name={item.name} color="colorful" />}>
                        <div className="flex flex-col">
                            <span className="font-semibold">{item.name}</span>
                            <span className="text-xs text-neutral-500">{item.govtId}</span>
                        </div>
                    </TableCellLayout>
                </TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>
                     <div className="flex flex-col">
                        <span>{item.dateAdded}</span>
                        <span className="text-xs text-neutral-500">By {item.addedBy}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge appearance="tint" color={item.status === 'active' ? 'danger' : 'warning'}>{item.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button appearance="subtle" icon={<span className="material-symbols-outlined">edit</span>} />
                    <Button appearance="subtle" icon={<span className="material-symbols-outlined">delete</span>} />
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>
    </div>
  );

  const renderZones = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Perimeter', 'Lobby', 'Server Room', 'Minister Cabin', 'Parking B2', 'Cafeteria'].map((zone, idx) => (
              <Card key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <CardHeader 
                    header={<Text weight="semibold">{zone}</Text>}
                    description={<Text size={200}>Camera Feed: Active • Sensors: Online</Text>}
                    action={
                        <Badge appearance="filled" color={idx === 2 ? 'danger' : 'success'} shape="rounded">
                            {idx === 2 ? 'BREACH' : 'SECURE'}
                        </Badge>
                    }
                  />
                  <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center text-neutral-400">
                      <span className="material-symbols-outlined text-4xl">videocam_off</span>
                      <span className="ml-2 text-sm">Feed Placeholder</span>
                  </div>
              </Card>
          ))}
      </div>
  );

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 relative">
      
      {/* Action Toast Popup */}
      {toast.show && (
          <div className={`fixed top-20 right-8 z-[100] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn border-l-4 ${toast.type === 'danger' ? 'bg-red-50 border-red-600 text-red-900' : 'bg-green-50 border-green-600 text-green-900'}`}>
              <span className="material-symbols-outlined text-3xl">
                  {toast.type === 'danger' ? 'emergency' : 'check_circle'}
              </span>
              <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </div>
      )}

      {/* Top Action Bar */}
      <div className="p-6 pb-0 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">shield</span>
                {t.title}
            </h1>
            <p className="text-neutral-500 mt-1">{t.subtitle}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(e, data) => setIsDialogOpen(data.open)}>
            <Button 
                appearance="primary" 
                size="large"
                icon={<span className="material-symbols-outlined">{isLockdown ? 'lock_open' : 'lock'}</span>}
                style={{ backgroundColor: isLockdown ? '#107C10' : '#B00020', color: 'white' }}
                onClick={() => setIsDialogOpen(true)}
            >
                {isLockdown ? t.actions.liftLockdown : t.actions.lockdown}
            </Button>
            
            <DialogSurface>
                <DialogBody>
                    <DialogTitle 
                        action={
                            <Button 
                                appearance="subtle" 
                                aria-label="close" 
                                icon={<span className="material-symbols-outlined">close</span>} 
                                onClick={() => setIsDialogOpen(false)} 
                            />
                        }
                    >
                        {t.dialog.title}
                    </DialogTitle>
                    <DialogContent>
                        {isLockdown ? t.dialog.liftBody : t.dialog.lockdownBody}
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>
                            {t.actions.cancel}
                        </Button>
                        <Button 
                            appearance="primary" 
                            style={{ backgroundColor: isLockdown ? '#107C10' : '#B00020', color: 'white' }}
                            onClick={handleConfirmAction}
                        >
                            {t.actions.confirm}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
          </Dialog>
         
        </div>

        {/* KPI / Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-l-4 shadow-sm flex justify-between items-center transition-colors ${isLockdown ? 'bg-red-600 border-red-800 text-white' : 'bg-white dark:bg-neutral-900 border-red-500'}`}>
                <div>
                    <p className={`text-sm font-semibold uppercase ${isLockdown ? 'text-red-100' : 'text-neutral-500'}`}>{t.stats.active}</p>
                    <p className={`text-2xl font-bold ${isLockdown ? 'text-white' : 'text-red-600'}`}>{isLockdown ? 'SYSTEM SECURED' : '3'}</p>
                </div>
                <span className={`material-symbols-outlined text-4xl ${isLockdown ? 'text-red-200 animate-pulse' : 'text-red-100'}`}>{isLockdown ? 'lock' : 'notification_important'}</span>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border-l-4 border-neutral-500 shadow-sm flex justify-between items-center">
                <div>
                    <p className="text-neutral-500 text-sm font-semibold uppercase">{t.stats.blacklisted}</p>
                    <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">142</p>
                </div>
                <span className="material-symbols-outlined text-neutral-200 text-4xl">block</span>
            </div>
             <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border-l-4 border-green-500 shadow-sm flex justify-between items-center">
                <div>
                    <p className="text-neutral-500 text-sm font-semibold uppercase">{t.stats.zones}</p>
                    <p className="text-2xl font-bold text-green-600">98%</p>
                </div>
                <span className="material-symbols-outlined text-green-100 text-4xl">security</span>
            </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-2">
            <TabList 
                selectedValue={selectedTab} 
                onTabSelect={(_, data) => setSelectedTab(String(data.value))}
            >
                <Tab value="surveillance" icon={<span className="material-symbols-outlined text-blue-500">videocam</span>}>
                    {t.tabs.surveillance}
                </Tab>
                <Tab value="alerts" icon={<span className="material-symbols-outlined text-red-500">warning</span>}>
                    {t.tabs.alerts}
                </Tab>
                <Tab value="blacklist" icon={<span className="material-symbols-outlined">person_off</span>}>
                    {t.tabs.blacklist}
                </Tab>
                <Tab value="zones" icon={<span className="material-symbols-outlined">grid_view</span>}>
                    {t.tabs.zones}
                </Tab>
            </TabList>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-6 overflow-hidden">
         {selectedTab === 'surveillance' && (
             <div className="h-full w-full overflow-y-auto">
                 <SecurityDashboard />
             </div>
         )}
         {selectedTab === 'alerts' && renderAlerts()}
         {selectedTab === 'blacklist' && renderBlacklist()}
         {selectedTab === 'zones' && renderZones()}
      </div>
    </div>
  );
};

export default SecurityContent;