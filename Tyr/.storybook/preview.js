import '../app/styles/base.css'
import '../app/styles/themes.css'
import '../app/styles/variables.css'

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: 'fullscreen'
}

export const decorators = [
  (Story) => (
      <div className="theme-day" style={{width: '100vw', height: '100vh'}}>
        <Story/>
      </div>
    )
]
