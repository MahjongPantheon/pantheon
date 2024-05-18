import { Meta } from '@storybook/react';

import { FourSidedScreen } from './FourSidedScreen';
import { PageDecorator } from '../../../../.storybook/PageDecorator';

export default {
  title: 'Molecules / FourSidedScreen',
  component: FourSidedScreen,
  decorators: [PageDecorator],
  render: (args) => {
    return (
      <div style={{ width: '100%', height: '400px' }}>
        <FourSidedScreen {...args} />
      </div>
    );
  },
} satisfies Meta<typeof FourSidedScreen>;

export const Default = {
  args: {
    sideUp: (
      <>
        Test content for upper side
        <br />
        lol kek
        <br />
        top kek
      </>
    ),
    sideLeft: (
      <>
        Test content for left side
        <br />
        lol kek
        <br />
        top kek
      </>
    ),
    sideDown: (
      <>
        Test content for down side klfhashjashfjhasjf hasjfh
        <br />
        lol kek
        <br />
        top kek
      </>
    ),
    sideRight: (
      <>
        Test content for right side asfhasjfhs ajfh alshfjh asfh
        <br />
        lol kek
        <br />
        top kek
      </>
    ),
    center: (
      <>
        Test content for center
        <br />
        lol kek
        <br />
        top kek
      </>
    ),
  },
};
