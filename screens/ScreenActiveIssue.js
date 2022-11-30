/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Alert,
  Platform,
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  I18nManager,
  LogBox,
  ScrollView,
} from 'react-native';

import {
  c_bg_filter_selected,
  c_blue_light_filter,
  c_background_issue_item,
  c_grey_filter,
  c_status_accept,
  c_status_done,
  c_status_in_progress,
  c_status_line,
  c_select_box_border,
  c_select_box_bg,
  c_priority_high,
  c_priority_medium,
  c_priority_low,
  c_bg_section_line,
  c_grey,
  ActiveIssueScreenName,
  c_username_chat,
  c_grey_text,
  key_user_info,
  key_app_config,
  greyHasOpacity,
  c_loading_icon,
  rq_get_issues,
  api_url,
  rc_success,
  rq_get_issue,
  rq_get_device_types,
  rq_get_devices_for_type,
  rq_get_issue_types_for_device,
  rq_send_chat_message,
  rq_accept_issue,
  rq_approve_issue,
  rq_disapprove_issue,
  rq_reject_issue,
  rq_set_issue_priority,
  rq_set_issue_status,
  rq_set_arrive_date,
  NewIssueScreenName,
  EditIssueScreenName,
  rc_token_expire,
  LoginScreenName,
  c_color_chat_list,
  format_date_in_chat,
  c_priority_immediate,
} from '../resource/BaseValue';
import {
  unit,
  location,
  nameOfIssue,
  statusAccepted,
  statusInProgress,
  statusDone,
  mcaApprovalLabel,
  mcaAccept,
  mcaReject,
  urgencyLabel,
  priorityHigh,
  idfApprovalLabel,
  idfApproved,
  idfNotApproved,
  priorityLow,
  priorityImmediate,
  sectionStatusTitle,
  inPriority,
  inClose,
  inCoordinated,
  inCertification,
  inNew,
  arrivalDate,
  arrivalDateDefaulText,
  issueDetail,
  deviceType,
  deviceName,
  issueType,
  serialNumber,
  mediaSection,
  chatSection,
  takePicture,
  selectFromGallery,
  selectOtherFile,
  cancel,
  priorityMedium,
  rejectIssueMessage,
  rejectIssueButtonOk,
  rejectIssueButtonCancel,
  disapproveIssueMessage,
  disapproveIssueButtonOk,
  disapproveIssueButtonCancel,
  closeIssueMessage,
  closeIssueButtonOk,
  closeIssueButtonCancel,
  youHaveNoPermissionToDoThi,
  ok_text,
  reasonForDisapproval,
  reasonForRejectIssue,
  arrivalDateDefaultTextWaiting,
  rejectConfirmForType3,
  rejectConfirmForType3ButtonYes,
  rejectConfirmForType3ButtonNo,
  issueDetailTitle,
  locationIssues,
  conditon,
  warning
} from '../resource/StringContentDefault';
import {Picker} from '@react-native-picker/picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import RNFileSelector from 'react-native-file-selector';
// import RNFetchBlob from 'react-native-fetch-blob';
import ImageViewer from 'react-native-image-zoom-viewer';
import Hyperlink from 'react-native-hyperlink';

