import { createStyles, Avatar, Text, Group } from '@mantine/core';
import { IconAt, IconBrandGithub } from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[8],
  },

  name: {
    fontFamily: `IBM Plex Sans, ${theme.fontFamily}`,
  },
}));

interface UserInfoIconsProps {
  avatar: string | null;
  name: string;
  title: string;
  github?: string;
  email?: string;
}

export function InfoCard({ avatar, name, title, github, email }: UserInfoIconsProps) {
  const { classes } = useStyles();
  return (
    <div>
      <Group noWrap>
        <Avatar src={avatar} size={94} radius='md' />
        <div>
          <Text fz='xs' tt='uppercase' fw={700} c='dimmed'>
            {title}
          </Text>

          <Text fz='lg' fw={500} className={classes.name}>
            {name}
          </Text>

          <Group spacing={6}>
            {email && (
              <Group noWrap spacing={10} mt={3}>
                <a href={`mailto:${email}`} target='_blank'>
                  <Text fz='xs' c='dimmed'>
                    <IconAt stroke={1.5} size='1rem' className={classes.icon} />
                  </Text>
                </a>
              </Group>
            )}

            {github && (
              <Group noWrap spacing={10} mt={5}>
                <Text fz='xs' c='dimmed'>
                  <a href={github} target='_blank'>
                    <IconBrandGithub stroke={1.5} size='1rem' className={classes.icon} />
                  </a>
                </Text>
              </Group>
            )}
          </Group>
        </div>
      </Group>
    </div>
  );
}
