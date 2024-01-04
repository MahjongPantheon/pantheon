import { useContext } from 'react';
import { modalsCtx } from '../hooks/modals';
import { Button, Group, Modal, Text } from '@mantine/core';
import * as React from 'react';
import { useI18n } from '../hooks/i18n';
import { useLocation } from 'wouter';
import { useApi } from '../hooks/api';

export const StopEventModal = () => {
  const modals = useContext(modalsCtx);
  const i18n = useI18n();
  const [, navigate] = useLocation();
  const api = useApi();

  const stopEvent = (eid: number) => {
    api.finishEvent(eid).then(() => {
      navigate('/ownedEvents');
    });
  };

  return (
    <Modal
      opened={modals.stopEventModalShown}
      onClose={modals.hideStopEventModal}
      size='auto'
      centered
    >
      <Text>
        {i18n._t('Stop event "%1" (id #%2)? This action can\'t be undone!', [
          modals.stopEventModalData.title,
          modals.stopEventModalData.id,
        ])}
      </Text>
      <Group mt='xl' grow>
        <Button variant='outline' onClick={modals.hideStopEventModal}>
          {i18n._t('Cancel')}
        </Button>
        <Button
          color='red'
          variant='filled'
          onClick={() => {
            stopEvent(modals.stopEventModalData.id);
            modals.hideStopEventModal();
          }}
        >
          {i18n._t('Stop event')}
        </Button>
      </Group>
    </Modal>
  );
};
