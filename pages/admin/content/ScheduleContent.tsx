import React, { useState, useEffect, useMemo } from 'react';
import type { Language } from '../../../App';
import { useAuth } from '../../../contexts/AuthContext';
import { Dropdown, Option, Label, Avatar, Button } from '@fluentui/react-components';
import { getScheduleUsers, getOfficerSchedule, requestMeeting, ScheduleUser, ScheduleSlot } from '../../../utils/mockDatabase';
import ScheduleBoard from '../../../components/admin/schedule/ScheduleBoard';
import IncomingRequests from '../../../components/admin/schedule/IncomingRequests';

interface Props {
    lang: Language;
}

const content = {
    en: {
        mySchedule: "My Schedule",
        scheduleFor: "Schedule:",
        manageAvail: "Manage your availability",
        viewingAvail: "Viewing availability",
        quickAction: "Quick Action:",
        callStaffMeeting: "Call All Staff Meeting",
        switchView: "Switch View To:",
        selectUser: "Select User",
        you: "You",
        legend: { busy: "Busy", tentative: "Tentative", available: "Available" },
        modal: {
            bookMeeting: "Book Meeting",
            requestUrgent: "Request Urgent Slot",
            allStaff: "All Staff Meeting",
            with: "With",
            at: "at",
            broadcastDesc: "Broadcast a meeting request to all department members.",
            dateTime: "Date & Time",
            meetingType: "Meeting Type",
            internal: "Internal Staff Meeting",
            inPerson: "In-Person",
            internalDesc: "Invites all staff (if Global) or specific user.",
            inPersonDesc: "Physical meeting at office premises.",
            subject: "Subject / Purpose",
            subjectPlace: "e.g. Project Review, Urgent Discussion...",
            busyWarning: "This slot is currently",
            busyWarning2: "Your request will be marked as 'High Priority'.",
            cancel: "Cancel",
            sending: "Sending...",
            sent: "Sent",
            sendReq: "Send Request",
            broadcast: "Broadcast Meeting"
        },
        alerts: {
            sentAll: "Notification sent to ALL STAFF members.",
            sentUser: "Request successfully sent to"
        },
        templates: "Schedule Templates",
        createTemplate: "Create Template",
        bulkEdit: "Bulk Edit",
        conflicts: "Conflicts",
        shareSchedule: "Share Schedule",
        monthView: "Month View",
        notifications: "Notifications",
        filters: "Filters",
        analytics: "Analytics",
        autoSchedule: "Auto Schedule",
        timezone: "Time Zone",
        conflicts_title: "Potential Conflicts",
        no_conflicts: "No conflicts detected",
        busiest: "Busiest Time",
        freest: "Freest Time",
        meetings_count: "Meetings Today",
        share_with: "Share with",
        all_staff: "All Staff"
    },
    hi: {
        mySchedule: "मेरी समय सारिणी",
        scheduleFor: "समय सारिणी:",
        manageAvail: "अपनी उपलब्धता प्रबंधित करें",
        viewingAvail: "उपलब्धता देख रहे हैं",
        quickAction: "त्वरित कार्रवाई:",
        callStaffMeeting: "सभी कर्मचारियों की बैठक बुलाएं",
        switchView: "दृश्य बदलें:",
        selectUser: "उपयोगकर्ता चुनें",
        you: "आप",
        legend: { busy: "व्यस्त", tentative: "अनिश्चित", available: "उपलब्ध" },
        modal: {
            bookMeeting: "बैठक बुक करें",
            requestUrgent: "तत्काल स्लॉट का अनुरोध करें",
            allStaff: "सभी कर्मचारियों की बैठक",
            with: "साथ में",
            at: "पर",
            broadcastDesc: "सभी विभाग के सदस्यों को बैठक अनुरोध प्रसारित करें।",
            dateTime: "दिनांक और समय",
            meetingType: "बैठक का प्रकार",
            internal: "आंतरिक कर्मचारी बैठक",
            inPerson: "व्यक्तिगत रूप से (In-Person)",
            internalDesc: "सभी कर्मचारियों (यदि ग्लोबल है) या विशिष्ट उपयोगकर्ता को आमंत्रित करता है।",
            inPersonDesc: "कार्यालय परिसर में भौतिक बैठक।",
            subject: "विषय / उद्देश्य",
            subjectPlace: "जैसे परियोजना समीक्षा, तत्काल चर्चा...",
            busyWarning: "यह स्लॉट वर्तमान में है",
            busyWarning2: "आपके अनुरोध को 'उच्च प्राथमिकता' के रूप में चिह्नित किया जाएगा।",
            cancel: "रद्द करें",
            sending: "भेज रहा है...",
            sent: "भेजा गया",
            sendReq: "अनुरोध भेजें",
            broadcast: "बैठक प्रसारित करें"
        },
        alerts: {
            sentAll: "सभी स्टाफ सदस्यों को अधिसूचना भेजी गई।",
            sentUser: "अनुरोध सफलतापूर्वक भेजा गया"
        },
        templates: "शेड्यूल टेम्पलेट",
        createTemplate: "नया टेम्पलेट बनाएं",
        bulkEdit: "बल्क संपादित करें",
        conflicts: "संघर्ष",
        shareSchedule: "शेड्यूल साझा करें",
        monthView: "महीने का दृश्य",
        notifications: "सूचनाएं",
        filters: "फ़िल्टर",
        analytics: "विश्लेषण",
        autoSchedule: "स्वचालित शेड्यूलिंग",
        timezone: "समय क्षेत्र",
        conflicts_title: "संभावित संघर्ष",
        no_conflicts: "कोई संघर्ष नहीं",
        busiest: "सबसे व्यस्त समय",
        freest: "सबसे खाली समय",
        meetings_count: "आज की बैठकें",
        share_with: "साथ साझा करें",
        all_staff: "सभी कर्मचारी"
    },
    mr: {
        mySchedule: "माझे वेळापत्रक",
        scheduleFor: "वेळापत्रक:",
        manageAvail: "तुमची उपलब्धता व्यवस्थापित करा",
        viewingAvail: "उपलब्धता पाहत आहे",
        quickAction: "त्वरित क्रिया:",
        callStaffMeeting: "सर्व कर्मचारी बैठक बोलावा",
        switchView: "दृष्य बदला:",
        selectUser: "वापरकर्ता निवडा",
        you: "तुम्ही",
        legend: { busy: "व्यस्त", tentative: "तात्पुरते", available: "उपलब्ध" },
        modal: {
            bookMeeting: "मीटिंग बुक करा",
            requestUrgent: "तातडीच्या स्लॉटची विनंती करा",
            allStaff: "सर्व कर्मचारी बैठक",
            with: "सह",
            at: "येथे",
            broadcastDesc: "सर्व विभागाच्या सदस्यांना मीटिंग विनंती प्रसारित करा.",
            dateTime: "तारीख आणि वेळ",
            meetingType: "मीटिंगचा प्रकार",
            internal: "अंतर्गत कर्मचारी बैठक",
            inPerson: "प्रत्यक्ष (In-Person)",
            internalDesc: "सर्व कर्मचाऱ्यांना (ग्लोबल असल्यास) किंवा विशिष्ट वापरकर्त्याला आमंत्रित करते.",
            inPersonDesc: "कार्यालय परिसरात प्रत्यक्ष बैठक.",
            subject: "विषय / उद्देश",
            subjectPlace: "उदा. प्रकल्प आढावा, तातडीची चर्चा...",
            busyWarning: "हा स्लॉट सध्या आहे",
            busyWarning2: "तुमची विनंती 'उच्च प्राधान्य' म्हणून चिन्हांकित केली जाईल.",
            cancel: "रद्द करा",
            sending: "पाठवत आहे...",
            sent: "पाठवले",
            sendReq: "विनंती पाठवा",
            broadcast: "मीटिंग प्रसारित करा"
        },
        alerts: {
            sentAll: "सर्व कर्मचारी सदस्यांना सूचना पाठविली.",
            sentUser: "विनंती यशस्वीरित्या पाठविली"
        },
        templates: "वेळापत्र टेम्पलेट",
        createTemplate: "नया टेम्पलेट बनाएं",
        bulkEdit: "बल्क संपादित करें",
        conflicts: "अग्राधकार",
        shareSchedule: "वेळापत्र साझा करें",
        monthView: "महीने का दृश्य",
        notifications: "सूचनाएं",
        filters: "फ़िल्टर",
        analytics: "विश्लेषण",
        autoSchedule: "स्वचालित शेड्यूलिंग",
        timezone: "समय क्षेत्र",
        conflicts_title: "संभावित संघर्ष",
        no_conflicts: "कोई संघर्ष नहीं",
        busiest: "सबसे व्यस्त समय",
        freest: "सबसे खाली समय",
        meetings_count: "मीटिंग्स",
        share_with: "साथ साझा करें",
        all_staff: "सभी कर्मचारी"
    }
};

