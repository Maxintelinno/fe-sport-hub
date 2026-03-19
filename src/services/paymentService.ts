import api from './api';

const PAYMENT_API_URL = 'https://sport-hub-payment-staging.up.railway.app';

export interface QRGenerateRequest {
    booking_id: string;
    amount: string;
    reference1: string;
    reference2: string;
}

export interface QRGenerateResponse {
    partnerTxnUid: string;
    partnerId: string;
    statusCode: string;
    errorCode: string;
    errorDesc: string;
    accountName: string;
    qrCode: string;
    sof: string[];
}

export async function generateQRCode(data: QRGenerateRequest): Promise<QRGenerateResponse> {
    const response = await api.post(`${PAYMENT_API_URL}/v1/payment/qr/generate`, data, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถสร้าง QR Code ได้');
    }

    if (response.data.statusCode !== '00') {
        throw new Error(response.data.errorDesc || 'เกิดข้อผิดพลาดในการสร้าง QR Code');
    }

    return response.data;
}
