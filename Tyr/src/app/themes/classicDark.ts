import { Theme } from './interface';

export const classicDarkTheme: Theme = {
  name: 'classicDark',
  humanReadableTitle: 'Classic dark theme',
  properties: {
    '--main-bg-color': '#2a2a2a',
    '--main-button-bg-color': 'var(--navbar-bg-color)',
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

    '--navbar-bg-color': '#686868',

    '--emergency-color': 'rgb(179, 0, 27)',
    '--warning-color': '#4b4b4b',
    '--safe-color': 'rgb(44, 99, 44)',

    '--emergency-color-semi': '#e6b6bc',
    '--warning-color-semi': '#c3c3c3',
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
    '--tenbou-border-color': 'var(--main-text-color)',

    '--yaku-item-button-margin': '2px',
    '--yaku-row-padding': '2px 4px',
    '--yaku-item-button-border': '2px',
    '--screen-yaku-select-bg-color': 'var(--main-bg-color)',
    '--yaku-row-bg-color-0': 'var(--main-bg-color)',
    '--yaku-row-bg-color-1': 'var(--main-bg-color)',
    '--yaku-row-bg-color-2': 'var(--main-bg-color)',
    '--yaku-row-bg-color-3': 'var(--main-bg-color)',
    '--yaku-row-bg-color-4': 'var(--main-bg-color)',
    '--yaku-row-bg-color-5': 'var(--main-bg-color)',
    '--yaku-row-bg-color-6': 'var(--main-bg-color)',
  }
};
