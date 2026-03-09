import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthStack';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'RoleSelect'>;
  route: RouteProp<AuthStackParamList, 'RoleSelect'>;
};

export default function RoleSelectScreen({ navigation, route }: Props) {
  const { phoneNumber } = route.params;
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>ROYAL EXPERIENCE</Text>
          <View style={styles.goldLine} />
          <Text style={styles.subtitle}>สัมผัสประสบการณ์ระดับพรีเมียม</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => navigation.navigate('Register', { role: 'cust', phoneNumber })}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.cardEmoji}>👤</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>ผู้จองสนาม</Text>
            <Text style={styles.cardDesc}>ค้นหาและจองสนามกีฬาที่ดีที่สุด</Text>
          </View>
          <Text style={styles.arrow}>❯</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => navigation.navigate('Register', { role: 'owner', phoneNumber })}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.cardEmoji}>🏢</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>เจ้าของสนาม</Text>
            <Text style={styles.cardDesc}>ลงสนามและจัดการการจองอย่างมืออาชีพ</Text>
          </View>
          <Text style={styles.arrow}>❯</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('CustomerMain' as any);
            }
          }}
        >
          <Text style={styles.backText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.bottomGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9', // Pearl Base
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  crown: {
    fontSize: 48,
    marginBottom: 12,
    textShadowColor: 'rgba(26, 95, 42, 0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 12,
    color: '#1A5F2A', // Deep Royal Emerald
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  goldLine: {
    width: 40,
    height: 2,
    backgroundColor: '#C5A021', // Rich Gold
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    color: '#1A5F2A',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.1)',
    shadowColor: '#1A5F2A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F7F4',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 42, 0.1)',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A5F2A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 18,
    color: '#C5A021', // Gold arrow
    opacity: 0.8,
    marginLeft: 10,
  },
  backButton: {
    marginTop: 32,
    alignSelf: 'center',
    padding: 12,
  },
  backText: {
    color: '#1A5F2A',
    opacity: 0.6,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -150,
    width: width,
    height: 300,
    backgroundColor: '#1A5F2A',
    opacity: 0.05,
    borderRadius: width / 2,
    transform: [{ scaleX: 2 }],
  },
});
