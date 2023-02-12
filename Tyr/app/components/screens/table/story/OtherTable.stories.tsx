import React from 'react';
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

const actions = {
  onScoreClick: action('onScoreClick'),
  onHomeClick: action('onHomeClick'),
  onRefreshClick: action('onRefreshClick'),
  onLogClick: action('onLogClick'),
  onRotateCwClick: action('onRotateCwClick'),
  onRotateCcwClick: action('onRotateCcwClick'),
};

export const Demo = () => (
  <OtherTableScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    topRotated={false}
    round='東1'
    riichiCount={1}
    honbaCount={3}
    {...actions}
  />
);

export const DiffBy = () => (
  <OtherTableScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    topRotated={false}
    round='東1'
    riichiCount={1}
    honbaCount={3}
    diffById={bottomPlayer.id}
    {...actions}
  />
);

export const SingleDevice = () => (
  <OtherTableScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    topRotated={true}
    round='東1'
    riichiCount={1}
    honbaCount={3}
    {...actions}
  />
);
