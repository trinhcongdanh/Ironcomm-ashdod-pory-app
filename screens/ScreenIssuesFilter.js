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
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import {
  filterReport,
  MyIssuesTitle,
  sectionTimeTitle,
  filterDay,
  filterWeek,
  filterMonth,
  sectionStatusTitle,
  sectionLocationTitle,
  filterCenter,
  filterSouth,
  filterNorth,
  sectionIssueTypeTitle,
  applySelectedFilter,
  filterType,
} from '../resource/StringContentDefault';
import {
  api_url,
  c_background_issue_item,
  c_bg_filter_selected,
  c_blue_filter,
  c_blue_light_filter,
  c_grey,
  c_grey_filter,
  c_grey_text,
  c_loading_icon,
  c_main_blue,
  c_section_title,
  c_yellow_filter,
  greyHasOpacity,
  key_app_config,
  key_user_info,
  rc_success,
  rq_get_issue_types,
  rq_get_issues,
  rq_get_status_counters,
} from '../resource/BaseValue';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class IssuesFilterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterDaySelected: false,
      filterWeekSelected: false,
      filterMonthSelected: false,
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
      userInfo: {},
      appConfig: {},
      statusCounter: {},
      filterIssueType: [],
    };
  }

  componentDidMount() {
    console.log('componentDidMount');
    I18nManager.forceRTL(true);
    this._showLoadingBox();
    this.loadUserInfo().then(() => {
      this.loadAppConfig().then(() => {
        this.loadIssueTypes();
      });
    });
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
        let appConfig = {
          issue_statuses: jsonValue.issue_statuses,
          locations: {},
        };
        let locationsObj = Object.assign({}, jsonValue.place_description);
        Object.keys(locationsObj).map(key => {
          appConfig.locations[key] = {
            selected: false,
            name: locationsObj[key],
          };
        });
        allState.appConfig = appConfig;
        this.setState(allState);
      } else {
      }
    } catch (e) {
      // error reading value
    }
  };

  loadStatusCounters = async () => {
    let allState = this.state;
    let statusList = this.props.statusType;
    if (statusList != null) {
      allState.statusCounter = statusList;
      Object.keys(allState.statusCounter).map(key => {
        if (this.props.isFastFilter) {
          if (key + '' != '6' && key + '' != '7') {
            allState.statusCounter[key]['selected'] = true;
          } else {
            allState.statusCounter[key]['selected'] = false;
          }
        } else {
          allState.statusCounter[key]['selected'] = false;
        }
      });
    }
    this.setState(allState, () => {
      this.updateSelectedFilterForFirstTime();
    });
  };

  updateSelectedFilterForFirstTime() {
    let filterList = this.props.filterList;
    let isFastFilter = this.props.isFastFilter;
    let allState = this.state;
    console.log(JSON.stringify(allState));
    if (!isFastFilter) {
      for (let i = 0; i < filterList.length; i++) {
        let filterItem = filterList[i];
        switch (filterItem['type']) {
          case 'filter_period':
            if (filterItem['name'] == filterDay) {
              allState.filterDaySelected = true;
            } else if (filterItem['name'] == filterMonth) {
              allState.filterMonthSelected = true;
            } else if (filterItem['name'] == filterWeek) {
              allState.filterWeekSelected = true;
            }
            break;

          case 'filter_statuses':
            Object.keys(allState.statusCounter).map(key => {
              if (filterItem['name'] == allState.statusCounter[key]['name']) {
                allState.statusCounter[key]['selected'] = true;
              }
            });
            break;

          case 'filter_location':
            Object.keys(allState.appConfig.locations).map(key => {
              if (
                filterItem['name'] == allState.appConfig.locations[key]['name']
              ) {
                allState.appConfig.locations[key]['selected'] = true;
              }
            });
            // for (let i=0;i<allState.appConfig.locations)
            break;

          case 'filter_issue_types':
            for (let j = 0; j < allState.filterIssueType.length; j++) {
              if (filterItem['name'] == allState.filterIssueType[j]['name']) {
                allState.filterIssueType[j]['selected'] = true;
              }
            }
            break;
        }
      }
      this.setState(allState);
    } else {
      // let isFilterStatusEmpty = true;
      // for (let i = 0; i < filterList.length; i++) {
      //     let filterItem = filterList[i];
      //     if (filterItem['type'] == 'filter_statuses'){
      //         isFilterStatusEmpty = false;
      //     }
      // }
      // if (isFilterStatusEmpty) {
      //     Object.keys(allState.statusCounter).map((key)=>{
      //         if (key != 6 && key != 7 && key != "6" && key != "7"){
      //             allState.statusCounter[key]['selected'] = true;
      //         }
      //     });
      // }
      // this.setState(allState);
    }
  }

  loadIssueTypes = async () => {
    this._showLoadingBox();
    let dataObj = {
      request: rq_get_issue_types,
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
        if (responseJson.rc == rc_success) {
          console.log(responseJson);
          let allState = this.state;
          let issueTypes = responseJson.issue_types;
          if (issueTypes != null) {
            Object.keys(issueTypes).map(key => {
              // allState.statusCounter[key]['selected'] = false;
              let issueTypeItem = {
                id: key,
                name: issueTypes[key],
                selected: false,
              };
              allState.filterIssueType.push(issueTypeItem);
            });
          }
          this.setState(allState, () => {
            this.loadStatusCounters();
          });
        } else {
          alert(responseJson.message);
        }
      })
      .catch(error => {
        this._closeLoadingBox();
        alert(error);
      });
  };

  displayStatusSelection() {
    let statusCounterComponent = [];
    let statusCounterList = this.state.statusCounter;
    Object.keys(statusCounterList).map(key => {
      statusCounterComponent.push(
        <TouchableOpacity
          key={key}
          onPress={() => {
            this.updateFilter('status_' + key);
          }}
          style={[
            this.state.statusCounter[key]['selected']
              ? mStyleFilterType.selectedContainer
              : mStyleFilterType.normalContainer,
            {marginTop: 5, marginBottom: 5},
          ]}>
          <Text
            style={[
              mStyleFilterType.textCounter,
              {backgroundColor: statusCounterList[key]['color']},
            ]}>
            {statusCounterList[key]['count']}
          </Text>
          <Text
            style={
              this.state.statusCounter[key]['selected']
                ? mStyleFilterType.selectedText
                : mStyleFilterType.normalText
            }>
            {statusCounterList[key]['name']}
          </Text>
          <Image
            source={require('../image/icon_close_white.png')}
            resizeMode="contain"
            style={{
              width: screenWidth * 0.03,
              height: screenWidth * 0.03,
              marginStart: 5,
              opacity: this.state.statusCounter[key]['selected'] ? 1 : 0,
            }}
          />
        </TouchableOpacity>,
      );
    });
    return statusCounterComponent;
  }

  displayLocationSelection() {
    let locationComponent = [];
    let locationList = this.state.appConfig.locations;
    if (locationList != null) {
      Object.keys(locationList).map(key => {
        locationComponent.push(
          <TouchableOpacity
            key={key}
            onPress={() => {
              this.updateFilter('location_' + key);
            }}
            style={[
              this.state.appConfig.locations[key]['selected']
                ? mStyleFilterType.selectedContainer
                : mStyleFilterType.normalContainer,
              {marginTop: 5, marginBottom: 5},
            ]}>
            <Text
              style={
                this.state.appConfig.locations[key]['selected']
                  ? mStyleFilterType.selectedText
                  : mStyleFilterType.normalText
              }>
              {locationList[key]['name']}
            </Text>
            <Image
              source={require('../image/icon_close_white.png')}
              resizeMode="contain"
              style={{
                width: screenWidth * 0.03,
                height: screenWidth * 0.03,
                marginStart: 5,
                opacity: this.state.appConfig.locations[key]['selected']
                  ? 1
                  : 0,
              }}
            />
          </TouchableOpacity>,
        );
      });
    }
    return locationComponent;
  }

  // displayIssueType () {
  //     let issueLists = [];
  //     let issueTypeList = this.state.filterIssueType;
  //     for (let i = 0; i < issueTypeList.length; i++){
  //         let issueTypeItem = issueTypeList[i];
  //         issueLists.push(
  //             <TouchableOpacity
  //                 onPress={() => {
  //                     this.updateFilter("type " + i);
  //                 }}
  //                 style={[issueTypeItem.selected ? mStyleFilterType.selectedContainer : mStyleFilterType.normalContainer]}>
  //                 <Text style={issueTypeItem.selected ? mStyleFilterType.selectedText : mStyleFilterType.normalText}>{issueTypeItem.name}</Text>
  //                 <Image
  //                     source={require("../image/icon_close_white.png")}
  //                     resizeMode="contain"
  //                     style={{
  //                         width:screenWidth*0.03,
  //                         height:screenWidth*0.03,
  //                         marginStart: 5,
  //                         opacity: issueTypeItem.selected ? 1 : 0}}
  //                 />
  //             </TouchableOpacity>
  //         )
  //     }
  //     return issueLists;
  // }

  callCloseSelf = isCancel => {
    let selectedFilterList = [];
    let allState = this.state;
    if (allState.filterDaySelected) {
      selectedFilterList.push({
        type: 'filter_period',
        name: filterDay,
        value: 1,
      });
    }
    if (allState.filterWeekSelected) {
      selectedFilterList.push({
        type: 'filter_period',
        name: filterWeek,
        value: 2,
      });
    }
    if (allState.filterMonthSelected) {
      selectedFilterList.push({
        type: 'filter_period',
        name: filterMonth,
        value: 3,
      });
    }
    Object.keys(allState.statusCounter).map(key => {
      if (allState.statusCounter[key]['selected']) {
        selectedFilterList.push({
          type: 'filter_statuses',
          name: allState.statusCounter[key]['name'],
          color: allState.statusCounter[key]['color'],
          count: allState.statusCounter[key]['count'],
          value: key,
        });
      }
    });
    Object.keys(allState.appConfig.locations).map(key => {
      if (allState.appConfig.locations[key]['selected']) {
        selectedFilterList.push({
          type: 'filter_location',
          name: allState.appConfig.locations[key]['name'],
          value: key,
        });
      }
    });
    for (let i = 0; i < allState.filterIssueType.length; i++) {
      if (allState.filterIssueType[i]['selected']) {
        selectedFilterList.push({
          type: 'filter_issue_types',
          name: allState.filterIssueType[i]['name'],
          value: allState.filterIssueType[i]['id'],
        });
      }
    }
    this.props.closeIssueFilter(JSON.stringify(selectedFilterList), isCancel);
  };

  updateFilter = type => {
    let allState = this.state;
    if (type == 'FDay') {
      if (allState.filterDaySelected) {
        allState.filterDaySelected = false;
      } else {
        allState.filterDaySelected = true;
        allState.filterMonthSelected = false;
        allState.filterWeekSelected = false;
      }
    } else if (type == 'FWeek') {
      if (allState.filterWeekSelected) {
        allState.filterWeekSelected = false;
      } else {
        allState.filterWeekSelected = true;
        allState.filterMonthSelected = false;
        allState.filterDaySelected = false;
      }
    } else if (type == 'FMonth') {
      if (allState.filterMonthSelected) {
        allState.filterMonthSelected = false;
      } else {
        allState.filterMonthSelected = true;
        allState.filterWeekSelected = false;
        allState.filterDaySelected = false;
      }
    } else if (type.indexOf('type') >= 0) {
      let pos = type.split('type ')[1];
      allState.filterIssueType[pos]['selected'] =
        !allState.filterIssueType[pos]['selected'];
    } else if (type.indexOf('status_') >= 0) {
      let pos = type.split('status_')[1];
      allState.statusCounter[pos]['selected'] =
        !allState.statusCounter[pos]['selected'];
    } else if (type.indexOf('location_') >= 0) {
      let pos = type.split('location_')[1];
      let setValue = !allState.appConfig.locations[pos.toString()]['selected'];
      Object.keys(allState.appConfig.locations).map(key => {
        allState.appConfig.locations[key]['selected'] = false;
      });
      allState.appConfig.locations[pos]['selected'] = setValue;
    }
    this.setState(allState);
  };

  render() {
    return (
      <View style={{width: screenWidth, flex: 1, flexDirection: 'column'}}>
        <TouchableOpacity
          onPress={() => {
            this.callCloseSelf(true);
          }}
          style={{
            height: screenWidth * 0.1 + 10,
            backgroundColor: 'rgba(52, 52, 52, 0)',
          }}></TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            backgroundColor: c_background_issue_item,
          }}>
          <TouchableOpacity
            onPress={() => {
              this.callCloseSelf(true);
            }}>
            <Image
              source={require('../image/icon_close_black.png')}
              resizeMode="contain"
              style={{width: screenWidth * 0.07, height: screenWidth * 0.07}}
            />
          </TouchableOpacity>
          <Text
            style={[
              mStyle.textBold,
              {flex: 1, textAlign: 'center', color: '#000000'},
            ]}>
            {filterReport}
          </Text>
          <Image
            source={require('../image/icon_filter_black.png')}
            resizeMode="contain"
            style={{width: screenWidth * 0.05, height: screenWidth * 0.05}}
          />
        </View>
        <View style={{backgroundColor: c_background_issue_item, flex: 1}}>
          <ScrollView>
            <Text
              style={[
                mStyle.textNormal,
                {
                  flex: 1,
                  textAlign: 'center',
                  color: c_section_title,
                  marginTop: 15,
                  marginBottom: 10,
                },
              ]}>
              {sectionTimeTitle}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                backgroundColor: '#ffffff',
                padding: 10,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.updateFilter('FMonth');
                }}
                style={[
                  this.state.filterMonthSelected
                    ? mStyleFilterType.selectedContainer
                    : mStyleFilterType.normalContainer,
                ]}>
                <Text
                  style={
                    this.state.filterMonthSelected
                      ? mStyleFilterType.selectedText
                      : mStyleFilterType.normalText
                  }>
                  {filterMonth}
                </Text>
                <Image
                  source={require('../image/icon_close_white.png')}
                  resizeMode="contain"
                  style={{
                    width: screenWidth * 0.03,
                    height: screenWidth * 0.03,
                    marginStart: 5,
                    opacity: this.state.filterMonthSelected ? 1 : 0,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.updateFilter('FWeek');
                }}
                style={[
                  this.state.filterWeekSelected
                    ? mStyleFilterType.selectedContainer
                    : mStyleFilterType.normalContainer,
                ]}>
                <Text
                  style={
                    this.state.filterWeekSelected
                      ? mStyleFilterType.selectedText
                      : mStyleFilterType.normalText
                  }>
                  {filterWeek}
                </Text>
                <Image
                  source={require('../image/icon_close_white.png')}
                  resizeMode="contain"
                  style={{
                    width: screenWidth * 0.03,
                    height: screenWidth * 0.03,
                    marginStart: 5,
                    opacity: this.state.filterWeekSelected ? 1 : 0,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.updateFilter('FDay');
                }}
                style={[
                  this.state.filterDaySelected
                    ? mStyleFilterType.selectedContainer
                    : mStyleFilterType.normalContainer,
                ]}>
                <Text
                  style={
                    this.state.filterDaySelected
                      ? mStyleFilterType.selectedText
                      : mStyleFilterType.normalText
                  }>
                  {filterDay}
                </Text>
                <Image
                  source={require('../image/icon_close_white.png')}
                  resizeMode="contain"
                  style={{
                    width: screenWidth * 0.03,
                    height: screenWidth * 0.03,
                    marginStart: 5,
                    opacity: this.state.filterDaySelected ? 1 : 0,
                  }}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                mStyle.textNormal,
                {
                  flex: 1,
                  textAlign: 'center',
                  color: c_section_title,
                  marginTop: 15,
                  marginBottom: 10,
                },
              ]}>
              {sectionStatusTitle}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                backgroundColor: '#ffffff',
                padding: 10,
              }}>
              {this.displayStatusSelection()}
            </View>

            <Text
              style={[
                mStyle.textNormal,
                {
                  flex: 1,
                  textAlign: 'center',
                  color: c_section_title,
                  marginTop: 15,
                  marginBottom: 10,
                },
              ]}>
              {sectionLocationTitle}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                backgroundColor: '#ffffff',
                padding: 10,
              }}>
              {this.displayLocationSelection()}
            </View>
            <Text
              style={[
                mStyle.textNormal,
                {
                  flex: 1,
                  textAlign: 'center',
                  color: c_section_title,
                  marginTop: 15,
                  display: 'none',
                },
              ]}>
              {sectionIssueTypeTitle}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                backgroundColor: '#ffffff',
                display: 'none',
                padding: 10,
              }}>
              {/*{this.displayIssueType()}*/}
            </View>
          </ScrollView>
        </View>
        <TouchableWithoutFeedback
          onPress={() => {
            this.callCloseSelf(false);
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
              backgroundColor: c_main_blue,
            }}>
            <View style={{flex: 1, alignItems: 'flex-start'}}>
              <Image
                source={require('../image/icon_filter.png')}
                resizeMode="contain"
                style={{width: screenWidth * 0.07, height: screenWidth * 0.07}}
              />
            </View>
            <Text style={[mStyle.textButton]}>{applySelectedFilter}</Text>
            <View style={{flex: 1}}></View>
          </View>
        </TouchableWithoutFeedback>
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
    fontSize: 16,
  },
  textBold: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textTitle: {
    fontFamily: 'Heebo',
    textAlign: 'left',
    fontSize: 18,
  },
  textButton: {
    fontFamily: 'Heebo',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

const mStyleFilterType = StyleSheet.create({
  normalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    paddingStart: 5,
    paddingEnd: 5,
    backgroundColor: '#ffffff',
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    paddingStart: 5,
    paddingEnd: 5,
    borderRadius: 5,
    backgroundColor: c_bg_filter_selected,
  },
  selectedText: {
    fontFamily: 'Heebo',
    fontSize: 16,
    color: '#ffffff',
    marginStart: 5,
  },
  normalText: {
    fontFamily: 'Heebo',
    fontSize: 16,
    color: '#000000',
    marginStart: 5,
  },
  textCounter: {
    fontFamily: 'Heebo',
    fontSize: 16,
    color: '#ffffff',
    marginStart: 5,
    textAlign: 'center',
    lineHeight: screenWidth * 0.06,
    width: screenWidth * 0.06,
    height: screenWidth * 0.06,
  },
});
