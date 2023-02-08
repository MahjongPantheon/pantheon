import React, { useState } from 'react';
import { OtherTableScreenView } from '#/components/screens/table/screens/overview/OtherTableScreenView';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Screens/OtherTable',
  component: OtherTableScreenView,
};

export const Demo = () => (
  <OtherTableScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    round='東1'
    riichiCount={1}
    honbaCount={3}
    onScoreClick={action('onScoreClick')}
    onHomeClick={action('onHomeClick')}
    onRefreshClick={action('onRefreshClick')}
    onLogClick={action('onLogClick')}
  />
);

export const DiffBy = () => (
  <OtherTableScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    round='東1'
    riichiCount={1}
    honbaCount={3}
    diffById={bottomPlayer.id}
    onScoreClick={action('onScoreClick')}
    onHomeClick={action('onHomeClick')}
    onRefreshClick={action('onRefreshClick')}
    onLogClick={action('onLogClick')}
  />
);
