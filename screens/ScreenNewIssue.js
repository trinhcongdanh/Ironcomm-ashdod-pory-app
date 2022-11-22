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
  BackHandler,
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
  key_app_config,
  greyHasOpacity,
  c_loading_icon,
  api_url,
  rc_success,
  c_grey_text,
  rq_add_issue,
  c_grey,
  c_bg_error_message,
  c_main_blue,
  c_text_white,
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
  issueName,
  deviceType,
  deviceName,
  issueType,
  takePicture,
  selectFromGallery,
  selectOtherFile,
  cancel,
  send,
  isDeviceOperational,
  isDeviceDisable,
  text_yes,
  text_no,
  ok_text,
} from '../resource/StringContentDefault';
// import RNFileSelector from 'react-native-file-selector';
import RNFloatingInput from '../comp/FloatingInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNFetchBlob from 'react-native-fetch-blob';
import ImagePicker from 'react-native-image-picker';

export default class NewIssueScreen extends React.Component {
  constructor(props) {
    super(props);
    this.issueNameSelect = React.createRef();
    this.deviceTypeSelect = React.createRef();
    this.deviceNameSelect = React.createRef();
    this.issueTypeSelect = React.createRef();
    this.deviceSerialInput = React.createRef();
    this.editText = React.createRef();
    this.state = {
      issueNames: [],
      deviceTypes: [],
      deviceNames: [],
      issueTypes: [],
      selectingList: [],
      showEmptyNotice: [false, false, false, false, false, false],
      typeSelectingList: '',
      issueName: '',
      issueNameId: '',
      deviceType: '',
      deviceTypeId: '',
      deviceName: '',
      deviceNameId: '',
      deviceSerialNumber: '',
      issueType: '',
      issueTypeId: '',
      isHaveImageUpload: false,
      descriptionOfIssue: '',
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
      userInfo: {},
      isSelectListShown: false,
      isAttachDialogShown: false,
      isShowInput: false,
      fileAttach: [],
      isTwoQuestionDialogShow: false,
      questionFirstSelected: text_no,
      questionSecondSelected: text_no,
    };
  }

  componentDidMount() {
    this.loadUserInfo().then(() => {
      this.loadAppConfig().then(() => {
        this.getDeviceTypes().then(() => {
          this.getDeviceNames();
        });
      });
    });
    I18nManager.forceRTL(true);
  }

