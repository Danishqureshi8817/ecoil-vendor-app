import CustomText from '@/components/global/CustomText';
import {PrivacyPolicyModal} from '@/components/login/PrivacyPolicyModal';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import useVendorLogin from '@/hooks/vendor/use-vendor-login';
import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {resetAndNavigate} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {
  hasAcceptedPrivacyPolicy,
  setPrivacyPolicyAccepted,
} from '@/utils/privacyPolicyStorage';
import {setSession} from '@/utils/sessionStorage';
import {useToastMessage} from '@/utils/useToastMessage';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const SUPPORT_PHONE = '18008903841';
const SUPPORT_PHONE_DISPLAY = '18008903841';
const WHATSAPP_URL = 'https://wa.me/916378878338';
const REGISTER_URL = 'https://vendor.ecoil.in/become-partner';

const loginAssets = {
  bg: require('@/assets/images/login/LoginBg.png'),
  logo: require('@/assets/images/login/ecoilLogo.png'),
  userIcon: require('@/assets/images/login/usericon.png'),
  passwordIcon: require('@/assets/images/login/passwordIcon.png'),
  callIcon: require('@/assets/images/login/callIcon.png'),
  whatsappIcon: require('@/assets/images/login/whatsappIcon.png'),
};

function LoginField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  maxLength,
  right,
}: {
  icon: number;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  maxLength?: number;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.inputWrap}>
      <View style={styles.inputIconBox}>
        <Image source={icon} style={styles.inputIcon} resizeMode="contain" />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeHolderColor}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        maxLength={maxLength}
      />
      {right}
    </View>
  );
}

const MOBILE_MAX_LENGTH = 10;

function sanitizeMobileInput(text: string): string {
  return text.replace(/\D/g, '').slice(0, MOBILE_MAX_LENGTH);
}

