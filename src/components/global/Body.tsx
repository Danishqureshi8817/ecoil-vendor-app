
import { moderateScale } from "@/utils/responsiveSize";
import React, { useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-aware-scroll-view";

interface BodyProps extends KeyboardAwareScrollViewProps {
  backgroundColor?: string;
  children?: React.ReactNode;
}

function Body({
  style,
  backgroundColor,
  scrollStyle,
  ...rest
}: BodyProps & {scrollStyle?: KeyboardAwareScrollViewProps['style']}) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        containerStyle: {
          flexGrow: 1,
          backgroundColor: backgroundColor ?? 'transparent',
        },
      }),
    [backgroundColor],
  );

  return (
    <KeyboardAwareScrollView
      style={[{flex: 1}, scrollStyle]}
      contentContainerStyle={[styles.containerStyle, style]}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      extraScrollHeight={
        Platform.OS === 'android' ? moderateScale(150) : moderateScale(80)
      }
      enableAutomaticScroll
      enableResetScrollToCoords={Platform.OS === 'ios'}
      keyboardOpeningTime={Platform.OS === 'ios' ? 250 : 0}
      {...rest}
    />
  );
}

export default Body;
