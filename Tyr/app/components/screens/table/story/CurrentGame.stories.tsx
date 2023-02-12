import React from 'react';
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
  onCenterClick: action('onCenterClick'),
  onOutcomeMenuClose: action('onModalClose'),
  onOutcomeSelect: action('onOutcomeSelect'),
};

const defaultData = {
  topRotated: false,
  round: '東1',
  riichiCount: 1,
  honbaCount: 3,
  isOutcomeMenuVisible: false,
  isAbortiveDrawAvailable: false,
  isNagashiAvailable: false,
};

export const Demo = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    {...defaultData}
    {...actions}
  />
);

export const DiffBy = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    {...defaultData}
    {...actions}
    diffById={bottomPlayer.id}
  />
);

export const Penalties = () => (
  <CurrentGameScreenView
    topPlayer={{ ...topPlayer, penalties: 2000 }}
    leftPlayer={{ ...leftPlayer, penalties: 20000 }}
    rightPlayer={{ ...rightPlayer, penalties: 400 }}
    bottomPlayer={{ ...bottomPlayer, penalties: 1200 }}
    {...defaultData}
    {...actions}
  />
);

export const SingleDevice = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    {...defaultData}
    {...actions}
    topRotated={true}
  />
);

export const CenterPressed = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    {...defaultData}
    {...actions}
    showTableNumber={true}
    tableNumber={4}
  />
);

export const OutcomeMenu = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    {...defaultData}
    {...actions}
    isOutcomeMenuVisible={true}
  />
);

export const OutcomeMenuAll = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    {...defaultData}
    {...actions}
    isOutcomeMenuVisible={true}
    isAbortiveDrawAvailable={true}
    isNagashiAvailable={true}
  />
);

export const Timer = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    {...defaultData}
    {...actions}
    timer='12:05'
  />
);

export const DealsLeft = () => (
  <CurrentGameScreenView
    topPlayer={topPlayer}
    leftPlayer={leftPlayer}
    rightPlayer={rightPlayer}
    bottomPlayer={bottomPlayer}
    {...defaultData}
    {...actions}
    dealsLeft={2}
  />
);
