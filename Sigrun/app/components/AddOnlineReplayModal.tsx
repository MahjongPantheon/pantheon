import { useContext, useState } from 'react';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { globalsCtx } from '../hooks/globals';
import {
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Space,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import * as React from 'react';
import { modalsCtx } from '../hooks/modals';

export const AddOnlineReplayModal = () => {
  const [onlineLink, setOnlineLink] = useState('');
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const modals = useContext(modalsCtx);

  const api = useApi();
  const i18n = useI18n();
  const globals = useContext(globalsCtx);
  const theme = useMantineTheme();

  const tryAddOnline = () => {
    if (!onlineLink.match(/^https?:\/\/[^\/]+\/\d\/\?log=\d+gm-[0-9a-f]+-\d+-[0-9a-f]+/i)) {
      setOnlineError(i18n._t('Replay link is invalid. Please check if you copied it correctly'));
    } else {
      setOnlineError(null);
      setOnlineLoading(true);
      if (globals.data.eventId?.[0]) {
        api
          .addOnlineGame(globals.data.eventId?.[0], onlineLink)
          .then(() => {
            setOnlineLoading(false);
            window.location.href = `/event/${globals.data.eventId}/games`;
          })
          .catch((e) => {
            setOnlineLoading(false);
            setOnlineError(e.message);
          });
      }
    }
  };

  return (
    <Modal
      opened={modals.onlineModalShown}
      onClose={modals.hideOnlineModal}
      overlayProps={{
        color: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
        opacity: 0.55,
        blur: 3,
      }}
      title={i18n._t('Add online game')}
      centered
    >
      <LoadingOverlay visible={onlineLoading} />
      <TextInput
        placeholder='http://tenhou.net/0/?log=XXXXXXXXXXgm-XXXX-XXXXX-XXXXXXXX'
        label={'Enter replay URL'}
        error={onlineError}
        value={onlineLink}
        onChange={(event) => setOnlineLink(event.currentTarget.value)}
        withAsterisk
      />
      <Space h='md' />
      <Group position='right'>
        <Button onClick={tryAddOnline}>{i18n._t('Add replay')}</Button>
      </Group>
    </Modal>
  );
};
