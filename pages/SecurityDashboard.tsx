import React, { useState, useEffect } from 'react';

// Mock Data for AI Alerts
const mockAlerts = [
  { id: 1, time: '14:23:01', type: 'capacity', location: 'Gate 1 Waiting Area', message: '⚠️ Alert: Capacity exceeded (35/30 people detected)', severity: 'high' },
  { id: 2, time: '14:20:15', type: 'access', location: 'Server Room Corridor', message: 'Unauthorized person detected in restricted zone', severity: 'critical' },
  { id: 3, time: '14:15:00', type: 'overstay', location: 'Meeting Room B', message: 'Visitor V-892 overstayed by 45 minutes', severity: 'medium' },
  { id: 4, time: '14:05:22', type: 'vehicle', location: 'VIP Parking', message: 'Unrecognized vehicle plate detected: UK07 AB1234', severity: 'low' },
];

const SecurityDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col bg-neutral-100 dark:bg-neutral-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">admin_panel_settings</span>
            SUDK Advanced Security Command Center
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Live Surveillance & AI Analytics Dashboard</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold text-neutral-800 dark:text-neutral-200">{currentTime}</div>
          <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* CCTV Grid (3 Columns) */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4 h-full">
          {[
            { id: 'CAM-01', name: 'Main Entrance Gate' },
            { id: 'CAM-02', name: 'Reception Desk' },
            { id: 'CAM-03', name: 'Corridor A (VIP)' },
            { id: 'CAM-04', name: 'Parking Exit ANPR' }
          ].map((cam, i) => (
            <div key={cam.id} className="relative bg-black rounded-xl overflow-hidden shadow-md flex flex-col border border-neutral-700">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                REC | {cam.id} - {cam.name}
              </div>
              <div className="absolute bottom-3 right-3 z-10 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white">
                {currentTime}
              </div>
              {/* Placeholder for actual WebRTC/RTSP stream */}
              <div className="flex-1 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-neutral-700 text-6xl">videocam</span>
                <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none"></div>
                {i === 0 && (
                   // Simulate Bounding Box AI detection on one camera
                   <div className="absolute top-1/4 left-1/3 w-32 h-48 border-2 border-green-500 bg-green-500/10 flex flex-col justify-between">
                     <span className="bg-green-500 text-white text-[10px] px-1 w-max">Person 98%</span>
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Alerts Feed (1 Column) */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 flex flex-col h-full">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-t-xl">
            <h3 className="font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
              <span className="material-symbols-outlined text-orange-500">warning</span>
              Live AI Alerts
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border text-sm ${getSeverityColor(alert.severity)}`}>
                <div className="flex justify-between items-start mb-1 font-semibold">
                  <span>{alert.location}</span>
                  <span className="text-xs opacity-80">{alert.time}</span>
                </div>
                <p className="mt-1">{alert.message}</p>
              </div>
            ))}
            {/* TODO: Integrate WebSocket to push new alerts dynamically */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecurityDashboard;