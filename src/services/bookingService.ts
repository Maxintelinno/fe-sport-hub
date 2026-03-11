import api from './api';
import { Court, Booking } from '../types';

const API_URL = 'http://sport-hub-register-staging.up.railway.app';

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
