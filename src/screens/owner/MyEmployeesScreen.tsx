import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Alert, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '../../navigation/types';
import { getStaffList, StaffListItem, deactivateStaff } from '../../services/profileService';

type NavigationProp = NativeStackNavigationProp<OwnerStackParamList, 'MyEmployees'>;

export default function MyEmployeesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [employees, setEmployees] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getStaffList();
      setEmployees(data);
    } catch (error: any) {
      console.error('Fetch staff error:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถดึงข้อมูลพนักงานได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEmployees(false);
    }, [fetchEmployees])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmployees(false);
  }, [fetchEmployees]);

  const handleDelete = (staffUserId: string) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบพนักงานคนนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deactivateStaff(staffUserId);
              Alert.alert('สำเร็จ', 'ลบพนักงานเรียบร้อยแล้ว');
              fetchEmployees(); // Refresh list after deactivation
            } catch (error: any) {
              Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถลบพนักงานได้');
            }
          } 
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A5F2A" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>👨‍💼 พนักงานของฉัน</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddEmployee')}
          >
            <Text style={styles.addBtnText}>+ เพิ่มพนักงาน</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A5F2A" />
          </View>
        ) : (
          <>
            {employees.map((emp) => (
              <View key={emp.id} style={styles.employeeCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(emp.fullname || emp.username).charAt(0)}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{emp.fullname || 'ไม่ระบุชื่อ'}</Text>
                        <Text style={styles.username}>@{emp.username}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge, 
                        { 
                            position: 'absolute', 
                            right: 0, 
                            top: 0,
                            backgroundColor: emp.status === 'active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)'
                        }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: emp.status === 'active' ? '#4CAF50' : '#9E9E9E' }
                        ]}>
                            {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.cardBody}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>บทบาท/ตำแหน่ง:</Text>
                        <Text style={styles.detailValue}>{emp.role_code.charAt(0).toUpperCase() + emp.role_code.slice(1)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>เบอร์โทรศัพท์:</Text>
                        <Text style={styles.detailValue}>{emp.phone || '-'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>วันที่สร้าง:</Text>
                        <Text style={styles.detailValue}>{formatDate(emp.created_at)}</Text>
                    </View>
                </View>

                {emp.status !== 'inactive' && (
                  <View style={styles.cardFooter}>
                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(emp.staff_user_id)}
                    >
                      <Text style={styles.deleteBtnText}>ลบพนักงาน</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {employees.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>ยังไม่มีพนักงานในทีม</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF9' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '900', color: '#1a1a1a' },
  addBtn: { backgroundColor: '#1A5F2A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, position: 'relative' },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(26, 95, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 24, fontWeight: '900', color: '#1A5F2A' },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  username: { fontSize: 14, color: '#1A5F2A', fontWeight: '700', marginBottom: 2 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '800' },
  cardBody: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 15,
    marginBottom: 16,
  },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  detailLabel: { fontSize: 13, color: '#666', fontWeight: '600' },
  detailValue: { fontSize: 13, color: '#333', fontWeight: '800' },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, alignItems: 'flex-end' },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  deleteBtnText: { color: '#FF3B30', fontSize: 13, fontWeight: '900' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#999', fontWeight: '600' },
});
