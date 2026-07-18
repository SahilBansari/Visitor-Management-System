import React, { useState, useMemo, useEffect } from 'react';
import type { Language } from '../../../App';
import {
  Input,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Avatar,
  Text,
  Checkbox,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dropdown,
  Option,
  makeStyles,
} from '@fluentui/react-components';

interface AuditContentProps {
  lang: Language;
}

// --- Types ---
interface AuditLog {
  id: string;
  time: string;
  date: string; // Added for filtering
  user: string;
  role: string;
  action: string;
  description: string;
  status: 'success' | 'failure';
  ipAddress?: string;
  details?: string;
  affectedRecord?: string;
}

// --- Localization ---
const content = {
  en: {
    title: 'Activity Log',
    subtitle: 'Track and export system activities.',
    searchPlaceholder: 'Search by user or action...',
    export: 'Export CSV',
    exportPDF: 'Export PDF',
    delete: 'Delete Selected',
    columns: {
      user: 'User',
      action: 'Activity',
      time: 'Time',
      status: 'Status',
    },
    filters: {
      dateRange: 'Date Range',
      user: 'User',
      status: 'Status',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      all: 'All Time',
      allUsers: 'All Users',
      allStatus: 'All Status',
      success: 'Success',
      failed: 'Failed',
    },
    sorting: {
      newest: 'Newest First',
      oldest: 'Oldest First',
    },
    emptyState: 'No matching records found.',
    modal: {
      title: 'Activity Details',
      ipAddress: 'IP Address',
      affected: 'Affected Record',
      details: 'Additional Details',
      close: 'Close',
    },
    analytics: {
      totalActivities: 'Total Activities',
      failedActivities: 'Failed Activities',
      successRate: 'Success Rate',
      activeUsers: 'Active Users',
    },
    confirmation: {
      delete: 'Delete Log Entries',
      deleteMsg: 'Are you sure you want to delete the selected log entries? This action cannot be undone.',
      confirm: 'Delete',
      cancel: 'Cancel',
    }
  },
  hi: {
    title: 'गतिविधि लॉग',
    subtitle: 'सिस्टम गतिविधियों को ट्रैक और निर्यात करें।',
    searchPlaceholder: 'उपयोगकर्ता या गतिविधि द्वारा खोजें...',
    export: 'CSV निर्यात करें',
    exportPDF: 'PDF निर्यात करें',
    delete: 'चयनित हटाएं',
    columns: {
      user: 'उपयोगकर्ता',
      action: 'गतिविधि',
      time: 'समय',
      status: 'स्थिति',
    },
    filters: {
      dateRange: 'तारीख रेंज',
      user: 'उपयोगकर्ता',
      status: 'स्थिति',
      today: 'आज',
      thisWeek: 'इस हफ्ते',
      thisMonth: 'इस महीने',
      all: 'सभी समय',
      allUsers: 'सभी उपयोगकर्ता',
      allStatus: 'सभी स्थिति',
      success: 'सफल',
      failed: 'विफल',
    },
    sorting: {
      newest: 'नवीनतम पहले',
      oldest: 'सबसे पुराना पहले',
    },
    emptyState: 'कोई मेल खाते रिकॉर्ड नहीं मिले।',
    modal: {
      title: 'गतिविधि विवरण',
      ipAddress: 'आईपी पता',
      affected: 'प्रभावित रिकॉर्ड',
      details: 'अतिरिक्त विवरण',
      close: 'बंद करें',
    },
    analytics: {
      totalActivities: 'कुल गतिविधियां',
      failedActivities: 'विफल गतिविधियां',
      successRate: 'सफलता दर',
      activeUsers: 'सक्रिय उपयोगकर्ता',
    },
    confirmation: {
      delete: 'लॉग प्रविष्टि हटाएं',
      deleteMsg: 'क्या आप वाकई चयनित लॉग प्रविष्टियों को हटाना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।',
      confirm: 'हटाएं',
      cancel: 'रद्द करें',
    }
  },
  mr: {
    title: 'अॅक्टिव्हिटी लॉग',
    subtitle: 'सिस्टम क्रियाकलापांचा मागोवा घ्या आणि निर्यात करा.',
    searchPlaceholder: 'वापरकर्ता किंवा क्रियाकलाप शोधा...',
    export: 'CSV निर्यात करा',
    exportPDF: 'PDF निर्यात करा',
    delete: 'निवडलेले हटवा',
    columns: {
      user: 'वापरकर्ता',
      action: 'क्रियाकलाप',
      time: 'वेळ',
      status: 'स्थिती',
    },
    filters: {
      dateRange: 'दिनांक श्रेणी',
      user: 'वापरकर्ता',
      status: 'स्थिती',
      today: 'आज',
      thisWeek: 'हे आठवडे',
      thisMonth: 'हे महिने',
      all: 'सर्व वेळ',
      allUsers: 'सर्व वापरकर्ते',
      allStatus: 'सर्व स्थिती',
      success: 'यशस्वी',
      failed: 'अयशस्वी',
    },
    sorting: {
      newest: 'सर्वात नवीन पहिले',
      oldest: 'सर्वात जुने पहिले',
    },
    emptyState: 'कोणत्याही जुळणाऱ्या नोंदी सापडल्या नाहीत.',
    modal: {
      title: 'क्रियाकलाप तपशील',
      ipAddress: 'आयपी पत्ता',
      affected: 'प्रभावित नोंद',
      details: 'अतिरिक्त तपशील',
      close: 'बंद करा',
    },
    analytics: {
      totalActivities: 'एकूण क्रियाकलाप',
      failedActivities: 'अयशस्वी क्रियाकलाप',
      successRate: 'यशाचा दर',
      activeUsers: 'सक्रिय वापरकर्ते',
    },
    confirmation: {
      delete: 'लॉग प्रविष्टी हटवा',
      deleteMsg: 'आपण निश्चितपणे निवडलेल्या लॉग प्रविष्ट्या हटवू इच्छिता? ही कार्यवाही रद्द केली जाऊ शकत नाही।',
      confirm: 'हटवा',
      cancel: 'रद्द करा',
    }
  }
};

