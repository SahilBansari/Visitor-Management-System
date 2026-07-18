import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNotification } from '../../../contexts/NotificationContext';

const NotificationPanel: React.FC = () => {
  const { themeColors, tenant } = useTheme();
  const { recentNotifications, notifications, markAllAsRead } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dynamic color for the "dots" based on tenant
  const dotColor = tenant === 'agriculture' ? 'text-green-500' : 'text-cyan-500';

  const getTypeIcon = (type: string) => {
    switch (type) {
        case 'alert': return 'error';
        case 'success': return 'check_circle';
        default: return 'info';
    }
  };

  return (
    <>
      {/* --- Main Card (Dashboard Widget) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6 h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-700">Recent Alerts</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`text-sm font-bold hover:underline ${themeColors.secondary} flex items-center gap-1`}
          >
            View All
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>

        {/* Short List */}
        <div className="divide-y divide-slate-50">
          {recentNotifications.map((item) => (
            <div 
              key={item.id} 
              className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 items-start ${item.isUnread ? 'bg-slate-50/30' : ''}`}
            >
              <div className={`mt-1.5 ${dotColor}`}>
                 <span className="material-symbols-outlined text-[10px] align-middle">circle</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 leading-snug">{item.title}</p>
                <div className="flex gap-2 mt-1">
                    <p className="text-xs text-gray-400 font-medium">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- View All Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-scaleIn">
                
                {/* Modal Header */}
                <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${themeColors.light}`}>
                    <div>
                        <h2 className={`text-xl font-bold ${themeColors.text}`}>Notifications Archive</h2>
                        <p className="text-xs text-gray-500">History of all alerts and system messages.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 rounded-full hover:bg-black/5 text-gray-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="overflow-y-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm text-xs uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Message</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {notifications.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <span className={`material-symbols-outlined text-lg ${
                                            item.type === 'alert' ? 'text-red-500' : 
                                            item.type === 'success' ? 'text-green-500' : 'text-blue-500'
                                        }`}>
                                            {getTypeIcon(item.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-medium text-gray-800">
                                        {item.title}
                                        {item.isUnread && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>}
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">{item.date}</td>
                                    <td className="px-6 py-3 text-right text-gray-500 font-mono">{item.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className={`px-6 py-2 rounded-lg font-bold text-sm ${themeColors.primary} text-white shadow-md hover:opacity-90 transition-opacity`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default NotificationPanel;