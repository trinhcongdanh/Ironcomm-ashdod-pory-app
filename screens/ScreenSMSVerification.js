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
  I18nManager,
  Keyboard,
} from 'react-native';
import {
  errorPhoneNumberNotRegister,
  errorWrongVerificationCode,
  login,
  LoginScreenNotice,
  LoginScreenTitle,
  nameOfDevice,
  phoneNumer,
  sendSmsCodeAgain,
  sendSmsCodeAgainNotice,
  smsVerificationNotice,
  smsVerificationTitle,
  verificationCode,
} from '../resource/StringContentDefault';
import {
  api_url,
  c_bg_disable_button,
  c_bg_error_message,
  c_bg_filter_selected,
  c_bg_section_line,
  c_boarding_text_notice,
  c_loading_icon,
  c_main_blue,
  greyHasOpacity,
  key_user_info,
  MyIssuesScreenName,
  rc_success,
  rq_login_with_phone,
  rq_resend_sms_code,
  rq_send_sms_code,
  rq_verify_sms_code,
  SmsVerificationScreenName,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StackActions,
  NavigationActions,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import {getInfoForApi} from '../resource/util';

export const SmsVerificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShownErrorMessage, setIsShownErrorMessage] = useState(false);
  const [indicatorSizeW, setIndicatorSizeW] = useState(0);
  const [indicatorSizeH, setIndicatorSizeH] = useState(0);
  const [indicatorDisplay, setIndicatorDisplay] = useState(false);
  const [auth_key, setAuth_Key] = useState('');

  useEffect(() => {
    setPhoneNumber(route.params.phone_num);
    I18nManager.forceRTL(true);
  });

  const inputs = Array(5).fill('');

  const [OTP, setOTP] = useState({0: '', 1: '', 2: '', 3: '', 4: ''});

  const input = useRef();

  let newInputIndex = 0;

  const [nextInputIndex, setNextInputIndex] = useState(0);

  const handleChangeText = (text, index) => {
    const newOTP = {...OTP};
    newOTP[index] = text;
    setOTP(newOTP);

    const lastInputIndex = inputs.length - 1;

    if (!text) {
      newInputIndex = index === 0 ? 0 : index - 1;
    } else {
      newInputIndex = index === lastInputIndex ? lastInputIndex : index + 1;
      if (index === lastInputIndex) {
        Keyboard.dismiss();
      }
    }

    setNextInputIndex(newInputIndex);
  };

  useEffect(() => {
    input.current?.focus();
  }, [nextInputIndex]);

  callVerify = () => {
    let codeOtp = '';
    Object.values(OTP).forEach(code => {
      codeOtp += code;
    });
    if (codeOtp.length === 5) {
      _showLoadingBox();

      let dataObj = {
        request: rq_verify_sms_code,
        phone_num: phoneNumber,
        verification_code: codeOtp,
      };
      console.log(dataObj);
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
          // {
          //     "auth_key": "",
          //     "is_registered": true or false
          // }
          if (responseJson.rc == rc_success) {
            console.log(responseJson);
            if (responseJson.is_registered) {
              // login_with_phone
              login_with_phone(responseJson.auth_key);
            } else {
              _closeLoadingBox();
              // register_with_phone
              showNoticeMessage(errorPhoneNumberNotRegister);
              // login_with_phone(responseJson.auth_key);
            }
          } else {
            _closeLoadingBox();
            // Alert.alert(responseJson.message);
            if (responseJson.rc == '233') {
              showNoticeMessage(errorWrongVerificationCode);
            } else {
              showNoticeMessage(responseJson.message);
            }
          }
        })
        .catch(error => {
          _closeLoadingBox();
          Alert.alert(error.toString());
        });

      // props.navigation.pop(2);
      // props.navigation.navigate(MyIssuesScreenName);
    } else {
      showNoticeMessage('Please input verification code');
    }
  };

  const login_with_phone = authKey => {
    _showLoadingBox();
    getInfoForApi((osTypeValue, osVersion, deviceInfo, appVersion) => {
      let dataObj = {
        request: rq_login_with_phone,
        auth_key: authKey,
        os_type: osTypeValue,
        os_version: osVersion,
        device_model: deviceInfo,
        app_version: appVersion,
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
          // {
          //      "token": "",
          //      "type": 2,
          //      "first_name": "",
          //      "last_name": ""
          // }
          if (responseJson.rc == rc_success) {
            console.log(responseJson);
            _saveUserInfo(responseJson);
          } else {
          }
        })
        .catch(error => {
          _closeLoadingBox();
          showNoticeMessage(error.toString());
        });
    });
  };

  _saveUserInfo = async dataJson => {
    try {
      // let userInfo = {
      //     first_name: firstName,
      //     last_name: lastName,
      //     type: type,
      //     token: mToken,
      //      command_name:"",
      // };
      AsyncStorage.setItem(key_user_info, JSON.stringify(dataJson)).then(() => {
        _closeLoadingBox();
        // const resetAction = StackActions.reset({
        //   index: 0,
        //   actions: [NavigationActions.push({routeName: MyIssuesScreenName})],
        // });
        // navigation.dispatch(Stack);
        const pushAction = StackActions.push(MyIssuesScreenName);
        navigation.dispatch(pushAction);
        // props.navigation.pop(2);
        // props.navigation.navigate(MyIssuesScreenName);
      });
    } catch (e) {
      // saving error
      _closeLoadingBox();
      Alert.alert(e.toString());
    }
  };

  showNoticeMessage = message => {
    setIsShownErrorMessage(true);
    setErrorMessage(message);
    setTimeout(() => {
      setIsShownErrorMessage(false);
    }, 2000);
  };

  const _showLoadingBox = () => {
    setIndicatorSizeW(screenWidth);
    setIndicatorSizeH(screenHeight);
    setIndicatorDisplay(true);
  };

  const _closeLoadingBox = () => {
    setIndicatorSizeW(0);
    setIndicatorSizeH(0);
    setIndicatorDisplay(false);
  };

  sendSmsCode = () => {
    let phoneNumber = phoneNumber;
    if (phoneNumber == '') {
      showNoticeMessage('Please input your phone number');
    } else {
      _showLoadingBox();
      var dataObj = {
        request: rq_resend_sms_code,
        phone_num: phoneNumber,
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
            console.log('Success');
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
          paddingStart: 20,
          paddingEnd: 20,
          paddingBottom: 20,
          alignItems: 'center',
        }}
        resizeMode="cover"
        source={require('../image/bg_splash.jpg')}>
        <Text
          style={[
            mStyle.textTitle,
            {color: '#ffffff', textAlign: 'center', margin: 10},
          ]}>
          {smsVerificationTitle}
        </Text>
        <Text
          style={[
            mStyle.textTitle,
            {color: c_boarding_text_notice, textAlign: 'center', margin: 10},
          ]}>
          {smsVerificationNotice}
        </Text>
        <Text
          style={[
            mStyle.textTitle,
            {color: '#ffffff', textAlign: 'center', margin: 30},
          ]}>
          {verificationCode}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row-reverse',

              marginTop: 36,
            }}>
            {inputs.map((inp, index) => {
              return (
                <View
                  style={{
                    borderRadius: 15,
                    borderColor: '#ffffff',
                    borderBottomWidth: 1,
                    justifyContent: 'center',
                    width: 63,
                    height: 63,
                  }}
                  key={index.toString()}>
                  <TextInput
                    value={OTP[index]}
                    style={{
                      fontSize: 36,
                      fontWeight: '700',
                      color: '#ffffff',
                      textAlign: 'center',
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    onEndEditing={callVerify}
                    ref={nextInputIndex === index ? input : null}
                    onChangeText={text => handleChangeText(text, index)}
                  />
                </View>
              );
            })}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            sendSmsCode();
          }}
          style={{
            marginTop: 40,
            borderBottomColor: c_boarding_text_notice,
            borderBottomWidth: 1,
          }}>
          <Text
            style={[mStyle.textTitle, {color: '#ffffff', textAlign: 'center'}]}>
            {sendSmsCodeAgain}
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            mStyle.textTitle,
            {color: '#ffffff', textAlign: 'center', margin: 5},
          ]}>
          {sendSmsCodeAgainNotice}
        </Text>
        <TouchableOpacity
          onPress={() => {
            callVerify();
          }}
          style={{
            width: screenWidth * 0.8,
            paddingTop: 20,
            paddingBottom: 20,
            marginTop: 40,
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
  textVerificationCode: {
    fontFamily: 'Heebo',
    fontSize: 30,
    textAlign: 'center',
    color: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: c_boarding_text_notice,
    width: screenWidth * (1 / 6),
    marginStart: 10,
    marginEnd: 10,
  },
});
