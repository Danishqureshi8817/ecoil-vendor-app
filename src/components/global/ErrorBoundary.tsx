import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {
  getCurrentCrashScreen,
  recordCrashError,
} from '@/services/crashReporting';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React, {Component, type ErrorInfo, type ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    recordCrashError(
      error,
      `React ErrorBoundary on ${getCurrentCrashScreen()} | ${info.componentStack?.slice(0, 400) ?? ''}`,
      true,
    );
  }

  handleRetry = () => {
    this.setState({hasError: false});
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <CustomText
            fontFamily={Fonts.montserrat.semiBold}
            fontSize={RFValue(14)}
            style={styles.title}>
            Something went wrong
          </CustomText>
          <CustomText
            fontFamily={Fonts.montserrat.regular}
            fontSize={RFValue(10)}
            style={styles.message}>
            The issue has been reported. Please try again.
          </CustomText>
          <Pressable
            style={({pressed}) => [styles.btn, pressed && styles.pressed]}
            onPress={this.handleRetry}>
            <CustomText
              fontFamily={Fonts.montserrat.semiBold}
              fontSize={RFValue(11)}
              style={styles.btnText}>
              Try Again
            </CustomText>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(28),
    backgroundColor: Colors.bg,
  },
  title: {
    color: Colors.black,
    textAlign: 'center',
    marginBottom: moderateScaleVertical(8),
  },
  message: {
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: moderateScaleVertical(20),
  },
  btn: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(22),
    paddingVertical: moderateScaleVertical(12),
  },
  btnText: {color: Colors.white},
  pressed: {opacity: 0.9},
});
