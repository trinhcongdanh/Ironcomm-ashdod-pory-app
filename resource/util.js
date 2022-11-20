import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

export function getOSTypeForApi() {
  if (Platform.OS === 'ios') {
    return 2;
  } else if (Platform.OS === 'android') {
    return 1;
  } else {
    return '';
  }
}

export function getInfoForApi(callback) {
  let osTypeValue = 0;
  let osVersion = Platform.OS + ' ' + DeviceInfo.getSystemVersion();
  let deviceInfo = DeviceInfo.getDeviceId();
  let appVersion = DeviceInfo.getVersion() + '.' + DeviceInfo.getBuildNumber();
  if (Platform.OS === 'ios') {
    osTypeValue = 2;
  } else if (Platform.OS === 'android') {
    osTypeValue = 1;
  }
  DeviceInfo.getDeviceName().then((device) => {
    callback(osTypeValue, osVersion, device, appVersion);
  });
}
