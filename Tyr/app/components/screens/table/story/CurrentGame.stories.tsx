import React, { useState } from 'react';
import { CurrentGameScreenView } from '#/components/screens/table/screens/CurrentGameScreenView';

export default {
  title: 'Screens/CurrentGame',
  component: CurrentGameScreenView,
};

const data = {
  topPlayer: {
    id: 1,
    displayName: 'Player12',
    wind: '東',
    score: 8000,
    penalties: 0,
  },
  leftPlayer: {
    id: 2,
    displayName: 'Player playerplayerplayerplayer',
    wind: '南',
    score: 50000,
    penalties: 0,
  },
  rightPlayer: {
    id: 3,
    displayName: 'Player8',
    wind: '北',
    score: -100,
    penalties: 0,
  },
  bottomPlayer: {
    id: 4,
    displayName: 'Player2',
    wind: '西',
    score: 32100,
    penalties: 0,
  },
  round: '東1',
  riichiCount: 1,
  honbaCount: 3,
};

export const Demo = () => {
  const [diffBy, setDiffBy] = useState<number | undefined>(undefined);

  const onScoreClick = (id: number) => {
    if (id === diffBy) {
      setDiffBy(undefined);
    } else {
      setDiffBy(id);
    }
  };

  return (
    <CurrentGameScreenView
      {...data}
      diffById={diffBy}
      onScoreClick={onScoreClick}
      onHomeClick={() => console.log('onHomeClick')}
      onAddClick={() => console.log('onAddClick')}
      onRefreshClick={() => console.log('onRefreshClick')}
      onLogClick={() => console.log('onLogClick')}
    />
  );
};
