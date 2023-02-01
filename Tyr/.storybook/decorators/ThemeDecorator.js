export const ThemeDecorator = (Story) => (
  <div className='theme-day' style={{ width: '100vw', height: '100vh' }}>
    <Story />
  </div>
);
