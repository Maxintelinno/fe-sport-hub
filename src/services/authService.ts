const API_URL = 'https://sport-hub-register-staging.up.railway.app/api/v1';

export class RateLimitError extends Error {
  constructor(message: string = 'กรุณารอสักครู่ก่อนขอ OTP ใหม่') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function requestOTP(phone: string) {
  const response = await fetch(`${API_URL}/otp/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone }),
  });

  const responseData = await response.json();

  if (response.status === 429 || responseData?.message?.toLowerCase?.().includes('rate limit')) {
    throw new RateLimitError(responseData?.message || 'กรุณารอสักครู่ก่อนขอ OTP ใหม่');
  }
  if (!response.ok) {
    throw new Error(responseData?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
  }
  return responseData;
}

export async function verifyOTP(phone: string, otp: string) {
  const response = await fetch(`${API_URL}/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, otp }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.message || 'รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
  }
  return responseData;
}

export async function registerUser(data: { phone: string; username: string; fullname: string; password: string; role: 'cust' | 'owner' }) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
  }
  return responseData;
}

export async function loginUser(data: { username: string; password: string }) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
  }
  return responseData;
}

const MIDDLEWARE_URL = 'https://sport-hub-middleware-staging.up.railway.app/api/v1';

export async function getAuthToken(data: { id: string; phone: string; username: string }) {
  const response = await fetch(`${MIDDLEWARE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: data.id,
      phone: data.phone,
      userid: data.username
    }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData?.message || 'ไม่สามารถรับ Access Token ได้');
  }
  return responseData;
}
