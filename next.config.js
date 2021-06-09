module.exports = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.node = {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
      };

      config.plugins.push(new webpack.IgnorePlugin(/^(mongodb-client-encryption|electron)$/));
    }
    return config;
  },
};