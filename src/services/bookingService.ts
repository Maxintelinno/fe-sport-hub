import api from './api';
import { Court, Booking, FieldAvailability } from '../types';

const API_URL = 'https://sport-hub-register-staging.up.railway.app';

export interface CreateBookingRequest {
  user_id: string;
  field_id: string;
  booking_date: string;
  note?: string;
  items: {
    court_id: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface CreateCourtRequest {
  field_id: string;
  name: string;
  price_per_hour: number;
  capacity: number;
  court_type: string;
}

export interface CreateCourtsBulkRequest {
  field_id: string;
  courts: {
    name: string;
    price_per_hour: number;
    capacity: number;
    court_type: string;
  }[];
}

export interface UpdateCourtRequest {
  field_id: string;
  name?: string;
  price_per_hour?: number;
  capacity?: number;
  court_type?: string;
  status?: string;
}

export async function getCourtsByField(fieldId: string): Promise<Court[]> {
  const response = await api.get(`${API_URL}/v1/courts?field_id=${fieldId}`, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลคอร์ทได้');
  }
  return response.data.data || [];
}

export async function createCourt(data: CreateCourtRequest): Promise<Court> {
  const response = await api.post(`${API_URL}/v1/courts`, data, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถสร้างคอร์ทได้');
  }
  return response.data.data;
}

export async function updateCourt(courtId: string, data: UpdateCourtRequest): Promise<Court> {
  const response = await api.put(`${API_URL}/v1/courts/${courtId}`, data, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถแก้ไขคอร์ทได้');
  }
  return response.data.data;
}

export async function deleteCourt(courtId: string): Promise<void> {
  const response = await api.delete(`${API_URL}/v1/courts/${courtId}`, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถลบคอร์ทได้');
  }
}

export async function createCourtsBulk(data: CreateCourtsBulkRequest): Promise<Court[]> {
  const response = await api.post(`${API_URL}/v1/courts`, data, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถสร้างคอร์ทได้');
  }
  return response.data.data;
}

export async function createBooking(data: CreateBookingRequest): Promise<Booking> {
  const response = await api.post(`${API_URL}/v1/bookings`, data, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถจองสนามได้');
  }
  return response.data.data;
}

export async function getMyBookings(userId: string): Promise<Booking[]> {
  const response = await api.get(`${API_URL}/v1/bookings/my?user_id=${userId}`, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลการจองได้');
  }
  return response.data.data || [];
}

export async function getFieldAvailability(fieldId: string, date: string): Promise<FieldAvailability> {
  const response = await api.get(`${API_URL}/v1/availability?field_id=${fieldId}&date=${date}`, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลเวลาว่างได้');
  }
  return response.data.data;
}
