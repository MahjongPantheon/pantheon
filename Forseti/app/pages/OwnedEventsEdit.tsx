import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { authCtx } from '#/hooks/auth';
import { useApi } from '#/hooks/api';
import {
  Checkbox,
  Container,
  Group,
  LoadingOverlay,
  NumberInput,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAbc,
  IconAdjustments,
  IconChartHistogram,
  IconChecklist,
  IconFriends,
  IconListCheck,
  IconMap2,
  IconNetwork,
  IconNumbers,
  IconTool,
  IconTournament,
  IconUsers,
} from '@tabler/icons-react';
import { useI18n } from '#/hooks/i18n';
import { usePageTitle } from '#/hooks/pageTitle';
import { yakuList, yakuWithPao } from '#/helpers/yaku';
import { RulesetGenerated } from '#/clients/atoms.pb';

type RulesetCustom = {
  tonpuusen: boolean;
  riichiGoesToWinner: boolean;
  extraChomboPayments: boolean;
  doubleronHonbaAtamahane: boolean;
  doubleronRiichiAtamahane: boolean;
  withAtamahane: boolean;
  withAbortives: boolean;
  withButtobi: boolean;
  withKazoe: boolean;
  withKiriageMangan: boolean;
  withKuitan: boolean;
  withLeadingDealerGameOver: boolean;
  withMultiYakumans: boolean;
  withNagashiMangan: boolean;
  playAdditionalRounds: boolean;
  equalizeUma: boolean;
  chomboPenalty: number;
  goalPoints: number;
  maxPenalty: number;
  minPenalty: number;
  penaltyStep: number;
  replacementPlayerOverrideUma: number;
  oka: number;
  uma: number[];
  allowedYaku: number[];
  yakuWithPao: number[];
  gameExpirationTime: boolean;
  replacementPlayerFixedPoints: number;
  startPoints: number;
  startRating: number;
  endingPolicy: 'oneMoreHand' | 'endAfterHand' | 'none';
  complexUma: boolean;
  withWinningDealerHonbaSkipped: boolean;
  chipsValue: number;
};

