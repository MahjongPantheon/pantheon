import { Select, Text } from '@mantine/core';

// Preserve v6 semantics where modern Mantine defaults changed.
export const components = {
  Text: Text.extend({ defaultProps: { component: 'div' } }),
  Select: Select.extend({
    defaultProps: {
      allowDeselect: false,
      comboboxProps: { shadow: 'sm', transitionProps: { duration: 0 } },
    },
  }),
};
