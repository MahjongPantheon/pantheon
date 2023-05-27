import * as React from 'react';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Container,
  Divider,
  Group,
  List,
  Space,
  Text,
} from '@mantine/core';
import { EventTypeIcon } from '../components/EventTypeIcon';
import { useEvent } from '../hooks/useEvent';
import { useI18n } from '../hooks/i18n';
import { useIsomorphicState } from '../hooks/useIsomorphicState';
import { useApi } from '../hooks/api';
import { IconAward } from '@tabler/icons-react';
import { YakuId, yakuNameMap } from '../helpers/yaku';
import { Helmet } from 'react-helmet';
import bestHand from '../../assets/img/bestHand.png';
import bestFu from '../../assets/img/bestFu.png';
import bestTsumoist from '../../assets/img/bestTsumoist.png';
import dieHard from '../../assets/img/dieHard.png';
import braveSapper from '../../assets/img/braveSapper.png';
import dovakins from '../../assets/img/dovakins.png';
import bestDealer from '../../assets/img/bestDealer.png';
import shithander from '../../assets/img/shithander.png';
import yakumans from '../../assets/img/yakumans.png';
import impossibleWait from '../../assets/img/impossibleWait.png';
import honoredDonor from '../../assets/img/honoredDonor.png';
import justAsPlanned from '../../assets/img/justAsPlanned.png';
import carefulPlanning from '../../assets/img/carefulPlanning.png';
import doraLord from '../../assets/img/doraLord.png';
import catchEmAll from '../../assets/img/catchEmAll.png';
import favoriteAsapinApprentice from '../../assets/img/favoriteAsapinApprentice.png';
import andYourRiichiBet from '../../assets/img/andYourRiichiBet.png';
import covetousKnight from '../../assets/img/covetousKnight.png';
import ninja from '../../assets/img/ninja.png';
import needMoreGold from '../../assets/img/needMoreGold.png';

enum Achievement {
  BEST_HAND = 'bestHand',
  BEST_FU = 'bestFu',
  BEST_TSUMOIST = 'bestTsumoist',
  DIE_HARD = 'dieHard',
  BRAVE_SAPPER = 'braveSapper',
  DOVAKINS = 'dovakins',
  BEST_DEALER = 'bestDealer',
  SHITHANDER = 'shithander',
  YAKUMANS = 'yakumans',
  IMPOSSIBLE_WAIT = 'impossibleWait',
  HONORED_DONOR = 'honoredDonor',
  JUST_AS_PLANNED = 'justAsPlanned',
  CAREFUL_PLANNING = 'carefulPlanning',
  DORA_LORD = 'doraLord',
  CATCH_EM_ALL = 'catchEmAll',
  FAVORITE_ASAPIN_APPRENTICE = 'favoriteAsapinApprentice',
  AND_YOUR_RIICHI_BET = 'andYourRiichiBet',
  COVETOUS_KNIGHT = 'covetousKnight',
  NINJA = 'ninja',
  NEED_MORE_GOLD = 'needMoreGold',
}

const fullList: Achievement[] = [
  Achievement.BEST_HAND,
  Achievement.BEST_FU,
  Achievement.BEST_TSUMOIST,
  Achievement.DIE_HARD,
  Achievement.BRAVE_SAPPER,
  Achievement.DOVAKINS,
  Achievement.BEST_DEALER,
  Achievement.SHITHANDER,
  Achievement.YAKUMANS,
  Achievement.IMPOSSIBLE_WAIT,
  Achievement.HONORED_DONOR,
  Achievement.JUST_AS_PLANNED,
  Achievement.CAREFUL_PLANNING,
  Achievement.DORA_LORD,
  Achievement.CATCH_EM_ALL,
  Achievement.FAVORITE_ASAPIN_APPRENTICE,
  Achievement.AND_YOUR_RIICHI_BET,
  Achievement.COVETOUS_KNIGHT,
  Achievement.NINJA,
  Achievement.NEED_MORE_GOLD,
];

