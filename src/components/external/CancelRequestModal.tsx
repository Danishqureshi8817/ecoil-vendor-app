import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RFValue} from 'react-native-responsive-fontsize';

type Props = {
  visible: boolean;
  loading?: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: (remark: string) => void;
};

export function CancelRequestModal({
  visible,
  loading = false,
  title = 'Cancel request',
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setRemark('');
      setError('');
    }
  }, [visible]);

  function handleConfirm() {
    const trimmed = remark.trim();
    if (!trimmed) {
      setError('Please enter a cancel remark');
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={loading ? undefined : onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={loading ? undefined : onClose}
        />
        <View
          style={[
            styles.sheet,
            {paddingBottom: Math.max(insets.bottom, moderateScaleVertical(10))},
          ]}>
          <CustomText
            variant="h6"
            fontFamily={Fonts.montserrat.bold}
            style={styles.title}>
            {title}
          </CustomText>
          <CustomText
            variant="h7"
            fontFamily={Fonts.montserrat.regular}
            style={styles.hint}>
            Enter a reason for cancelling this request.
          </CustomText>
          <TextInput
            style={styles.input}
            value={remark}
            onChangeText={text => {
              setRemark(text);
              if (error) {
                setError('');
              }
            }}
            placeholder="Cancel remark"
            placeholderTextColor={Colors.muted}
            multiline
            textAlignVertical="top"
            editable={!loading}
            maxLength={500}
          />
          {error ? (
            <CustomText
              variant="h7"
              fontFamily={Fonts.montserrat.medium}
              style={styles.error}>
              {error}
            </CustomText>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              style={({pressed}) => [
                styles.secondaryBtn,
                pressed && styles.pressed,
              ]}
              onPress={onClose}
              disabled={loading}>
              <CustomText
                variant="h7"
                fontFamily={Fonts.montserrat.semiBold}
                style={styles.secondaryText}>
                Close
              </CustomText>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.dangerBtn,
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
              onPress={handleConfirm}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <CustomText
                  variant="h7"
                  fontFamily={Fonts.montserrat.semiBold}
                  style={styles.dangerText}>
                  Cancel request
                </CustomText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(18),
  },
  title: {
    color: Colors.black,
    fontSize: RFValue(15),
    marginBottom: moderateScaleVertical(6),
  },
  hint: {
    color: Colors.muted,
    fontSize: RFValue(11),
    marginBottom: moderateScaleVertical(12),
  },
  input: {
    minHeight: moderateScaleVertical(96),
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(10),
    color: Colors.black,
    fontFamily: Fonts.montserrat.regular,
    fontSize: RFValue(12),
    backgroundColor: Colors.bg,
  },
  error: {
    color: Colors.error,
    fontSize: RFValue(11),
    marginTop: moderateScaleVertical(8),
  },
  actions: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginTop: moderateScaleVertical(16),
  },
  secondaryBtn: {
    flex: 1,
    minHeight: moderateScaleVertical(44),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  secondaryText: {
    color: Colors.black,
    fontSize: RFValue(12),
  },
  dangerBtn: {
    flex: 1,
    minHeight: moderateScaleVertical(44),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
  },
  dangerText: {
    color: Colors.white,
    fontSize: RFValue(12),
  },
  pressed: {opacity: 0.92},
  disabled: {opacity: 0.7},
});
