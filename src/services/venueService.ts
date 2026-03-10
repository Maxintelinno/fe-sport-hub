import api from './api';

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
