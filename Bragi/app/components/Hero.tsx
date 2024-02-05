import {
  ActionIcon,
  Burger,
  Button,
  Container,
  createStyles,
  Group,
  Paper,
  rem,
  Text,
  Title,
  Transition,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Filler } from './Filler';
import { useLocation, Link } from 'wouter';
import { useStorage } from '../hooks/storage';
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

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundImage: `linear-gradient(250deg, rgba(130, 201, 30, 0) 0%, rgba(0, 0, 0, 1) 70%), url(/assets/img/head.avif)`,
    backgroundRepeat: 'no-repeat',
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
    boxShadow:
      theme.colorScheme === 'dark'
        ? 'inset 0px -6px 16px 12px rgba(0,0,0,1)'
        : '0px 6px 16px 4px rgba(0,0,0,0.6)',
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

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    color: '#eee',
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    [theme.fn.largerThan('sm')]: {
      color: theme.colors.dark[0],
    },
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    borderBottom: `3px solid transparent`,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[7],
    },

    [theme.fn.smallerThan('sm')]: {
      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
      },
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    '&, &:hover': {
      borderBottom: `3px solid ${theme.colors.dark[3]}`,
      [theme.fn.smallerThan('sm')]: {
        borderBottom: 'none',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
      },
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },

  title: {
    color: theme.white,
    fontFamily: `"IBM Plex Sans", ${theme.fontFamily}`,
    fontWeight: 900,
    lineHeight: 1.05,
    maxWidth: rem(450),
    fontSize: rem(48),

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(34),
      lineHeight: 1.15,
    },

    [theme.fn.smallerThan('xs')]: {
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
    [theme.fn.smallerThan('xs')]: {
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
  const storage = useStorage();
  const lang = storage.getLang() ?? 'en';
  const [opened, { toggle, close }] = useDisclosure(false);
  const [active, setActive] = useState('/');
  const { classes, cx } = useStyles();
  const [location, navigate] = useLocation();
  const collapsed = location !== '/';

  useEffect(() => {
    links.forEach((link) => {
      if (location === link.link) {
        setActive(link.link);
      }
    });
  }, [location]);

  const items = links.map((link, idx) => (
    <a
      key={`mainmenu_${idx}`}
      href={link.link}
      target={link.link.startsWith('/') ? undefined : '_blank'}
      className={cx(classes.link, { [classes.linkActive]: active === link.link })}
      onClick={(event) => {
        if (link.link.startsWith('/')) {
          event.preventDefault();
          navigate(link.link);
        }
        close();
      }}
    >
      {link.label[lang as 'en' | 'ru']}
    </a>
  ));

  return (
    <div
      className={classes.wrapper}
      style={{
        height: collapsed ? 125 : 475,
      }}
    >
      {/* Main menu */}
      <Container className={classes.menu}>
        <a
          href='/'
          className={cx(classes.link)}
          style={{ padding: 8, margin: -8, borderRadius: 4, backgroundColor: 'transparent' }}
          onClick={(event) => {
            event.preventDefault();
            navigate('/');
            setActive('/');
            close();
          }}
        >
          <Filler h='28px' color='#eee' />
        </a>
        <Group spacing={5} className={classes.links}>
          {items}
        </Group>

        <Burger
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
        {storage.getLang() === 'ru' ? (
          <Title className={classes.title}>
            <Text
              component='span'
              inherit
              variant='gradient'
              gradient={{ from: 'pink', to: 'cyan' }}
            >
              Запись&nbsp;и&nbsp;помощь
            </Text>{' '}
            с&nbsp;играми&nbsp;в&nbsp;риичи
          </Title>
        ) : (
          <Title className={classes.title}>
            <Text
              component='span'
              inherit
              variant='gradient'
              gradient={{ from: 'pink', to: 'cyan' }}
            >
              Track&nbsp;and&nbsp;assist
            </Text>{' '}
            your&nbsp;riichi&nbsp;games
          </Title>
        )}

        <Text>
          {storage.getLang() === 'ru'
            ? 'Mahjong Pantheon поможет с играми и турнирами'
            : 'Mahjong Pantheon can help with games and tournaments'}
        </Text>

        <Link to='/getStarted'>
          <Button
            variant='gradient'
            gradient={{ from: 'pink', to: 'cyan' }}
            size='xl'
            className={classes.control}
          >
            {storage.getLang() === 'ru' ? 'Начинаем?' : 'Get started'}
          </Button>
        </Link>
      </div>

      <div className={classes.quickLinks}>
        <a href={env.urls.tyr} target='_blank'>
          <ActionIcon
            title={storage.getLang() === 'ru' ? 'Мобильный ассистент' : 'Mobile assistant'}
            color='green'
            variant='filled'
          >
            <IconDeviceMobile />
          </ActionIcon>
        </a>
        <a href={env.urls.sigrun} target='_blank'>
          <ActionIcon
            title={storage.getLang() === 'ru' ? 'Рейтинги и статистика' : 'Ratings and stats'}
            color='blue'
            variant='filled'
          >
            <IconGraph />
          </ActionIcon>
        </a>
        <a href={env.urls.forseti} target='_blank'>
          <ActionIcon
            title={storage.getLang() === 'ru' ? 'Профиль и админка' : 'Profile & admin panel'}
            color='orange'
            variant='filled'
          >
            <IconSettings />
          </ActionIcon>
        </a>
      </div>

      <div className={classes.contacts}>
        <a href='https://github.com/MahjongPantheon/pantheon' target='_blank'>
          <ActionIcon title='Github repo' color='gray' variant='filled'>
            <IconBrandGithub />
          </ActionIcon>
        </a>
        <a href='https://discord.gg/U5qBkexfEQ' target='_blank'>
          <ActionIcon title='Discord (EN)' color='grape' variant='filled'>
            <IconBrandDiscord />
          </ActionIcon>
        </a>
        <a href='https://t.me/pantheon_support' target='_blank'>
          <ActionIcon title='Telegram (RU)' color='blue' variant='filled'>
            <IconBrandTelegram />
          </ActionIcon>
        </a>
      </div>
    </div>
  );
};
