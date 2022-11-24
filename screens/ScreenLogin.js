/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  BackHandler,
  I18nManager,
} from 'react-native';
import {
  login,
  LoginScreenNotice,
  LoginScreenTitle,
  nameOfDevice,
  holderPhoneNumber,
} from '../resource/StringContentDefault';
import {
  api_url,
  c_bg_disable_button,
  c_bg_error_message,
  c_bg_filter_selected,
  c_bg_section_line,
  c_boarding_text_notice,
  greyHasOpacity,
  c_main_blue,
  rc_success,
  rq_send_sms_code,
  SmsVerificationScreenName,
  c_loading_icon,
} from '../resource/BaseValue';
import {StackActions, useNavigation} from '@react-navigation/native';

// import messaging from '@react-native-firebase/messaging';

export const LoginScreen = () => {
  // const [phoneNumber, setPhoneNumber] = useState('');
  // const phoneNumber = useRef('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShownErrorMessage, setIsShownErrorMessage] = useState(false);
  const [indicatorSizeW, setIndicatorSizeW] = useState(0);
  const [indicatorSizeH, setIndicatorSizeH] = useState(0);
  const [indicatorDisplay, setIndicatorDisplay] = useState(false);

  _showLoadingBox = () => {
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
    BackHandler.addEventListener('hardwareBackPress', backAction);
    I18nManager.forceRTL(true);
  }, []);

  useEffect(() => {
    BackHandler.removeEventListener('hardwareBackPress', backAction);
    I18nManager.forceRTL(true);
  }, []);

  const backAction = () => {
    BackHandler.exitApp();
  };
  let phoneNumber = '';
  const onPhoneNumberChange = text => {
    // setPhoneNumber(text);
    phoneNumber = text;
  };

  const navigation = useNavigation();

  const sendSmsCode = () => {
    // let phoneNumber = phoneNumber;
    if (phoneNumber == '') {
      showNoticeMessage('Please input your phone number');
    } else {
      _showLoadingBox();
      var dataObj = {
        request: rq_send_sms_code,
        phone_num: phoneNumber,
      };
      // console.log(dataObj);
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
            navigation.dispatch(
              StackActions.push(SmsVerificationScreenName, {
                phone_num: phoneNumber,
              }),
            );
          } else {
            Alert.alert(responseJson.message);
          }
        })
        .catch(error => {
          _closeLoadingBox();
          Alert.alert(error.toString());
        });
    }
  };

  const showNoticeMessage = message => {
    setIsShownErrorMessage(true);
    setErrorMessage(message);
    setTimeout(() => {
      setIsShownErrorMessage(false);
    }, 2000);
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1,
      }}>
      <ImageBackground
        style={{
          width: screenWidth,
          height: screenHeight,
          flexDirection: 'column',
          paddingBottom: 20,
        }}
        resizeMode="cover"
        source={require('../image/bg_splash.jpg')}>
        <Text
          style={[
            mStyle.textTitle,
            {color: '#ffffff', textAlign: 'center', margin: 10},
          ]}>
          {LoginScreenTitle}
        </Text>
        <Text
          style={[
            mStyle.textTitle,
            {color: c_boarding_text_notice, textAlign: 'center', margin: 10},
          ]}>
          {LoginScreenNotice}
        </Text>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <TextInput
            onChangeText={text => {
              onPhoneNumberChange(text);
            }}
            style={[
              mStyle.textNormal,
              {
                width: screenWidth * 0.8,
                paddingStart: 0,
                paddingEnd: 0,
                margin: 0,
                color: '#ffffff',
                borderBottomWidth: 1,
                borderBottomColor: c_boarding_text_notice,
                textAlign: 'right',
              },
            ]}
            placeholder={holderPhoneNumber}
            placeholderTextColor={'#ffffff'}
            keyboardType={'phone-pad'}
          />
          <TouchableOpacity
            onPress={() => {
              sendSmsCode();
            }}
            style={{
              width: screenWidth * 0.8,
              paddingTop: 20,
              paddingBottom: 20,
              marginTop: 20,
              backgroundColor:
                phoneNumber == '' ? c_bg_disable_button : c_bg_filter_selected,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
            }}>
            <Text style={[mStyle.textConfirmButton, {color: '#ffffff'}]}>
              {login}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <Text
        style={[
          mStyle.textTitle,
          {
            color: '#ffffff',
            backgroundColor: c_bg_error_message,
            textAlign: 'center',
            lineHeight: screenWidth * 0.1,
            position: 'absolute',
            top: screenHeight * 0.2,
            width: isShownErrorMessage ? screenWidth : 0,
            height: isShownErrorMessage ? screenWidth * 0.1 : 0,
          },
        ]}>
        {errorMessage}
      </Text>
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

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
  textNormal: {
    fontFamily: 'Heebo',
    fontSize: 15,
  },
  textBold: {
    fontFamily: 'Heebo',
    fontSize: 15,
    fontWeight: 'bold',
  },
  textTitle: {
    fontFamily: 'Heebo',
    fontSize: 15,
  },
  textConfirmButton: {
    fontFamily: 'Heebo',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
