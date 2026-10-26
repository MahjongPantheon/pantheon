/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { authCtx, PrivilegesLevel } from '../../hooks/auth';
import { useApi } from '../../hooks/api';
import { Container, LoadingOverlay, Stack, Tabs } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useI18n } from '../../hooks/i18n';
import { usePageTitle } from '../../hooks/pageTitle';
import { TabsList } from './TabsList';
import { BasicSettings } from './BasicSettings';
import { LocalSettings } from './LocalSettings';
import { TournamentSettings } from './TournamentSettings';
import { OnlineSettings } from './OnlineSettings';
import { RulesetSettings } from './RulesetSettings';
import { YakuSettings } from './YakuSettings';
import { IconCircleCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { EventCustom, FormFields } from './types';
import {
  EndingPolicy,
  EventData,
  EventType,
  PlatformType,
  RulesetConfig,
  UmaType,
  WindShuffleMode,
} from 'tsclients/proto/atoms.pb';
import { TopActionButton } from '../../components/TopActionButton';
import { notifications } from '@mantine/notifications';
import { nprogress } from '@mantine/nprogress';
import { Filler } from '../../helpers/filler';
import { Redirect, useLocation } from 'wouter';
import { useStorage } from '../../hooks/storage';
import { isGoalPointsValid } from './validation';
import { loadEventCopy } from './copy';

export const OwnedEventsEdit: React.FC<{ params: { id?: string; copyId?: string } }> = ({
  params: { id, copyId },
}) => {
  const { isLoggedIn, privilegesLevel, privilegesLoading } = useContext(authCtx);
  const api = useApi();
  const i18n = useI18n();
  api.setEventId(0);
  const storage = useStorage();
  const [, navigate] = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [validationAttempt, setValidationAttempt] = useState(0);
  const [validationTarget, setValidationTarget] = useState<{ field: HTMLElement } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [copyLoaded, setCopyLoaded] = useState(false);
  const [timezones, setTimezones] = useState<Array<{ value: string; label: string }>>([]);
  const [rules, setRules] = useState<Array<{ value: string; label: string; rules: RulesetConfig }>>(
    []
  );
  const [eventName, setEventName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (id) {
    usePageTitle(i18n._t('Edit event :: %1', [eventName]));
  } else {
    usePageTitle(i18n._t('New event'));
  }

  const form = useForm<FormFields>({
    initialValues: {
      event: {
        isListed: true,
        isRatingShown: true,
        achievementsShown: true,
        type: EventType.EVENT_TYPE_LOCAL,
        title: '',
        description: '',
        timezone: '',
        duration: 75, // min // tourn
        isTeam: false, // tourn/online
        isPrescripted: false, // tourn
        seriesLength: 0, // local/online
        minGames: 0, // local/online
        lobbyId: 0, // online
        allowViewOtherTables: false,
        platformId:
          privilegesLevel === PrivilegesLevel.SUPERADMIN
            ? PlatformType.PLATFORM_TYPE_UNSPECIFIED
            : PlatformType.PLATFORM_TYPE_TENHOUNET, // regular users can create only tenhou-based games
        allowManualAddReplay: true,
        windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_RANDOM, // so it's chosen by default when shown
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
        withTobi: false,
        withKazoe: false,
        withKiriageMangan: false,
        withKuitan: false,
        useAggregatedYakuhai: false,
        withLeadingDealerGameOver: false,
        withMultiYakumans: false,
        withNagashiMangan: false,
        playAdditionalRounds: false,
        equalizeUma: false,
        chomboAmount: 20000,
        goalPoints: 30000,
        maxPenalty: 20000,
        minPenalty: 100,
        penaltyStep: 100,
        replacementPlayerOverrideUma: -15000,
        oka: 0,
        uma: { place1: 15000, place2: 5000, place3: -5000, place4: -15000 },
        complexUma: {
          neg3: { place1: 12000, place2: -1000, place3: -3000, place4: -8000 },
          neg1: { place1: 8000, place2: 3000, place3: 1000, place4: -12000 },
          otherwise: { place1: 8000, place2: 4000, place3: -4000, place4: -8000 },
        },
        umaType: UmaType.UMA_TYPE_UMA_SIMPLE,
        allowedYaku: {},
        yakuWithPao: {},
        withWinningDealerHonbaSkipped: false,
        endingPolicy: EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED,
        startRating: 0,
        startPoints: 30000,
        honbaValue: 300,
        replacementPlayerFixedPoints: -15000, // tourn
        withYakitori: false,
        yakitoriPenalty: 0,
        chomboEndsGame: false,
        doubleYakuman: {},
      },
    },

    validate: {
      event: {
        title: (value) => (value.length > 4 ? null : 'Please use title more than 4 symbols long'),
        timezone: (value) => (value ? null : 'Timezone must be selected'),
      },
      ruleset: {
        goalPoints: (value, values) =>
          isGoalPointsValid(value, values.ruleset)
            ? null
            : i18n._t('Goal score must be at least the initial points'),
      },
    },
  });

  useEffect(() => {
    if (!validationAttempt) {
      return;
    }
    const field = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    const tab = field?.closest<HTMLElement>('[data-settings-tab]')?.dataset.settingsTab;
    if (field && tab) {
      setActiveTab(tab);
      setValidationTarget({ field });
    }
  }, [validationAttempt]);

  useEffect(() => {
    if (validationTarget) {
      validationTarget.field.focus({ preventScroll: true });
      validationTarget.field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [validationTarget]);

  const setFormValues = (eventData: EventCustom, currentRuleset: RulesetConfig) => {
    setConsistentWindShuffleMode(eventData);
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
        doubleYakuman: currentRuleset.doubleYakuman.reduce(
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
    if (!isLoggedIn || !storage.getPersonId()) {
      return;
    }
    let cancelled = false;
    nprogress.reset();
    nprogress.start();
    setIsLoading(true);
    setCopyLoaded(false);
    Promise.all([
      api.getRulesets(),
      api.getTimezones(),
      id ? api.getEventForEdit(parseInt(id, 10)) : Promise.resolve(null),
      copyId
        ? loadEventCopy(api, storage.getPersonId()!, parseInt(copyId, 10))
        : Promise.resolve(null),
    ])
      .then(([rulesets, timezoneData, eventData, eventCopy]) => {
        if (cancelled) {
          return;
        }
        setTimezones(timezoneData.timezones.map((z) => ({ value: z, label: z })));
        setRules(rulesets.map((r) => ({ value: r.id, label: r.title, rules: r.rules })));
        setIsFinished(false);
        if (copyId) {
          if (!eventCopy) {
            throw new Error(i18n._t('Failed to fetch event data'));
          }
          setFormValues(eventCopy, eventCopy.rulesetConfig);
          setCopyLoaded(true);
        } else if (id) {
          if (eventData) {
            // edit mode
            setEventName(eventData.event.title);
            setFormValues(eventData.event, eventData.event.rulesetConfig);
            setIsFinished(eventData.finished);
          } else {
            throw new Error(i18n._t('Failed to fetch event data'));
          }
        } else {
          form.reset();
        }
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
          nprogress.complete();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, privilegesLevel, id, copyId]);

  const submitForm = (vals: FormFields) => {
    if (isLoading || isSaving || (copyId && !copyLoaded)) {
      return;
    }
    setIsSaving(true);
    setIsSaved(false);
    (id
      ? api.updateEvent(parseInt(id, 10), makeEventData(vals))
      : api.createEvent(makeEventData(vals))
    )
      .then((r) => {
        if (r) {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 5000);
          if (!id) {
            navigate('/ownedEvents');
          }
        } else {
          throw new Error(i18n._t('Failed to save event: server error or network unreachable'));
        }
      })
      .catch((err: Error) => {
        notifications.show({
          title: i18n._t('Error has occurred'),
          message: err.message,
          color: 'red',
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (!storage.getPersonId()) {
    return <Redirect to='/profile/login' />;
  }

  // Referees can't edit events, so redirect them to games management
  if (id && !privilegesLoading && privilegesLevel < PrivilegesLevel.ADMIN) {
    return <Redirect to={`/event/${id}/games`} />;
  }

  if (copyId && !isLoading && !copyLoaded) {
    return null;
  }

  return (
    <>
      <Container data-testid='forseti-event-settings-page' pos='relative'>
        <LoadingOverlay visible={isLoading} overlayOpacity={1} />
        <form
          ref={formRef}
          onSubmit={form.onSubmit(submitForm, () => setValidationAttempt((attempt) => attempt + 1))}
        >
          <Tabs keepMounted value={activeTab} onTabChange={setActiveTab}>
            <Tabs.List position='left'>
              <TabsList i18n={i18n} form={form} />
            </Tabs.List>
            <Tabs.Panel value='basic' data-settings-tab='basic' pt='xs'>
              <BasicSettings
                newEvent={!id}
                rulesets={rules}
                form={form}
                i18n={i18n}
                timezones={timezones}
                setFormValues={setFormValues}
              />
            </Tabs.Panel>
            <Tabs.Panel
              value={form.getTransformedValues().event.type ?? EventType.EVENT_TYPE_LOCAL}
              data-settings-tab={
                form.getTransformedValues().event.type ?? EventType.EVENT_TYPE_LOCAL
              }
              pt='xs'
            >
              <Stack>
                {form.getTransformedValues().event.type === EventType.EVENT_TYPE_ONLINE && (
                  <OnlineSettings form={form} i18n={i18n} />
                )}
                {form.getTransformedValues().event.type === EventType.EVENT_TYPE_LOCAL && (
                  <LocalSettings form={form} i18n={i18n} />
                )}
                {form.getTransformedValues().event.type === EventType.EVENT_TYPE_TOURNAMENT && (
                  <TournamentSettings i18n={i18n} form={form} />
                )}
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value='ruleset_tuning' data-settings-tab='ruleset_tuning' pt='xs'>
              <RulesetSettings form={form} i18n={i18n} />
            </Tabs.Panel>
            <Tabs.Panel value='yaku_tuning' data-settings-tab='yaku_tuning' pt='xs'>
              <YakuSettings form={form} i18n={i18n} />
            </Tabs.Panel>
          </Tabs>
          {!isFinished && (
            <TopActionButton
              testId='forseti-event-settings-save'
              title={isSaved ? i18n._t('Changes saved!') : i18n._t('Save changes')}
              loading={isSaving || isLoading || isSaved}
              icon={isSaved ? <IconCircleCheck /> : <IconDeviceFloppy />}
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
            />
          )}
        </form>
      </Container>
      <Filler h='150px' />
    </>
  );
};

function setConsistentWindShuffleMode(eventData: EventCustom | EventData) {
  if (
    eventData.type !== EventType.EVENT_TYPE_TOURNAMENT ||
    eventData.windShuffleMode === undefined ||
    (!eventData.isPrescripted &&
      eventData.windShuffleMode == WindShuffleMode.WIND_SHUFFLE_MODE_PRESCRIPTED)
  ) {
    eventData.windShuffleMode = WindShuffleMode.WIND_SHUFFLE_MODE_UNSPECIFIED;
  }
}

function makeEventData(vals: FormFields): EventData {
  const eventData: EventData = {
    ...vals.event,
    rulesetConfig: {
      ...vals.ruleset,
      allowedYaku: Object.keys(vals.ruleset.allowedYaku)
        .filter((k) => vals.ruleset.allowedYaku[k])
        .map((v) => parseInt(v, 10)),
      yakuWithPao: Object.keys(vals.ruleset.yakuWithPao)
        .filter((k) => vals.ruleset.yakuWithPao[k])
        .map((v) => parseInt(v, 10)),
      doubleYakuman: Object.keys(vals.ruleset.doubleYakuman)
        .filter((k) => vals.ruleset.doubleYakuman[k])
        .map((v) => parseInt(v, 10)),
    },
  };
  setConsistentWindShuffleMode(eventData);
  return eventData;
}
