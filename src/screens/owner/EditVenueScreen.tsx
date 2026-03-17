import React, { useState, useMemo, useEffect } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OwnerStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { THAI_LOCATIONS, SPORT_TYPES, Province, District } from '../../data/locationData';
import * as ImagePicker from 'expo-image-picker';
import { getPresignedUrls, uploadToPresignedUrl, updateField, FieldImage } from '../../services/venueService';
import { getCourtsByField, createCourt, updateCourt, deleteCourt } from '../../services/bookingService';
import { Court } from '../../types';

const { width, height } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<OwnerStackParamList, 'EditVenue'>;
    route: RouteProp<OwnerStackParamList, 'EditVenue'>;
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

export default function EditVenueScreen({ navigation, route }: Props) {
    const { venue } = route.params;
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State - Pre-filled from venue
    const [name, setName] = useState(venue.name);
    const [sportType, setSportType] = useState(venue.sport_type);

    // Tab State
    const [activeTab, setActiveTab] = useState<'info' | 'courts'>('info');

    // Courts State
    const [courts, setCourts] = useState<Court[]>([]);
    const [loadingCourts, setLoadingCourts] = useState(false);
    
    // Court Form Modal State
    const [courtModalVisible, setCourtModalVisible] = useState(false);
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);
    const [courtName, setCourtName] = useState('');
    const [courtType, setCourtType] = useState('');
    const [courtCapacity, setCourtCapacity] = useState('');
    const [courtPrice, setCourtPrice] = useState('');
    const [savingCourt, setSavingCourt] = useState(false);

    useEffect(() => {
        if (activeTab === 'courts' && courts.length === 0) {
            fetchCourts();
        }
    }, [activeTab]);

    const fetchCourts = async () => {
        setLoadingCourts(true);
        try {
            const data = await getCourtsByField(venue.id);
            setCourts(data);
        } catch (error) {
            console.error('Fetch courts error:', error);
        } finally {
            setLoadingCourts(false);
        }
    };

    const handleOpenAddCourt = () => {
        setEditingCourt(null);
        setCourtName('');
        setCourtType(sportType || '');
        setCourtCapacity('');
        setCourtPrice('');
        setCourtModalVisible(true);
    };

    const handleOpenEditCourt = (court: Court) => {
        setEditingCourt(court);
        setCourtName(court.name);
        setCourtType(court.court_type || '');
        setCourtCapacity(court.capacity?.toString() || '');
        setCourtPrice(court.price_per_hour.toString());
        setCourtModalVisible(true);
    };

    const handleDeleteCourt = (courtId: string) => {
        Alert.alert('ยืนยันการลบ', 'คุณต้องการลบคอร์ทนี้ใช่หรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            { 
                text: 'ลบ', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteCourt(courtId);
                        setCourts(prev => prev.filter(c => c.id !== courtId));
                        Alert.alert('สำเร็จ', 'ลบคอร์ทเรียบร้อยแล้ว');
                    } catch (error: any) {
                        console.error('Delete court error:', error);
                        Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถลบได้');
                    }
                }
            }
        ]);
    };

    const handleSaveCourt = async () => {
        if (!courtName || !courtType || !courtCapacity || !courtPrice) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setSavingCourt(true);
        try {
            if (editingCourt) {
                await updateCourt(editingCourt.id, {
                    field_id: venue.id,
                    name: courtName,
                    court_type: courtType,
                    capacity: Number(courtCapacity),
                    price_per_hour: Number(courtPrice),
                    status: 'active'
                });
                Alert.alert('สำเร็จ', 'อัปเดตข้อมูลคอร์ทเรียบร้อยแล้ว');
            } else {
                await createCourt({
                    field_id: venue.id,
                    name: courtName,
                    price_per_hour: Number(courtPrice),
                    capacity: Number(courtCapacity),
                    court_type: courtType
                });
                Alert.alert('สำเร็จ', 'เพิ่มคอร์ทย่อยเรียบร้อยแล้ว');
            }
            await fetchCourts();
            setCourtModalVisible(false);
        } catch (error: any) {
            console.error('Save court error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลคอร์ทได้');
        } finally {
            setSavingCourt(false);
        }
    };
    const [openingTime, setOpeningTime] = useState(venue.open_time.substring(0, 5));
    const [closingTime, setClosingTime] = useState(venue.close_time.substring(0, 5));
    const [description, setDescription] = useState(venue.description);
    const [address, setAddress] = useState(venue.address_line);

    // Images State
    const [images, setImages] = useState<string[]>(venue.images?.map(img => img.image_url) || []); // Public URLs
    const [localImages, setLocalImages] = useState<string[]>(venue.images?.map(img => img.image_url) || []); // For preview
    const [uploadingImages, setUploadingImages] = useState<boolean>(false);
    const [uploadedImages, setUploadedImages] = useState<FieldImage[]>(venue.images?.map(img => ({
        object_key: img.object_key,
        sort_order: img.sort_order
    })) || []);

    const [province, setProvince] = useState<Province | null>(null);
    const [district, setDistrict] = useState<District | null>(null);

    // Initial Location Selection
    useEffect(() => {
        if (venue.province) {
            const foundProv = THAI_LOCATIONS.find(p => p.name === venue.province);
            if (foundProv) {
                setProvince(foundProv);
                if (venue.district) {
                    const foundDist = foundProv.districts.find(d => d.name === venue.district);
                    if (foundDist) {
                        setDistrict(foundDist);
                    }
                }
            }
        }
    }, [venue]);

    // Modal Visibility State
    const [sportModal, setSportModal] = useState(false);
    const [provinceModal, setProvinceModal] = useState(false);
    const [districtModal, setDistrictModal] = useState(false);
    const [openTimeModal, setOpenTimeModal] = useState(false);
    const [closeTimeModal, setCloseTimeModal] = useState(false);

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

            setLocalImages(prev => [...prev, ...newLocalUris].slice(0, 10));
            setUploadingImages(true);

            try {
                const presignFiles = selectedAssets.map(asset => ({
                    file_name: asset.fileName || `field_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
                    content_type: asset.mimeType || 'image/jpeg'
                }));

                const { files: presignedData } = await getPresignedUrls(presignFiles);

                const uploadPromises = presignedData.map((p, idx) =>
                    uploadToPresignedUrl(p.upload_url, selectedAssets[idx].uri, presignFiles[idx].content_type, p.object_key)
                );

                await Promise.all(uploadPromises);

                const publicUrls = presignedData.map(p => p.public_url);
                setImages(prev => [...prev, ...publicUrls].slice(0, 10));

                const newUploadedImages = presignedData.map((p, idx) => ({
                    object_key: p.object_key,
                    sort_order: images.length + idx
                }));
                setUploadedImages(prev => [...prev, ...newUploadedImages].slice(0, 10));

            } catch (error) {
                console.error('Upload error:', error);
                Alert.alert('อัปโหลดรูปภาพไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
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
            const resorted = updatedUploaded.map((img, idx) => ({
                ...img,
                sort_order: idx
            }));
            setUploadedImages(resorted);
        }
    };

    const handleUpdateVenue = async () => {
        if (!name || !sportType || !address || !province || !district) {
            Alert.alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
            return;
        }

        if (!user) return;

        setLoading(true);
        try {
            await updateField(venue.id, {
                owner_id: user.id,
                name,
                sport_type: sportType,
                price_per_hour: venue.price_per_hour,
                open_time: openingTime.length === 5 ? `${openingTime}:00` : openingTime,
                close_time: closingTime.length === 5 ? `${closingTime}:00` : closingTime,
                province: province.name,
                district: district.name,
                address_line: address,
                description: description,
                images: uploadedImages
            });

            Alert.alert('สำเร็จ', 'แก้ไขข้อมูลสนามเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Update venue error:', error);
            Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถแก้ไขข้อมูลสนามได้ในขณะนี้');
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
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tabBtn, activeTab === 'info' && styles.activeTabBtn]} 
                        onPress={() => setActiveTab('info')}
                    >
                        <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>ℹ️ ข้อมูลสนาม</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabBtn, activeTab === 'courts' && styles.activeTabBtn]} 
                        onPress={() => setActiveTab('courts')}
                    >
                        <Text style={[styles.tabText, activeTab === 'courts' && styles.activeTabText]}>🎾 คอร์ท (สนามย่อย)</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'info' ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>✏️ แก้ไขข้อมูลสนาม</Text>
                    <Text style={styles.cardSubtitle}>ปรับปรุงข้อมูลสนามของคุณให้ทันสมัยอยู่เสมอ</Text>

                    <Text style={styles.label}>รูปภาพสนาม * {uploadingImages && '(กำลังอัปโหลด...)'}</Text>

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
                                {uploadingImages ? <ActivityIndicator color="#1A5F2A" /> : <Text style={styles.smallAddIcon}>+</Text>}
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
                        <View style={{ flex: 1 }}>
                            <RoyaltyPicker
                                label="ประเภทกีฬา *"
                                value={sportType}
                                placeholder="เลือกกีฬา"
                                onPress={() => setSportModal(true)}
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
                        onPress={handleUpdateVenue}
                        disabled={loading}
                    >
                        <Text style={styles.submitBtnText}>
                            {loading ? 'กำลังบันทึกข้อมูล...' : '💾 บันทึกการเปลี่ยนแปลง'}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                    </TouchableOpacity>
                </View>
                ) : (
                <View style={styles.card}>
                    <View style={styles.courtHeaderRow}>
                        <View>
                            <Text style={styles.cardTitle}>🎾 จัดการคอร์ท</Text>
                            <Text style={styles.cardSubtitle}>กำหนดสนามย่อยและราคา</Text>
                        </View>
                        <TouchableOpacity style={styles.addCourtBtn} onPress={handleOpenAddCourt}>
                            <Text style={styles.addCourtBtnText}>+ เพิ่มคอร์ท</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingCourts ? (
                        <ActivityIndicator size="large" color="#1A5F2A" style={{ marginVertical: 30 }} />
                    ) : courts.length === 0 ? (
                        <View style={styles.emptyCourtsContainer}>
                            <Text style={styles.emptyCourtsIcon}>📋</Text>
                            <Text style={styles.emptyCourtsText}>ยังไม่มีคอร์ทย่อย</Text>
                            <Text style={styles.emptyCourtsSub}>เพิ่มคอร์ทเพื่อเริ่มเปิดรับการจอง</Text>
                        </View>
                    ) : (
                        courts.map((court) => (
                            <View key={court.id} style={styles.courtItemCard}>
                                <View style={styles.courtItemInfo}>
                                    <Text style={styles.courtItemName}>{court.name}</Text>
                                    <Text style={styles.courtItemType}>{court.court_type || sportType} • จุ {court.capacity || '-'} คน</Text>
                                    <Text style={styles.courtItemPrice}>฿{court.price_per_hour}/ชม.</Text>
                                </View>
                                <View style={styles.courtItemActions}>
                                    <TouchableOpacity style={styles.courtActionEdit} onPress={() => handleOpenEditCourt(court)}>
                                        <Text style={styles.courtActionText}>แก้ไข</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.courtActionDel} onPress={() => handleDeleteCourt(court.id)}>
                                        <Text style={styles.courtActionTextDel}>ลบ</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
                )}

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
                        setDistrict(null);
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

                {/* Court Modal */}
                <Modal visible={courtModalVisible} transparent animationType="slide">
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                        <View style={styles.modalContentLarge}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editingCourt ? 'แก้ไขคอร์ท' : 'เพิ่มคอร์ทใหม่'}</Text>
                                <TouchableOpacity onPress={() => setCourtModalVisible(false)} disabled={savingCourt}>
                                    <Text style={styles.closeBtnText}>ปิด</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <InputField
                                    label="ชื่อคอร์ท *"
                                    value={courtName}
                                    onChangeText={setCourtName}
                                    placeholder="เช่น คอร์ท A, พรีเมียม B"
                                />
                                <InputField
                                    label="ประเภทกีฬา *"
                                    value={courtType}
                                    onChangeText={setCourtType}
                                    placeholder="เช่น ฟุตบอล"
                                />
                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <InputField
                                            label="ความจุ (คน) *"
                                            value={courtCapacity}
                                            onChangeText={setCourtCapacity}
                                            placeholder="เช่น 10"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <InputField
                                            label="ราคา/ชม. *"
                                            value={courtPrice}
                                            onChangeText={setCourtPrice}
                                            placeholder="เช่น 1200"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={[styles.submitBtn, savingCourt && styles.submitBtnDisabled]} 
                                    onPress={handleSaveCourt}
                                    disabled={savingCourt}
                                >
                                    <Text style={styles.submitBtnText}>{savingCourt ? 'กำลังบันทึก...' : 'บันทึกข้อมูลคอร์ท'}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
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
        backgroundColor: '#1A5F2A',
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#1A5F2A',
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
    cancelBtn: {
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelBtnText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '700',
    },
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E8EBE8',
        borderRadius: 20,
        padding: 4,
        marginBottom: 20,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 16,
    },
    activeTabBtn: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#666',
    },
    activeTabText: {
        color: '#1A5F2A',
    },
    modalContentLarge: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: height * 0.9,
        padding: 24,
    },
    courtHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    addCourtBtn: {
        backgroundColor: '#C5A021',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addCourtBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyCourtsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#F9FBF9',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8EBE8',
        borderStyle: 'dashed',
    },
    emptyCourtsIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyCourtsText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyCourtsSub: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    courtItemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FBF9',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8EBE8',
    },
    courtItemInfo: {
        flex: 1,
    },
    courtItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    courtItemType: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    courtItemPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A5F2A',
    },
    courtItemActions: {
        flexDirection: 'row',
    },
    courtActionEdit: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
    },
    courtActionText: {
        color: '#1A5F2A',
        fontWeight: 'bold',
        fontSize: 13,
    },
    courtActionDel: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    courtActionTextDel: {
        color: '#FF3B30',
        fontWeight: 'bold',
        fontSize: 13,
    },
});
