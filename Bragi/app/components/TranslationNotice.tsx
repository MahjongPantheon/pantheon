import { Text } from '@mantine/core';
import { useI18n } from '../hooks/i18n';

export function TranslationNotice() {
  const i18n = useI18n();
  return (
    <Text component='aside' size='sm' c='dimmed' mt='xl' className='translationNotice'>
      {i18n._t('This page was translated or prepared with the help of AI.')}{' '}
      {i18n._t('If you notice any mistakes, please suggest corrections on')}{' '}
      <a href='https://github.com/MahjongPantheon/pantheon/tree/master/Bragi'>GitHub</a>{' '}
      {i18n._t('or contact the developers on')} <a href='https://discord.gg/U5qBkexfEQ'>Discord</a>.
    </Text>
  );
}
