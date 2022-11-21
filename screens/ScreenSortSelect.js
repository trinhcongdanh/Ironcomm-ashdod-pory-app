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
} from 'react-native';
import {
  sortByDateCreated,
  sortByLastUpdate,
  sortByPrior,
  sortBySmallSort,
  sortByStatus,
  sortScreenTitle,
} from '../resource/StringContentDefault';
import {
  c_background_issue_item,
  c_bg_filter_selected,
  c_bg_line,
  c_main_blue,
  c_section_title,
  c_text_selected,
} from '../resource/BaseValue';

export default class SortSelectScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortByDateCreatedSelected: false,
      sortByPrioritySelected: false,
      sortByStatusSelected: false,
      sortByLastUpdate: true,
      sortBySmallSort: false,
      userInfo: this.props.userInfo,
    };
  }

  componentDidMount() {
    I18nManager.forceRTL(true);
    console.log('componentDidMount');
    let sortTypeName = this.props.sortText;
    if (sortTypeName == sortByDateCreated) {
      this.selectSortType(0);
    } else if (sortTypeName == sortByPrior) {
      this.selectSortType(1);
    } else if (sortTypeName == sortByStatus) {
      this.selectSortType(2);
    } else if (sortTypeName == sortByLastUpdate) {
      this.selectSortType(3);
    } else if (sortTypeName == sortBySmallSort) {
      this.selectSortType(4);
    } else {
      this.selectSortType(3);
    }
  }

  callCloseSelf = () => {
    this.props.closeSortDialog('');
  };

  callCloseSelfWithSelectSort = () => {
    let selectecText = '';
    if (this.state.sortByDateCreatedSelected) {
      selectecText = sortByDateCreated;
    } else if (this.state.sortByPrioritySelected) {
      selectecText = sortByPrior;
    } else if (this.state.sortByStatusSelected) {
      selectecText = sortByStatus;
    } else if (this.state.sortByLastUpdate) {
      selectecText = sortByLastUpdate;
    } else if (this.state.sortBySmallSort) {
      selectecText = sortBySmallSort;
    }
    this.props.closeSortDialog(selectecText);
  };

  selectSortType = pos => {
    let allState = this.state;
    allState.sortByDateCreatedSelected = false;
    allState.sortByPrioritySelected = false;
    allState.sortByStatusSelected = false;
    allState.sortByLastUpdate = false;
    allState.sortBySmallSort = false;
    if (pos == 0) {
      allState.sortByDateCreatedSelected = true;
    } else if (pos == 1) {
      allState.sortByPrioritySelected = true;
    } else if (pos == 2) {
      allState.sortByStatusSelected = true;
    } else if (pos == 3) {
      allState.sortByLastUpdate = true;
    } else if (pos == 4) {
      allState.sortBySmallSort = true;
    }
    this.setState(allState);
  };

  render() {
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    return (
      <View style={{width: screenWidth, flex: 1, flexDirection: 'column'}}>
        <TouchableOpacity
          onPress={() => {
            this.callCloseSelf();
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
              this.callCloseSelf();
            }}>
            <Image
              source={require('../image/icon_close_black.png')}
              resizeMode="contain"
              style={{width: screenWidth * 0.07, height: screenWidth * 0.07}}
            />
          </TouchableOpacity>
          <Text
            style={[
              mStyle.textTitle,
              {flex: 1, textAlign: 'center', color: '#000000'},
            ]}>
            {sortScreenTitle}
          </Text>
          <Image
            source={require('../image/icon_filter_black.png')}
            resizeMode="contain"
            style={{
              width: screenWidth * 0.05,
              height: screenWidth * 0.05,
              opacity: 0,
            }}
          />
        </View>
        <View
          style={{
            backgroundColor: c_background_issue_item,
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: screenWidth,
              height: 0.5,
              backgroundColor: c_bg_line,
            }}></View>
          <TouchableOpacity
            onPress={() => {
              this.selectSortType(0);
            }}
            style={{
              width: screenWidth,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: this.state.sortByDateCreatedSelected
                ? '#ffffff'
                : c_background_issue_item,
            }}>
            <Image
              source={require('../image/icon_ok.png')}
              resizeMode="contain"
              style={{
                width: screenWidth * 0.03,
                height: screenWidth * 0.03 * (19 / 21),
                position: 'absolute',
                start: screenWidth * 0.1,
                opacity: this.state.sortByDateCreatedSelected ? 1 : 0,
              }}
            />
            <Text
              style={[
                this.state.sortByDateCreatedSelected
                  ? mStyle.textSelected
                  : mStyle.textNormal,
                {textAlign: 'center', marginTop: 15, marginBottom: 10},
              ]}>
              {sortByDateCreated}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: screenWidth,
              height: 0.5,
              backgroundColor: c_bg_line,
            }}></View>
          <TouchableOpacity
            onPress={() => {
              this.selectSortType(1);
            }}
            style={{
              width: screenWidth,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: this.state.sortByPrioritySelected
                ? '#ffffff'
                : c_background_issue_item,
            }}>
            <Image
              source={require('../image/icon_ok.png')}
              resizeMode="contain"
              style={{
                width: screenWidth * 0.03,
                height: screenWidth * 0.03 * (19 / 21),
                position: 'absolute',
                start: screenWidth * 0.1,
                opacity: this.state.sortByPrioritySelected ? 1 : 0,
              }}
            />
            <Text
              style={[
                this.state.sortByPrioritySelected
                  ? mStyle.textSelected
                  : mStyle.textNormal,
                {textAlign: 'center', marginTop: 15, marginBottom: 10},
              ]}>
              {sortByPrior}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: screenWidth,
              height: 0.5,
              backgroundColor: c_bg_line,
            }}></View>
          <TouchableOpacity
            onPress={() => {
              this.selectSortType(2);
            }}
            style={{
              width: screenWidth,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: this.state.sortByStatusSelected
                ? '#ffffff'
                : c_background_issue_item,
            }}>
            <Image
              source={require('../image/icon_ok.png')}
              resizeMode="contain"
              style={{
                width: screenWidth * 0.03,
                height: screenWidth * 0.03 * (19 / 21),
                position: 'absolute',
                start: screenWidth * 0.1,
                opacity: this.state.sortByStatusSelected ? 1 : 0,
              }}
            />
            <Text
              style={[
                this.state.sortByStatusSelected
                  ? mStyle.textSelected
                  : mStyle.textNormal,
                {textAlign: 'center', marginTop: 15, marginBottom: 10},
              ]}>
              {sortByStatus}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: screenWidth,
              height: 0.5,
              backgroundColor: c_bg_line,
            }}></View>
          <TouchableOpacity
            onPress={() => {
              this.selectSortType(3);
            }}
            style={{
              width: screenWidth,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: this.state.sortByLastUpdate
                ? '#ffffff'
                : c_background_issue_item,
            }}>
            <Image
              source={require('../image/icon_ok.png')}
              resizeMode="contain"
              style={{
                width: screenWidth * 0.03,
                height: screenWidth * 0.03 * (19 / 21),
                position: 'absolute',
                start: screenWidth * 0.1,
                opacity: this.state.sortByLastUpdate ? 1 : 0,
              }}
            />
            <Text
              style={[
                this.state.sortByLastUpdate
                  ? mStyle.textSelected
                  : mStyle.textNormal,
                {textAlign: 'center', marginTop: 15, marginBottom: 10},
              ]}>
              {sortByLastUpdate}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: screenWidth,
              height: 0.5,
              backgroundColor: c_bg_line,
            }}></View>
          <TouchableOpacity
            onPress={() => {
              this.selectSortType(4);
            }}
            style={{
              width: screenWidth,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: this.state.sortBySmallSort
                ? '#ffffff'
                : c_background_issue_item,
              display:
                this.state.userInfo.type == 3 || this.state.userInfo.type == 6
                  ? 'flex'
                  : 'none',
            }}>
            <Image
              source={require('../image/icon_ok.png')}
              resizeMode="contain"
              style={{
                width: screenWidth * 0.03,
                height: screenWidth * 0.03 * (19 / 21),
                position: 'absolute',
                start: screenWidth * 0.1,
                opacity: this.state.sortBySmallSort ? 1 : 0,
              }}
            />
            <Text
              style={[
                this.state.sortBySmallSort
                  ? mStyle.textSelected
                  : mStyle.textNormal,
                {textAlign: 'center', marginTop: 15, marginBottom: 10},
              ]}>
              {sortBySmallSort}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: screenWidth,
              height: 0.5,
              backgroundColor: c_bg_line,
              display:
                this.state.userInfo.type == 3 || this.state.userInfo.type == 6
                  ? 'flex'
                  : 'none',
            }}></View>
        </View>
        <TouchableWithoutFeedback
          onPress={() => {
            this.callCloseSelfWithSelectSort();
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: screenWidth,
              alignItems: 'center',
              padding: 10,
              backgroundColor: c_main_blue,
            }}>
            <Text style={[mStyle.textButton, {width: screenWidth}]}>
              {sortScreenTitle}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const mStyle = StyleSheet.create({
  textNormal: {
    fontFamily: 'Heebo',
    textAlign: 'center',
    fontSize: 16,
    flex: 1,
    color: c_section_title,
  },
  textSelected: {
    fontFamily: 'Heebo',
    textAlign: 'center',
    fontSize: 16,
    flex: 1,
    color: c_section_title,
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
    fontSize: 14,
  },
  textButton: {
    fontFamily: 'Heebo',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
