import {Alert, AppRegistry, View, Text, I18nManager} from 'react-native';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import {
  NavigationContainer,
  // NavigationActions,
  // StackActions,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import * as React from 'react';
import {
  uxcamKey,
  SplashScreenName,
  MyIssuesScreenName,
  LoginScreenName,
  SmsVerificationScreenName,
  NewIssueScreenName,
  EditIssueScreenName,
  ActiveIssueScreenName,
  StatusInfoScreenName,
} from './resource/BaseValue';
import {LoginScreen} from './screens/ScreenLogin';
import MyIssuesScreen from './screens/ScreenMyIssues';
import NewIssueScreen from './screens/ScreenNewIssue';
import ActiveIssueScreen from './screens/ScreenActiveIssue';
import {SmsVerificationScreen} from './screens/ScreenSMSVerification';
import EditIssueScreen from './screens/ScreenEditIssue';
// import '@react-native-firebase/app';
// import '@react-native-firebase/crashlytics';
// import '@react-native-firebase/analytics';
// import '@react-native-firebase/auth';
// import messaging from '@react-native-firebase/messaging';
// import crashlytics from '@react-native-firebase/crashlytics';
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import PushNotification from 'react-native-push-notification';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusInformationScreen from './screens/ScreenStatusInformation';
import RNUxcam from 'react-native-ux-cam';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SplashScreen} from './screens/ScreenSpash';
RNUxcam.optIntoSchematicRecordings(); // Add this line to enable iOS screen recordings
RNUxcam.startWithKey(uxcamKey);

const Stack = createNativeStackNavigator();

console.disableYellowBox = true;
// crashlytics().recordError('abc');
console.log('Run app');

// Render the app container component with the provider around it
export const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SplashScreenName}
        screenOptions={{headerShown: false}}>
        <Stack.Screen name={SplashScreenName} component={SplashScreen} />
        <Stack.Screen name={LoginScreenName} component={LoginScreen} />
        <Stack.Screen name={MyIssuesScreenName} component={MyIssuesScreen} />
        <Stack.Screen
          name={SmsVerificationScreenName}
          component={SmsVerificationScreen}
        />
        <Stack.Screen name={NewIssueScreenName} component={NewIssueScreen} />
        <Stack.Screen name={EditIssueScreenName} component={EditIssueScreen} />
        <Stack.Screen
          name={ActiveIssueScreenName}
          component={ActiveIssueScreen}
        />
        <Stack.Screen
          name={StatusInfoScreenName}
          component={StatusInformationScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message: come index.js');
//   console.log(remoteMessage.data);
// });

// PushNotification.configure({
//   // (required) Called when a remote or local notification is opened or received
//   onNotification: notification => {
//     if (notification) {
//       console.log('LOCAL NOTIFICATION index.js ==>', notification);
//       try {
//         AsyncStorage.setItem(
//           key_bg_notification,
//           JSON.stringify(JSON.stringify(notification)),
//         );
//         console.log('set PN success');
//       } catch (e) {
//         // saving error
//         console.log(e);
//       }
//     } else {
//       AsyncStorage.setItem(key_bg_notification, '');
//     }
//   },
//   popInitialNotification: true,
//   requestPermissions: true,
// });
