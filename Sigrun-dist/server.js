import process from "node:process";

import("http").then((http) => {
  const server = http.createServer(() => {});
  const port = parseInt(process.env.PORT ?? "4102");
  server.listen(port, "localhost", () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log("Dummy server started. Waiting for deps to be installed...");
  });
});
