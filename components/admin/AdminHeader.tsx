import React, { useState, useEffect } from 'react';
import type { Language, Theme } from '../../App';
import { useAuth } from '../../contexts/AuthContext';
import { 
    Button, 
    Tooltip, 
    Menu, 
    MenuTrigger, 
    MenuList, 
    MenuItem, 
    MenuPopover,
    Avatar
} from '@fluentui/react-components';
import { getAdminNotifications, AdminNotification } from '../../utils/mockDatabase';

interface AdminHeaderProps {
    lang: Language;
    setLang: React.Dispatch<React.SetStateAction<Language>>;
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
    onLogout: () => void;
    breadcrumb: string[];
    setCurrentPage: (page: string) => void;
}

const content = {
    en: {
        notifications: 'Notifications',
        exitAdmin: 'Sign Out',
        noNotifications: 'No new notifications',
        markRead: 'Mark all read',
    },
    hi: {
        notifications: 'सूचनाएं',
        exitAdmin: 'साइन आउट',
        noNotifications: 'कोई नई सूचना नहीं',
        markRead: 'सभी पढ़ें',
    },
    mr: {
        notifications: 'सूचना',
        exitAdmin: 'साइन आउट',
        noNotifications: 'कोणत्याही नवीन सूचना नाहीत',
        markRead: 'सर्व वाचले',
    }
};

