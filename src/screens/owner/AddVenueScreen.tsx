import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
    Image,
    Modal,
    FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { addVenue } from '../../data/venueStore';
import { THAI_LOCATIONS, SPORT_TYPES, Province, District } from '../../data/locationData';
import * as ImagePicker from 'expo-image-picker';
import { getPresignedUrls, uploadToPresignedUrl, createField, FieldImage } from '../../services/venueService';

const { width, height } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<OwnerStackParamList, 'AddVenue'>;
};

// --- Custom Components ---

const RoyaltyPicker = ({ label, value, placeholder, onPress, icon }: any) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity style={styles.pickerTrigger} onPress={onPress}>
            <Text style={[styles.pickerValue, !value && { color: '#999' }]}>
                {value || placeholder}
            </Text>
            <Text style={styles.pickerIcon}>{icon || '▼'}</Text>
        </TouchableOpacity>
    </View>
);

const SelectionModal = ({ visible, title, data, onSelect, onClose }: any) => (
    <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeBtnText}>ปิด</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                onSelect(item);
                                onClose();
                            }}
                        >
                            <Text style={styles.modalItemText}>{typeof item === 'string' ? item : item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    </Modal>
);

export default function AddVenueScreen({ navigation }: Props) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [sportType, setSportType] = useState('');
    const [price, setPrice] = useState('');
    const [openingTime, setOpeningTime] = useState('08:00');
    const [closingTime, setClosingTime] = useState('22:00');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');

    // New Enhanced State
    const [images, setImages] = useState<string[]>([]); // These will be public_urls
    const [localImages, setLocalImages] = useState<string[]>([]); // These are for instant preview
    const [uploadingImages, setUploadingImages] = useState<boolean>(false);
    const [province, setProvince] = useState<Province | null>(null);
    const [district, setDistrict] = useState<District | null>(null);
    const [uploadedImages, setUploadedImages] = useState<FieldImage[]>([]);

    // Modal Visibility State
    const [sportModal, setSportModal] = useState(false);
    const [provinceModal, setProvinceModal] = useState(false);
    const [districtModal, setDistrictModal] = useState(false);
    const [openTimeModal, setOpenTimeModal] = useState(false);
    const [closeTimeModal, setCloseTimeModal] = useState(false);

    // Derived Data
    const availableDistricts = useMemo(() => {
        return province ? province.districts : [];
    }, [province]);

    const TIME_OPTIONS = useMemo(() => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            const hour = h.toString().padStart(2, '0');
            options.push(`${hour}:00`);
            options.push(`${hour}:30`);
        }
        return options;
    }, []);

    const handleAddImage = async () => {
        if (localImages.length >= 10) {
            Alert.alert('จำกัดจำนวนรูป', 'คุณสามารถเพิ่มรูปภาพได้สูงสุด 10 รูป');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 10 - localImages.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const selectedAssets = result.assets;
            const newLocalUris = selectedAssets.map(asset => asset.uri);

            // Show local preview immediately
            setLocalImages(prev => [...prev, ...newLocalUris].slice(0, 10));
            setUploadingImages(true);

            try {
                // 1. Get Presigned URLs
                const presignFiles = selectedAssets.map(asset => ({
                    file_name: asset.fileName || `field_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
                    content_type: asset.mimeType || 'image/jpeg'
                }));

                const { files: presignedData } = await getPresignedUrls(presignFiles);

                // 2. Upload to Cloud
                const uploadPromises = presignedData.map((p, idx) =>
                    uploadToPresignedUrl(p.upload_url, selectedAssets[idx].uri, presignFiles[idx].content_type, p.object_key)
                );

                await Promise.all(uploadPromises);

                // 3. Store Public URLs and Object Keys
                const publicUrls = presignedData.map(p => p.public_url);
                setImages(prev => [...prev, ...publicUrls].slice(0, 10));

                const newUploadedImages = presignedData.map((p, idx) => ({
                    object_key: p.object_key,
                    sort_order: images.length + idx
                }));
                setUploadedImages(prev => [...prev, ...newUploadedImages].slice(0, 10));

                console.log('Successfully uploaded images:', publicUrls);
            } catch (error) {
                console.error('Upload error:', error);
                Alert.alert('อัปโหลดรูปภาพไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
                // Remove the failed local images if desired, or let user retry
            } finally {
                setUploadingImages(false);
            }
        }
    };

    const removeImage = (index: number) => {
        const updatedLocal = [...localImages];
        updatedLocal.splice(index, 1);
        setLocalImages(updatedLocal);

        const updatedRemote = [...images];
        if (updatedRemote[index]) {
            updatedRemote.splice(index, 1);
            setImages(updatedRemote);
        }

        const updatedUploaded = [...uploadedImages];
        if (updatedUploaded[index]) {
            updatedUploaded.splice(index, 1);
            // Re-sort orders
            const resorted = updatedUploaded.map((img, idx) => ({
                ...img,
                sort_order: idx
            }));
            setUploadedImages(resorted);
        }
    };

    const handleAddVenue = async () => {
        if (!name || !sportType || !price || !address || !province || !district) {
            Alert.alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
            return;
        }

        if (!user) return;

        setLoading(true);
        try {
            // 1. Call real API
            const createdField = await createField({
                owner_id: user.id,
                name,
                sport_type: sportType,
                price_per_hour: Number(price),
                open_time: openingTime,
                close_time: closingTime,
                province: province.name,
                district: district.name,
                address_line: address,
                description: description,
                images: uploadedImages
            });

            // 2. Also keep local storage for now if still needed by other parts of the app
            addVenue({
                name,
                sport_type: sportType,
                price_per_hour: Number(price),
                open_time: openingTime,
                close_time: closingTime,
                description,
                address_line: address,
                province: province.name,
                district: district.name,
                images: uploadedImages.map((img, idx) => ({
                    id: `temp_${Date.now()}_${idx}`,
                    field_id: 'pending',
                    object_key: img.object_key,
                    image_url: images[idx] || '',
                    sort_order: img.sort_order
                })),
                owner_id: user.id,
                status: 'pending_review',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                isActive: true,
            });

            Alert.alert('สำเร็จ', 'เพิ่มสนามหลักเรียบร้อยแล้ว กรุณาเพิ่มสนามย่อยในหน้าถัดไป', [
                { 
                    text: 'ตกลง', 
                    onPress: () => navigation.navigate('AddCourts', { 
                        fieldId: createdField.id, 
                        fieldName: createdField.name 
                    }) 
                }
            ]);
        } catch (error: any) {
            console.error('Add venue error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถเพิ่มสนามได้ในขณะนี้');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: any) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.textArea]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                keyboardType={keyboardType}
                multiline={multiline}
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={100}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerDecoration} />

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💎 รายละเอียดสนามพรีเมียม</Text>
                    <Text style={styles.cardSubtitle}>ยกระดับสนามของคุณด้วยข้อมูลที่ครบถ้วน</Text>

                    {/* Premium Image Selection Section */}
                    <Text style={styles.label}>รูปภาพสนาม (แนะนำ 3-5 รูป) * {uploadingImages && '(กำลังอัปโหลด...)'}</Text>

                    {localImages.length > 0 ? (
                        <View style={styles.heroImageContainer}>
                            <Image source={{ uri: localImages[0] }} style={styles.heroImage} />
                            <TouchableOpacity
                                style={styles.changeHeroBtn}
                                onPress={() => removeImage(0)}
                            >
                                <Text style={styles.changeHeroText}>เปลี่ยนรูปหลัก</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.emptyHeroBtn} onPress={handleAddImage}>
                            <Text style={styles.emptyHeroIcon}>🌅</Text>
                            <Text style={styles.emptyHeroText}>เลือกรูปภาพจากคลังรูปภาพ</Text>
                        </TouchableOpacity>
                    )}

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                        {localImages.length > 0 && (
                            <TouchableOpacity
                                style={[styles.smallAddBtn, uploadingImages && styles.smallAddBtnDisabled]}
                                onPress={handleAddImage}
                                disabled={uploadingImages}
                            >
                                <Text style={styles.smallAddIcon}>{uploadingImages ? '⏳' : '+'}</Text>
                            </TouchableOpacity>
                        )}

                        {localImages.slice(1).map((img, index) => (
                            <View key={index + 1} style={styles.imageWrapper}>
                                <Image source={{ uri: img }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.removeImageBtn}
                                    onPress={() => removeImage(index + 1)}
                                >
                                    <Text style={styles.removeImageText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <InputField
                        label="ชื่อสนาม *"
                        value={name}
                        onChangeText={setName}
                        placeholder="เช่น สนามฟุตบอลพรีเมียม"
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <RoyaltyPicker
                                label="ประเภทกีฬา *"
                                value={sportType}
                                placeholder="เลือกกีฬา"
                                onPress={() => setSportModal(true)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <InputField
                                label="ราคาต่อชั่วโมง *"
                                value={price}
                                onChangeText={setPrice}
                                placeholder="เช่น 1200"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <RoyaltyPicker
                                label="เวลาเปิด"
                                value={openingTime}
                                placeholder="08:00"
                                onPress={() => setOpenTimeModal(true)}
                                icon="🕒"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <RoyaltyPicker
                                label="เวลาปิด"
                                value={closingTime}
                                placeholder="22:00"
                                onPress={() => setCloseTimeModal(true)}
                                icon="🕒"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <RoyaltyPicker
                                label="จังหวัด *"
                                value={province?.name}
                                placeholder="เลือกจังหวัด"
                                onPress={() => setProvinceModal(true)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <RoyaltyPicker
                                label="เขต/อำเภอ *"
                                value={district?.name}
                                placeholder={province ? "เลือกเขต" : "เลือกจังหวัดก่อน"}
                                onPress={() => province ? setDistrictModal(true) : Alert.alert('แจ้งเตือน', 'กรุณาเลือกจังหวัดก่อน')}
                            />
                        </View>
                    </View>

                    <InputField
                        label="ที่อยู่สนาม (เลขที่บ้าน, ถนน) *"
                        value={address}
                        onChangeText={setAddress}
                        placeholder="เช่น 123/45 ซอย 5 ถนนพระราม 4"
                    />

                    <InputField
                        label="คำอธิบายสนาม"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="รายละเอียดเพิ่มเติม สิ่งอำนวยความสะดวก ฯลฯ"
                        multiline={true}
                    />

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={handleAddVenue}
                        disabled={loading}
                    >
                        <Text style={styles.submitBtnText}>
                            {loading ? 'กำลังส่งข้อมูล...' : '✨ สร้างสนามพรีเมียม'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Modals */}
                <SelectionModal
                    visible={sportModal}
                    title="เลือกประเภทกีฬา"
                    data={SPORT_TYPES}
                    onSelect={(item: string) => setSportType(item)}
                    onClose={() => setSportModal(false)}
                />
                <SelectionModal
                    visible={provinceModal}
                    title="เลือกจังหวัด"
                    data={THAI_LOCATIONS}
                    onSelect={(item: Province) => {
                        setProvince(item);
                        setDistrict(null); // Reset district when province changes
                    }}
                    onClose={() => setProvinceModal(false)}
                />
                <SelectionModal
                    visible={districtModal}
                    title={`เลือกเขต/อำเภอ (${province?.name})`}
                    data={availableDistricts}
                    onSelect={(item: District) => setDistrict(item)}
                    onClose={() => setDistrictModal(false)}
                />
                <SelectionModal
                    visible={openTimeModal}
                    title="เลือกเวลาเปิด"
                    data={TIME_OPTIONS}
                    onSelect={(item: string) => setOpeningTime(item)}
                    onClose={() => setOpenTimeModal(false)}
                />
                <SelectionModal
                    visible={closeTimeModal}
                    title="เลือกเวลาปิด"
                    data={TIME_OPTIONS}
                    onSelect={(item: string) => setClosingTime(item)}
                    onClose={() => setCloseTimeModal(false)}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7F4',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    headerDecoration: {
        position: 'absolute',
        top: -width * 0.2,
        right: -width * 0.1,
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        backgroundColor: 'rgba(26, 95, 42, 0.05)',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.12,
        shadowRadius: 25,
        elevation: 8,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A5F2A',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        fontWeight: '500',
    },
    label: {
        fontSize: 14,
        fontWeight: '800',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#F9FBF9',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1a1a1a',
        borderWidth: 1.5,
        borderColor: '#E8EBE8',
        fontWeight: '600',
    },
    pickerTrigger: {
        backgroundColor: '#F9FBF9',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: '#E8EBE8',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    pickerIcon: {
        fontSize: 12,
        color: '#C5A021',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    imageScroll: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    addImageBtn: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#F0F7F0',
        borderWidth: 2,
        borderColor: '#1A5F2A',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addImageIcon: {
        fontSize: 24,
        marginBottom: 2,
    },
    addImageText: {
        fontSize: 11,
        color: '#1A5F2A',
        fontWeight: '800',
    },
    imageWrapper: {
        marginRight: 12,
        position: 'relative',
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 20,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF3B30',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
    },
    // New Premium Gallery Styles
    heroImageContainer: {
        width: '100%',
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#F0F7F0',
        borderWidth: 1,
        borderColor: 'rgba(26, 95, 42, 0.1)',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    changeHeroBtn: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    changeHeroText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    emptyHeroBtn: {
        width: '100%',
        height: 200,
        borderRadius: 24,
        backgroundColor: '#F9FBF9',
        borderWidth: 2,
        borderColor: '#1A5F2A',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyHeroIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    emptyHeroText: {
        fontSize: 14,
        color: '#1A5F2A',
        fontWeight: '700',
    },
    smallAddBtn: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#1A5F2A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#1A5F2A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    smallAddIcon: {
        fontSize: 32,
        color: '#1A5F2A',
        fontWeight: '300',
    },
    smallAddBtnDisabled: {
        opacity: 0.5,
        borderColor: '#999',
    },
    submitBtn: {
        backgroundColor: '#C5A021',
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#C5A021',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    submitBtnDisabled: {
        backgroundColor: '#E8EBE8',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: height * 0.7,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1A5F2A',
    },
    closeBtnText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '800',
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
