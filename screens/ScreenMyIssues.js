/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ImageBackground,
  ActivityIndicator,
  Alert,
  AppState,
  PermissionsAndroid,
  BackHandler,
  TextInput,
  I18nManager,
} from 'react-native';
import {
  MyIssuesTitle,
  sortByDateCreated,
  clearFilter,
  updated,
  sortByStatus,
  sortByPrior,
  sortByLastUpdate,
  search,
  sortBySmallSort,
} from '../resource/StringContentDefault';
import {
  ActiveIssueScreenName,
  api_url,
  bg_issues_new,
  c_background_issue_item,
  c_bg_filter_selected,
  c_blue_filter,
  c_blue_light_filter,
  c_grey,
  c_grey_filter,
  c_grey_text,
  c_loading_icon,
  c_select_box_bg,
  c_yellow_filter,
  greyHasOpacity,
  IssuesFilterScreenName,
  key_app_config,
  key_bg_notification,
  key_user_info,
  LoginScreenName,
  menu_contact_index,
  menu_issue_page_index,
  menu_log_out_index,
  menu_new_issue_index,
  menu_status_info_index,
  MyIssuesScreenName,
  NewIssueScreenName,
  rc_success,
  rc_token_expire,
  rq_get_device_types,
  rq_get_issues,
  rq_logout,
  rq_update_device_info,
  StatusInfoScreenName,
  text_issues_new,
  text_notification_title,
} from '../resource/BaseValue';
import IssuesFilterScreen from './ScreenIssuesFilter';
import SortSelectScreen from './ScreenSortSelect';
import MenuView from './MenuView';
import SideMenu from 'react-native-side-menu';
import LastUpdateScreen from './ScreenLastUpdate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
// import firebase from '@react-native-firebase/app';
// import messaging from '@react-native-firebase/messaging';
// import auth from '@react-native-firebase/auth';
// import PushNotification from 'react-native-push-notification';
// import DeviceInfo from 'react-native-device-info';

