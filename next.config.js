module.exports = {
  // webpack: (config, { isServer, webpack }) => {
  //   console.log('IS SERVER', isServer)
  //   if (!isServer) {
  //     config.node = {
  //       dgram: 'empty',
  //       fs: 'empty',
  //       net: 'empty',
  //       tls: 'empty',
  //       child_process: 'empty',
  //     };
  //     config.plugins.push(new webpack.IgnorePlugin(/^(mongoose)$/));
  //     config.plugins.push(new webpack.IgnorePlugin(/^(mongodb)$/));
  //     config.plugins.push(new webpack.IgnorePlugin(/^(mongodb\-client\-encryption)$/));
  //     config.plugins.push(new webpack.IgnorePlugin(/^(swarm\-js)$/));
  //     config.plugins.push(new webpack.IgnorePlugin(/^(electron)$/));
  //     config.plugins.push(new webpack.IgnorePlugin({
  //       resourceRegExp: /^\.\/lib$/,
  //       contextRegExp: /mongodb$/,
  //     }));
  //     config.plugins.push(
  //       new webpack.IgnorePlugin({
  //         checkResource(resource, context) {
  //           // If I am including something from my backend directory, I am sure that this shouldn't be included in my frontend bundle
  //           if (resource.includes('/backend/') && !context.includes('node_modules')) {
  //             return true;
  //           }
  //           return false;
  //         },
  //       }),
  //     );
  //   }
  //   return config;
  // },
  distDir: 'out',
};