import React, { useState } from 'react';
import { CurrentGameScreenView } from '#/components/screens/table/screens/overview/CurrentGameScreenView';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Screens/CurrentGame',
  component: CurrentGameScreenView,
};

const actions = {
  onScoreClick: action('onScoreClick'),
  onHomeClick: action('onHomeClick'),
  onAddClick: action('onAddClick'),
  onRefreshClick: action('onRefreshClick'),
  onLogClick: action('onLogClick'),
};

export const Demo = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    round='東1'
    riichiCount={1}
    honbaCount={3}
    {...actions}
  />
);

export const DiffBy = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    round='東1'
    riichiCount={1}
    honbaCount={3}
    diffById={bottomPlayer.id}
    {...actions}
  />
);
