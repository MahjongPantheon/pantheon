import { useContext } from 'react';
import { modalsCtx } from '../hooks/modals';
import { Button, Group, Modal, Text } from '@mantine/core';
import * as React from 'react';
import { useI18n } from '../hooks/i18n';
import { useApi } from '../hooks/api';
import { notifications } from '@mantine/notifications';

export const RecalcAchievementsModal = () => {
  const modals = useContext(modalsCtx);
  const i18n = useI18n();
  const api = useApi();

  const recalcAchievements = (eid: number) => {
    api.recalcAchievements(eid).then((success) => {
      if (success) {
        notifications.show({
          title: i18n._t('Recalculation scheduled'),
          message: i18n._t(
            'Recalculation of achievements was successfully scheduled. Please wait.'
          ),
          color: 'green',
        });
      } else {
        notifications.show({
          title: i18n._t('Recalculation schedule failed'),
          message: i18n._t('Something went wrong. Contact pantheon service administrator'),
          color: 'red',
        });
      }
    });
  };

  return (
    <Modal
      data-testid='forseti-recalculate-achievements-modal'
      opened={modals.recalcAchievementsModalShown}
      onClose={modals.hideRecalcAchievementsModal}
      size='auto'
      centered
    >
      <Text>
        {i18n._t(
          'Recalculate achievements for event "%1" (id #%2)? Recalculation will be scheduled and will be completed in several minutes',
          [modals.recalcAchievementsModalData.title, modals.recalcAchievementsModalData.id]
        )}
      </Text>
      <Group mt='xl' grow>
        <Button
          data-testid='forseti-recalculate-achievements-cancel'
          variant='outline'
          onClick={modals.hideRecalcAchievementsModal}
        >
          {i18n._t('Cancel')}
        </Button>
        <Button
          data-testid='forseti-recalculate-achievements-confirm'
          color='red'
          variant='filled'
          onClick={() => {
            recalcAchievements(modals.recalcAchievementsModalData.id);
            modals.hideRecalcAchievementsModal();
          }}
        >
          {i18n._t('Recalculate')}
        </Button>
      </Group>
    </Modal>
  );
};
