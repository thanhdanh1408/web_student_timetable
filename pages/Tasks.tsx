import React, { useState } from 'react';
import { useScheduleEvents } from '../hooks/useDatabase';
import { ScheduleEvent, EventType, Priority, EVENT_COLORS, EVENT_LABELS, PRIORITY_LABELS } from '../types';
import { CheckCircle2, Circle, AlertTriangle, Calendar as CalendarIcon, Filter, Loader2 } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { vi } from 'date-fns/locale';

const Tasks = () => {
  const { events, loading, updateEvent } = useScheduleEvents();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Filter for task types (DEADLINE, EXAM, STUDY)
  const tasks = events.filter(e => [EventType.DEADLINE, EventType.EXAM, EventType.STUDY].includes(e.type));

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    await updateEvent(id, { isCompleted: !task.isCompleted });
  };

  const filteredTasks = tasks.filter(t => {
      if (filter === 'pending') return !t.isCompleted;
      if (filter === 'completed') return t.isCompleted;
      return true;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const getPriorityColor = (p: Priority) => {
      switch(p) {
          case Priority.URGENT: return 'text-red-600 bg-red-50';
          case Priority.HIGH: return 'text-orange-600 bg-orange-50';
          default: return 'text-gray-600 bg-gray-50';
      }
  }

  if (loading) {
      return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Bài tập & Deadline</h1>
           <p className="text-gray-500">Theo dõi tiến độ và không bao giờ bỏ lỡ hạn nộp.</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
                Tất cả
            </button>
            <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
                Chưa xong
            </button>
             <button 
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
                Đã xong
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTasks.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                <p>Không tìm thấy nhiệm vụ nào.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100">
                {filteredTasks.map(task => {
                    const isOverdue = !task.isCompleted && isPast(parseISO(task.endTime));
                    return (
                        <div key={task.id} className={`p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 ${task.isCompleted ? 'opacity-50' : ''}`}>
                            <button onClick={() => toggleComplete(task.id)} className="shrink-0 text-gray-400 hover:text-blue-600 transition-colors">
                                {task.isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6" />}
                            </button>
                            
                            <div className="flex-1">
                                <h3 className={`font-semibold text-gray-800 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                                    {task.title}
                                    {isOverdue && <span className="ml-2 inline-flex items-center text-xs font-bold text-red-500"><AlertTriangle className="w-3 h-3 mr-1"/> Quá hạn</span>}
                                </h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="w-3 h-3"/> {format(parseISO(task.endTime), 'dd MMM, HH:mm', { locale: vi })}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[task.type]}`}>{EVENT_LABELS[task.type]}</span>
                                </div>
                            </div>

                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                                {PRIORITY_LABELS[task.priority]}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;