import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import type {VendorApplicationDetail} from '@/api/publicApi';
import {externalUi} from '@/styles/externalUi';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  visible: boolean;
  loading: boolean;
  detail: VendorApplicationDetail | null;
  submittedLabel?: string;
  onClose: () => void;
};

export function ApplicationDetailModal({
  visible,
  loading,
  detail,
  submittedLabel,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={externalUi.detailBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />

        <View style={styles.panel}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close" size={20} color={Colors.black} />
          </Pressable>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.brand} size="large" />
            </View>
          ) : detail ? (
            <>
              <View style={styles.header}>
                <CustomText
                  variant="h4"
                  fontFamily={Fonts.inter.bold}
                  style={externalUi.detailTitle}>
                  {detail.serviceName}
                </CustomText>
                {submittedLabel ? (
                  <CustomText variant="h7" style={externalUi.muted}>
                    {submittedLabel}
                  </CustomText>
                ) : null}
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                bounces>
                {detail.answers.map(a => (
                  <View key={a.id} style={externalUi.detailRow}>
                    <CustomText variant="h7" style={externalUi.detailLabel}>
                      {a.questionLabel}
                    </CustomText>
                    <CustomText variant="h6" style={externalUi.detailValue}>
                      {a.answer || '—'}
                    </CustomText>
                  </View>
                ))}
              </ScrollView>

              <Pressable style={styles.closeWrap} onPress={onClose}>
                <View style={styles.closeActionBtn}>
                  <LinearGradient
                    colors={[Colors.brandDark, Colors.brand]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={StyleSheet.absoluteFill}
                  />
                  <CustomText variant="h5" style={externalUi.submitBtnText}>
                    Close
                  </CustomText>
                </View>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    paddingTop: moderateScaleVertical(20),
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScaleVertical(16),
    maxHeight: '85%',
    width: '100%',
    zIndex: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: moderateScale(12),
    right: moderateScale(12),
    zIndex: 2,
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  loadingWrap: {
    paddingVertical: moderateScaleVertical(48),
    alignItems: 'center',
  },
  header: {
    paddingRight: moderateScale(36),
    marginBottom: moderateScaleVertical(10),
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: moderateScaleVertical(4),
  },
  closeWrap: {
    marginTop: moderateScaleVertical(12),
    borderRadius: 14,
    overflow: 'hidden',
  },
  closeActionBtn: {
    paddingVertical: moderateScaleVertical(15),
    alignItems: 'center',
  },
});
