import { Theme } from '@react-navigation/native';

export interface DadTheme extends Theme {
  colors: {
    text: string;
    textSecondary: string;
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    card: string;
    border: string;
    notification: string;
    userBubbleBg: string;
    userBubbleText: string;
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

const base =  {
  hue: 5,
  saturation: 25,
}

export const primativeColors = {
  "100": `hsl(${base.hue}, ${base.saturation}%, 100%)`, // Pure white
  "98": `hsl(${base.hue}, ${base.saturation}%, 98%)`,  // Very light background
  "95": `hsl(${base.hue}, ${base.saturation}%, 95%)`,  // Muted background
  "90": `hsl(${base.hue}, ${base.saturation}%, 90%)`,  // Card background
  "85": `hsl(${base.hue}, ${base.saturation}%, 85%)`,  
  "80": `hsl(${base.hue}, ${base.saturation}%, 80%)`,  // Primary accent
  "70": `hsl(${base.hue}, ${base.saturation}%, 70%)`,
  "60": `hsl(${base.hue}, ${base.saturation}%, 60%)`,
  "50": `hsl(${base.hue}, ${base.saturation}%, 50%)`,
  "40": `hsl(${base.hue}, ${base.saturation}%, 40%)`,
  "30": `hsl(${base.hue}, ${base.saturation}%, 30%)`,
  "20": `hsl(${base.hue}, ${base.saturation}%, 20%)`, // Text color
  "15": `hsl(${base.hue}, ${base.saturation}%, 15%)`,
  "10": `hsl(${base.hue}, ${base.saturation}%, 10%)`,
  "05": `hsl(${base.hue}, ${base.saturation}%, 5%)`,
  "02": `hsl(${base.hue}, ${base.saturation}%, 2%)`,
  "00": `hsl(${base.hue}, ${base.saturation}%, 0%)`,
};

// Updated theme using primitive colors
export const theme: DadTheme = {
  dark: false,
  colors: {
    text: primativeColors["20"], // Dark brown for text
    textSecondary: primativeColors["40"], // Dark brown for text
    background: primativeColors["98"], // Very light background
    primary: primativeColors["80"], // Soft pink accent
    muted: primativeColors["95"], // Light pink for muted areas
    card: primativeColors["100"], // White for cards/bubbles
    border: primativeColors["90"], // Light brown for borders
    userBubbleBg: primativeColors['90'], // User message bubble background
    userBubbleText: primativeColors['30'], // User message bubble text
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

export const darkTheme: DadTheme = {
  dark: true,
  colors: {
    text: primativeColors["95"], // Light text
    textSecondary: primativeColors["60"],
    background: primativeColors["02"], // Very dark background
    primary: primativeColors["20"], // Accent
    muted: primativeColors["05"], // Muted dark
    card: primativeColors["10"], // Card background
    border: primativeColors["10"], // Border
    userBubbleBg: primativeColors['10'], // User message bubble background
    userBubbleText: primativeColors['70'], // User message bubble text
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
console.log('darkTheme.colors.background', darkTheme.colors.background); 