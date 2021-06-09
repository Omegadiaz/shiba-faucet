module.exports = {
  target: "serverless",
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(new webpack.IgnorePlugin(/^(mongoose)$/));
    }
    return config;
  },
};