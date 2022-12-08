/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  I18nManager,
} from 'react-native';
import {
  api_url,
  c_loading_icon,
  c_text_white,
  greyHasOpacity,
  key_app_config,
  key_user_info,
  LoginScreenName,
  MyIssuesScreenName,
  rc_success,
  rq_get_app_config,
  rq_login_with_phone,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {splashScreenContent} from '../resource/StringContentDefault';
import {StackActions, useNavigation} from '@react-navigation/native';
// I18nManager.forceRTL(true);
export const SplashScreen = () => {
  const [indicatorSizeW, setIndicatorSizeW] = useState(0);
  const [indicatorSizeH, setIndicatorSizeH] = useState(0);
  const [indicatorDisplay, setIndicatorDisplay] = useState(false);

  const _showLoadingBox = () => {
    setIndicatorSizeW(screenWidth);
    setIndicatorSizeH(screenHeight);
    setIndicatorDisplay(true);
  };

  _closeLoadingBox = () => {
    setIndicatorSizeW(0);
    setIndicatorSizeH(0);
    setIndicatorDisplay(false);
  };

  useEffect(() => {
    getAppConfig();
  }, []);

  const getAppConfig = async () => {
    _showLoadingBox();
    let dataObj = {
      request: rq_get_app_config,
    };
    fetch(api_url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataObj),
    })
      .then(response => response.json())
      .then(responseJson => {
        _closeLoadingBox();
        if (responseJson.rc == rc_success) {
          saveAppConfig(responseJson).then(() => {
            checkToken();
          });
        } else {
          checkToken();
        }
      })
      .catch(error => {
        _closeLoadingBox();
        checkToken();
      });
  };

  const saveAppConfig = async jsonObj => {
    try {
      let appConfig = {
        issue_statuses: jsonObj.issue_statuses,
        commands: jsonObj.commands,
        containers: jsonObj.containers,
        place_description: jsonObj.locations,
        issue_conditions: jsonObj.issue_conditions,
        issue_wornings: jsonObj.issue_wornings,
      };
      console.log(appConfig);
      AsyncStorage.setItem(key_app_config, JSON.stringify(appConfig));
    } catch (e) {
      // saving error
      _closeLoadingBox();
      Alert.alert(e.toString());
    }
  };

  const checkToken = async () => {
    try {
      const value = await AsyncStorage.getItem(key_user_info);
      if (value != null) {
        // value previously stored
        const jsonValue = JSON.parse(value);
        if (jsonValue.token != '') {
          comeToScreen(MyIssuesScreenName);
        } else {
          comeToScreen(LoginScreenName);
        }
      } else {
        comeToScreen(LoginScreenName);
      }
    } catch (e) {
      // error reading value
      comeToScreen(LoginScreenName);
    }
  };

  const navigation = useNavigation();

  const comeToScreen = screenName => {
    setTimeout(() => {
      // this time check login. if logged in, come to My Issues, if not come to login screen.
      navigation.dispatch(StackActions.replace(screenName));
    }, 2000);
  };

  const screenWidth = Math.round(Dimensions.get('window').width);
  const screenHeight = Math.round(Dimensions.get('window').height);
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <Image
        style={{width: screenWidth, height: screenHeight}}
        resizeMode="stretch"
        source={require('../image/bg_splash.jpg')}
      />
      <Image
        style={{
          width: screenWidth,
          height: screenWidth * (246 / 1530),
          position: 'absolute',
          top: screenHeight * 0.5,
        }}
        resizeMode="stretch"
        source={require('../image/splash_middle.png')}
      />
      <View
        style={{
          width: screenWidth,
          height: screenHeight,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
        }}>
        <Image
          style={{
            width: screenWidth * 0.8,
            height: screenWidth * 0.8 * (339 / 250),
          }}
          resizeMode="contain"
          source={require('../image/splash_icon.png')}
        />

        <Image
          style={{
            width: screenWidth * 0.5,
            height: screenWidth * 0.5 * (480 / 750),
          }}
          resizeMode="contain"
          source={require('../image/logo_without_text.png')}
        />

        <Text
          style={{
            color: 'white',
            fontStyle: 'italic',
            fontWeight: '700',
            fontFamily: 'Calibri',
          }}>
          Accelerating Collaborative Operation
        </Text>
      </View>

      <View
        style={{
          width: indicatorSizeW,
          height: indicatorSizeH,
          backgroundColor: greyHasOpacity,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
        }}>
        <ActivityIndicator
          animating={indicatorDisplay}
          size="large"
          color={c_loading_icon}
        />
      </View>
    </View>
  );
};
