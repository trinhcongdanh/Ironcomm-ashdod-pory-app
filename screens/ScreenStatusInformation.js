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
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {
  lastUpdateTitle,
  sortByDateCreated,
  sortByPrior,
  sortByStatus,
  sortScreenTitle,
  statusInformation,
  updated,
} from '../resource/StringContentDefault';
import {
  ActiveIssueScreenName,
  api_url,
  c_background_issue_item,
  c_bg_filter_selected,
  c_bg_issue_description,
  c_bg_line,
  c_blue_light_filter,
  c_grey_text,
  c_loading_icon,
  c_main_blue,
  c_section_title,
  c_status_in_progress,
  c_text_selected,
  greyHasOpacity,
  key_app_config,
  rc_success,
  rq_get_last_updates,
  rq_update_issue,
} from '../resource/BaseValue';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class StatusInformationScreen extends React.Component {
  constructor(props) {
    super(props);
    console.log(props.token);
    this.state = {
      statusList: [],
      token: props.token,
      indicatorSizeW: 0,
      indicatorSizeH: 0,
      indicatorDisplay: false,
    };
  }

  componentDidMount() {
    console.log('componentDidMount');
    // let pToken = this.props.token;
    // this.setState({token: pToken});
    this.loadAppConfig();
  }

  loadAppConfig = async () => {
    try {
      const value = await AsyncStorage.getItem(key_app_config);
      if (value != null) {
        // value previously stored
        const jsonValue = JSON.parse(value);
        // jsonValue.issue_statuses
        let statusListInJs = jsonValue.issue_statuses;
        let allState = this.state;
        Object.keys(statusListInJs).map(key => {
          let statusItem = {
            id: key,
            name: statusListInJs[key]['name'],
            color: statusListInJs[key]['color'],
            description: statusListInJs[key]['description'],
          };
          allState.statusList.push(statusItem);
        });
        this.setState(allState);
      } else {
      }
    } catch (e) {
      // error reading value
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

  render() {
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    return (
      <View
        style={{
          width: screenWidth,
          flex: 1,
          flexDirection: 'column',
          backgroundColor: c_background_issue_item,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            backgroundColor: c_main_blue,
          }}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.goBack();
              }}>
              <Image
                source={require('../image/icon_close_white.png')}
                resizeMode="contain"
                style={{width: screenWidth * 0.07, height: screenWidth * 0.07}}
              />
            </TouchableOpacity>
            <View style={{flex: 1}}></View>
          </View>
          <Text style={[mStyle.textTitle]}>{statusInformation}</Text>
          <View style={{flex: 1}}></View>
        </View>
        <FlatList
          style={{marginTop: 10}}
          data={this.state.statusList}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                padding: 15,
              }}>
              <View
                style={{
                  flex: 0.3,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 5,
                }}>
                <Text
                  style={[
                    mStyle.textIssueName,
                    {
                      backgroundColor: item.color,
                      color: '#ffffff',
                      paddingTop: 5,
                      paddingBottom: 5,
                      paddingStart: 10,
                      paddingEnd: 10,
                    },
                  ]}>
                  {item.name}
                </Text>
              </View>
              <View style={{flex: 0.7, marginStart: 5}}>
                <Text
                  style={[mStyle.textIssueDescription, {color: c_grey_text}]}>
                  {item.description}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={item => item}
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
    );
  }
}

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
  textIssueName: {
    fontFamily: 'Heebo',
    fontSize: 13,
    fontWeight: 'bold',
  },
  textIssueDescription: {
    fontFamily: 'Heebo',
    fontSize: 13,
  },
  textTitle: {
    fontFamily: 'Heebo',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});
