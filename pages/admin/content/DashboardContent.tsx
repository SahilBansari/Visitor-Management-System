import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
    getFilteredDashboardData, 
    type DashboardData,
    type MeetingAlertData,
    type DateRange
} from '../../../utils/mockDatabase';
import MeetingAlert from '../../../components/admin/dashboard/MeetingAlert';
import NotificationPanel from '../../../components/admin/dashboard/NotificationPanel';
import { useTheme } from '../../../contexts/ThemeContext';
import { Language } from '../../../App';

interface DashboardContentProps {
    lang: Language;
    onNavigate?: (page: string) => void;
}

// Mock Schedule Data for Admin
const MOCK_ADMIN_SCHEDULE = [
    { time: '10:00 AM', title: 'System Security Review', status: 'Ongoing' },
    { time: '02:00 PM', title: 'Department Head Sync', status: 'Next' },
    { time: '04:30 PM', title: 'Weekly Database Backup', status: 'Next' },
    { time: '06:00 PM', title: 'Server Maintenance', status: 'Pending' }
];

const DashboardContent: React.FC<DashboardContentProps> = ({ lang, onNavigate }) => {
    const { tenant, themeColors } = useTheme(); 
    const [dateRange, setDateRange] = useState<DateRange>('Today');
    const [data, setData] = useState<DashboardData | null>(null);
    const [meetingAlert, setMeetingAlert] = useState<MeetingAlertData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (tenant) {
                const dashData = await getFilteredDashboardData(dateRange, tenant);
                setData(dashData);
            }
            // Mock alert for demo
            setMeetingAlert({ 
                title: tenant === 'agriculture' ? 'Kharif Crop Review' : 'Flood Protocol', 
                time: '12 mins', 
                location: 'Conference Hall A' 
            });
            setLoading(false);
        };
        fetchData();
    }, [dateRange, tenant]);

    if (loading || !data) {
        return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;
    }

    // --- Chart Logic (Preserved) ---
    const chartColor = themeColors.chartMain; 

    const visitorTrendOption = {
        title: { text: 'Visitor Traffic Trend', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.trendChart.xAxis },
        yAxis: { type: 'value' },
        series: [{ 
            data: data.trendChart.data, 
            type: data.trendChart.type, 
            smooth: true, 
            color: chartColor, 
            areaStyle: { opacity: 0.1 }
        }]
    };

    const departmentOption = {
        title: { text: 'Visits by Dept', left: 'center' },
        tooltip: { trigger: 'item' },
        series: [
            {
                name: 'Department',
                type: 'pie',
                radius: ['40%', '70%'],
                data: data.departmentData,
                itemStyle: { borderRadius: 5 },
                emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
            }
        ]
    };

    // --- Schedule Logic (HOD Style) ---
    // Filter to show only 'Ongoing' and 'Next' tasks, limit to 3
    const ongoingTasks = MOCK_ADMIN_SCHEDULE.filter(item => item.status === 'Ongoing');
    const futureTasks = MOCK_ADMIN_SCHEDULE.filter(item => item.status !== 'Ongoing' && item.status !== 'Completed');
    const displayTasks = [...ongoingTasks, ...futureTasks].slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Header Controls: Title Left, Date Buttons Right */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${themeColors.text}`}>Admin Dashboard</h2>
                    <p className="text-gray-500 text-sm">
                        Real-time overview for <span className={`font-bold capitalize ${themeColors.secondary}`}>{tenant} Department</span>.
                    </p>
                </div>
                
                {/* Date Range Buttons */}
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    {(['Today', 'Yesterday', 'This Week'] as DateRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                dateRange === range 
                                ? `${themeColors.primary} text-white shadow-sm` 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Split Row: Notifications + Schedule */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                
                {/* 1. Notification Panel (50%) */}
                <div className="w-full lg:w-1/2">
                    <NotificationPanel />
                </div>

                {/* 2. My Schedule Card (50%) */}
                <div className="w-full lg:w-1/2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-700">My Schedule</h3>
                            <button 
                                onClick={() => onNavigate?.('schedule')}
                                className={`text-sm font-bold hover:underline ${themeColors.secondary} flex items-center gap-1`}
                            >
                                View Calendar
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
                                                    {item.status}
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

            {/* Alert Section */}
            {meetingAlert && <MeetingAlert data={meetingAlert} />}

            {/* KPI Cards (Preserved) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Visitors" value={data.kpi.visitors} icon="group" 
                    iconBg={tenant === 'agriculture' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} />
                <KpiCard title="Live Inside" value={data.kpi.liveInside} icon="input" 
                     iconBg={tenant === 'agriculture' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'} />
                <KpiCard title="Overstay Alerts" value={data.kpi.overstay} icon="warning" 
                     iconBg="bg-red-100 text-red-600" />
                <KpiCard title="System Health" value={data.kpi.health} icon="health_and_safety" 
                     iconBg="bg-purple-100 text-purple-600" />
            </div>

            {/* Charts Area (Preserved) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`bg-white p-6 rounded-xl shadow-sm ${themeColors.border} border`}>
                    <ReactECharts option={visitorTrendOption} style={{ height: '350px' }} />
                </div>
                <div className={`bg-white p-6 rounded-xl shadow-sm ${themeColors.border} border`}>
                    <ReactECharts option={departmentOption} style={{ height: '350px' }} />
                </div>
            </div>
        </div>
    );
};

const KpiCard: React.FC<{ title: string; value: string; icon: string; iconBg: string }> = ({ title, value, icon, iconBg }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${iconBg}`}>
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
            </div>
        </div>
    );
}

export default DashboardContent;