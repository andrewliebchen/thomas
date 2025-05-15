import { Theme } from '@react-navigation/native';

export interface DadTheme extends Theme {
  colors: {
    text: string;
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    card: string;
    border: string;
    notification: string;
  };
  fonts: {
    body: string;
    heading: string;
    monospace: string;
  };
  fontWeights: {
    body: string;
    heading: string;
    bold: string;
  };
  lineHeights: {
    body: number;
    heading: number;
  };
  fontSizes: number[];
  space: number[];
  breakpoints: string[];
  dark: boolean;
}

export const theme: DadTheme = {
  dark: false,
  colors: {
    text: '#2C3E50',
    background: '#FFFBF8',
    primary: '#FF8B7E',
    secondary: '#7FBEEB',
    accent: '#98D7C2',
    muted: '#FFF0E6',
    card: '#FFFFFF',
    border: '#E5D5C5',
    notification: '#FF9B7E',
  },
  fonts: {
    body: 'System',
    heading: 'System',
    monospace: 'Menlo',
  },
  fontWeights: {
    body: '400',
    heading: '700',
    bold: '700',
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  space: [0, 4, 8, 16, 24, 32, 48, 64],
  breakpoints: ['0px', '40em', '52em', '64em'],
}; 