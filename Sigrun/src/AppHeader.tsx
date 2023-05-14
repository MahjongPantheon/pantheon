import {
  createStyles,
  Header,
  Menu,
  Group,
  Center,
  Burger,
  Container,
  rem,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconLanguageHiragana, IconMoonStars, IconSun } from '@tabler/icons-react';
import rhedaIco from '../assets/ico/rhedaico.png';
import { FlagEn, FlagRu } from './helpers/flags';
import { useI18n } from './hooks/i18n';

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({
      variant: 'filled',
      color: theme.primaryColor,
    }).background,
    borderBottom: 0,
  },

  inner: {
    height: rem(56),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
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
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background!,
        0.1
      ),
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },
}));

interface AppHeaderProps {
  links: {
    link: string;
    label: string;
    links?: { link: string; label: string }[];
  }[];
  dark: boolean;
  toggleColorScheme: () => void;
  saveLang: (lang: string) => void;
}

export function AppHeader({ links, dark, toggleColorScheme, saveLang }: AppHeaderProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes } = useStyles();
  const i18n = useI18n();

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>{item.label}</Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger='hover' transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <a
              href={link.link}
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size='0.9rem' stroke={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a
        key={link.label}
        href={link.link}
        className={classes.link}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </a>
    );
  });

  return (
    <Header height={56} className={classes.header} mb={120}>
      <Container>
        <div className={classes.inner}>
          <img src={rhedaIco} alt='Rheda' height='28' />
          <Group spacing={5} className={classes.links}>
            {items}
          </Group>
          <Group>
            <ActionIcon
              variant='filled'
              color={dark ? 'grape' : 'indigo'}
              onClick={() => toggleColorScheme()}
              title={i18n._t('Toggle color scheme')}
            >
              {dark ? <IconSun size='1.1rem' /> : <IconMoonStars size='1.1rem' />}
            </ActionIcon>
            <Menu shadow='md' width={200}>
              <Menu.Target>
                <ActionIcon color='green' variant='filled' title={i18n._t('Language')}>
                  <IconLanguageHiragana size='1.1rem' />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => saveLang('en')} icon={<FlagEn width={24} />}>
                  en
                </Menu.Item>
                <Menu.Item onClick={() => saveLang('ru')} icon={<FlagRu width={24} />}>
                  ru
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size='sm'
            color='#fff'
          />
        </div>
      </Container>
    </Header>
  );
}
