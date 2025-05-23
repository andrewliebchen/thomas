import { Theme } from '@react-navigation/native';

export interface DadTheme extends Theme {
  colors: {
    text: string;
    textSecondary: string;
    background: string;
    primary: string;
    muted: string;
    card: string;
    border: string;
    userBubbleBg: string;
    userBubbleText: string;
    button: string;
    buttonText: string;
    buttonDisabled: string;
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
  fontSizes: {
    large: number;
    small: number;
  };
  lineHeights: {
    large: number;
    small: number;
  };
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
  "92": `hsl(${base.hue}, ${base.saturation}%, 92%)`,  
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
  "08": `hsl(${base.hue}, ${base.saturation}%, 8%)`,
  "05": `hsl(${base.hue}, ${base.saturation}%, 5%)`,
  "02": `hsl(${base.hue}, ${base.saturation}%, 2%)`,
  "00": `hsl(${base.hue}, ${base.saturation}%, 0%)`,
};

const baseThemeValues = {
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
  fontSizes: {
    large: 20,
    small: 16,
  },
  lineHeights: {
    large: 28,
    small: 22,
  },
  space: [0, 4, 8, 16, 24, 32, 48, 64],
  breakpoints: ['0px', '40em', '52em', '64em'],
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
    card: primativeColors["90"], // White for cards/bubbles
    border: primativeColors["85"], // Light brown for borders
    userBubbleBg: primativeColors["92"], // User message bubble background
    userBubbleText: primativeColors['40'], // User message bubble text
    button: primativeColors['20'], // Button color
    buttonText: primativeColors['90'], // Button text color
    buttonDisabled: primativeColors['70'], // Button disabled color
  },
  ...baseThemeValues,
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
    border: primativeColors["20"], // Border
    userBubbleBg: primativeColors['08'], // User message bubble background
    userBubbleText: primativeColors['60'], // User message bubble text
    button: primativeColors['80'], // Button color
    buttonText: primativeColors['10'], // Button text color
    buttonDisabled: primativeColors['30'], // Button disabled color
  },
  ...baseThemeValues,
};