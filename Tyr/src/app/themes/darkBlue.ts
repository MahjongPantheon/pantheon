import { Theme } from './interface';

export const darkBlueTheme: Theme = {
  name: 'darkBlue',
  humanReadableTitle: 'Dark blue theme',
  properties: {
    '--main-bg-color': '#282c34',
    '--main-button-bg-color': '#865931',
    '--main-text-color': '#C6C7C4',
    '--main-border-color': '#9B8573',

    '--main-bg-color-lite': '#8BA98B',
    '--main-button-bg-color-lite': '#BDA48E',
    '--main-text-color-lite': '#DFE0DE',
    '--main-border-color-lite': '#C8BCB2',

    '--secondary-bg-color': '#d6d6d6',
    '--secondary-bg-color-active': '#9e9e9e',
    '--secondary-text-color': '#4b4b4b',

    '--secondary-button-bg-color': '#2B4162',

    '--navbar-bg-color': '#4b4b4b',

    '--emergency-color': 'rgb(179, 0, 27)',
    '--warning-color': '#4b4b4b',
    '--safe-color': 'rgb(44, 99, 44)',

    '--emergency-color-semi': '#e6b6bc',
    '--warning-color-semi': '#c5c2c2',
    '--safe-color-semi': '#afd8af',

    '--button-background-style': 'var(--main-button-bg-color)',

    '--button-border-radius': '5px',
    '--button-box-shadow': 'none',
    '--button-border': 'none',
    '--button-text-color': 'var(--main-text-color)',
    '--button-font-size': '15px',
    '--button-padding': '6px 15px',
    '--button-text-decoration': 'none',
    '--button-text-shadow': '0 1px 0 var(--navbar-bg-color)',

    '--button-active-box-shadow': 'none',
    '--button-active-border': 'none',
    '--button-active-text-color': 'var(--main-text-color)',
  }
};