const translateNotification = (text: string, lang: Language): string => {
    if (lang === 'en') return text;
    const phraseMap: Record<string, { hi: string, mr: string }> = {
        "New visitor request": { hi: "नया आगंतुक अनुरोध", mr: "नवीन अभ्यागत विनंती" },
        "Staff meeting scheduled": { hi: "कर्मचारी बैठक निर्धारित", mr: "कर्मचारी बैठक नियोजित" },
        "Overstay alert detected": { hi: "ओवरस्टे चेतावनी का पता चला", mr: "ओव्हरस्टे अलर्ट आढळले" },
        "System backup completed": { hi: "सिस्टम बैकअप पूरा हुआ", mr: "सिस्टम बॅकअप पूर्ण झाले" },
        "High traffic at Gate 1": { hi: "गेट 1 पर अधिक भीड़", mr: "गेट 1 वर जास्त रहदारी" },
        "Visitor": { hi: "आगंतुक", mr: "अभ्यागत" },
        "security alert": { hi: "सुरक्षा चेतावनी", mr: "सुरक्षा इशारा" },
        "from": { hi: "से", mr: "कडून" }
    };
    let translatedText = text;
    Object.keys(phraseMap).forEach(key => {
        if (translatedText.includes(key)) {
            translatedText = translatedText.replace(key, phraseMap[key][lang === 'hi' ? 'hi' : 'mr']);
        }
    });
    return translatedText;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ lang, setLang, theme, setTheme, onLogout, breadcrumb, setCurrentPage }) => {
    const { user } = useAuth();
    const t = content[lang];
    
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isSosActive, setIsSosActive] = useState(false);
    const [sosCountdown, setSosCountdown] = useState(5);

    useEffect(() => {
        const loadNotifications = async () => {
            const data = await getAdminNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => n.isUnread).length);
        };
        loadNotifications();
    }, []);

    // SOS Countdown Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSosActive && sosCountdown > 0) {
            timer = setTimeout(() => setSosCountdown(prev => prev - 1), 1000);
        } else if (isSosActive && sosCountdown === 0) {
            // TODO: Integrate Backend SOS API
            console.log("SOS Alert sent to Police Control Room");
        }
        return () => clearTimeout(timer);
    }, [isSosActive, sosCountdown]);

    const handleMarkRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
        setUnreadCount(0);
    };

    const handleNotificationClick = (notif: AdminNotification) => {
        if (notif.isUnread) {
            const updated = notifications.map(n => n.id === notif.id ? { ...n, isUnread: false } : n);
            setNotifications(updated);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        if (notif.type === 'meeting' || notif.text.includes('Staff')) setCurrentPage('schedule');
        else if (notif.type === 'request' || notif.text.includes('Visitor')) setCurrentPage('visitors');
    };

    const triggerSos = () => {
        setIsSosActive(true);
        setSosCountdown(5);
    };

    const cancelSos = () => {
        setIsSosActive(false);
        setSosCountdown(5);
    };

    return (
        <>
            <header className="flex-shrink-0 h-16 bg-[var(--primary-700)] border-b border-[var(--primary-800)] flex items-center justify-between px-6 md:px-8 z-40 sticky top-0 shadow-md">
                
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="flex items-center text-lg md:text-xl font-bold text-white tracking-wide italic whitespace-nowrap">
                        SUDK Admin
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    
                    {/* SOS Panic Button */}
                    <Tooltip content="Emergency SOS" relationship="label">
                        <button 
                            onClick={triggerSos}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 shadow-lg shadow-red-500/50 animate-pulse transition-all mr-2"
                        >
                            <span className="material-symbols-outlined text-sm">emergency</span>
                            SOS
                        </button>
                    </Tooltip>

                    <div className="relative group mr-2">
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value as Language)}
                            className="appearance-none bg-transparent border border-white/30 text-white text-xs font-bold py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:bg-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <option value="en" className="text-gray-900 bg-white">English</option>
                            <option value="hi" className="text-gray-900 bg-white">हिंदी</option>
                            <option value="mr" className="text-gray-900 bg-white">मराठी</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/80">
                            <span className="material-symbols-outlined text-lg">expand_more</span>
                        </div>
                    </div>

                    {/* NOTIFICATIONS */}
                    <Menu positioning="below-end">
                        <MenuTrigger disableButtonEnhancement>
                            <Tooltip content={t.notifications} relationship="label">
                                <button className="relative p-2 rounded-xl text-white/90 hover:bg-white/10 transition-colors focus:outline-none group">
                                    <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform ${unreadCount > 0 ? 'text-white' : ''}`}>
                                        notifications
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[var(--primary-700)] shadow-sm">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </Tooltip>
                        </MenuTrigger>
                        
                        <MenuPopover style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none', marginTop: '8px', overflow: 'visible' }}>
                            <div className="w-[350px] bg-[var(--primary-200)] rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/10 flex flex-col">
                                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                                    <h2 className="text-[18px] font-bold text-[var(--primary-900)] tracking-tight drop-shadow-sm m-0">
                                        {t.notifications}
                                    </h2>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={handleMarkRead} 
                                            className="flex items-center gap-1.5 bg-white hover:bg-white/90 text-[var(--primary-800)] px-3 py-1 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">done_all</span>
                                            <span className="text-[11px] font-bold">{t.markRead}</span>
                                        </button>
                                    )}
                                </div>
                                <div className="h-px bg-[var(--primary-300)] w-full mb-1"></div>
                                <div className="max-h-[380px] overflow-y-auto px-4 pb-4 pt-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.4) transparent' }}>
                                    <MenuList>
                                        {notifications.length > 0 ? (
                                            notifications.map(notif => (
                                                <MenuItem 
                                                    key={notif.id} 
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className="bg-transparent p-0 mb-3 hover:bg-transparent outline-none focus:outline-none focus:ring-0"
                                                >
                                                    <div className="w-full bg-white rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer relative group">
                                                        {notif.isUnread && (
                                                            <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[var(--primary-500)]"></div>
                                                        )}
                                                        <div className="flex gap-3">
                                                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${notif.type === 'alert' ? 'bg-red-50 text-red-600' : 'bg-[var(--primary-50)] text-[var(--primary-700)]'}`}>
                                                                <span className="material-symbols-outlined text-[22px]">
                                                                    {notif.type === 'alert' ? 'warning' : notif.type === 'info' ? 'info' : 'groups'}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 pr-3">
                                                                <p className={`text-[13px] leading-snug mb-1.5 ${notif.isUnread ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                                                    {translateNotification(notif.text, lang)}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                                    {notif.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 text-[var(--primary-900)] opacity-60">
                                                <span className="material-symbols-outlined text-4xl mb-2 opacity-60">notifications_off</span>
                                                <span className="text-xs font-medium">{t.noNotifications}</span>
                                            </div>
                                        )}
                                    </MenuList>
                                </div>
                            </div>
                        </MenuPopover>
                    </Menu>

                    <div className="h-8 w-px bg-white/20 mx-1"></div>

                    <div className="flex items-center gap-3 px-1">
                        <div className="ring-2 ring-white/30 rounded-full">
                             <Avatar 
                                name={user?.name || 'User'} 
                                size={32}
                                image={{ src: `https://api.dicebear.com/9.x/initials/svg?seed=${user?.name || 'User'}` }}
                            />
                        </div>
                        <div className="hidden lg:block leading-tight">
                            <p className="text-sm font-bold text-white truncate max-w-[120px]">{user?.name || 'Unknown'}</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/20 mx-1"></div>

                    <Tooltip content={t.exitAdmin} relationship="label">
                        <button 
                            className="p-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors group"
                            onClick={onLogout}
                        >
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">logout</span>
                        </button>
                    </Tooltip>
                </div>
            </header>

            {/* SOS Modal Overlay */}
            {isSosActive && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border-4 border-red-600">
                        <span className="material-symbols-outlined text-6xl text-red-600 mb-2">emergency</span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">EMERGENCY SOS</h2>
                        
                        {sosCountdown > 0 ? (
                            <>
                                <p className="text-gray-600 mb-4 text-sm">Alerting Nearest Police Station & Control Room in...</p>
                                <div className="text-6xl font-black text-red-600 mb-6">{sosCountdown}</div>
                                <Button appearance="outline" onClick={cancelSos} className="w-full font-bold">CANCEL</Button>
                            </>
                        ) : (
                            <>
                                <p className="text-green-600 font-bold mb-6 text-lg">Alert Sent Successfully.</p>
                                <Button appearance="primary" onClick={cancelSos} className="w-full !bg-gray-800 hover:!bg-gray-700">Close</Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminHeader;