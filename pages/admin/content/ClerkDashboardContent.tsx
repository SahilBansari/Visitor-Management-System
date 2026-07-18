import React, { useState } from 'react';
import type { Language } from '../../../App';
import RegistrationWizard from '../../../components/wizard/RegistrationWizard';
import NotificationPanel from '../../../components/admin/dashboard/NotificationPanel';
import { useTheme } from '../../../contexts/ThemeContext';

interface ClerkDashboardContentProps {
    lang: Language;
}

const content = {
    en: {
        welcome: 'Clerk Dashboard',
        subTitle: 'Manage visitor entry and walk-in registrations.',
        stats: {
            total: 'Expected Today',
            checkedIn: 'Checked In',
            pending: 'Pending',
        },
        walkIn: {
            title: 'New Walk-In Registration',
            desc: 'Register a visitor arriving without a prior appointment.',
            button: 'Open Registration Form'
        },
        table: {
            title: "Today's Appointments",
            colName: 'Visitor Name',
            colMeeting: 'Meeting With', 
            colPurpose: 'Purpose',
            colTime: 'Time',
            colStatus: 'Status',
            colEntry: 'Entry',
            colExit: 'Check Out',      
            btnCheckIn: 'Check In',
            btnCheckOut: 'Check Out',
            status: {
                approved: 'Approved',
                pending: 'Pending',
                checkedIn: 'Checked In',
                checkedOut: 'Departed'
            }
        }
    },
    hi: {
        welcome: 'क्लर्क डैशबोर्ड',
        subTitle: 'आगंतुक प्रविष्टि और वॉक-इन पंजीकरण प्रबंधित करें।',
        stats: {
            total: 'आज अपेक्षित',
            checkedIn: 'चेक इन किया',
            pending: 'लंबित',
        },
        walkIn: {
            title: 'नया वॉक-इन पंजीकरण',
            desc: 'बिना पूर्व नियुक्ति के आने वाले आगंतुक को पंजीकृत करें।',
            button: 'पंजीकरण फॉर्म खोलें'
        },
        table: {
            title: "आज की नियुक्तियां",
            colName: 'आगंतुक का नाम',
            colMeeting: 'किससे मिलना है',
            colPurpose: 'उद्देश्य',
            colTime: 'समय',
            colStatus: 'स्थिति',
            colEntry: 'प्रवेश',
            colExit: 'निकास',
            btnCheckIn: 'चेक इन करें',
            btnCheckOut: 'चेक आउट',
            status: {
                approved: 'स्वीकृत',
                pending: 'लंबित',
                checkedIn: 'चेक इन',
                checkedOut: 'प्रस्थान किया'
            }
        }
    },
    mr: {
        welcome: 'लिपिक डॅशबोर्ड',
        subTitle: 'अभ्यागत प्रवेश आणि वॉक-इन नोंदणी व्यवस्थापित करा.',
        stats: {
            total: 'आज अपेक्षित',
            checkedIn: 'चेक इन केले',
            pending: 'प्रलंबित',
        },
        walkIn: {
            title: 'नवीन वॉक-इन नोंदणी',
            desc: 'पूर्व नियोजित वेळेविना येणाऱ्या अभ्यागताची नोंदणी करा.',
            button: 'नोंदणी फॉर्म उघडा'
        },
        table: {
            title: "आजच्या अपॉइंटमेंट्स",
            colName: 'अभ्यागताचे नाव',
            colMeeting: 'कोणाला भेटणार',
            colPurpose: 'उद्देश',
            colTime: 'वेळ',
            colStatus: 'स्थिती',
            colEntry: 'प्रवेश',
            colExit: 'बाहेर जाणे',
            btnCheckIn: 'चेक इन करा',
            btnCheckOut: 'चेक आउट',
            status: {
                approved: 'मंजूर',
                pending: 'प्रलंबित',
                checkedIn: 'चेक इन',
                checkedOut: 'निघून गेले'
            }
        }
    }
};

interface Appointment {
    id: string;
    name: string;
    purpose: string;
    time: string;
    status: 'approved' | 'pending' | 'checkedIn' | 'checkedOut';
    mobile: string;
    type: string;
    officerName: string;
    officerRole: string;
    exitTime?: string;
}

