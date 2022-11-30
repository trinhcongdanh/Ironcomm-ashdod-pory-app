/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
  View,
  FlatList,
  ScrollView,
  Text,
  Image,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  I18nManager,
} from 'react-native';
import {
  c_bg_issue_description,
  c_bg_filter_selected,
  c_blue_light_filter,
  c_grey_filter,
  key_user_info,
  MyIssuesScreenName,
  LoginScreenName,
  key_app_config,
  greyHasOpacity,
  c_loading_icon,
  rq_login_with_phone,
  api_url,
  rc_success,
  rq_get_device_types,
  c_background_issue_item,
  c_bg_line,
  c_grey_text,
  rq_get_devices_for_type,
  rq_get_issue_types_for_device,
  rq_add_issue,
  rq_update_issue,
  c_main_blue,
} from '../resource/BaseValue';
import {
  typeOfDevice,
  newIssueScreenTitle,
  unit,
  location,
  nameOfIssue,
  nameOfDevice,
  deviceSerialName,
  typeOfIssue,
  attachFileOrImage,
  descriptionOfIssue,
  addIssue,
  attachFileSuccess,
  inClose,
  inCoordinated,
  inPriority,
  inCertification,
  inNew,
  deviceType,
  updated,
  deviceName,
  issueType,
  save,
  isDeviceOperational,
  text_yes,
  text_no,
  isDeviceDisable,
  ok_text,
} from '../resource/StringContentDefault';
// import RNFileSelector from 'react-native-file-selector';
import RNFloatingInput from '../comp/FloatingInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNFetchBlob from 'react-native-fetch-blob';

export default class EditIssueScreen extends React.Component {
  constructor(props) {
    super(props);
    this.deviceTypeSelect = React.createRef();
    this.deviceNameSelect = React.createRef();
    this.issueTypeSelect = React.createRef();
    this.deviceSerialInput = React.createRef();
    this.state = {
      deviceTypes: [],
      deviceNames: [],
      issueTypes: [],
      selectingList: [],
      typeSelectingList: '',
      issueId: '',
      issueName: '',
      deviceType: '',
      deviceTypeId: '',
      deviceName: '',
      deviceNameId: '',
      deviceSerialNumber: '',
      issueType: '',
      issueTypeId: '',
      descriptionOfIssue: '',
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
      userInfo: {},
      isSelectListShown: false,
      filePath: '',
      isTwoQuestionDialogShow: false,
      questionFirstSelected: text_no,
      questionSecondSelected: text_no,
    };
  }

  componentDidMount() {
    const {navigation} = this.props;
    var allState = this.state;
    allState.issueId = navigation.getParam('issue_id', '');
    allState.commandName = navigation.getParam('command_name', '');
    allState.unitNumber = navigation.getParam('unit_number', '');
    allState.issueName = navigation.getParam('title', '');
    allState.deviceTypeId = navigation.getParam('device_type_id', '');
    allState.deviceNameId = navigation.getParam('device_id', '');
    allState.issueTypeId = navigation.getParam('issue_type_id', '');
    allState.deviceSerialNumber = navigation.getParam('serial_number', '');
    I18nManager.forceRTL(true);
    this.setState(allState);
    this.deviceSerialInput.current.updateValue(allState.deviceSerialNumber);
    this.loadUserInfo().then(() => {
      this.loadAppConfig().then(() => {
        this.getDeviceTypes();
      });
    });
  }

  loadUserInfo = async () => {
    try {
      const value = await AsyncStorage.getItem(key_user_info);
      if (value != null) {
        // value previously stored
        const jsonValue = JSON.parse(value);
        let allState = this.state;
        allState.userInfo = jsonValue;
        this.setState(allState);
      } else {
      }
    } catch (e) {
      // error reading value
    }
  };

  loadAppConfig = async () => {
    try {
      const value = await AsyncStorage.getItem(key_app_config);
      if (value != null) {
        // value previously stored
        const jsonValue = JSON.parse(value);
        let allState = this.state;
        allState.appConfig = jsonValue;
        this.setState(allState);
      } else {
      }
    } catch (e) {
      // error reading value
    }
  };

