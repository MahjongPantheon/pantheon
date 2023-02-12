import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';
import { AbortScreenView } from '#/components/screens/table/screens/select-plyers/AbortScreenView';

export default {
  title: 'Screens/Abort',
  component: AbortScreenView,
};

const actions = {
  onRiichiClick: action('onRiichiClick'),
  onBackClick: action('onBackClick'),
  onNextClick: action('onNextClick'),
};

const idleButtonState = {
  isRiichiPressed: false,
};

export const Demo = () => {
  return (
    <AbortScreenView
      topPlayer={{
        ...topPlayer,
        ...idleButtonState,
        isRiichiPressed: true,
      }}
      leftPlayer={{
        ...leftPlayer,
        ...idleButtonState,
      }}
      rightPlayer={{
        ...rightPlayer,
        ...idleButtonState,
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
    <AbortScreenView
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
