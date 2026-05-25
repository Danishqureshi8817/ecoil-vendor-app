import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import type {VendorApplicationDetail} from '@/api/publicApi';
import {externalUi} from '@/styles/externalUi';
import {moderateScaleVertical} from '@/utils/responsiveSize';
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
      <Pressable style={externalUi.detailBackdrop} onPress={onClose}>
        <Pressable style={externalUi.detailPanel} onPress={e => e.stopPropagation()}>
          {loading ? (
            <ActivityIndicator color={Colors.brand} style={{marginVertical: 40}} />
          ) : detail ? (
            <ScrollView showsVerticalScrollIndicator={false}>
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

              <View style={styles.answers}>
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
              </View>

              <Pressable style={styles.closeWrap} onPress={onClose}>
                <LinearGradient
                  colors={[Colors.brandDark, Colors.brand]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.closeBtn}>
                  <CustomText variant="h5" style={externalUi.submitBtnText}>
                    Close
                  </CustomText>
                </LinearGradient>
              </Pressable>
            </ScrollView>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  answers: {
    marginTop: moderateScaleVertical(14),
  },
  closeWrap: {
    marginTop: moderateScaleVertical(16),
    borderRadius: 14,
    overflow: 'hidden',
  },
  closeBtn: {
    paddingVertical: moderateScaleVertical(15),
    alignItems: 'center',
  },
});
