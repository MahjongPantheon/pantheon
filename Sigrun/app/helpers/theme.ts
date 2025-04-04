import { MantineThemeColorsOverride, MantineThemeOverride } from '@mantine/core';

export const themeOptions: MantineThemeOverride = {
  primaryColor: 'blue',
  fontFamily: 'IBM Plex Sans, Noto Sans Wind, Sans, serif',
};

export const dimmedColors: MantineThemeColorsOverride = {
  red: [
    '#F6EEEE',
    '#E6D0D0',
    '#D7B2B2',
    '#C79494',
    '#B77676',
    '#A75858',
    '#864646',
    '#643535',
    '#432323',
    '#211212',
  ],
  orange: [
    '#F9F1EB',
    '#EFD8C7',
    '#E6BEA3',
    '#DCA57F',
    '#D28B5B',
    '#C87237',
    '#A05B2C',
    '#784421',
    '#502E16',
    '#28170B',
  ],
  yellow: [
    '#F9F5EB',
    '#EEE2C8',
    '#E4CFA5',
    '#D9BC82',
    '#CEAA5E',
    '#C4973B',
    '#9D792F',
    '#755B24',
    '#4E3C18',
    '#271E0C',
  ],
  green: [
    '#EEF6F2',
    '#D0E6DB',
    '#B3D6C4',
    '#95C6AD',
    '#77B695',
    '#59A67E',
    '#478565',
    '#35644C',
    '#244233',
    '#122119',
  ],
  lime: [
    '#F1F6EE',
    '#D7E6D0',
    '#BDD6B3',
    '#A4C695',
    '#8AB677',
    '#70A659',
    '#5A8547',
    '#436435',
    '#2D4224',
    '#162112',
  ],
  teal: [
    '#EFF6F6',
    '#D1E5E5',
    '#B4D5D4',
    '#97C4C3',
    '#79B4B2',
    '#5CA3A1',
    '#498381',
    '#376260',
    '#254140',
    '#122120',
  ],
  cyan: [
    '#EFF5F5',
    '#D3E2E4',
    '#B6CFD3',
    '#9ABCC1',
    '#7DA9B0',
    '#61969E',
    '#4D787F',
    '#3A5A5F',
    '#273C3F',
    '#131E20',
  ],
  blue: [
    '#EDF2F7',
    '#CEDCE9',
    '#AEC5DA',
    '#8FAECC',
    '#6F97BE',
    '#5081AF',
    '#40678C',
    '#304D69',
    '#203346',
    '#101A23',
  ],
  purple: [
    '#F1F0F5',
    '#D9D4E2',
    '#C0B9D0',
    '#A79DBD',
    '#8F82AB',
    '#766699',
    '#5E527A',
    '#473D5C',
    '#2F293D',
    '#18141F',
  ],
  grape: [
    '#F5EDF7',
    '#E2CDEA',
    '#CFACDC',
    '#BC8CCF',
    '#AA6CC1',
    '#974BB4',
    '#793C90',
    '#5B2D6C',
    '#3C1E48',
    '#1E0F24',
  ],
  pink: [
    '#F7EDF2',
    '#EACDDC',
    '#DCACC5',
    '#CF8CAE',
    '#C16C97',
    '#B44B81',
    '#903C67',
    '#6C2D4D',
    '#481E33',
    '#240F1A',
  ],
};

export function getThemeOptions(isDimmed = false): MantineThemeOverride {
  if (isDimmed) {
    return { ...themeOptions, colors: dimmedColors };
  }

  return themeOptions;
}

export function calcDimmedBackground(
  isDimmed = false,
  isDark = false,
  specialColor?: string
): string {
  if (!isDark) {
    return isDimmed ? '#edf2f7' : (specialColor ?? '#e3fafc');
  }

  return isDimmed ? '#14283a' : '#14283a';
}

export function calcDimmedText(isDimmed = false, isDark = false, specialColor?: string): string {
  if (!isDark) {
    return isDimmed ? '#40678c' : (specialColor ?? '#228be6');
  }

  return isDimmed ? '#40678c' : '#228be6';
}
