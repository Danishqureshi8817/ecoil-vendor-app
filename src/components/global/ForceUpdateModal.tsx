import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {memo} from 'react';
import {Modal, Platform, Pressable, StyleSheet, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type Props = {
  visible: boolean;
  liveVersion: string;
  onUpdate: () => void;
};

function ForceUpdateModal({visible, liveVersion, onUpdate}: Props) {
  const storeLabel = Platform.OS === 'ios' ? 'App Store' : 'Play Store';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        /* Force update — do not dismiss */
      }}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons
              name="cloud-download-outline"
              size={moderateScale(32)}
              color={Colors.brand}
            />
          </View>

          <CustomText
            fontFamily={Fonts.montserrat.semiBold}
            fontSize={RFValue(14)}
            style={styles.title}>
            Update Required
          </CustomText>

          <CustomText
            fontFamily={Fonts.montserrat.regular}
            fontSize={RFValue(10)}
            style={styles.message}>
            A new version ({liveVersion}) is available. Please update the app
            from the {storeLabel} to continue using Ecoil.
          </CustomText>

          <Pressable
            style={({pressed}) => [styles.updateBtn, pressed && styles.pressed]}
            onPress={onUpdate}
            accessibilityRole="button"
            accessibilityLabel={`Update on ${storeLabel}`}>
            <Ionicons name="open-outline" size={18} color={Colors.white} />
            <CustomText
              fontFamily={Fonts.montserrat.semiBold}
              fontSize={RFValue(11)}
              style={styles.updateText}>
              Update Now
            </CustomText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(24),
  },
  card: {
    width: '100%',
    maxWidth: moderateScale(340),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(18),
    paddingHorizontal: moderateScale(22),
    paddingTop: moderateScaleVertical(28),
    paddingBottom: moderateScaleVertical(22),
    alignItems: 'center',
  },
  iconWrap: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScaleVertical(16),
  },
  title: {
    color: Colors.black,
    textAlign: 'center',
    marginBottom: moderateScaleVertical(8),
  },
  message: {
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: RFValue(16),
    marginBottom: moderateScaleVertical(22),
  },
  updateBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
    backgroundColor: Colors.buttonPrimary,
    borderRadius: moderateScale(14),
    paddingVertical: moderateScaleVertical(14),
  },
  updateText: {
    color: Colors.white,
  },
  pressed: {
    opacity: 0.9,
  },
});

export default memo(ForceUpdateModal);
