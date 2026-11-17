import { createStyles } from '@mantine/emotion';
import {
  useMantineColorScheme,
  ActionIcon,
  Burger,
  Button,
  Container,
  Group,
  Paper,
  rem,
  Text,
  Title,
  Transition,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Filler } from './Filler';
import { useLocation, Link } from 'wouter';
import { useLanguage } from '../hooks/useLanguage';
import { useI18n } from '../hooks/i18n';
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandTelegram,
  IconDeviceMobile,
  IconGraph,
  IconSettings,
} from '@tabler/icons-react';
import { env } from '../env';
import { links } from '../Nav';

const useStyles = createStyles((theme, { dark }: { dark: boolean }, u) => ({
  wrapper: {
    backgroundImage: `linear-gradient(250deg, rgba(130, 201, 30, 0) 0%, rgba(0, 0, 0, 1) 70%), url(/assets/img/head.avif)`,
    backgroundRepeat: 'no-repeat',
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
    boxShadow: dark ? 'inset 0px -6px 16px 12px rgba(0,0,0,1)' : '0px 6px 16px 4px rgba(0,0,0,0.6)',
    color: '#ccc',
    position: 'relative',
    // backgroundSize: 'cover',
    backgroundPosition: '30% center',
    transition: 'all 0.5s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    width: 'calc(100% - 16px)',
    backgroundColor: 'rgb(33 37 41 / 0.8)',
    borderRadius: 4,
    margin: '8px',
    padding: '8px',
    display: 'flex',
    top: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },

  dropdown: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',
    boxShadow: '0px 6px 12px 0px rgba(0,0,0,0.3)',

    [u.largerThan('sm')]: {
      display: 'none',
    },
  },

  links: {
    [u.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    color: '#eee',
    [u.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: dark ? theme.colors.dark[0] : theme.colors.gray[7],
    [u.largerThan('sm')]: {
      color: theme.colors.dark[0],
    },
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    borderBottom: `3px solid transparent`,

    '&:hover': {
      backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[7],
    },

    [u.smallerThan('sm')]: {
      '&:hover': {
        backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[2],
      },
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    '&, &:hover': {
      borderBottom: `3px solid ${theme.colors.dark[3]}`,
      [u.smallerThan('sm')]: {
        borderBottom: 'none',
        backgroundColor: dark ? theme.colors.dark[6] : theme.colors.gray[2],
      },
      color: `var(--mantine-color-${theme.primaryColor}-light-color)`,
    },
  },

  title: {
    color: theme.white,
    fontFamily: `"IBM Plex Sans", ${theme.fontFamily}`,
    fontWeight: 900,
    lineHeight: 1.05,
    maxWidth: rem(450),
    fontSize: rem(48),

    [u.smallerThan('sm')]: {
      fontSize: rem(34),
      lineHeight: 1.15,
    },

    [u.smallerThan('xs')]: {
      maxWidth: '100%',
      fontSize: rem(24),
      lineHeight: 1.15,
    },
  },

  titleWrap: {
    margin: '0 20px',
    display: 'flex',
    gap: '32px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  control: {
    marginTop: 0,
    paddingLeft: rem(50),
    paddingRight: rem(50),
    maxWidth: rem(500),
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: rem(22),
    [u.smallerThan('xs')]: {
      fontSize: rem(16),
      paddingLeft: rem(20),
      paddingRight: rem(20),
    },
  },

  contacts: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 20,
    width: '50%',
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',

    '& > *': {
      opacity: 0.7,
    },
  },

  quickLinks: {
    position: 'absolute',
    bottom: 0,
    padding: 20,
    width: '50%',
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-start',

    '& > *': {
      opacity: 0.7,
    },
  },
}));

export const Hero = () => {
  const lang = useLanguage();
  const i18n = useI18n();
  const [opened, { toggle, close }] = useDisclosure(false);
  const { classes, cx } = useStyles({ dark: useMantineColorScheme().colorScheme === 'dark' });
  const [location, navigate] = useLocation();
  const collapsed = location !== '/' + lang;

  const items = links(i18n).map((link) => (
    <a
      key={link.link}
      href={link.link.startsWith('/') ? `/${lang}${link.link}` : link.link}
      target={link.link.startsWith('/') ? undefined : '_blank'}
      className={cx(classes.link, { [classes.linkActive]: location === `/${lang}${link.link}` })}
      onClick={(event) => {
        if (link.link.startsWith('/')) {
          event.preventDefault();
          navigate(`/${lang}${link.link}`);
        }
        close();
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <div
      className={classes.wrapper}
      style={{
        overflow: opened ? 'visible' : 'hidden',
        minHeight: collapsed ? 125 : 475,
      }}
    >
      {/* Main menu */}
      <Container className={classes.menu}>
        <a
          href={'/' + lang}
          className={cx(classes.link)}
          style={{ padding: 8, margin: -8, borderRadius: 4, backgroundColor: 'transparent' }}
          onClick={(event) => {
            event.preventDefault();
            navigate('/' + lang);
            close();
          }}
        >
          <Filler h='28px' color='#eee' />
        </a>
        <Group gap={5} className={classes.links}>
          {items}
        </Group>

        <Burger
          aria-label={i18n._t('Navigation menu')}
          opened={opened}
          onClick={toggle}
          className={classes.burger}
          size='sm'
          color='#eee'
        />

        <Transition transition='scale-y' duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>
      </Container>

      {/* Hero content */}
      <div
        className={classes.titleWrap}
        style={{
          opacity: collapsed ? 0 : 1,
          position: 'absolute',
          transition: 'all 0.4s',
        }}
      >
        <Title className={classes.title}>
          <Text component='span' inherit variant='gradient' gradient={{ from: 'pink', to: 'cyan' }}>
            {i18n._t('Track and assist your riichi games')}
          </Text>
        </Title>

        <Text>{i18n._t('Mahjong Pantheon can help with games and tournaments')}</Text>

        <Group>
          <Link to={`/${lang}/getStarted`}>
            <Button
              variant='gradient'
              gradient={{ from: 'pink', to: 'cyan' }}
              size='xl'
              className={classes.control}
            >
              {i18n._t('Get started')}
            </Button>
          </Link>
          {lang === 'ru' && (
            <Link to={`/${lang}/howToPlay`}>
              <Button
                variant='gradient'
                gradient={{ from: 'cyan', to: 'pink' }}
                size='xl'
                className={classes.control}
              >
                Как играть
              </Button>
            </Link>
          )}
        </Group>
      </div>

      <div className={classes.quickLinks}>
        <a href={env.urls.tyr} target='_blank' aria-label={i18n._t('Mobile assistant')}>
          <ActionIcon title={i18n._t('Mobile assistant')} color='green' variant='filled'>
            <IconDeviceMobile />
          </ActionIcon>
        </a>
        <a href={env.urls.sigrun} target='_blank' aria-label={i18n._t('Ratings and stats')}>
          <ActionIcon title={i18n._t('Ratings and stats')} color='blue' variant='filled'>
            <IconGraph />
          </ActionIcon>
        </a>
        <a href={env.urls.forseti} target='_blank' aria-label={i18n._t('Profile & admin panel')}>
          <ActionIcon title={i18n._t('Profile & admin panel')} color='orange' variant='filled'>
            <IconSettings />
          </ActionIcon>
        </a>
      </div>

      <div className={classes.contacts}>
        <a href='https://github.com/MahjongPantheon/pantheon' target='_blank' aria-label='GitHub'>
          <ActionIcon title='Github repo' color='gray' variant='filled'>
            <IconBrandGithub />
          </ActionIcon>
        </a>
        <a href='https://discord.gg/U5qBkexfEQ' target='_blank' aria-label='Discord (EN)'>
          <ActionIcon title='Discord (EN)' color='grape' variant='filled'>
            <IconBrandDiscord />
          </ActionIcon>
        </a>
        <a href='https://t.me/pantheon_support' target='_blank' aria-label='Telegram (RU)'>
          <ActionIcon title='Telegram (RU)' color='blue' variant='filled'>
            <IconBrandTelegram />
          </ActionIcon>
        </a>
      </div>
    </div>
  );
};
