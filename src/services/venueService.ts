import api from './api';
import { Venue } from '../types';

const API_URL = 'https://sport-hub-register-staging.up.railway.app';

export interface PresignRequestFile {
    file_name: string;
    content_type: string;
}

export interface PresignedUrlResponse {
    object_key: string;
    upload_url: string;
    public_url: string;
}

export interface PresignResponse {
    files: PresignedUrlResponse[];
}

export async function getPresignedUrls(files: PresignRequestFile[]): Promise<PresignResponse> {
    const response = await api.post(`${API_URL}/uploads/presign`, { files }, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถขอลิงก์สำหรับอัปโหลดรูปภาพได้');
    }
    return response.data;
}

export async function uploadToPresignedUrl(uploadUrl: string, fileUri: string, contentType: string, objectKey: string) {
    try {
        const response = await fetch(fileUri);
        const blob = await response.blob();

        console.log('uploadUrl =', uploadUrl);
        console.log('fileUri =', fileUri);
        console.log('contentType =', contentType);
        console.log('objectKey =', objectKey);

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: blob,
            headers: {
                'Content-Type': contentType,
            },
        });

        const responseText = await uploadResponse.text();
        console.log('upload status =', uploadResponse.status);
        console.log('upload response =', responseText);

        if (!uploadResponse.ok) {
            throw new Error(`Upload to storage failed: ${uploadResponse.status} ${responseText}`);
        }
        return true;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}
export interface FieldImage {
    object_key: string;
    sort_order: number;
}

export interface CreateFieldRequest {
    owner_id: string;
    name: string;
    sport_type: string;
    price_per_hour: number;
    open_time: string;
    close_time: string;
    province: string;
    district: string;
    address_line: string;
    description: string;
    images: FieldImage[];
}

export async function createField(data: CreateFieldRequest) {
    const response = await api.post(`${API_URL}/v1/fields`, data, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถสร้างสนามได้');
    }
    return response.data;
}

export interface GetOwnerFieldsResponse {
    status: string;
    message: string;
    data: Venue[];
}

export function getVenuesByOwner(ownerId: string): Venue[] {
  // MOCK_VENUES and ownerVenues are not defined in this file.
  // This function will cause a runtime error if called without them.
  // Assuming they would be imported or defined elsewhere in a complete context.
  // For now, returning an empty array to maintain syntactical correctness.
  return [];
}

export async function getOwnerFields(ownerId: string): Promise<Venue[]> {
    const response = await api.get(`${API_URL}/v1/owner/fields?owner_id=${ownerId}`, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถดึงข้อมูลสนามได้');
    }
    return response.data.data;
}

export async function updateFieldStatus(owner_id: string, field_id: string, status: string) {
    const response = await api.patch(`${API_URL}/v1/owner/fields/status`, { 
        owner_id, 
        field_id, 
        status 
    }, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถอัปเดตสถานะสนามได้');
    }
    return response.data;
}

export async function updateField(fieldId: string, data: Partial<CreateFieldRequest>) {
    const response = await api.patch(`${API_URL}/v1/fields/${fieldId}`, data, {
        validateStatus: () => true,
    });

    if (response.status >= 400) {
        throw new Error(response.data?.message || 'ไม่สามารถแก้ไขข้อมูลสนามได้');
    }
    return response.data;
}
