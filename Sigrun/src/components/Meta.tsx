import favicon from '../../assets/ico/favicon.png';
import { Helmet } from 'react-helmet';
import { env } from '../env';

type MetaProps = {
  title: string;
  description?: string;
};

export const Meta = ({ title, description }: MetaProps) => {
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
      <link rel='help' href='https://riichimahjong.org/' />
    </Helmet>
  );
};
