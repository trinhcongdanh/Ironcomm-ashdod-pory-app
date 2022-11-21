/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import React, {useEffect} from 'react';
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
  phoneNumer,
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

// import messaging from '@react-native-firebase/messaging';

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      errorMessage: '',
      isShownErrorMessage: false,
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
    };
  }

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

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
    I18nManager.forceRTL(true);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    I18nManager.forceRTL(true);
  }

  backAction = () => {
    BackHandler.exitApp();
  };

  onPhoneNumberChange = text => {
    let allState = this.state;
    allState.phoneNumber = text;
    this.setState(allState);
  };

  sendSmsCode = () => {
    let phoneNumber = this.state.phoneNumber;
    if (phoneNumber == '') {
      this.showNoticeMessage('Please input your phone number');
    } else {
      this._showLoadingBox();
      var dataObj = {
        request: rq_send_sms_code,
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
            this.props.navigation.navigate(SmsVerificationScreenName, {
              phone_num: phoneNumber,
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

  showNoticeMessage = message => {
    let allState = this.state;
    allState.isShownErrorMessage = true;
    allState.errorMessage = message;
    this.setState(allState);
    setTimeout(() => {
      this.setState({isShownErrorMessage: false});
    }, 2000);
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
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <TextInput
              onChangeText={text => {
                this.onPhoneNumberChange(text);
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
              placeholder={phoneNumer}
              placeholderTextColor={'#ffffff'}
              keyboardType={'phone-pad'}
            />
            <TouchableOpacity
              onPress={() => {
                this.sendSmsCode();
              }}
              style={{
                width: screenWidth * 0.8,
                paddingTop: 20,
                paddingBottom: 20,
                marginTop: 20,
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
});
