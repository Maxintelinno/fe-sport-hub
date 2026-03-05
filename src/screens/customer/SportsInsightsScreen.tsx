import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const MOCK_INSIGHTS = [
    { id: '1', title: '5 เทคนิคเตะบอลให้แม่น', category: 'ฟุตบอล', icon: '⚽', content: 'การเตะบอลให้แม่นยำต้องเริ่มจากการวางเท้าหลัก การจัดระเบียบร่างกาย และการเลือกใช้ส่วนของเท้าที่เหมาะสมกับสถานการณ์...' },
    { id: '2', title: 'ยืดเหยียดก่อนแข่งสำคัญยังไง?', category: 'สุขภาพ', icon: '🧘', content: 'การยืดเหยียดช่วยเพิ่มความยืดหยุ่น ลดความเสี่ยงในการบาดเจ็บ และช่วยให้ระบบไหลเวียนโลหิตทำงานได้ดีขึ้นก่อนเริ่มกิจกรรมหนัก...' },
    { id: '3', title: 'รวมสนามบาสในร่มสุดเจ๋ง', category: 'บาสเกตบอล', icon: '🏀', content: 'พาไปดูสนามบาสเกตบอลในร่มที่มีพื้นไม้มาตรฐานสากล แสงสว่างเพียงพอ และสิ่งอำนวยความสะดวกครบครันในเขตกรุงเทพฯ...' },
    { id: '4', title: 'เตรียมตัวอย่างไรก่อนลงแข่งเทนนิส', category: 'เทนนิส', icon: '🎾', content: 'การเตรียมความพร้อมทั้งด้านร่างกาย จิตใจ และอุปกรณ์เป็นสิ่งสำคัญมากสำหรับนักเทนนิส ไม่ว่าจะเป็นการเช็คสตริงไม้ หรือการวอร์มอัพเฉพาะจุด...' },
    { id: '5', title: 'การเลือกพื้นสนามหญ้าเทียมที่เหมาะกับคุณ', category: 'ความรู้สนาม', icon: '🌱', content: 'สนามหญ้าเทียมมีหลายเกรด การเลือกสนามที่มีความนุ่มและระบบระบายน้ำที่ดีจะช่วยลดแรงกระแทกบริเวณหัวเข่าและข้อเท้า...' },
];

export default function SportsInsightsScreen() {
    const renderItem = ({ item }: { item: typeof MOCK_INSIGHTS[0] }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <View style={styles.headerText}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.title}>{item.title}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
                <TouchableOpacity style={styles.readMoreBtn}>
                    <Text style={styles.readMoreText}>อ่านต่อ</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={MOCK_INSIGHTS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerSubtitle}>เพิ่มทักษะและเกร็ดความรู้สำหรับนักกีฬา</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8faf8',
    },
    list: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 20,
        marginTop: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#edf2ed',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: '#f0f7f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 32,
    },
    headerText: {
        flex: 1,
    },
    categoryBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    categoryText: {
        color: '#1a5f2a',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a1a',
        lineHeight: 24,
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    content: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 12,
    },
    readMoreBtn: {
        alignSelf: 'flex-end',
    },
    readMoreText: {
        color: '#1a5f2a',
        fontWeight: '700',
        fontSize: 14,
    },
});
