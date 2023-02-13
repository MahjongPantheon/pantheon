import React from 'react';
import { action } from '@storybook/addon-actions';
import { TsumoScreenView } from '#/components/screens/table/screens/select-plyers/TsumoScreenView';
import {
  bottomPlayer,
  leftPlayer,
  rightPlayer,
  topPlayer,
} from '#/components/screens/table/story/story-data/players';
import { ConfirmationScreenView } from '#/components/screens/table/screens/confirmation/ConfirmationScreenView';
import { PlayerSide } from '#/components/general/result-arrows/ResultArrowsProps';

export default {
  title: 'Screens/Confirmation',
  component: TsumoScreenView,
};

const actions = {
  onBackClick: action('onBackClick'),
  onSaveClick: action('onSaveClick'),
};

export const Ron = () => {
  return (
    <ConfirmationScreenView
      topPlayer={topPlayer}
      leftPlayer={leftPlayer}
      rightPlayer={{ ...rightPlayer, scoreDelta: -5200 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: 5200 }}
      outcomeTitle='Ron'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 5200,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.BOTTOM,
        },
      ]}
    />
  );
};

export const WinnerRiichi = () => {
  return (
    <ConfirmationScreenView
      topPlayer={topPlayer}
      leftPlayer={{ ...leftPlayer, scoreDelta: 3900, riichi: true }}
      rightPlayer={{ ...rightPlayer, scoreDelta: -3900 }}
      bottomPlayer={bottomPlayer}
      outcomeTitle='Ron'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 3900,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.LEFT,
        },
      ]}
    />
  );
};

export const LoserRiichi = () => {
  return (
    <ConfirmationScreenView
      topPlayer={topPlayer}
      leftPlayer={{ ...leftPlayer, scoreDelta: 4900 }}
      rightPlayer={{ ...rightPlayer, scoreDelta: -4900 }}
      bottomPlayer={bottomPlayer}
      outcomeTitle='Ron'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 3900,
          honbaPoints: 0,
          withRiichi: true,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.LEFT,
        },
      ]}
    />
  );
};

export const RiichiFromAnother = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, scoreDelta: -1000 }}
      leftPlayer={{ ...leftPlayer, scoreDelta: 4900 }}
      rightPlayer={{ ...rightPlayer, scoreDelta: -3900 }}
      bottomPlayer={bottomPlayer}
      outcomeTitle='Ron'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 3900,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.LEFT,
        },
        {
          points: 0,
          honbaPoints: 0,
          withRiichi: true,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.LEFT,
        },
      ]}
    />
  );
};

export const DoubleRon = () => {
  return (
    <ConfirmationScreenView
      topPlayer={topPlayer}
      leftPlayer={{ ...leftPlayer, scoreDelta: 2000 }}
      rightPlayer={{ ...rightPlayer, scoreDelta: -3000 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: 1000 }}
      outcomeTitle='Ron'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 2000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.LEFT,
        },
        {
          points: 1000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.BOTTOM,
        },
      ]}
    />
  );
};

export const RonPao = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, scoreDelta: -16000 }}
      leftPlayer={leftPlayer}
      rightPlayer={{ ...rightPlayer, scoreDelta: -16000 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: 32000 }}
      outcomeTitle='Ron'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 16000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: true,
          start: PlayerSide.TOP,
          end: PlayerSide.BOTTOM,
        },
        {
          points: 16000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.BOTTOM,
        },
      ]}
    />
  );
};

export const TsumoPao = () => {
  return (
    <ConfirmationScreenView
      topPlayer={topPlayer}
      leftPlayer={leftPlayer}
      rightPlayer={{ ...rightPlayer, scoreDelta: -32000 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: 32000 }}
      outcomeTitle='Tsumo'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 32000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: true,
          start: PlayerSide.RIGHT,
          end: PlayerSide.BOTTOM,
        },
      ]}
    />
  );
};