export default class MyIssuesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      issuesFullList: [],
      issuesList: [],
      isFilterDialogShown: false,
      isSortDialogShown: false,
      isLastUpdateDialogShown: false,
      isShowClearFilter: false,
      sortText: sortByLastUpdate,
      isMenuOpen: false,
      selectedMenuItem: 'About',
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
      userInfo: {},
      appConfig: {},
      issueStatusCount: [],
      filterList: [],
      numOfUpdate: 0,
      isRefreshing: false,
      isFastFilter: true,
      isDefaultFilter: true,
      searchText: '',
    };
  }

  componentDidMount() {
    console.log('componentDidMount');
    I18nManager.forceRTL(true);
    isStartListenFCM = false;
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
    this.checkPermission();
    this.loadUserInfo().then(() => {
      this.loadAppConfig().then(() => {
        this.loadIssues();
        didFocusSubscription = this.props.navigation.addListener(
          'didFocus',
          payload => {
            this.loadIssues();
          },
        );
      });
    });
  }

  openActiveIssueScreen = issueId => {
    let item = {};
    for (let i = 0; i < this.state.issuesList.length; i++) {
      if (issueId == this.state.issuesList[i]['issue_id']) {
        item = this.state.issuesList[i];
      }
    }
    this.props.navigation.navigate(ActiveIssueScreenName, {
      issue_id: issueId,
      issue_status: this.state.appConfig.issue_statuses[item.status]['name'],
    });
  };

  startFCMListening = async () => {
    if (isStartListenFCM == false) {
      isStartListenFCM = true;
      console.log('startFCMListening');
      messaging()
        .getToken()
        .then(token => {
          console.log('token: ' + token);
          if (token != '') {
            this.updateFCMWithServer(token);
          }
        });

      messaging().onTokenRefresh(token => {
        console.log('token: ' + token);
        if (token != '') {
          this.updateFCMWithServer(token);
        }
      });

      // remoteMessage.data
      // {
      //     "issue_id"          => $issueId,
      //     "issue_name"        => $issue_name,
      //     "message_text"      => $pnText,
      //     "user_name"         => $currUserName,
      // }
      messaging().onMessage(async remoteMessage => {
        console.log('onMessage:');
        console.log(remoteMessage.data);
        PushNotification.localNotification({
          autoCancel: true,
          subText: text_notification_title,
          title: remoteMessage.data.user_name,
          message: remoteMessage.data.message_text,
          tag: remoteMessage.data,
          vibrate: true,
          vibration: 300,
          playSound: true,
          soundName: 'default',
        });
      });

      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.data,
        );
        let issueId = remoteMessage.data.issue_id;
        console.log(issueId);
        this.openActiveIssueScreen(issueId);
      });

      // Check whether an initial notification is available
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state: myissues',
              remoteMessage.data,
            );
            let issueId = remoteMessage.data.issue_id;
            this.openActiveIssueScreen(issueId);
          }
        });
      PushNotification.configure({
        // (required) Called when a remote or local notification is opened or received
        onNotification: notification => {
          console.log('LOCAL NOTIFICATION ==>', notification);
          let data = notification.tag;
          console.log(data);
          if (data) {
            let issueId = data.issue_id;
            this.openActiveIssueScreen(issueId);
          }
        },
        popInitialNotification: true,
        requestPermissions: true,
      });
    }
    this.checkNotification();
  };

  checkNotification = async () => {
    console.log('checkNotification');
    const value = AsyncStorage.getItem(key_bg_notification);
    console.log(value);
    if (value != null && value != '') {
      const jsonValue = JSON.parse(value);
      let issueId = jsonValue.issue_id;
      try {
        AsyncStorage.setItem(key_bg_notification, '');
      } catch (e) {
        // saving error
      }
      this.openActiveIssueScreen(issueId);
    } else {
    }
  };

  updateFCMWithServer = async token => {
    let dataObj = {
      request: rq_update_device_info,
      token: this.state.userInfo.token,
      device_id: token,
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
        this._closeLoadingBox();
        if (responseJson.rc == rc_success) {
          console.log(responseJson);
        } else if (responseJson.rc == rc_token_expire) {
          this.props.navigation.navigate(LoginScreenName, {
            isTokenExpire: true,
          });
        } else {
          alert(responseJson.message);
        }
        this.handleRefreshList(false);
      })
      .catch(error => {
        this._closeLoadingBox();
        alert(error);
      });
  };

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    didFocusSubscription.remove();
  }

  backAction = () => {
    if (this.state.isMenuOpen) {
      this.updateMenuState(false);
      return true;
    }
  };

  searchIssues = text => {
    // serial_number, title
    let allState = this.state;
    for (let i = 0; i < allState.issuesList.length; i++) {
      if (
        allState.issuesList[i]['title'].includes(text) ||
        allState.issuesList[i]['serial_number'].includes(text) ||
        text == ''
      ) {
        allState.issuesList[i]['isShown'] = true;
      } else {
        allState.issuesList[i]['isShown'] = false;
      }
    }
    this.setState(allState);
  };

  handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      this.loadIssues();
    }
    this.setState({appState: nextAppState});
  };

  loadUserInfo = async () => {
    try {
      const value = await AsyncStorage.getItem(key_user_info);
      if (value != null) {
        // value previously stored
        console.log('loadUserInfo: ' + value);
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

  getCommandName(commandId) {
    return this.state.appConfig.commands[commandId];
  }

  loadAppConfig = async () => {
    try {
      const value = await AsyncStorage.getItem(key_app_config);
      if (value != null) {
        // value previously stored
        const jsonValue = JSON.parse(value);
        let allState = this.state;
        allState.appConfig = jsonValue;
        allState.filterList = [];
        for (let i = 1; i < 6; i++) {
          if (allState.appConfig.issue_statuses[i + ''] != null) {
            let item = {
              type: 'filter_statuses',
              name: allState.appConfig.issue_statuses[i + '']['name'],
              color: allState.appConfig.issue_statuses[i + '']['color'],
              // count:allState.appConfig.issue_statuses[i+'']['count'],
              value: i,
            };
            allState.filterList.push(item);
          }
        }
        allState.isFastFilter = false;
        this.setState(allState);
      } else {
      }
    } catch (e) {
      // error reading value
    }
  };

  loadIssues = async () => {
    if (!this.state.isRefreshing) {
      this._showLoadingBox();
    }
    let dataObj = {
      request: rq_get_issues,
      token: this.state.userInfo.token,
      filter_period: 0,
      sort_by: 4,
    };
    if (this.state.sortText == sortByDateCreated) {
      dataObj.sort_by = 1;
    } else if (this.state.sortText == sortByPrior) {
      dataObj.sort_by = 2;
    } else if (this.state.sortText == sortByStatus) {
      dataObj.sort_by = 3;
    } else if (this.state.sortText == sortByLastUpdate) {
      dataObj.sort_by = 4;
    } else if (this.state.sortText == sortBySmallSort) {
      dataObj.sort_by = 5;
    }

    console.log('filterList: ' + JSON.stringify(this.state.filterList));
    if (this.state.filterList.length != 0) {
      for (let i = 0; i < this.state.filterList.length; i++) {
        let filterItem = this.state.filterList[i];
        if (filterItem['type'] == 'filter_period') {
          dataObj.filter_period = filterItem['value'];
        } else if (filterItem['type'] == 'filter_statuses') {
          if (
            dataObj.filter_statuses == null ||
            dataObj.filter_statuses == ''
          ) {
            dataObj.filter_statuses = filterItem['value'];
          } else {
            dataObj.filter_statuses =
              dataObj.filter_statuses + ',' + filterItem['value'];
          }
        } else if (filterItem['type'] == 'filter_location') {
          dataObj.filter_location = filterItem['value'];
        } else if (filterItem['type'] == 'filter_issue_types') {
          if (
            dataObj.filter_issue_types == null ||
            dataObj.filter_issue_types == ''
          ) {
            dataObj.filter_issue_types = filterItem['value'];
          } else {
            dataObj.filter_issue_types =
              dataObj.filter_issue_types + ',' + filterItem['value'];
          }
        }
      }
    }
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
        this._closeLoadingBox();
        if (responseJson.rc == rc_success) {
          console.log(responseJson);
          let issueListInJson = responseJson.issues;
          let issueTypeCountInJson = responseJson.issue_statuses_count;
          let allState = this.state;
          allState.issuesList = issueListInJson;
          for (let i = 0; i < allState.issuesList.length; i++) {
            allState.issuesList[i]['isShown'] = true;
          }
          allState.issueStatusCount = issueTypeCountInJson;
          allState.numOfUpdate = responseJson.num_of_updates;
          if (allState.isDefaultFilter) {
            allState.filterList = [];
            Object.keys(issueTypeCountInJson).map(key => {
              if (key + '' != '6' && key + '' != '7') {
                let filterItem = {
                  id: key,
                  name: issueTypeCountInJson[key]['name'],
                  color: issueTypeCountInJson[key]['color'],
                  count: issueTypeCountInJson[key]['count'],
                  value: key,
                  type: 'filter_statuses',
                };
                allState.filterList.push(filterItem);
              }
            });
          } else {
            if (allState.isFastFilter) {
              allState.filterList = [];
              Object.keys(issueTypeCountInJson).map(key => {
                let filterItem = {
                  id: key,
                  name: issueTypeCountInJson[key]['name'],
                  color: issueTypeCountInJson[key]['color'],
                  count: issueTypeCountInJson[key]['count'],
                  value: key,
                  type: 'filter_statuses',
                };
                allState.filterList.push(filterItem);
              });
            } else {
            }
          }
          this.setState(allState, () => {
            this.startFCMListening();
          });
        } else if (responseJson.rc == rc_token_expire) {
          this.props.navigation.navigate(LoginScreenName, {
            isTokenExpire: true,
          });
        } else {
          alert(responseJson.message);
        }
        this.handleRefreshList(false);
      })
      .catch(error => {
        this._closeLoadingBox();
        alert(error);
      });
  };

  checkPermission = async () => {
    console.log('checkPermission');
    let permisstionRequestList = [
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ];
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        permisstionRequestList,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use these');
      } else {
        console.log('Permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  removeFilterItem = item => {
    let pos = -1;
    let allState = this.state;
    allState.isDefaultFilter = false;
    for (let i = 0; i < allState.filterList.length; i++) {
      if (
        allState.filterList[i]['type'] == item['type'] &&
        allState.filterList[i]['name'] == item['name']
      ) {
        pos = i;
      }
    }
    if (pos > -1) {
      allState.filterList.splice(pos, 1);
    }
    if (allState.filterList.length == 0) {
      allState.isFastFilter = true;
    }
    this.setState(allState, () => {
      this.loadIssues();
    });
  };

  displayFilter() {
    let fastFilterList = [];
    let filterList = this.state.filterList;
    if (this.state.isFastFilter) {
      for (let i = 0; i < filterList.length; i++) {
        let filterItem = filterList[i];
        fastFilterList.push(
          <TouchableOpacity
            onPress={() => {
              let aState = this.state;
              aState.filterList = [];
              aState.filterList.push(filterItem);
              aState.isFastFilter = false;
              this.setState(aState, () => {
                this.loadIssues();
              });
            }}
            style={{flexDirection: 'row', margin: 5}}>
            <View
              style={{
                backgroundColor: filterItem['color'],
                width: 10,
                marginStart: 0,
                height: screenWidth * 0.1,
              }}></View>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginStart: 5,
              }}>
              <Text style={[mStyle.textBold, {color: 'white'}]}>
                {filterItem['count']}
              </Text>
              <Text style={[mStyle.textNormal, {color: 'white'}]}>
                {filterItem['name']}
              </Text>
            </View>
          </TouchableOpacity>,
        );
      }
    } else {
      for (let i = 0; i < filterList.length; i++) {
        let filterItem = filterList[i];
        if (filterItem.type == 'filter_statuses') {
          fastFilterList.push(
            <TouchableOpacity
              onPress={() => {
                this.removeFilterItem(filterItem);
              }}
              style={{
                flexDirection: 'row',
                alignSelf: 'flex-start',
                alignContent: 'stretch',
                margin: 5,
                backgroundColor: c_select_box_bg,
                padding: 5,
                borderRadius: 5,
              }}>
              <View
                style={{
                  backgroundColor: filterItem['color'],
                  width: 10,
                  marginStart: 0,
                  height: screenWidth * 0.1,
                }}></View>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginStart: 5,
                  marginEnd: 5,
                }}>
                <Text style={[mStyle.textBold, {color: 'white'}]}>
                  {filterItem['count']}
                </Text>
                <Text style={[mStyle.textNormal, {color: 'white'}]}>
                  {filterItem['name']}
                </Text>
              </View>
              <Image
                source={require('../image/icon_close_white.png')}
                resizeMode="contain"
                style={{
                  width: screenWidth * 0.02,
                  height: screenWidth * 0.02,
                }}
              />
            </TouchableOpacity>,
          );
        } else {
          fastFilterList.push(
            <TouchableOpacity
              onPress={() => {
                this.removeFilterItem(filterItem);
              }}
              style={{
                flexDirection: 'row',
                alignSelf: 'flex-start',
                alignContent: 'stretch',
                margin: 5,
                backgroundColor: c_select_box_bg,
                padding: 5,
                borderRadius: 5,
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginStart: 5,
                  marginEnd: 5,
                }}>
                <Text style={[mStyle.textBold, {color: 'white'}]}></Text>
                <Text
                  numberOfLines={2}
                  style={[mStyle.textNormal, {color: 'white'}]}>
                  {filterItem['name']}
                </Text>
              </View>
              <Image
                source={require('../image/icon_close_white.png')}
                resizeMode="contain"
                style={{
                  width: screenWidth * 0.02,
                  height: screenWidth * 0.02,
                }}
              />
            </TouchableOpacity>,
          );
        }
      }
    }

    return fastFilterList;
  }

  handleRefreshList = isListRefreshing => {
    let allState = this.state;
    allState.isRefreshing = isListRefreshing;
    this.setState(allState);
    if (isListRefreshing) {
      this.loadIssues();
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

  openIssueFilterDialog() {
    // this.props.navigation.navigate(IssuesFilterScreenName);
    let allState = this.state;
    allState.isFilterDialogShown = true;
    this.setState(allState);
  }

  closeIssueFilterDialog = (data, isCancel) => {
    let allState = this.state;
    allState.isFilterDialogShown = false;
    if (!isCancel) {
      allState.isDefaultFilter = false;
      if (data != '') {
        let filterListSelected = JSON.parse(data);
        if (filterListSelected.length == 0) {
          allState.isFastFilter = true;
        } else {
          allState.filterList = [];
          for (let i = 0; i < filterListSelected.length; i++) {
            let selectedFilterItem = filterListSelected[i];
            allState.filterList.push(selectedFilterItem);
          }
          allState.isFastFilter = false;
        }
      } else {
        allState.isFastFilter = true;
      }

      if (allState.isFastFilter) {
        allState.filterList = [];
        Object.keys(allState.issueStatusCount).map(key => {
          let filterItem = {
            id: key,
            name: allState.issueStatusCount[key]['name'],
            color: allState.issueStatusCount[key]['color'],
            count: allState.issueStatusCount[key]['count'],
            value: key,
            type: 'filter_statuses',
          };
          allState.filterList.push(filterItem);
        });
      }
      this.setState(allState, () => {
        this.loadIssues();
      });
    } else {
      this.setState(allState);
    }
  };

  openSortSelectDialog() {
    // this.props.navigation.navigate(IssuesFilterScreenName);
    let allState = this.state;
    allState.isSortDialogShown = true;
    this.setState(allState);
  }

  closeSortSelectDialog = data => {
    let allState = this.state;
    allState.isSortDialogShown = false;
    if (data != '') {
      allState.sortText = data;
      this.setState(allState, () => {
        this.loadIssues();
      });
    } else {
      this.setState(allState);
    }
  };

  openLastUpdateDialog() {
    // this.props.navigation.navigate(IssuesFilterScreenName);
    let allState = this.state;
    allState.isLastUpdateDialogShown = true;
    this.setState(allState);
  }

  closeLastUpdateDialog = data => {
    let allState = this.state;
    allState.isLastUpdateDialogShown = false;
    this.setState(allState);
  };

  comeToNewIssueScreen = () => {
    this.props.navigation.navigate(NewIssueScreenName);
  };

  comeToStatusInfoScreen = () => {
    this.props.navigation.navigate(StatusInfoScreenName);
  };

  openIssueInfo = item => {
    if (this.state.isLastUpdateDialogShown) {
      this.closeLastUpdateDialog('');
    }
    this.openActiveIssueScreen(item.issue_id);
  };

  updateMenuState(isMenuOpen) {
    this.setState({isMenuOpen});
  }

  onMenuItemSelected(item) {
    // console.log("menu " + item);
    this.setState({
      isMenuOpen: false,
      selectedMenuItem: item,
    });
    if (item == menu_log_out_index) {
      // log out
      isStartListenFCM = false;
      this.logout();
    } else if (item == menu_contact_index) {
    } else if (item == menu_new_issue_index) {
      this.comeToNewIssueScreen();
    } else if (item == menu_issue_page_index) {
      // this.loadIssues();
    } else if (item == menu_status_info_index) {
      this.comeToStatusInfoScreen();
    }
  }

  logout = async () => {
    this._showLoadingBox();
    let dataObj = {
      request: rq_logout,
      token: this.state.userInfo.token,
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
        try {
          let userInfo = {
            first_name: '',
            last_name: '',
            type: 0,
            token: '',
          };
          AsyncStorage.setItem(key_user_info, JSON.stringify(userInfo)).then(
            () => {
              this._closeLoadingBox();
              this.props.navigation.pop(2);
              this.props.navigation.navigate(LoginScreenName);
            },
          );
        } catch (e) {
          // saving error
          this._closeLoadingBox();
          Alert.alert(e.toString());
        }
      })
      .catch(error => {
        this._closeLoadingBox();
        alert(error);
      });
  };

  clearFastFilter() {
    let allState = this.state;
    allState.isFastFilter = false;
    allState.isDefaultFilter = true;
    allState.filterList = [];
    Object.keys(allState.issueStatusCount).map(key => {
      if (key + '' != '6' && key + '' != '7') {
        let filterItem = {
          id: key,
          name: allState.issueStatusCount[key]['name'],
          color: allState.issueStatusCount[key]['color'],
          count: allState.issueStatusCount[key]['count'],
          value: key,
          type: 'filter_statuses',
        };
        console.log('filter item: ' + JSON.stringify(filterItem));
        allState.filterList.push(filterItem);
      }
    });
    this.setState(allState, () => {
      this.loadIssues();
    });
  }

  render() {
    const menuView = (
      <MenuView onItemSelected={item => this.onMenuItemSelected(item)} />
    );
    return (
      <SideMenu
        menu={menuView}
        isOpen={this.state.isMenuOpen}
        menuPosition="right"
        autoClosing={true}
        openMenuOffset={screenWidth}
        onChange={isMenuOpen => this.updateMenuState(isMenuOpen)}>
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
            }}
            resizeMode="cover"
            source={require('../image/bg_splash.jpg')}>
            <View>
              <Text
                style={[
                  mStyle.textTitle,
                  {
                    color: 'white',
                    width: screenWidth,
                    textAlign: 'center',
                    marginTop: 10,
                  },
                ]}>
                {MyIssuesTitle}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.updateMenuState(!this.state.isMenuOpen);
                }}
                style={{position: 'absolute', top: 15}}>
                <Image
                  source={require('../image/icon_menu.png')}
                  resizeMode="contain"
                  style={{
                    width: screenWidth * 0.05,
                    height: screenWidth * 0.05,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.openLastUpdateDialog();
                }}
                style={{
                  position: 'absolute',
                  top: 13,
                  start: screenWidth * 0.1,
                }}>
                <Image
                  source={require('../image/icon_notification_white.png')}
                  resizeMode="contain"
                  style={{
                    width: screenWidth * 0.06 * (48 / 43),
                    height: screenWidth * 0.06,
                  }}
                />
                <Text
                  style={{
                    backgroundColor: c_blue_light_filter,
                    color: '#ffffff',
                    borderRadius: 100,
                    position: 'absolute',
                    top: -2,
                    start: -3,
                    textAlign: 'center',
                    fontSize: 8,
                    lineHeight: screenWidth * 0.035,
                    width: screenWidth * 0.035,
                    height: screenWidth * 0.035,
                    opacity: this.state.numOfUpdate == 0 ? 0 : 1,
                  }}>
                  {this.state.numOfUpdate}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row', marginTop: 20}}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  width: screenWidth * 0.8,
                }}>
                {this.displayFilter()}
              </View>
              <View style={{flex: 1}}></View>
              <TouchableOpacity
                onPress={() => {
                  this.openIssueFilterDialog();
                }}
                style={{alignSelf: 'flex-start', marginTop: 10}}>
                <Image
                  source={require('../image/icon_filter.png')}
                  resizeMode="contain"
                  style={{
                    width: screenWidth * 0.07,
                    height: screenWidth * 0.07 * (52 / 59),
                  }}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                this.clearFastFilter();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-end',
                padding: 5,
                marginTop: 5,
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(12,41,60,0.4)',
                borderRadius: 5,
                display: !this.state.isFastFilter ? 'flex' : 'none',
              }}>
              <Image
                source={require('../image/icon_close_white.png')}
                resizeMode="contain"
                style={{
                  width: screenWidth * 0.02,
                  height: screenWidth * 0.02,
                  margin: 5,
                }}
              />
              <Text style={[mStyle.textNormal, {color: 'white'}]}>
                {clearFilter}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
              }}>
              <TextInput
                value={this.state.searchText}
                onChangeText={text => {
                  this.setState({searchText: text}, () => {
                    this.searchIssues(text);
                  });
                }}
                placeholder={search}
                placeholderTextColor={'white'}
                style={[
                  mStyle.textNormal,
                  {
                    color: 'white',
                    borderColor: 'white',
                    borderWidth: 1,
                    borderRadius: 5,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingStart: 10,
                    paddingEnd: 10,
                    margin: 0,
                    width: screenWidth * 0.4,
                    height: 23,
                  },
                ]}
              />
              <View style={{flex: 1}}></View>
              <TouchableOpacity
                onPress={() => {
                  this.openSortSelectDialog();
                }}
                style={{
                  borderColor: 'white',
                  borderWidth: 1,
                  borderRadius: 5,
                  flexDirection: 'row',
                  paddingTop: 2,
                  paddingBottom: 2,
                  paddingStart: 10,
                  paddingEnd: 10,
                  alignSelf: 'flex-end',
                }}>
                <Text style={[mStyle.textNormal, {color: 'white'}]}>
                  {this.state.sortText}
                </Text>
                <Image
                  source={require('../image/icon_arrow_down_white.png')}
                  resizeMode="contain"
                  style={{
                    width: screenWidth * 0.05,
                    height: screenWidth * 0.05 * (26 / 47),
                    alignSelf: 'center',
                    marginStart: 10,
                  }}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              style={{marginTop: 10}}
              data={this.state.issuesList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.isRefreshing}
                  onRefresh={() => {
                    this.handleRefreshList(true);
                  }}
                />
              }
              renderItem={({item, index}) => {
                if (item.isShown) {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        this.openIssueInfo(item);
                      }}
                      style={{
                        flexDirection: 'row',
                        marginBottom: 10,
                        padding: 5,
                        backgroundColor: c_background_issue_item,
                        borderRadius: 5,
                        alignItems: 'center',
                      }}>
                      <Image
                        source={
                          item.image == ''
                            ? require('../image/img_issue_default.png')
                            : {uri: item.image}
                        }
                        resizeMode="cover"
                        style={{
                          width: screenWidth * 0.25,
                          height: screenWidth * 0.25,
                        }}
                      />
                      <Text
                        style={[
                          mStyleIssueItem.textStatus,
                          {
                            position: 'absolute',
                            top: 0,
                            start: 0,
                            color:
                              item.is_new == 1 ? text_issues_new : '#ffffff',
                            backgroundColor:
                              item.is_new == 1
                                ? bg_issues_new
                                : this.state.appConfig.issue_statuses[
                                    item.status
                                  ]['color'],
                          },
                        ]}>
                        {
                          this.state.appConfig.issue_statuses[item.status][
                            'name'
                          ]
                        }
                      </Text>
                      <View
                        style={{
                          flexDirection: 'column',
                          marginEnd: 5,
                          marginStart: 5,
                          flex: 1,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignSelf: 'flex-start',
                          }}>
                          <Text
                            style={[
                              mStyleIssueItem.textCommendentName,
                              {marginEnd: 5},
                            ]}>
                            {this.getCommandName(item.command_id)}
                          </Text>
                          <Text style={mStyleIssueItem.textDeviceName}>
                            {item.title}
                          </Text>
                        </View>
                        <View style={{flexDirection: 'row', padding: 5}}>
                          <View
                            style={{
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              flex: 1,
                              alignSelf: 'flex-start',
                              backgroundColor: '#ffffff',
                              borderTopStartRadius: 8,
                              borderBottomEndRadius: 8,
                              borderBottomStartRadius: 8,
                              padding: 5,
                            }}>
                            <Text style={mStyleIssueItem.textUpdateUserName}>
                              {item.last_update_user_name}
                            </Text>
                            <Text
                              numberOfLines={2}
                              style={mStyleIssueItem.textUpdateContent}>
                              {item.last_message}
                            </Text>
                          </View>
                          <View style={[mStyle.triangleCorner]}></View>
                        </View>
                        <Text
                          style={[
                            mStyleIssueItem.textUpdateTime,
                            {marginEnd: 5, alignSelf: 'flex-end'},
                          ]}>
                          {updated +
                            ' ' +
                            moment(item.last_update)
                              .local()
                              .format('DD/MM/YYYY')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }
              }}
              keyExtractor={item => item.issue_id}
            />
          </ImageBackground>
          <TouchableOpacity
            onPress={() => {
              this.comeToNewIssueScreen();
            }}
            style={{
              width: screenWidth * 0.14,
              height: screenWidth * 0.14,
              backgroundColor: c_blue_light_filter,
              borderRadius: screenWidth * 0.1,
              position: 'absolute',
              bottom: 10,
              start: 10,
              zIndex: 999,
              justifyContent: 'center',
            }}>
            <Image
              source={require('../image/icon_plus_white.png')}
              resizeMode="cover"
              style={{
                width: screenWidth * 0.05,
                height: screenWidth * 0.05,
                alignSelf: 'center',
              }}
            />
          </TouchableOpacity>
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
            animationType="slide"
            presentationStyle="fullScreen"
            visible={this.state.isFilterDialogShown}
            transparent={true}>
            <IssuesFilterScreen
              statusType={this.state.issueStatusCount}
              filterList={this.state.filterList}
              isFastFilter={this.state.isFastFilter}
              closeIssueFilter={this.closeIssueFilterDialog}
              style={{
                zIndex: 2,
                width: screenWidth,
                height: screenHeight,
                top: 0,
                flex: 1,
              }}
            />
          </Modal>
          <Modal
            animationType="slide"
            presentationStyle="fullScreen"
            visible={this.state.isSortDialogShown}
            transparent={true}>
            <SortSelectScreen
              userInfo={this.state.userInfo}
              closeSortDialog={this.closeSortSelectDialog}
              sortText={this.state.sortText}
              style={{
                zIndex: 2,
                width: screenWidth,
                height: screenHeight,
                top: 0,
                flex: 1,
              }}
            />
          </Modal>
          <Modal
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => {
              this.closeLastUpdateDialog();
            }}
            visible={this.state.isLastUpdateDialogShown}
            transparent={true}>
            <LastUpdateScreen
              closeLastUpdateDialog={this.closeLastUpdateDialog}
              viewIssueItem={this.openIssueInfo}
              token={this.state.userInfo.token}
              style={{
                zIndex: 2,
                width: screenWidth,
                height: screenHeight,
                top: 0,
                flex: 1,
              }}
            />
          </Modal>
        </View>
      </SideMenu>
    );
  }
}

const mStyle = StyleSheet.create({
  textNormal: {
    fontFamily: 'Heebo',
    textAlign: 'right',
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
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderEndWidth: 10,
    borderTopWidth: 10,
    borderEndColor: 'transparent',
    borderTopColor: 'white',
  },
});

let didFocusSubscription;
let isBlur = true;
let isStartListenFCM = false;
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyleIssueItem = StyleSheet.create({
  textDeviceName: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
  },
  textCommendentName: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingStart: 5,
    paddingEnd: 5,
    backgroundColor: c_grey,
  },
  textStatus: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 14,
    color: '#ffffff',
    paddingStart: 5,
    paddingEnd: 5,
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: c_blue_filter,
  },
  textUpdateUserName: {
    fontFamily: 'Heebo',
    textAlign: 'right',
    fontSize: 12,
    color: '#000000',
  },
  textUpdateContent: {
    fontFamily: 'Heebo',
    fontSize: 14,
    color: '#000000',
  },
  textUpdateTime: {
    fontFamily: 'Heebo',
    fontSize: 12,
    color: c_grey_text,
  },
});