// --- Mock Data with Enhanced Fields ---
const allLogs: AuditLog[] = [
  { id: '1', time: 'Today, 2:32 PM', date: '2025-01-28', user: 'Rajesh K.', role: 'Admin', action: 'Blacklisted Visitor', description: 'Visitor BL-002 marked for trespassing', status: 'success', ipAddress: '192.168.1.100', affectedRecord: 'BL-002', details: 'Security protocol activated' },
  { id: '2', time: 'Today, 2:30 PM', date: '2025-01-28', user: 'System AI', role: 'Bot', action: 'Overstay Alert', description: 'Detected visitor overstaying in Zone B', status: 'success', ipAddress: 'System', affectedRecord: 'Zone-B', details: 'Automatic monitoring triggered' },
  { id: '3', time: 'Today, 2:15 PM', date: '2025-01-28', user: 'Anil Gupta', role: 'Guard', action: 'Check-In', description: 'Scanned Pass #885 at Gate 1', status: 'success', ipAddress: '192.168.1.45', affectedRecord: '#885', details: 'Gate 1 scanner verified' },
  { id: '4', time: 'Today, 1:45 PM', date: '2025-01-28', user: 'Unknown', role: 'External', action: 'Login Failed', description: '3 invalid password attempts', status: 'failure', ipAddress: '203.45.12.78', affectedRecord: 'Unknown', details: 'IP blocked for 15 minutes' },
  { id: '5', time: 'Today, 12:00 PM', date: '2025-01-28', user: 'System', role: 'Automated', action: 'Backup Created', description: 'Daily database backup completed', status: 'success', ipAddress: 'System', affectedRecord: 'DB-Main', details: 'Backup size: 450MB' },
  { id: '6', time: 'Yesterday, 5:30 PM', date: '2025-01-27', user: 'Priya Singh', role: 'Officer', action: 'Approved Request', description: 'Visitor request VR-1089 approved', status: 'success', ipAddress: '192.168.1.67', affectedRecord: 'VR-1089', details: 'Valid for 5 days' },
  { id: '7', time: 'Yesterday, 3:20 PM', date: '2025-01-27', user: 'Admin', role: 'Admin', action: 'Officer Added', description: 'New officer profile created', status: 'success', ipAddress: '192.168.1.100', affectedRecord: 'OFF-234', details: 'General department' },
  { id: '8', time: '2 days ago, 10:15 AM', date: '2025-01-26', user: 'System', role: 'Automated', action: 'Report Generated', description: 'Weekly activity report generated', status: 'success', ipAddress: 'System', affectedRecord: 'RPT-W02', details: '142 records processed' },
];

