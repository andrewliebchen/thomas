import React from 'react';
import { Text, TextProps, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export const StyledText: React.FC<TextProps> = ({ style, ...props }) => {
  const theme = useTheme();
  return <Text style={[{ color: theme.colors.text }, style]} {...props} />;
};

export const Heading: React.FC<TextProps> = ({ style, ...props }) => {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          color: theme.colors.text,
          fontFamily: theme.fonts.heading,
          fontSize: theme.fontSizes[4],
          lineHeight: theme.lineHeights.heading,
          fontWeight: '700',
        },
        style,
      ]}
      {...props}
    />
  );
};

export const Container: React.FC<View['props']> = ({ style, ...props }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background,
          padding: theme.space[3],
        },
        style,
      ]}
      {...props}
    />
  );
};

export const Input: React.FC<TextInput['props']> = ({ style, ...props }) => {
  const theme = useTheme();
  return (
    <TextInput
      style={[
        {
          backgroundColor: theme.colors.muted,
          color: theme.colors.text,
          padding: theme.space[2],
          borderRadius: 8,
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes[2],
        },
        style,
      ]}
      placeholderTextColor={theme.colors.text + '80'}
      {...props}
    />
  );
};

export const Button: React.FC<React.ComponentProps<typeof TouchableOpacity>> = ({ style, ...props }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: theme.colors.primary,
          padding: theme.space[2],
          borderRadius: 8,
          alignItems: 'center',
        },
        style,
      ]}
      {...props}
    />
  );
}; 