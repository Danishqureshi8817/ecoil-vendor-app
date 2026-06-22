import CustomText from '@/components/global/CustomText';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAuthStore } from '@/states/authStore';
import { screen } from '@/styles/ui';
import { goBack } from '@/utils/NavigationUtils';
import { moderateScale, moderateScaleVertical } from '@/utils/responsiveSize';
import { useToastMessage } from '@/utils/useToastMessage';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
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

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('••••••••••••••');

  const [isPasswordEditable, setIsPasswordEditable] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  const handleSave = () => {
    if (!name.trim()) {
      toastError('Contact Person name cannot be empty');
      return;
    }
    if (!mobile.trim()) {
      toastError('Contact Person Mobile cannot be empty');
      return;
    }

    // Save profile updates to local Zustad store
    if (user) {
      setUser({
        ...user,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
      });
    }

    toastSuccess('Profile updated successfully');
    setTimeout(() => goBack(), 800);
  };

  const handlePasswordEdit = () => {
    if (isPasswordEditable) {
      // Done editing password
      setIsPasswordEditable(false);
      setHidePassword(true);
      toastSuccess('Password updated locally');
    } else {
      // Start editing
      setPassword('');
      setIsPasswordEditable(true);
      setHidePassword(false);
    }
  };

  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar title="Profile" leading="menu" />

      {/* <ScrollView
        style={screen.pageBg}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      > */}
      <Body>


        {/* Banner with Profile icon */}
        <View style={styles.bannerRow}>
          <View style={styles.avatarContainer}>
            <Image source={PROFILE_TOP_ICON} style={styles.avatarImg} resizeMode="contain" />
          </View>
          <View style={styles.bannerCopy}>
            <CustomText variant="h5" fontFamily={Fonts.montserrat.semiBold} style={styles.bannerTitle}>
              View / Change Profile
            </CustomText>
            <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.bannerSubtitle}>
              Update your contact information and password.
            </CustomText>
          </View>
        </View>

        {/* Inputs Box Card Container */}
        <View style={styles.cardContainer}>
          <OutlineInput
            label="Contact Person"
            value={name}
            onChangeText={setName}
            placeholder="Enter contact person name"
          />

          <OutlineInput
            label="Contact Person Mobile"
            value={mobile}
            onChangeText={setMobile}
            placeholder="Enter mobile number"
            keyboardType="numeric"
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

          {/* Password Input */}
          <OutlineInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            secureTextEntry={hidePassword}
            editable={isPasswordEditable}
            rightElement={
              <View style={styles.passwordRight}>
                <TouchableOpacity
                  onPress={() => setHidePassword(!hidePassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.black}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePasswordEdit} activeOpacity={0.7}>
                  <CustomText style={styles.editBtnText}>
                    {isPasswordEditable ? 'Done' : 'Edit'}
                  </CustomText>
                </TouchableOpacity>
              </View>
            }
          />

          {/* Account Security Blue Box */}
          <View style={styles.securityBox}>
            <View style={styles.shieldIconWrap}>
              <SecurityIcon />
            </View>
            <View style={styles.securityTextWrap}>
              <CustomText style={styles.securityTitle}>
                Keep your account secure.
              </CustomText>
              <CustomText style={styles.securitySub}>
                Use a strong password and keep it confidential.
              </CustomText>
            </View>
          </View>
        </View>

        {/* Save / Cancel Bottom Actions */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="save-outline" size={18} color={Colors.white} style={{ marginRight: 8 }} />
            <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.saveBtnText}>
              Save
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => goBack()} activeOpacity={0.8}>
            <CustomText variant="h6" fontFamily={Fonts.montserrat.semiBold} style={styles.cancelBtnText}>
              Cancel
            </CustomText>
          </TouchableOpacity>
        </View>
        {/* </ScrollView> */}
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
  secureTextEntry,
  editable = true,
  rightElement,
}: {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  editable?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelBg}>
        <CustomText style={styles.inputLabelText}>{label}</CustomText>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeHolderColor}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
        {rightElement && <View style={styles.rightElementWrap}>{rightElement}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: moderateScaleVertical(32),
  },
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
  textInput: {
    flex: 1,
    fontSize: RFValue(12),
    color: Colors.black,
    fontFamily: Fonts.montserrat.medium,
    padding: 0,
  },
  rightElementWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: moderateScale(8),
  },
  passwordRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  eyeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#007D41',
    fontFamily: Fonts.montserrat.semiBold,
    fontSize: RFValue(12),
    textDecorationLine: 'underline',
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
