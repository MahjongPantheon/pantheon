import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { authCtx } from '#/hooks/auth';
import { useApi } from '#/hooks/api';
import { Center, Container, LoadingOverlay, Stack, Tabs } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useI18n } from '#/hooks/i18n';
import { usePageTitle } from '#/hooks/pageTitle';
import { TabsList } from '#/pages/OwnedEventsEdit/TabsList';
import { BasicSettings } from '#/pages/OwnedEventsEdit/BasicSettings';
import { LocalSettings } from '#/pages/OwnedEventsEdit/LocalSettings';
import { TournamentSettings } from '#/pages/OwnedEventsEdit/TournamentSettings';
import { OnlineSettings } from '#/pages/OwnedEventsEdit/OnlineSettings';
import { RulesetSettings } from '#/pages/OwnedEventsEdit/RulesetSettings';
import { YakuSettings } from '#/pages/OwnedEventsEdit/YakuSettings';
import { IconSettingsCheck } from '@tabler/icons-react';
import { FormFields, RulesetRemote } from '#/pages/OwnedEventsEdit/types';
import { EventData, EventType } from '#/clients/atoms.pb';

export const OwnedEventsEdit: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState<EventType>('LOCAL');
  const [timezones, setTimezones] = useState<Array<{ value: string; label: string }>>([]);
  const [rulesets, setRulesets] = useState<Array<{ value: string; label: string }>>([]);
  const [eventName, setEventName] = useState('');
  usePageTitle('Edit event :: ' + eventName);

  const form = useForm<FormFields>({
    initialValues: {
      event: {
        type: 'LOCAL',
        title: '',
        description: '',
        timezone: '',
        duration: 75, // min // tourn
        isTeam: false, // tourn
        isPrescripted: false, // tourn
        seriesLength: 0, // local/online
        minGames: 0, // local/online
        ruleset: 'ema',
        lobbyId: 0, // online
      },
      customized: {},
      ruleset: {
        gameExpirationTime: 0, // online
        chipsValue: 0, // online
        tonpuusen: false,
        riichiGoesToWinner: false,
        extraChomboPayments: false,
        doubleronHonbaAtamahane: false,
        doubleronRiichiAtamahane: false,
        withAtamahane: false,
        withAbortives: false,
        withButtobi: false,
        withKazoe: false,
        withKiriageMangan: false,
        withKuitan: false,
        withLeadingDealerGameOver: false,
        withMultiYakumans: false,
        withNagashiMangan: false,
        playAdditionalRounds: false,
        equalizeUma: false,
        chomboPenalty: 20000,
        goalPoints: 30000,
        maxPenalty: 20000,
        minPenalty: 100,
        penaltyStep: 100,
        replacementPlayerOverrideUma: -15000, // tourn
        oka: 0,
        uma: [15000, 5000, -5000, -15000], // TODO: should start with 1
        complexUma: [
          [12000, -1000, -3000, -8000],
          [8000, 3000, 1000, -12000],
          [8000, 4000, -4000, -8000],
        ], // TODO: should start with 1
        umaType: 'simple',
        allowedYaku: {}, // TODO: reformat to array, as required by protocol
        yakuWithPao: {}, // TODO: reformat to array, as required by protocol
        withWinningDealerHonbaSkipped: false,
        endingPolicy: 'none',
        startRating: 0,
        startPoints: 30000,
        replacementPlayerFixedPoints: -15000, // tourn
      },
    },

    validate: {
      event: {
        title: (value) => (value.length > 4 ? null : 'Please use title more than 4 symbols long'),
        timezone: (value) => (value ? null : 'Timezone must be selected'),
      },
    },
  });

  const setFormValues = (
    eventData: EventData,
    rulesetId: string,
    overrides: RulesetRemote,
    rules: Record<string, RulesetRemote>
  ) => {
    // TODO: apply overrides
    const ruleset = rules[rulesetId];
    if (!ruleset) {
      return;
    }
    form.setValues({
      event: eventData,
      ruleset: {
        ...ruleset,
        uma: ruleset.uma ? [ruleset.uma[1], ruleset.uma[2], ruleset.uma[3], ruleset.uma[4]] : [],
        complexUma: [
          // TODO: should start with 1; also TODO: implement on backend
          [12000, -1000, -3000, -8000],
          [8000, 3000, 1000, -12000],
          [8000, 4000, -4000, -8000],
        ],
        allowedYaku: ruleset.allowedYaku.reduce((acc: Record<string, boolean>, val: number) => {
          acc[val] = true;
          return acc;
        }, {} as Record<string, boolean>),
        yakuWithPao: ruleset.yakuWithPao.reduce((acc: Record<string, boolean>, val: number) => {
          acc[val] = true;
          return acc;
        }, {} as Record<string, boolean>),
      },
    });
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    setIsLoading(true);
    Promise.all([
      api.getRulesets(),
      api.getTimezones(),
      id ? api.getEventForEdit(parseInt(id, 10)) : Promise.resolve(null),
    ])
      .then(([rulesets, timezoneData, eventData]) => {
        setTimezones(timezoneData.timezones.map((z) => ({ value: z, label: z })));
        setRulesets(rulesets.map((r) => ({ value: r.title, label: r.description })));
        const rules = rulesets.reduce((acc, r) => {
          acc[r.title] = JSON.parse(r.defaultRules); // TODO: in general, this is unsafe
          return acc;
        }, {} as Record<string, RulesetRemote>);
        if (eventData) {
          // edit mode
          setEventName(eventData.event.title);
          setEventType(eventData.event.type ?? 'LOCAL');
          setFormValues(
            eventData.event,
            eventData.event.ruleset,
            // TODO: in general, this is unsafe
            JSON.parse(eventData.event.rulesetChanges),
            rules
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isLoggedIn]);

  const submitForm = (vals: any) => {
    console.log(vals);
  };

  /*
    TODO:

    Меняем логику
    - Для нового события:
    - Шаг 1: Выбираем при создании: тип события local/tournament/online и рулсет. Ограничить online тенхо рулсетом.
    - Шаг 2: Выдаем форму для задания параметров.

    - Для существующего события: не дает менять тип и рулсет.

    1) обеспечить подгрузку текущих переопределенных значений
    2) Сделать роуты для нового события
    3) Запилить комплексную уму в протоколе и на бэкенде
   */

  return (
    <>
      <Container pos='relative'>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        <form onSubmit={form.onSubmit(submitForm)}>
          <Tabs defaultValue='basic'>
            <Tabs.List>
              <TabsList i18n={i18n} eventType={eventType as EventType} />
            </Tabs.List>
            <Tabs.Panel value='basic' pt='xs'>
              <BasicSettings form={form} i18n={i18n} rulesets={rulesets} timezones={timezones} />
            </Tabs.Panel>
            <Tabs.Panel value={eventType} pt='xs'>
              <Stack>
                {eventType === 'ONLINE' && <OnlineSettings form={form} i18n={i18n} />}
                {eventType === 'LOCAL' && <LocalSettings form={form} i18n={i18n} />}
                {eventType === 'TOURNAMENT' && <TournamentSettings i18n={i18n} form={form} />}
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value='ruleset_tuning' pt='xs'>
              <RulesetSettings form={form} i18n={i18n} />
            </Tabs.Panel>
            <Tabs.Panel value='yaku_tuning' pt='xs'>
              <YakuSettings form={form} i18n={i18n} />
            </Tabs.Panel>
          </Tabs>
        </form>
      </Container>
      <Center h='150px'>
        <IconSettingsCheck />
      </Center>
    </>
  );
};
