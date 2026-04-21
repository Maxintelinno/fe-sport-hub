
import api from './api';

const REGISTER_API_URL = 'https://sport-hub-register-staging.up.railway.app';

export interface CreditResponse {
    status: string;
    message: string;
    data: {
        id: string;
        user_id: string;
        balance: number;
        total_earned: number;
        total_used: number;
        total_expired: number;
        created_at: string;
        updated_at: string;
    };
}

export async function getUserCredit(): Promise<CreditResponse> {
    const response = await api.get(`${REGISTER_API_URL}/v1/user/credit`, {
        validateStatus: () => true
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลเครดิตได้');
    }

    return response.data;
}
