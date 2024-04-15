import { createStyles } from '@mantine/core';

export enum TileValue {
  Space = 'SPACE',
  Closed = 'CLOSED',

  Man1 = 'MAN_1',
  Man2 = 'MAN_2',
  Man3 = 'MAN_3',
  Man4 = 'MAN_4',
  Man5 = 'MAN_5',
  Man6 = 'MAN_6',
  Man7 = 'MAN_7',
  Man8 = 'MAN_8',
  Man9 = 'MAN_9',

  Pin1 = 'PIN_1',
  Pin2 = 'PIN_2',
  Pin3 = 'PIN_3',
  Pin4 = 'PIN_4',
  Pin5 = 'PIN_5',
  Pin6 = 'PIN_6',
  Pin7 = 'PIN_7',
  Pin8 = 'PIN_8',
  Pin9 = 'PIN_9',

  Sou1 = 'SOU_1',
  Sou2 = 'SOU_2',
  Sou3 = 'SOU_3',
  Sou4 = 'SOU_4',
  Sou5 = 'SOU_5',
  Sou6 = 'SOU_6',
  Sou7 = 'SOU_7',
  Sou8 = 'SOU_8',
  Sou9 = 'SOU_9',

  Ton = 'TON',
  Nan = 'NAN',
  Sha = 'SHA',
  Pei = 'PEI',

  Haku = 'HAKU',
  Hatsu = 'HATSU',
  Chun = 'CHUN',
}

const useStyles = createStyles(() => ({
  wrapper: {
    width: '32px',
    height: '45px',
    display: 'flex',
    position: 'relative',
  },
  closed: {
    backgroundColor: '#965818',
    borderRadius: '4px',
  },
  tile: {
    position: 'absolute',
    border: '1px solid #999',
    top: 0,
    left: 0,
    width: '32px',
    height: '44px',
    padding: '4px',
    display: 'inline-block',
    backgroundColor: '#ddd',
    borderRadius: '4px',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
  },
  rotated: {
    transform: 'rotate(90deg)',
    top: 'unset',
    left: '6px',
    bottom: '-5px',
  },
  shominkan: {
    bottom: '27px',
  },
  rotatedBg: {
    width: '44px',
    height: '32px',
  },
  spacer: {
    display: 'inline-block',
    width: '10px',
  },
}));

export const Tile = ({
  value,
  rotated,
  shominkan,
}: {
  value: TileValue;
  rotated?: boolean;
  shominkan?: boolean;
}) => {
  const { classes, cx } = useStyles();
  rotated ??= false;
  shominkan ??= false;

  if (value === TileValue.Space) {
    return <div className={classes.spacer}>&nbsp;</div>;
  }

  if (value === TileValue.Closed) {
    return <div className={cx(classes.wrapper, classes.closed)}>&nbsp;</div>;
  }

  return (
    <div className={cx(classes.wrapper, rotated ? classes.rotatedBg : null)}>
      <div
        className={cx(classes.tile, rotated ? classes.rotated : null)}
        style={{ backgroundImage: `url(/assets/img/tiles/${value}.avif)` }}
      >
        &nbsp;
      </div>
      {shominkan && (
        <div
          className={cx(classes.tile, rotated ? classes.rotated : null, classes.shominkan)}
          style={{ backgroundImage: `url(/assets/img/tiles/${value}.avif)` }}
        >
          &nbsp;
        </div>
      )}
    </div>
  );
};
