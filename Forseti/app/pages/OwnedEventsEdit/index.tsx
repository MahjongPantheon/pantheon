import * as React from 'react';
import { createRef, useContext, useEffect, useState } from 'react';
import { authCtx } from '#/hooks/auth';
import { useApi } from '#/hooks/api';
import { Center, Container, LoadingOverlay, Stack, Tabs, Notification } from '@mantine/core';
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
import { IconCircleCheck, IconDeviceFloppy, IconSettingsCheck } from '@tabler/icons-react';
import { FormFields } from '#/pages/OwnedEventsEdit/types';
import { EventData, EventType, RulesetConfig } from '#/clients/atoms.pb';
import { TopActionButton } from '#/helpers/TopActionButton';

export const OwnedEventsEdit: React.FC<{ params: { id?: string } }> = ({ params: { id } }) => {
  const { isLoggedIn } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  const formRef: React.RefObject<HTMLFormElement> = createRef();
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState<EventType>('LOCAL');
  const [timezones, setTimezones] = useState<Array<{ value: string; label: string }>>([]);
  const [rulesets, setRulesets] = useState<Array<{ value: string; label: string }>>([]);
  const [eventName, setEventName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorNotification, setErrorNotification] = useState('');
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
        lobbyId: 0, // online
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
        uma: { place1: 15000, place2: 5000, place3: -5000, place4: -15000 },
        complexUma: {
          neg3: { place1: 12000, place2: -1000, place3: -3000, place4: -8000 },
          neg1: { place1: 8000, place2: 3000, place3: 1000, place4: -12000 },
          otherwise: { place1: 8000, place2: 4000, place3: -4000, place4: -8000 },
        },
        umaType: 'UMA_SIMPLE',
        allowedYaku: {}, // TODO: reformat to array, as required by protocol
        yakuWithPao: {}, // TODO: reformat to array, as required by protocol
        withWinningDealerHonbaSkipped: false,
        endingPolicy: 'EP_NONE',
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

  const setFormValues = (eventData: EventData, currentRuleset: RulesetConfig) => {
    form.setValues({
      event: eventData,
      ruleset: {
        ...currentRuleset,
        allowedYaku: currentRuleset.allowedYaku.reduce(
          (acc: Record<string, boolean>, val: number) => {
            acc[val] = true;
            return acc;
          },
          {} as Record<string, boolean>
        ),
        yakuWithPao: currentRuleset.yakuWithPao.reduce(
          (acc: Record<string, boolean>, val: number) => {
            acc[val] = true;
            return acc;
          },
          {} as Record<string, boolean>
        ),
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
        setRulesets(rulesets.map((r) => ({ value: r.id, label: r.title })));
        // const rules = rulesets.reduce((acc, r) => {
        //   acc[r.id] = r.rules;
        //   return acc;
        // }, {} as Record<string, RulesetConfig>);
        if (eventData) {
          // edit mode
          setEventName(eventData.event.title);
          setEventType(eventData.event.type ?? 'LOCAL');
          setFormValues(eventData.event, eventData.event.rulesetConfig);
        } else {
          throw new Error(i18n._t('Failed to fetch event data'));
        }
      })
      .catch((err: Error) => {
        setErrorNotification(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isLoggedIn]);

  const submitForm = (vals: FormFields) => {
    if (id) {
      setIsSaving(true);
      setIsSaved(false);
      api
        .updateEvent(parseInt(id, 10), {
          ...vals.event,
          autostart: 0, // TODO: https://github.com/MahjongPantheon/pantheon/issues/282
          rulesetConfig: {
            ...vals.ruleset,
            allowedYaku: Object.keys(vals.ruleset.allowedYaku)
              .filter((k) => vals.ruleset.allowedYaku[k])
              .map((v) => parseInt(v, 10)),
            yakuWithPao: Object.keys(vals.ruleset.yakuWithPao)
              .filter((k) => vals.ruleset.yakuWithPao[k])
              .map((v) => parseInt(v, 10)),
          },
        })
        .then((r) => {
          if (r) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 5000);
          } else {
            throw new Error(i18n._t('Failed to save event: server error or network unreachable'));
          }
        })
        .catch((err: Error) => {
          setErrorNotification(err.message);
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  };

  /*
    TODO:

    Меняем логику
    - Для нового события:
    - Шаг 1: Выбираем при создании: тип события local/tournament/online и рулсет. Ограничить online тенхо рулсетом.
    - Шаг 2: Выдаем форму для задания параметров.

    2) Сделать роуты для нового события
   */

  return (
    <>
      <Container pos='relative'>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
        <form ref={formRef} onSubmit={form.onSubmit(submitForm)}>
          <Tabs defaultValue='basic'>
            <Tabs.List>
              <TabsList i18n={i18n} eventType={eventType as EventType} />
            </Tabs.List>
            <Tabs.Panel value='basic' pt='xs'>
              <BasicSettings form={form} i18n={i18n} timezones={timezones} />
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
          <TopActionButton
            title={isSaved ? i18n._t('Changes saved!') : i18n._t('Save changes')}
            loading={isSaving}
            disabled={isLoading || isSaved}
            icon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
          />
        </form>
      </Container>
      <Center h='150px'>
        <IconSettingsCheck />
      </Center>
      {!!errorNotification && (
        <Notification color='red' title={i18n._t('Error has occurred')}>
          {errorNotification}
        </Notification>
      )}
    </>
  );
};
