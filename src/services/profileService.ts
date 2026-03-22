import api from './api';

const PROFILE_API_URL = 'https://sport-hub-profile-staging.up.railway.app';

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

export async function getOwnerProfile(): Promise<OwnerProfileResponse> {
    const response = await api.get(`${PROFILE_API_URL}/v1/profile`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้');
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