  getDeviceTypes = async () => {
    this._closeLoadingBox();
    let allState = this.state;
    for (let i = 0; i < allState.appConfig.containers.length; i++) {
      let item = {
        id: allState.appConfig.containers[i]['id'],
        name: allState.appConfig.containers[i]['name'],
      };
      allState.deviceTypes.push(item);
    }
    this.setState(allState);
  };

  getDeviceNames = async () => {
    let allState = this.state;
    let deviceList = [];
    for (
      let i = 0;
      i < allState.appConfig.containers.length &&
      deviceList.length == 0;
      i++
    ) {
      if (
        allState.appConfig.containers[i]['id'] ==
        this.state.deviceTypeId
      ) {
        deviceList = allState.appConfig.containers[i]['devices'];
      }
    }

    if (deviceList.length > 0) {
      allState.deviceNames = [];
      allState.issueTypes = [];
      for (let i = 0; i < deviceList.length; i++) {
        let item = {
          id: deviceList[i]['id'],
          name: deviceList[i]['name'],
          issue_types: deviceList[i]['issue_types'],
        };
        allState.deviceNames.push(item);
      }
    }
    this.setState(allState);
  };

  getIssueTyped = async () => {
    let allState = this.state;
    let issueList = [];
    for (
      let i = 0;
      i < allState.deviceNames.length && issueList.length == 0;
      i++
    ) {
      if (allState.deviceNames[i]['id'] == this.state.deviceNameId) {
        issueList = allState.deviceNames[i]['issue_types'];
      }
    }
    if (issueList.length > 0) {
      allState.issueTypes = [];
      for (let i = 0; i < issueList.length; i++) {
        let item = {
          id: issueList[i]['id'],
          name: issueList[i]['name'],
        };
        allState.issueTypes.push(item);
      }
    }
    this.setState(allState);
  };

  updateIssue = async () => {
    this._showLoadingBox();
    let dataObj = {
      request: rq_update_issue,
      token: this.state.userInfo.token,
      issue_id: this.state.issueId,
      title: this.state.issueName,
      device_type_id: parseInt(this.state.deviceTypeId),
      device_id: parseInt(this.state.deviceNameId),
      issue_type_id: parseInt(this.state.issueTypeId),
      serial_num: this.state.deviceSerialNumber,
    };
    if (this.state.questionFirstSelected == text_yes) {
      dataObj.is_operational = true;
    } else {
      dataObj.is_operational = false;
    }
    if (this.state.questionSecondSelected == text_yes) {
      dataObj.is_disabled = true;
    } else {
      dataObj.is_disabled = false;
    }
    this.callAddIssueApi(dataObj);
  };

