/*eslint prettier/prettier:0*/
/**
 * @format
 * @flow
 */

import * as React from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

export default class RNFloatingInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      displayText: '',
    };
  }

  handleFocus = () => {
    this.setState({isFocused: true});
  };
  handleBlur = () => {
    if (this.state.displayText == '') {
      this.setState({isFocused: false});
    } else {
      this.setState({isFocused: true});
    }
  };

  componentDidMount() {}

  updateValue = text => {
    let allState = this.state;
    allState.displayText = text;
    if (text == '') {
      allState.isFocused = false;
    } else {
      allState.isFocused = true;
    }
    this.setState(allState);
  };

  render() {
    const {
      label,
      labelSize,
      labelSizeLarge,
      labelColor,
      textInputStyle,
      onPress,
      onChangeTextInput,
      editable = false,
      showArrow = true,
      source,
      ...props
    } = this.props;
    const {isFocused} = this.state;
    const labelStyle = {
      position: 'absolute',
      left: 0,
      top: !isFocused ? labelSize : 0,
      fontSize: !isFocused ? labelSizeLarge : labelSize,
      color: !isFocused ? labelColor : labelColor,
    };
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{flexDirection: 'row', alignItems: 'flex-end'}}>
        <View style={{paddingTop: labelSize}}>
          <Text style={labelStyle}>{label}</Text>
          <TextInput
            {...props}
            style={[textInputStyle]}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            editable={editable}
            value={this.state.displayText}
            onChangeText={text => {
              this.setState({displayName: text});
              if (editable) {
                this.props.onChangeTextInput(text);
              }
            }}
          />
        </View>
        <Image
          source={source}
          resizeMode="cover"
          style={{
            width: screenWidth * 0.03,
            height: screenWidth * 0.03 * (14 / 24),
            marginBottom: 10,
            opacity: showArrow ? 1 : 0,
          }}
        />
      </TouchableOpacity>
    );
  }
}
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
