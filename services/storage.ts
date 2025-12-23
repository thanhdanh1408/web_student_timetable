import { supabase } from '../lib/supabase';
import { ScheduleEvent, Subject, UserProfile, EventType, Priority } from '../types';

// KEYS for LocalStorage fallback
const LOCAL_KEYS = {
  EVENTS: 'unitime_events',
  SUBJECTS: 'unitime_subjects',
  PROFILE: 'unitime_profile'
};

// --- Mappers ---
const mapSubjectFromDB = (data: any): Subject => ({
  id: data.id,
  name: data.name,
  code: data.code,
  location: data.location,
  color: data.color
});

const mapEventFromDB = (data: any): ScheduleEvent => ({
  id: data.id,
  subjectId: data.subject_id,
  title: data.title,
  description: data.description,
  startTime: data.start_time,
  endTime: data.end_time,
  type: data.type as EventType,
  priority: data.priority as Priority,
  isCompleted: data.is_completed
});

// Helper to check if we are in mock mode
const isMockMode = () => !!localStorage.getItem('unitime_mock_session');

// --- SEED DATA FOR MOCK MODE ---
const seedMockData = () => {
    if (!localStorage.getItem(LOCAL_KEYS.SUBJECTS)) {
        const subs = [
            { id: '1', name: 'Toán Cao Cấp', code: 'MAT301', color: '#3b82f6', location: 'Phòng 301' },
            { id: '2', name: 'Tin Học Cơ Sở', code: 'CS101', color: '#10b981', location: 'Phòng Lab 2' }
        ];
        localStorage.setItem(LOCAL_KEYS.SUBJECTS, JSON.stringify(subs));
    }
    if (!localStorage.getItem(LOCAL_KEYS.EVENTS)) {
        const today = new Date();
        const evs = [{
            id: 'e1', subjectId: '1', title: 'Bài giảng Demo',
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
            type: 'CLASS', priority: 'MEDIUM', isCompleted: false
        }];
        localStorage.setItem(LOCAL_KEYS.EVENTS, JSON.stringify(evs));
    }
}

export const storageService = {
  // --- SUBJECTS ---
  getSubjects: async (): Promise<Subject[]> => {
    if (isMockMode()) {
        seedMockData();
        return JSON.parse(localStorage.getItem(LOCAL_KEYS.SUBJECTS) || '[]');
    }

    const { data, error } = await supabase.from('subjects').select('*').order('name');
    if (error) { console.error(error); return []; }
    return data.map(mapSubjectFromDB);
  },

  saveSubject: async (subject: Partial<Subject>): Promise<Subject | null> => {
    if (isMockMode()) {
        const subjects: Subject[] = JSON.parse(localStorage.getItem(LOCAL_KEYS.SUBJECTS) || '[]');
        let updated: Subject;
        if (subject.id) {
            const index = subjects.findIndex(s => s.id === subject.id);
            if(index !== -1) {
                subjects[index] = { ...subjects[index], ...subject } as Subject;
                updated = subjects[index];
            } else return null;
        } else {
            updated = { ...subject, id: Date.now().toString() } as Subject;
            subjects.push(updated);
        }
        localStorage.setItem(LOCAL_KEYS.SUBJECTS, JSON.stringify(subjects));
        return updated;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const payload = {
      user_id: user.id,
      name: subject.name,
      code: subject.code,
      location: subject.location,
      color: subject.color
    };

    let query;
    if (subject.id) query = supabase.from('subjects').update(payload).eq('id', subject.id).select();
    else query = supabase.from('subjects').insert(payload).select();

    const { data, error } = await query;
    if (error) throw error;
    return mapSubjectFromDB(data[0]);
  },

  deleteSubject: async (id: string): Promise<void> => {
    if (isMockMode()) {
        const subjects: Subject[] = JSON.parse(localStorage.getItem(LOCAL_KEYS.SUBJECTS) || '[]');
        const updated = subjects.filter(s => s.id !== id);
        localStorage.setItem(LOCAL_KEYS.SUBJECTS, JSON.stringify(updated));
        return;
    }

    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) console.error(error);
  },

  // --- EVENTS ---
  getEvents: async (): Promise<ScheduleEvent[]> => {
    if (isMockMode()) {
        seedMockData();
        return JSON.parse(localStorage.getItem(LOCAL_KEYS.EVENTS) || '[]');
    }

    const { data, error } = await supabase.from('events').select('*');
    if (error) { console.error(error); return []; }
    return data.map(mapEventFromDB);
  },

  saveEvent: async (event: Partial<ScheduleEvent>): Promise<ScheduleEvent | null> => {
    if (isMockMode()) {
        const events: ScheduleEvent[] = JSON.parse(localStorage.getItem(LOCAL_KEYS.EVENTS) || '[]');
        let updated: ScheduleEvent;
        if (event.id) {
            const index = events.findIndex(e => e.id === event.id);
            if(index !== -1) {
                events[index] = { ...events[index], ...event } as ScheduleEvent;
                updated = events[index];
            } else return null;
        } else {
            updated = { ...event, id: Date.now().toString() } as ScheduleEvent;
            events.push(updated);
        }
        localStorage.setItem(LOCAL_KEYS.EVENTS, JSON.stringify(events));
        return updated;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const payload = {
      user_id: user.id,
      subject_id: event.subjectId || null,
      title: event.title,
      description: event.description,
      start_time: event.startTime,
      end_time: event.endTime,
      type: event.type,
      priority: event.priority,
      is_completed: event.isCompleted
    };

    let query;
    if (event.id) query = supabase.from('events').update(payload).eq('id', event.id).select();
    else query = supabase.from('events').insert(payload).select();

    const { data, error } = await query;
    if (error) throw error;
    return mapEventFromDB(data[0]);
  },

  deleteEvent: async (id: string): Promise<void> => {
    if (isMockMode()) {
        const events: ScheduleEvent[] = JSON.parse(localStorage.getItem(LOCAL_KEYS.EVENTS) || '[]');
        const updated = events.filter(e => e.id !== id);
        localStorage.setItem(LOCAL_KEYS.EVENTS, JSON.stringify(updated));
        return;
    }

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) console.error(error);
  },

  // --- PROFILE ---
  getProfile: (): UserProfile => {
    if (isMockMode()) {
        return { name: 'Sinh Viên Demo'};
    }
    return JSON.parse(localStorage.getItem('unitime_profile') || JSON.stringify({ name: 'Sinh Viên'}));
  }
};