export default class ActiveIssueScreen extends React.Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.issueDetailSection = React.createRef();
    this.mediaSection = React.createRef();
    this.chatSection = React.createRef();
    this.scrollView = React.createRef();
    this.state = {
      userId: 2,
      userName: 'מור ישראלי',
      composeText: '',
      chatRefresh: true,
      isAttachDialogShown: false,
      isStatusDialogShown: false,
      issueId: props.route.params.issue_id,
      issueStatus: props.route.params.issue_status,
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
      userInfo: {},
      appConfig: {},
      issueDetail: {
        class: 0,
      },
      isDatePickerVisible: false,
      isStatusFirstime: true,
      showIssueProgressSection: true,
      showIssueDetailsSection: false,
      showMediaSection: false,
      showChatSection: true,
      fileUri: '',
      fileName: '',
      isImageAttach: false,
      isShowStickyLabel: false,
      isViewFullImage: false,
      isDisapproveDialogShown: false,
      disapproveReason: '',
      showDisapproveReasonNotice: false,
      isRejectIssueDialogShown: false,
      rejectIssueReason: '',
      showRejectIssueNotice: false,
      images: [
        {
          // Simplest usage.
          url: '',
        },
      ],
      startPosImageViewFull: 0,
      userColorList: [],
      isFirstTimeLoad: true,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

    I18nManager.forceRTL(true);
    this.loadUserInfo().then(() => {
      this.loadAppConfig().then(() => {
        this.getIssueDetails(this.state.issueId);
      });
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );

    I18nManager.forceRTL(true);
  }

  handleBackButtonClick() {
    if (this.state.isViewFullImage) {
      this.closeImageViewFull();
    } else {
      this.props.navigation.goBack(null);
    }
    return true;
  }

  loadUserInfo = async () => {
    try {
      const value = await AsyncStorage.getItem(key_user_info);
      if (value != null) {
        // value previously stored
        // console.log('userinfo: ' + value);
        const jsonValue = JSON.parse(value);
        let allState = this.state;
        allState.userInfo = jsonValue;
        this.setState(allState);
      } else {
      }
    } catch (e) {
      // error reading value
      console.log(e);
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
      console.log(e);
    }
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

  showDatePicker = () => {
    let allState = this.state;
    allState.isDatePickerVisible = true;
    this.setState(allState);
  };

  closeDatePicker = () => {
    let allState = this.state;
    allState.isDatePickerVisible = false;
    this.setState(allState);
  };

  handleDateConfirm = date => {
    let allState = this.state;
    allState.isDatePickerVisible = false;
    this.setState(allState, () => {
      this.setArrivalDate(moment(date).format('YYYY-MM-DD HH:mm'));
    });
  };

  getIssueDetails = async issueId => {
    this._showLoadingBox();
    let dataObj = {
      request: rq_get_issue,
      token: this.state.userInfo.token,
      issue_id: issueId,
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
          // console.log(Object.keys(responseJson.chat_messages));
          console.log(responseJson.chat_messages);
          let allState = this.state;
          allState.issueDetail = responseJson;
          // create user color list
          allState.userColorList = this.getUserColorList(
            allState.issueDetail.chat_messages,
          );
          for (let i = 0; i < allState.issueDetail.chat_messages.length; i++) {
            let colorString = this.getUsernameColor(
              allState.issueDetail.chat_messages[i]['user_name'],
            );
            // console.log(colorString);
            allState.issueDetail.chat_messages[i]['user_color'] = colorString;
          }
          // console.log(allState.issueDetail.chat_messages);
          this.setState(allState);
          this.getDeviceTypes();
        } else if (responseJson.rc == rc_token_expire) {
          this.props.navigation.navigate(LoginScreenName, {
            isTokenExpire: true,
          });
        } else {
          console.log(dataObj);
          console.log(responseJson.message);
        }
      })
      .catch(error => {
        this._closeLoadingBox();
        console.log(error + ' - getIssueDetails');
      });
  };

  getUserColorList(chatList) {
    let userColorList = {};
    let colorArray = c_color_chat_list;
    let currentColorIndex = 0;
    let countStop = c_color_chat_list.length;
    for (let i = 0; i < chatList.length; i++) {
      let itemChat = chatList[i];
      // console.log(currentColorIndex);
      if (
        userColorList[itemChat.user_name] == null ||
        userColorList[itemChat.user_name] == '' ||
        userColorList[itemChat.user_name] == undefined
      ) {
        if (currentColorIndex > colorArray.length - 1) {
          for (let j = 0; j < countStop; j++) {
            // console.log(c_color_chat_list[j]);
            colorArray.push(c_color_chat_list[j]);
          }
        }
        // let item = {
        //     'userName' : itemChat.user_name,
        //     'color': colorArray[currentColorIndex]
        // };
        // userColorList.push(item);
        userColorList[itemChat.user_name] = colorArray[currentColorIndex];
        currentColorIndex = currentColorIndex + 1;
      }
    }
    return userColorList;
  }

  getUsernameColor(userName) {
    // for (let i = 0; i < this.state.userColorList.length; i++) {
    //     console.log(userName + " - " + this.state.userColorList[i]['color']);
    //     if (this.state.userColorList[i]['userName'] == userName) {
    //         return (this.state.userColorList[i]['color'])
    //     }
    // }
    if (
      this.state.userColorList[userName] == null ||
      this.state.userColorList[userName] == '' ||
      this.state.userColorList[userName] == undefined
    ) {
      return c_username_chat;
    } else {
      return this.state.userColorList[userName];
    }
  }

  showSelectAttachDialog = () => {
    let allState = this.state;
    allState.isAttachDialogShown = true;
    this.setState(allState);
  };

  selectOptionInAttachDialog = async index => {
    let allState = this.state;
    allState.isAttachDialogShown = false;

    if (index == 0) {
      const result = await launchCamera({mediaType: 'photo'});
      result.assets?.map(item => {
        console.log(item);
        if (item != '' && item != undefined) {
          allState.fileName = item.fileName;
          allState.fileUri = item.uri;
          allState.isImageAttach = true;
          this.setState(allState);
        }
      });
    } else if (index == 1) {
      const result = await launchImageLibrary({mediaType: 'photo'});
      result.assets?.map(item => {
        console.log(item);
        if (item != '' && item != undefined) {
          allState.fileName = item.fileName;
          allState.fileUri = item.uri;
          allState.isImageAttach = true;
          this.setState(allState);
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
      //       if (
      //         fileName.endsWith('.png') ||
      //         fileName.endsWith('.jpg') ||
      //         fileName.endsWith('.jpge') ||
      //         fileName.endsWith('.bmp') ||
      //         fileName.endsWith('.gif')
      //       ) {
      //         allState.isImageAttach = true;
      //       } else {
      //         allState.isImageAttach = false;
      //       }
      //       allState.fileName = fileName;
      //       allState.fileUri = data;
      //       this.setState(allState);
      //     });
      //   },
      //   onCancel: () => {
      //     console.log('cancelled');
      //   },
      // });
    }
  };

  getDeviceTypes = async () => {
    this._closeLoadingBox();
    let allState = this.state;
    let deviceList = [];
    let issueList = [];
    for (let i = 0; i < allState.appConfig.containers.length; i++) {
      if (
        allState.appConfig.containers[i]['id'] ==
        allState.issueDetail.device_type_id
      ) {
        allState.issueDetail.device_type_name =
          allState.appConfig.containers[i]['name'];
      }
      deviceList = allState.appConfig.containers[i]['devices'];
      for (let j = 0; j < deviceList.length; j++) {
        if (deviceList[j]['id'] == allState.issueDetail.device_id) {
          allState.issueDetail.device_name = deviceList[j]['name'];
        }
        issueList = deviceList[j]['issue_types'];
        for (let x = 0; x < issueList.length; x++) {
          if (issueList[x]['id'] == allState.issueDetail.issue_type_id) {
            allState.issueDetail.issue_type_name = issueList[x]['name'];
          }
        }
      }
    }
    this.setState(allState);
    this.continueAutoActionAfterLoading();
    // this.getDeviceNames(allState.issueDetail.device_type_id);
  };

  continueAutoActionAfterLoading = () => {
    let allState = this.state;
    if (this.state.issueStatus == inNew) {
      allState.showIssueDetailsSection = true;
      allState.showMediaSection = true;
    }
    allState.isFirstTimeLoad = false;
    this.setState(allState);
  };

  // callAcceptIssue = async classValue => {
  //   if (this.state.issueDetail.can_accept == 1) {
  //     this._showLoadingBox();
  //     let dataObj = {
  //       request: rq_accept_issue,
  //       token: this.state.userInfo.token,
  //       issue_id: this.state.issueDetail.issue_id,
  //     };
  //     if (this.state.userInfo.type == 3) {
  //       dataObj.class = classValue;
  //     }
  //     fetch(api_url, {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(dataObj),
  //     })
  //       .then(response => response.json())
  //       .then(responseJson => {
  //         this._closeLoadingBox();
  //         if (responseJson.rc == rc_success) {
  //           console.log(responseJson);
  //           let allState = this.state;
  //           allState.issueDetail.accept_status = 1;
  //           allState.issueDetail.class = classValue;
  //           this.setState(allState);
  //         } else if (responseJson.rc == rc_token_expire) {
  //           this.props.navigation.navigate(LoginScreenName, {
  //             isTokenExpire: true,
  //           });
  //         } else {
  //           console.log(responseJson.message + ' ' + dataObj.toString());
  //         }
  //       })
  //       .catch(error => {
  //         this._closeLoadingBox();
  //         console.log(error);
  //       });
  //   } else {
  //     this.showAlert(youHaveNoPermissionToDoThi);
  //   }
  // };

  // showRejectIssueDialog = () => {
  //   if (this.state.issueDetail.can_accept == 1) {
  //     if (this.state.userInfo.type == 3) {
  //       Alert.alert(
  //         '',
  //         rejectConfirmForType3,
  //         [
  //           {
  //             text: rejectConfirmForType3ButtonYes,
  //             onPress: () => {
  //               this.callAcceptIssue(2);
  //             },
  //           },
  //           {
  //             text: rejectConfirmForType3ButtonNo,
  //             onPress: () => {
  //               this.setState({isRejectIssueDialogShown: true});
  //             },
  //             style: 'cancel',
  //           },
  //         ],
  //         {
  //           cancelable: true,
  //         },
  //       );
  //     } else {
  //       this.setState({isRejectIssueDialogShown: true});
  //     }
  //   } else {
  //     this.showAlert(youHaveNoPermissionToDoThi);
  //   }
  // };

  closeRejectIssueDialog = () => {
    this.setState({isRejectIssueDialogShown: false});
  };

  callRejectIssue = async () => {
    if (this.state.issueDetail.can_accept == 1) {
      Alert.alert('', rejectIssueMessage, [
        {
          text: rejectIssueButtonOk,
          onPress: () => {
            this._showLoadingBox();
            let dataObj = {
              request: rq_reject_issue,
              token: this.state.userInfo.token,
              issue_id: this.state.issueDetail.issue_id,
              reason: this.state.rejectIssueReason,
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
                  // console.log(responseJson);
                  let allState = this.state;
                  allState.isRejectIssueDialogShown = false;
                  allState.issueDetail.accept_status = 2;
                  this.setState(allState);
                } else if (responseJson.rc == rc_token_expire) {
                  this.props.navigation.navigate(LoginScreenName, {
                    isTokenExpire: true,
                  });
                } else {
                  alert(responseJson.message + ' ' + dataObj.toString());
                }
              })
              .catch(error => {
                this._closeLoadingBox();
                // console.log(error);
              });
          },
        },
        {
          text: rejectIssueButtonCancel,
          style: 'cancel',
        },
      ]);
    } else {
      this.showAlert(youHaveNoPermissionToDoThi);
    }
  };

  showAlert = message => {
    Alert.alert('', message, [
      {
        text: ok_text,
        style: 'cancel',
      },
    ]);
  };

  callApproveIssue = async () => {
    if (this.state.issueDetail.can_approve == 1) {
      this._showLoadingBox();
      let dataObj = {
        request: rq_approve_issue,
        token: this.state.userInfo.token,
        issue_id: this.state.issueDetail.issue_id,
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
            // console.log(responseJson);
            let allState = this.state;
            allState.issueDetail.approve_status = 1;
            this.setState(allState);
          } else if (responseJson.rc == rc_token_expire) {
            this.props.navigation.navigate(LoginScreenName, {
              isTokenExpire: true,
            });
          } else {
            alert(responseJson.message + ' ' + dataObj.toString());
          }
        })
        .catch(error => {
          this._closeLoadingBox();
          // console.log(error);
        });
    } else {
      this.showAlert(youHaveNoPermissionToDoThi);
    }
  };

  setPriorityIssue = async priorityValue => {
    // console.log(this.state.issueDetail.can_prioritize);
    if (this.state.issueDetail.can_prioritize == 1) {
      this._showLoadingBox();
      let dataObj = {
        request: rq_set_issue_priority,
        token: this.state.userInfo.token,
        issue_id: this.state.issueDetail.issue_id,
        priority: priorityValue,
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
            // console.log(responseJson);
            let allState = this.state;
            allState.issueDetail.priority = priorityValue;
            this.setState(allState);
          } else if (responseJson.rc == rc_token_expire) {
            this.props.navigation.navigate(LoginScreenName, {
              isTokenExpire: true,
            });
          } else {
            alert(responseJson.message + ' ' + dataObj.toString());
          }
        })
        .catch(error => {
          this._closeLoadingBox();
          // console.log(error);
        });
    } else {
      this.showAlert(youHaveNoPermissionToDoThi);
    }
  };

  setArrivalDate = async dateStr => {
    if (this.state.issueDetail.can_set_arrive_date == 1) {
      this._showLoadingBox();
      let dateStringToApi = dateStr + ':00';
      let dataObj = {
        request: rq_set_arrive_date,
        token: this.state.userInfo.token,
        issue_id: this.state.issueDetail.issue_id,
        arrive_date: dateStringToApi,
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
            console.log(responseJson);
            let allState = this.state;
            allState.issueDetail.arrive_date = dateStr;
            allState.issueDetail.status = responseJson.status;
            allState.issueDetail.progress_status = responseJson.progress_status;
            allState.issueDetail.sub_status = responseJson.sub_status;
            allState.issueDetail.can_accept = responseJson.can_accept;
            allState.issueDetail.can_prioritize = responseJson.can_prioritize;
            allState.issueDetail.can_approve = responseJson.can_approve;
            allState.issueDetail.can_set_arrive_date =
              responseJson.can_set_arrive_date;
            allState.issueDetail.can_edit_issue = responseJson.can_edit_issue;
            allState.issueDetail.can_change_status =
              responseJson.can_change_status;
            allState.issueDetail.status_options = responseJson.status_options;
            this.setState(allState);
          } else if (responseJson.rc == rc_token_expire) {
            this.props.navigation.navigate(LoginScreenName, {
              isTokenExpire: true,
            });
          } else {
            alert(responseJson.message + ' ' + dataObj.toString());
          }
        })
        .catch(error => {
          this._closeLoadingBox();
          // console.log(error);
        });
    } else {
      this.showAlert(youHaveNoPermissionToDoThi);
    }
  };

  showDisapproveDialog = () => {
    if (this.state.issueDetail.can_approve == 1) {
      this.setState({isDisapproveDialogShown: true});
    } else {
      this.showAlert(youHaveNoPermissionToDoThi);
    }
  };

  closeDisapproveDialog = () => {
    this.setState({isDisapproveDialogShown: false});
  };

  callDisapproveIssue = async () => {
    if (this.state.disapproveReason != '') {
      this._showLoadingBox();
      let dataObj = {
        request: rq_disapprove_issue,
        token: this.state.userInfo.token,
        issue_id: this.state.issueDetail.issue_id,
        reason: this.state.disapproveReason,
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
            // console.log(responseJson);
            let allState = this.state;
            allState.issueDetail.approve_status = 2;
            allState.isDisapproveDialogShown = false;
            this.setState(allState);
          } else if (responseJson.rc == rc_token_expire) {
            this.props.navigation.navigate(LoginScreenName, {
              isTokenExpire: true,
            });
          } else {
            let allState = this.state;
            allState.isDisapproveDialogShown = false;
            this.setState(allState, () => {
              alert(responseJson.message + ' ' + dataObj.toString());
            });
          }
        })
        .catch(error => {
          this._closeLoadingBox();
          // console.log(error);
        });
    } else {
      this.setState({showDisapproveReasonNotice: true});
    }
  };

  showStatusIssueSelectDialog = () => {
    this.setState({isStatusDialogShown: true});
  };

  closeStatusIssueSelectDialog = () => {
    this.setState({isStatusDialogShown: false});
  };

  updateStatusIssue = async statusValue => {
    // console.log('updateStatusIssue ' + statusValue);
    if (this.state.issueDetail.can_change_status == 1) {
      if (statusValue == 6) {
        Alert.alert('', closeIssueMessage, [
          {
            text: closeIssueButtonOk,
            onPress: () => {
              this.callUpdateStatusIssueApi(statusValue);
            },
          },
          {
            text: closeIssueButtonCancel,
            style: 'cancel',
          },
        ]);
      } else {
        this.callUpdateStatusIssueApi(statusValue);
      }
    } else {
      this.showAlert(youHaveNoPermissionToDoThi);
    }
    this.closeStatusIssueSelectDialog();
  };

  callUpdateStatusIssueApi = async statusValue => {
    this._showLoadingBox();
    let dataObj = {
      request: rq_set_issue_status,
      token: this.state.userInfo.token,
      issue_id: this.state.issueDetail.issue_id,
      status: parseInt(statusValue),
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
          // console.log(responseJson);
          let allState = this.state;
          allState.issueDetail.status = parseInt(statusValue);
          this.setState(allState);
        } else if (responseJson.rc == rc_token_expire) {
          this.props.navigation.navigate(LoginScreenName, {
            isTokenExpire: true,
          });
        } else {
          alert(responseJson.message + ' ' + dataObj.toString());
        }
      })
      .catch(error => {
        this._closeLoadingBox();
        // console.log(error);
      });
  };

  sendChatMessage = async () => {
    let dataObj = {
      request: rq_send_chat_message,
      token: this.state.userInfo.token,
      issue_id: this.state.issueDetail.issue_id,
    };
    if (this.state.composeText != '') {
      dataObj.message_text = this.state.composeText;
    }
    if (this.state.fileName != '') {
      dataObj.attachment = this.state.fileUri;
      dataObj.attachment_name = this.state.fileName;
      dataObj.is_attachment_image = this.state.isImageAttach;
    }
    // console.log(dataObj);
    this.createTempMessage(dataObj);
  };

  sendChatMessageToApi = async dataObj => {
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
        if (responseJson.rc == rc_success) {
          // console.log(responseJson);
          this.refreshIssueDetails(this.state.issueId);
          let allState = this.state;
          allState.fileUri = '';
          allState.fileName = '';
          allState.isImageAttach = false;
          allState.chatRefresh = !allState.chatRefresh;
          this.setState(allState, () => {
            setTimeout(() => {
              this.scrollView.current.scrollToEnd({animated: true});
            }, 1000);
          });
        } else if (responseJson.rc == rc_token_expire) {
          this.props.navigation.navigate(LoginScreenName, {
            isTokenExpire: true,
          });
        } else {
          alert(responseJson.message + ' ' + dataObj.toString());
        }
      })
      .catch(error => {
        this._closeLoadingBox();
        // console.log(error);
      });
  };

  createTempMessage = async dataObj => {
    // console.log(this.state.composeText);
    if (
      this.state.composeText != '' ||
      (typeof dataObj.attachment !== 'undefined' && dataObj.attachment != '')
    ) {
      let displayNameInChat =
        this.state.userInfo.first_name +
        ' (' +
        this.state.userInfo.user_type_name +
        ')';
      let allState = this.state;
      let colorString = this.getUsernameColor(displayNameInChat);
      // console.log(colorString);
      let chatItem = {
        chat_message_id: -1,
        user_name: displayNameInChat,
        user_color: colorString,
        created_on: moment.utc().format('YYYY-MM-DD HH:mm'),
        chat_message_type: 1,
        chat_message_data: {},
        is_me: 1,
      };
      if (typeof dataObj.attachment === 'undefined') {
        dataObj.attachment = '';
      }
      if (typeof dataObj.attachment_name === 'undefined') {
        dataObj.attachment_name = '';
      }
      if (dataObj.message_text != '') {
        if (dataObj.attachment != '') {
          if (dataObj.is_attachment_image) {
            chatItem.chat_message_type = 2;
            chatItem.chat_message_data = {
              text: dataObj.message_text,
              file: dataObj.attachment,
              file_name: dataObj.attachment_name,
            };
          } else {
            chatItem.chat_message_type = 4;
            chatItem.chat_message_data = {
              text: dataObj.message_text,
              file: dataObj.attachment,
              file_name: dataObj.attachment_name,
            };
          }
        } else {
          chatItem.chat_message_type = 1;
          chatItem.chat_message_data = {
            text: dataObj.message_text,
          };
        }
      } else {
        if (dataObj.is_attachment_image) {
          chatItem.chat_message_type = 3;
        } else {
          chatItem.chat_message_type = 4;
        }
        chatItem.chat_message_data = {
          file: dataObj.attachment,
          file_name: dataObj.attachment_name,
        };
      }
      allState.issueDetail.chat_messages.push(chatItem);
      allState.composeText = '';
      allState.fileName = '';
      this.setState(allState, () => {
        setTimeout(() => {
          this.scrollView.current.scrollToEnd({animated: true});
          this.sendChatMessageToApi(dataObj);
        }, 500);
      });
    }
  };

  refreshIssueDetails = async issueId => {
    let dataObj = {
      request: rq_get_issue,
      token: this.state.userInfo.token,
      issue_id: issueId,
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
        // console.log(responseJson);
        if (responseJson.rc == rc_success) {
          // console.log(responseJson.chat_messages);
          let allState = this.state;
          allState.issueDetail = responseJson;
          // create user color list
          allState.userColorList = this.getUserColorList(
            allState.issueDetail.chat_messages,
          );
          for (let i = 0; i < allState.issueDetail.chat_messages.length; i++) {
            let colorString = this.getUsernameColor(
              allState.issueDetail.chat_messages[i]['user_name'],
            );
            // console.log(colorString);
            allState.issueDetail.chat_messages[i]['user_color'] = colorString;
          }
          // console.log(allState.issueDetail.chat_messages);
          this.setState(allState);
        } else if (responseJson.rc == rc_token_expire) {
          this.props.navigation.navigate(LoginScreenName, {
            isTokenExpire: true,
          });
        } else {
          // console.log(responseJson.message);
        }
        this.scrollView.current.scrollToEnd({animated: true});
      })
      .catch(error => {
        this._closeLoadingBox();
        console.log(error + ' - getIssueDetails');
      });
  };

  measureSectionTopDistance() {
    this.issueDetailSection.current.measure((fx, fy, width, height, px, py) => {
      // console.log('Component width is: ' + width);
      // console.log('Component height is: ' + height);
      // console.log('X offset to frame: ' + fx);
      // console.log('Y offset to frame: ' + fy);
      // console.log('X offset to page: ' + px);
      // console.log('Y offset to page: ' + py);
    });
  }

  displayChatContent(type, messageDataObj) {
    if (type == 1) {
      return (
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            alignSelf: 'flex-start',
            marginTop: 10,
            width: screenWidth * 0.6,
          }}>
          <Hyperlink
            linkStyle={{
              color: c_status_accept,
              textDecorationLine: 'underline',
            }}
            linkDefault={true}>
            <Text style={[mStyle.textNormal, {color: '#000000'}]}>
              {messageDataObj.text}
            </Text>
          </Hyperlink>
        </View>
      );
    } else if (type == 2) {
      return (
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            alignSelf: 'flex-start',
            marginTop: 10,
            width: screenWidth * 0.6,
          }}>
          <Hyperlink
            linkStyle={{
              color: c_status_accept,
              textDecorationLine: 'underline',
            }}
            linkDefault={true}>
            <Text style={[mStyle.textNormal, {color: '#000000'}]}>
              {messageDataObj.text}
            </Text>
          </Hyperlink>
          <TouchableOpacity
            onPress={() => {
              this.openFileMedia(messageDataObj.file, true);
            }}
            style={{marginTop: 10, alignSelf: 'center'}}>
            <Image
              source={{uri: messageDataObj.file}}
              resizeMode="contain"
              style={{width: screenWidth * 0.6, height: screenWidth * 0.4}}
            />
          </TouchableOpacity>
        </View>
      );
    } else if (type == 3) {
      return (
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            alignSelf: 'flex-start',
            marginTop: 10,
            width: screenWidth * 0.6,
          }}>
          <TouchableOpacity
            onPress={() => {
              this.openFileMedia(messageDataObj.file, true);
            }}
            style={{marginTop: 10, alignSelf: 'center'}}>
            <Image
              source={{uri: messageDataObj.file}}
              resizeMode="contain"
              style={{width: screenWidth * 0.6, height: screenWidth * 0.4}}
            />
          </TouchableOpacity>
        </View>
      );
    } else if (type == 4) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.openFileMedia(messageDataObj.file, false);
          }}
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            alignSelf: 'flex-start',
            marginTop: 10,
            width: screenWidth * 0.6,
          }}>
          <Image
            source={require('../image/icon_file_attach.png')}
            resizeMode="contain"
            style={{
              width: screenWidth * 0.4,
              height: screenWidth * 0.4 * (245 / 229),
              marginTop: 10,
              alignSelf: 'center',
            }}
          />
          <Hyperlink
            linkStyle={{
              color: c_status_accept,
              textDecorationLine: 'underline',
            }}
            linkDefault={true}>
            <Text style={[mStyle.textNormal, {color: '#000000'}]}>
              {messageDataObj.file_name}
            </Text>
          </Hyperlink>
        </TouchableOpacity>
      );
    }
  }

  displayStatusProgress() {
    let mProgress = this.state.issueDetail.progress_status;
    // mProgress = 4;
    let acceptDateInView = '';
    let acceptTimeInView = '';
    if (
      this.state.issueDetail.accept_date != null &&
      this.state.issueDetail.accept_date != ''
    ) {
      acceptDateInView = moment
        .utc(this.state.issueDetail.accept_date)
        .local()
        .format('DD/MM/YYYY');
      acceptTimeInView = moment
        .utc(this.state.issueDetail.accept_date)
        .local()
        .format('HH:mm');
    }
    if (mProgress == 1) {
      return (
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}></View>
            <View
              style={[
                mStyle.statusCircle,
                {backgroundColor: c_status_accept},
              ]}></View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: c_status_line,
              }}></View>
            <View
              style={[
                mStyle.statusCircle,
                {backgroundColor: c_status_done},
              ]}></View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: c_status_line,
              }}></View>
            <View
              style={[
                mStyle.statusCircle,
                {backgroundColor: c_status_done},
              ]}></View>
            <View style={{flex: 1}}></View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 5}}>
            <View style={{width: screenWidth * 0.045}}></View>
            <View
              style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
              <Text style={[mStyle.textProgressStatusBlue]}>
                {statusAccepted}
              </Text>
              <Text
                style={[
                  mStyle.textTime,
                  {color: c_status_done, textAlign: 'center'},
                ]}>
                {acceptDateInView}
                {'\n'}
                {acceptTimeInView}
              </Text>
            </View>
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <Text style={[mStyle.textProgressStatusGray]}>
                {statusInProgress}
              </Text>
              <Text style={[mStyle.textTime, {color: c_status_done}]}>
                {this.state.issueDetail.sub_status != null
                  ? this.state.issueDetail.sub_status
                  : ''}
              </Text>
            </View>
            <View
              style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
              <Text style={[mStyle.textProgressStatusGray]}>{statusDone}</Text>
            </View>
            <View style={{width: screenWidth * 0.045}}></View>
          </View>
        </View>
      );
    } else if (mProgress == 2) {
      return (
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}></View>
            <View
              style={[mStyle.statusCircle, {backgroundColor: c_status_accept}]}>
              <Image
                source={require('../image/icon_ok_white.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.03,
                  height: screenWidth * 0.03 * (19 / 21),
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: c_status_line,
              }}></View>
            <View
              style={[
                mStyle.statusCircle,
                {backgroundColor: c_status_accept},
              ]}></View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: c_status_line,
              }}></View>
            <View
              style={[
                mStyle.statusCircle,
                {backgroundColor: c_status_done},
              ]}></View>
            <View style={{flex: 1}}></View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 5}}>
            <View style={{width: screenWidth * 0.045}}></View>
            <View
              style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
              <Text style={[mStyle.textProgressStatusV]}>{statusAccepted}</Text>
              <Text
                style={[
                  mStyle.textTime,
                  {color: c_status_done, textAlign: 'center'},
                ]}>
                {acceptDateInView}
                {'\n'}
                {acceptTimeInView}
              </Text>
            </View>
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <Text style={[mStyle.textProgressStatusBlue]}>
                {statusInProgress}
              </Text>
              <Text style={[mStyle.textTime, {color: c_status_done}]}>
                {this.state.issueDetail.sub_status}
              </Text>
            </View>
            <View
              style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
              <Text style={[mStyle.textProgressStatusGray]}>{statusDone}</Text>
            </View>
            <View style={{width: screenWidth * 0.045}}></View>
          </View>
        </View>
      );
    } else if (mProgress == 3) {
      return (
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}></View>
            <View
              style={[mStyle.statusCircle, {backgroundColor: c_status_accept}]}>
              <Image
                source={require('../image/icon_ok_white.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.03,
                  height: screenWidth * 0.03 * (19 / 21),
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: c_status_line,
              }}></View>
            <View
              style={[mStyle.statusCircle, {backgroundColor: c_status_accept}]}>
              <Image
                source={require('../image/icon_ok_white.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.03,
                  height: screenWidth * 0.03 * (19 / 21),
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: c_status_line,
              }}></View>
            <View
              style={[
                mStyle.statusCircle,
                {backgroundColor: c_status_accept},
              ]}></View>
            <View style={{flex: 1}}></View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 5}}>
            <View style={{width: screenWidth * 0.045}}></View>
            <View
              style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
              <Text style={[mStyle.textProgressStatusV]}>{statusAccepted}</Text>
              <Text
                style={[
                  mStyle.textTime,
                  {color: c_status_done, textAlign: 'center'},
                ]}>
                {acceptDateInView}
                {'\n'}
                {acceptTimeInView}
              </Text>
            </View>
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <Text style={[mStyle.textProgressStatusV]}>
                {statusInProgress}
              </Text>
            </View>
            <View
              style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
              <Text style={[mStyle.textProgressStatusBlue]}>{statusDone}</Text>
              <Text style={[mStyle.textTime, {color: c_status_done}]}>
                {this.state.issueDetail.sub_status}
              </Text>
            </View>
            <View style={{width: screenWidth * 0.045}}></View>
          </View>
        </View>
      );
    } else if (mProgress == 4) {
      return (
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}></View>
            <View
              style={[mStyle.statusCircle, {backgroundColor: c_status_accept}]}>
              <Image
                source={require('../image/icon_ok_white.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.03,
                  height: screenWidth * 0.03 * (19 / 21),
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: c_status_line,
              }}></View>
            <View
              style={[mStyle.statusCircle, {backgroundColor: c_status_accept}]}>
              <Image
                source={require('../image/icon_ok_white.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.03,
                  height: screenWidth * 0.03 * (19 / 21),
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: c_status_line,
              }}></View>
            <View
              style={[mStyle.statusCircle, {backgroundColor: c_status_accept}]}>
              <Image
                source={require('../image/icon_ok_white.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.03,
                  height: screenWidth * 0.03 * (19 / 21),
                }}
              />
            </View>
            <View style={{flex: 1}}></View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 5}}>
            <View style={{width: screenWidth * 0.045}}></View>
            <View
              style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
              <Text style={[mStyle.textProgressStatusV]}>{statusAccepted}</Text>
              <Text
                style={[
                  mStyle.textTime,
                  {color: c_status_done, textAlign: 'center'},
                ]}>
                {acceptDateInView}
                {'\n'}
                {acceptTimeInView}
              </Text>
            </View>
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              <Text style={[mStyle.textProgressStatusV]}>
                {statusInProgress}
              </Text>
            </View>
            <View
              style={{flexDirection: 'column', alignItems: 'center', flex: 1}}>
              <Text style={[mStyle.textProgressStatusV]}>{statusDone}</Text>
              <Text style={[mStyle.textTime, {color: c_status_done}]}>
                {this.state.issueDetail.sub_status}
              </Text>
            </View>
            <View style={{width: screenWidth * 0.045}}></View>
          </View>
        </View>
      );
    }
  }

  displayMediaList() {
    let mediaList = this.state.issueDetail.media;
    if (mediaList != null) {
      let mediaItemList = [];
      for (let i = 0; i < mediaList.length; i++) {
        let mediaItem = mediaList[i];
        if (mediaItem.is_image == 1) {
          mediaItemList.push(
            <TouchableOpacity
              key={i}
              onPress={() => {
                this.openFileMedia(mediaItem.file, true);
              }}
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginEnd: 10,
              }}>
              <Image
                source={{uri: mediaItem.file}}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.2,
                  height: screenWidth * 0.2,
                  marginTop: 5,
                }}
              />
              <Text
                numberOfLines={1}
                style={[
                  mStyle.textNormal,
                  {width: screenWidth * 0.2, textAlign: 'right'},
                ]}>
                {mediaItem.file_name}
              </Text>
            </TouchableOpacity>,
          );
        } else {
          mediaItemList.push(
            <TouchableOpacity
              key={i}
              onPress={() => {
                this.openFileMedia(mediaItem.file, false);
              }}
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginEnd: 10,
              }}>
              <Image
                source={require('../image/icon_file_attach.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.2 * (229 / 245),
                  height: screenWidth * 0.2,
                  marginTop: 5,
                }}
              />
              <Text
                numberOfLines={1}
                style={[
                  mStyle.textNormal,
                  {width: screenWidth * 0.2, textAlign: 'right'},
                ]}>
                {mediaItem.file_name}
              </Text>
            </TouchableOpacity>,
          );
        }
      }
      return mediaItemList;
    }
  }

  getStatusListSelector() {
    if (this.state.issueDetail.status_options != null) {
      let selectorList = [];
      for (let i = 0; i < this.state.issueDetail.status_options.length; i++) {
        let key = this.state.issueDetail.status_options[i];
        selectorList.push(
          <Picker.Item
            label={this.state.appConfig.issue_statuses[key]['name']}
            value={key}
          />,
        );
      }
      return selectorList;
    }
  }

  getStatusIssueName = key => {
    if (
      this.state.appConfig.issue_statuses != null &&
      this.state.appConfig.issue_statuses[key] != null
    ) {
      return this.state.appConfig.issue_statuses[key]['name'];
    } else {
      return '';
    }
  };

  comeToEditIssueScreen() {
    if (this.state.issueDetail.can_edit_issue == 1) {
      let issueDetail = this.state.issueDetail;
      issueDetail.media = [];
      issueDetail.chat_messages = [];
      this.props.navigation.navigate(EditIssueScreenName, {
        issue_id: this.state.issueId,
        command_name: this.state.issueDetail.command_name,
        unit_number: this.state.issueDetail.unit_number,
        title: this.state.issueDetail.title,
        device_type_id: this.state.issueDetail.device_type_id,
        device_id: this.state.issueDetail.device_id,
        issue_type_id: this.state.issueDetail.issue_type_id,
        serial_number: this.state.issueDetail.serial_number,
      });
    } else {
      alert(youHaveNoPermissionToDoThi);
    }
  }

  openFileMedia = (url, isImage) => {
    if (isImage) {
      let allState = this.state;
      let mediaList = this.state.issueDetail.media;
      allState.isViewFullImage = true;
      allState.images = [
        // {
        //     url: url
        // }
      ];
      allState.startPosImageViewFull = 0;
      for (let i = 0; i < mediaList.length; i++) {
        if (mediaList[i].is_image) {
          let item = {
            url: mediaList[i].file,
          };
          allState.images.push(item);
          if (mediaList[i].file == url) {
            allState.startPosImageViewFull = i;
          }
        }
      }
      this.setState(allState);
    } else {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // console.log("Don't know how to open URI: " + this.props.url);
        }
      });
    }
  };

  closeImageViewFull = () => {
    let allState = this.state;
    allState.isViewFullImage = false;
    allState.images = [];
    this.setState(allState);
  };

  scrollToTop() {
    let allState = this.state;
    allState.showIssueDetailsSection = false;
    allState.showMediaSection = false;
    this.setState(allState, () => {
      this.scrollView.current.scrollTo(0);
    });
  }

  displayStatusContent() {
    if (this.state.userInfo.type != 2) {
      return (
        <View style={{flexDirection: 'column'}}>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <Text style={[mStyle.textInfoLabel, {flex: 1}]}>
              {urgencyLabel}
            </Text>
            <View style={{flexDirection: 'row', flex: 2, alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  this.setPriorityIssue(1);
                }}>
                <Text
                  style={[
                    this.state.issueDetail.priority == 1
                      ? mStyle.priorityCircleSelected
                      : mStyle.priorityCircleNormal,
                    {backgroundColor: c_priority_immediate},
                  ]}>
                  1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.setPriorityIssue(2);
                }}>
                <Text
                  style={[
                    this.state.issueDetail.priority == 2
                      ? mStyle.priorityCircleSelected
                      : mStyle.priorityCircleNormal,
                    {backgroundColor: c_priority_high},
                  ]}>
                  2
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.setPriorityIssue(3);
                }}>
                <Text
                  style={[
                    this.state.issueDetail.priority == 3
                      ? mStyle.priorityCircleSelected
                      : mStyle.priorityCircleNormal,
                    {backgroundColor: c_priority_medium},
                  ]}>
                  3
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.setPriorityIssue(4);
                }}>
                <Text
                  style={[
                    this.state.issueDetail.priority == 4
                      ? mStyle.priorityCircleSelected
                      : mStyle.priorityCircleNormal,
                    {backgroundColor: c_priority_low},
                  ]}>
                  4
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  mStyle.textBold,
                  {
                    color: '$000000',
                    flex: 1,
                    fontSize: 16,
                    textAlign: 'center',
                  },
                ]}>
                {this.state.issueDetail.priority == 1
                  ? priorityImmediate
                  : this.state.issueDetail.priority == 2
                  ? priorityHigh
                  : this.state.issueDetail.priority == 3
                  ? priorityMedium
                  : this.state.issueDetail.priority == 4
                  ? priorityLow
                  : ''}
              </Text>
            </View>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <Text style={[mStyle.textInfoLabel, {flex: 1}]}>
              {idfApprovalLabel}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flex: 2,
                backgroundColor: '#ffffff',
                padding: 5,
                alignItems: 'center',
                borderColor: c_select_box_border,
                borderWidth: 1,
                borderRadius: 5,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.callApproveIssue();
                }}
                style={{flex: 1}}>
                <Text
                  style={[
                    this.state.issueDetail.approve_status == 1
                      ? mStyle.textIdfSelected
                      : mStyle.textIdfUnselected,
                    {flex: 1},
                  ]}>
                  {idfApproved}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.showDisapproveDialog();
                  // this.callDisapproveIssue();
                }}
                style={{flex: 1}}>
                <Text
                  style={[
                    this.state.issueDetail.approve_status == 2
                      ? mStyle.textIdfSelected
                      : mStyle.textIdfUnselected,
                    {flex: 1},
                  ]}>
                  {idfNotApproved}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <Text style={[mStyle.textInfoLabel, {flex: 1}]}>
              {sectionStatusTitle}
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.showStatusIssueSelectDialog();
              }}
              style={{
                flexDirection: 'row',
                flex: 2,
                backgroundColor: '#ffffff',
                padding: 5,
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: c_select_box_border,
                borderWidth: 1,
                borderRadius: 5,
              }}>
              <Text
                style={[
                  mStyle.textInfoLabel,
                  {
                    flex: 1,
                    margin: 5,
                    alignSelf: 'center',
                    flexDirection: 'row-reverse',
                  },
                ]}>
                {this.getStatusIssueName(this.state.issueDetail.status)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  getArrivalDateDefaultText = () => {
    if (this.state.userInfo.type == 3 || this.state.userInfo.type == 6) {
      return arrivalDateDefaulText;
    } else {
      return arrivalDateDefaultTextWaiting;
    }
  };

  render() {
    return (
      <KeyboardAvoidingView
        // behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}>
        <View style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
          <ImageBackground
            source={require('../image/bg_header_top.png')}
            resizeMode="cover"
            style={{
              width: screenWidth,
              height: screenWidth * (117 / 768),
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
                marginBottom: 10,
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
                  {color: '#ffffff', textAlign: 'center', flex: 1},
                ]}>
                {issueDetailTitle}
              </Text>
              <View style={{width: screenWidth * 0.05}}></View>
            </View>
          </ImageBackground>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: screenWidth,
              padding: 5,
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
          <ScrollView
            ref={this.scrollView}
            onScroll={({nativeEvent}) => {
              // console.log(nativeEvent.contentOffset.y/screenWidth);
              // if (nativeEvent.contentOffset.y/screenWidth )
              let scrollDif = screenWidth + 30;
              if (this.state.userInfo.type == 2) {
                scrollDif = screenWidth * 0.48 + 30;
              }
              if (
                nativeEvent.contentOffset.y <= scrollDif &&
                this.state.isShowStickyLabel
              ) {
                this.setState({isShowStickyLabel: false});
              } else if (
                nativeEvent.contentOffset.y > scrollDif + 10 &&
                !this.state.isShowStickyLabel
              ) {
                this.setState({isShowStickyLabel: true});
              }
            }}
            style={{flex: 1, width: screenWidth, backgroundColor: '#ffffff'}}>
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
              {this.displayStatusProgress()}
            </ImageBackground>
            <View
              style={{
                marginTop: 10,
                marginStart: 10,
                marginEnd: 10,
                padding: 10,
                backgroundColor: c_background_issue_item,
                flexDirection: 'column',
                display: this.state.showIssueProgressSection ? 'flex' : 'none',
              }}>
              {this.displayStatusContent()}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                <Text style={[mStyle.textInfoLabel, {flex: 1}]}>
                  {arrivalDate}
                </Text>
                <TouchableOpacity
                  activeOpacity={
                    this.state.userInfo.type == 3 ||
                    this.state.userInfo.type == 6
                      ? 0.5
                      : 1
                  }
                  onPress={() => {
                    if (
                      this.state.userInfo.type == 3 ||
                      this.state.userInfo.type == 6
                    ) {
                      this.showDatePicker();
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    flex: 2,
                    backgroundColor: '#ffffff',
                    padding: 5,
                    alignItems: 'center',
                    borderColor: c_select_box_border,
                    borderWidth: 1,
                    borderRadius: 5,
                  }}>
                  <Image
                    source={require('../image/icon_calendar.png')}
                    resizeMode="cover"
                    style={{
                      width: screenWidth * 0.08,
                      height: screenWidth * 0.08 * (79 / 87),
                      marginTop: 5,
                      marginBottom: 5,
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      mStyle.textInfoLabel,
                      {
                        flex: 1,
                        marginStart: 5,
                        writingDirection: 'rtl',
                        textAlign: 'right',
                      },
                    ]}>
                    {this.state.issueDetail.arrive_date != null
                      ? moment
                          .utc(this.state.issueDetail.arrive_date)
                          .local()
                          .format('DD/MM/YYYY HH:mm')
                      : this.getArrivalDateDefaultText()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              ref={this.issueDetailSection}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <Image
                source={require('../image/icon_arrow_left_blue.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.017,
                  height: screenWidth * 0.017 * (24 / 14),
                  marginTop: 7,
                  transform: [
                    {
                      rotate: this.state.showIssueDetailsSection
                        ? '-90deg'
                        : '0deg',
                    },
                  ],
                }}
              />
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  marginStart: 5,
                  justifyContent: 'flex-start',
                  alignItems: 'stretch',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      showIssueDetailsSection:
                        !this.state.showIssueDetailsSection,
                    });
                  }}
                  style={{flex: 1}}>
                  <Text style={[mStyle.textSectionLabel, {flex: 1}]}>
                    {issueDetail}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 20,
                    display: this.state.showIssueDetailsSection
                      ? 'flex'
                      : 'none',
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 1,
                      alignItems: 'flex-start',
                      marginEnd: 5,
                    }}>
                    <Text style={[mStyle.textNormal]}>{deviceType}</Text>
                    <Text style={[mStyle.textBold]}>
                      {this.state.issueDetail.device_type_name}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 1,
                      alignItems: 'flex-start',
                    }}>
                    <Text style={[mStyle.textNormal]}>{deviceName}</Text>
                    <Text style={[mStyle.textBold]}>
                      {this.state.issueDetail.device_name}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                    display: this.state.showIssueDetailsSection
                      ? 'flex'
                      : 'none',
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 1,
                      alignItems: 'flex-start',
                      marginEnd: 5,
                    }}>
                    <Text style={[mStyle.textNormal]}>{serialNumber}</Text>
                    <Text style={[mStyle.textBold]}>
                      {this.state.issueDetail.issue_type_name}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 1,
                      alignItems: 'flex-start',
                    }}>
                    <Text style={[mStyle.textNormal]}>{issueType}</Text>
                    <Text style={[mStyle.textBold]}>
                      {this.state.issueDetail.serial_number}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                    display: this.state.showIssueDetailsSection
                      ? 'flex'
                      : 'none',
                  }}>
                  <View
                    style={{
                      flexDirection: 'column',
                      flex: 1,
                      alignItems: 'flex-start',
                    }}>
                    <Text style={[mStyle.textNormal]}>{locationIssues}</Text>
                    <Text style={[mStyle.textBold]}>
                      {this.state.issueDetail.place_description}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                    display: this.state.showIssueDetailsSection
                      ? 'flex'
                      : 'none',
                  }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#ff0000',
                      flex: 1,
                      paddingHorizontal: 6,
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                      marginRight: 10,
                      display: this.state.issueDetail.condition_satatus
                      ? 'flex'
                      : 'none',
                    }}>
                    <Text style={{color: '#fff'}}>
                      {conditon}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#ff9933',
                      flex: 1,
                      paddingHorizontal: 6,
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                      display: this.state.issueDetail.worning
                      ? 'flex'
                      : 'none',
                    }}>
                    <Text style={{color: '#fff'}}>
                      {warning}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.comeToEditIssueScreen();
                }}>
                <Image
                  source={require('../image/icon_pencil_black_border.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.06,
                    height: screenWidth * 0.06,
                  }}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: screenWidth,
                height: 1,
                backgroundColor: c_bg_section_line,
              }}></View>
            <View
              ref={this.mediaSection}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: 10,
              }}>
              <Image
                source={require('../image/icon_arrow_left_blue.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.017,
                  height: screenWidth * 0.017 * (24 / 14),
                  marginTop: 7,
                  transform: [
                    {rotate: this.state.showMediaSection ? '-90deg' : '0deg'},
                  ],
                }}
              />
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  marginStart: 5,
                  justifyContent: 'flex-start',
                  alignItems: 'stretch',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    let allState = this.state;
                    allState.showMediaSection = !allState.showMediaSection;
                    this.setState(allState);
                  }}>
                  <Text style={[mStyle.textSectionLabel, {flex: 1}]}>
                    {mediaSection}
                  </Text>
                </TouchableOpacity>
                <ScrollView
                  horizontal={true}
                  style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    display: this.state.showMediaSection ? 'flex' : 'none',
                  }}>
                  {this.displayMediaList()}
                </ScrollView>
              </View>
            </View>
            <View
              style={{
                width: screenWidth,
                height: 1,
                backgroundColor: c_bg_section_line,
              }}></View>
            <View
              ref={this.chatSection}
              style={{
                width: screenWidth,
                backgroundColor: c_background_issue_item,
                flexDirection: 'column',
              }}>
              <TouchableOpacity
                onPress={() => {
                  let allState = this.state;
                  allState.showChatSection = !allState.showChatSection;
                  this.setState(allState);
                }}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: 10,
                }}>
                <Image
                  source={require('../image/icon_arrow_left_blue.png')}
                  resizeMode="cover"
                  style={{
                    width: screenWidth * 0.017,
                    height: screenWidth * 0.017 * (24 / 14),
                    marginTop: 7,
                    transform: [
                      {rotate: this.state.showChatSection ? '-90deg' : '0deg'},
                    ],
                  }}
                />
                <Text
                  style={[mStyle.textSectionLabel, {flex: 1, marginStart: 5}]}>
                  {chatSection}
                </Text>
              </TouchableOpacity>
              <View style={{flexDirection: 'column'}}>
                <FlatList
                  style={{
                    display: this.state.showChatSection ? 'flex' : 'none',
                  }}
                  extraData={this.state.chatRefresh}
                  data={this.state.issueDetail.chat_messages}
                  onContentSizeChange={(contentWidth, contentHeight) => {
                    if (
                      this.state.issueStatus != inNew ||
                      !this.state.isFirstTimeLoad
                    ) {
                      this.scrollView.current.scrollToEnd({animated: true});
                    }
                  }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({item, index}) => {
                    let chatData = item.chat_message_data;
                    let canView = false;
                    let tempDateStr = '';
                    if (tempDate == '') {
                      canView = true;
                      tempDate = item.created_on;
                      tempDateStr = moment
                        .utc(tempDate)
                        .local()
                        .format(format_date_in_chat);
                    } else {
                      tempDateStr = moment
                        .utc(tempDate)
                        .local()
                        .format(format_date_in_chat);
                      let currentDateStr = moment
                        .utc(item.created_on)
                        .local()
                        .format(format_date_in_chat);
                      if (tempDateStr != currentDateStr) {
                        canView = true;
                        tempDateStr = currentDateStr;
                        tempDate = item.created_on;
                      }
                    }
                    let rowView = [];
                    if (canView) {
                      rowView.push(
                        <View
                          key={tempDate}
                          style={{
                            backgroundColor: '#ffffff',
                            paddingTop: 5,
                            paddingBottom: 5,
                            paddingStart: 15,
                            paddingEnd: 15,
                            marginTop: 10,
                            borderRadius: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignSelf: 'center',
                          }}>
                          <Text style={[mStyle.textSectionLabel]}>
                            {tempDateStr}
                          </Text>
                        </View>,
                      );
                    }
                    if (item.chat_message_type == 5) {
                      rowView.push(
                        <View
                          key={item.chat_message_id}
                          style={{
                            width: screenWidth,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 20,
                          }}>
                          <View
                            style={{
                              flex: 1,
                              height: 1,
                              backgroundColor: c_bg_section_line,
                            }}></View>
                          <Text
                            style={[
                              mStyle.textNormal,
                              {
                                color: '#ffffff',
                                paddingStart: 20,
                                paddingEnd: 20,
                                paddingTop: 2,
                                paddingBottom: 2,
                                backgroundColor:
                                  this.state.appConfig.issue_statuses[
                                    chatData.status
                                  ]['color'],
                                borderRadius: 5,
                              },
                            ]}>
                            {
                              this.state.appConfig.issue_statuses[
                                chatData.status
                              ]['name']
                            }
                          </Text>
                          <View
                            style={{
                              flex: 1,
                              height: 1,
                              backgroundColor: c_bg_section_line,
                            }}></View>
                        </View>,
                      );
                    } else {
                      if (item.is_me == 1) {
                        // is from user
                        rowView.push(
                          <View
                            key={item.chat_message_id}
                            style={{flexDirection: 'row', padding: 5}}>
                            <View style={[mStyle.triangleCornerStart]}></View>
                            <View
                              style={{
                                flexDirection: 'column',
                                width: screenWidth * 0.8,
                                alignItems: 'flex-start',
                                alignSelf: 'flex-start',
                                backgroundColor: '#ffffff',
                                borderTopEndRadius: 8,
                                borderBottomEndRadius: 8,
                                borderBottomStartRadius: 8,
                                padding: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
                                <Text
                                  style={[
                                    mStyle.textNormal,
                                    {color: item.user_color},
                                  ]}>
                                  {item.user_name}
                                </Text>
                                <View style={{flex: 1}}></View>
                                <Text
                                  style={[
                                    mStyle.textNormal,
                                    {color: c_grey_text},
                                  ]}>
                                  {moment
                                    .utc(item.created_on)
                                    .local()
                                    .format('HH:mm')}
                                </Text>
                              </View>
                              {this.displayChatContent(
                                item.chat_message_type,
                                chatData,
                              )}
                            </View>
                          </View>,
                        );
                      } else {
                        rowView.push(
                          <View
                            style={{
                              flexDirection: 'row',
                              padding: 5,
                              justifyContent: 'flex-end',
                              marginBottom: 10,
                            }}
                            key={item.chat_message_id}>
                            <View
                              style={{
                                flexDirection: 'column',
                                width: screenWidth * 0.8,
                                alignItems: 'flex-end',
                                alignSelf: 'flex-end',
                                backgroundColor: '#ffffff',
                                borderTopStartRadius: 8,
                                borderBottomEndRadius: 8,
                                borderBottomStartRadius: 8,
                                padding: 10,
                              }}>
                              <View style={{flexDirection: 'row'}}>
                                <Text
                                  style={[
                                    mStyle.textNormal,
                                    {color: item.user_color},
                                  ]}>
                                  {item.user_name}
                                </Text>
                                <View style={{flex: 1}}></View>
                                <Text
                                  style={[
                                    mStyle.textNormal,
                                    {color: c_grey_text},
                                  ]}>
                                  {moment
                                    .utc(item.created_on)
                                    .local()
                                    .format('HH:mm')}
                                </Text>
                              </View>
                              {this.displayChatContent(
                                item.chat_message_type,
                                chatData,
                              )}
                            </View>
                            <View style={[mStyle.triangleCornerEnd]}></View>
                          </View>,
                        );
                      }
                    }
                    return rowView;
                  }}
                  keyExtractor={item => item.chat_message_id}
                />
                {/* <ScrollView
                  style={{
                    display: this.state.showChatSection ? 'flex' : 'none',
                  }}
                  onContentSizeChange={(contentWidth, contentHeight) => {
                    if (
                      this.state.issueStatus != inNew ||
                      !this.state.isFirstTimeLoad
                    ) {
                      this.scrollView.current.scrollToEnd({animated: true});
                    }
                  }}
                  showsVerticalScrollIndicator={false}>
                  {Object.keys(this.state.issueDetail.chat_messages).forEach(
                    (key, index) => {
                      let chatData = item.chat_message_data;
                      let canView = false;
                      let tempDateStr = '';
                      if (tempDate == '') {
                        canView = true;
                        tempDate = item.created_on;
                        tempDateStr = moment
                          .utc(tempDate)
                          .local()
                          .format(format_date_in_chat);
                      } else {
                        tempDateStr = moment
                          .utc(tempDate)
                          .local()
                          .format(format_date_in_chat);
                        let currentDateStr = moment
                          .utc(item.created_on)
                          .local()
                          .format(format_date_in_chat);
                        if (tempDateStr != currentDateStr) {
                          canView = true;
                          tempDateStr = currentDateStr;
                          tempDate = item.created_on;
                        }
                      }
                      let rowView = [];
                      if (canView) {
                        rowView.push(
                          <View
                            style={{
                              backgroundColor: '#ffffff',
                              paddingTop: 5,
                              paddingBottom: 5,
                              paddingStart: 15,
                              paddingEnd: 15,
                              marginTop: 10,
                              borderRadius: 10,
                              flexDirection: 'row',
                              alignItems: 'center',
                              alignSelf: 'center',
                            }}>
                            <Text style={[mStyle.textSectionLabel]}>
                              {tempDateStr}
                            </Text>
                          </View>,
                        );
                      }
                      if (item.chat_message_type == 5) {
                        rowView.push(
                          <View
                            style={{
                              width: screenWidth,
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginTop: 20,
                            }}>
                            <View
                              style={{
                                flex: 1,
                                height: 1,
                                backgroundColor: c_bg_section_line,
                              }}></View>
                            <Text
                              style={[
                                mStyle.textNormal,
                                {
                                  color: '#ffffff',
                                  paddingStart: 20,
                                  paddingEnd: 20,
                                  paddingTop: 2,
                                  paddingBottom: 2,
                                  backgroundColor:
                                    this.state.appConfig.issue_statuses[
                                      chatData.status
                                    ]['color'],
                                  borderRadius: 5,
                                },
                              ]}>
                              {
                                this.state.appConfig.issue_statuses[
                                  chatData.status
                                ]['name']
                              }
                            </Text>
                            <View
                              style={{
                                flex: 1,
                                height: 1,
                                backgroundColor: c_bg_section_line,
                              }}></View>
                          </View>,
                        );
                      } else {
                        if (item.is_me == 1) {
                          // is from user
                          rowView.push(
                            <View style={{flexDirection: 'row', padding: 5}}>
                              <View style={[mStyle.triangleCornerStart]}></View>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  width: screenWidth * 0.8,
                                  alignItems: 'flex-start',
                                  alignSelf: 'flex-start',
                                  backgroundColor: '#ffffff',
                                  borderTopEndRadius: 8,
                                  borderBottomEndRadius: 8,
                                  borderBottomStartRadius: 8,
                                  padding: 10,
                                }}>
                                <View style={{flexDirection: 'row'}}>
                                  <Text
                                    style={[
                                      mStyle.textNormal,
                                      {color: item.user_color},
                                    ]}>
                                    {item.user_name}
                                  </Text>
                                  <View style={{flex: 1}}></View>
                                  <Text
                                    style={[
                                      mStyle.textNormal,
                                      {color: c_grey_text},
                                    ]}>
                                    {moment
                                      .utc(item.created_on)
                                      .local()
                                      .format('HH:mm')}
                                  </Text>
                                </View>
                                {this.displayChatContent(
                                  item.chat_message_type,
                                  chatData,
                                )}
                              </View>
                            </View>,
                          );
                        } else {
                          rowView.push(
                            <View
                              style={{
                                flexDirection: 'row',
                                padding: 5,
                                justifyContent: 'flex-end',
                                marginBottom: 10,
                              }}>
                              <View
                                style={{
                                  flexDirection: 'column',
                                  width: screenWidth * 0.8,
                                  alignItems: 'flex-end',
                                  alignSelf: 'flex-end',
                                  backgroundColor: '#ffffff',
                                  borderTopStartRadius: 8,
                                  borderBottomEndRadius: 8,
                                  borderBottomStartRadius: 8,
                                  padding: 10,
                                }}>
                                <View style={{flexDirection: 'row'}}>
                                  <Text
                                    style={[
                                      mStyle.textNormal,
                                      {color: item.user_color},
                                    ]}>
                                    {item.user_name}
                                  </Text>
                                  <View style={{flex: 1}}></View>
                                  <Text
                                    style={[
                                      mStyle.textNormal,
                                      {color: c_grey_text},
                                    ]}>
                                    {moment
                                      .utc(item.created_on)
                                      .local()
                                      .format('HH:mm')}
                                  </Text>
                                </View>
                                {this.displayChatContent(
                                  item.chat_message_type,
                                  chatData,
                                )}
                              </View>
                              <View style={[mStyle.triangleCornerEnd]}></View>
                            </View>,
                          );
                        }
                      }
                    },
                  )}
                </ScrollView> */}
              </View>
            </View>
            <View
              style={{
                height: 65,
                width: screenWidth,
                backgroundColor: c_background_issue_item,
              }}></View>
          </ScrollView>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              this.scrollToTop();
            }}
            style={{
              width: screenWidth,
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              position: 'absolute',
              top: screenWidth * (192 / 768),
              left: this.state.isShowStickyLabel ? 0 : -screenHeight,
              paddingTop: 10,
              paddingBottom: 10,
              paddingStart: 15 + screenWidth * 0.017,
            }}>
            <Text style={[mStyle.textSectionLabel, {flex: 1}]}>
              {issueDetail}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: c_background_issue_item,
              alignItems: 'center',
              position: 'absolute',
              bottom: 0,
            }}>
            <View
              style={{
                flexDirection: 'column',
                borderRadius: 5,
                backgroundColor: '#ffffff',
                padding: 10,
                marginStart: 10,
                marginEnd: 10,
                marginBottom: 10,
                flex: 1,
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  margin: 5,
                  borderBottomColor: c_bg_filter_selected,
                  borderBottomWidth: 1,
                  paddingBottom: 5,
                  paddingTop: 5,
                  display: this.state.fileName == '' ? 'none' : 'flex',
                }}>
                <Image
                  source={
                    this.state.isImageAttach
                      ? {uri: this.state.fileUri}
                      : require('../image/icon_file_attach.png')
                  }
                  resizeMode="contain"
                  style={{
                    width: screenWidth * 0.18,
                    height: screenWidth * 0.2,
                    alignSelf: 'flex-start',
                  }}
                />
                <Text numberOfLines={1} style={mStyle.textNormal}>
                  {this.state.fileName}
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() => {
                    this.showSelectAttachDialog();
                  }}>
                  <Image
                    source={require('../image/icon_attach.png')}
                    resizeMode="cover"
                    style={{
                      width: screenWidth * 0.06 * (225 / 241),
                      height: screenWidth * 0.06,
                    }}
                  />
                </TouchableOpacity>
                <TextInput
                  onChangeText={text => {
                    let allState = this.state;
                    allState.composeText = text;
                    this.setState(allState);
                    // console.log(this.state.composeText);
                  }}
                  value={this.state.composeText}
                  multiline={true}
                  style={[
                    mStyle.textNormal,
                    {
                      maxHeight: screenHeight * 0.3,
                      flex: 1,
                      marginStart: 10,
                      marginEnd: 10,
                      padding: 0,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => {
                    this.sendChatMessage();
                  }}>
                  <Image
                    source={require('../image/icon_send.png')}
                    resizeMode="cover"
                    style={{
                      width: screenWidth * 0.07,
                      height: screenWidth * 0.07,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Modal
            animationType="fade"
            presentationStyle="fullScreen"
            visible={this.state.isStatusDialogShown}
            onRequestClose={() => {
              this.closeStatusIssueSelectDialog();
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
                  this.closeStatusIssueSelectDialog();
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
                data={this.state.issueDetail.status_options}
                showsVerticalScrollIndicator={false}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        this.updateStatusIssue(item);
                      }}
                      style={{
                        flexDirection: 'row',
                        marginBottom: 20,
                        marginStart: 15,
                        padding: 10,
                        alignItems: 'flex-start',
                        alignSelf: 'flex-start',
                      }}>
                      <Text style={[mStyle.textBold]}>
                        {this.state.appConfig.issue_statuses[item]['name']}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={item => item}
              />
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
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                backgroundColor: '#ffffff',
                borderRadius: 10,
                marginTop: 30,
              }}>
              <TouchableOpacity
                style={{alignSelf: 'flex-end'}}
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
                  width: screenWidth * 0.5,
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
          <Modal
            onRequestClose={() => {
              this.closeImageViewFull();
            }}
            visible={this.state.isViewFullImage}
            transparent={false}>
            <ImageViewer
              imageUrls={this.state.images}
              enableImageZoom={true}
              index={this.state.startPosImageViewFull}
              // enableSwipeDown={true}
              // onSwipeDown={()=>{
              //     this.closeImageViewFull();
              // }}
              onClick={() => {
                // alert ("onClick")
                this.closeImageViewFull();
              }}
            />
          </Modal>
          <Modal
            animationType="slide"
            presentationStyle="fullScreen"
            visible={this.state.isDisapproveDialogShown}
            transparent={false}>
            <View
              style={{
                flexDirection: 'column',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: greyHasOpacity,
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  width: screenWidth * 0.9,
                  padding: 10,
                  backgroundColor: '#ffffff',
                  borderRadius: 5,
                }}>
                <Text style={[mStyle.textInfoLabel]}>
                  {disapproveIssueMessage}
                </Text>
                <TextInput
                  onChangeText={text => {
                    if (text != '') {
                      this.setState({
                        disapproveReason: text,
                        showDisapproveReasonNotice: false,
                      });
                    }
                  }}
                  style={{
                    padding: 0,
                    marginTop: 20,
                    marginBottom: 20,
                    marginStart: 0,
                    marginEnd: 0,
                    writingDirection: 'rtl',
                    textAlign: 'right',
                    borderBottomColor: this.state.showDisapproveReasonNotice
                      ? c_priority_high
                      : greyHasOpacity,
                    borderBottomWidth: 1,
                  }}
                  placeholder={reasonForDisapproval}
                />
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() => {
                      this.closeDisapproveDialog();
                    }}
                    style={[mStyle.textInfoLabel, {flex: 1}]}>
                    <Text>{disapproveIssueButtonCancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.callDisapproveIssue();
                    }}
                    style={[mStyle.textInfoLabel, {flex: 1}]}>
                    <Text>{disapproveIssueButtonOk}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            presentationStyle="fullScreen"
            visible={this.state.isRejectIssueDialogShown}
            transparent={false}>
            <View
              style={{
                flexDirection: 'column',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: greyHasOpacity,
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  width: screenWidth * 0.9,
                  padding: 10,
                  backgroundColor: '#ffffff',
                  borderRadius: 5,
                }}>
                <Text style={[mStyle.textInfoLabel]}>{rejectIssueMessage}</Text>
                <TextInput
                  onChangeText={text => {
                    if (text != '') {
                      this.setState({
                        rejectIssueReason: text,
                        showRejectIssueNotice: false,
                      });
                    }
                  }}
                  style={{
                    padding: 0,
                    marginTop: 20,
                    marginBottom: 20,
                    marginStart: 0,
                    marginEnd: 0,
                    writingDirection: 'rtl',
                    textAlign: 'right',
                    borderBottomColor: this.state.showDisapproveReasonNotice
                      ? c_priority_high
                      : greyHasOpacity,
                    borderBottomWidth: 1,
                  }}
                  placeholder={reasonForRejectIssue}
                />
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    onPress={() => {
                      this.closeRejectIssueDialog();
                    }}
                    style={[mStyle.textInfoLabel, {flex: 1}]}>
                    <Text>{rejectIssueButtonCancel}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      this.closeRejectIssueDialog();
                      this.callRejectIssue();
                    }}
                    style={[mStyle.textInfoLabel, {flex: 1}]}>
                    <Text>{rejectIssueButtonOk}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <DateTimePickerModal
            isVisible={this.state.isDatePickerVisible}
            mode="datetime"
            onConfirm={date => {
              this.handleDateConfirm(date);
            }}
            onCancel={() => {
              this.closeDatePicker();
            }}
          />
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
      </KeyboardAvoidingView>
    );
  }
}
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
let issueDetailSectionTop = 0;
let issueMediaSectionTop = 0;
let issueChatSectionTop = 0;
let contentHeight = 0;
let tempDate = '';

