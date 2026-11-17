import { createStyles } from '@mantine/emotion';
import { ThemeIcon, Text, Container, SimpleGrid, Group } from '@mantine/core';
import {
  IconChartDots,
  IconCrown,
  IconDeviceMobile,
  IconListCheck,
  IconNetwork,
  IconUsers,
} from '@tabler/icons-react';
import { useI18n } from '../hooks/i18n';

const featuresList = (i18n: ReturnType<typeof useI18n>) => [
  {
    icon: IconDeviceMobile,
    title: i18n._t('Game assistant'),
    description: i18n._t(
      'Pantheon provides easy to use web-based assistant for your mobile device, which you can use to add new hands and games'
    ),
  },
  {
    icon: IconChartDots,
    title: i18n._t('Player stats'),
    description: i18n._t(
      "Any player can see their own and opponents' statistics and achievements for particular event"
    ),
  },
  {
    icon: IconListCheck,
    title: i18n._t('Game logs'),
    description: i18n._t(
      'Pantheon saves all game logs and provides a way to view them conveniently both in mobile assistant and on main ratings page'
    ),
  },
  {
    icon: IconCrown,
    title: i18n._t('Tournament assistance'),
    description: i18n._t(
      'Any tournament host can use Pantheon to simplify the process of holding the tournament, use included seatings and other useful tools'
    ),
  },
  {
    icon: IconNetwork,
    title: i18n._t('Online tournaments'),
    description: i18n._t(
      'There is an option of holding an online tournament on external platform. Pantheon has paifu import functionality to view game logs'
    ),
  },
  {
    icon: IconUsers,
    title: i18n._t('Local club games'),
    description: i18n._t(
      'Pantheon helps not only with tournaments, it also can se used to log the games you play in your local club'
    ),
  },
];

interface FeatureProps {
  icon: React.FC<any>;
  title: string;
  description: string;
}

export function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div>
      <Group pb='sm'>
        <ThemeIcon variant='light' size={40} radius={40}>
          <Icon size='1.4rem' />
        </ThemeIcon>
        <Text mt='sm' mb={7}>
          {title}
        </Text>
      </Group>
      <Text size='sm' c='dimmed' style={{ lineHeight: 1.6 }}>
        {description}
      </Text>
    </div>
  );
}

const useStyles = createStyles((theme) => ({
  grid: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 50,
    '@media (max-width: 980px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: theme.spacing.xl,
    },
    '@media (max-width: 755px)': { gridTemplateColumns: '1fr' },
  },
  wrapper: {
    paddingBottom: `calc(${theme.spacing.xl} * 2)`,
  },
}));

export function FeaturesGrid() {
  const { classes } = useStyles();
  const i18n = useI18n();
  const features = featuresList(i18n).map((feature) => (
    <Feature
      icon={feature.icon}
      title={feature.title}
      description={feature.description}
      key={feature.title}
    />
  ));

  return (
    <Container className={classes.wrapper}>
      <SimpleGrid mt={60} className={classes.grid}>
        {features}
      </SimpleGrid>
    </Container>
  );
}
