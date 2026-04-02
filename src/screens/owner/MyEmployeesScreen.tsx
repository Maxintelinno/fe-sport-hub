import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<OwnerStackParamList, 'MyEmployees'>;

export default function MyEmployeesScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Mock data for now
  const employees = [
    { id: '1', name: 'มานะ ขยันกิจ', role: 'ผู้ดูแลสนาม', phone: '081-xxx-xxxx', status: 'Active' },
    { id: '2', name: 'ชูใจ ใจดี', role: 'พนักงานต้อนรับ', phone: '082-xxx-xxxx', status: 'Active' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>👨‍💼 พนักงานของฉัน</Text>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddEmployee')}
          >
            <Text style={styles.addBtnText}>+ เพิ่มพนักงาน</Text>
          </TouchableOpacity>
        </View>

        {employees.map((emp) => (
          <View key={emp.id} style={styles.employeeCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{emp.name.charAt(0)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{emp.name}</Text>
              <Text style={styles.role}>{emp.role} • {emp.phone}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{emp.status}</Text>
            </View>
          </View>
        ))}

        {employees.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ยังไม่มีพนักงานในทีม</Text>
          </View>
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
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(26, 95, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#1A5F2A' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  role: { fontSize: 13, color: '#666', fontWeight: '600' },
  statusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '800', color: '#4CAF50' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#999', fontWeight: '600' },
});
