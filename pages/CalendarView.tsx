import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useScheduleEvents, useSubjects } from '../hooks/useDatabase';
import { ScheduleEvent, EventType, EVENT_COLORS, Subject, EVENT_LABELS } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Trash, Plus, Loader2, X, MapPin, AlignLeft, Edit } from 'lucide-react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const CalendarView = () => {
  const { user } = useAuth();
  const { events, loading, createEvent, updateEvent, deleteEvent } = useScheduleEvents();
  const { subjects } = useSubjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null); // For viewing details
  
  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
    type: EventType.CLASS,
    startTime: '',
    endTime: ''
  });

  // Helper to format date for display: 20/10/2023 09:00
  const formatDisplayDate = (isoString: string) => {
    if (!isoString) return '';
    return format(parseISO(isoString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  // Helper to format date for input value: 2023-10-20T09:00
  const formatInputDate = (date: Date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const nextPeriod = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 7));
  };

  const prevPeriod = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -7));
  };

  const getDayEvents = (day: Date) => {
    return events.filter(e => isSameDay(parseISO(e.startTime), day));
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      if (newEvent.id) {
        // Update existing event
        await updateEvent(newEvent.id, {
          title: newEvent.title,
          description: newEvent.description,
          startTime: new Date(newEvent.startTime).toISOString(),
          endTime: new Date(newEvent.endTime).toISOString(),
          type: newEvent.type as EventType,
          priority: newEvent.priority as any,
          isCompleted: newEvent.isCompleted || false,
          subjectId: newEvent.subjectId
        });
      } else {
        // Create new event
        await createEvent({
          subjectId: newEvent.subjectId,
          title: newEvent.title,
          description: newEvent.description || '',
          startTime: new Date(newEvent.startTime).toISOString(),
          endTime: new Date(newEvent.endTime).toISOString(),
          type: newEvent.type as EventType || EventType.CLASS,
          priority: newEvent.priority as any || 'MEDIUM',
          isCompleted: newEvent.isCompleted || false
        });
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert('Lỗi khi lưu sự kiện: ' + (error as any).message);
    }
  };

  const handleDeleteEvent = async (id: string) => {
      if(confirm("Xóa sự kiện này?")) {
          try {
            await deleteEvent(id);
            setSelectedEvent(null); // Close detail modal
          } catch (error) {
            alert('Lỗi khi xóa sự kiện: ' + (error as any).message);
          }
      }
  }

  const handleEditClick = () => {
    if (!selectedEvent) return;
    setNewEvent({
        ...selectedEvent,
        // Convert ISO to input-friendly format
        startTime: formatInputDate(parseISO(selectedEvent.startTime)),
        endTime: formatInputDate(parseISO(selectedEvent.endTime))
    });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleCellClick = (date: Date) => {
    resetForm();
    // Set default time to 09:00 - 10:00 on clicked date
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(date);
    end.setHours(10, 0, 0, 0);
    
    setNewEvent({
        type: EventType.CLASS,
        startTime: formatInputDate(start),
        endTime: formatInputDate(end)
    });
    setIsModalOpen(true);
  }

  const resetForm = () => {
    setNewEvent({
        type: EventType.CLASS,
        startTime: formatInputDate(new Date()),
        endTime: formatInputDate(new Date())
    });
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: vi });
    const endDate = endOfWeek(monthEnd, { locale: vi });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const dayEvents = getDayEvents(day);
        const cloneDay = day;

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] bg-white border border-gray-100 p-2 transition-colors cursor-pointer hover:bg-gray-50 ${
              !isSameMonth(day, monthStart)
                ? 'bg-gray-50 text-gray-400'
                : 'text-gray-700'
            } ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
            onClick={() => handleCellClick(cloneDay)}
          >
            <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-blue-600 bg-blue-100 px-2 rounded-full' : ''}`}>{formattedDate}</span>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[90px]">
              {dayEvents.map((ev) => (
                <div 
                    key={ev.id} 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening add modal
                        setSelectedEvent(ev);
                    }}
                    className={`text-xs p-1 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${EVENT_COLORS[ev.type]}`}
                >
                  <span className="font-medium">{format(parseISO(ev.startTime), 'HH:mm')}</span> {ev.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">{rows}</div>;
  };

  if (loading && events.length === 0) {
      return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
             <button onClick={prevPeriod} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><ChevronLeft className="w-5 h-5"/></button>
             <button onClick={nextPeriod} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><ChevronRight className="w-5 h-5"/></button>
          </div>
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'd MMM, yyyy', { locale: vi })}
          </h2>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5"/> Sự kiện mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2 text-center text-gray-500 font-medium text-sm">
          <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
      </div>
      
      {renderMonthView()}

      {/* View Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in">
                <div className={`p-6 ${EVENT_COLORS[selectedEvent.type].split(' ')[0]} border-b border-gray-100`}>
                    <div className="flex justify-between items-start">
                        <div>
                             <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/50 border border-white/20 text-gray-800`}>
                                {EVENT_LABELS[selectedEvent.type]}
                             </span>
                             <h2 className="text-xl font-bold mt-2 text-gray-900">{selectedEvent.title}</h2>
                        </div>
                        <button onClick={() => setSelectedEvent(null)} className="p-1 bg-white/50 rounded-full hover:bg-white transition-colors">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Thời gian</p>
                            <p className="text-gray-800 font-semibold">
                                {formatDisplayDate(selectedEvent.startTime)}
                            </p>
                            <p className="text-gray-500 text-sm">đến</p>
                            <p className="text-gray-800 font-semibold">
                                {formatDisplayDate(selectedEvent.endTime)}
                            </p>
                        </div>
                    </div>

                    {selectedEvent.subjectId && (
                        <div className="flex items-center gap-3">
                             <div className="w-5 h-5 rounded-full border-2 border-gray-200" style={{ backgroundColor: subjects.find(s => s.id === selectedEvent.subjectId)?.color || '#ccc' }}></div>
                             <div>
                                <p className="text-sm text-gray-500 font-medium">Môn học</p>
                                <p className="text-gray-800">{subjects.find(s => s.id === selectedEvent.subjectId)?.name || 'Môn đã xóa'}</p>
                             </div>
                        </div>
                    )}

                    {selectedEvent.description && (
                        <div className="flex items-start gap-3">
                            <AlignLeft className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Mô tả</p>
                                <p className="text-gray-800 text-sm whitespace-pre-wrap">{selectedEvent.description}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button 
                            onClick={handleEditClick}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                        >
                            <Edit className="w-4 h-4" /> Chỉnh sửa
                        </button>
                        <button 
                            onClick={() => handleDeleteEvent(selectedEvent.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
                        >
                            <Trash className="w-4 h-4" /> Xóa
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Add/Edit Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
                {newEvent.id ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện'}
            </h2>
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    placeholder="VD: Thi giữa kỳ"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2"
                    value={newEvent.title || ''}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm"
                    value={newEvent.startTime}
                    onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm"
                    value={newEvent.endTime}
                    onChange={e => setNewEvent({...newEvent, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại sự kiện</label>
                    <select 
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2"
                        value={newEvent.type}
                        onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})}
                    >
                        {Object.keys(EventType).map(t => (
                            <option key={t} value={t}>{EVENT_LABELS[t as EventType]}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Môn học (nếu có)</label>
                    <select 
                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2"
                        value={newEvent.subjectId || ''}
                        onChange={e => setNewEvent({...newEvent, subjectId: e.target.value})}
                    >
                        <option value="">Không chọn môn</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea
                    placeholder="Ghi chú thêm..."
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 h-20"
                    value={newEvent.description || ''}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
              <button onClick={handleSaveEvent} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;