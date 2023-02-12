import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';
import { ChomboScreenView } from '#/components/screens/table/screens/select-plyers/ChomboScreenView';

export default {
  title: 'Screens/Chombo',
  component: ChomboScreenView,
};

const actions = {
  onLoseClick: action('onLoseClick'),
  onBackClick: action('onBackClick'),
  onNextClick: action('onNextClick'),
};

const idleButtonState = {
  loseButtonPressed: false,
  loseButtonDisabled: false,
};

export const Demo = () => {
  return (
    <ChomboScreenView
      topPlayer={{
        ...topPlayer,
        ...idleButtonState,
        loseButtonDisabled: true,
      }}
      leftPlayer={{
        ...leftPlayer,
        ...idleButtonState,
        loseButtonDisabled: true,
      }}
      rightPlayer={{
        ...rightPlayer,
        ...idleButtonState,
        loseButtonPressed: true,
      }}
      bottomPlayer={{
        ...bottomPlayer,
        ...idleButtonState,
        loseButtonDisabled: true,
      }}
      isNextDisabled={false}
      {...actions}
    />
  );
};

export const Idle = () => {
  return (
    <ChomboScreenView
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
