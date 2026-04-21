import api from './api';

const PAYMENT_API_URL = 'https://sport-hub-payment-staging.up.railway.app';

export interface QRGenerateRequest {
    booking_id: string;
    amount: string;
}

export interface QRGenerateResponse {
    paymentId: string;
    qrCode: string;
    status: string;
}

export async function generateQRCode(data: QRGenerateRequest): Promise<QRGenerateResponse> {
    const response = await api.post(`${PAYMENT_API_URL}/v1/payment/create-payment`, data, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถสร้าง QR Code ได้');
    }

    return response.data;
}

export interface PaymentStatusResponse {
    ID: string;
    BookingID: string;
    PaymentNo: string;
    Provider: string;
    Method: string;
    Amount: number;
    Currency: string;
    Status: 'pending' | 'success' | 'failed' | 'expired' | 'paid' | 'verifying';
    ProviderPaymentID: string | null;
    ProviderTransactionID: string | null;
    ProviderReference: string | null;
    QRPayload: string;
    QRImageURL: string | null;
    ExpiresAt: string;
    PaidAt: string | null;
    FailedAt: string | null;
    FailureReason: string | null;
    Metadata: any;
    CreatedAt: string;
    UpdatedAt: string;
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    console.log(`--- [paymentService] getPaymentStatus called with ID: ${paymentId} ---`);
    const response = await api.get(`${PAYMENT_API_URL}/v1/payments/${paymentId}?t=${Date.now()}`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถตรวจสอบสถานะการชำระเงินได้');
    }

    return response.data;
}
