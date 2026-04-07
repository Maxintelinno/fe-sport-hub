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

export interface CreateOfflineBookingRequest {
  field_id: string;
  booking_date: string;
  customer_name: string;
  customer_tel?: string;
  customer_paid_source?: string;
  customer_remark?: string;
  items: {
    court_id: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface OfflineBookingResponse {
  status: string;
  message: string;
  data: {
    booking_no: string;
  };
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
  const response = await api.get(`${API_URL}/v1/bookings/my?user_id=${userId}&t=${Date.now()}`, {
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

export interface OwnerBookingSlot {
  start_time: string;
  end_time: string;
  type: 'booked' | 'available';
  booking_source?: 'online' | 'offline';
  customer_name?: string;
  payment_status?: 'paid' | 'pending';
  status?: string;
}

export interface OwnerCourtBookings {
  court_id: string;
  court_name: string;
  booked_slots: OwnerBookingSlot[];
  available_slots: OwnerBookingSlot[];
}

export interface OwnerBookingsResponse {
  status: string;
  message: string;
  data: {
    field_id: string;
    date: string;
    open_time: string;
    close_time: string;
    courts: OwnerCourtBookings[];
  };
}

export async function getOwnerBookings(fieldId: string): Promise<OwnerBookingsResponse['data']> {
  const response = await api.get(`${API_URL}/v1/owner/bookings?field_id=${fieldId}`, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลการจองได้');
  }
  return response.data.data;
}

export async function createOfflineBooking(data: CreateOfflineBookingRequest): Promise<OfflineBookingResponse['data']> {
  const response = await api.post(`${API_URL}/v1/owner/bookings/offline`, data, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถบันทึกการจองออฟไลน์ได้');
  }
  return response.data.data;
}

export interface CancelBookingDetailResponse {
  status: string;
  message: string;
  data: {
    booking_no: string;
    booking_date: string;
    created_at: string;
    total_amount: number;
    refund_policy: string;
    refund_percent: number;
    refund_amount: number;
    hours_until_play: number;
    status: string;
    payment_status: string;
    courts: {
        court_name: string;
        start_time: string;
        end_time: string;
    }[];
  };
}

export async function getCancelBookingDetail(bookingId: string): Promise<CancelBookingDetailResponse['data']> {
  const response = await api.get(`${API_URL}/v1/bookings/${bookingId}/detail/cancel`, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลรายละเอียดการยกเลิกได้');
  }
  return response.data.data;
}

export async function cancelBooking(bookingId: string): Promise<{ status: string; message: string }> {
  const response = await api.post(`${API_URL}/v1/bookings/${bookingId}/cancel`, {}, {
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ไม่สามารถยกเลิกการจองได้');
  }
  return response.data;
}
