import { Theme } from './interface';

export const defaultTheme: Theme = {
  name: 'defaultTheme',
  humanReadableTitle: 'Default theme',
  properties: {
    '--main-bg-color': '#2b6519',
    '--main-button-bg-color': '#ccc',
    '--main-button-bg-color-hl': '#ccc',
    '--main-text-color': '#e8e8e8',
    '--main-border-color': '#9B8573',

    '--main-bg-color-lite': '#8BA98B',
    '--main-button-bg-color-lite': '#BDA48E',
    '--main-text-color-lite': '#DFE0DE',
    '--main-border-color-lite': '#C8BCB2',

    '--secondary-bg-color': '#8AA399',
    '--secondary-bg-color-active': '#BFCCC7',
    '--secondary-text-color': '#000000',

    '--secondary-button-bg-color': '#2B4162',

    '--navbar-bg-color': '#183618',

    '--emergency-color': 'rgb(179, 0, 27)',
    '--warning-color': 'rgb(206, 199, 113)',
    '--safe-color': 'rgb(44, 99, 44)',

    '--emergency-color-semi': 'rgba(179, 0, 27, 0.2)',
    '--warning-color-semi': 'rgba(206, 199, 113, 0.2)',
    '--safe-color-semi': 'rgba(44, 99, 44, 0.2)',

    '--badge-text-color': 'var(--main-text-color)',
    '--button-background-style': 'linear-gradient(to bottom, var(--main-button-bg-color) 0%, var(--main-button-bg-color-hl) 50%, var(--main-button-bg-color) 51%, var(--main-button-bg-color) 100%)',

    '--button-border-radius': '5px',
    '--button-box-shadow': '2px 2px 3px 0 var(--secondary-text-color)',
    '--button-border': 'none',
    '--button-text-color': 'var(--secondary-text-color)',
    '--button-font-size': '15px',
    '--button-padding': '6px 15px',
    '--button-text-decoration': 'none',
    '--button-text-shadow': 'none',

    '--button-active-box-shadow': '1px 1px 1px 0 var(--secondary-text-color)',
    '--button-active-border': 'none',
    '--button-active-text-color': 'var(--secondary-text-color)',
    '--timer-yellow-zone-color': 'var(--secondary-text-color)',
    '--light-color': '#dddddd',
    '--tenbou-border-color': '#fff',

    '--yaku-item-button-margin': '7px',
    '--yaku-row-padding': '0',
    '--yaku-item-button-border': '4px',
    '--screen-yaku-select-bg-color': 'var(--navbar-bg-color)',
    '--yaku-row-bg-color-0': '#444',
    '--yaku-row-bg-color-1': '#242',
    '--yaku-row-bg-color-2': '#224',
    '--yaku-row-bg-color-3': '#442',
    '--yaku-row-bg-color-4': '#424',
    '--yaku-row-bg-color-5': '#244',
    '--yaku-row-bg-color-6': '#422',
  }
};
