import axios from 'axios';

const API_URL = 'https://sport-hub-register-staging.up.railway.app';

export class RateLimitError extends Error {
  constructor(message: string = 'กรุณารอสักครู่ก่อนขอ OTP ใหม่') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function requestOTP(phone: string) {
  const response = await axios.post(`${API_URL}/otp/request`, { phone }, {
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });

  if (response.status === 429 || response.data?.message?.toLowerCase?.().includes('rate limit')) {
    throw new RateLimitError(response.data?.message || 'กรุณารอสักครู่ก่อนขอ OTP ใหม่');
  }
  if (response.status >= 400) {
    throw new Error(response.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
  }
  return response.data;
}

export async function verifyOTP(phone: string, otp: string) {
  const response = await axios.post(`${API_URL}/otp/verify`, { phone, otp }, {
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
  }
  return response.data;
}

export async function registerUser(data: { phone: string; username: string; fullname: string; password: string; role: 'cust' | 'owner' }) {
  const response = await axios.post(`${API_URL}/register`, data, {
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
  }
  return response.data;
}

export async function loginUser(data: { username: string; password: string }) {
  const response = await axios.post(`${API_URL}/login`, data, {
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(response.data?.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
  }
  return response.data;
}
