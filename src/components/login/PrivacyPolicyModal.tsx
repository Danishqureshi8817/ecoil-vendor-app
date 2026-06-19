import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

const POLICY_POINTS = [
  'Ecoil Partner app collects location data of some of its users to make operations easy & faster & requires permissions for the same.',
  'Ecoil Partner app requires some sort of document & image uploads like GatePass, Certificate etc. wherever applicable & requires permissions for the same.',
  'Ecoil Partner app requires camera access in order to take pic of GatePass to upload in the system wherever applicable & requires permissions for the same.',
];

type Props = {
  visible: boolean;
  onAccept: () => void;
};

export function PrivacyPolicyModal({visible, onAccept}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onAccept}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={RFValue(9)} style={styles.headerText}>
              Privacy Policy & Terms of Use
            </CustomText>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {POLICY_POINTS.map(point => (
              <View key={point} style={styles.bulletRow}>
                <CustomText fontFamily={Fonts.montserrat.regular} fontSize={RFValue(9)} style={styles.bullet}>
                  •
                </CustomText>
                <CustomText fontFamily={Fonts.montserrat.regular} fontSize={RFValue(9)} style={styles.pointText}>
                  {point}
                </CustomText>
              </View>
            ))}
          </ScrollView>

          <Pressable
            style={({pressed}) => [styles.acceptBtn, pressed && styles.pressed]}
            onPress={onAccept}>
            <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={RFValue(10)} style={styles.acceptText}>
              I Understand
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(22),
  },
  card: {
    width: '100%',
    maxWidth: moderateScale(340),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(18),
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#333333',
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: Colors.white,
    textAlign: 'center',
    lineHeight: RFValue(18),
  },
  bodyScroll: {
    maxHeight: moderateScaleVertical(350),
  },
  bodyContent: {
    paddingHorizontal: moderateScale(18),
    paddingTop: moderateScaleVertical(18),
    paddingBottom: moderateScaleVertical(12),
    gap: moderateScaleVertical(14),
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(8),
  },
  bullet: {
    color: Colors.black,
    lineHeight: RFValue(18),
  },
  pointText: {
    flex: 1,
    color: Colors.black,
    lineHeight: RFValue(18),
  },
  acceptBtn: {
    alignSelf: 'center',
    backgroundColor: Colors.onboardingPrimary,
    borderRadius: 999,
    paddingHorizontal: moderateScale(36),
    paddingVertical: moderateScaleVertical(12),
    marginVertical: moderateScaleVertical(10),
    minWidth: moderateScale(180),
    alignItems: 'center',
  },
  acceptText: {
    color: Colors.white,
  },
  pressed: {
    opacity: 0.9,
  },
});
