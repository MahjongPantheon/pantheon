import { Text } from '@mantine/core';
import { useI18n } from '../hooks/i18n';
import { useLanguage } from '../hooks/useLanguage';

export function TranslationNotice() {
  const language = useLanguage();
  const i18n = useI18n();
  return (
    <Text component='aside' size='sm' c='dimmed' mt='xl' className='translationNotice'>
      {language === 'en' || language === 'ru'
        ? i18n._t('Other language editions include machine-generated translations.')
        : i18n._t('This page is a machine-generated translation.')}{' '}
      {i18n._t('Everyone is welcome to help refine translations. Suggest changes on')}{' '}
      <a href='https://github.com/MahjongPantheon/pantheon/tree/master/Bragi'>GitHub</a>{' '}
      {i18n._t('or contact the developers on')} <a href='https://discord.gg/U5qBkexfEQ'>Discord</a>.
    </Text>
  );
}
