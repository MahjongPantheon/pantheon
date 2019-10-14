import { Theme } from './interface';

export const classicLightTheme: Theme = {
  name: 'classicLight',
  humanReadableTitle: 'Classic light theme',
  properties: {
    '--main-bg-color': '#fffaf5',
    '--main-button-bg-color': 'var(--navbar-bg-color)',
    '--main-text-color': '#1a1a1a',
    '--main-border-color': '#9B8573',

    '--main-bg-color-lite': '#8BA98B',
    '--main-button-bg-color-lite': '#BDA48E',
    '--main-text-color-lite': '#DFE0DE',
    '--main-border-color-lite': '#C8BCB2',

    '--secondary-bg-color': '#dedad7',
    '--secondary-bg-color-active': '#9e9e9e',
    '--secondary-text-color': '#4b4b4b',

    '--secondary-button-bg-color': '#2B4162',

    '--navbar-bg-color': '#b9b2ac',

    '--emergency-color': 'rgb(179, 0, 27)',
    '--warning-color': '#928d87',
    '--safe-color': 'rgb(44, 99, 44)',

    '--emergency-color-semi': '#e8c6cb',
    '--warning-color-semi': '#eae8e6',
    '--safe-color-semi': '#cceacc',

    '--badge-text-color': '#f7f3ef',
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
    '--tenbou-border-color': 'var(--secondary-text-color)',

    '--yaku-item-button-margin': '2px',
    '--yaku-row-padding': '2px 4px',
    '--yaku-item-button-border': '2px',
    '--screen-yaku-select-bg-color': 'var(--secondary-bg-color)',
    '--yaku-row-bg-color-0': 'var(--secondary-bg-color)',
    '--yaku-row-bg-color-1': 'var(--secondary-bg-color)',
    '--yaku-row-bg-color-2': 'var(--secondary-bg-color)',
    '--yaku-row-bg-color-3': 'var(--secondary-bg-color)',
    '--yaku-row-bg-color-4': 'var(--secondary-bg-color)',
    '--yaku-row-bg-color-5': 'var(--secondary-bg-color)',
    '--yaku-row-bg-color-6': 'var(--secondary-bg-color)',
  }
};