  callAddIssueApi = async dataObj => {
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
          this.props.navigation.goBack();
        } else {
          alert(responseJson.message);
        }
      })
      .catch(error => {
        this._closeLoadingBox();
        alert(error);
      });
  };
  showDeviceTypesPicker = async () => {
    let allState = this.state;
    allState.selectingList = allState.deviceTypes;
    allState.typeSelectingList = deviceType;
    allState.isSelectListShown = true;
    this.setState(allState);
  };

  showDeviceNamesPicker = async () => {
    let allState = this.state;
    allState.selectingList = allState.deviceNames;
    allState.typeSelectingList = deviceName;
    allState.isSelectListShown = true;
    this.setState(allState);
  };

  showIssueTypesPicker = async () => {
    let allState = this.state;
    allState.selectingList = allState.issueTypes;
    allState.typeSelectingList = issueType;
    allState.isSelectListShown = true;
    this.setState(allState);
  };

  onIssueNameChange = text => {
    let allState = this.state;
    allState.issueName = text;
    this.setState(allState);
  };

  onDeviceTypeChange = text => {
    let allState = this.state;
    allState.deviceType = text;
    for (let i = 0; i < allState.deviceTypes.length; i++) {
      if (allState.deviceTypes[i].name == text) {
        if (allState.deviceTypeId != allState.deviceTypes[i].id) {
          allState.deviceNameId = '';
          allState.deviceName = '';
          allState.issueType = '';
          allState.issueTypeId = '';
          this.deviceNameSelect.current.updateValue('');
          this.issueTypeSelect.current.updateValue('');
        }
        allState.deviceTypeId = allState.deviceTypes[i].id;
      }
    }
    this.setState(allState);
    this.deviceTypeSelect.current.updateValue(text);
    // call get device name
    this.getDeviceNames();
  };

  onDeviceNameChange = text => {
    let allState = this.state;
    allState.deviceName = text;
    for (let i = 0; i < allState.deviceNames.length; i++) {
      if (allState.deviceNames[i].name == text) {
        if (allState.deviceNameId != allState.deviceNames[i].id) {
          allState.issueType = '';
          allState.issueTypeId = '';
          this.issueTypeSelect.current.updateValue('');
        }
        allState.deviceNameId = allState.deviceNames[i].id;
      }
    }
    this.setState(allState);
    this.deviceNameSelect.current.updateValue(text);
    this.getIssueTyped();
  };

  onDeviceSerialNumberChange = text => {
    let allState = this.state;
    allState.deviceSerialNumber = text;
    this.setState(allState);
    this.deviceSerialInput.current.updateValue(text);
  };

  onIssueTypeChange = text => {
    let allState = this.state;
    allState.issueType = text;
    for (let i = 0; i < allState.issueTypes.length; i++) {
      if (allState.issueTypes[i].name == text) {
        allState.issueTypeId = allState.issueTypes[i].id;
      }
    }
    this.setState(allState);
    this.issueTypeSelect.current.updateValue(text);
  };

  onPickerDialogSelected = (item, type) => {
    if (type == deviceType) {
      this.onDeviceTypeChange(item.name);
    } else if (type == deviceName) {
      this.onDeviceNameChange(item.name);
    } else if (type == issueType) {
      this.onIssueTypeChange(item.name);
    }
    this.closeDialogSelected();
  };

  closeDialogSelected = () => {
    this.setState({isSelectListShown: false});
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

  render() {
    return (
      <KeyboardAvoidingView
        // behavior='position'
        style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
        <View style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
          <ImageBackground
            source={require('../image/bg_header.png')}
            resizeMode="cover"
            style={{
              width: screenWidth,
              height: screenWidth * (438 / 768),
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: screenWidth,
                padding: 10,
                marginTop: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.goBack();
                }}>
                <Image
                  source={require('../image/icon_close_white.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.07,
                    height: screenWidth * 0.07,
                  }}
                />
              </TouchableOpacity>
              <Text
                style={[
                  mStyle.textTitle,
                  {color: '#ffffff', flex: 1, textAlign: 'center'},
                ]}>
                {newIssueScreenTitle}
              </Text>
              <View style={{width: screenWidth * 0.05}}></View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: screenWidth,
                padding: 10,
                backgroundColor: c_bg_filter_selected,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={[
                    mStyle.textNormal,
                    {color: c_blue_light_filter, marginEnd: 5},
                  ]}>
                  {location}
                </Text>
                <Image
                  source={require('../image/icon_target.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.05,
                    height: screenWidth * 0.05,
                    marginEnd: 5,
                  }}
                />
                <Text style={[mStyle.textNormal, {color: 'white'}]}>
                  {this.state.commandName}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={[
                    mStyle.textNormal,
                    {color: c_blue_light_filter, marginEnd: 5},
                  ]}>
                  {unit}
                </Text>
                <Image
                  source={require('../image/icon_reload.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.05,
                    height: screenWidth * 0.05 * (33 / 27),
                    marginEnd: 5,
                  }}
                />
                <Text style={[mStyle.textNormal, {color: 'white'}]}>
                  {this.state.unitNumber}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: screenWidth * 0.8,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
                borderWidth: 1,
                borderBottomColor: '#ffffff',
                borderTopWidth: 0,
                borderLeftWidth: 0,
                borderRightWidth: 0,
              }}>
              <Image
                source={require('../image/icon_pencil.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.1,
                  height: screenWidth * 0.1,
                  marginBottom: 5,
                }}
              />
              <TextInput
                onChangeText={text => {
                  this.onIssueNameChange(text);
                }}
                placeholder={nameOfIssue}
                placeholderTextColor={'#ffffff'}
                value={this.state.issueName}
                style={[
                  mStyle.textNormal,
                  {
                    width: screenWidth * 0.7,
                    borderWidth: 0,
                    color: '#ffffff',
                    padding: 0,
                    textAlign: 'center',
                  },
                ]}
              />
            </View>
          </ImageBackground>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                width: screenWidth * 0.8,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#000',
              }}>
              <RNFloatingInput
                ref={this.deviceTypeSelect}
                onPress={() => {
                  this.showDeviceTypesPicker();
                }}
                label={typeOfDevice}
                labelSize={12}
                labelSizeLarge={14}
                labelColor={c_grey_text}
                textInputStyle={[
                  mStyle.textBold,
                  {
                    borderWidth: 0,
                    color: '#000000',
                    width: screenWidth * 0.75,
                    padding: 0,
                    margin: 0,
                    textAlign: 'right',
                  },
                ]}
                style={{flex: 1}}
                value={this.state.deviceType}
                onChangeText={text => {
                  this.onDeviceTypeChange(text);
                }}></RNFloatingInput>
            </View>

            <View
              style={{
                width: screenWidth * 0.8,
                marginTop: 25,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#000',
              }}>
              <RNFloatingInput
                ref={this.deviceNameSelect}
                onPress={() => {
                  this.showDeviceNamesPicker();
                }}
                label={nameOfDevice}
                labelSize={12}
                labelSizeLarge={14}
                labelColor={c_grey_text}
                textInputStyle={[
                  mStyle.textBold,
                  {
                    borderWidth: 0,
                    color: '#000000',
                    width: screenWidth * 0.75,
                    padding: 0,
                    margin: 0,
                    textAlign: 'right',
                  },
                ]}
                style={{flex: 1}}
                value={this.state.deviceName}
                onChangeText={text => {
                  this.onDeviceNameChange(text);
                }}></RNFloatingInput>
            </View>

            <View
              style={{
                width: screenWidth * 0.8,
                marginTop: 25,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#000',
              }}>
              <RNFloatingInput
                ref={this.deviceSerialInput}
                label={deviceSerialName}
                labelSize={12}
                labelSizeLarge={14}
                textInputStyle={[
                  mStyle.textBold,
                  {
                    borderWidth: 0,
                    color: '#000000',
                    width: screenWidth * 0.75,
                    padding: 0,
                    margin: 0,
                    textAlign: 'right',
                  },
                ]}
                style={{flex: 1}}
                showArrow={false}
                editable={true}
                value={this.state.deviceSerialNumber}
                onChangeTextInput={text => {
                  this.onDeviceSerialNumberChange(text);
                }}></RNFloatingInput>
            </View>

            <View
              style={{
                width: screenWidth * 0.8,
                marginTop: 25,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#000',
              }}>
              <RNFloatingInput
                ref={this.issueTypeSelect}
                onPress={() => {
                  this.showIssueTypesPicker();
                }}
                label={typeOfIssue}
                labelSize={12}
                labelSizeLarge={14}
                textInputStyle={[
                  mStyle.textBold,
                  {
                    borderWidth: 0,
                    color: '#000000',
                    width: screenWidth * 0.75,
                    padding: 0,
                    margin: 0,
                    textAlign: 'right',
                  },
                ]}
                style={{flex: 1}}
                value={this.state.issueType}
                onChangeText={text => {
                  this.onIssueTypeChange(text);
                }}></RNFloatingInput>
            </View>

            <TouchableOpacity
              onPress={() => {
                // this.updateIssue();
                this.setState({isTwoQuestionDialogShow: true});
              }}
              style={[
                mStyle.buttonEnable,
                {
                  width: screenWidth * 0.8,
                  marginTop: 10,
                  padding: 15,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Text
                style={[
                  mStyle.textNormal,
                  {
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 18,
                    marginStart: 10,
                  },
                ]}>
                {save}
              </Text>
              <Image
                source={require('../image/icon_arrow_left.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.05,
                  height: screenWidth * 0.05,
                  marginStart: 10,
                }}
              />
            </TouchableOpacity>
            <View style={{height: screenHeight * 0.05}}></View>
          </ScrollView>
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
          <Modal
            animationType="fade"
            presentationStyle="fullScreen"
            visible={this.state.isTwoQuestionDialogShow}
            onRequestClose={() => {
              this.setState({isTwoQuestionDialogShow: false});
            }}
            transparent={false}>
            <View
              activeOpacity={1}
              style={{
                flexDirection: 'column',
                flex: 1,
                padding: 10,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                backgroundColor: '#ffffff',
                borderRadius: 10,
                marginTop: 30,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({isTwoQuestionDialogShow: false});
                }}
                style={{alignSelf: 'flex-end'}}>
                <Image
                  source={require('../image/icon_close_dialog.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.09,
                    height: screenWidth * 0.09,
                    alignSelf: 'flex-end',
                    margin: 10,
                  }}
                />
              </TouchableOpacity>
              <Text style={[mStyle.textTitle]}>{isDeviceOperational}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({questionFirstSelected: text_yes});
                  }}
                  style={[mStyle.radioAnswerContainer]}>
                  <View
                    style={[
                      this.state.questionFirstSelected == text_yes
                        ? mStyle.selectedItem
                        : mStyle.unselectedItem,
                    ]}
                  />
                  <Text>{text_yes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({questionFirstSelected: text_no});
                  }}
                  style={[mStyle.radioAnswerContainer]}>
                  <View
                    style={[
                      this.state.questionFirstSelected == text_no
                        ? mStyle.selectedItem
                        : mStyle.unselectedItem,
                    ]}
                  />
                  <Text>{text_no}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[mStyle.textTitle]}>{isDeviceDisable}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({questionSecondSelected: text_yes});
                  }}
                  style={[mStyle.radioAnswerContainer]}>
                  <View
                    style={[
                      this.state.questionSecondSelected == text_yes
                        ? mStyle.selectedItem
                        : mStyle.unselectedItem,
                    ]}
                  />
                  <Text>{text_yes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({questionSecondSelected: text_no});
                  }}
                  style={[mStyle.radioAnswerContainer]}>
                  <View
                    style={[
                      this.state.questionSecondSelected == text_no
                        ? mStyle.selectedItem
                        : mStyle.unselectedItem,
                    ]}
                  />
                  <Text>{text_no}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.setState({isTwoQuestionDialogShow: false}, () => {
                    this.updateIssue();
                  });
                }}
                style={[mStyle.buttonConfirmQuestion]}>
                <Text style={[mStyle.textTitle, {color: '#ffffff'}]}>
                  {ok_text}
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal
            animationType="fade"
            presentationStyle="fullScreen"
            visible={this.state.isSelectListShown}
            onRequestClose={() => {
              this.closeDialogSelected();
            }}
            transparent={false}>
            <View
              activeOpacity={1}
              style={{
                flexDirection: 'column',
                flex: 1,
                padding: 10,
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                backgroundColor: '#ffffff',
                borderRadius: 10,
                marginTop: 30,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.closeDialogSelected();
                }}>
                <Image
                  source={require('../image/icon_close_dialog.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.1,
                    height: screenWidth * 0.1,
                    alignSelf: 'flex-end',
                    margin: 10,
                  }}
                />
              </TouchableOpacity>
              <FlatList
                style={{
                  marginTop: 10,
                  width: screenWidth,
                  backgroundColor: '#ffffff',
                }}
                data={this.state.selectingList}
                showsVerticalScrollIndicator={false}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    onPress={() => {
                      this.onPickerDialogSelected(
                        item,
                        this.state.typeSelectingList,
                      );
                    }}
                    style={{
                      flexDirection: 'row',
                      marginBottom: 20,
                      marginStart: 15,
                      padding: 10,
                      alignItems: 'flex-start',
                      alignSelf: 'flex-start',
                    }}>
                    <Text style={[mStyle.textBold]}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
              />
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

let itemList = [
  {id: 1, name: 'Ship'},
  {id: 2, name: 'Boat'},
  {id: 3, name: 'Tank'},
  {id: 4, name: 'Truck'},
  {id: 5, name: 'Plane'},
  {id: 6, name: 'Helicopter'},
];

const mStyle = StyleSheet.create({
  textNormal: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 13,
  },
  textBold: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 15,
    fontWeight: 'bold',
  },
  textTitle: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 18,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  itemText: {
    fontSize: 15,
    margin: 2,
  },
  buttonDisable: {
    backgroundColor: c_grey_filter,
  },
  buttonEnable: {
    backgroundColor: c_bg_filter_selected,
  },
  selectedItem: {
    width: 20,
    height: 20,
    backgroundColor: c_main_blue,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: c_main_blue,
    marginEnd: 5,
  },
  unselectedItem: {
    width: 20,
    height: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: c_main_blue,
    marginEnd: 5,
  },
  radioAnswerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginEnd: 40,
    marginBottom: 20,
  },
  buttonConfirmQuestion: {
    backgroundColor: c_bg_filter_selected,
    width: screenWidth * 0.3,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
