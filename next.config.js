module.exports = {
  target: "serverless",
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(new webpack.IgnorePlugin(/^(mongoose|mongodb|mongodb-client-encryption|electron)$/));
    }
    return config;
  },
  distDir: 'out',
};