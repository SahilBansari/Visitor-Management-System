import React, { useState, useMemo } from 'react';
import type { Language } from '../../../App';
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
  Text,
  ProgressBar,
  Tooltip,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
} from '@fluentui/react-components';

interface DevicesContentProps {
  lang: Language;
}

// --- Types ---
type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'warning';
type DeviceType = 'camera' | 'kiosk' | 'biometric' | 'printer' | 'server';

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  ip: string;
  mac: string;
  firmware: string;
  status: DeviceStatus;
  uptime: string;
  lastMaintenance: string;
}

// --- Localization ---
const content = {
  en: {
    title: 'Device & Hardware Inventory',
    subtitle: 'Manage IoT devices, security cameras, and registration kiosks.',
    stats: {
      total: 'Total Assets',
      online: 'Online & Healthy',
      critical: 'Critical / Offline',
      maintenance: 'Maintenance Due',
    },
    tabs: {
      all: 'All Devices',
      camera: 'CCTV Cameras',
      kiosk: 'Self-Service Kiosks',
      biometric: 'Biometric Scanners',
    },
    actions: {
      add: 'Add Device',
      reboot: 'Reboot Device',
      update: 'Update Firmware',
      calibrate: 'Calibrate Sensor',
      logs: 'View System Logs',
      ping: 'Ping Test',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    columns: {
      device: 'Device Name / ID',
      type: 'Type',
      network: 'Network (IP / MAC)',
      location: 'Physical Location',
      status: 'Health Status',
      firmware: 'Firmware',
      actions: 'Actions',
    },
    status: {
      online: 'Online',
      offline: 'Offline',
      maintenance: 'Maintenance',
      warning: 'Warning',
    },
    dialog: {
      rebootTitle: 'Confirm Remote Reboot',
      rebootBody: 'Are you sure you want to reboot this device? It will be offline for approximately 2-5 minutes.',
    }
  },
  hi: {
    title: 'उपकरण और हार्डवेयर सूची',
    subtitle: 'IoT उपकरण, सुरक्षा कैमरे और पंजीकरण कियोस्क प्रबंधित करें।',
    stats: {
      total: 'कुल संपत्ति',
      online: 'ऑनलाइन और स्वस्थ',
      critical: 'गंभीर / ऑफ़लाइन',
      maintenance: 'रखरखाव देय',
    },
    tabs: {
      all: 'सभी उपकरण',
      camera: 'सीसीटीवी कैमरे',
      kiosk: 'स्वयं-सेवा कियोस्क',
      biometric: 'बायोमेट्रिक स्कैनर',
    },
    actions: {
      add: 'उपकरण जोड़ें',
      reboot: 'उपकरण रीबूट करें',
      update: 'फर्मवेयर अपडेट करें',
      calibrate: 'सेंसर कैलिब्रेट करें',
      logs: 'सिस्टम लॉग देखें',
      ping: 'पिंग टेस्ट',
      confirm: 'पुष्टि करें',
      cancel: 'रद्द करें',
    },
    columns: {
      device: 'उपकरण का नाम / आईडी',
      type: 'प्रकार',
      network: 'नेटवर्क (IP / MAC)',
      location: 'भौतिक स्थान',
      status: 'स्वास्थ्य स्थिति',
      firmware: 'फर्मवेयर',
      actions: 'क्रियाएँ',
    },
    status: {
      online: 'ऑनलाइन',
      offline: 'ऑफ़लाइन',
      maintenance: 'रखरखाव',
      warning: 'चेतावनी',
    },
    dialog: {
      rebootTitle: 'रिमोट रीबूट की पुष्टि करें',
      rebootBody: 'क्या आप वाकई इस उपकरण को रीबूट करना चाहते हैं? यह लगभग 2-5 मिनट के लिए ऑफ़लाइन रहेगा।',
    }
  },
  mr: {
    title: 'डिव्हाइस आणि हार्डवेअर इन्व्हेंटरी',
    subtitle: 'IoT डिव्हाइसेस, सुरक्षा कॅमेरे आणि नोंदणी किओस्क व्यवस्थापित करा.',
    stats: {
      total: 'एकूण मालमत्ता',
      online: 'ऑनलाइन आणि निरोगी',
      critical: 'गंभीर / ऑफलाइन',
      maintenance: 'देखभाल देय',
    },
    tabs: {
      all: 'सर्व डिव्हाइसेस',
      camera: 'CCTV कॅमेरे',
      kiosk: 'सेल्फ-सर्व्हिस किओस्क',
      biometric: 'बायोमेट्रिक स्कॅनर',
    },
    actions: {
      add: 'डिव्हाइस जोडा',
      reboot: 'डिव्हाइस रीबूट करा',
      update: 'फर्मवेअर अपडेट करा',
      calibrate: 'सेन्सर कॅलिब्रेट करा',
      logs: 'सिस्टम लॉग पहा',
      ping: 'पिंग टेस्ट',
      confirm: 'पुष्टी करा',
      cancel: 'रद्द करा',
    },
    columns: {
      device: 'डिव्हाइस नाव / आयडी',
      type: 'प्रकार',
      network: 'नेटवर्क (IP / MAC)',
      location: 'भौतिक स्थान',
      status: 'आरोग्य स्थिती',
      firmware: 'फर्मवेअर',
      actions: 'क्रिया',
    },
    status: {
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन',
      maintenance: 'देखभाल',
      warning: 'चेतावणी',
    },
    dialog: {
      rebootTitle: 'रिमोट रीबूटची पुष्टी करा',
      rebootBody: 'तुम्ही नक्की हे डिव्हाइस रीबूट करू इच्छिता? हे अंदाजे 2-5 मिनिटांसाठी ऑफलाइन असेल.',
    }
  },
};

// --- Mock Data ---
const mockDevices: Device[] = [
  { id: 'CAM-001', name: 'Main Gate PTZ', type: 'camera', location: 'Gate 1 Entry', ip: '192.168.1.101', mac: '00:1A:2B:3C:4D:5E', firmware: 'v4.2.1', status: 'online', uptime: '45d 12h', lastMaintenance: '2023-12-01' },
  { id: 'KSK-002', name: 'Lobby Kiosk A', type: 'kiosk', location: 'Reception Lobby', ip: '192.168.1.102', mac: '00:1A:2B:3C:4D:5F', firmware: 'v2.0.0', status: 'warning', uptime: '12h 30m', lastMaintenance: '2024-01-15' },
  { id: 'BIO-003', name: 'Turnstile Scanner', type: 'biometric', location: 'Gate 1 Turnstile', ip: '192.168.1.103', mac: '00:1A:2B:3C:4D:60', firmware: 'v1.5.4', status: 'online', uptime: '120d 4h', lastMaintenance: '2023-11-20' },
  { id: 'PRT-004', name: 'Pass Printer 1', type: 'printer', location: 'Reception Desk', ip: '192.168.1.104', mac: '00:1A:2B:3C:4D:61', firmware: 'v3.1.2', status: 'offline', uptime: '-', lastMaintenance: '2024-02-10' },
  { id: 'CAM-005', name: 'Corridor Dome', type: 'camera', location: '1st Floor North', ip: '192.168.1.105', mac: '00:1A:2B:3C:4D:62', firmware: 'v4.2.0', status: 'online', uptime: '10d 2h', lastMaintenance: '2024-01-05' },
  { id: 'SRV-006', name: 'Local Edge Server', type: 'server', location: 'Server Room', ip: '192.168.1.200', mac: '00:1A:2B:3C:4D:99', firmware: 'Ubuntu 22.04', status: 'maintenance', uptime: '1d 0h', lastMaintenance: 'Today' },
];

const DevicesContent: React.FC<DevicesContentProps> = ({ lang }) => {
  const t = content[lang];
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isRebootDialogOpen, setIsRebootDialogOpen] = useState(false);

  // --- Logic ---
  const handleTabSelect = (_: unknown, data: SelectTabData) => {
    setSelectedTab(String(data.value));
  };

  const filteredDevices = useMemo(() => {
    let filtered = mockDevices;
    if (selectedTab !== 'all') {
      filtered = filtered.filter(d => d.type === selectedTab || (selectedTab === 'camera' && d.type === 'camera'));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(term) || 
        d.id.toLowerCase().includes(term) ||
        d.ip.includes(term)
      );
    }
    return filtered;
  }, [selectedTab, searchTerm]);

  const getStatusConfig = (status: DeviceStatus) => {
    switch(status) {
      case 'online': return { color: 'success' as const, icon: 'check_circle' };
      case 'offline': return { color: 'danger' as const, icon: 'wifi_off' };
      case 'warning': return { color: 'warning' as const, icon: 'warning' };
      case 'maintenance': return { color: 'informative' as const, icon: 'build' }; 
    }
  };

  const getIconForType = (type: DeviceType) => {
    switch(type) {
      case 'camera': return 'videocam';
      case 'kiosk': return 'touch_app';
      case 'biometric': return 'fingerprint';
      case 'printer': return 'print';
      case 'server': return 'dns';
    }
  };

  const handleRebootClick = (device: Device) => {
    setSelectedDevice(device);
    setIsRebootDialogOpen(true);
  };

  const confirmReboot = () => {
    // Simulate API call
    setIsRebootDialogOpen(false);
    setSelectedDevice(null);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
      
      {/* Header & Stats */}
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100">{t.title}</h1>
            <p className="text-neutral-500 mt-1">{t.subtitle}</p>
          </div>
          <Button appearance="primary" icon={<span className="material-symbols-outlined">add</span>}>
            {t.actions.add}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
               <Text size={200} className="text-neutral-500 uppercase font-semibold">{t.stats.total}</Text>
               <Text size={600} weight="bold">{mockDevices.length}</Text>
           </Card>
           <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 border-l-4 border-l-green-500">
               <Text size={200} className="text-neutral-500 uppercase font-semibold">{t.stats.online}</Text>
               <Text size={600} weight="bold" className="text-success">{mockDevices.filter(d => d.status === 'online').length}</Text>
           </Card>
           <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 border-l-4 border-l-red-500">
               <Text size={200} className="text-neutral-500 uppercase font-semibold">{t.stats.critical}</Text>
               <Text size={600} weight="bold" className="text-danger">{mockDevices.filter(d => d.status === 'offline').length}</Text>
           </Card>
           <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 border-l-4 border-l-yellow-500">
               <Text size={200} className="text-neutral-500 uppercase font-semibold">{t.stats.maintenance}</Text>
               <Text size={600} weight="bold" className="text-warning">{mockDevices.filter(d => d.status === 'maintenance' || d.status === 'warning').length}</Text>
           </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-1 flex-grow md:flex-grow-0">
                <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect}>
                    <Tab value="all">{t.tabs.all}</Tab>
                    <Tab value="camera" icon={<span className="material-symbols-outlined">videocam</span>}>{t.tabs.camera}</Tab>
                    <Tab value="kiosk" icon={<span className="material-symbols-outlined">touch_app</span>}>{t.tabs.kiosk}</Tab>
                    <Tab value="biometric" icon={<span className="material-symbols-outlined">fingerprint</span>}>{t.tabs.biometric}</Tab>
                </TabList>
            </div>
            <Input 
                placeholder="Search IP, Name, ID..." 
                value={searchTerm}
                onChange={(e, data) => setSearchTerm(data.value)}
                contentAfter={<span className="material-symbols-outlined text-neutral-500">search</span>}
                className="w-full md:max-w-xs"
            />
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-grow p-6 pt-0 overflow-hidden">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 h-full overflow-y-auto">
            <Table aria-label="Device Inventory">
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell>{t.columns.device}</TableHeaderCell>
                        <TableHeaderCell>{t.columns.network}</TableHeaderCell>
                        <TableHeaderCell>{t.columns.location}</TableHeaderCell>
                        <TableHeaderCell>{t.columns.status}</TableHeaderCell>
                        <TableHeaderCell>{t.columns.firmware}</TableHeaderCell>
                        <TableHeaderCell className="text-right">{t.columns.actions}</TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredDevices.map(device => {
                        const statusConfig = getStatusConfig(device.status);
                        return (
                            <TableRow key={device.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                <TableCell>
                                    <TableCellLayout media={
                                        <Avatar icon={<span className="material-symbols-outlined">{getIconForType(device.type)}</span>} color="colorful" />
                                    }>
                                        <div className="flex flex-col">
                                            <Text weight="semibold">{device.name}</Text>
                                            <Text size={200} className="text-neutral-500 font-mono">{device.id}</Text>
                                        </div>
                                    </TableCellLayout>
                                </TableCell>
                                <TableCell>
                                     <div className="flex flex-col font-mono text-xs">
                                        <span className="text-neutral-800 dark:text-neutral-200">{device.ip}</span>
                                        <span className="text-neutral-500">{device.mac}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-neutral-400 text-sm">place</span>
                                        {device.location}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        appearance="tint" 
                                        color={statusConfig.color} 
                                        icon={<span className="material-symbols-outlined text-[14px]">{statusConfig.icon}</span>}
                                    >
                                        {t.status[device.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Tooltip content={`Uptime: ${device.uptime}`} relationship="label">
                                        <span className="cursor-help border-b border-dotted border-neutral-400">{device.firmware}</span>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        <Button size="small" appearance="subtle" icon={<span className="material-symbols-outlined">terminal</span>} onClick={() => {}} aria-label={t.actions.logs} />
                                        <Menu>
                                            <MenuTrigger disableButtonEnhancement>
                                                <Button appearance="subtle" icon={<span className="material-symbols-outlined">more_vert</span>} />
                                            </MenuTrigger>
                                            <MenuList>
                                                <MenuItem icon={<span className="material-symbols-outlined">restart_alt</span>} onClick={() => handleRebootClick(device)}>{t.actions.reboot}</MenuItem>
                                                <MenuItem icon={<span className="material-symbols-outlined">system_update</span>}>{t.actions.update}</MenuItem>
                                                <MenuItem icon={<span className="material-symbols-outlined">network_check</span>}>{t.actions.ping}</MenuItem>
                                                {device.type === 'biometric' && <MenuItem icon={<span className="material-symbols-outlined">tune</span>}>{t.actions.calibrate}</MenuItem>}
                                            </MenuList>
                                        </Menu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
      </div>

      {/* Reboot Dialog */}
      <Dialog open={isRebootDialogOpen} onOpenChange={(event, data) => setIsRebootDialogOpen(data.open)}>
        <DialogSurface>
            <DialogBody>
                <DialogTitle>{t.dialog.rebootTitle}</DialogTitle>
                <DialogContent>
                    <p>{t.dialog.rebootBody}</p>
                    {selectedDevice && (
                        <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
                            <p className="font-semibold">{selectedDevice.name}</p>
                            <p className="text-xs font-mono text-neutral-500">IP: {selectedDevice.ip}</p>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <DialogTrigger disableButtonEnhancement>
                        <Button appearance="secondary">{t.actions.cancel}</Button>
                    </DialogTrigger>
                    <Button appearance="primary" onClick={confirmReboot}>{t.actions.confirm}</Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default DevicesContent;