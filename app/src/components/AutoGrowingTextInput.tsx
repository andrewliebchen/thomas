import React, { useRef, useState, useEffect } from 'react';
import { TextInput } from 'react-native';

interface AutoGrowingTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  placeholder: string;
  placeholderTextColor: string;
  editable: boolean;
  style: any;
  textColor: string;
  onKeyPress?: (event: any) => void;
  multiline?: boolean;
}

export const AutoGrowingTextInput: React.FC<AutoGrowingTextInputProps> = ({ 
  value, 
  onChangeText, 
  onSubmitEditing, 
  placeholder, 
  placeholderTextColor, 
  editable, 
  style, 
  textColor,
  onKeyPress,
  multiline = true
}) => {
  const inputRef = useRef<TextInput>(null);
  const [height, setHeight] = useState(36);
  
  // Force update height when value changes
  useEffect(() => {
    if (value === '') {
      setHeight(36);
    } else if (inputRef.current) {
      // @ts-ignore - accessing private API
      inputRef.current.setNativeProps({ style: { height: 'auto' } });
      // @ts-ignore - accessing private API
      inputRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (height > 36) {
          setHeight(height);
        } else {
          setHeight(36);
        }
      });
    }
  }, [value]);
  
  return (
    <TextInput
      ref={inputRef}
      style={[
        style,
        { 
          height: Math.max(36, height),
          color: textColor,
          paddingTop: 8,
          paddingBottom: 8,
        }
      ]}
      multiline={multiline}
      value={value}
      onChangeText={onChangeText}
      onContentSizeChange={(event) => {
        const newHeight = event.nativeEvent.contentSize.height;
        setHeight(newHeight);
      }}
      onSubmitEditing={onSubmitEditing}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      returnKeyType="send"
      blurOnSubmit={false}
      editable={editable}
      textAlignVertical="center"
    />
  );
}; 