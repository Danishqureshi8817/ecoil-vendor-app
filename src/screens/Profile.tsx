import CustomText from '@/components/global/CustomText';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { mergeProfileUser, submitVendorProfile } from '@/api/profileApi';
import { useAuthStore } from '@/states/authStore';
import { getApiErrorMessage } from '@/utils/getApiErrorMessage';
import { patchStoredUser } from '@/utils/sessionStorage';
import { vendorUserId } from '@/utils/vendorUser';
import { goBack } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import { useToastMessage } from '@/utils/useToastMessage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Container } from '@/components/global/Container';
import AppBar from '@/components/global/AppBar';
import { SecurityIcon } from '@/components/icon/icon';
import Body from '@/components/global/Body';

const PROFILE_TOP_ICON = require('@/assets/images/profileTopIcon.png');

export default function ProfileScreen() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const { toastSuccess, toastError } = useToastMessage();

  const storedMobile = user?.mobile?.trim() ?? '';

  const [name, setName] = useState(user?.name?.trim() ?? '');
  const [email, setEmail] = useState(user?.email?.trim() ?? '');
  const [designation, setDesignation] = useState(
    () => String(user?.designation ?? '').trim(),
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toastError('Contact Person name cannot be empty');
      return;
    }
    if (!user) {
      toastError('Please sign in again');
      return;
    }
    const userId = vendorUserId(user);
    if (!userId || !storedMobile) {
      toastError('Profile is incomplete. Please sign in again.');
      return;
    }

    const payload = {
      id: userId,
      mobile: storedMobile,
      name: name.trim(),
      designation: designation.trim(),
      email: email.trim(),
    };

    setSaving(true);
    try {
      await submitVendorProfile(payload);
      const nextUser = mergeProfileUser(user, payload);
      patchStoredUser(nextUser);
      setUser(nextUser);
      toastSuccess('Profile updated successfully');
      setTimeout(() => goBack(), 800);
    } catch (err) {
      toastError(getApiErrorMessage(err, 'Could not update profile'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar title="Profile" leading="menu" />

      <Body>
        <View style={styles.bannerRow}>
          <View style={styles.avatarContainer}>
            <Image source={PROFILE_TOP_ICON} style={styles.avatarImg} resizeMode="contain" />
          </View>
          <View style={styles.bannerCopy}>
            <CustomText variant="h5" fontFamily={Fonts.montserrat.semiBold} style={styles.bannerTitle}>
              View / Change Profile
            </CustomText>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.bannerSubtitle}>
              Update your contact information.
            </CustomText>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <OutlineInput
            label="Contact Person"
            value={name}
            onChangeText={setName}
            placeholder="Enter contact person name"
          />

          <OutlineInput
            label="Contact Person Mobile"
            value={storedMobile}
            placeholder="Mobile number"
            keyboardType="numeric"
            editable={false}
          />

          <OutlineInput
            label="Contact Person Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
          />

          <OutlineInput
            label="Contact person Designation"
            value={designation}
            onChangeText={setDesignation}
            placeholder="Enter designation"
          />

          <View style={styles.securityBox}>
            <View style={styles.shieldIconWrap}>
              <SecurityIcon />
            </View>
            <View style={styles.securityTextWrap}>
              <CustomText style={styles.securityTitle}>
                Keep your account secure.
              </CustomText>
              <CustomText style={styles.securitySub}>
                Mobile number cannot be changed here. Contact support if you need help.
              </CustomText>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={() => void handleSave()}
            disabled={saving}
            activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color={Colors.white} style={{ marginRight: 8 }} />
                <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.saveBtnText}>
                  Save
                </CustomText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => goBack()}
            disabled={saving}
            activeOpacity={0.8}>
            <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.cancelBtnText}>
              Cancel
            </CustomText>
          </TouchableOpacity>
        </View>
      </Body>
    </Container>
  );
}

function OutlineInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  editable?: boolean;
}) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelBg}>
        <CustomText style={styles.inputLabelText}>{label}</CustomText>
      </View>
      <View style={[styles.inputRow, !editable && styles.inputRowDisabled]}>
        <TextInput
          style={[styles.textInput, !editable && styles.textInputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeHolderColor}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(16),
    backgroundColor: Colors.white,
  },
  avatarContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    overflow: 'hidden',
    marginRight: moderateScale(16),
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  bannerCopy: {
    flex: 1,
  },
  bannerTitle: {
    color: Colors.black,
    fontSize: RFValue(13.5),
  },
  bannerSubtitle: {
    color: '#64748B',
    fontSize: RFValue(10),
    marginTop: moderateScaleVertical(2),
  },
  cardContainer: {
    marginHorizontal: moderateScale(16),
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(22),
    paddingBottom: moderateScaleVertical(16),
    backgroundColor: Colors.white,
    marginBottom: moderateScaleVertical(16),
  },
  inputContainer: {
    position: 'relative',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(8),
    height: moderateScaleVertical(46),
    justifyContent: 'center',
    marginBottom: moderateScaleVertical(18),
    backgroundColor: Colors.white,
  },
  inputLabelBg: {
    position: 'absolute',
    top: -moderateScaleVertical(8),
    left: moderateScale(12),
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(4),
    zIndex: 1,
  },
  inputLabelText: {
    color: '#007D41',
    fontSize: RFValue(9.5),
    fontFamily: Fonts.montserrat.semiBold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: moderateScale(12),
  },
  inputRowDisabled: {
    backgroundColor: '#F8FAFC',
    borderRadius: moderateScale(6),
  },
  textInput: {
    flex: 1,
    fontSize: RFValue(12),
    color: Colors.black,
    fontFamily: Fonts.montserrat.medium,
    padding: 0,
  },
  textInputDisabled: {
    color: Colors.muted,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF3FF',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginTop: moderateScaleVertical(4),
  },
  shieldIconWrap: {
    marginRight: moderateScale(10),
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    color: '#1B5EFC',
    fontFamily: Fonts.montserrat.bold,
    fontSize: RFValue(11),
    marginBottom: 2,
  },
  securitySub: {
    color: '#64748B',
    fontFamily: Fonts.montserrat.medium,
    fontSize: RFValue(9.5),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    marginVertical: moderateScaleVertical(10),
  },
  saveBtn: {
    flex: 1,
    marginRight: moderateScale(8),
    height: moderateScaleVertical(46),
    borderRadius: moderateScale(23),
    backgroundColor: '#074825',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveBtnDisabled: {
    opacity: 0.75,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: RFValue(12),
  },
  cancelBtn: {
    flex: 1,
    marginLeft: moderateScale(8),
    height: moderateScaleVertical(46),
    borderRadius: moderateScale(23),
    borderWidth: 1.2,
    borderColor: '#A0AEC0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  cancelBtnText: {
    color: Colors.black,
    fontSize: RFValue(12),
  },
});