export const Tsumo = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, scoreDelta: -1000 }}
      leftPlayer={{ ...leftPlayer, scoreDelta: -500 }}
      rightPlayer={{ ...rightPlayer, scoreDelta: -500 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: 2000 }}
      outcomeTitle='Tsumo'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 1000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.BOTTOM,
        },
        {
          points: 500,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.LEFT,
          end: PlayerSide.BOTTOM,
        },
        {
          points: 500,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.BOTTOM,
        },
      ]}
    />
  );
};

export const Draw = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, scoreDelta: -1500 }}
      leftPlayer={{ ...leftPlayer, scoreDelta: 1500 }}
      rightPlayer={{ ...rightPlayer, scoreDelta: 1500 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: -1500 }}
      outcomeTitle='Draw'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 1500,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.BOTTOM,
          end: PlayerSide.LEFT,
        },
        {
          points: 1500,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.RIGHT,
        },
      ]}
    />
  );
};

// todo make it clear when riichi goes to table and + honba
export const DrawWithRiichi = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, scoreDelta: -2500 }}
      leftPlayer={{ ...leftPlayer, scoreDelta: 500 }}
      rightPlayer={{ ...rightPlayer, scoreDelta: 1500 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: -1500 }}
      outcomeTitle='Draw'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 1500,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.BOTTOM,
          end: PlayerSide.LEFT,
        },
        {
          points: 1500,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.RIGHT,
        },
      ]}
    />
  );
};

export const Chombo = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, penalty: true }}
      leftPlayer={leftPlayer}
      rightPlayer={rightPlayer}
      bottomPlayer={bottomPlayer}
      outcomeTitle='Chombo'
      topRotated={false}
      {...actions}
      payments={[]}
    />
  );
};

// todo support in app
export const ChomboReversedMangan = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, scoreDelta: -12000 }}
      leftPlayer={{ ...leftPlayer, scoreDelta: 4000 }}
      rightPlayer={{ ...rightPlayer, scoreDelta: 4000 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: 4000 }}
      outcomeTitle='Chombo'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 4000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.BOTTOM,
        },
        {
          points: 4000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.LEFT,
        },
        {
          points: 4000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.RIGHT,
        },
      ]}
    />
  );
};

// todo make it clear when riichi goes to table and + honba
export const Abort = () => {
  return (
    <ConfirmationScreenView
      topPlayer={topPlayer}
      leftPlayer={leftPlayer}
      rightPlayer={{ ...rightPlayer, scoreDelta: -1000 }}
      bottomPlayer={bottomPlayer}
      outcomeTitle='Abort'
      topRotated={false}
      {...actions}
      payments={[]}
    />
  );
};

// todo make it clear when riichi goes to table
//  is it possible to make it clear if we change dealer?
export const Nagashi = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, scoreDelta: -5000 }}
      leftPlayer={{ ...leftPlayer, scoreDelta: -2000 }}
      rightPlayer={{ ...rightPlayer, scoreDelta: 8000 }}
      bottomPlayer={{ ...bottomPlayer, scoreDelta: -2000 }}
      outcomeTitle='Nagashi'
      topRotated={false}
      {...actions}
      payments={[
        {
          points: 4000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.TOP,
          end: PlayerSide.RIGHT,
        },
        {
          points: 2000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.LEFT,
          end: PlayerSide.RIGHT,
        },
        {
          points: 2000,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.BOTTOM,
          end: PlayerSide.RIGHT,
        },
      ]}
    />
  );
};

export const SingleDevice = () => {
  return (
    <ConfirmationScreenView
      topPlayer={{ ...topPlayer, scoreDelta: 5200 }}
      leftPlayer={leftPlayer}
      rightPlayer={{ ...rightPlayer, scoreDelta: -5200 }}
      bottomPlayer={bottomPlayer}
      outcomeTitle='Ron'
      topRotated={true}
      {...actions}
      payments={[
        {
          points: 5200,
          honbaPoints: 0,
          withRiichi: false,
          withPao: false,
          start: PlayerSide.RIGHT,
          end: PlayerSide.TOP,
        },
      ]}
    />
  );
};
