import React, { useContext } from 'react';
import { i18n } from '#/components/i18n';
import {
  TemplaiScreenView,
  TemplaiScreenViewProps,
} from '#/components/screens/table/screens/select-plyers/TemplaiScreenView';

export type NagashiTemplaiScreenViewProps = Omit<TemplaiScreenViewProps, 'title'>;

export const NagashiTemplaiScreenView: React.FC<NagashiTemplaiScreenViewProps> = (props) => {
  const loc = useContext(i18n);

  return <TemplaiScreenView {...props} title={loc._t('Select tempai')} />;
};
