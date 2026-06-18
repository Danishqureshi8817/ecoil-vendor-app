module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@assets': './src/assets',
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@services': './src/services',
          '@hooks': './src/hooks',
          '@types': './src/types',
          '@config': './src/config',
          '@providers': './src/providers',
          '@navigations': './src/navigations',
          '@states': './src/states',
          '@layouts': './src/layouts',
          '@api': './src/api',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
