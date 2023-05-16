import { Badge, Group, Stack } from '@mantine/core';
import * as React from 'react';
import { useI18n } from '../hooks/i18n';
const badgeVariant = 'light';

type RatingBadgeProps = {
  rating: number;
  avgPlace: number;
  avgScore: number;
  gamesPlayed: number;
  place: number;
  winnerZone: boolean;
  sortBy?: 'name' | 'rating' | 'avg_place' | 'avg_score';
};
export const RatingBadge = ({
  rating,
  avgPlace,
  avgScore,
  gamesPlayed,
  winnerZone,
  place,
  sortBy,
}: RatingBadgeProps) => {
  const slots = {
    rating: {
      color: winnerZone ? 'green' : 'red',
      value: rating.toFixed(0),
    },
    avgScore: {
      color: 'grape',
      value: avgScore.toFixed(0),
    },
    avgPlace: {
      color: 'orange',
      value: avgPlace.toFixed(2),
    },
    gamesPlayed: {
      color: 'cyan',
      value: gamesPlayed.toFixed(0),
    },
  };
  const slotPlacement = {
    main: slots.rating,
    top: slots.avgScore,
    bottomLeft: slots.avgPlace,
    bottomRight: slots.gamesPlayed,
  };
  switch (sortBy) {
    case 'avg_place':
      slotPlacement.main = slots.avgPlace;
      slotPlacement.top = slots.rating;
      slotPlacement.bottomLeft = slots.avgScore;
      break;
    case 'avg_score':
      slotPlacement.main = slots.avgScore;
      slotPlacement.top = slots.rating;
      break;
    case 'rating':
    case 'name':
    default:
  }
  return (
    <Group>
      <Group
        spacing={0}
        style={{
          overflow: 'hidden',
          borderRadius: '32px',
        }}
      >
        <Badge color='blue' variant={badgeVariant} size='lg' radius={0} h={32} w={54}>
          {place}
        </Badge>
        <Badge
          color={slotPlacement.main.color}
          size='lg'
          h={32}
          w={84}
          radius={0}
          variant={badgeVariant}
        >
          {slotPlacement.main.value}
        </Badge>
        <Stack spacing={0}>
          <Badge
            color={slotPlacement.top.color}
            radius={0}
            size='xs'
            variant={badgeVariant}
            w={100}
          >
            {slotPlacement.top.value}
          </Badge>
          <Group spacing={0}>
            <Badge
              color={slotPlacement.bottomLeft.color}
              radius={0}
              variant={badgeVariant}
              size='xs'
              w={60}
            >
              {slotPlacement.bottomLeft.value}
            </Badge>
            <Badge
              color={slotPlacement.bottomRight.color}
              radius={0}
              variant={badgeVariant}
              size='xs'
              w={40}
            >
              {slotPlacement.bottomRight.value}
            </Badge>
          </Group>
        </Stack>
      </Group>
    </Group>
  );
};

export const RatingBadgeLegend = ({
  sortBy,
}: {
  sortBy?: 'name' | 'rating' | 'avg_place' | 'avg_score';
}) => {
  const i18n = useI18n();
  const slots = {
    rating: {
      color: 'green',
      value: i18n._t('Rating'),
    },
    avgScore: {
      color: 'grape',
      value: i18n._t('Avg score'),
    },
    avgPlace: {
      color: 'orange',
      value: i18n._t('Avg place'),
    },
    gamesPlayed: {
      color: 'cyan',
      value: i18n._t('Games #'),
    },
  };
  const slotPlacement = {
    main: slots.rating,
    top: slots.avgScore,
    bottomLeft: slots.avgPlace,
    bottomRight: slots.gamesPlayed,
  };
  switch (sortBy) {
    case 'avg_place':
      slotPlacement.main = slots.avgPlace;
      slotPlacement.top = slots.rating;
      slotPlacement.bottomLeft = slots.avgScore;
      break;
    case 'avg_score':
      slotPlacement.main = slots.avgScore;
      slotPlacement.top = slots.rating;
      break;
    case 'rating':
    case 'name':
    default:
  }
  return (
    <Group>
      <Group
        spacing={0}
        style={{
          overflow: 'hidden',
          borderRadius: '32px',
        }}
      >
        <Badge color='blue' variant={badgeVariant} size='lg' radius={0} h={32}>
          {i18n._t('Place')}
        </Badge>
        <Badge color={slotPlacement.main.color} size='lg' h={32} radius={0} variant={badgeVariant}>
          {slotPlacement.main.value}
        </Badge>
        <Stack spacing={0}>
          <Badge color={slotPlacement.top.color} radius={0} size='xs' variant={badgeVariant}>
            {slotPlacement.top.value}
          </Badge>
          <Group spacing={0}>
            <Badge
              color={slotPlacement.bottomLeft.color}
              radius={0}
              variant={badgeVariant}
              size='xs'
            >
              {slotPlacement.bottomLeft.value}
            </Badge>
            <Badge
              color={slotPlacement.bottomRight.color}
              radius={0}
              variant={badgeVariant}
              size='xs'
            >
              {slotPlacement.bottomRight.value}
            </Badge>
          </Group>
        </Stack>
      </Group>
    </Group>
  );
};
