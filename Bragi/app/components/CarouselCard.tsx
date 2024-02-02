import { createStyles, Paper, Title, rem, useMantineTheme } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  card: {
    height: rem(440),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  title: {
    fontFamily: `"IBM Plex Sans", ${theme.fontFamily}`,
    fontWeight: 900,
    lineHeight: 1.2,
    fontSize: rem(14),
    padding: '10px',
    borderRadius: '4px',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  },

  category: {
    color: theme.white,
    opacity: 0.7,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
}));

interface CardProps {
  image: string;
  title: Record<string, string>;
  locale: string;
}

export function CarouselCard({ image, title, locale }: CardProps) {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <Paper
      shadow='md'
      p='xl'
      radius='md'
      sx={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
      className={classes.card}
    >
      <Title
        order={3}
        className={classes.title}
        style={{
          color: theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[8],
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[2],
        }}
      >
        {title[locale]}
      </Title>
    </Paper>
  );
}
