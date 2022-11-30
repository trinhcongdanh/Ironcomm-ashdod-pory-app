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
  attachFileOrImage1,
  attachFileOrImage2,
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
  locationName,
  locationID,
  sub_option_a_1,
  sub_option_a_title,
  sub_option_a_2,
  sub_option_b_title,
  sub_option_b_1,
  sub_option_b_2,
} from '../resource/StringContentDefault';
// import RNFileSelector from 'react-native-file-selector';
import RNFloatingInput from '../comp/FloatingInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNFetchBlob from 'react-native-fetch-blob';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export default class NewIssueScreen extends React.Component {
  constructor(props) {
    super(props);
    this.issuesNameSelect = React.createRef();
    this.deviceTypeSelect = React.createRef();
    this.deviceNameSelect = React.createRef();
    this.issueTypeInput = React.createRef();
    this.locationNameSelect = React.createRef();
    this.deviceSerialInput = React.createRef();
    this.editText = React.createRef();
    this.state = {
      issueNames: [],
      deviceTypes: [],
      deviceNames: [],
      locationNames: [],
      selectingList: [],
      showEmptyNotice: [false, false, false, false, false, false, false],
      typeSelectingList: '',
      issueNameId: '',
      issueName: '',
      deviceType: '',
      deviceTypeId: '',
      deviceName: '',
      deviceNameId: '',
      deviceSerialNumber: '',
      issueType: '',
      locationName: '',
      locationNameId: '',
      condition: '',
      worning: '',
      isHaveImageUpload: false,
      descriptionOfIssue: '',
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
      userInfo: {},
      isSelectListShown: false,
      isAttachDialogShown1: false,
      isAttachDialogShown2: false,
      isShowInput: false,
      fileAttach1: [],
      fileAttach2: [],
      isTwoQuestionDialogShow: false,
      questionFirstSelected: text_no,
      questionSecondSelected: text_no,
      sub_option_a: 0,
      sub_option_b: 0,
    };
  }

  componentDidMount() {
    this.loadUserInfo().then(() => {
      this.loadAppConfig().then(() => {
        this.getIssuesName();
      });
    });
  }

  componentWillUnmount() {}

  loadUserInfo = async () => {
    try {
      const value = await AsyncStorage.getItem(key_user_info);
      if (value != null) {
        // value previously stored
        // console.log(value);
        const jsonValue = JSON.parse(value);
        let allState = this.state;
        allState.userInfo = jsonValue;
        console.log(jsonValue);
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
        // Set default the status
        allState.condition = allState.appConfig.issue_conditions[0];
        allState.worning = allState.appConfig.issue_wornings[0];
        this.setState(allState);
      } else {
      }
    } catch (e) {
      // error reading value
    }
  };

  getIssuesName = async () => {
    this._closeLoadingBox();
    let allState = this.state;

    allState.issueNames = [
      {
        id: allState.userInfo.unit_number,
        name: allState.userInfo.user_type_name,
      },
    ];
    this.setState(allState);
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
      for (let i = 0; i < deviceList.length; i++) {
        let item = {
          id: deviceList[i]['id'],
          name: deviceList[i]['name'],
          issue_types: deviceList[i]['issue_types'],
        };
        allState.deviceNames.push(item);
        console.log(allState.deviceNames[0].issue_types);
      }
    }
    this.setState(allState);
  };

  getLocations = async () => {
    this._closeLoadingBox();
    let allState = this.state;
    for (let i = 0; i < allState.appConfig.place_description.length; i++) {
      let item = {
        id: i + 1,
        name: allState.appConfig.place_description[i],
      };
      allState.locationNames.push(item);
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
      this.state.descriptionOfIssue != '' &&
      this.state.locationName != ''
    ) {
      this._showLoadingBox();
      let dataObj = {
        request: rq_add_issue,
        token: this.state.userInfo.token,
        title: this.state.issueName,
        device_type_id: parseInt(this.state.deviceTypeId),
        device_id: parseInt(this.state.deviceNameId),
        issue_type_id: this.state.issueType,
        serial_num: this.state.deviceSerialNumber,
        description: this.state.descriptionOfIssue,
        place_description: this.state.locationName,
        condition: this.state.condition,
        worning: this.state.worning,
      };

      dataObj.is_operational = false;

      dataObj.is_disabled = false;

      let attachments = [];
      if (this.state.fileAttach1.length > 0) {
        for (let i = 0; i < this.state.fileAttach1.length; i++) {
          let attachItem = {
            attachment: this.state.fileAttach1[i]['attachment'],
            attachment_name: this.state.fileAttach1[i]['attachment_name'],
            is_attachment_image:
              this.state.fileAttach1[i]['is_attachment_image'],
          };
          attachments.push(attachItem);
        }
        // let attachFileData = this.state.fileAttach[0];
        // dataObj.attachment = attachFileData.attachment;
        // dataObj.attachment_name = attachFileData.attachment_name;
        // dataObj.is_attachment_image = attachFileData.is_attachment_image;
      }
      if (this.state.fileAttach2.length > 0) {
        for (let i = 0; i < this.state.fileAttach2.length; i++) {
          let attachItem = {
            attachment: this.state.fileAttach2[i]['attachment'],
            attachment_name: this.state.fileAttach2[i]['attachment_name'],
            is_attachment_image:
              this.state.fileAttach2[i]['is_attachment_image'],
          };
          attachments.push(attachItem);
        }
        // let attachFileData = this.state.fileAttach[0];
        // dataObj.attachment = attachFileData.attachment;
        // dataObj.attachment_name = attachFileData.attachment_name;
        // dataObj.is_attachment_image = attachFileData.is_attachment_image;
      }
      dataObj.attachments = attachments;
      // console.log(dataObj);
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
    if (this.state.locationName == '') {
      allState.showEmptyNotice[6] = true;
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

  showIssuesNamesPicker = async () => {
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

  showLocationsPicker = async () => {
    let allState = this.state;
    allState.selectingList = allState.locationNames;
    allState.typeSelectingList = locationName;
    allState.isSelectListShown = true;
    this.setState(allState);
  };

  onIssuesNameChange = text => {
    let allState = this.state;
    allState.issueName = text;
    if (text != '' && allState.showEmptyNotice[0]) {
      allState.showEmptyNotice[0] = false;
    }
    if (allState.issueNames[0].name == text) {
      if (allState.issueNameId != allState.issueNames[0].id) {
        allState.deviceTypeId = '';
        allState.deviceType = '';
        allState.deviceNameId = '';
        allState.deviceName = '';
        allState.locationNameId = '';
        allState.locationName = '';
        this.deviceTypeSelect.current.updateValue('');
        this.deviceNameSelect.current.updateValue('');
        this.locationNameSelect.current.updateValue('');
      }
      allState.issueNameId = allState.issueNames[0].id;
    }
    this.setState(allState);
    this.issuesNameSelect.current.updateValue(text);
    this.getDeviceTypes();
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
          allState.locationNameId = '';
          allState.locationName = '';
          this.deviceNameSelect.current.updateValue('');
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
          allState.locationNameId = '';
          allState.locationName = '';
          this.locationNameSelect.current.updateValue('');
        }
        allState.deviceNameId = allState.deviceNames[i].id;
      }
    }
    if (text != '' && allState.showEmptyNotice[2]) {
      allState.showEmptyNotice[2] = false;
    }
    this.setState(allState);
    this.deviceNameSelect.current.updateValue(text);
    this.getLocations();
  };

  onLocationChange = text => {
    let allState = this.state;
    allState.locationName = text;
    for (let i = 0; i < allState.locationNames.length; i++) {
      if (allState.locationNames[i] == text) {
        allState.locationNameId = i + 1;
      }
    }
    if (text != '' && allState.showEmptyNotice[6]) {
      allState.showEmptyNotice[6] = false;
    }
    this.setState(allState);
    this.locationNameSelect.current.updateValue(text);
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
    if (text != '' && allState.showEmptyNotice[4]) {
      allState.showEmptyNotice[4] = false;
    }
    this.setState(allState);
    this.issueTypeInput.current.updateValue(text);
  };

  onIssueDescriptionChange = text => {
    let allState = this.state;
    allState.descriptionOfIssue = text;
    if (text != '' && allState.showEmptyNotice[5]) {
      allState.showEmptyNotice[5] = false;
    }
    this.setState(allState);
  };

  showFilePicker1 = () => {
    let allState = this.state;
    allState.isAttachDialogShown1 = true;
    this.setState(allState);
  };

  showFilePicker2 = () => {
    let allState = this.state;
    allState.isAttachDialogShown2 = true;
    this.setState(allState);
  };

  selectOptionInAttachDialog1 = async index => {
    let allState = this.state;
    if (index == 0) {
      const result = await launchCamera({mediaType: 'photo'});
      console.log(result);
      result.assets?.map(item => {
        if (item != '' && item != undefined) {
          let attachItem = {
            attachment_name: item.fileName,
            attachment: item.uri,
            is_attachment_image: true,
          };
          let allState = this.state;
          allState.fileAttach1.push(attachItem);
          this.setState(allState);
        }
      });
    } else if (index == 1) {
      const result = await launchImageLibrary({mediaType: 'photo'});

      result.assets?.map(item => {
        if (item != '' && item != undefined) {
          let attachItem = {
            attachment_name: item.fileName,
            attachment: item.uri,
            is_attachment_image: true,
          };
          let allState = this.state;
          allState.fileAttach1.push(attachItem);
          this.setState(allState);
        }
      });
    } else if (index == 2) {
    }
    allState.isAttachDialogShown1 = false;
    this.setState(allState);
  };
  selectOptionInAttachDialog2 = async index => {
    let allState = this.state;
    if (index == 0) {
      const result = await launchCamera({mediaType: 'photo'});

      result.assets?.map(item => {
        if (item != '' && item != undefined) {
          let attachItem = {
            attachment_name: item.fileName,
            attachment: item.uri,
            is_attachment_image: true,
          };
          let allState = this.state;
          allState.fileAttach2.push(attachItem);
          this.setState(allState);
        }
      });
    } else if (index == 1) {
      const result = await launchImageLibrary({mediaType: 'photo'});

      result.assets?.map(item => {
        if (item != '' && item != undefined) {
          let attachItem = {
            attachment_name: item.fileName,
            attachment: item.uri,
            is_attachment_image: true,
          };
          let allState = this.state;
          allState.fileAttach2.push(attachItem);
          this.setState(allState);
        }
      });
    } else if (index == 2) {
    }
    allState.isAttachDialogShown2 = false;
    this.setState(allState);
  };

  removeAttachFile1 = index => {
    if (index < this.state.fileAttach1.length) {
      let allState = this.state;
      allState.fileAttach1.splice(index, 1);
      this.setState(allState);
    }
  };
  removeAttachFile2 = index => {
    if (index < this.state.fileAttach2.length) {
      let allState = this.state;
      allState.fileAttach2.splice(index, 1);
      this.setState(allState);
    }
  };
  displayAttachList1() {
    let fileAttachList1 = this.state.fileAttach1;
    let fileAttachDisplayView = [];
    if (fileAttachList1 != null && fileAttachList1.length > 0) {
      for (let i = 0; i < fileAttachList1.length; i++) {
        let mediaItem = fileAttachList1[i];
        if (mediaItem.is_attachment_image == true) {
          console.log('is_attachment_image');
          fileAttachDisplayView.push(
            <View
              key={i}
              style={{
                width: screenWidth * 0.24,
                height: screenWidth * 0.24,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginEnd: 10,
              }}>
              <Image
                source={{uri: mediaItem.attachment}}
                resizeMode="cover"
                style={{width: screenWidth * 0.24, height: screenWidth * 0.24}}
              />
              <TouchableOpacity
                onPress={() => {
                  this.removeAttachFile1(i);
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
              key={i}
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
                  this.removeAttachFile1(i);
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
            this.showFilePicker1();
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
  displayAttachList2() {
    let fileAttachList2 = this.state.fileAttach2;
    let fileAttachDisplayView = [];
    if (fileAttachList2 != null && fileAttachList2.length > 0) {
      for (let j = 0; j < fileAttachList2.length; j++) {
        let mediaItem = fileAttachList2[j];
        if (mediaItem.is_attachment_image == true) {
          console.log('is_attachment_image');
          fileAttachDisplayView.push(
            <View
              key={j}
              style={{
                width: screenWidth * 0.24,
                height: screenWidth * 0.24,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginEnd: 10,
              }}>
              <Image
                source={{uri: mediaItem.attachment}}
                resizeMode="cover"
                style={{width: screenWidth * 0.24, height: screenWidth * 0.24}}
              />
              <TouchableOpacity
                onPress={() => {
                  this.removeAttachFile2(j);
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
              key={j}
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
                  this.removeAttachFile2(j);
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
            this.showFilePicker2();
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
    if (type == issueName) {
      this.onIssuesNameChange(item.name);
    } else if (type == deviceType) {
      this.onDeviceTypeChange(item.name);
    } else if (type == deviceName) {
      this.onDeviceNameChange(item.name);
    } else if (type == locationName) {
      this.onLocationChange(item.name);
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
              <Text style={[mStyle.textNormal, {color: 'white'}]}>
                {this.state.userInfo.first_name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={[mStyle.textNormal, {color: 'white'}]}>
                {this.state.userInfo.unit_number}
              </Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <ImageBackground
                source={require('../image/bg_header_bottom.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth,
                  height: screenWidth * (246 / 768),
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    width: screenWidth * 0.8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: this.state.showEmptyNotice[0]
                      ? c_bg_error_message
                      : '#ffffff',
                  }}>
                  <RNFloatingInput
                    ref={this.issuesNameSelect}
                    onPress={() => {
                      this.showIssuesNamesPicker();
                    }}
                    label={nameOfIssue}
                    labelSize={12}
                    labelSizeLarge={14}
                    labelColor={c_text_white}
                    source={require('../image/icon_arrow_down_white.png')}
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
                    value={this.state.issueName}
                    onChangeText={text => {
                      this.onIssuesNameChange(text);
                    }}></RNFloatingInput>
                </View>
              </ImageBackground>

              <View
                style={{
                  width: screenWidth * 0.8,
                  marginTop: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: this.state.showEmptyNotice[3]
                    ? c_bg_error_message
                    : '#000',
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
              <TouchableOpacity
                onPress={() => {
                  this.showFilePicker1();
                }}
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 15,
                  display: this.state.fileAttach1.length == 0 ? 'flex' : 'none',
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
                    {attachFileOrImage1}
                  </Text>
                </View>
              </TouchableOpacity>
              <ScrollView
                horizontal={true}
                style={{
                  width: screenWidth * 0.8,
                  display: this.state.fileAttach1.length == 0 ? 'none' : 'flex',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {this.displayAttachList1()}
              </ScrollView>
              <View
                style={{
                  width: screenWidth * 0.8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: this.state.showEmptyNotice[1]
                    ? c_bg_error_message
                    : '#000',
                }}>
                <RNFloatingInput
                  ref={this.deviceTypeSelect}
                  onPress={() => {
                    this.showDeviceTypesPicker();
                  }}
                  label={typeOfDevice}
                  labelSize={12}
                  labelSizeLarge={14}
                  source={require('../image/icon_arrow_down_black.png')}
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
                  borderBottomColor: this.state.showEmptyNotice[2]
                    ? c_bg_error_message
                    : '#000',
                }}>
                <RNFloatingInput
                  ref={this.deviceNameSelect}
                  onPress={() => {
                    this.showDeviceNamesPicker();
                  }}
                  label={nameOfDevice}
                  labelSize={12}
                  labelSizeLarge={14}
                  source={require('../image/icon_arrow_down_black.png')}
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
                  borderBottomColor: this.state.showEmptyNotice[4]
                    ? c_bg_error_message
                    : '#000',
                }}>
                <RNFloatingInput
                  ref={this.issueTypeInput}
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
                  showArrow={false}
                  editable={true}
                  value={this.state.issueType}
                  onChangeTextInput={text => {
                    this.onIssueTypeChange(text);
                  }}></RNFloatingInput>
              </View>
              <View
                style={{
                  width: screenWidth * 0.8,
                  marginTop: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: this.state.showEmptyNotice[6]
                    ? c_bg_error_message
                    : '#000',
                }}>
                <RNFloatingInput
                  ref={this.locationNameSelect}
                  onPress={() => {
                    this.showLocationsPicker();
                  }}
                  label={locationName}
                  labelSize={12}
                  labelSizeLarge={14}
                  source={require('../image/icon_arrow_down_black.png')}
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
                  value={this.state.locationName}
                  onChangeText={text => {
                    this.onLocationChange(text);
                  }}></RNFloatingInput>
              </View>
              <View
                style={{
                  marginTop: 25,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    console.log('Location Id');
                  }}>
                  <Image
                    source={require('../image/location_red.png')}
                    style={{
                      width: 30,
                      height: 30,
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    width: screenWidth * 0.8 - 30,
                    borderBottomWidth: 1,
                    borderBottomColor: this.state.showEmptyNotice[4]
                      ? c_bg_error_message
                      : '#000',
                  }}>
                  <RNFloatingInput
                    // ref={this.issueTypeInput}
                    label={locationID}
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
                    // value={this.state.issueType}
                    // onChangeTextInput={text => {
                    //   this.onIssueTypeChange(text);
                    // }}
                  ></RNFloatingInput>
                </View>
              </View>
              <View style={{marginTop: 25}}>
                <View
                  style={{
                    flexDirection: 'row-reverse',
                    justifyContent: 'flex-end',
                    width: screenWidth * 0.8,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row-reverse',
                      backgroundColor: '#fff',
                      padding: 4,
                      borderRadius: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        let allState = this.state;
                        allState.condition =
                          allState.appConfig.issue_conditions[1];
                        allState.sub_option_a = 1;
                        this.setState(allState);
                      }}
                      style={{
                        paddingHorizontal: 4,
                        paddingVertical: 8,
                        marginLeft: 10,
                        borderRadius: 10,
                        width: screenWidth * 0.25,
                        backgroundColor:
                          this.state.sub_option_a === 1 ? '#020047' : '#fff',
                      }}>
                      <Text
                        style={{
                          color:
                            this.state.sub_option_a === 1 ? '#fff' : '#000',
                          textAlign: 'center',
                        }}>
                        {sub_option_a_1}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        let allState = this.state;
                        allState.condition =
                          allState.appConfig.issue_conditions[0];
                        allState.sub_option_a = 0;
                        this.setState(allState);
                      }}
                      style={{
                        paddingHorizontal: 4,
                        paddingVertical: 8,
                        borderRadius: 10,
                        width: screenWidth * 0.25,
                        backgroundColor:
                          this.state.sub_option_a === 0 ? '#020047' : '#fff',
                      }}>
                      <Text
                        style={{
                          color:
                            this.state.sub_option_a === 0 ? '#fff' : '#000',
                          textAlign: 'center',
                        }}>
                        {sub_option_a_2}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={{
                      fontWeight: '700',
                      color: '#020047',
                      marginRight: 10,
                      width: screenWidth * 0.25,
                    }}>
                    {sub_option_a_title}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row-reverse',
                    justifyContent: 'flex-end',
                    width: screenWidth * 0.8,
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row-reverse',
                      backgroundColor: '#fff',
                      padding: 4,
                      borderRadius: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        let allState = this.state;
                        allState.worning = allState.appConfig.issue_wornings[1];
                        allState.sub_option_b = 1;
                        this.setState(allState);
                      }}
                      style={{
                        paddingHorizontal: 4,
                        paddingVertical: 8,
                        marginLeft: 10,
                        borderRadius: 10,
                        width: screenWidth * 0.25,
                        backgroundColor:
                          this.state.sub_option_b === 1 ? '#020047' : '#fff',
                      }}>
                      <Text
                        style={{
                          color:
                            this.state.sub_option_b === 1 ? '#fff' : '#000',
                          textAlign: 'center',
                        }}>
                        {sub_option_b_1}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        let allState = this.state;
                        allState.worning = allState.appConfig.issue_wornings[0];
                        allState.sub_option_b = 0;
                        this.setState(allState);
                      }}
                      style={{
                        paddingHorizontal: 4,
                        paddingVertical: 8,
                        borderRadius: 10,
                        width: screenWidth * 0.25,
                        backgroundColor:
                          this.state.sub_option_b === 0 ? '#020047' : '#fff',
                      }}>
                      <Text
                        style={{
                          color:
                            this.state.sub_option_b === 0 ? '#fff' : '#000',
                          textAlign: 'center',
                        }}>
                        {sub_option_b_2}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={{
                      fontWeight: '700',
                      color: '#020047',
                      marginRight: 10,
                      width: screenWidth * 0.25,
                    }}>
                    {sub_option_b_title}
                  </Text>
                </View>
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
                  placeholder={this.state.isShowInput ? '' : descriptionOfIssue}
                  placeholderTextColor={'#000000'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.showFilePicker2();
                }}
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 15,
                  display: this.state.fileAttach2.length == 0 ? 'flex' : 'none',
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
                    {attachFileOrImage2}
                  </Text>
                </View>
              </TouchableOpacity>
              <ScrollView
                horizontal={true}
                style={{
                  width: screenWidth * 0.8,
                  display: this.state.fileAttach2.length == 0 ? 'none' : 'flex',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                {this.displayAttachList2()}
              </ScrollView>
              <TouchableOpacity
                onPress={() => {
                  this.addIssue();
                  if (
                    this.state.issueName != '' &&
                    this.state.deviceType != '' &&
                    this.state.deviceName != '' &&
                    this.state.issueType != '' &&
                    this.state.deviceSerialNumber != '' &&
                    this.state.descriptionOfIssue != '' &&
                    this.state.locationName != ''
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
                  this.state.descriptionOfIssue != '' &&
                  this.state.locationName != ''
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
            animationType="slide"
            presentationStyle="fullScreen"
            visible={this.state.isAttachDialogShown1}
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
                  this.selectOptionInAttachDialog1(3);
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
                    this.selectOptionInAttachDialog1(0);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{takePicture}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog1(1);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{selectFromGallery}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog1(2);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{selectOtherFile}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog1(3);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{cancel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            presentationStyle="fullScreen"
            visible={this.state.isAttachDialogShown2}
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
                  this.selectOptionInAttachDialog2(3);
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
                    this.selectOptionInAttachDialog2(0);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{takePicture}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog2(1);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{selectFromGallery}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog2(2);
                  }}
                  style={{padding: 10}}>
                  <Text style={[mStyle.textBold]}>{selectOtherFile}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.selectOptionInAttachDialog2(3);
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