export const Achievements: React.FC<{ params: { eventId: string } }> = ({
  params: { eventId },
}) => {
  const i18n = useI18n();
  const api = useApi();
  const events = useEvent(eventId);
  const [achievementsData] = useIsomorphicState(
    null,
    'Achievements_' + eventId,
    () => api.getAchievements(parseInt(eventId, 10), fullList),
    [eventId, fullList]
  );

  if (!achievementsData || !events) {
    return null;
  }

  const achDataByKey = achievementsData.reduce((acc, val) => {
    try {
      acc[val.achievementId] = JSON.parse(val.achievementData);
    } catch (e) {
      acc[val.achievementId] = null;
    }
    return acc;
  }, {} as Record<string, any>);

  const yMap = yakuNameMap(i18n);

  const ach = [
    {
      id: Achievement.BEST_HAND,
      image: bestHand,
      label: i18n._t('Best hand'),
      description: i18n._t(
        'Given for collecting the hand with biggest han count (independent of cost).'
      ),
      content: achDataByKey[Achievement.BEST_HAND] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.BEST_HAND].names.map((name: string, idx: number) => (
              <List.Item key={`li_${idx}`}>{name}</List.Item>
            ))}
          </List>
          <Badge
            color='teal'
            pl={8}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          >
            {i18n._pt('Achievements badge', '%1 han', [achDataByKey[Achievement.BEST_HAND].han])}
          </Badge>
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.BEST_FU,
      image: bestFu,
      label: i18n._t('Over 9000 fu'),
      description: i18n._t('Given for collecting the hand with biggest minipoints (fu) count.'),
      content: achDataByKey[Achievement.BEST_FU] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.BEST_FU].names.map((name: string, idx: number) => (
              <List.Item key={`li_${idx}`}>{name}</List.Item>
            ))}
          </List>
          <Badge
            color='teal'
            pl={8}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          >
            {i18n._pt('Achievements badge', '%1 fu', [achDataByKey[Achievement.BEST_FU].fu])}
          </Badge>
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.BEST_TSUMOIST,
      image: bestTsumoist,
      label: i18n._t('I saw them dancing'),
      description: i18n._t('Given for collecting the most of tsumo hands during single game.'),
      content: achDataByKey[Achievement.BEST_TSUMOIST] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.BEST_TSUMOIST].names.map((name: string, idx: number) => (
              <List.Item key={`li_${idx}`}>{name}</List.Item>
            ))}
          </List>
          <Badge
            color='teal'
            pl={8}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          >
            {i18n._pt('Achievements badge', '%1 tsumo', [
              achDataByKey[Achievement.BEST_TSUMOIST].tsumo,
            ])}
          </Badge>
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.DIE_HARD,
      image: dieHard,
      label: i18n._t('Die Hard'),
      description: i18n._t('Given for smallest count of feeding into ron during the tournament.'),
      content: achDataByKey[Achievement.DIE_HARD] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.DIE_HARD].names.map((name: string, idx: number) => (
              <List.Item key={`li_${idx}`}>{name}</List.Item>
            ))}
          </List>
          <Badge
            color='teal'
            pl={8}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          >
            {i18n._npt(
              'Achievements badge',
              ['%1 feed', '%1 feeds'],
              achDataByKey[Achievement.DIE_HARD].feed,
              [achDataByKey[Achievement.DIE_HARD].feed || '0']
            )}
          </Badge>
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.BRAVE_SAPPER,
      image: braveSapper,
      label: i18n._t('Brave minesweeper'),
      description: i18n._t('Given for largest count of feeding into ron during the tournament.'),
      content: achDataByKey[Achievement.BRAVE_SAPPER] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.BRAVE_SAPPER].names.map((name: string, idx: number) => (
              <List.Item key={`li_${idx}`}>{name}</List.Item>
            ))}
          </List>
          <Badge
            color='teal'
            pl={8}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          >
            {i18n._npt(
              'Achievements badge',
              ['%1 feed', '%1 feeds'],
              achDataByKey[Achievement.BRAVE_SAPPER].feed,
              [achDataByKey[Achievement.BRAVE_SAPPER].feed || '0']
            )}
          </Badge>
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.DOVAKINS,
      image: dovakins,
      label: i18n._t('Guest of honors'),
      description: i18n._t('Given for collecting the most of yakuhais during the tournament.'),
      content: achDataByKey[Achievement.DOVAKINS] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.DOVAKINS].map(
              (item: { name: string; count: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._npt('Achievements badge', ['%1 yakuhai', '%1 yakuhais'], item.count, [
                    item.count || '0',
                  ])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.BEST_DEALER,
      image: bestDealer,
      label: i18n._t('The great dealer'),
      description: i18n._t('Given for largest count of dealer wins during the tournament.'),
      content: achDataByKey[Achievement.BEST_DEALER] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.BEST_DEALER].names.map((name: string, idx: number) => (
              <List.Item key={`li_${idx}`}>{name}</List.Item>
            ))}
          </List>
          <Badge
            color='teal'
            pl={8}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          >
            {i18n._npt(
              'Achievements badge',
              ['%1 win', '%1 wins'],
              achDataByKey[Achievement.BEST_DEALER].bestWinCount,
              [achDataByKey[Achievement.BEST_DEALER].bestWinCount || '0']
            )}
          </Badge>
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.SHITHANDER,
      image: shithander,
      label: i18n._t('The 1k Flash'),
      description: i18n._t('Given for the most of 1/30 wins during tournament.'),
      content: achDataByKey[Achievement.SHITHANDER] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.SHITHANDER].names.map((name: string, idx: number) => (
              <List.Item key={`li_${idx}`}>{name}</List.Item>
            ))}
          </List>
          <Badge
            color='teal'
            pl={8}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          >
            {i18n._npt(
              'Achievements badge',
              ['%1 quickest hand', '%1 quickest hands'],
              achDataByKey[Achievement.SHITHANDER].handsCount,
              [achDataByKey[Achievement.SHITHANDER].handsCount || '0']
            )}
          </Badge>
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.YAKUMANS,
      image: yakumans,
      label: i18n._t('Jewelry included'),
      description: i18n._t('Given for collecting a yakuman during tournament.'),
      content: achDataByKey[Achievement.YAKUMANS] ? (
        <Group align='flex-start' position='apart' pl={20}>
          {achDataByKey[Achievement.YAKUMANS].length > 0 ? (
            <List>
              {achDataByKey[Achievement.YAKUMANS].map(
                (item: { name: string; yaku: YakuId }, idx: number) => (
                  <List.Item key={`li_${idx}`}>
                    <b>{item.name}</b>, {yMap.get(item.yaku)}
                  </List.Item>
                )
              )}
            </List>
          ) : (
            <Text>{i18n._t('No yakumans have been collected')}</Text>
          )}
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.IMPOSSIBLE_WAIT,
      image: impossibleWait,
      label: i18n._t("This can't be your wait"),
      description: i18n._t(
        'Given for feeding into largest hand during tournament (but not while in riichi).'
      ),
      content: achDataByKey[Achievement.IMPOSSIBLE_WAIT] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.IMPOSSIBLE_WAIT].map(
              (item: { name: string; hand: { han: number; fu: number } }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {item.hand.fu
                    ? i18n._pt('Achievements badge', '%1 han, %2 fu', [
                        item.hand.han || '0',
                        item.hand.fu || '0',
                      ])
                    : i18n._pt('Achievements badge', '%1 han', [item.hand.han || '0'])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.HONORED_DONOR,
      image: honoredDonor,
      label: i18n._t('Honored donor'),
      description: i18n._t('Given for losing largest amount of points as riichi bets.'),
      content: achDataByKey[Achievement.HONORED_DONOR] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.HONORED_DONOR].map(
              (item: { name: string; count: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._npt('Achievements badge', ['%1 bet', '%1 bets'], item.count, [
                    item.count || '0',
                  ])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.JUST_AS_PLANNED,
      image: justAsPlanned,
      label: i18n._t('Just as planned'),
      description: i18n._t('Given for getting largest number of ippatsu during tournament.'),
      content: achDataByKey[Achievement.JUST_AS_PLANNED] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.JUST_AS_PLANNED].map(
              (item: { name: string; count: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._pt('Achievements badge', '%1 ippatsu', [item.count || '0'])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.CAREFUL_PLANNING,
      image: carefulPlanning,
      label: i18n._t('Careful planning'),
      description: i18n._t(
        'Given for the smallest average cost of opponents hand that player has dealt.'
      ),
      content: achDataByKey[Achievement.CAREFUL_PLANNING] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.CAREFUL_PLANNING].map(
              (item: { name: string; score: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._pt('Achievements badge', '%1 points', [item.score || '0'])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.DORA_LORD,
      image: doraLord,
      label: i18n._t('Dora lord'),
      description: i18n._t("Given for the largest average count of dora in player's hand."),
      content: achDataByKey[Achievement.DORA_LORD] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.DORA_LORD].map(
              (item: { name: string; count: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._npt('Achievements badge', ['%1 dora', '%1 dora'], Math.floor(item.count), [
                    item.count || '0',
                  ])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.CATCH_EM_ALL,
      image: catchEmAll,
      label: i18n._t("Gotta Catch'Em All"),
      description: i18n._t(
        'Given for the largest amount of unique yaku collected during the tournament.'
      ),
      content: achDataByKey[Achievement.CATCH_EM_ALL] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.CATCH_EM_ALL].map(
              (item: { name: string; count: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._pt('Achievements badge', '%1 yaku', [item.count || '0'])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.FAVORITE_ASAPIN_APPRENTICE,
      image: favoriteAsapinApprentice,
      label: i18n._t('The favorite apprentice of ASAPIN'),
      description: i18n._t(
        'Given for the largest amount of points received as ryuukyoku (draw) payments.'
      ),
      content: achDataByKey[Achievement.FAVORITE_ASAPIN_APPRENTICE] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.FAVORITE_ASAPIN_APPRENTICE].map(
              (item: { name: string; score: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._pt('Achievements badge', '%1 points', [item.score || '0'])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.AND_YOUR_RIICHI_BET,
      image: andYourRiichiBet,
      label: i18n._t('And your riichi bet, please'),
      description: i18n._t(
        "Given for collecting the largest amount of other players' riichi bets during the tournament."
      ),
      content: achDataByKey[Achievement.AND_YOUR_RIICHI_BET] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.AND_YOUR_RIICHI_BET].map(
              (item: { name: string; count: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._npt(
                    'Achievements badge',
                    ['%1 riichi bet', '%1 riichi bets'],
                    item.count,
                    [item.count || '0']
                  )}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.COVETOUS_KNIGHT,
      image: covetousKnight,
      label: i18n._t('The Covetous Knight'),
      description: i18n._t('Given for losing the smallest number of riichi bets.'),
      content: achDataByKey[Achievement.COVETOUS_KNIGHT] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.COVETOUS_KNIGHT].map(
              (item: { name: string; count: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._npt(
                    'Achievements badge',
                    ['%1 riichi bet', '%1 riichi bets'],
                    item.count,
                    [item.count || '0']
                  )}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.NINJA,
      image: ninja,
      label: i18n._t('Ninja'),
      description: i18n._t('Given for winning the largest number of hands with damaten.'),
      content: achDataByKey[Achievement.NINJA] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.NINJA].map(
              (item: { name: string; count: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.name}</b>:{' '}
                  {i18n._npt('Achievements badge', ['%1 win', '%1 wins'], item.count, [
                    item.count || '0',
                  ])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
    {
      id: Achievement.NEED_MORE_GOLD,
      image: needMoreGold,
      label: i18n._t('We need more gold'),
      description: i18n._t(
        'Given for having biggest score in the end of the session across the tournament.'
      ),
      content: achDataByKey[Achievement.NEED_MORE_GOLD] ? (
        <Group align='flex-start' position='apart' pl={20}>
          <List>
            {achDataByKey[Achievement.NEED_MORE_GOLD].map(
              (item: { title: string; score: number }, idx: number) => (
                <List.Item key={`li_${idx}`}>
                  <b>{item.title}</b>:{' '}
                  {i18n._pt('Achievements badge', '%1 points', [item.score || '0'])}
                </List.Item>
              )
            )}
          </List>
          <Badge
            color='teal'
            pl={22}
            leftSection={<IconAward style={{ marginTop: '10px' }} />}
            variant='filled'
            size='xl'
          />
        </Group>
      ) : (
        <Alert color='yellow'>{i18n._t("Couldn't get nomination details")}</Alert>
      ),
    },
  ];

  if ((events?.length ?? 0) > 1) {
    return (
      <Container>
        <Alert color='red'>{i18n._t('Achievements are not available for aggregated events')}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Helmet>
        <title>
          {events?.[0].title} - {i18n._t('Achievements')} - Sigrun
        </title>
      </Helmet>
      <h2 style={{ display: 'flex', gap: '20px' }}>
        {events?.[0] && <EventTypeIcon event={events[0]} />}
        {events?.[0]?.title} - {i18n._t('Achievements')}
      </h2>
      <Divider size='xs' />
      <Space h='md' />
      <Accordion chevronPosition='right' variant='contained' multiple={true}>
        {ach.map((item, idx) => (
          <Accordion.Item value={item.id} key={`ach_${idx}`}>
            <Accordion.Control>
              <AccordionLabel {...item} />
            </Accordion.Control>
            <Accordion.Panel>
              <Text size='sm'>{item.content}</Text>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
};

interface AccordionLabelProps {
  label: string;
  image: string;
  description: string;
}

function AccordionLabel({ label, image, description }: AccordionLabelProps) {
  return (
    <Group noWrap>
      <Avatar src={image} radius='xl' size='lg' />
      <div>
        <Text>{label}</Text>
        <Text size='sm' color='dimmed' weight={400}>
          {description}
        </Text>
      </div>
    </Group>
  );
}
