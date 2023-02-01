import React from 'react';
import { CurrentGameScreenView } from '#/components/screens/table/screens/CurrentGameScreenView';
import { BeforeStartScreenView } from '#/components/screens/table/screens/BeforeStartScreenView';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Screens/BeforeStart',
  component: CurrentGameScreenView,
};

const data = {
  topPlayer: {
    displayName: 'Player12',
    wind: '東',
  },
  leftPlayer: {
    displayName: 'Player playerplayerplayerplayer',
    wind: '南',
  },
  rightPlayer: {
    displayName: 'Player8',
    wind: '北',
  },
  bottomPlayer: {
    displayName: 'Player2',
    wind: '西',
  },
  tableNumber: 4,
};

export const Demo = () => {
  return (
    <BeforeStartScreenView
      {...data}
      onHomeClick={action('onHomeClick')}
      onRefreshClick={action('onRefreshClick')}
    />
  );
};
