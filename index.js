/**
 * @format
 */
import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (__DEV__) {
    console.log('[FCM] Background message:', remoteMessage.messageId);
  }
});

AppRegistry.registerComponent(appName, () => App);
