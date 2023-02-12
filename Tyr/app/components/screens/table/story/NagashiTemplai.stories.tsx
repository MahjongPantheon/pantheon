import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';
import { NagashiScreenView } from '#/components/screens/table/screens/select-plyers/NagashiScreenView';
import { NagashiTemplaiScreenView } from '#/components/screens/table/screens/select-plyers/NagashiTemplaiScreenView';

export default {
  title: 'Screens/Nagashi/Tempai',
  component: NagashiScreenView,
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
    <NagashiTemplaiScreenView
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
    <NagashiTemplaiScreenView
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
