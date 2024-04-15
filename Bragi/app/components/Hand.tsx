import { PropsWithChildren } from 'react';
import { createStyles } from '@mantine/core';

const useStyles = createStyles(() => ({
  hand: {
    display: 'flex',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '10px',
    margin: '10px 0',
  },
  closed: {
    backgroundColor: 'rgba(160, 160, 160, 0.2)',
    borderRadius: '4px',
    padding: '10px',
    margin: 0,
  },
  open: {
    padding: '10px',
    margin: 0,
  },
}));

export const Hand = ({ children }: PropsWithChildren) => {
  const { classes } = useStyles();
  return <div className={classes.hand}>{children}</div>;
};

export const ClosedPart = ({ children }: PropsWithChildren) => {
  const { classes, cx } = useStyles();
  return <div className={cx(classes.hand, classes.closed)}>{children}</div>;
};

export const OpenPart = ({ children }: PropsWithChildren) => {
  const { classes, cx } = useStyles();
  return <div className={cx(classes.hand, classes.open)}>{children}</div>;
};

export const TileSet = ({ children }: PropsWithChildren) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 0, alignItems: 'flex-end' }}>
      {children}
    </div>
  );
};
