import { i18n } from '../app/components/i18n';
import { StorageStrategyClient } from '../../Common/storageStrategyClient';
import { Storage } from '../../Common/storage';
import { I18nService } from '../app/services/i18n';
import { PropsWithChildren } from 'react';
import themes from '../app/components/themes.module.css';

const storageStrategy = new StorageStrategyClient('');
const storage = new Storage();
storage.setStrategy(storageStrategy);
const i18nService = new I18nService(storage);

const I18nProviderMock = ({ children }: PropsWithChildren) => {
  i18nService.init(
    () => {},
    (err) => console.error(err)
  );
  return <i18n.Provider value={i18nService}>{children}</i18n.Provider>;
};

export const PageDecorator = (Story: any) => (
  <I18nProviderMock>
    <div className={themes.themeDay}>
      <Story />
    </div>
  </I18nProviderMock>
);
