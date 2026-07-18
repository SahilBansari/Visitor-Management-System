import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
    getFilteredDashboardData, 
    type DashboardData,
    type MeetingAlertData,
    type DateRange
} from '../../../utils/mockDatabase';
import MeetingAlert from '../../../components/admin/dashboard/MeetingAlert';
import NotificationPanel from '../../../components/admin/dashboard/NotificationPanel'; // Imported
import { useTheme } from '../../../contexts/ThemeContext'; // Imported Theme Hook
import { usePendingVisitorRequests } from '../../../hooks/usePendingVisitorRequests';
import { Language } from '../../../App';

interface DashboardContentProps {
    lang: Language;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ lang }) => {
    const { tenant, themeColors } = useTheme(); // Use the hook
    const [dateRange, setDateRange] = useState<DateRange>('Today');
    const [data, setData] = useState<DashboardData | null>(null);
    const [meetingAlert, setMeetingAlert] = useState<MeetingAlertData | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Auto-fetch pending requests and generate notifications
    const { requests: pendingRequests } = usePendingVisitorRequests(true);

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

    // Chart logic tailored to tenant colors
    const chartColor = tenant === 'agriculture' ? '#15803d' : '#0891b2'; // Green vs Cyan

    const visitorTrendOption = {
        title: { text: 'Visitor Traffic Trend', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.trendChart.xAxis },
        yAxis: { type: 'value' },
        series: [{ 
            data: data.trendChart.data, 
            type: data.trendChart.type, 
            smooth: true, 
            color: chartColor, // Dynamic Color
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

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-2xl font-bold ${themeColors.text}`}>Admin Dashboard</h2>
                    <p className="text-gray-500 text-sm">Real-time overview for <span className={`font-bold capitalize ${themeColors.secondary}`}>{tenant} Department</span>.</p>
                </div>
                
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

            {/* Notification Panel (Added here) */}
            <NotificationPanel />

            {/* Alert Section */}
            {meetingAlert && <MeetingAlert data={meetingAlert} />}

            {/* KPI Cards */}
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

            {/* Charts Area */}
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