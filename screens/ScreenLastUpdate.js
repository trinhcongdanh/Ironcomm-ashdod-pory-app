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
  I18nManager,
} from 'react-native';
import {
  lastUpdateTitle,
  sortByDateCreated,
  sortByPrior,
  sortByStatus,
  sortScreenTitle,
  updated,
} from '../resource/StringContentDefault';
import {
  ActiveIssueScreenName,
  api_url,
  c_background_issue_item,
  c_bg_filter_selected,
  c_bg_issue_description,
  c_bg_line,
  c_grey_text,
  c_loading_icon,
  c_main_blue,
  c_section_title,
  c_status_in_progress,
  c_text_selected,
  greyHasOpacity,
  rc_success,
  rq_get_last_updates,
  rq_update_issue,
} from '../resource/BaseValue';
import moment from 'moment';

export default class LastUpdateScreen extends React.Component {
  constructor(props) {
    super(props);
    console.log(props.token);
    this.state = {
      updates: [],
      newUpdateCount: 4,
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
    I18nManager.forceRTL(true);
    this.getLastUpdates();
  }

  getLastUpdates = async () => {
    this._showLoadingBox();
    let dataObj = {
      request: rq_get_last_updates,
      token: this.state.token,
      project: 1
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
          let allState = this.state;
          allState.updates = responseJson.updates;
          this.setState(allState);
        } else {
          alert(responseJson.message);
        }
      })
      .catch(error => {
        this._closeLoadingBox();
        alert(error);
      });
  };

  callCloseSelf = () => {
    this.props.closeLastUpdateDialog('');
  };

  callViewIssueInfo = issueItem => {
    this.props.viewIssueItem(issueItem);
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
        <View style={{flexDirection: 'row', alignItems: 'center', padding: 15}}>
          <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
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
            <View style={{flex: 1}}></View>
            <Text style={[mStyle.textNotification]}>
              {this.state.updates.length}
            </Text>
          </View>
          <Text
            style={[mStyle.textTitle, {textAlign: 'center', color: '#000000'}]}>
            {lastUpdateTitle}
          </Text>
          <View style={{flex: 1}}></View>
        </View>
        <View
          style={{
            width: screenWidth,
            height: 1,
            backgroundColor: c_bg_issue_description,
          }}></View>
        <FlatList
          style={{marginTop: 10}}
          data={this.state.updates}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => (
            <TouchableOpacity
              onPress={() => {
                this.callViewIssueInfo(item);
              }}
              style={{
                flexDirection: 'row',
                marginBottom: 10,
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: c_background_issue_item,
                alignItems: 'flex-start',
                borderBottomColor: c_bg_line,
                borderBottomWidth: 1,
              }}>
              <Image
                source={require('../image/icon_notification_blue.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.07,
                  height: screenWidth * 0.07 * (48 / 43),
                  marginStart: 10,
                }}
              />
              <View
                style={{
                  flexDirection: 'column',
                  flex: 1,
                  alignItems: 'flex-start',
                  marginStart: 10,
                  marginEnd: 5,
                }}>
                <Text style={[mStyle.textIssueName]}>{item.issue_name}</Text>
                <Text style={[mStyle.textUpdateText]}>{item.update_text}</Text>
                <Text style={[mStyle.textUpdateTime]}>
                  {updated + ' ' + moment(item.created_on).format('DD/MM/YYYY, HH:mm')}
                </Text>
              </View>
              <Image
                source={require('../image/icon_arrow_left_black.png')}
                resizeMode="cover"
                style={{
                  width: screenWidth * 0.03,
                  height: screenWidth * 0.03 * (24 / 14),
                  marginEnd: 10,
                }}
              />
            </TouchableOpacity>
          )}
          keyExtractor={item => item.chat_message_id}
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
  textUpdateText: {
    fontFamily: 'Heebo',
    fontSize: 14,
    color: c_section_title,
  },
  textIssueName: {
    fontFamily: 'Heebo',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  textUpdateTime: {
    fontFamily: 'Heebo',
    fontSize: 12,
    color: c_grey_text,
  },
  textTitle: {
    fontFamily: 'Heebo',
    fontSize: 16,
    color: c_section_title,
  },
  textNotification: {
    width: screenWidth * 0.07,
    height: screenWidth * 0.07,
    borderRadius: screenWidth * 0.07,
    lineHeight: screenWidth * 0.07,
    marginEnd: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Heebo',
    fontSize: 14,
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: c_status_in_progress,
  },
});
