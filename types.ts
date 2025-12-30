export enum EventType {
  CLASS = 'CLASS',
  EXAM = 'EXAM',
  DEADLINE = 'DEADLINE',
  STUDY = 'STUDY', // For AI suggested study blocks
  OTHER = 'OTHER'
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  location?: string;
  color: string;
}

export interface ScheduleEvent {
  id: string;
  subjectId?: string; // Optional linking to a subject
  title: string;
  description?: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  type: EventType;
  isCompleted: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
}

export const EVENT_COLORS: Record<EventType, string> = {
  [EventType.CLASS]: 'bg-blue-100 text-blue-800 border-blue-200',
  [EventType.EXAM]: 'bg-red-100 text-red-800 border-red-200',
  [EventType.DEADLINE]: 'bg-orange-100 text-orange-800 border-orange-200',
  [EventType.STUDY]: 'bg-green-100 text-green-800 border-green-200',
  [EventType.OTHER]: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Vietnamese Labels
export const EVENT_LABELS: Record<EventType, string> = {
  [EventType.CLASS]: 'Lớp học',
  [EventType.EXAM]: 'Thi',
  [EventType.DEADLINE]: 'Hạn nộp',
  [EventType.STUDY]: 'Tự học',
  [EventType.OTHER]: 'Khác',
};