const ScheduleContent: React.FC<Props> = ({ lang }) => {
    const { user } = useAuth();
    const t = content[lang];
    
    // Data State
    const [allUsers, setAllUsers] = useState<ScheduleUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [slots, setSlots] = useState<ScheduleSlot[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // "Slot Mode" vs "Global Mode"
    const [targetSlot, setTargetSlot] = useState<ScheduleSlot | null>(null);
    const [customTime, setCustomTime] = useState('');
    const [customDate, setCustomDate] = useState('');

    const [reqType, setReqType] = useState<'internal' | 'in-person'>('internal');
    const [reqSubject, setReqSubject] = useState('');
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'sent'>('idle');

    // ============ NEW FEATURE STATE ============
    
    // 1. Schedule Templates
    const [templates, setTemplates] = useState<Array<{id: string; name: string; slots: Array<{day: string; time: string; status: string}>}>>([
        { id: 'lunch', name: 'Lunch Break', slots: [{day: 'Mon-Fri', time: '12:00 - 13:00', status: 'busy'}] },
        { id: 'morning', name: 'Morning Review', slots: [{day: 'Mon-Wed-Fri', time: '09:00 - 09:30', status: 'tentative'}] }
    ]);
    const [showTemplates, setShowTemplates] = useState(false);

    // 2. Bulk Edit
    const [bulkEditMode, setBulkEditMode] = useState(false);
    const [bulkDateRange, setBulkDateRange] = useState({ start: '', end: '' });
    const [bulkStatus, setBulkStatus] = useState('available');

    // 3. Conflict Detection
    const [conflicts, setConflicts] = useState<Array<{id: string; type: string; time: string; message: string}>>([]);

    // 4. Schedule Sharing
    const [shareMode, setShareMode] = useState(false);
    const [sharedWith, setSharedWith] = useState<string[]>([]);

    // 5. Calendar Month View
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

    // 6. Notifications
    const [notifications, setNotifications] = useState<Array<{id: string; message: string; time: string; type: string}>>([
        { id: '1', message: 'Team meeting in 30 minutes', time: '14:30', type: 'reminder' },
        { id: '2', message: 'Your schedule has been updated', time: '10:00', type: 'info' }
    ]);

    // 7. Advanced Filters
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterTime, setFilterTime] = useState('all');
    const [savedFilters, setSavedFilters] = useState<string[]>([]);

    // 8. Analytics Dashboard
    const [analyticsData, setAnalyticsData] = useState({
        total_meetings: 5,
        busy_slots: 8,
        free_slots: 12,
        busiest_time: '14:00 - 15:00',
        freest_time: '10:00 - 11:00'
    });

    // 9. Auto-Scheduling
    const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(false);
    const [suggestedSlots, setSuggestedSlots] = useState<Array<{time: string; score: number}>>([
        { time: '10:00 - 10:30', score: 95 },
        { time: '15:00 - 15:30', score: 87 }
    ]);

    // 10. Time Zone Support
    const [timezone, setTimezone] = useState('UTC+5:30');
    const [timezones] = useState(['UTC', 'UTC+5:30', 'UTC+8:00', 'UTC-5:00', 'UTC-8:00']);

    // ============ END NEW FEATURES ============

    // 1. Determine "My ID"
    const myId = useMemo(() => {
        if (user?.role === 'admin') return 'admin_1';
        if (user?.role === 'clerk') return 'clerk_1';
        return 'off_1'; 
    }, [user]);

    // 2. Load Users
    useEffect(() => {
        const loadUsers = async () => {
            const data = await getScheduleUsers();
            setAllUsers(data);
            setSelectedUserId(myId);
        };
        loadUsers();
    }, [myId]);

    // 3. Filter Logic
    const filteredUsers = useMemo(() => {
        if (!user || allUsers.length === 0) return [];
        return allUsers.filter(targetUser => {
            if (targetUser.id === myId) return true;
            if (user.role === 'admin') return true;
            if (user.role === 'hod') return true;
            if (user.role === 'clerk') return targetUser.role === 'admin' || targetUser.role === 'hod';
            return false;
        });
    }, [user, allUsers, myId]);

    // 4. Fetch Schedule
    useEffect(() => {
        if (!selectedUserId) return;
        const fetchSchedule = async () => {
            setLoading(true);
            const data = await getOfficerSchedule(selectedUserId, new Date());
            setSlots(data);
            setLoading(false);
        };
        fetchSchedule();
    }, [selectedUserId]);

    const selectedUserObj = allUsers.find(u => u.id === selectedUserId);
    const isViewingSelf = selectedUserId === myId;

    // --- Handlers ---

    const handleOpenSlotRequest = (slot: ScheduleSlot) => {
        setTargetSlot(slot);
        setCustomTime(''); 
        setReqSubject('');
        setReqType('internal');
        setSubmitStatus('idle');
        setIsModalOpen(true);
    };

    const handleOpenGlobalRequest = () => {
        setTargetSlot(null); 
        setCustomTime('09:00'); 
        setCustomDate(new Date().toISOString().split('T')[0]); 
        setReqSubject('');
        setReqType('internal'); 
        setSubmitStatus('idle');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus('loading');
        
        const isGlobal = !targetSlot; 
        const targetId = isGlobal ? 'all' : selectedUserObj?.id || '';
        const finalTime = isGlobal ? `${customDate} at ${customTime}` : targetSlot?.time || '';

        await requestMeeting({
            targetUserId: targetId,
            time: finalTime,
            type: reqType,
            subject: reqSubject,
            priority: (targetSlot?.status === 'available') ? 'normal' : 'urgent'
        });
        
        setSubmitStatus('sent');

        setTimeout(() => {
            const msg = isGlobal 
                ? t.alerts.sentAll
                : `${t.alerts.sentUser} ${selectedUserObj?.name}`;
            alert(msg);
            handleCloseModal();
            setSubmitStatus('idle');
        }, 600);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 relative pb-10">
            {/* ============ NOTIFICATION BANNER ============ */}
            {notifications.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3 animate-slideDown">
                    <span className="material-symbols-outlined text-blue-600 flex-shrink-0 mt-1">notifications_active</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Active Notifications ({notifications.length})</h3>
                        <div className="space-y-1">
                            {notifications.map(notif => (
                                <p key={notif.id} className="text-sm text-blue-800 dark:text-blue-200">
                                    <span className="font-medium">{notif.time}:</span> {notif.message}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ============ ANALYTICS DASHBOARD ============ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">{t.meetings_count}</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{analyticsData.total_meetings}</p>
                        </div>
                        <span className="material-symbols-outlined text-blue-600 text-[32px]">event</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">Busy Slots</p>
                            <p className="text-2xl font-bold text-red-900 dark:text-red-300">{analyticsData.busy_slots}</p>
                        </div>
                        <span className="material-symbols-outlined text-red-600 text-[32px]">schedule</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Available</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-300">{analyticsData.free_slots}</p>
                        </div>
                        <span className="material-symbols-outlined text-green-600 text-[32px]">check_circle</span>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <div>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">{t.busiest}</p>
                        <p className="text-lg font-bold text-yellow-900 dark:text-yellow-300">{analyticsData.busiest_time}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{t.freest}</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-300">{analyticsData.freest_time}</p>
                    </div>
                </div>
            </div>

            {/* ============ TOOLBAR WITH ALL 10 FEATURES ============ */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-wrap gap-2">
                {/* 1. Schedule Templates */}
                <button 
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">library_add</span>
                    {t.templates}
                </button>

                {/* 2. Bulk Edit */}
                <button 
                    onClick={() => setBulkEditMode(!bulkEditMode)}
                    className="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">content_paste</span>
                    {t.bulkEdit}
                </button>

                {/* 3. Conflict Detection */}
                <button 
                    onClick={() => {
                        setConflicts([
                            { id: '1', type: 'overlap', time: '14:00', message: 'Double-booked time slot' },
                            { id: '2', type: 'pending', time: '15:30', message: 'Pending meeting request' }
                        ]);
                    }}
                    className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    {t.conflicts}
                </button>

                {/* 4. Schedule Sharing */}
                <button 
                    onClick={() => setShareMode(!shareMode)}
                    className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    {t.shareSchedule}
                </button>

                {/* 5. Month View */}
                <button 
                    onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
                    className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    {viewMode === 'week' ? t.monthView : 'Week View'}
                </button>

                {/* 6. Filters */}
                <button 
                    className="px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    {t.filters}
                </button>

                {/* 7. Time Zone */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-[18px]">public</span>
                    <select 
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-400 outline-none"
                    >
                        {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                </div>

                {/* 8. Auto-Schedule */}
                <button 
                    onClick={() => setAutoScheduleEnabled(!autoScheduleEnabled)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                        autoScheduleEnabled 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                        : 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900/40'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">{autoScheduleEnabled ? 'smart_toy' : 'psychology'}</span>
                    {t.autoSchedule}
                </button>
            </div>

            {/* ============ FEATURE PANELS ============ */}

            {/* TEMPLATES PANEL */}
            {showTemplates && (
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 p-4 animate-slideDown">
                    <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined">library_add</span>
                        {t.templates}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {templates.map(template => (
                            <div key={template.id} className="bg-white dark:bg-neutral-900 rounded border border-blue-100 dark:border-blue-900 p-3 hover:shadow-md transition-shadow cursor-pointer">
                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{template.name}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    {template.slots.map(s => `${s.day} ${s.time}`).join(', ')}
                                </p>
                                <button className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                                    Apply Template
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BULK EDIT PANEL */}
            {bulkEditMode && (
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800 p-4 animate-slideDown">
                    <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined">content_paste</span>
                        {t.bulkEdit}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Start Date</label>
                            <input type="date" value={bulkDateRange.start} onChange={(e) => setBulkDateRange({...bulkDateRange, start: e.target.value})} className="w-full mt-1 p-2 border border-purple-200 dark:border-purple-800 rounded bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">End Date</label>
                            <input type="date" value={bulkDateRange.end} onChange={(e) => setBulkDateRange({...bulkDateRange, end: e.target.value})} className="w-full mt-1 p-2 border border-purple-200 dark:border-purple-800 rounded bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</label>
                            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-full mt-1 p-2 border border-purple-200 dark:border-purple-800 rounded bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                                <option value="available">Available</option>
                                <option value="busy">Busy</option>
                                <option value="tentative">Tentative</option>
                            </select>
                        </div>
                    </div>
                    <button className="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors font-medium">
                        Apply to {bulkDateRange.start && bulkDateRange.end ? 'Selected Period' : 'All Days'}
                    </button>
                </div>
            )}

            {/* CONFLICTS PANEL */}
            {conflicts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800 p-4 animate-slideDown">
                    <h3 className="font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined">warning</span>
                        {t.conflicts_title}
                    </h3>
                    <div className="space-y-2">
                        {conflicts.map(conflict => (
                            <div key={conflict.id} className="bg-white dark:bg-neutral-900 rounded p-3 border-l-4 border-red-500">
                                <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{conflict.message}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{conflict.time}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SCHEDULE SHARING PANEL */}
            {shareMode && (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800 p-4 animate-slideDown">
                    <h3 className="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined">share</span>
                        {t.shareSchedule}
                    </h3>
                    <div className="space-y-2">
                        {filteredUsers.map(user => (
                            <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={sharedWith.includes(user.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSharedWith([...sharedWith, user.id]);
                                        } else {
                                            setSharedWith(sharedWith.filter(id => id !== user.id));
                                        }
                                    }}
                                    className="w-4 h-4 rounded" 
                                />
                                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{user.name}</span>
                            </label>
                        ))}
                    </div>
                    <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors font-medium">
                        Share with {sharedWith.length} Staff
                    </button>
                </div>
            )}

            {/* AUTO-SCHEDULE SUGGESTIONS */}
            {autoScheduleEnabled && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800 p-4 animate-slideDown">
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined">smart_toy</span>
                        {t.autoSchedule} - Suggested Slots
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {suggestedSlots.map((slot, idx) => (
                            <div key={idx} className="bg-white dark:bg-neutral-900 rounded p-3 border border-emerald-100 dark:border-emerald-900 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-medium text-neutral-800 dark:text-neutral-200">{slot.time}</p>
                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-emerald-600" style={{width: `${slot.score}%`}}></div>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{slot.score}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Original Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Avatar 
                            name={selectedUserObj?.name} 
                            color={isViewingSelf ? 'brand' : 'colorful'} 
                            size={48}
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 leading-tight">
                                {isViewingSelf ? t.mySchedule : `${t.scheduleFor} ${selectedUserObj?.name}`}
                            </h1>
                            <p className="text-neutral-500 text-sm">
                                {selectedUserObj?.designation} • {isViewingSelf ? t.manageAvail : t.viewingAvail}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-3 w-full sm:w-auto">
                    
                    {/* All Staff Meeting Button */}
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <Label className="font-semibold text-[10px] uppercase text-neutral-400 tracking-wider">{t.quickAction}</Label>
                        <Button 
                            appearance="subtle"
                            icon={<span className="material-symbols-outlined filled text-blue-600">campaign</span>}
                            onClick={handleOpenGlobalRequest}
                            className="!bg-blue-50 hover:!bg-blue-100 !text-blue-700 !border !border-blue-200 shadow-sm dark:!bg-blue-900/20 dark:!text-blue-300 dark:!border-blue-800 whitespace-nowrap justify-center w-full sm:w-auto"
                        >
                            {t.callStaffMeeting}
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 mx-2 hidden sm:block mb-1"></div>

                    {/* Dropdown */}
                    <div className="flex flex-col gap-1 w-full sm:min-w-[240px]">
                        <Label className="font-semibold text-[10px] uppercase text-neutral-400 tracking-wider">{t.switchView}</Label>
                        <Dropdown 
                            value={selectedUserObj?.name || t.selectUser}
                            selectedOptions={[selectedUserId]}
                            onOptionSelect={(_, data) => setSelectedUserId(data.optionValue as string)}
                            className="w-full"
                        >
                            {filteredUsers.map(u => (
                                <Option key={u.id} value={u.id} text={u.name}>
                                    <div className="flex items-center gap-2 w-full py-1">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">{u.name}</span>
                                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                <span className="uppercase font-bold text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1 rounded border border-neutral-200 dark:border-neutral-700">
                                                    {u.role}
                                                </span>
                                                <span>{u.designation}</span>
                                            </span>
                                        </div>
                                        {u.id === myId && (
                                            <span className="ml-auto text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider">{t.you}</span>
                                        )}
                                    </div>
                                </Option>
                            ))}
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-sm mb-4 bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-lg inline-flex">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-neutral-600 dark:text-neutral-300">{t.legend.busy}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <span className="text-neutral-600 dark:text-neutral-300">{t.legend.tentative}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-neutral-600 dark:text-neutral-300">{t.legend.available}</span>
                </div>
            </div>

            {/* Board - PASSED LANG PROP HERE */}
            <ScheduleBoard 
                slots={slots} 
                loading={loading} 
                onRequest={handleOpenSlotRequest}
                isViewingSelf={isViewingSelf}
                lang={lang} 
            />

            {/* Received Requests - PASSED LANG PROP HERE */}
            {isViewingSelf && (
                <div className="mt-10 animate-slideUp">
                    <IncomingRequests userId={myId} lang={lang} />
                </div>
            )}

            {/* REQUEST MODAL OVERLAY */}
            {isModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-slideUp relative">
                        
                        <button 
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>

                        <div className={`p-6 border-b border-neutral-100 dark:border-neutral-800 ${!targetSlot ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 pr-8">
                                {targetSlot ? (
                                    targetSlot.status === 'available' ? t.modal.bookMeeting : t.modal.requestUrgent
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-blue-600">campaign</span>
                                        {t.modal.allStaff}
                                    </>
                                )}
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1 pr-6">
                                {targetSlot ? (
                                    <>{t.modal.with} <span className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedUserObj?.name}</span> {t.modal.at} <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 rounded">{targetSlot.time}</span></>
                                ) : (
                                    t.modal.broadcastDesc
                                )}
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
                            
                            {!targetSlot && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{t.modal.dateTime}</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="date" 
                                            required 
                                            value={customDate}
                                            onChange={e => setCustomDate(e.target.value)}
                                            className="flex-1 p-2 border border-neutral-300 rounded dark:bg-neutral-800 dark:border-neutral-700" 
                                        />
                                        <input 
                                            type="time" 
                                            required 
                                            value={customTime}
                                            onChange={e => setCustomTime(e.target.value)}
                                            className="w-32 p-2 border border-neutral-300 rounded dark:bg-neutral-800 dark:border-neutral-700" 
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{t.modal.meetingType}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setReqType('internal')}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                            reqType === 'internal' 
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' 
                                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1 text-center">
                                            <span className="material-symbols-outlined text-[20px]">groups</span>
                                            <span>{t.modal.internal}</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReqType('in-person')}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                            reqType === 'in-person' 
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300' 
                                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1 text-center">
                                            <span className="material-symbols-outlined text-[20px]">person</span>
                                            <span>{t.modal.inPerson}</span>
                                        </div>
                                    </button>
                                </div>
                                <p className="text-xs text-neutral-400 mt-1">
                                    {reqType === 'internal' ? t.modal.internalDesc : t.modal.inPersonDesc}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{t.modal.subject}</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder={t.modal.subjectPlace}
                                    className="w-full p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                    value={reqSubject}
                                    onChange={e => setReqSubject(e.target.value)}
                                />
                            </div>

                            {targetSlot && targetSlot.status !== 'available' && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg text-xs text-red-700 dark:text-red-300 flex gap-2">
                                    <span className="material-symbols-outlined text-[16px]">warning</span>
                                    <span>{t.modal.busyWarning} <b>{targetSlot.status}</b>. {t.modal.busyWarning2}</span>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button 
                                    type="button" 
                                    appearance="outline" 
                                    className="flex-1"
                                    onClick={handleCloseModal}
                                    disabled={submitStatus !== 'idle'}
                                >
                                    {t.modal.cancel}
                                </Button>
                                <Button 
                                    type="submit" 
                                    appearance={submitStatus === 'sent' ? 'outline' : 'primary'}
                                    className="flex-1"
                                    disabled={submitStatus !== 'idle'}
                                    style={submitStatus === 'sent' ? { 
                                        backgroundColor: '#262626', 
                                        color: 'white', 
                                        borderColor: '#262626'
                                    } : undefined}
                                >
                                    {submitStatus === 'loading' ? t.modal.sending : 
                                     submitStatus === 'sent' ? t.modal.sent : 
                                     (targetSlot ? t.modal.sendReq : t.modal.broadcast)}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleContent;