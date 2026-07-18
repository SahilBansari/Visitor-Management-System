import React, { useState, useMemo, useEffect } from 'react';
import type { Language } from '../../../App';
import type { Tenant } from '../../../utils/mockDatabase';
import {
  Button,
  Input,
  Avatar,
  Badge,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Label,
  makeStyles,
  Divider,
} from '@fluentui/react-components';

import { officersService } from '../../../services/api';

interface OfficersContentProps {
  lang: Language;
  tenant: Tenant; // Added Tenant Prop
}

// Officer types
type OfficerStatus = 'active' | 'meeting' | 'leave' | 'inactive';

interface Officer {
  id: string;
  name: string;
  rank: string;
  department: string;
  email: string;
  phone: string;
  cabin: string;
  status: OfficerStatus;
  lastActive: string;
  tenant: Tenant;
}

const content = {
  en: {
    title: 'Officer Directory',
    subtitle: 'Manage officer profiles, designations, and access privileges.',
    actions: {
      add: 'Add Officer',
      import: 'Import CSV',
      export: 'Export CSV',
    },
    searchPlaceholder: 'Search by name, ID, or rank...',
    columns: {
      profile: 'Officer Profile',
      dept: 'Department & Cabin',
      status: 'Current Status',
      contact: 'Contact Details',
      lastActive: 'Last Active',
      actions: 'Actions',
    },
    status: {
      active: 'Available',
      meeting: 'In Meeting',
      leave: 'On Leave',
      inactive: 'Inactive',
    },
    menu: {
      edit: 'Edit Profile',
      deactivate: 'Deactivate Account',
      activate: 'Activate Account',
    },
    modals: {
        addTitle: 'Add New Officer',
        editTitle: 'Edit Officer Profile',
        importTitle: 'Import Officers from CSV',
        deactivateTitle: 'Confirm Deactivation',
        deactivateMsg: 'Are you sure you want to deactivate this officer? They will no longer appear in visitor searches.',
        cancel: 'Cancel',
        save: 'Save Officer',
        update: 'Update Profile',
        upload: 'Upload & Import',
        deactivateConfirm: 'Deactivate',
        activateConfirm: 'Activate',
        dropZone: 'Click to select .csv file',
        successAdd: 'Officer added successfully!',
        successImport: 'Officers imported successfully!',
    },
    form: {
        name: 'Full Name',
        rank: 'Rank / Designation',
        dept: 'Department',
        email: 'Email ID',
        phone: 'Phone Number',
        cabin: 'Cabin Number',
    },
    noResults: {
        title: "No officers found",
        desc: "Try adjusting your search terms or filters."
    }
  },
  hi: {
    title: 'अधिकारी निर्देशिका',
    subtitle: 'अधिकारी प्रोफाइल, पदनाम और पहुंच विशेषाधिकार प्रबंधित करें।',
    actions: {
      add: 'अधिकारी जोड़ें',
      import: 'CSV आयात करें',
      export: 'CSV निर्यात करें',
    },
    searchPlaceholder: 'नाम, आईडी या पद द्वारा खोजें...',
    columns: {
      profile: 'अधिकारी प्रोफाइल',
      dept: 'विभाग और केबिन',
      status: 'वर्तमान स्थिति',
      contact: 'संपर्क विवरण',
      lastActive: 'अंतिम सक्रिय',
      actions: 'क्रियाएँ',
    },
    status: {
      active: 'उपलब्ध',
      meeting: 'बैठक में',
      leave: 'छुट्टी पर',
      inactive: 'निष्क्रिय',
    },
    menu: {
      edit: 'प्रोफाइल संपादित करें',
      deactivate: 'खाता निष्क्रिय करें',
      activate: 'खाता सक्रिय करें',
    },
    modals: {
        addTitle: 'नया अधिकारी जोड़ें',
        editTitle: 'अधिकारी प्रोफाइल संपादित करें',
        importTitle: 'CSV से अधिकारी आयात करें',
        deactivateTitle: 'निष्क्रियकरण की पुष्टि करें',
        deactivateMsg: 'क्या आप वाकई इस अधिकारी को निष्क्रिय करना चाहते हैं?',
        cancel: 'रद्द करें',
        save: 'सहेजें',
        update: 'अपडेट करें',
        upload: 'अपलोड और आयात',
        deactivateConfirm: 'निष्क्रिय करें',
        activateConfirm: 'सक्रिय करें',
        dropZone: 'CSV फ़ाइल चुनने के लिए क्लिक करें',
        successAdd: 'अधिकारी सफलतापूर्वक जोड़ा गया!',
        successImport: 'अधिकारी सफलतापूर्वक आयात किए गए!',
    },
    form: {
        name: 'पूरा नाम',
        rank: 'पद / पदनाम',
        dept: 'विभाग',
        email: 'ईमेल आईडी',
        phone: 'फ़ोन नंबर',
        cabin: 'केबिन नंबर',
    },
    noResults: {
        title: "कोई अधिकारी नहीं मिला",
        desc: "अपनी खोज शर्तों या फ़िल्टर को समायोजित करने का प्रयास करें।"
    }
  },
  mr: {
    title: 'अधिकारी निर्देशिका',
    subtitle: 'अधिकारी प्रोफाइल, पदनाम आणि प्रवेश अधिकार व्यवस्थापित करा.',
    actions: {
      add: 'अधिकारी जोडा',
      import: 'CSV आयात करा',
      export: 'CSV निर्यात करा',
    },
    searchPlaceholder: 'नाव, आयडी किंवा पदनामाने शोधा...',
    columns: {
      profile: 'अधिकारी प्रोफाइल',
      dept: 'विभाग आणि केबिन',
      status: 'सद्यस्थिती',
      contact: 'संपर्क तपशील',
      lastActive: 'शेवटचे सक्रिय',
      actions: 'क्रिया',
    },
    status: {
      active: 'उपलब्ध',
      meeting: 'मीटिंगमध्ये',
      leave: 'रजेवर',
      inactive: 'निष्क्रिय',
    },
    menu: {
      edit: 'प्रोफाइल संपादित करा',
      deactivate: 'खाते निष्क्रिय करा',
      activate: 'खाते सक्रिय करा',
    },
    modals: {
        addTitle: 'नवीन अधिकारी जोडा',
        editTitle: 'अधिकारी प्रोफाइल संपादित करा',
        importTitle: 'CSV वरून अधिकारी आयात करा',
        deactivateTitle: 'निष्क्रियतेची पुष्टी करा',
        deactivateMsg: 'तुम्हाला खात्री आहे की तुम्ही या अधिकाऱ्याला निष्क्रिय करू इच्छिता? ते यापुढे अभ्यागत शोधांमध्ये दिसणार नाहीत.',
        cancel: 'रद्द करा',
        save: 'जतन करा',
        update: 'अपडेट करा',
        upload: 'अपलोड आणि आयात',
        deactivateConfirm: 'निष्क्रिय करा',
        activateConfirm: 'सक्रिय करा',
        dropZone: '.csv फाइल निवडण्यासाठी क्लिक करा',
        successAdd: 'अधिकारी यशस्वीरित्या जोडले!',
        successImport: 'अधिकारी यशस्वीरित्या आयात केले!',
    },
    form: {
        name: 'पूर्ण नाव',
        rank: 'पद / पदनाम',
        dept: 'विभाग',
        email: 'ईमेल आयडी',
        phone: 'फोन नंबर',
        cabin: 'केबिन नंबर',
    },
    noResults: {
        title: "कोणतेही अधिकारी सापडले नाहीत",
        desc: "तुमच्या शोध अटी किंवा फिल्टर समायोजित करण्याचा प्रयत्न करा."
    }
  },
};

