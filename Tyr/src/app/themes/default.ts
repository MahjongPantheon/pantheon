import { Theme } from './interface';

export const defaultTheme: Theme = {
  name: 'defaultTheme',
  humanReadableTitle: 'Default theme',
  properties: {
    '--main-bg-color': '#2C632C',
    '--main-button-bg-color': '#865931',
    '--main-button-bg-color-hl': '#8e6036',
    '--main-text-color': '#C6C7C4',
    '--main-border-color': '#9B8573',

    '--main-bg-color-lite': '#8BA98B',
    '--main-button-bg-color-lite': '#BDA48E',
    '--main-text-color-lite': '#DFE0DE',
    '--main-border-color-lite': '#C8BCB2',

    '--secondary-bg-color': '#8AA399',
    '--secondary-bg-color-active': '#BFCCC7',
    '--secondary-text-color': '#183618',

    '--secondary-button-bg-color': '#2B4162',

    '--navbar-bg-color': '#183618',

    '--emergency-color': 'rgb(179, 0, 27)',
    '--warning-color': 'rgb(221, 215, 141)',
    '--safe-color': 'rgb(44, 99, 44)',

    '--emergency-color-semi': 'rgba(179, 0, 27, 0.2)',
    '--warning-color-semi': 'rgba(221, 215, 141, 0.2)',
    '--safe-color-semi': 'rgba(44, 99, 44, 0.2)',
  }
};