const useStyles = makeStyles({
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: 'var(--colorNeutralBackground1)',
    border: '1px solid var(--colorNeutralStroke2)',
  },
});

const AuditContent: React.FC<AuditContentProps> = ({ lang }) => {
  const t = content[lang];
  const styles = useStyles();
  
  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<'today' | 'thisWeek' | 'thisMonth' | 'all'>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedDetail, setSelectedDetail] = useState<AuditLog | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>(allLogs);

  // --- Helper: Get Date Range ---
  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();
    
    if (dateFilter === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === 'thisWeek') {
      startDate.setDate(today.getDate() - today.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === 'thisMonth') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      return null;
    }
    
    return startDate;
  };

  // --- Filter & Sort Logic ---
  const filteredLogs = useMemo(() => {
    let result = logs.filter(log => {
      // Search filter
      const searchMatch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // User filter
      if (userFilter !== 'all' && log.user !== userFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const startDate = getDateRange();
        const logDate = new Date(log.date);
        if (!startDate || logDate < startDate) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.date + ' ' + a.time).getTime();
      const timeB = new Date(b.date + ' ' + b.time).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [logs, searchTerm, dateFilter, userFilter, statusFilter, sortBy]);

  // --- Get unique users for dropdown ---
  const uniqueUsers = useMemo(() => 
    Array.from(new Set(logs.map(log => log.user))).sort(),
    [logs]
  );

  // --- Analytics ---
  const analytics = useMemo(() => ({
    total: logs.length,
    failed: logs.filter(l => l.status === 'failure').length,
    successRate: logs.length > 0 ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100) : 0,
    activeUsers: new Set(logs.map(l => l.user)).size,
  }), [logs]);

  // --- Export to CSV ---
  const handleExportCSV = () => {
    const logsToExport = selectedIds.size > 0 
      ? logs.filter(log => selectedIds.has(log.id))
      : filteredLogs;

    const headers = ['ID', 'Time', 'User', 'Role', 'Action', 'Description', 'Status', 'IP Address'];
    const csvContent = [
      headers.join(','),
      ...logsToExport.map(log => {
        const safeDesc = `"${log.description.replace(/"/g, '""')}"`;
        return [log.id, log.time, log.user, log.role, log.action, safeDesc, log.status, log.ipAddress || ''].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Export to PDF ---
  const handleExportPDF = () => {
    const logsToExport = selectedIds.size > 0 
      ? logs.filter(log => selectedIds.has(log.id))
      : filteredLogs;

    let pdfContent = 'ACTIVITY LOG REPORT\n';
    pdfContent += `Generated: ${new Date().toLocaleString()}\n`;
    pdfContent += `Total Records: ${logsToExport.length}\n`;
    pdfContent += '\n' + '='.repeat(80) + '\n\n';

    logsToExport.forEach(log => {
      pdfContent += `[${log.time}] ${log.action}\n`;
      pdfContent += `User: ${log.user} (${log.role})\n`;
      pdfContent += `Description: ${log.description}\n`;
      pdfContent += `Status: ${log.status}\n`;
      if (log.ipAddress) pdfContent += `IP Address: ${log.ipAddress}\n`;
      pdfContent += '\n' + '-'.repeat(80) + '\n\n';
    });

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Delete Selected ---
  const handleDeleteConfirm = () => {
    if (selectedIds.size > 0) {
      const newLogs = logs.filter(log => !selectedIds.has(log.id));
      setLogs(newLogs);
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
    }
  };

  // --- Checkbox Logic ---
  const handleSelectAll = (_: any, data: { checked: boolean | 'mixed' }) => {
    if (data.checked === true) {
      setSelectedIds(new Set(filteredLogs.map(log => log.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedIds(newSelection);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-950 p-6 md:p-8">
      
      {/* --- ANALYTICS DASHBOARD --- */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <Text size={300} className="text-neutral-500 mb-2">{t.analytics.totalActivities}</Text>
          <Text size={800} weight="bold" className="text-neutral-900 dark:text-neutral-100">{analytics.total}</Text>
        </div>
        <div className={styles.statCard}>
          <Text size={300} className="text-neutral-500 mb-2">{t.analytics.failedActivities}</Text>
          <Text size={800} weight="bold" className="text-red-600">{analytics.failed}</Text>
        </div>
        <div className={styles.statCard}>
          <Text size={300} className="text-neutral-500 mb-2">{t.analytics.successRate}</Text>
          <Text size={800} weight="bold" className="text-green-600">{analytics.successRate}%</Text>
        </div>
        <div className={styles.statCard}>
          <Text size={300} className="text-neutral-500 mb-2">{t.analytics.activeUsers}</Text>
          <Text size={800} weight="bold" className="text-blue-600">{analytics.activeUsers}</Text>
        </div>
      </div>

      {/* --- HEADER SECTION --- */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {t.title}
                </h1>
                <p className="text-neutral-500 mb-4 max-w-2xl">
                {t.subtitle}
                </p>
            </div>
            
            {/* --- ACTION BUTTONS --- */}
            <div className="flex gap-2">
              <Button 
                  appearance="secondary"
                  icon={<span className="material-symbols-outlined">file_download</span>}
                  onClick={handleExportCSV}
              >
                  {t.export}
              </Button>
              <Button 
                  appearance="secondary"
                  icon={<span className="material-symbols-outlined">description</span>}
                  onClick={handleExportPDF}
              >
                  {t.exportPDF}
              </Button>
              {selectedIds.size > 0 && (
                <Button 
                    appearance="primary"
                    className="!bg-red-600 hover:!bg-red-700"
                    icon={<span className="material-symbols-outlined">delete</span>}
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    {t.delete} ({selectedIds.size})
                </Button>
              )}
            </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="mb-4">
          <Input 
            className="w-full max-w-md"
            size="large"
            placeholder={t.searchPlaceholder}
            contentAfter={<span className="material-symbols-outlined text-neutral-400">search</span>}
            value={searchTerm}
            onChange={(e, data) => setSearchTerm(data.value)}
          />
        </div>

        {/* --- FILTERS ROW --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Date Filter */}
          <Dropdown
            value={dateFilter}
            onOptionSelect={(e, data) => setDateFilter(data.optionValue as any)}
            placeholder={t.filters.dateRange}
          >
            <Option value="today">{t.filters.today}</Option>
            <Option value="thisWeek">{t.filters.thisWeek}</Option>
            <Option value="thisMonth">{t.filters.thisMonth}</Option>
            <Option value="all">{t.filters.all}</Option>
          </Dropdown>

          {/* User Filter */}
          <Dropdown
            value={userFilter}
            onOptionSelect={(e, data) => setUserFilter(data.optionValue as string)}
            placeholder={t.filters.user}
          >
            <Option value="all">{t.filters.allUsers}</Option>
            {uniqueUsers.map(user => (
              <Option key={user} value={user}>{user}</Option>
            ))}
          </Dropdown>

          {/* Status Filter */}
          <Dropdown
            value={statusFilter}
            onOptionSelect={(e, data) => setStatusFilter(data.optionValue as any)}
            placeholder={t.filters.status}
          >
            <Option value="all">{t.filters.allStatus}</Option>
            <Option value="success">{t.filters.success}</Option>
            <Option value="failed">{t.filters.failed}</Option>
          </Dropdown>

          {/* Sort Filter */}
          <Dropdown
            value={sortBy}
            onOptionSelect={(e, data) => setSortBy(data.optionValue as any)}
            placeholder="Sort"
          >
            <Option value="newest">{t.sorting.newest}</Option>
            <Option value="oldest">{t.sorting.oldest}</Option>
          </Dropdown>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="flex-grow overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
        <Table aria-label="Audit Log">
          <TableHeader>
            <TableRow>
              <TableHeaderCell style={{ width: '40px' }}>
                <Checkbox 
                    checked={
                        filteredLogs.length > 0 && selectedIds.size === filteredLogs.length ? true :
                        selectedIds.size > 0 ? 'mixed' : false
                    }
                    onChange={handleSelectAll}
                />
              </TableHeaderCell>
              <TableHeaderCell>{t.columns.user}</TableHeaderCell>
              <TableHeaderCell>{t.columns.action}</TableHeaderCell>
              <TableHeaderCell>{t.columns.time}</TableHeaderCell>
              <TableHeaderCell>{t.columns.status}</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow 
                  key={log.id} 
                  className="hover:bg-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  onClick={() => setSelectedDetail(log)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                        checked={selectedIds.has(log.id)}
                        onChange={(_, data) => {
                          e.stopPropagation();
                          handleSelectRow(log.id, !!data.checked);
                        }}
                    />
                  </TableCell>

                  <TableCell>
                    <TableCellLayout media={<Avatar name={log.user} color="colorful" size={32} />}>
                       <div className="flex flex-col">
                           <Text weight="semibold">{log.user}</Text>
                           <Text size={200} className="text-neutral-500">{log.role}</Text>
                       </div>
                    </TableCellLayout>
                  </TableCell>

                  <TableCell>
                      <div className="flex flex-col py-2">
                          <Text weight="medium">{log.action}</Text>
                          <Text size={200} className="text-neutral-500">{log.description}</Text>
                      </div>
                  </TableCell>

                  <TableCell>
                    <Text className="text-neutral-500">{log.time}</Text>
                  </TableCell>

                  <TableCell>
                    {log.status === 'success' ? (
                       <Badge appearance="tint" color="success" icon={<span className="material-symbols-outlined text-[14px]">check_circle</span>}>
                           {t.filters.success}
                       </Badge>
                    ) : (
                       <Badge appearance="tint" color="danger" icon={<span className="material-symbols-outlined text-[14px]">error</span>}>
                           {t.filters.failed}
                       </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-neutral-400">
                    <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl">search_off</span>
                        <Text>{t.emptyState}</Text>
                    </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedDetail && (
        <Dialog open={!!selectedDetail} onOpenChange={(e, data) => !data.open && setSelectedDetail(null)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{t.modal.title}</DialogTitle>
              <DialogContent>
                <div className="flex flex-col gap-4">
                  <div>
                    <Text weight="semibold" className="block mb-2">Activity</Text>
                    <Text>{selectedDetail.action}</Text>
                  </div>
                  <div>
                    <Text weight="semibold" className="block mb-2">Description</Text>
                    <Text>{selectedDetail.description}</Text>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text weight="semibold" className="block mb-2">User</Text>
                      <Text>{selectedDetail.user}</Text>
                    </div>
                    <div>
                      <Text weight="semibold" className="block mb-2">Role</Text>
                      <Text>{selectedDetail.role}</Text>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text weight="semibold" className="block mb-2">Time</Text>
                      <Text>{selectedDetail.time}</Text>
                    </div>
                    <div>
                      <Text weight="semibold" className="block mb-2">Status</Text>
                      <Badge 
                        appearance="tint" 
                        color={selectedDetail.status === 'success' ? 'success' : 'danger'}
                        icon={<span className="material-symbols-outlined text-[14px]">{selectedDetail.status === 'success' ? 'check_circle' : 'error'}</span>}
                      >
                        {selectedDetail.status}
                      </Badge>
                    </div>
                  </div>
                  {selectedDetail.ipAddress && (
                    <div>
                      <Text weight="semibold" className="block mb-2">{t.modal.ipAddress}</Text>
                      <Text className="font-mono text-sm">{selectedDetail.ipAddress}</Text>
                    </div>
                  )}
                  {selectedDetail.affectedRecord && (
                    <div>
                      <Text weight="semibold" className="block mb-2">{t.modal.affected}</Text>
                      <Text>{selectedDetail.affectedRecord}</Text>
                    </div>
                  )}
                  {selectedDetail.details && (
                    <div>
                      <Text weight="semibold" className="block mb-2">{t.modal.details}</Text>
                      <Text>{selectedDetail.details}</Text>
                    </div>
                  )}
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setSelectedDetail(null)}>{t.modal.close}</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Dialog open={showDeleteConfirm} onOpenChange={(e, data) => !data.open && setShowDeleteConfirm(false)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t.confirmation.delete}</DialogTitle>
            <DialogContent>
              <Text>{t.confirmation.deleteMsg}</Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setShowDeleteConfirm(false)}>{t.confirmation.cancel}</Button>
              <Button appearance="primary" className="!bg-red-600 hover:!bg-red-700 text-white" onClick={handleDeleteConfirm}>{t.confirmation.confirm}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default AuditContent;