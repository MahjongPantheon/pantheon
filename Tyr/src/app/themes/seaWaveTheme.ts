import { Theme } from './interface';

export const seaWaveTheme: Theme = {
  name: 'seaWaveTheme',
  humanReadableTitle: 'Sea wave theme',
  properties: {
    '--main-bg-color': '#0b3956',
    '--main-button-bg-color': '#4a92a8',
    '--main-button-bg-color-hl': '#4a92a8',
    '--main-text-color': 'white',
    '--main-border-color': '#9B8573',

    '--main-bg-color-lite': '#8BA98B',
    '--main-button-bg-color-lite': '#BDA48E',
    '--main-text-color-lite': '#DFE0DE',
    '--main-border-color-lite': '#C8BCB2',

    '--secondary-bg-color': '#a0c5cf',
    '--secondary-bg-color-active': '#e6eceb',
    '--secondary-text-color': '#183618',

    '--secondary-button-bg-color': '#2B4162',

    '--navbar-bg-color': '#261a2b',

    '--emergency-color': 'rgb(179, 0, 27)',
    '--warning-color': 'rgb(249, 246, 143)',
    '--safe-color': 'rgb(44, 99, 44)',

    '--emergency-color-semi': 'rgba(179, 0, 27, 0.2)',
    '--warning-color-semi': 'rgba(249, 246, 143, 0.2)',
    '--safe-color-semi': 'rgba(44, 99, 44, 0.2)',

    '--button-background-style': 'linear-gradient(to bottom, var(--main-button-bg-color) 0%, var(--main-button-bg-color-hl) 50%, var(--main-button-bg-color) 51%, var(--main-button-bg-color) 100%)',

    '--button-border-radius': '5px',
    '--button-box-shadow': '6px 6px 13px 0 var(--secondary-text-color)',
    '--button-border': 'none',
    '--button-text-color': 'var(--main-text-color)',
    '--button-font-size': '15px',
    '--button-padding': '6px 15px',
    '--button-text-decoration': 'none',
    '--button-text-shadow': '0 1px 0 var(--navbar-bg-color)',

    '--button-active-box-shadow': '2px 2px 3px 0 var(--secondary-text-color)',
    '--button-active-border': 'none',
    '--button-active-text-color': 'var(--main-text-color)',
  }
};
