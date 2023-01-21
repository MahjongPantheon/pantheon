import * as React from 'react';
import { I18nService } from '#/services/i18n';

// we'll always fit it with service in runtime, ignore error
// @ts-expect-error
export const i18n = React.createContext<I18nService>(null);
