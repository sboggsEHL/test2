module.exports = {
  apps: [
    {
      name: 'ehlnode',
      script: './app.js',
      watch: true,
      ignore_watch: ['logs', 'node_modules'],
      env: {
        NODE_ENV: 'development',
        DEBUG: 'socket.io*' // Enable debug logging for socket.io
      },
      env_production: {
        NODE_ENV: 'production',
        DEBUG: 'socket.io*' // Enable debug logging for socket.io in production
      }
    },
  ],
};
