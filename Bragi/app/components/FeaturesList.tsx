import { ThemeIcon, Text, Container, SimpleGrid, createStyles, Group } from '@mantine/core';
import {
  IconChartDots,
  IconCrown,
  IconDeviceMobile,
  IconListCheck,
  IconNetwork,
  IconUsers,
} from '@tabler/icons-react';
import { useStorage } from '../hooks/storage';

const featuresList = [
  {
    icon: IconDeviceMobile,
    title: { en: 'Game assistant', ru: 'Ассистент для игр' },
    description: {
      en: 'Pantheon provides easy to use web-based assistant for your mobile device, which you can use to add new hands and games',
      ru: 'Pantheon предоставляет простой веб-ассистент для вашего мобильного устройства для ввода раздач и игр',
    },
  },
  {
    icon: IconChartDots,
    title: { en: 'Player stats', ru: 'Статистика игрока' },
    description: {
      en: "Any player can see their own and opponents' statistics and achievements for particular event",
      ru: 'Любой игрок может посмотреть свои и не только статистику и номинации для конкретного рейтинга',
    },
  },
  {
    icon: IconListCheck,
    title: { en: 'Game logs', ru: 'Логи игр' },
    description: {
      en: 'Pantheon saves all game logs and provides a way to view them conveniently both in mobile assistant and on main ratings page',
      ru: 'Pantheon сохраняет все логи игр и предоставляет возможность их удобного просмотра как в ассистенте, так и в общем списке',
    },
  },
  {
    icon: IconCrown,
    title: { en: 'Tournament assistance', ru: 'Проведение турниров' },
    description: {
      en: 'Any tournament host can use Pantheon to simplify the process of holding the tournament, use included seatings and other useful tools',
      ru: 'Каждый организатор турнира может использовать Pantheon для упрощения процесса проведения турнира, использовать встроенные рассадки и другие полезные инструменты',
    },
  },
  {
    icon: IconNetwork,
    title: { en: 'Online tournaments', ru: 'Онлайн-турниры' },
    description: {
      en: 'There is an option of holding an online tournament on external platform. Pantheon has paifu import functionality to view game logs',
      ru: 'Есть возможность проведения онлайн-турниров на внешних платформах. Pantheon имеет возможность импорта реплеев для просмотра логов игр',
    },
  },
  {
    icon: IconUsers,
    title: { en: 'Local club games', ru: 'Клубные и свободные игры' },
    description: {
      en: 'Pantheon helps not only with tournaments, it also can se used to log the games you play in your local club',
      ru: 'Pantheon помогает не только с турнирами, есть также возможность записывать игры, которые вы играете в своем клубе',
    },
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
      <Text size='sm' color='dimmed' sx={{ lineHeight: 1.6 }}>
        {description}
      </Text>
    </div>
  );
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingBottom: `calc(${theme.spacing.xl} * 2)`,
  },
}));

export function FeaturesGrid() {
  const { classes } = useStyles();
  const storage = useStorage();
  const lang = storage.getLang() ?? 'en';
  const features = featuresList.map((feature, index) => (
    <Feature
      icon={feature.icon}
      title={feature.title[lang as 'en' | 'ru']}
      description={feature.description[lang as 'en' | 'ru']}
      key={index}
    />
  ));

  return (
    <Container className={classes.wrapper}>
      <SimpleGrid
        mt={60}
        cols={3}
        spacing={50}
        breakpoints={[
          { maxWidth: 980, cols: 2, spacing: 'xl' },
          { maxWidth: 755, cols: 1, spacing: 'xl' },
        ]}
      >
        {features}
      </SimpleGrid>
    </Container>
  );
}
