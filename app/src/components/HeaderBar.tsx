import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

interface HeaderBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  style?: any;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ left, center, right, style }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.space[4],
      paddingTop: theme.space[1],
      paddingBottom: theme.space[2],
      backgroundColor: theme.colors.card,
      ...style,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    side: {
      minWidth: theme.space[6],
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.side}>{left}</View>
      <View style={styles.center}>{center}</View>
      <View style={styles.side}>{right}</View>
    </View>
  );
}; 