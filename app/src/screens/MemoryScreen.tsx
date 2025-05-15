import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function MemoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Memory is now managed by the server.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    padding: 16,
  },
}); 