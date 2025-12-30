import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useScheduleEvents } from '../hooks/useDatabase';
import { ScheduleEvent, EventType, EVENT_COLORS, EVENT_LABELS } from '../types';
import { Clock, AlertCircle, Loader2, X, FileText } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { events, loading } = useScheduleEvents();
  const [stats, setStats] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<ScheduleEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  useEffect(() => {
    // Calculate stats for chart
    const typeCounts = events.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.keys(typeCounts).map(key => ({
      name: EVENT_LABELS[key as EventType] || key,
      value: typeCounts[key]
    }));
    setStats(data);

    // Filter upcoming (next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcomingEvents = events
      .filter(e => {
        const d = parseISO(e.startTime);
        return d >= now && d <= nextWeek && !e.isCompleted;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);

    setUpcoming(upcomingEvents);
  }, [events]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getUserName = () => {
    // Lấy tên từ user metadata hoặc email
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Lấy phần trước @ của email
    }
    return 'Sinh Viên';
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {getUserName()}!</h1>
        <p className="opacity-90">Bạn có {upcoming.length} công việc sắp tới trong tuần này. Hãy tập trung nhé.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 md:col-span-2">
           <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500"/> Lịch trình sắp tới
           </h2>
           <div className="space-y-3">
             {upcoming.length === 0 ? (
               <p className="text-gray-500 italic">Không có sự kiện sắp tới. Hãy nghỉ ngơi!</p>
             ) : (
               upcoming.map(event => (
                 <div 
                   key={event.id} 
                   onClick={() => setSelectedEvent(event)}
                   className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border-l-4 border-blue-500 cursor-pointer"
                 >
                    <div>
                      <h3 className="font-semibold text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {isToday(parseISO(event.startTime)) ? 'Hôm nay' : format(parseISO(event.startTime), 'dd MMM', { locale: vi })} lúc {format(parseISO(event.startTime), 'HH:mm')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${EVENT_COLORS[event.type]}`}>
                      {EVENT_LABELS[event.type]}
                    </span>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500"/> Deadline sắp đến
             </h2>
             {events.filter(e => e.type === EventType.DEADLINE && !e.isCompleted).length > 0 ? (
               <ul className="space-y-3">
                 {events.filter(e => e.type === EventType.DEADLINE && !e.isCompleted).slice(0, 5).map(e => (
                   <li key={e.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">{e.title}</span>
                      <span className="text-red-500 font-bold">{format(parseISO(e.endTime), 'dd MMM', { locale: vi })}</span>
                   </li>
                 ))}
               </ul>
             ) : (
                <p className="text-gray-500">Không có deadline cần gấp.</p>
             )}
          </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className={`p-6 text-white rounded-t-2xl ${
              selectedEvent.type === 'CLASS' ? 'bg-blue-600' :
              selectedEvent.type === 'EXAM' ? 'bg-red-600' :
              selectedEvent.type === 'DEADLINE' ? 'bg-orange-600' :
              'bg-green-600'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                  <p className="text-white/90 mt-1">{EVENT_LABELS[selectedEvent.type]}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 font-medium">Thời gian</p>
                  <p className="text-gray-900 font-semibold">
                    {format(parseISO(selectedEvent.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })} - {format(parseISO(selectedEvent.endTime), 'HH:mm', { locale: vi })}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Mô tả</p>
                    <p className="text-gray-900 mt-1">{selectedEvent.description}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-2">Trạng thái</p>
                <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedEvent.isCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedEvent.isCompleted ? '✓ Đã hoàn thành' : 'Chưa hoàn thành'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;