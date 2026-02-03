const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '..');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  watchFolders: [root],
  resolver: {
    extraNodeModules: new Proxy(
      {
        // Point directly to the src folder instead of lib
        'credo-react-native-webview': path.join(root, 'src'),
      },
      {
        get: (target, name) => {
          if (target.hasOwnProperty(name)) {
            return target[name];
          }
          return path.join(__dirname, 'node_modules', name);
        },
      }
    ),
    // Make sure .tsx files are resolved
    sourceExts: [...defaultConfig.resolver.sourceExts, 'tsx', 'ts'],
  },
};

module.exports = mergeConfig(defaultConfig, config);