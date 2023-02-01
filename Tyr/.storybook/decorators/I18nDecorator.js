import React, { useEffect } from 'react';

import { I18nService } from '#/services/i18n';
import { i18n } from '#/components/i18n';

class DummyDB {
  get() {
    return 'en';
  }
}

const storage = new DummyDB();
const i18nService = new I18nService(storage);

export const I18nDecorator = (Story) => {
  useEffect(() => {
    i18nService.init(
      () => {},
      (err) => console.error(err)
    );
  }, []);

  return (
    <i18n.Provider value={i18nService}>
      <Story />
    </i18n.Provider>
  );
};
