module.exports = {
  target: "serverless",
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(new webpack.IgnorePlugin(/^(mongoose|mongodb|mongodb-client-encryption|swarm-js)$/));
    }
    return config;
  },
  distDir: 'out',
};