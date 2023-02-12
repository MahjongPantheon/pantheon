import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';
import { NagashiScreenView } from '#/components/screens/table/screens/select-plyers/NagashiScreenView';

export default {
  title: 'Screens/Nagashi/Select',
  component: NagashiScreenView,
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
};

export const Demo = () => {
  return (
    <NagashiScreenView
      topPlayer={{
        ...topPlayer,
        ...idleButtonState,
        winButtonPressed: true,
      }}
      leftPlayer={{
        ...leftPlayer,
        ...idleButtonState,
        winButtonPressed: true,
      }}
      rightPlayer={{
        ...rightPlayer,
        ...idleButtonState,
        winButtonDisabled: true,
      }}
      bottomPlayer={{
        ...bottomPlayer,
        ...idleButtonState,
        winButtonPressed: true,
      }}
      isNextDisabled={false}
      {...actions}
    />
  );
};

export const Idle = () => {
  return (
    <NagashiScreenView
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
      isNextDisabled={true}
      {...actions}
    />
  );
};
