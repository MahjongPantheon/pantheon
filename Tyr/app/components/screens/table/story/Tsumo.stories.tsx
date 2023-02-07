import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  TsumoScreenView,
  TsumoScreenViewProps,
} from '#/components/screens/table/screens/select-plyers/TsumoScreenView';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';

export default {
  title: 'Screens/Tsumo',
  component: TsumoScreenView,
};

const actions = {
  onWinClick: action('onWinClick'),
  onRiichiClick: action('onRiichiClick'),
  onBackClick: action('onBackClick'),
  onNextClick: action('onNextClick'),
};

const idleButtonState = {
  winButtonPressed: false,
  winButtonDisabled: false,
  isRiichiPressed: false,
};

export const Demo = () => {
  return (
    <TsumoScreenView
      topPlayer={{
        ...topPlayer,
        ...idleButtonState,
        winButtonPressed: true,
        isRiichiPressed: true,
      }}
      leftPlayer={{
        ...leftPlayer,
        ...idleButtonState,
        winButtonDisabled: true,
      }}
      rightPlayer={{
        ...rightPlayer,
        ...idleButtonState,
        winButtonDisabled: true,
        isRiichiPressed: true,
      }}
      bottomPlayer={{
        ...bottomPlayer,
        ...idleButtonState,
        winButtonDisabled: true,
      }}
      {...actions}
      isNextDisabled
    />
  );
};

export const Idle = () => {
  return (
    <TsumoScreenView
      topPlayer={{
        ...topPlayer,
        ...idleButtonState,
      }}
      leftPlayer={{
        ...leftPlayer,
        ...idleButtonState,
      }}
      rightPlayer={{
        ...rightPlayer,
        ...idleButtonState,
      }}
      bottomPlayer={{
        ...bottomPlayer,
        ...idleButtonState,
      }}
      {...actions}
    />
  );
};
