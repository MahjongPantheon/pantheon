import { Injectable, Inject, EventEmitter } from '@angular/core';
import { THEMES, ACTIVE_THEME } from './symbols';
import { Theme } from '../../themes/interface';

/*
Сервис надо переделать следующим образом:
- Убрать директиву
- Навесить на <html> (либо на корневой компонент, что наверное даже более логично) класс с именем темы
- Менять этот класс согласно текущей теме в стейте
- Сами темы сделать простыми перечислениями переменных - можно ли это сделать в зависимости от класса на корневом элементе??
 */

@Injectable()
export class ThemeService {

  themeChange = new EventEmitter<Theme>();

  constructor(
    @Inject(THEMES) public themes: Theme[],
    @Inject(ACTIVE_THEME) public theme: string
  ) {}

  getTheme(name: string) {
    const theme = this.themes.find(t => t.name === name);
    if (!theme) {
      throw new Error(`Theme not found: '${name}'`);
    }
    return theme;
  }

  themeExists(name: string) {
    const theme = this.themes.find(t => t.name === name);
    return !!theme;
  }

  getActiveTheme() {
    if (this.theme) {
      return this.getTheme(this.theme);
    }
  }

  getProperty(propName: string) {
    return this.getActiveTheme().properties[propName];
  }

  setTheme(name: string) {
    this.theme = name;
    this.themeChange.emit( this.getActiveTheme());
  }

  registerTheme(theme: Theme) {
    this.themes.push(theme);
  }

  updateTheme(name: string, properties: { [key: string]: string; }) {
    const theme = this.getTheme(name);
    theme.properties = {
      ...theme.properties,
      ...properties
    };

    if (name === this.theme) {
      this.themeChange.emit(theme);
    }
  }

}