const mStyle = StyleSheet.create({
  textNormal: {
    fontFamily: 'Heebo',
    fontSize: 13,
  },
  textBold: {
    fontFamily: 'Heebo',
    fontSize: 15,
    fontWeight: 'bold',
  },
  textTime: {
    fontFamily: 'Heebo',
    fontSize: 13,
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
  statusCircle: {
    width: screenWidth * 0.07,
    height: screenWidth * 0.07,
    borderRadius: screenWidth * 0.07,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInfoLabel: {
    color: c_select_box_bg,
    fontFamily: 'Heebo',
    fontSize: 15,
  },
  textOptionSelected: {
    padding: 5,
    backgroundColor: c_select_box_bg,
    borderRadius: 5,
    color: '#ffffff',
    fontFamily: 'Heebo',
    fontSize: 14,
    textAlign: 'center',
  },
  textOptionUnselected: {
    padding: 5,
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'Heebo',
    fontSize: 14,
    textAlign: 'center',
  },
  priorityCircleNormal: {
    width: screenWidth * 0.07,
    height: screenWidth * 0.07,
    borderRadius: screenWidth * 0.07,
    lineHeight: screenWidth * 0.07,
    padding: 0,
    marginEnd: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Heebo',
    fontSize: 14,
    textAlign: 'center',
    color: '#ffffff',
  },
  priorityCircleSelected: {
    width: screenWidth * 0.07,
    height: screenWidth * 0.07,
    borderRadius: screenWidth * 0.07,
    lineHeight: screenWidth * 0.07,
    padding: 0,
    marginEnd: 10,
    borderWidth: 3,
    borderColor: c_bg_filter_selected,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Heebo',
    fontSize: 14,
    textAlign: 'center',
    color: '#ffffff',
  },
  textIdfSelected: {
    padding: 5,
    backgroundColor: c_status_done,
    borderRadius: 5,
    color: '#ffffff',
    fontFamily: 'Heebo',
    fontSize: 14,
    textAlign: 'center',
  },
  textIdfUnselected: {
    padding: 5,
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'Heebo',
    fontSize: 14,
    textAlign: 'center',
  },
  textSectionLabel: {
    fontFamily: 'Heebo',
    fontSize: 16,
    color: c_blue_light_filter,
  },
  triangleCornerStart: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderStartWidth: 10,
    borderTopWidth: 10,
    borderStartColor: 'transparent',
    borderTopColor: 'white',
  },
  triangleCornerEnd: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderEndWidth: 10,
    borderTopWidth: 10,
    borderEndColor: 'transparent',
    borderTopColor: 'white',
  },
  textProgressStatusBlue: {
    fontFamily: 'Heebo',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  textProgressStatusV: {
    fontFamily: 'Heebo',
    fontSize: 15,
    color: '#ffffff',
  },
  textProgressStatusGray: {
    fontFamily: 'Heebo',
    fontSize: 15,
    color: c_status_done,
  },
});
