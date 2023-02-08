import React from 'react';
import { action } from '@storybook/addon-actions';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';
import { PaoScreenView } from '#/components/screens/table/screens/select-plyers/PaoScreenView';

export default {
  title: 'Screens/Pao',
  component: PaoScreenView,
};

const actions = {
  onLoseClick: action('onLoseClick'),
  onBackClick: action('onBackClick'),
  onNextClick: action('onNextClick'),
};

const idleButtonState = {
  loseButtonPressed: false,
};

export const Tsumo = () => {
  return (
    <PaoScreenView
      topPlayer={{
        ...topPlayer,
        ...idleButtonState,
        loseButtonPressed: true,
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
      winnerId={rightPlayer.id}
      {...actions}
    />
  );
};

export const Ron = () => {
  return (
    <PaoScreenView
      topPlayer={{
        ...topPlayer,
        ...idleButtonState,
        loseButtonPressed: true,
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
      winnerId={rightPlayer.id}
      loserId={bottomPlayer.id}
      {...actions}
    />
  );
};

export const Idle = () => {
  return (
    <PaoScreenView
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
      winnerId={rightPlayer.id}
      {...actions}
    />
  );
};
