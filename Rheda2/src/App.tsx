import { useState } from "react";
import { Button, MantineProvider, Text } from "@mantine/core";
import { HeaderMenuColored } from "./AppHeader";

export function App() {
  const [count, setCount] = useState(0);
  const links = [{ label: "Test", link: "http://kek.com" }];

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <HeaderMenuColored links={links} />
      <div className="App">
        <h1>Vite + React</h1>
        <Text>Welcome to Mantine!</Text>
        <Button>Kek</Button>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR123
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </MantineProvider>
  );
}
