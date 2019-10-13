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
