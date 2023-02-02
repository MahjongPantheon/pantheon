import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  RonScreenView,
  RonScreenViewProps,
} from '#/components/screens/table/screens/RonScreenView';

export default {
  title: 'Screens/Ron',
  component: RonScreenView,
};

const data: Pick<RonScreenViewProps, 'topPlayer' | 'leftPlayer' | 'rightPlayer' | 'bottomPlayer'> =
  {
    topPlayer: {
      id: 1,
      displayName: 'Player12',
      wind: '東',
      winButtonPressed: true,
      winButtonDisabled: false,
      loseButtonPressed: false,
      loseButtonDisabled: true,
      isRiichiPressed: false,
    },
    leftPlayer: {
      id: 2,
      displayName: 'Player playerplayerplayerplayer',
      wind: '南',
      winButtonPressed: true,
      winButtonDisabled: false,
      loseButtonPressed: false,
      loseButtonDisabled: true,
      isRiichiPressed: false,
    },
    rightPlayer: {
      id: 3,
      displayName: 'Player8',
      wind: '北',
      winButtonPressed: false,
      winButtonDisabled: true,
      loseButtonPressed: true,
      loseButtonDisabled: false,
      isRiichiPressed: true,
    },
    bottomPlayer: {
      id: 3,
      displayName: 'Player2',
      wind: '西',
      winButtonPressed: false,
      winButtonDisabled: false,
      loseButtonPressed: false,
      loseButtonDisabled: true,
      isRiichiPressed: true,
    },
  };

export const Demo = () => {
  return (
    <RonScreenView
      {...data}
      onWinClick={action('onBackClick')}
      onLoseClick={action('onBackClick')}
      onRiichiClick={action('onBackClick')}
      onBackClick={action('onBackClick')}
      isNextDisabled
      onNextClick={action('onNextClick')}
    />
  );
};