export const OwnedEventsEdit: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const auth = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState('local');
  const [timezones, setTimezones] = useState<Array<{ value: string; label: string }>>([]);
  const [rulesets, setRulesets] = useState<Array<{ value: string; label: string }>>([]);
  const [rules, setRules] = useState<Record<string, RulesetGenerated>>({});
  const [eventName, setEventName] = useState('');
  usePageTitle('Edit event :: ' + eventName);

  useEffect(() => {
    if (!auth.isLoggedIn) {
      return;
    }
    Promise.all([api.getRulesets(), api.getTimezones()]).then(([rulesets, timezoneData]) => {
      setTimezones(timezoneData.timezones.map((z) => ({ value: z, label: z })));
      setRulesets(rulesets.map((r) => ({ value: r.title, label: r.description })));
    });
    if (id) {
      setIsLoading(true);
      api
        .getEventForEdit(parseInt(id, 10))
        .then((resp) => {
          setEventName(resp.event.title);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [auth]);

  const form = useForm({
    initialValues: {
      type: 'local',
      title: '',
      description: '',
      timezone: '',
      duration: 75, // min // tourn
      isTeam: false, // tourn
      isPrescripted: false, // tourn
      gameSeriesCount: 0, // local/online
      minGamesCount: 0, // local/online
      baseRuleset: 'ema',
      tenhouLobbyId: '', // online
      gameExpirationTime: 0, // online
      chipsValue: 0, // online
      isTonpuusen: false,

      // next is ruleset based

      riichiGoesToWinner: false,
      chomboInPlace: false,
      withHonbaAtamahane: false,
      withRiichiAtamahane: false,
      withAtamahane: false,
      withAbortiveDraws: false,
      withTobi: false,
      withKazoeSanbaiman: false,
      withKiriageMangan: false,
      withKuitan: false,
      withDealingLeaderGameover: false,
      withMultiYakumans: false,
      withNagashiMangan: false,
      withWestRounds: false,
      withEqualizedUma: false,
      chomboPenaltyAmount: 20000,
      minEndPoints: 30000,
      maxPenalty: 20000,
      minPenalty: 100,
      stepPenalty: 100,
      replacementUma: -15000, // tourn
      oka: 0,
      uma: [15000, 5000, -5000, -15000],
      allowedYaku: {}, // TODO: reformat to array, as required by protocol
      yakuWithPao: {}, // TODO: reformat to array, as required by protocol

      withWinningDealerHonbaSkipped: false, // TODO no-renchan on dealer win
      endingPolicy: 'none', // TODO
      startRating: 0,
      startPoints: 30000,
      replacementPlayerFixedPoints: -15000, // tourn
    },

    validate: {
      title: (value) => (value.length > 4 ? null : 'Please use title more than 4 symbols long'),
      timezone: (value) => (value ? null : 'Timezone must be selected'),
    },
  });

  const submitForm = (vals: any) => {
    console.log(vals);
  };

  const setRulesetValues = (rulesetId: string) => {
    const ruleset = rulesets;
    form.setValues({
      riichiGoesToWinner: false,
      chomboInPlace: false,
      withHonbaAtamahane: false,
      withRiichiAtamahane: false,
      withAtamahane: false,
      withAbortiveDraws: false,
      withTobi: false,
      withKazoeSanbaiman: false,
      withKiriageMangan: false,
      withKuitan: false,
      withDealingLeaderGameover: false,
      withMultiYakumans: false,
      withNagashiMangan: false,
      withWestRounds: false,
      withEqualizedUma: false,
      // TODO: change default measures when dealing with non-ema ruleset. OR use some standard measures and apply transformations before saving
      // TODO: (e.g., convert uma/oka using dividers data, but all scores enter in just game points)
      chomboPenaltyAmount: 20000,
      minEndPoints: 30000,
      maxPenalty: 20000,
      replacementUma: -15000, // tourn
      minPenalty: 100,
      stepPenalty: 100,
      oka: 0,
      uma: [15000, 5000, -5000, -15000],
      allowedYaku: {}, // TODO: reformat to array, as required by protocol
      yakuWithPao: {}, // TODO: reformat to array, as required by protocol
    });
  };

  return (
    <>
      <Container pos='relative'>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        <form onSubmit={form.onSubmit(submitForm)}>
          <Tabs defaultValue='basic'>
            <Tabs.List>
              <Tabs.Tab value='basic' icon={<IconTool size='0.8rem' />}>
                {i18n._t('Basic settings')}
              </Tabs.Tab>
              {eventType === 'local' && (
                <Tabs.Tab value='local' icon={<IconFriends size='0.8rem' />}>
                  {i18n._t('Local event settings')}
                </Tabs.Tab>
              )}
              {eventType === 'tournament' && (
                <Tabs.Tab value='tournament' icon={<IconTournament size='0.8rem' />}>
                  {i18n._t('Tournament settings')}
                </Tabs.Tab>
              )}
              {eventType === 'online' && (
                <Tabs.Tab value='online' icon={<IconNetwork size='0.8rem' />}>
                  {i18n._t('Online event settings')}
                </Tabs.Tab>
              )}
              <Tabs.Tab value='ruleset_tuning' icon={<IconAdjustments size='0.8rem' />}>
                {i18n._t('Ruleset tuning')}
              </Tabs.Tab>

              <Tabs.Tab value='yaku_tuning' icon={<IconListCheck size='0.8rem' />}>
                {i18n._t('Yaku settings')}
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value='basic' pt='xs'>
              <Stack>
                <Radio.Group
                  label={i18n._t('Select event type')}
                  onChange={(v) => {
                    setEventType(v);
                    form.setFieldValue('type', v);
                  }}
                >
                  <Group mt='xs'>
                    <Radio value='local' label={i18n._t('Local rating')} />
                    <Radio value='tournament' label={i18n._t('Tournament')} />
                    <Radio value='online' label={i18n._t('Online event')} />
                  </Group>
                </Radio.Group>
                <TextInput
                  withAsterisk
                  icon={<IconAbc size='1rem' />}
                  label={i18n._t('Event title')}
                  {...form.getInputProps('title')}
                />
                <Select
                  icon={<IconChecklist size='1rem' />}
                  label={i18n._t('Basic ruleset')}
                  description={i18n._t(
                    'Basic ruleset for the event. Fine tuning is available in adjacent tabs.'
                  )}
                  data={rulesets}
                  {...form.getInputProps('baseRuleset')}
                  onChange={(v) => {
                    if (v) {
                      setRulesetValues(v);
                      form.setFieldValue('baseRuleset', v);
                    }
                  }}
                />
                <Select
                  icon={<IconMap2 size='1rem' />}
                  label={i18n._t('Primary timezone for event')}
                  description={i18n._t(
                    'All dates and time will be displayed according to the selected timezone.'
                  )}
                  searchable
                  nothingFound={i18n._t('Nothing found')}
                  maxDropdownHeight={280}
                  data={timezones}
                  {...form.getInputProps('timezone')}
                />
                <Textarea
                  label={i18n._t('Brief description')}
                  description={i18n._t('Multiline. Markdown syntax supported.')}
                  {...form.getInputProps('description')}
                  autosize
                />
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value={eventType} pt='xs'>
              <Stack>
                {eventType === 'online' && (
                  <>
                    <Text>
                      {i18n._t(
                        'Please note: you should set up the rating accordingly to tournament settings in Tenhou.net, otherwise expect errors on replay submit!'
                      )}
                    </Text>
                    <TextInput
                      withAsterisk
                      icon={<IconUsers size='1rem' />}
                      label={i18n._t('Tenhou Lobby ID')}
                      {...form.getInputProps('tenhouLobbyId')}
                    />
                    <NumberInput
                      {...form.getInputProps('gameExpirationTime')}
                      icon={<IconChartHistogram size='1rem' />}
                      label={i18n._t('Game expiration time (in hours)')}
                      description={i18n._t(
                        'Interval of time when played online game is still considered valid and can be added to the rating. Set to 0 to disable expiration.'
                      )}
                      defaultValue={24}
                      min={0}
                    />
                    <NumberInput
                      {...form.getInputProps('chipsValue')}
                      icon={<IconChartHistogram size='1rem' />}
                      label={i18n._t('Chips value')}
                      description={i18n._t(
                        'Amount of points given for each chip. Chips should be set up in tournament settings in Tenhou.net. Set to 0 to disable chips.'
                      )}
                      defaultValue={2000}
                      step={100}
                      min={0}
                    />
                  </>
                )}
                {eventType !== 'tournament' && (
                  <>
                    <NumberInput
                      {...form.getInputProps('gameSeriesCount')}
                      icon={<IconChartHistogram size='1rem' />}
                      label={i18n._t('Series length')}
                      description={i18n._t(
                        'Count of session in game series. Set to 0 to disable series functionality.'
                      )}
                      defaultValue={0}
                      step={5}
                      min={0}
                    />
                    <NumberInput
                      {...form.getInputProps('minGamesCount')}
                      icon={<IconNumbers size='1rem' />}
                      label={i18n._t('Minimal games count')}
                      description={i18n._t(
                        'Minimal count of games the player should play to get into the rating table.'
                      )}
                      defaultValue={0}
                      step={5}
                      min={0}
                    />
                  </>
                )}
                {eventType === 'tournament' && (
                  <>
                    <NumberInput
                      {...form.getInputProps('duration')}
                      label={i18n._t('Session duration in minutes')}
                      description={i18n._t(
                        'Timer starting value. After time runs out, players should finish current hand and play one more.'
                      )}
                      defaultValue={75}
                      step={5}
                      min={0}
                    />
                    <Checkbox
                      label={i18n._t('Team tournament')}
                      {...form.getInputProps('isTeam', { type: 'checkbox' })}
                    />
                    <Checkbox
                      label={i18n._t('Seating is defined in advance')}
                      description={i18n._t(
                        'No automated seating functionality is available when this flag is set.'
                      )}
                      {...form.getInputProps('isPrescripted', { type: 'checkbox' })}
                    />
                    <NumberInput
                      {...form.getInputProps('replacementPlayerFixedPoints')}
                      label={i18n._t('Fixed score applied to replacement player')}
                      description={i18n._t(
                        'Fixed amount of result score applied for each replacement player regardless of session results.'
                      )}
                      defaultValue={-15000}
                      max={0}
                    />
                    <NumberInput
                      {...form.getInputProps('replacementUma')}
                      label={i18n._t('Fixed uma for replacement player')}
                      description={i18n._t(
                        'Fixed amount of rank penalty applied for each replacement player regardless of session results.'
                      )}
                      defaultValue={-15000}
                      max={0}
                    />
                  </>
                )}
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value='ruleset_tuning' pt='xs'>
              <Stack>
                <NumberInput
                  {...form.getInputProps('startRating')}
                  icon={<IconChartHistogram size='1rem' />}
                  label={i18n._t('Initial rating')}
                  description={i18n._t('Score given to all players in the beginning of the rating')}
                  defaultValue={0}
                  min={0}
                />
                <NumberInput
                  {...form.getInputProps('startPoints')}
                  icon={<IconChartHistogram size='1rem' />}
                  label={i18n._t('Initial points')}
                  description={i18n._t(
                    'Amount of points given to every player in the beginning of every session'
                  )}
                  defaultValue={30000}
                  min={0}
                />
                <Title order={4}>{i18n._t('Game duration')}</Title>
                <Checkbox
                  label={i18n._t('Tonpuusen')}
                  description={i18n._t('Play only east rounds')}
                  {...form.getInputProps('isTonpuusen', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Agariyame')}
                  description={i18n._t(
                    'If the dealer holds the 1st place after last hand in session, the game ends regardless of his winning hand or tempai.'
                  )}
                  {...form.getInputProps('withDealingLeaderGameover', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Allow bankruptcy')}
                  description={i18n._t(
                    'When a player runs out of score points, the game immediately ends'
                  )}
                  {...form.getInputProps('withTobi', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Play additional rounds')}
                  description={i18n._t(
                    'If nobody reaches the goal score at the last hand, the game continues to west rounds (in hanchan) or to south rounds (in tonpuusen), until someone reaches the goal'
                  )}
                  {...form.getInputProps('withAdditionalRounds', { type: 'checkbox' })}
                />
                {/*TODO: show only if checkbox checked*/}
                <NumberInput
                  {...form.getInputProps('minEndPoints')}
                  label={i18n._t('Goal score')}
                  description={i18n._t('Amount of score player should get to end the game.')}
                  defaultValue={30000}
                  min={0}
                />
                <Title order={4}>{i18n._t('Round outcomes')}</Title>
                <Checkbox
                  label={i18n._t('Atamahane')}
                  description={i18n._t(
                    'Only first player by the order of the move from the loser would be considered a winner. If not checked, all players declaring Ron are considered winners.'
                  )}
                  {...form.getInputProps('withAtamahane', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Allow abortive draws')}
                  description={i18n._t(
                    'There will be a separate "Abortive draw" outcome to record draws due to four riichi, four kans, suufon renda, kyuushu kyuuhai, etc.'
                  )}
                  {...form.getInputProps('withAbortiveDraws', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Nagashi mangan')}
                  description={i18n._t('Enable "Nagashi" outcome to record this special draw')}
                  {...form.getInputProps('withNagashiMangan', { type: 'checkbox' })}
                />
                <Title order={4}>{i18n._t('Riichi and honba')}</Title>
                <Checkbox
                  label={i18n._t('Riichi goes to winner')}
                  description={i18n._t(
                    'Riichi left on table in case of draw in the end of the session will be given to session winner'
                  )}
                  {...form.getInputProps('riichiGoesToWinner', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Pay for honba by atamahane')}
                  description={i18n._t(
                    'Honba payments will be given only to the first winner. If not checked, payment will be given to all winners.'
                  )}
                  {...form.getInputProps('withHonbaAtamahane', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Collect riichi bets by atamahane')}
                  description={i18n._t(
                    'All riichi bets on the table will be given to the first winner. If not checked, winning riichi bets will always be given back, lost bets would be given to the first winner.'
                  )}
                  {...form.getInputProps('withRiichiAtamahane', { type: 'checkbox' })}
                />
                <Title order={4}>{i18n._t('Payments and scores')}</Title>
                <Checkbox
                  label={i18n._t('Kazoe sanbaiman')}
                  description={i18n._t('13+ han hands are considered sanbaiman, not yakuman.')}
                  {...form.getInputProps('withKazoeSanbaiman', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Kiriage mangan')}
                  description={i18n._t('Hands valued as 4/30 and 3/60 are rounded to mangan.')}
                  {...form.getInputProps('withKiriageMangan', { type: 'checkbox' })}
                />
                <NumberInput
                  {...form.getInputProps('oka')}
                  label={i18n._t('Oka bonus')}
                  description={i18n._t('Amount of points given to player at 1st place')}
                  defaultValue={20000}
                  min={0}
                />
                <NumberInput
                  {...form.getInputProps('uma.0')}
                  label={i18n._t('Uma bonus for 1st place')}
                  defaultValue={15000}
                  max={0}
                />
                <NumberInput
                  {...form.getInputProps('uma.1')}
                  label={i18n._t('Uma bonus for 2nd place')}
                  defaultValue={5000}
                  max={0}
                />
                <NumberInput
                  {...form.getInputProps('uma.2')}
                  label={i18n._t('Uma penalty for 3rd place')}
                  defaultValue={-5000}
                  max={0}
                />
                <NumberInput
                  {...form.getInputProps('uma.3')}
                  label={i18n._t('Uma penalty for 4th place')}
                  defaultValue={-15000}
                  max={0}
                />
                <Checkbox
                  label={i18n._t('Equalize uma')}
                  description={i18n._t(
                    'If checked, players with equivalent score receive equivalent uma bonus. Otherwise, uma is assigned according to move order.'
                  )}
                  {...form.getInputProps('withEqualizedUma', { type: 'checkbox' })}
                />
                <Title order={4}>{i18n._t('Penalties')}</Title>
                <NumberInput
                  {...form.getInputProps('maxPenalty')}
                  label={i18n._t('Max arbitrary penalty score')}
                  defaultValue={20000}
                  min={0}
                />
                <NumberInput
                  {...form.getInputProps('minPenalty')}
                  label={i18n._t('Min arbitrary penalty score')}
                  defaultValue={100}
                  min={0}
                />
                <NumberInput
                  {...form.getInputProps('stepPenalty')}
                  label={i18n._t('Step of arbitrary penalty scores')}
                  defaultValue={100}
                  min={0}
                />
                <Checkbox
                  label={i18n._t('Pay chombo as reverse mangan')}
                  description={i18n._t(
                    'Pay chombo right on occasion. If not checked, chombo is subtracted from player score after uma is applied.'
                  )}
                  {...form.getInputProps('chomboInPlace', { type: 'checkbox' })}
                />
                {/*TODO: hide if checkbox checked*/}
                <NumberInput
                  {...form.getInputProps('chomboPenaltyAmount')}
                  label={i18n._t('Amount of chombo penalty')}
                  description={i18n._t(
                    'Amount of penalty applied in the end of the session after uma bonus.'
                  )}
                  defaultValue={20000}
                  min={0}
                />
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value='yaku_tuning' pt='xs'>
              <Stack>
                <Checkbox
                  label={i18n._t('Kuitan')}
                  description={i18n._t(
                    'Tanyao costs 1 han on open hand. If not checked, tanyao does not work on open hand.'
                  )}
                  {...form.getInputProps('withKuitan', { type: 'checkbox' })}
                />
                <Checkbox
                  label={i18n._t('Multiple yakumans')}
                  description={i18n._t('Allow combination of yakumans, e.g. tsuuisou + daisangen')}
                  {...form.getInputProps('withMultiYakumans', { type: 'checkbox' })}
                />
                <Title order={4}>{i18n._t('Yaku allowed')}</Title>
                <SimpleGrid
                  spacing='lg'
                  cols={3}
                  breakpoints={[
                    { maxWidth: '48rem', cols: 2 },
                    { maxWidth: '36rem', cols: 1 },
                  ]}
                >
                  {yakuList.map((y) => (
                    <Checkbox
                      label={y.name(i18n)}
                      {...form.getInputProps('allowedYaku.' + y.id, { type: 'checkbox' })}
                    />
                  ))}
                </SimpleGrid>
                <Title order={4}>{i18n._t('Pao rule enabled for:')}</Title>
                <SimpleGrid
                  spacing='lg'
                  cols={3}
                  breakpoints={[
                    { maxWidth: '48rem', cols: 2 },
                    { maxWidth: '36rem', cols: 1 },
                  ]}
                >
                  {yakuWithPao.map((y) => (
                    <Checkbox
                      label={y.name(i18n)}
                      {...form.getInputProps('yakuWithPao.' + y.id, { type: 'checkbox' })}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </form>
      </Container>
    </>
  );
};
