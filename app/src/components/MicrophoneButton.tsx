import React, { useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, ActivityIndicator, Text, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { SimpleLineIcons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';

interface MicrophoneButtonProps {
  onRecordingComplete: (audioFile: File) => void;
  isDisabled?: boolean;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ 
  onRecordingComplete, 
  isDisabled = false 
}) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    console.log('Starting recording process...');
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      console.log('Microphone permission status:', status);
      
      if (status !== 'granted') {
        console.log('Microphone permission denied');
        Alert.alert(
          'Permission Required',
          'Microphone access is required to record voice messages.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Set audio mode with proper configuration
      console.log('Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      // Create a new recording instance
      console.log('Creating new recording instance...');
      const recording = new Audio.Recording();
      
      // Prepare the recording with minimal settings
      console.log('Preparing recording with minimal settings...');
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 32000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 32000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 32000,
        },
      });
      
      // Start recording
      console.log('Starting recording...');
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      
      console.log('Recording started successfully');
      
      // Start timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    
    try {
      setIsProcessing(true);
      
      // Stop the recording
      console.log('Stopping recording...');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      if (!uri) {
        console.error('No recording URI available');
        setIsProcessing(false);
        return;
      }
      
      console.log('Recording stopped, URI:', uri);
      
      // Get the blob from the URI
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a File object with a format that OpenAI definitely accepts
      const audioFile = new File([blob], 'recording.m4a', { type: 'audio/m4a' });
      
      console.log('Created audio file for transcription:', {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size
      });
      
      // Reset recording state
      recordingRef.current = null;
      setIsRecording(false);
      
      // Pass the File object to the parent component for immediate transcription
      onRecordingComplete(audioFile);
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      recordingRef.current = null;
      setIsRecording(false);
      setIsProcessing(false);
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      Alert.alert(
        'Recording Error',
        'Failed to process the recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isRecording ? '#FF3B30' : theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    durationText: {
      fontSize: 12,
      color: theme.colors.text,
      marginTop: 4,
    },
    processingContainer: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 2,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { opacity: isDisabled ? 0.5 : 1 }]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isDisabled || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <SimpleLineIcons 
            name={isRecording ? "close" : "microphone"} 
            size={20} 
            color="#fff" 
          />
        )}
      </TouchableOpacity>
      {isRecording && (
        <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
      )}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
        </View>
      )}
    </View>
  );
}; 