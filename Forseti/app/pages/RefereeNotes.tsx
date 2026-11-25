import { Container } from '@mantine/core';
import { Redirect } from 'wouter';
import { RefereeNotes as Notes } from '../components/RefereeNotes';
import { useApi } from '../hooks/api';
import { useI18n } from '../hooks/i18n';
import { usePageTitle } from '../hooks/pageTitle';
import { useStorage } from '../hooks/storage';

export const RefereeNotes = ({ params: { id } }: { params: { id: string } }) => {
  const i18n = useI18n();
  const storage = useStorage();
  const api = useApi();
  api.setEventId(Number(id));
  usePageTitle(i18n._t('Referee notes'));
  if (!storage.getPersonId()) return <Redirect to='/profile/login' />;
  return (
    <Container data-testid='forseti-referee-notes-page'>
      <Notes key={id} eventId={Number(id)} />
    </Container>
  );
};
