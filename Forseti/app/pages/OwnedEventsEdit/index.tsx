import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { authCtx } from '#/hooks/auth';
import { useApi } from '#/hooks/api';
import { Center, Container, LoadingOverlay, Stack, Tabs } from '@mantine/core';
import { useForm, UseFormReturnType } from '@mantine/form';
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
import { FormFields, RulesetCustom, RulesetRemote } from '#/pages/OwnedEventsEdit/types';

export const OwnedEventsEdit: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState('local');
  const [timezones, setTimezones] = useState<Array<{ value: string; label: string }>>([]);
  const [rulesets, setRulesets] = useState<Array<{ value: string; label: string }>>([]);
  const [rules, setRules] = useState<Record<string, RulesetRemote>>({});
  const [eventName, setEventName] = useState('');
  usePageTitle('Edit event :: ' + eventName);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    Promise.all([api.getRulesets(), api.getTimezones()]).then(([rulesets, timezoneData]) => {
      setTimezones(timezoneData.timezones.map((z) => ({ value: z, label: z })));
      setRulesets(rulesets.map((r) => ({ value: r.title, label: r.description })));
      setRules(
        rulesets.reduce((acc, r) => {
          acc[r.title] = JSON.parse(r.defaultRules); // TODO: in general, this is unsafe
          return acc;
        }, {} as Record<string, RulesetRemote>)
      );
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
  }, [isLoggedIn]);

  const form = useForm<FormFields>({
    initialValues: {
      event: {
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
      },
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

  const submitForm = (vals: any) => {
    console.log(vals);
  };

  /*
    TODO:
    1) обеспечить подгрузку текущих переопределенных значений
    2) если меняется рулсет, менять все значения кроме тех которые явно были изменены
    3) В БД могут быть полные наборы рулсетов, нельзя ориентироваться на состав оверрайдов в БД. Вычислять отличия.
    4) Прочекать места, в которых может быть накладка: переформатирование яку, комплексная ума
    5) Задизайблить выбор типа события в случае редактирования
    6) Сделать роуты для нового события
    7) Запилить комплексную уму в протоколе и на бэкенде
   */

  const setRulesetValues = (rulesetId: string) => {
    const ruleset = rules[rulesetId];
    form.setValues({
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

  return (
    <>
      <Container pos='relative'>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        <form onSubmit={form.onSubmit(submitForm)}>
          <Tabs defaultValue='basic'>
            <Tabs.List>
              <TabsList i18n={i18n} eventType={eventType as 'local' | 'tournament' | 'online'} />
            </Tabs.List>
            <Tabs.Panel value='basic' pt='xs'>
              <BasicSettings
                form={form}
                i18n={i18n}
                rulesets={rulesets}
                timezones={timezones}
                setEventType={setEventType}
                setRulesetValues={setRulesetValues}
              />
            </Tabs.Panel>
            <Tabs.Panel value={eventType} pt='xs'>
              <Stack>
                {eventType === 'online' && <OnlineSettings form={form} i18n={i18n} />}
                {eventType === 'local' && <LocalSettings form={form} i18n={i18n} />}
                {eventType === 'tournament' && <TournamentSettings i18n={i18n} form={form} />}
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
