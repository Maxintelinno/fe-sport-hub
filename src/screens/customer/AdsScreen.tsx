import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>โฆษณา</Text>
      <Text style={styles.subtitle}>พื้นที่สำหรับโฆษณาและโปรโมชั่น</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a5f2a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