  componentWillUnmount() {
    I18nManager.forceRTL(true);
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
      console.log('Error');
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
        // console.log(allState.appConfig.devices_and_issues);
      } else {
      }
    } catch (e) {
      // error reading value
    }
  };

  getDeviceTypes = async () => {
    this._closeLoadingBox();
    let allState = this.state;
    for (let i = 0; i < allState.appConfig.devices_and_issues.length; i++) {
      let item = {
        id: allState.appConfig.devices_and_issues[i]['id'],
        name: allState.appConfig.devices_and_issues[i]['name'],
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
      i < allState.appConfig.devices_and_issues.length &&
      deviceList.length == 0;
      i++
    ) {
      if (
        allState.appConfig.devices_and_issues[i]['id'] ==
        this.state.deviceTypeId
      ) {
        deviceList = allState.appConfig.devices_and_issues[i]['devices'];
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

  addIssue = async () => {
    if (
      this.state.issueName != '' &&
      this.state.deviceType != '' &&
      this.state.deviceName != '' &&
      this.state.issueType != '' &&
      this.state.deviceSerialNumber != '' &&
      this.state.descriptionOfIssue != ''
    ) {
      this._showLoadingBox();
      let dataObj = {
        request: rq_add_issue,
        token: this.state.userInfo.token,
        issue_name_id: parseInt(this.state.issueNameId),
        device_type_id: parseInt(this.state.deviceTypeId),
        device_id: parseInt(this.state.deviceNameId),
        issue_type_id: parseInt(this.state.issueTypeId),
        serial_num: this.state.deviceSerialNumber,
        description: this.state.descriptionOfIssue,
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
      let attachments = [];
      if (this.state.fileAttach.length > 0) {
        for (let i = 0; i < this.state.fileAttach.length; i++) {
          let attachItem = {
            attachment: this.state.fileAttach[i]['attachment'],
            attachment_name: this.state.fileAttach[i]['attachment_name'],
            is_attachment_image:
              this.state.fileAttach[i]['is_attachment_image'],
          };
          attachments.push(attachItem);
        }
        // let attachFileData = this.state.fileAttach[0];
        // dataObj.attachment = attachFileData.attachment;
        // dataObj.attachment_name = attachFileData.attachment_name;
        // dataObj.is_attachment_image = attachFileData.is_attachment_image;
      }
      dataObj.attachments = attachments;
      console.log(dataObj);
      this.callAddIssueApi(dataObj);
    } else {
      // show empty
      this.updateEmptyNotice();
    }
  };

  updateEmptyNotice = () => {
    let allState = this.state;
    if (this.state.issueName == '') {
      allState.showEmptyNotice[0] = true;
    }
    if (this.state.deviceType == '') {
      allState.showEmptyNotice[1] = true;
    }
    if (this.state.deviceName == '') {
      allState.showEmptyNotice[2] = true;
    }
    if (this.state.deviceSerialNumber == '') {
      allState.showEmptyNotice[3] = true;
    }
    if (this.state.issueType == '') {
      allState.showEmptyNotice[4] = true;
    }
    if (this.state.descriptionOfIssue == '') {
      allState.showEmptyNotice[5] = true;
    }
    this.setState(allState);
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

  showIssueNameChange = async () => {
    let allState = this.state;
    allState.selectingList = allState.issueNames;
    allState.typeSelectingList = issueName;
    allState.isSelectListShown = true;
    this.setState(allState);
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

  onDeviceTitleChange = text => {
    let allState = this.state;
  };

  onDeviceTypeChange = text => {
    let allState = this.state;
    allState.deviceType = text;
    if (text != '' && allState.showEmptyNotice[1]) {
      allState.showEmptyNotice[1] = false;
    }
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
    if (text != '' && allState.showEmptyNotice[2]) {
      allState.showEmptyNotice[2] = false;
    }
    this.setState(allState);
    this.deviceNameSelect.current.updateValue(text);
    this.getIssueTyped();
  };

  onDeviceSerialNumberChange = text => {
    let allState = this.state;
    allState.deviceSerialNumber = text;
    if (text != '' && allState.showEmptyNotice[3]) {
      allState.showEmptyNotice[3] = false;
    }
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
    if (text != '' && allState.showEmptyNotice[4]) {
      allState.showEmptyNotice[4] = false;
    }
    this.setState(allState);
    this.issueTypeSelect.current.updateValue(text);
  };

  onIssueDescriptionChange = text => {
    let allState = this.state;
    allState.descriptionOfIssue = text;
    if (text != '' && allState.showEmptyNotice[5]) {
      allState.showEmptyNotice[5] = false;
    }
    this.setState(allState);
  };

  showFilePicker = () => {
    let allState = this.state;
    allState.isAttachDialogShown = true;
    this.setState(allState);
  };

  selectOptionInAttachDialog = index => {
    const options = {
      storageOptions: {
        skipBackup: true,
      },
    };

    let allState = this.state;
    if (index == 0) {
      ImagePicker.launchCamera(options, response => {
        console.log(response);
        if (response.data != '' && response.data != undefined) {
          let attachItem = {
            attachment_name: response.fileName,
            attachment: response.data,
            is_attachment_image: true,
          };
          let allState = this.state;
          allState.fileAttach.push(attachItem);
          this.setState(allState);
          // attachFileData.attachment_name = response.fileName;
          // attachFileData.attachment = response.data;
          // attachFileData.is_attachment_image = true;
          // this.onHaveImageUploadChange(true);
        }
      });
    } else if (index == 1) {
      ImagePicker.launchImageLibrary(options, response => {
        console.log(response.data);
        if (response.data != '' && response.data != undefined) {
          let attachItem = {
            attachment_name: response.fileName,
            attachment: response.data,
            is_attachment_image: true,
          };
          let allState = this.state;
          allState.fileAttach.push(attachItem);
          this.setState(allState);
          // attachFileData.attachment_name = response.fileName;
          // attachFileData.attachment = response.data;
          // attachFileData.is_attachment_image = true;
          // this.onHaveImageUploadChange(true);
        }
      });
    } else if (index == 2) {
      // RNFileSelector.Show({
      //   title: 'Select File',
      //   onDone: path => {
      //     RNFetchBlob.fs.readFile(path, 'base64').then(data => {
      //       console.log(data);
      //       let fileStrArray = path.split('/');
      //       let fileName = fileStrArray[fileStrArray.length - 1];
      //       let isImage = true;
      //       if (
      //         fileName.endsWith('.png') ||
      //         fileName.endsWith('.jpg') ||
      //         fileName.endsWith('.jpge') ||
      //         fileName.endsWith('.bmp') ||
      //         fileName.endsWith('.gif')
      //       ) {
      //         isImage = true;
      //       } else {
      //         isImage = false;
      //       }
      //       let attachItem = {
      //         attachment_name: fileName,
      //         attachment: data,
      //         is_attachment_image: isImage,
      //       };
      //       let allState = this.state;
      //       allState.fileAttach.push(attachItem);
      //       this.setState(allState);
      //     });
      //     // if (path != "") {
      //     //     this.onHaveImageUploadChange(true);
      //     // }
      //   },
      //   onCancel: () => {
      //     console.log('cancelled');
      //   },
      // });
    }
    allState.isAttachDialogShown = false;
    this.setState(allState);
  };

  removeAttachFile = index => {
    if (index < this.state.fileAttach.length) {
      let allState = this.state;
      allState.fileAttach.splice(index, 1);
      this.setState(allState);
    }
  };

  displayAttachList() {
    let fileAttachList = this.state.fileAttach;
    let fileAttachDisplayView = [];
    if (fileAttachList != null && fileAttachList.length > 0) {
      for (let i = 0; i < fileAttachList.length; i++) {
        let mediaItem = fileAttachList[i];
        if (mediaItem.is_attachment_image == true) {
          console.log('is_attachment_image');
          fileAttachDisplayView.push(
            <View
              style={{
                width: screenWidth * 0.24,
                height: screenWidth * 0.24,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginEnd: 10,
              }}>
              <Image
                source={{uri: 'data:image/gif;base64,' + mediaItem.attachment}}
                resizeMode="cover"
                style={{width: screenWidth * 0.24, height: screenWidth * 0.24}}
              />
              <TouchableOpacity
                onPress={() => {
                  this.removeAttachFile(i);
                }}
                style={{
                  width: screenWidth * 0.05,
                  height: screenWidth * 0.05,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  top: 2,
                  start: 2,
                  borderWidth: 1,
                  borderColor: '#ffffff',
                  borderRadius: screenWidth * 0.025,
                }}>
                <Image
                  source={require('../image/icon_close_white.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.025,
                    height: screenWidth * 0.025,
                  }}
                />
              </TouchableOpacity>
            </View>,
          );
        } else {
          console.log('is_attachment_file');
          fileAttachDisplayView.push(
            <View
              style={{
                width: screenWidth * 0.24,
                height: screenWidth * 0.24,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginEnd: 10,
                backgroundColor: c_grey,
              }}>
              <Image
                source={require('../image/icon_file_attach.png')}
                resizeMode="contain"
                style={{
                  width: screenWidth * 0.24 * (229 / 245),
                  height: screenWidth * 0.24,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  this.removeAttachFile(i);
                }}
                style={{
                  width: screenWidth * 0.05,
                  height: screenWidth * 0.05,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  top: 2,
                  start: 2,
                  borderWidth: 1,
                  borderColor: '#ffffff',
                  borderRadius: screenWidth * 0.025,
                }}>
                <Image
                  source={require('../image/icon_close_white.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.025,
                    height: screenWidth * 0.025,
                  }}
                />
              </TouchableOpacity>
            </View>,
          );
        }
      }
      fileAttachDisplayView.push(
        <TouchableOpacity
          onPress={() => {
            this.showFilePicker();
          }}
          style={{
            width: screenWidth * 0.24,
            height: screenWidth * 0.24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c_grey,
          }}>
          <Image
            source={require('../image/icon_plus_white.png')}
            resizeMode="cover"
            style={{width: screenWidth * 0.06, height: screenWidth * 0.06}}
          />
        </TouchableOpacity>,
      );
    }
    return fileAttachDisplayView;
  }

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
            source={require('../image/bg_header_top.png')}
            resizeMode="cover"
            style={{
              width: screenWidth,
              height: screenWidth * (107 / 768),
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
          </ImageBackground>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <ImageBackground
                source={require('../image/bg_splash.jpg')}
                resizeMode="cover"
                style={{
                  width: screenWidth,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    width: screenWidth * 0.8,
                    flexDirection: 'row',
                    marginTop: 25,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 20,
                    borderColor: this.state.showEmptyNotice[1]
                      ? c_bg_error_message
                      : '#ffffff',
                  }}>
                  <RNFloatingInput
                    ref={this.deviceTypeSelect}
                    onPress={() => {
                      this.showIssueNameChange();
                    }}
                    label={nameOfIssue}
                    labelSize={8}
                    labelSizeLarge={14}
                    labelColor={c_text_white}
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
                      this.onDeviceTitleChange(text);
                    }}></RNFloatingInput>
                </View>

                <View
                  style={{
                    width: screenWidth * 0.8,
                    flexDirection: 'row',
                    marginTop: 25,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 20,
                    borderColor: this.state.showEmptyNotice[1]
                      ? c_bg_error_message
                      : '#ffffff',
                  }}>
                  <RNFloatingInput
                    ref={this.deviceTypeSelect}
                    onPress={() => {
                      this.showDeviceTypesPicker();
                    }}
                    label={typeOfDevice}
                    labelSize={8}
                    labelSizeLarge={14}
                    labelColor={c_text_white}
                    textInputStyle={[
                      mStyle.textBold,
                      {
                        borderWidth: 0,
                        color: '#ffffff',
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
                    flexDirection: 'row',
                    marginTop: 25,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 20,
                    borderColor: this.state.showEmptyNotice[1]
                      ? c_bg_error_message
                      : '#ffffff',
                  }}>
                  <RNFloatingInput
                    ref={this.deviceNameSelect}
                    onPress={() => {
                      this.showDeviceNamesPicker();
                    }}
                    label={nameOfDevice}
                    labelSize={8}
                    labelSizeLarge={14}
                    labelColor={c_text_white}
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
                    borderBottomColor: this.state.showEmptyNotice[3]
                      ? c_bg_error_message
                      : '#ffffff',
                  }}>
                  <RNFloatingInput
                    ref={this.deviceSerialInput}
                    label={deviceSerialName}
                    labelSize={8}
                    labelSizeLarge={14}
                    labelColor={c_text_white}
                    textInputStyle={[
                      mStyle.textBold,
                      {
                        borderWidth: 0,
                        color: '#ffffff',
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
                    flexDirection: 'row',
                    marginTop: 25,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 20,
                    borderColor: this.state.showEmptyNotice[1]
                      ? c_bg_error_message
                      : '#ffffff',
                  }}>
                  <RNFloatingInput
                    ref={this.issueTypeSelect}
                    onPress={() => {
                      this.showIssueTypesPicker();
                    }}
                    label={typeOfIssue}
                    labelSize={8}
                    labelColor={c_text_white}
                    labelSizeLarge={14}
                    textInputStyle={[
                      mStyle.textBold,
                      {
                        borderWidth: 0,
                        color: '#ffffff',
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
                  activeOpacity={1}
                  onPress={() => {
                    this.setState({isShowInput: true}, () => {
                      this.editText.current.focus();
                    });
                  }}
                  style={{
                    width: screenWidth * 0.8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: this.state.showEmptyNotice[5]
                      ? c_bg_error_message
                      : c_bg_issue_description,
                    borderWidth: 1,
                    borderRadius: 10,
                    flexDirection: 'column',
                    marginTop: 10,
                  }}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      this.setState({isShowInput: true}, () => {
                        this.editText.current.focus();
                      });
                    }}>
                    <Image
                      source={require('../image/icon_pencil_edit.png')}
                      resizeMode="cover"
                      style={{
                        display: this.state.isShowInput ? 'none' : 'flex',
                        width: screenWidth * 0.2,
                        height: screenWidth * 0.2 * (234 / 264),
                        margin: 10,
                      }}
                    />
                  </TouchableOpacity>
                  <TextInput
                    ref={this.editText}
                    onChangeText={text => {
                      this.onIssueDescriptionChange(text);
                    }}
                    onBlur={() => {
                      if (this.state.descriptionOfIssue == '') {
                        this.setState({isShowInput: false});
                      } else {
                        this.setState({isShowInput: true});
                      }
                    }}
                    onFocus={() => {
                      this.setState({isShowInput: true});
                    }}
                    multiline={true}
                    numberOfLines={this.state.isShowInput ? 5 : 3}
                    textAlignVertical={'top'}
                    style={[
                      mStyle.textDescription,
                      {
                        borderWidth: 0,
                        width: screenWidth * 0.8,
                        padding: 10,
                        backgroundColor: 'c_bg_issue_description',
                        borderRadius: 10,
                        textAlign: 'center',
                      },
                    ]}
                    placeholder={
                      this.state.isShowInput ? '' : descriptionOfIssue
                    }
                    placeholderTextColor={'#000000'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.showFilePicker();
                  }}
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 15,
                    display:
                      this.state.fileAttach.length == 0 ? 'flex' : 'none',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: c_blue_light_filter,
                      width: screenWidth * 0.15,
                      height: screenWidth * 0.15,
                      borderRadius: screenWidth * 0.075,
                    }}>
                    <Image
                      source={require('../image/icon_plus_white.png')}
                      resizeMode="cover"
                      style={{
                        width: screenWidth * 0.05,
                        height: screenWidth * 0.05,
                      }}
                    />
                    {/* <RNFileSelector
                    title={'Select File'}
                    visible={this.state.visible}
                    onDone={path => {
                      console.log('file selected: ' + path);
                    }}
                    onCancel={() => {
                      console.log('cancelled');
                    }}
                  /> */}
                  </View>
                  <View
                    style={{
                      alignSelf: 'center',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={[mStyle.textDescription, {color: '#000000'}]}>
                      {attachFileOrImage}
                    </Text>
                  </View>
                </TouchableOpacity>
                <ScrollView
                  horizontal={true}
                  style={{
                    width: screenWidth * 0.8,
                    display:
                      this.state.fileAttach.length == 0 ? 'none' : 'flex',
                    marginTop: 10,
                    marginBottom: 10,
                  }}>
                  {this.displayAttachList()}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => {
                    // this.addIssue();
                    if (
                      this.state.issueName != '' &&
                      this.state.deviceType != '' &&
                      this.state.deviceName != '' &&
                      this.state.issueType != '' &&
                      this.state.deviceSerialNumber != '' &&
                      this.state.descriptionOfIssue != ''
                    ) {
                      this.setState({isTwoQuestionDialogShow: true});
                    } else {
                      this.updateEmptyNotice();
                    }
                  }}
                  style={[
                    this.state.issueName != '' &&
                    this.state.deviceType != '' &&
                    this.state.deviceName != '' &&
                    this.state.issueType != '' &&
                    this.state.deviceSerialNumber != '' &&
                    this.state.descriptionOfIssue != ''
                      ? mStyle.buttonEnable
                      : mStyle.buttonDisable,
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
                    {send}
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
              </ImageBackground>
            </View>
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
                    width: screenWidth * 0.09,
                    height: screenWidth * 0.09,
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
                    this.addIssue();
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
            animationType="slide"
            presentationStyle="fullScreen"
            visible={this.state.isAttachDialogShown}
            transparent={false}>
            <View
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
                  this.selectOptionInAttachDialog(3);
                }}>
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
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: screenWidth,
                  padding: 10,
                  backgroundColor: '#ffffff',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog(0);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{takePicture}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog(1);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{selectFromGallery}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog(2);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{selectOtherFile}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog(3);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{cancel}</Text>
                </TouchableOpacity>
              </View>
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
  textDescription: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 15,
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
