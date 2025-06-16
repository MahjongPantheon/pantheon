import { Meta } from '@storybook/react-vite';
import { BottomPanel } from './BottomPanel';
import { Button } from '../Button/Button';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Atoms / BottomPanel',
  component: BottomPanel,
  decorators: [PageDecorator],
  render: () => {
    return (
      <div
        style={{
          width: '200px',
          height: '200px',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <div>Something on page</div>
        <BottomPanel>
          <Button variant='light'>Button</Button>
          <Button variant='light'>Button</Button>
          <Button variant='light'>Button</Button>
          <Button variant='light'>Button</Button>
          <Button variant='light'>Button</Button>
        </BottomPanel>
      </div>
    );
  },
} satisfies Meta<typeof Button>;

export const Default = {};