const useStyles = makeStyles({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
  },
});

const OfficersContent: React.FC<OfficersContentProps> = ({ lang, tenant }) => {
  const t = content[lang];
  const styles = useStyles();
  
  // -- State --
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeDialog, setActiveDialog] = useState<'add' | 'edit' | 'deactivate' | 'import' | null>(null);
  
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [formData, setFormData] = useState<Partial<Officer>>({});

  // Updated to fetch from real API
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        console.log('📡 Fetching officers from backend API...');
        const data = await officersService.getOfficers();
        console.log('✅ Officers fetched:', data);
        
        // Map API response to Officer format
        const mappedOfficers: Officer[] = (Array.isArray(data) ? data : []).map((officer: any) => ({
          id: officer.id || String(officer.officers_id),
          name: officer.name || officer.officer_name || 'Unknown',
          rank: officer.rank || officer.officer_designation || 'Officer',
          department: officer.department || 'General',
          email: officer.email || officer.officer_email || '',
          phone: officer.phone || officer.officer_phone || '',
          cabin: officer.cabin || officer.officer_cabin || 'TBD',
          status: (officer.status || 'active').toLowerCase() as OfficerStatus,
          lastActive: officer.lastActive || 'Recently',
          tenant: tenant
        }));
        
        setOfficers(mappedOfficers);
      } catch (error) {
        console.error('❌ Failed to fetch officers:', error);
        setOfficers([]);
      }
    };
    fetchOfficers();
  }, [tenant]);

  const closeDialog = () => {
      setActiveDialog(null);
      setTimeout(() => {
          setSelectedOfficer(null);
          setFormData({});
          setCsvFile(null);
      }, 200);
  };

  const handleAddSubmit = async () => {
      if (!formData.name || !formData.rank) {
          alert("Name and Rank are required!");
          return;
      }
      try {
        const officerData = {
          name: formData.name || 'Unknown',
          rank: formData.rank || 'Officer',
          department: formData.department || 'General',
          email: formData.email || '',
          phone: formData.phone || '',
          cabin: formData.cabin || 'TBD',
        };
        
        console.log('📝 Adding new officer:', officerData);
        const response = await officersService.addOfficer(officerData);
        console.log('✅ Officer added:', response);
        
        // Refresh the list
        const updatedOfficers = await officersService.getOfficers();
        const mappedOfficers: Officer[] = (Array.isArray(updatedOfficers) ? updatedOfficers : []).map((officer: any) => ({
          id: officer.id || String(officer.officers_id),
          name: officer.name || officer.officer_name || 'Unknown',
          rank: officer.rank || officer.officer_designation || 'Officer',
          department: officer.department || 'General',
          email: officer.email || officer.officer_email || '',
          phone: officer.phone || officer.officer_phone || '',
          cabin: officer.cabin || officer.officer_cabin || 'TBD',
          status: (officer.status || 'active').toLowerCase() as OfficerStatus,
          lastActive: officer.lastActive || 'Recently',
          tenant: tenant
        }));
        setOfficers(mappedOfficers);
        closeDialog();
        alert(t.modals.successAdd);
      } catch (error) {
        console.error('❌ Error adding officer:', error);
        alert('Failed to add officer');
      }
  };

  const handleEditSubmit = async () => {
      if (!selectedOfficer) return;
      try {
        const updatedOfficer = { ...selectedOfficer, ...formData } as Officer;
        console.log('✏️ Updating officer:', updatedOfficer);
        const response = await officersService.updateOfficer(updatedOfficer.id, {
          name: updatedOfficer.name,
          rank: updatedOfficer.rank,
          department: updatedOfficer.department,
          email: updatedOfficer.email,
          phone: updatedOfficer.phone,
          cabin: updatedOfficer.cabin,
        });
        console.log('✅ Officer updated:', response);
        
        setOfficers(prev => prev.map(o => o.id === selectedOfficer.id ? updatedOfficer : o));
        closeDialog();
        alert('Officer profile updated successfully!');
      } catch (error) {
        console.error('❌ Error updating officer:', error);
        alert('Failed to update officer');
      }
  };

  const handleDeactivateConfirm = async () => {
      if (!selectedOfficer) return;
      try {
        console.log('🔴 Deactivating officer:', selectedOfficer.id);
        const response = await officersService.deactivateOfficer(Number(selectedOfficer.id));
        console.log('✅ Officer deactivated:', response);
        
        // Remove from list or update status
        setOfficers(prev => prev.filter(o => o.id !== selectedOfficer.id));
        closeDialog();
        alert('Officer deactivated successfully');
      } catch (error) {
        console.error('❌ Error deactivating officer:', error);
        alert('Failed to deactivate officer');
      }
  };

  const handleExportCSV = () => {
    const headers = ['ID,Name,Rank,Department,Email,Phone,Cabin,Status,LastActive'];
    const rows = officers.map(o => 
      [o.id, o.name, o.rank, o.department, o.email, o.phone, o.cabin, o.status, o.lastActive]
      .map(field => `"${field}"`)
      .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `officers_export_${tenant}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImportSubmit = async () => {
      if (!csvFile) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target?.result as string;
          if (!text) return;
          const lines = text.split('\n');
          const imported: Officer[] = [];
          for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              const cols = line.split(',');
              if (cols.length >= 2) {
                   const newOfficer: Officer = {
                       id: `IMP-${Date.now()}-${i}`,
                       name: cols[0]?.trim() || 'Imported',
                       rank: cols[1]?.trim() || 'Officer',
                       department: cols[2]?.trim() || 'General',
                       email: cols[3]?.trim() || '',
                       phone: cols[4]?.trim() || '',
                       cabin: cols[5]?.trim() || 'TBD',
                       status: 'active',
                       lastActive: 'Imported',
                       tenant: tenant // Enforce Tenant
                   };
                   imported.push(newOfficer);
                   await addOfficer(newOfficer);
              }
          }
          setOfficers([...imported, ...officers]);
          closeDialog();
          alert(`${t.modals.successImport} (${imported.length})`);
      };
      reader.readAsText(csvFile);
  };

  const handleMenuAction = (action: 'edit' | 'deactivate', officer: Officer) => {
      console.log(`📋 Menu action: ${action} for officer:`, officer);
      setSelectedOfficer(officer);
      if (action === 'edit') {
        setFormData({ ...officer });
        console.log('📝 Form data set to:', officer);
      }
      // Use queueMicrotask for better state batching than setTimeout
      queueMicrotask(() => {
        setActiveDialog(action);
        console.log(`✅ Dialog state updated to: ${action}`);
      });
  };

  const filteredOfficers = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    return officers.filter(
      (o) =>
        o.name.toLowerCase().includes(lowerTerm) ||
        o.rank.toLowerCase().includes(lowerTerm) ||
        o.id.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, officers]);

  const getStatusConfig = (status: OfficerStatus) => {
    switch (status) {
      case 'active': return { color: 'success' as const, icon: 'check_circle' };
      case 'meeting': return { color: 'warning' as const, icon: 'do_not_disturb_on' };
      case 'leave': return { color: 'danger' as const, icon: 'flight' };
      case 'inactive': return { color: 'secondary' as const, icon: 'block' };
      default: return { color: 'neutral' as const, icon: 'help' };
    }
  };

  const columns: TableColumnDefinition<Officer>[] = [
    createTableColumn<Officer>({
      columnId: 'profile',
      compare: (a, b) => a.name.localeCompare(b.name),
      renderHeaderCell: () => t.columns.profile,
      renderCell: (item) => (
        <TableCellLayout
          media={
            <Avatar
              name={item.name}
              badge={{
                status: item.status === 'meeting' ? 'busy' : item.status === 'active' ? 'available' : item.status === 'leave' ? 'away' : 'offline',
              }}
            />
          }
        >
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.name}</span>
            <span className="text-xs text-neutral-500">{item.rank} • {item.id}</span>
          </div>
        </TableCellLayout>
      ),
    }),
    createTableColumn<Officer>({
      columnId: 'dept',
      compare: (a, b) => a.department.localeCompare(b.department),
      renderHeaderCell: () => t.columns.dept,
      renderCell: (item) => (
        <TableCellLayout>
          <div className="flex flex-col">
            <span>{item.department}</span>
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">meeting_room</span>
              {item.cabin}
            </span>
          </div>
        </TableCellLayout>
      ),
    }),
    createTableColumn<Officer>({
      columnId: 'status',
      compare: (a, b) => a.status.localeCompare(b.status),
      renderHeaderCell: () => t.columns.status,
      renderCell: (item) => {
        const config = getStatusConfig(item.status);
        return (
          <TableCellLayout>
            <Badge appearance="tint" color={config.color} icon={<span className="material-symbols-outlined text-[14px]">{config.icon}</span>}>
              {t.status[item.status]}
            </Badge>
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Officer>({
      columnId: 'contact',
      renderHeaderCell: () => t.columns.contact,
      renderCell: (item) => (
        <TableCellLayout>
          <div className="text-sm">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <span className="material-symbols-outlined text-[16px]">mail</span> {item.email}
            </div>
            <div className="flex items-center gap-2 text-neutral-500 mt-1">
              <span className="material-symbols-outlined text-[16px]">call</span> {item.phone}
            </div>
          </div>
        </TableCellLayout>
      ),
    }),
    createTableColumn<Officer>({
      columnId: 'actions',
      renderHeaderCell: () => t.columns.actions,
      renderCell: (item) => (
        <TableCellLayout>
           <div onClick={(e) => e.stopPropagation()}>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button appearance="subtle" icon={<span className="material-symbols-outlined">more_vert</span>} aria-label="More actions" />
                </MenuTrigger>
                <MenuList>
                  <MenuItem 
                    icon={<span className="material-symbols-outlined">edit</span>} 
                    onClick={(e) => {
                      console.log('🔘 Edit button clicked for:', item.name);
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuAction('edit', item);
                    }}
                  >
                      {t.menu.edit}
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                      icon={<span className="material-symbols-outlined">{item.status === 'inactive' ? 'check_circle' : 'block'}</span>} 
                      className={item.status === 'inactive' ? "text-green-600" : "text-red-600"}
                      onClick={(e) => {
                        console.log('🔘 Deactivate button clicked for:', item.name);
                        e.preventDefault();
                        e.stopPropagation();
                        handleMenuAction('deactivate', item);
                      }}
                  >
                      {item.status === 'inactive' ? t.menu.activate : t.menu.deactivate}
                  </MenuItem>
                </MenuList>
              </Menu>
          </div>
        </TableCellLayout>
      ),
    }),
  ];

  const renderFormFields = () => (
      <div className="flex flex-col gap-4 mt-4">
        <div className={styles.field}>
            <Label htmlFor="form-name">{t.form.name}</Label>
            <Input id="form-name" value={formData.name || ''} onChange={(e, d) => setFormData({...formData, name: d.value})} />
        </div>
        <div className={styles.field}>
            <Label htmlFor="form-rank">{t.form.rank}</Label>
            <Input id="form-rank" value={formData.rank || ''} onChange={(e, d) => setFormData({...formData, rank: d.value})} />
        </div>
            <div className={styles.field}>
            <Label htmlFor="form-dept">{t.form.dept}</Label>
            <Input id="form-dept" value={formData.department || ''} onChange={(e, d) => setFormData({...formData, department: d.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className={styles.field}>
                <Label htmlFor="form-email">{t.form.email}</Label>
                <Input id="form-email" type="email" value={formData.email || ''} onChange={(e, d) => setFormData({...formData, email: d.value})} />
            </div>
            <div className={styles.field}>
                <Label htmlFor="form-phone">{t.form.phone}</Label>
                <Input id="form-phone" value={formData.phone || ''} onChange={(e, d) => setFormData({...formData, phone: d.value})} />
            </div>
        </div>
            <div className={styles.field}>
            <Label htmlFor="form-cabin">{t.form.cabin}</Label>
            <Input id="form-cabin" value={formData.cabin || ''} onChange={(e, d) => setFormData({...formData, cabin: d.value})} />
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <div className="p-6 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100">{t.title}</h1>
            <p className="text-neutral-500 mt-1">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button icon={<span className="material-symbols-outlined">download</span>} onClick={handleExportCSV}>
                {t.actions.export}
            </Button>
            <Button icon={<span className="material-symbols-outlined">upload</span>} onClick={() => setActiveDialog('import')}>
                {t.actions.import}
            </Button>
            <Button appearance="primary" icon={<span className="material-symbols-outlined">add</span>} onClick={() => { setFormData({}); setActiveDialog('add'); }}>
              {t.actions.add}
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 flex gap-4 items-center">
          <Input
            placeholder={t.searchPlaceholder}
            className="w-full max-w-md"
            value={searchTerm}
            onChange={(e, data) => setSearchTerm(data.value)}
            contentAfter={<span className="material-symbols-outlined text-neutral-500">search</span>}
          />
          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-2"></div>
          <span className="text-sm text-neutral-500">
            <strong>{filteredOfficers.length}</strong> officers found
          </span>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-hidden">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 h-full overflow-y-auto">
          <Table aria-label="Officers Directory Table" size="medium">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHeaderCell key={column.columnId} className="font-semibold text-neutral-600 dark:text-neutral-400">
                    {column.renderHeaderCell()}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOfficers.map((item) => (
                <TableRow key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  {columns.map((column) => (
                    <TableCell key={column.columnId}>
                      {column.renderCell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredOfficers.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
               <span className="material-symbols-outlined text-6xl text-neutral-300 dark:text-neutral-700 mb-4">person_off</span>
               <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">{t.noResults.title}</h3>
               <p className="text-neutral-500">{t.noResults.desc}</p>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD/EDIT OFFICER DIALOG --- */}
      <Dialog 
        open={activeDialog === 'add' || activeDialog === 'edit'} 
        onOpenChange={(e, data) => {
          console.log('✏️ Dialog onOpenChange - open:', data.open, 'activeDialog:', activeDialog);
          if (!data.open) {
            console.log('✏️ Dialog closing, calling closeDialog()');
            closeDialog();
          }
        }}
      >
        <DialogSurface>
            <DialogBody>
                <DialogTitle>{activeDialog === 'add' ? t.modals.addTitle : t.modals.editTitle}</DialogTitle>
                <DialogContent>{renderFormFields()}</DialogContent>
                <DialogActions>
                    <Button appearance="secondary" onClick={closeDialog}>{t.modals.cancel}</Button>
                    <Button appearance="primary" onClick={activeDialog === 'add' ? handleAddSubmit : handleEditSubmit}>
                        {activeDialog === 'add' ? t.modals.save : t.modals.update}
                    </Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* --- DEACTIVATE CONFIRM DIALOG --- */}
      <Dialog 
        open={activeDialog === 'deactivate'} 
        onOpenChange={(e, data) => {
          console.log('🗑️ Deactivate dialog onOpenChange - open:', data.open, 'activeDialog:', activeDialog);
          if (!data.open) {
            console.log('🗑️ Deactivate dialog closing');
            closeDialog();
          }
        }}
      >
        <DialogSurface>
            <DialogBody>
                <DialogTitle>{t.modals.deactivateTitle}</DialogTitle>
                <DialogContent>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                        {t.modals.deactivateMsg}
                    </p>
                    <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center gap-3">
                         <Avatar name={selectedOfficer?.name} size={32} />
                         <div>
                             <div className="font-semibold">{selectedOfficer?.name}</div>
                             <div className="text-xs text-neutral-500">{selectedOfficer?.id}</div>
                         </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button appearance="secondary" onClick={closeDialog}>{t.modals.cancel}</Button>
                    <Button appearance="primary" className="!bg-red-600 hover:!bg-red-700 text-white" onClick={handleDeactivateConfirm}>
                        {selectedOfficer?.status === 'inactive' ? t.modals.activateConfirm : t.modals.deactivateConfirm}
                    </Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* --- IMPORT CSV DIALOG --- */}
      <Dialog open={activeDialog === 'import'} onOpenChange={(e, data) => !data.open && closeDialog()}>
        <DialogSurface>
            <DialogBody>
                <DialogTitle>{t.modals.importTitle}</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg mt-4 bg-neutral-50 dark:bg-neutral-900/50">
                         <span className="material-symbols-outlined text-4xl text-neutral-400 mb-2">upload_file</span>
                         <p className="text-sm text-neutral-500 mb-4">{t.modals.dropZone}</p>
                         <input 
                            type="file" 
                            accept=".csv" 
                            onChange={(e) => { if(e.target.files) setCsvFile(e.target.files[0]); }} 
                            className="block w-full text-sm text-neutral-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary file:text-white
                                hover:file:bg-secondary cursor-pointer"
                        />
                        {csvFile && <p className="mt-2 text-sm font-semibold text-primary">{csvFile.name}</p>}
                    </div>
                    <div className="mt-4 text-xs text-neutral-400">
                        Expected format: Name, Rank, Department, Email, Phone, Cabin
                    </div>
                </DialogContent>
                 <DialogActions>
                    <Button appearance="secondary" onClick={closeDialog}>{t.modals.cancel}</Button>
                    <Button appearance="primary" disabled={!csvFile} onClick={handleImportSubmit}>{t.modals.upload}</Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default OfficersContent;