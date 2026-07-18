import React, { useState, useEffect } from 'react';
import type { Language } from '../../../App';
import { Button, Avatar, Spinner } from '@fluentui/react-components';
import { EChartsOption } from 'echarts';
import EChartsWrapper from '../../../components/admin/charts/EChartsWrapper';
import { getHodDashboardData, HodDashboardData } from '../../../utils/mockDatabase';
import MeetingAlert from '../../../components/admin/dashboard/MeetingAlert';
import NotificationPanel from '../../../components/admin/dashboard/NotificationPanel';
import { useTheme } from '../../../contexts/ThemeContext';

interface Props { 
    lang: Language;
    onNavigate?: (page: string) => void;
}

const content = {
    en: {
        title: "Dashboard",
        subtitle: "Overview of Activities",
        activeVisitors: "Active Visitors",
        todaysTotal: "Today's Total",
        pendingActions: "Pending Actions",
        securityLevel: "Security Level",
        visitorTraffic: "Visitor Traffic Trend",
        pendingApprovals: "Pending Approvals",
        requests: "Requests",
        approve: "Approve",
        decline: "Decline",
        allCaughtUp: "All caught up! No pending approvals.",
        liveOccupancy: "Live Occupancy",
        occupancyDesc: "Real-time crowd density in dept.",
        totalCapacity: "Total Capacity",
        mySchedule: "My Schedule",
        viewCalendar: "View Calendar",
        viewReport: "View Report",
        nextTask: "Next Task",
        ongoing: "Ongoing"
    },
    hi: {
        title: "डैशबोर्ड",
        subtitle: "गतिविधियों का अवलोकन",
        activeVisitors: "सक्रिय आगंतुक",
        todaysTotal: "आज का कुल",
        pendingActions: "लंबित कार्रवाई",
        securityLevel: "सुरक्षा स्तर",
        visitorTraffic: "आगंतुक यातायात रुझान",
        pendingApprovals: "लंबित स्वीकृतियां",
        requests: "अनुरोध",
        approve: "स्वीकृत करें",
        decline: "अस्वीकार करें",
        allCaughtUp: "सब हो गया! कोई लंबित स्वीकृति नहीं।",
        liveOccupancy: "लाइव अधिभोग",
        occupancyDesc: "विभाग में रीयल-टाइम भीड़ घनत्व।",
        totalCapacity: "कुल क्षमता",
        mySchedule: "मेरी समय सारिणी",
        viewCalendar: "कैलेंडर देखें",
        viewReport: "रिपोर्ट देखें",
        nextTask: "अगला कार्य",
        ongoing: "चल रहा है"
    },
    mr: {
        title: "डॅशबोर्ड",
        subtitle: "क्रियाकलापांचा आढावा",
        activeVisitors: "सक्रिय अभ्यागत",
        todaysTotal: "आजचे एकूण",
        pendingActions: "प्रलंबित क्रिया",
        securityLevel: "सुरक्षा स्तर",
        visitorTraffic: "अभ्यागत रहदारीचा कल",
        pendingApprovals: "प्रलंबित मंजुरी",
        requests: "विनंत्या",
        approve: "मंजूर करा",
        decline: "नाकारा",
        allCaughtUp: "सर्व काही अद्ययावत! कोणत्याही मंजुरी प्रलंबित नाहीत.",
        liveOccupancy: "थेट वहिवाट",
        occupancyDesc: "विभागातील रिअल-टाइम गर्दीची घनता.",
        totalCapacity: "एकूण क्षमता",
        mySchedule: "माझे वेळापत्रक",
        viewCalendar: "कॅलेंडर पहा",
        viewReport: "अहवाल पहा",
        nextTask: "पुढील कार्य",
        ongoing: "चालू आहे"
    }
};

const KpiCard: React.FC<{ title: string; value: string | number; icon: string; colorClass: string; trend?: string }> = ({ title, value, icon, colorClass, trend }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800 shadow-sm flex items-start justify-between group hover:shadow-md transition-all duration-300">
        <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">{title}</p>
            <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 leading-none">{value}</h3>
                {trend && <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded mb-1">{trend}</span>}
            </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
    </div>
);

const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">{title}</h3>
        {action}
    </div>
);

