import React, { useContext } from 'react';
import { i18n } from '#/components/i18n';
import {
  TemplaiScreenView,
  TemplaiScreenViewProps
} from "#/components/screens/table/screens/select-plyers/TemplaiScreenView";

export type DrawScreenViewProps = Omit<TemplaiScreenViewProps, 'title'>

export const DrawScreenView: React.FC<DrawScreenViewProps> = (props) => {
  const loc = useContext(i18n);

  return (
    <TemplaiScreenView {...props} title={loc._t('Draw')} />
  )
};
