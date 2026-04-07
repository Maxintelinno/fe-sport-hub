import api from './api';

const PROFILE_API_URL = 'https://sport-hub-profile-staging.up.railway.app';
const REGISTER_API_URL = 'https://sport-hub-register-staging.up.railway.app';

export interface OwnerProfileResponse {
    user: {
        name: string;
        phone: string;
        role: string;
        avatar_url: string;
        initials: string;
    };
    stats: {
        field_count: number;
        booking_count: number;
        total_revenue: number;
    };
    plan: {
        name: string;
        field_usage: string;
        court_usage: string;
        can_upgrade: boolean;
    };
    revenue_summary: {
        total: number;
        daily: number;
        monthly: number;
        yearly: number;
    };
}

export interface RevenueByField {
    field_id: string;
    field_name: string;
    revenue: number;
    booking_count: number;
}

export interface RevenueBySport {
    sport_type: string;
    revenue: number;
    booking_count: number;
}

export interface RevenueReportResponse {
    total_revenue: number;
    period: string;
    by_field: RevenueByField[];
    by_sport_type: RevenueBySport[];
}

export interface OwnerDashboardResponse {
    status: string;
    message: string;
    data: {
        owner: {
            id: string;
            fullname: string;
            phone: string;
            avatar_initial: string;
        };
        plan: {
            code: string;
            name: string;
            status: string;
            trial_days_left: number;
            is_trial: boolean;
            price_after_trial: number;
        };
        summary: {
            total_revenue: number;
            revenue_growth_pct: number;
            booking_count: number;
            field_count: number;
        };
        booking_count: number;
        field_count: number;
        revenue_growth_pct: number;
        total_revenue: number;
        alerts: {
            type: 'info' | 'warning' | 'error' | 'success';
            title: string;
            message: string;
            action_text: string;
            action_type: string;
        }[];
        next_actions: {
            title: string;
            message: string;
            action_text: string;
            action_type: string;
        }[];
        revenue_trend_7d: {
            label: string;
            amount: number;
        }[];
    };
}

export interface BankAccountsResponse {
    status: string;
    message: string;
    has_bank_account: boolean;
    data: any;
}

export async function getOwnerProfile(): Promise<OwnerProfileResponse> {
    const response = await api.get(`${PROFILE_API_URL}/v1/profile`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้');
    }
    return response.data;
}

export async function getOwnerDashboard(role?: string): Promise<OwnerDashboardResponse> {
    const isRestrictedRole = ['staff', 'manager', 'accountant'].includes(role?.toLowerCase() || '');
    const endpoint = isRestrictedRole ? '/v1/staff/dashboard' : '/v1/owner/dashboard';
    
    const response = await api.get(`${PROFILE_API_URL}${endpoint}?t=${Date.now()}`, {
        validateStatus: () => true,
    });
 
    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลแดชบอร์ดได้');
    }
    return response.data;
}

export async function getRevenueReport(groupBy: 'total' | 'day' | 'month' | 'year' = 'total'): Promise<RevenueReportResponse> {
    const response = await api.get(`${PROFILE_API_URL}/v1/reports/revenue?group_by=${groupBy}`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงรายงานรายได้ได้');
    }
    return response.data;
}

export async function getBankAccounts(): Promise<BankAccountsResponse> {
    const response = await api.get(`${PROFILE_API_URL}/v1/owner/bank-accounts`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลบัญชีธนาคารได้');
    }
    return response.data;
}

export async function addBankAccount(data: {
    bank_code: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    is_default: boolean;
    prompt_pay?: string;
}): Promise<any> {
    const response = await api.post(`${PROFILE_API_URL}/v1/owner/bank-accounts`, data, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถเพิ่มบัญชีได้');
    }
    return response.data;
}

export async function updateBankAccount(id: string, data: {
    bank_code: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    is_default: boolean;
    prompt_pay?: string;
}): Promise<any> {
    const response = await api.put(`${PROFILE_API_URL}/v1/owner/bank-accounts/${id}`, data, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถแก้ไขข้อมูลบัญชีได้');
    }
    return response.data;
}

export async function setDefaultBankAccount(id: string): Promise<any> {
    const response = await api.post(`${PROFILE_API_URL}/v1/owner/bank-accounts/${id}/set-default`, {}, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถตั้งเป็นบัญชีหลักได้');
    }
    return response.data;
}

export async function deleteBankAccount(id: string): Promise<any> {
    const response = await api.delete(`${PROFILE_API_URL}/v1/owner/bank-accounts/${id}`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถลบบัญชีได้');
    }
    return response.data;
}

export async function getWithdrawalBalance(): Promise<{ status: string; available_balance: number }> {
    const response = await api.get(`${PROFILE_API_URL}/v1/owner/withdrawal-balance`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลยอดเงินคงเหลือได้');
    }
    return response.data;
}

export async function requestWithdrawal(data: {
    amount: number;
    bank_account_id?: string;
}): Promise<any> {
    const response = await api.post(`${PROFILE_API_URL}/v1/owner/withdrawals`, data, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถส่งคำขอถอนเงินได้');
    }
    return response.data;
}

export interface StaffListItem {
    id: string;
    owner_user_id: string;
    staff_user_id: string;
    username: string;
    fullname: string;
    phone: string;
    role_code: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export async function getStaffList(): Promise<StaffListItem[]> {
    const response = await api.get(`${PROFILE_API_URL}/v1/owner/staff`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลพนักงานได้');
    }
    return response.data;
}

export async function deactivateStaff(staffUserId: string): Promise<any> {
    const response = await api.put(`${PROFILE_API_URL}/v1/owner/staff/${staffUserId}/deactivate`, {}, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถยกเลิกการใช้งานพนักงานได้');
    }
    return response.data;
}

export async function addStaff(data: {
    fullname: string;
    phone: string;
    username: string;
    role: string;
}): Promise<any> {
    const response = await api.post(`${REGISTER_API_URL}/v1/owner/staffs`, data, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถเพิ่มพนักงานได้');
    }
    return response.data;
}
