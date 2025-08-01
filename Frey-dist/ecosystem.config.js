module.exports = {
  apps: [
    {
      name: "Frey",
      script: "./server.js",
      exec_mode: 'cluster',
      instances: 8,
      env_production: {
        PORT: 4104,
        NODE_ENV: "production",
      },
    },
  ],
};
