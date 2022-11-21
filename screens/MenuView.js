/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
  Dimensions,
  Alert,
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  c_background_issue_item,
  c_section_title,
  c_grey,
  c_grey_text,
  c_status_line,
  c_bg_line,
  c_bg_issue_description,
  menu_issue_page_index,
  menu_new_issue_index,
  menu_contact_index,
  menu_status_info_index,
  menu_log_out_index,
} from '../resource/BaseValue';
import {
  areYouAreLogout,
  cancel,
  menu_about,
  menu_another_item,
  menu_contact,
  menu_icon,
  menu_issue_page,
  menu_logout,
  menu_new_issue,
  menu_other_item,
  ok_text,
  statusInformation,
  version,
} from '../resource/StringContentDefault';
import DeviceInfo from 'react-native-device-info';

export default function MenuView({onItemSelected}) {
  useEffect(() => {
    I18nManager.forceRTL(true);
  }, []);
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        height: screenHeight,
        width: screenWidth,
        backgroundColor: c_background_issue_item,
      }}>
      <TouchableOpacity onPress={() => onItemSelected(0)}>
        <Image
          source={require('../image/icon_menu_blue.png')}
          resizeMode="contain"
          style={{
            width: screenWidth * 0.05,
            height: screenWidth * 0.05,
            margin: 10,
          }}
        />
      </TouchableOpacity>
      <View
        style={{
          width: screenWidth,
          height: 1,
          backgroundColor: c_bg_issue_description,
        }}></View>
      <TouchableOpacity
        onPress={() => onItemSelected(menu_issue_page_index)}
        style={{flexDirection: 'row'}}>
        <Text style={[mStyle.textMenuItem, {flex: 1}]}>{menu_issue_page}</Text>
      </TouchableOpacity>
      <View
        style={{
          width: screenWidth,
          height: 1,
          backgroundColor: c_bg_issue_description,
        }}></View>
      <TouchableOpacity onPress={() => onItemSelected(menu_new_issue_index)}>
        <Text style={[mStyle.textMenuItem]}>{menu_new_issue}</Text>
      </TouchableOpacity>
      <View
        style={{
          width: screenWidth,
          height: 1,
          backgroundColor: c_bg_issue_description,
        }}></View>
      <TouchableOpacity onPress={() => onItemSelected(menu_contact_index)}>
        <Text style={[mStyle.textMenuItem]}>{menu_contact}</Text>
      </TouchableOpacity>
      <View
        style={{
          width: screenWidth,
          height: 1,
          backgroundColor: c_bg_issue_description,
        }}></View>
      <TouchableOpacity onPress={() => onItemSelected(menu_status_info_index)}>
        <Text style={[mStyle.textMenuItem]}>{statusInformation}</Text>
      </TouchableOpacity>
      <View
        style={{
          width: screenWidth,
          height: 1,
          backgroundColor: c_bg_issue_description,
        }}></View>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            '',
            areYouAreLogout,
            [
              {
                text: cancel,
                onPress: () => {},
                style: 'cancel',
              },
              {
                text: ok_text,
                onPress: () => {
                  onItemSelected(menu_log_out_index);
                },
              },
            ],
            {cancelable: true},
          );
        }}>
        <Text style={[mStyle.textMenuItem]}>{menu_logout}</Text>
      </TouchableOpacity>
      <View
        style={{
          width: screenWidth,
          height: 1,
          backgroundColor: c_bg_issue_description,
        }}></View>
      <View style={{flex: 0.95}} />
      <Text style={[mStyle.textMenuItem, {alignSelf: 'center'}]}>
        {version} {DeviceInfo.getVersion()}.{DeviceInfo.getBuildNumber()}
      </Text>
    </View>
  );
}

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const mStyle = StyleSheet.create({
  textMenuItem: {
    fontFamily: 'Heebo',
    fontSize: 15,
    color: c_section_title,
    padding: 15,
  },
});