export default function Login() {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [privacyVisible, setPrivacyVisible] = useState(() => !hasAcceptedPrivacyPolicy());
  const loginMutation = useVendorLogin();
  const {toastSuccess} = useToastMessage();
  const setUser = useAuthStore(s => s.setUser);

  const canSubmit = identifier.trim().length > 0 && password.length > 0;
  const footerHeight = moderateScaleVertical(92) + Math.max(insets.bottom, moderateScaleVertical(8));

  function onAcceptPrivacyPolicy() {
    setPrivacyPolicyAccepted();
    setPrivacyVisible(false);
  }

  async function onSubmit() {
    setError('');
    try {
      const session = await loginMutation.mutateAsync({
        mobile: identifier.trim(),
        password,
      });
      setSession(session);
      setUser(session.user);
      toastSuccess('Welcome back!');
      resetAndNavigate(StackNav.Main, 0);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Check mobile and password.'));
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ImageBackground source={loginAssets.bg} style={styles.bg} resizeMode="cover">
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: insets.top + moderateScaleVertical(20),
                paddingBottom: footerHeight + moderateScaleVertical(16),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <Image source={loginAssets.logo} style={styles.logo} resizeMode="contain" />

            <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={RFValue(16)} style={styles.title}>
              Welcome Back!
            </CustomText>
            <CustomText fontFamily={Fonts.montserrat.medium} fontSize={RFValue(10)} style={styles.subtitle}>
              Good oil, good food, good life
            </CustomText>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <CustomText variant="h7" style={styles.errorText} numberOfLine={1}>
                  {error}
                </CustomText>
              </View>
            ) : null}

            <LoginField
              icon={loginAssets.userIcon}
              placeholder="Mobile / Store code"
              value={identifier}
              onChangeText={text => setIdentifier(sanitizeMobileInput(text))}
              keyboardType="phone-pad"
              maxLength={MOBILE_MAX_LENGTH}
            />

            <LoginField
              icon={loginAssets.passwordIcon}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              right={
                <Pressable
                  onPress={() => setShowPassword(v => !v)}
                  hitSlop={12}
                  style={styles.eyeBtn}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={Colors.black}
                  />
                </Pressable>
              }
            />

            {/* <Pressable
              style={styles.forgotBtn}
              onPress={() => void Linking.openURL(`tel:${SUPPORT_PHONE}`)}>
              <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={13} style={styles.forgotText}>
                Forgot Password?
              </CustomText>
            </Pressable> */}

            <Pressable
              style={({pressed}) => [
                styles.loginBtn,
                pressed && styles.pressed,
                (!canSubmit || loginMutation.isPending) && styles.loginBtnDisabled,
              ]}
              disabled={!canSubmit || loginMutation.isPending}
              onPress={onSubmit}>
              {loginMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <CustomText fontFamily={Fonts.montserrat.bold} fontSize={16} style={styles.loginBtnText}>
                  Login
                </CustomText>
              )}
            </Pressable>

            {/* <View style={styles.registerRow}>
              <CustomText fontFamily={Fonts.montserrat.regular} fontSize={13} style={styles.registerMuted}>
                Not a user?{' '}
              </CustomText>
              <Pressable onPress={() => void Linking.openURL(REGISTER_URL)}>
                <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={13} style={styles.registerLink}>
                  Register now
                </CustomText>
              </Pressable>
            </View> */}
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      <View style={[styles.footerCard, {marginBottom: Math.max(insets.bottom, moderateScaleVertical(15))}]}>
        <Pressable
          style={({pressed}) => [styles.footerItem, pressed && styles.pressed]}
          onPress={() => void Linking.openURL(`tel:${SUPPORT_PHONE}`)}>
          <Image source={loginAssets.callIcon} style={styles.footerIcon} resizeMode="contain" />
          <View style={styles.footerCopy}>
            <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={RFValue(8)} style={styles.footerTitle}>
              Click to Talk
            </CustomText>
            <CustomText fontFamily={Fonts.montserrat.medium} fontSize={RFValue(8)} style={styles.footerSub} numberOfLine={1}>
              On {SUPPORT_PHONE_DISPLAY}
            </CustomText>
          </View>
        </Pressable>

        <View style={styles.footerDivider} />

        <Pressable
          style={({pressed}) => [styles.footerItem, pressed && styles.pressed]}
          onPress={() => void Linking.openURL(WHATSAPP_URL)}>
          <Image source={loginAssets.whatsappIcon} style={styles.footerIcon} resizeMode="contain" />
          <View style={styles.footerCopy}>
            <CustomText fontFamily={Fonts.montserrat.semiBold} fontSize={RFValue(8)} style={styles.footerTitle}>
              Chat with us
            </CustomText>
            <CustomText fontFamily={Fonts.montserrat.medium} fontSize={RFValue(8)} style={styles.footerSub} numberOfLine={1}>
              For oil Request
            </CustomText>
          </View>
        </Pressable>
      </View>

      <PrivacyPolicyModal visible={privacyVisible} onAccept={onAcceptPrivacyPolicy} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.onboardingSurface,
  },
  flex: {
    flex: 1,
  },
  bg: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  logo: {
    width: moderateScale(132),
    height: moderateScale(132),
    marginBottom: moderateScaleVertical(10),
  },
  title: {
    color: Colors.onboardingPrimary,
    textAlign: 'center',
    marginBottom: moderateScaleVertical(6),
  },
  subtitle: {
    color: Colors.black,
    textAlign: 'center',
    marginBottom: moderateScaleVertical(22),
  },
  errorBox: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(10),
    backgroundColor: Colors.errorSoft,
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: moderateScaleVertical(14),
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: Colors.error,
    flex: 1,
    lineHeight: RFValue(18),
  },
  inputWrap: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.loginInputBg,
    borderRadius: moderateScale(16),
    minHeight: moderateScaleVertical(56),
    paddingHorizontal: moderateScale(10),
    marginBottom: moderateScaleVertical(14),
    ...theme.shadow,
    shadowOpacity: 0.08,
    elevation: 4,
  },
  inputIconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.loginInputIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  inputIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  input: {
    flex: 1,
    fontFamily: Fonts.montserrat.regular,
    fontSize: RFValue(14),
    color: Colors.black,
    paddingVertical: moderateScaleVertical(14),
  },
  eyeBtn: {
    paddingHorizontal: moderateScale(6),
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: moderateScaleVertical(18),
    marginTop: moderateScaleVertical(-4),
  },
  forgotText: {
    color: Colors.loginLink,
  },
  loginBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.onboardingPrimary,
    borderRadius: 999,
    minHeight: moderateScaleVertical(54),
    marginBottom: moderateScaleVertical(16),
    marginTop: moderateScaleVertical(20),
  },
  loginBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  loginBtnText: {
    color: Colors.white,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerMuted: {
    color: Colors.black,
  },
  registerLink: {
    color: Colors.loginLink,
  },
  footerCard: {
    position: 'absolute',
    left: moderateScale(16),
    right: moderateScale(16),
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    paddingVertical: moderateScaleVertical(14),
    paddingHorizontal: moderateScale(10),
    minHeight: moderateScaleVertical(72),
    ...theme.shadow,
    shadowOpacity: 0.12,
    elevation: 8,
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
    paddingHorizontal: moderateScale(6),
  },
  footerIcon: {
    width: moderateScale(42),
    height: moderateScale(42),
  },
  footerCopy: {
    flexShrink: 1,
    justifyContent: 'center',
  },
  footerTitle: {
    color: Colors.black,
    marginBottom: moderateScaleVertical(2),
  },
  footerSub: {
    color: Colors.loginLink,
  },
  footerDivider: {
    width: 1,
    height: moderateScaleVertical(44),
    backgroundColor: Colors.loginFooterDivider,
  },
  pressed: {
    opacity: 0.9,
  },
});
