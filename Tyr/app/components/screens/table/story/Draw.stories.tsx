import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  TsumoScreenView,
  TsumoScreenViewProps,
} from '#/components/screens/table/screens/select-plyers/TsumoScreenView';
import {
  DrawScreenView,
  DrawScreenViewProps,
} from '#/components/screens/table/screens/select-plyers/DrawScreenView';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';

export default {
  title: 'Screens/Draw',
  component: DrawScreenView,
};

const actions = {
  onWinClick: action('onWinClick'),
  onRiichiClick: action('onRiichiClick'),
  onBackClick: action('onBackClick'),
  onNextClick: action('onNextClick'),
  onDeadHandClick: action('onDeadHandClick'),
};

const idleButtonState = {
  winButtonPressed: false,
  deadButtonPressed: false,
  isRiichiPressed: false,
};

export const Demo = () => {
  return (
    <DrawScreenView
      topPlayer={{
        ...topPlayer,
        ...idleButtonState,
        deadButtonPressed: true,
        isRiichiPressed: true,
      }}
      leftPlayer={{
        ...leftPlayer,
        ...idleButtonState,
        winButtonPressed: true,
      }}
      rightPlayer={{
        ...rightPlayer,
        ...idleButtonState,
        winButtonPressed: true,
        isRiichiPressed: true,
      }}
      bottomPlayer={{
        ...bottomPlayer,
        ...idleButtonState,
      }}
      {...actions}
    />
  );
};

export const Idle = () => {
  return (
    <DrawScreenView
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