const HodDashboardContent: React.FC<Props> = ({ lang, onNavigate }) => {
    const t = content[lang] || content['en'];
    const { tenant, themeColors } = useTheme();
    const [data, setData] = useState<HodDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Chart Options
    const [trafficOpt, setTrafficOpt] = useState<EChartsOption>({});
    const [occupancyOpt, setOccupancyOpt] = useState<EChartsOption>({});

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await getHodDashboardData('dept_hydrology');
            setData(res);

            // Use theme color for charts
            const mainColor = themeColors.chartMain;

            setTrafficOpt({
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 12, borderRadius: 8 },
                grid: { left: '0%', right: '0%', top: '10%', bottom: '0%', containLabel: true },
                xAxis: { 
                    type: 'category', 
                    boundaryGap: false,
                    data: res.weeklyTraffic.map(d => d.day),
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: '#9CA3AF', margin: 15 }
                },
                yAxis: { 
                    type: 'value', 
                    splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
                    axisLabel: { show: false }
                },
                series: [{
                    name: 'Visitors',
                    type: 'line',
                    smooth: true,
                    showSymbol: false,
                    lineStyle: { width: 4, color: mainColor },
                    areaStyle: {
                        color: {
                            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [{ offset: 0, color: mainColor + '4D' }, { offset: 1, color: mainColor + '00' }]
                        }
                    },
                    data: res.weeklyTraffic.map(d => d.count)
                }]
            });

            const occupancyRate = Math.round((res.stats.deptOccupancy / res.stats.totalCapacity) * 100);
            setOccupancyOpt({
                series: [{
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    splitNumber: 5,
                    itemStyle: { color: mainColor },
                    progress: { show: true, roundCap: true, width: 12 },
                    pointer: { show: false },
                    axisLine: { roundCap: true, lineStyle: { width: 12, color: [[1, '#E0E7FF']] } },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    title: { show: false },
                    detail: { 
                        backgroundColor: '#fff', 
                        borderColor: '#999', 
                        borderWidth: 0, 
                        width: '60%', 
                        lineHeight: 40, 
                        height: 40, 
                        borderRadius: 8, 
                        offsetCenter: [0, '35%'], 
                        valueAnimation: true, 
                        formatter: '{value}%', 
                        color: '#1F2937',
                        fontSize: 24,
                        fontWeight: 'bold'
                    },
                    data: [{ value: occupancyRate }]
                }]
            });

            setLoading(false);
        };
        load();
    }, [tenant, themeColors]);

    if (loading || !data) return (
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
            <Spinner size="large" appearance="primary" />
            <p className="text-neutral-400 text-sm animate-pulse">Gathering Department Insights...</p>
        </div>
    );

    // Filter Tasks: Ongoing + Next
    const ongoingTasks = data.mySchedule.filter(item => item.status === 'Ongoing');
    const futureTasks = data.mySchedule.filter(item => item.status !== 'Ongoing' && item.status !== 'Completed');
    const displayTasks = [...ongoingTasks, ...futureTasks].slice(0, 3); // Show top 3 relevant tasks

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
            
            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2 border-b ${themeColors.border}`}>
                <div>
                    <h1 className={`text-2xl font-bold ${themeColors.text} tracking-tight`}>{t.title}</h1>
                    <p className="text-neutral-500 text-sm">
                        {t.subtitle} - <span className="font-bold capitalize">{tenant} Dept</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                     <MeetingAlert />
                     <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block"></div>
                     <div className="flex items-center gap-2">
                         <Avatar name="HOD" size={32} color="brand" />
                         <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:block">
                             {tenant === 'agriculture' ? 'Director (Agri)' : 'Chief Engineer'}
                         </span>
                     </div>
                </div>
            </div>

            {/* Top Row: Notifications + My Schedule (Side by Side) */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                
                {/* 1. Notifications Panel (50%) */}
                <div className="w-full lg:w-1/2">
                    <NotificationPanel />
                </div>

                {/* 2. My Schedule Card (50%) */}
                <div className="w-full lg:w-1/2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-700">{t.mySchedule}</h3>
                            <button 
                                onClick={() => onNavigate?.('schedule')}
                                className={`text-sm font-bold hover:underline ${themeColors.secondary} flex items-center gap-1`}
                            >
                                {t.viewCalendar}
                                <span className="material-symbols-outlined text-sm">calendar_month</span>
                            </button>
                        </div>
                        
                        <div className="p-4 flex-1 overflow-y-auto">
                            <div className="space-y-0 relative h-full">
                                {displayTasks.length > 0 && <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-neutral-200 dark:bg-neutral-700"></div>}

                                {displayTasks.map((item, i) => (
                                    <div key={i} className="relative pl-10 pb-6 last:pb-0 group">
                                        <div className={`absolute left-[13px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900 z-10 shadow-sm transition-colors ${
                                            item.status === 'Completed' ? 'bg-emerald-500' : 
                                            item.status === 'Ongoing' ? 'bg-blue-500' : 'bg-amber-400'
                                        }`}></div>
                                        
                                        <div className="p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-100 dark:hover:border-neutral-700">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-neutral-500 font-mono">{item.time}</span>
                                                <span className={`text-[10px] px-1.5 rounded-full font-bold ${
                                                    item.status === 'Ongoing' ? 'bg-blue-50 text-blue-600 animate-pulse' : 
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {item.status === 'Ongoing' ? t.ongoing : t.nextTask}
                                                </span>
                                            </div>
                                            <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                                
                                {displayTasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <span className="material-symbols-outlined text-3xl mb-2">event_available</span>
                                        <p className="text-sm">No upcoming tasks</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <KpiCard 
                    title={t.activeVisitors}
                    value={data.stats.deptOccupancy} 
                    icon="person_pin" 
                    colorClass={tenant === 'agriculture' ? 'bg-green-600' : 'bg-cyan-600'}
                    trend={`Cap: ${data.stats.totalCapacity}`}
                />
                <KpiCard 
                    title={t.todaysTotal}
                    value={data.stats.todaysVisits} 
                    icon="groups" 
                    colorClass={tenant === 'agriculture' ? 'bg-amber-600' : 'bg-blue-600'}
                    trend="+12% vs Avg"
                />
                <KpiCard 
                    title={t.pendingActions}
                    value={data.stats.pendingRequests} 
                    icon="pending_actions" 
                    colorClass="bg-orange-500"
                />
                 <KpiCard 
                    title={t.securityLevel}
                    value="Normal" 
                    icon="verified_user" 
                    colorClass="bg-emerald-500"
                />
            </div>

            {/* Bottom Row: Traffic Chart & Occupancy/Pending List */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Traffic Chart (2/3 width) */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-sm">
                        <SectionHeader 
                            title={t.visitorTraffic}
                            action={<Button appearance="subtle" size="small">{t.viewReport}</Button>} 
                        />
                        <div className="h-[280px] w-full">
                            <EChartsWrapper option={trafficOpt} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Occupancy & Approvals (1/3 width) */}
                <div className="space-y-6">
                    
                    {/* Live Occupancy Gauge */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-sm relative overflow-hidden">
                         <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200 mb-2 z-10 relative">{t.liveOccupancy}</h3>
                         <p className="text-xs text-neutral-500 mb-4 z-10 relative">{t.occupancyDesc}</p>
                         <div className="h-[180px] -mt-4">
                            <EChartsWrapper option={occupancyOpt} />
                         </div>
                         <div className="text-center -mt-8">
                             <p className="text-xs font-medium text-neutral-400">{t.totalCapacity}: {data.stats.totalCapacity}</p>
                         </div>
                    </div>

                    {/* Pending Approvals List */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                             <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-200">{t.pendingApprovals}</h3>
                             <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold">{data.pendingApprovals.length} {t.requests}</span>
                        </div>
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[300px] overflow-y-auto">
                            {data.pendingApprovals.map(req => (
                                <div key={req.id} className="p-4 flex flex-col gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={req.name} size={32} color="colorful" />
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">{req.name}</h4>
                                            <p className="text-xs text-neutral-500 truncate">{req.type} • {req.purpose}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full mt-1">
                                        <Button appearance="primary" size="small" className="flex-1">{t.approve}</Button>
                                        <Button appearance="outline" size="small" className="flex-1">{t.decline}</Button>
                                    </div>
                                </div>
                            ))}
                            {data.pendingApprovals.length === 0 && (
                                <div className="p-10 text-center flex flex-col items-center text-neutral-400">
                                    <span className="material-symbols-outlined text-[32px] mb-2 text-neutral-300">check_circle</span>
                                    <p>{t.allCaughtUp}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HodDashboardContent;