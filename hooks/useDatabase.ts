import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import * as db from '../services/database';
import { Subject, ScheduleEvent } from '../types';

/**
 * Hook to fetch and manage subjects
 */
export const useSubjects = () => {
  const auth = useContext(AuthContext);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    if (auth.user?.id) {
      fetchSubjects();
    } else {
      setLoading(false);
    }
  }, [auth?.user?.id]);

  const fetchSubjects = async () => {
    if (!auth?.user?.id) return;
    setLoading(true);
    try {
      const data = await db.getSubjects(auth.user.id);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async (subject: Omit<Subject, 'id'>) => {
    if (!auth?.user?.id) return null;
    const newSubject = await db.createSubject(auth.user.id, subject);
    if (newSubject) {
      setSubjects([newSubject, ...subjects]);
    }
    return newSubject;
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    const success = await db.updateSubject(id, updates);
    if (success) {
      setSubjects(subjects.map(s => s.id === id ? { ...s, ...updates } : s));
    }
    return success;
  };

  const deleteSubject = async (id: string) => {
    const success = await db.deleteSubject(id);
    if (success) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
    return success;
  };

  return { subjects, loading, fetchSubjects, createSubject, updateSubject, deleteSubject };
};

/**
 * Hook to fetch and manage schedule events
 */
export const useScheduleEvents = (startDate?: Date, endDate?: Date) => {
  const auth = useContext(AuthContext);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    if (auth.user?.id) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [auth?.user?.id, startDate, endDate]);

  const fetchEvents = async () => {
    if (!auth?.user?.id) return;
    setLoading(true);
    try {
      const data = await db.getScheduleEvents(auth.user.id, startDate, endDate);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: Omit<ScheduleEvent, 'id'>) => {
    if (!auth?.user?.id) return null;
    const newEvent = await db.createScheduleEvent(auth.user.id, event);
    if (newEvent) {
      setEvents([...events, newEvent].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ));
    }
    return newEvent;
  };

  const updateEvent = async (id: string, updates: Partial<ScheduleEvent>) => {
    const success = await db.updateScheduleEvent(id, updates);
    if (success) {
      setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
    }
    return success;
  };

  const deleteEvent = async (id: string) => {
    const success = await db.deleteScheduleEvent(id);
    if (success) {
      setEvents(events.filter(e => e.id !== id));
    }
    return success;
  };

  return { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent };
};



/**
 * Hook to fetch and manage tasks
 */
export const useTasks = () => {
  const auth = useContext(AuthContext);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    if (auth.user?.id) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [auth?.user?.id]);

  const fetchTasks = async () => {
    if (!auth?.user?.id) return;
    setLoading(true);
    try {
      // Lấy tất cả sự kiện thuộc dạng DEADLINE, EXAM, STUDY từ schedule_events
      const data = await db.getScheduleEvents(auth.user.id);
      const filteredTasks = data.filter(e => 
        ['DEADLINE', 'EXAM', 'STUDY'].includes(e.type)
      );
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, fetchTasks };
};
