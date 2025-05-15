import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type MenuOption = {
  label: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
};

interface MenuSheetProps {
  visible: boolean;
  onClose: () => void;
  options: MenuOption[];
}

export const MenuSheet: React.FC<MenuSheetProps> = ({ visible, onClose, options }) => {
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show menu with faster animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 200, // Faster animation (200ms instead of default 300ms)
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide menu
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: theme.space[3],
      paddingBottom: theme.space[5],
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.space[3],
      paddingHorizontal: theme.space[2],
    },
    optionText: {
      fontSize: theme.fontSizes[2],
      marginLeft: theme.space[3],
    },
    iconContainer: {
      width: 24,
      alignItems: 'center',
    },
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [
                { translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                })}
              ],
              opacity: fadeAnim,
            }
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionContainer}
              onPress={() => {
                onClose();
                option.onPress();
              }}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={20}
                  color={option.destructive ? '#FF3B30' : theme.colors.text}
                />
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: option.destructive ? '#FF3B30' : theme.colors.text }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}; 