const ClerkDashboardContent: React.FC<ClerkDashboardContentProps> = ({ lang }) => {
    const t = content[lang];
    const { tenant, themeColors } = useTheme();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    
    // Mock Data State with Officer Details
    const [appointments, setAppointments] = useState<Appointment[]>([
        { 
            id: '1', name: 'Ramesh Pawar', purpose: 'Official Meeting', time: '10:30 AM', 
            status: 'approved', mobile: '9876543210', type: 'Visitor',
            officerName: 'Amit Deshmukh', officerRole: 'HOD' 
        },
        { 
            id: '2', name: 'Suresh Patil', purpose: 'Vendor Visit', time: '11:00 AM', 
            status: 'pending', mobile: '9123456789', type: 'Vendor',
            officerName: 'Priya Sharma', officerRole: 'Clerk'
        },
        { 
            id: '3', name: 'Anjali Deshmukh', purpose: 'Inquiry', time: '11:30 AM', 
            status: 'checkedIn', mobile: '9988776655', type: 'Visitor',
            officerName: 'Vikram Singh', officerRole: 'Admin'
        },
        { 
            id: '4', name: 'Rahul Mehta', purpose: 'Document Submission', time: '12:00 PM', 
            status: 'approved', mobile: '8877665544', type: 'Visitor',
            officerName: 'Amit Deshmukh', officerRole: 'HOD'
        },
    ]);

    // Handle Check-In Action
    const handleCheckIn = (id: string) => {
        setAppointments(prev => prev.map(app => 
            app.id === id ? { ...app, status: 'checkedIn' } : app
        ));
    };

    // Handle Check-Out Action
    const handleCheckOut = (id: string) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        
        setAppointments(prev => prev.map(app => 
            app.id === id ? { ...app, status: 'checkedOut', exitTime: timeString } : app
        ));
    };

    // Calculate Stats
    const stats = {
        total: appointments.length,
        checkedIn: appointments.filter(a => a.status === 'checkedIn').length,
        pending: appointments.filter(a => a.status === 'pending' || a.status === 'approved').length
    };

    if (isWizardOpen) {
        return (
            <div className="animate-fadeIn min-h-screen">
                 <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className={`text-2xl font-heading font-bold ${themeColors.text}`}>{t.walkIn.title}</h2>
                        <p className={`${themeColors.secondary} opacity-70 text-sm`}>Fill in the details for the walk-in visitor.</p>
                    </div>
                    <button 
                        onClick={() => setIsWizardOpen(false)} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 ${themeColors.secondary} hover:bg-gray-50 font-semibold transition-colors shadow-sm`}
                    >
                        <span className="material-symbols-outlined">close</span>
                        Close Form
                    </button>
                 </div>
                 <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl p-2">
                    <RegistrationWizard lang={lang} onBackToHome={() => setIsWizardOpen(false)} />
                 </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={`text-3xl font-heading font-bold ${themeColors.text}`}>{t.welcome}</h1>
                    <p className={`${tenant === 'agriculture' ? 'text-green-800' : 'text-cyan-800'} mt-1`}>
                        {t.subTitle} <span className="opacity-60 text-sm font-bold">({tenant?.toUpperCase()} PORTAL)</span>
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-full border border-white/50 shadow-sm">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tenant === 'agriculture' ? 'bg-green-400' : 'bg-cyan-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${tenant === 'agriculture' ? 'bg-green-500' : 'bg-cyan-500'}`}></span>
                    </span>
                    <span className={`text-sm font-semibold ${themeColors.text}`}>System Online</span>
                </div>
            </div>

            {/* Notification Panel (Restricted to Half Width) */}
            <div className="w-full lg:w-1/2">
                <NotificationPanel />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500 bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t.stats.total}</p>
                            <h3 className={`text-3xl font-bold ${themeColors.text} mt-2`}>{stats.total}</h3>
                        </div>
                        <span className="material-symbols-outlined text-blue-500 text-3xl">groups</span>
                    </div>
                </div>
                <div className={`glass-panel p-6 rounded-2xl border-l-4 ${tenant === 'agriculture' ? 'border-l-green-500' : 'border-l-cyan-500'} bg-white shadow-sm`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t.stats.checkedIn}</p>
                            <h3 className={`text-3xl font-bold ${tenant === 'agriculture' ? 'text-green-600' : 'text-cyan-600'} mt-2`}>{stats.checkedIn}</h3>
                        </div>
                        <span className={`material-symbols-outlined ${tenant === 'agriculture' ? 'text-green-600' : 'text-cyan-600'} text-3xl`}>how_to_reg</span>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-orange-400 bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t.stats.pending}</p>
                            <h3 className="text-3xl font-bold text-orange-500 mt-2">{stats.pending}</h3>
                        </div>
                        <span className="material-symbols-outlined text-orange-400 text-3xl">pending_actions</span>
                    </div>
                </div>
            </div>

            {/* Quick Action: New Walk-In */}
            <div className={`glass-panel p-8 rounded-2xl relative overflow-hidden group border ${themeColors.border} bg-white shadow-sm`}>
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${tenant === 'agriculture' ? 'bg-green-400' : 'bg-cyan-400'}`}></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className={`material-symbols-outlined text-2xl ${themeColors.secondary}`}>person_add</span>
                             <h2 className={`text-xl font-bold ${themeColors.text}`}>{t.walkIn.title}</h2>
                        </div>
                        <p className={`${themeColors.secondary} max-w-lg`}>{t.walkIn.desc}</p>
                    </div>
                    <button 
                        onClick={() => setIsWizardOpen(true)}
                        className={`whitespace-nowrap ${themeColors.primary} hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 flex items-center gap-2`}
                    >
                        <span>{t.walkIn.button}</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-white/50 bg-white">
                <div className={`px-6 py-4 border-b ${themeColors.border} ${themeColors.light} flex justify-between items-center`}>
                    <h3 className={`font-heading font-bold text-lg ${themeColors.text}`}>{t.table.title}</h3>
                    <button className={`text-sm ${themeColors.secondary} hover:underline font-semibold flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`bg-white/50 ${themeColors.secondary} text-sm uppercase tracking-wider`}>
                                <th className="px-6 py-4 font-bold">{t.table.colName}</th>
                                <th className="px-6 py-4 font-bold">{t.table.colMeeting}</th>
                                <th className="px-6 py-4 font-bold">{t.table.colPurpose}</th>
                                <th className="px-6 py-4 font-bold">{t.table.colTime}</th>
                                <th className="px-6 py-4 font-bold">{t.table.colStatus}</th>
                                <th className="px-6 py-4 font-bold text-right">{t.table.colEntry}</th>
                                <th className="px-6 py-4 font-bold text-right">{t.table.colExit}</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${tenant === 'agriculture' ? 'divide-green-50' : 'divide-cyan-50'}`}>
                            {appointments.map((app) => (
                                <tr key={app.id} className={`hover:bg-gray-50 transition-colors ${app.status === 'checkedIn' ? (tenant === 'agriculture' ? 'bg-green-50/30' : 'bg-cyan-50/30') : ''}`}>
                                    {/* Visitor Name */}
                                    <td className="px-6 py-4">
                                        <div className={`font-bold ${themeColors.text}`}>{app.name}</div>
                                        <div className="text-xs text-gray-500">{app.type} • {app.mobile}</div>
                                    </td>
                                    
                                    {/* Meeting With */}
                                    <td className="px-6 py-4">
                                        <div className={`font-semibold ${themeColors.secondary}`}>{app.officerName}</div>
                                        <div className={`text-xs ${tenant === 'agriculture' ? 'text-green-600 bg-green-50 border-green-100' : 'text-cyan-600 bg-cyan-50 border-cyan-100'} px-2 py-0.5 rounded-full w-fit border`}>
                                            {app.officerRole}
                                        </div>
                                    </td>

                                    <td className={`px-6 py-4 ${themeColors.secondary} font-medium`}>{app.purpose}</td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-md w-fit text-sm border border-gray-200">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {app.time}
                                        </div>
                                    </td>
                                    
                                    {/* Status Badge */}
                                    <td className="px-6 py-4">
                                        {app.status === 'checkedIn' && (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${tenant === 'agriculture' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-cyan-100 text-cyan-800 border-cyan-200'} border`}>
                                                <span className={`w-2 h-2 rounded-full ${tenant === 'agriculture' ? 'bg-green-500' : 'bg-cyan-500'} mr-2`}></span>
                                                {t.table.status.checkedIn}
                                            </span>
                                        )}
                                        {app.status === 'checkedOut' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                {t.table.status.checkedOut}
                                            </span>
                                        )}
                                        {app.status === 'approved' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                {t.table.status.approved}
                                            </span>
                                        )}
                                        {app.status === 'pending' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                                                {t.table.status.pending}
                                            </span>
                                        )}
                                    </td>
                                    
                                    {/* Entry Action (Check In) */}
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleCheckIn(app.id)}
                                            disabled={app.status !== 'approved' && app.status !== 'pending'}
                                            className={`
                                                inline-flex items-center gap-1 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm
                                                ${(app.status === 'checkedIn' || app.status === 'checkedOut')
                                                    ? 'bg-transparent text-gray-400 cursor-default shadow-none' 
                                                    : `${themeColors.primary} text-white hover:opacity-90 shadow-md`
                                                }
                                            `}
                                        >
                                            {(app.status === 'checkedIn' || app.status === 'checkedOut') ? (
                                                <>
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    Done
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-lg">login</span>
                                                    {t.table.btnCheckIn}
                                                </>
                                            )}
                                        </button>
                                    </td>

                                    {/* Exit Action (Check Out) */}
                                    <td className="px-6 py-4 text-right">
                                        {app.status === 'checkedOut' ? (
                                            <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                                                {app.exitTime || 'Departed'}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleCheckOut(app.id)}
                                                disabled={app.status !== 'checkedIn'}
                                                className={`
                                                    inline-flex items-center gap-1 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm
                                                    ${app.status === 'checkedIn'
                                                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700'
                                                        : 'bg-transparent text-gray-300 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                <span className="material-symbols-outlined text-lg">logout</span>
                                                {t.table.btnCheckOut}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClerkDashboardContent;