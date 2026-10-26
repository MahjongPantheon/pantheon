import favicon from '../../assets/ico/favicon.png';
import { Helmet } from 'react-helmet-async';
import { env } from '../env';
import { useI18n } from '../hooks/i18n';

type MetaProps = {
  title?: string;
  description?: string;
};

export const Meta = ({ title, description }: MetaProps) => {
  const i18n = useI18n();
  title ??= i18n._t('Sigrun: riichi mahjong ratings and statistics');
  description ??= i18n._t(
    'Sigrun is the statistics viewer for riichi mahjong club games and tournaments powered by Mahjong Pantheon system. It provides game logs, player statistics with graphs, rating tables and achievements list.'
  );
  return (
    <Helmet>
      <title>{title}</title>
      <meta charSet='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
      <meta name='title' content={title} />
      {description && <meta name='description' content={description} />}
      <meta property='og:type' content='website' />
      <meta property='og:url' content={env.urls.sigrun} />
      <meta property='og:title' content={title} />
      {description && <meta property='og:description' content={description} />}
      <meta property='twitter:card' content='summary' />
      <meta property='twitter:url' content={env.urls.sigrun} />
      <meta property='twitter:title' content={title} />
      {description && <meta property='twitter:description' content={description} />}
      <link rel='icon' type='image/png' href={favicon} />
      <link rel='help' href={env.urls.bragi} />
    </Helmet>
  );
};
