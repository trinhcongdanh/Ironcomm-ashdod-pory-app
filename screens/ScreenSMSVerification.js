/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
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
import {StackActions, NavigationActions} from '@react-navigation/native';
import {getInfoForApi} from '../resource/util';
export default class SmsVerificationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.code1 = React.createRef();
    this.code2 = React.createRef();
    this.code3 = React.createRef();
    this.code4 = React.createRef();
    this.code5 = React.createRef();
    this.state = {
      phoneNumber: '',
      errorMessage: '',
      isShownErrorMessage: false,
      code1: '',
      code2: '',
      code3: '',
      code4: '',
      code5: '',
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
      auth_key: '',
    };
  }

  componentDidMount() {
    const {navigation} = this.props;
    var allState = this.state;
    allState.phoneNumber = navigation.getParam('phone_num', '');
    this.setState(allState);
    I18nManager.forceRTL(true);
  }

  callVerify = () => {
    if (
      this.state.code1 != '' &&
      this.state.code2 != '' &&
      this.state.code3 != '' &&
      this.state.code4 != '' &&
      this.state.code5 != ''
    ) {
      this._showLoadingBox();
      let phoneNumber = this.state.phoneNumber;
      let verifyCode =
        this.state.code1 +
        this.state.code2 +
        this.state.code3 +
        this.state.code4 +
        this.state.code5;
      let dataObj = {
        request: rq_verify_sms_code,
        phone_num: phoneNumber,
        verification_code: verifyCode,
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
          // {
          //     "auth_key": "",
          //     "is_registered": true or false
          // }
          if (responseJson.rc == rc_success) {
            console.log(responseJson);
            if (responseJson.is_registered) {
              // login_with_phone
              this.login_with_phone(responseJson.auth_key);
            } else {
              this._closeLoadingBox();
              // register_with_phone
              this.showNoticeMessage(errorPhoneNumberNotRegister);
              // this.login_with_phone(responseJson.auth_key);
            }
          } else {
            this._closeLoadingBox();
            // Alert.alert(responseJson.message);
            if (responseJson.rc == '233') {
              this.showNoticeMessage(errorWrongVerificationCode);
            } else {
              this.showNoticeMessage(responseJson.message);
            }
          }
        })
        .catch(error => {
          this._closeLoadingBox();
          Alert.alert(error.toString());
        });

      // this.props.navigation.pop(2);
      // this.props.navigation.navigate(MyIssuesScreenName);
    } else {
      this.showNoticeMessage('Please input verification code');
    }
  };

  login_with_phone = authKey => {
    this._showLoadingBox();
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
          this._closeLoadingBox();
          // {
          //      "token": "",
          //      "type": 2,
          //      "first_name": "",
          //      "last_name": ""
          // }
          if (responseJson.rc == rc_success) {
            console.log(responseJson);
            this._saveUserInfo(responseJson);
          } else {
          }
        })
        .catch(error => {
          this._closeLoadingBox();
          this.showNoticeMessage(error.toString());
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
        this._closeLoadingBox();
        const resetAction = StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({routeName: MyIssuesScreenName}),
          ],
        });
        this.props.navigation.dispatch(resetAction);
        // this.props.navigation.pop(2);
        // this.props.navigation.navigate(MyIssuesScreenName);
      });
    } catch (e) {
      // saving error
      this._closeLoadingBox();
      Alert.alert(e.toString());
    }
  };

  showNoticeMessage = message => {
    let allState = this.state;
    allState.isShownErrorMessage = true;
    allState.errorMessage = message;
    this.setState(allState);
    setTimeout(() => {
      this.setState({isShownErrorMessage: false});
    }, 2000);
  };

  _showLoadingBox() {
    var allState = this.state;
    allState.indicatorSizeW = screenWidth;
    allState.indicatorSizeH = screenHeight;
    allState.indicatorDisplay = true;
    this.setState(allState);
  }

  _closeLoadingBox() {
    var allState = this.state;
    allState.indicatorSizeW = 0;
    allState.indicatorSizeH = 0;
    allState.indicatorDisplay = false;
    this.setState(allState);
  }

  sendSmsCode = () => {
    let phoneNumber = this.state.phoneNumber;
    if (phoneNumber == '') {
      this.showNoticeMessage('Please input your phone number');
    } else {
      this._showLoadingBox();
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
          this._closeLoadingBox();
          if (responseJson.rc == rc_success) {
            let allState = this.state;
            allState.code1 = '';
            allState.code2 = '';
            allState.code3 = '';
            allState.code4 = '';
            allState.code5 = '';
            this.setState(allState, () => {
              this.code1.current.focus();
            });
          } else {
            Alert.alert(responseJson.message);
          }
        })
        .catch(error => {
          this._closeLoadingBox();
          Alert.alert(error.toString());
        });
    }
  };

  render() {
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
              flexDirection: 'row-reverse',
              justifyContent: 'space-around',
            }}>
            <TextInput
              ref={this.code1}
              onChangeText={text => {
                this.setState({code1: text});
                this.code2.current.focus();
              }}
              style={[mStyle.textVerificationCode]}
              keyboardType={'numeric'}
              maxLength={1}
              autoFocus={true}
              value={this.state.code1}
            />
            <TextInput
              ref={this.code2}
              onChangeText={text => {
                this.setState({code2: text});
                this.code3.current.focus();
              }}
              style={[mStyle.textVerificationCode]}
              keyboardType={'numeric'}
              maxLength={1}
              value={this.state.code2}
            />
            <TextInput
              ref={this.code3}
              onChangeText={text => {
                this.setState({code3: text});
                this.code4.current.focus();
              }}
              style={[mStyle.textVerificationCode]}
              keyboardType={'numeric'}
              maxLength={1}
              value={this.state.code3}
            />
            <TextInput
              ref={this.code4}
              onChangeText={text => {
                this.setState({code4: text});
                this.code5.current.focus();
              }}
              style={[mStyle.textVerificationCode]}
              keyboardType={'numeric'}
              maxLength={1}
              value={this.state.code4}
            />
            <TextInput
              ref={this.code5}
              onChangeText={text => {
                this.setState({code5: text}, () => {
                  this.callVerify();
                });
              }}
              style={[mStyle.textVerificationCode]}
              keyboardType={'numeric'}
              maxLength={1}
              value={this.state.code5}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              this.sendSmsCode();
            }}
            style={{
              marginTop: 40,
              borderBottomColor: c_boarding_text_notice,
              borderBottomWidth: 1,
            }}>
            <Text
              style={[
                mStyle.textTitle,
                {color: '#ffffff', textAlign: 'center'},
              ]}>
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
              this.callVerify();
            }}
            style={{
              width: screenWidth * 0.8,
              paddingTop: 20,
              paddingBottom: 20,
              marginTop: 40,
              backgroundColor:
                this.state.phoneNumber == ''
                  ? c_bg_disable_button
                  : c_bg_filter_selected,
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
              width: this.state.isShownErrorMessage ? screenWidth : 0,
              height: this.state.isShownErrorMessage ? screenWidth * 0.1 : 0,
            },
          ]}>
          {this.state.errorMessage}
        </Text>
        <View
          style={{
            width: this.state.indicatorSizeW,
            height: this.state.indicatorSizeH,
            backgroundColor: greyHasOpacity,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
          }}>
          <ActivityIndicator
            animating={this.state.indicatorDisplay}
            size="large"
            color={c_loading_icon}
          />
        </View>
      </View>
    );
  }
}

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
