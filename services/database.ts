import { supabase } from '../lib/supabase';
import { Subject, ScheduleEvent, EventType, Priority, UserProfile } from '../types';

/**
 * USER PROFILE FUNCTIONS
 */

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const createUserProfile = async (
  userId: string,
  profile: UserProfile
): Promise<boolean> => {
  try {
    console.log('Attempting to create user profile:', { userId, profile });
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          name: profile.name,
          email: profile.email
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    console.log('User profile created successfully:', data);
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};

export const updateUserProfile = async (
  userId: string,
  profile: Partial<UserProfile>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

/**
 * SUBJECTS FUNCTIONS
 */

export const getSubjects = async (userId: string): Promise<Subject[]> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Subject[];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

export const createSubject = async (
  userId: string,
  subject: Omit<Subject, 'id'>
): Promise<Subject | null> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert([
        {
          user_id: userId,
          name: subject.name,
          code: subject.code,
          location: subject.location,
          color: subject.color
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Subject;
  } catch (error) {
    console.error('Error creating subject:', error);
    return null;
  }
};

export const updateSubject = async (
  subjectId: string,
  subject: Partial<Omit<Subject, 'id'>>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subjects')
      .update(subject)
      .eq('id', subjectId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating subject:', error);
    return false;
  }
};

export const deleteSubject = async (subjectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    return false;
  }
};

/**
 * SCHEDULE EVENTS FUNCTIONS
 */

export const getScheduleEvents = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ScheduleEvent[]> => {
  try {
    let query = supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('start_time', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('end_time', endDate.toISOString());
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) throw error;

    return data.map(event => ({
      id: event.id,
      subjectId: event.subject_id,
      title: event.title,
      description: event.description,
      startTime: event.start_time,
      endTime: event.end_time,
      type: event.type as EventType,
      priority: event.priority as Priority,
      isCompleted: event.is_completed
    })) as ScheduleEvent[];
  } catch (error) {
    console.error('Error fetching schedule events:', error);
    return [];
  }
};

export const createScheduleEvent = async (
  userId: string,
  event: Omit<ScheduleEvent, 'id'>
): Promise<ScheduleEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('schedule_events')
      .insert([
        {
          user_id: userId,
          subject_id: event.subjectId,
          title: event.title,
          description: event.description,
          start_time: event.startTime,
          end_time: event.endTime,
          type: event.type,
          priority: event.priority,
          is_completed: event.isCompleted
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const dbEvent = data;
    return {
      id: dbEvent.id,
      subjectId: dbEvent.subject_id,
      title: dbEvent.title,
      description: dbEvent.description,
      startTime: dbEvent.start_time,
      endTime: dbEvent.end_time,
      type: dbEvent.type as EventType,
      priority: dbEvent.priority as Priority,
      isCompleted: dbEvent.is_completed
    } as ScheduleEvent;
  } catch (error) {
    console.error('Error creating schedule event:', error);
    return null;
  }
};

export const updateScheduleEvent = async (
  eventId: string,
  event: Partial<Omit<ScheduleEvent, 'id'>>
): Promise<boolean> => {
  try {
    const updateData: any = {};

    if (event.title !== undefined) updateData.title = event.title;
    if (event.description !== undefined) updateData.description = event.description;
    if (event.startTime !== undefined) updateData.start_time = event.startTime;
    if (event.endTime !== undefined) updateData.end_time = event.endTime;
    if (event.type !== undefined) updateData.type = event.type;
    if (event.priority !== undefined) updateData.priority = event.priority;
    if (event.isCompleted !== undefined) updateData.is_completed = event.isCompleted;
    if (event.subjectId !== undefined) updateData.subject_id = event.subjectId;

    const { error } = await supabase
      .from('schedule_events')
      .update(updateData)
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating schedule event:', error);
    return false;
  }
};

export const deleteScheduleEvent = async (eventId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('schedule_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting schedule event:', error);
    return false;
  }
};

