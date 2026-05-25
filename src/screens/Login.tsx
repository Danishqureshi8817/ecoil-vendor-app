import Body from '@/components/global/Body';
import CustomText from '@/components/global/CustomText';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import useVendorLogin from '@/hooks/vendor/use-vendor-login';
import {StackNav} from '@/navigations/NavigationKeys';
import {useAuthStore} from '@/states/authStore';
import {getApiErrorMessage} from '@/utils/getApiErrorMessage';
import {resetAndNavigate} from '@/utils/NavigationUtils';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import {setSession} from '@/utils/sessionStorage';
import {useToastMessage} from '@/utils/useToastMessage';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const FEATURES = [
  {icon: 'grid-outline' as const, label: 'Services'},
  {icon: 'cube-outline' as const, label: 'Collect'},
  {icon: 'document-text-outline' as const, label: 'Track'},
];

export default function Login() {
  const insets = useSafeAreaInsets();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const loginMutation = useVendorLogin();
  const {toastSuccess} = useToastMessage();
  const setUser = useAuthStore(s => s.setUser);

  const canSubmit = mobile.trim().length >= 10 && password.length > 0;

  async function onSubmit() {
    setError('');
    try {
      const session = await loginMutation.mutateAsync({
        mobile: mobile.trim(),
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
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.brandDark}
        translucent={Platform.OS === 'android'}
      />

      <View style={[styles.hero, {paddingTop: insets.top + moderateScaleVertical(16)}]}>
        <View style={[styles.orb, styles.orbGreen]} />
        <View style={[styles.orb, styles.orbOrange]} />

        <View style={styles.logoRing}>
          <Image
            source={require('@/assets/images/ecoilIcon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <CustomText
          variant="h2"
          fontFamily={Fonts.inter.bold}
          style={styles.heroTitle}>
          Ecoil Partner
        </CustomText>
        <CustomText variant="h6" style={styles.heroSub}>
          Manage services & oil collections in one place
        </CustomText>

        <View style={styles.featureRow}>
          {FEATURES.map(f => (
            <View key={f.label} style={styles.featureChip}>
              <Ionicons name={f.icon} size={16} color={Colors.white} />
              <CustomText
                variant="h7"
                fontFamily={Fonts.inter.semiBold}
                style={styles.featureLabel}>
                {f.label}
              </CustomText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sheetWrap}>
        <Body
          backgroundColor={Colors.white}
          scrollStyle={styles.sheetScrollView}
          bounces={false}
          style={[
            styles.sheetScroll,
            {paddingBottom: insets.bottom + moderateScaleVertical(24)},
          ]}>
          <View style={styles.sheet}>
            <CustomText variant="h4" fontFamily={Fonts.inter.bold} style={styles.sheetTitle}>
              Sign in
            </CustomText>
            <CustomText variant="h7" style={styles.sheetSub}>
              Use your registered mobile & password
            </CustomText>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <CustomText
                  variant="h7"
                  style={styles.errorText}
                  numberOfLine={3}>
                  {error}
                </CustomText>
              </View>
            ) : null}

            <CustomText variant="h7" style={styles.fieldLabel}>
              Mobile number
            </CustomText>
            <View
              style={[
                styles.inputRow,
                mobileFocused && styles.inputRowFocused,
              ]}>
              <View style={styles.prefix}>
                <CustomText variant="h6" fontFamily={Fonts.inter.semiBold}>
                  +91
                </CustomText>
              </View>
              <TextInput
                style={styles.input}
                value={mobile}
                onChangeText={t => setMobile(t.replace(/\D/g, '').slice(0, 10))}
                onFocus={() => setMobileFocused(true)}
                onBlur={() => setMobileFocused(false)}
                placeholder="10-digit mobile"
                placeholderTextColor={Colors.placeHolderColor}
                keyboardType="phone-pad"
                maxLength={10}
                autoCapitalize="none"
              />
              <Ionicons
                name="call-outline"
                size={20}
                color={mobileFocused ? Colors.brand : Colors.muted}
              />
            </View>

            <CustomText variant="h7" style={styles.fieldLabel}>
              Password
            </CustomText>
            <View
              style={[
                styles.inputRow,
                passwordFocused && styles.inputRowFocused,
              ]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={passwordFocused ? Colors.brand : Colors.muted}
                style={styles.inputIconLeft}
              />
              <TextInput
                style={[styles.input, styles.inputWithIcons]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Enter password"
                placeholderTextColor={Colors.placeHolderColor}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(v => !v)}
                hitSlop={12}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={Colors.muted}
                />
              </Pressable>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[
                styles.cta,
                (!canSubmit || loginMutation.isPending) && styles.ctaDisabled,
              ]}
              disabled={!canSubmit || loginMutation.isPending}
              onPress={onSubmit}>
              {loginMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <CustomText
                    variant="h5"
                    fontFamily={Fonts.inter.bold}
                    style={styles.ctaText}>
                    Continue
                  </CustomText>
                  <Ionicons name="arrow-forward" size={22} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.secureRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.brand} />
              <CustomText variant="h7" style={styles.secureText}>
                Secure partner access · Ecoil vendor network
              </CustomText>
            </View>
          </View>
        </Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  hero: {
    backgroundColor: Colors.brandDark,
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScaleVertical(36),
    alignItems: 'center',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbGreen: {
    width: moderateScale(220),
    height: moderateScale(220),
    top: -moderateScale(60),
    right: -moderateScale(40),
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  orbOrange: {
    width: moderateScale(160),
    height: moderateScale(160),
    bottom: moderateScale(20),
    left: -moderateScale(50),
    backgroundColor: 'rgba(252,128,25,0.35)',
  },
  logoRing: {
    width: moderateScale(88),
    height: moderateScale(88),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScaleVertical(16),
    ...theme.shadow,
    shadowOpacity: 0.2,
    elevation: 8,
  },
  logo: {
    width: moderateScale(56),
    height: moderateScale(56),
  },
  heroTitle: {
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: moderateScaleVertical(8),
    lineHeight: 22,
    paddingHorizontal: moderateScale(12),
  },
  featureRow: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginTop: moderateScaleVertical(22),
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  featureLabel: {
    color: Colors.white,
    fontSize: 12,
  },
  sheetWrap: {
    flex: 1,
    marginTop: -moderateScaleVertical(24),
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    overflow: 'hidden',
  },
  sheetScrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  sheetScroll: {
    flexGrow: 1,
    backgroundColor: Colors.white,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScaleVertical(28),
    minHeight: moderateScaleVertical(400),
  },
  sheetTitle: {
    color: Colors.black,
    letterSpacing: -0.3,
  },
  sheetSub: {
    color: Colors.muted,
    marginTop: moderateScaleVertical(6),
    marginBottom: moderateScaleVertical(20),
  },
  errorBox: {
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
    lineHeight: 18,
  },
  fieldLabel: {
    color: Colors.muted,
    fontFamily: Fonts.inter.medium,
    marginBottom: moderateScaleVertical(8),
    marginLeft: moderateScale(2),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    marginBottom: moderateScaleVertical(16),
    minHeight: moderateScaleVertical(54),
  },
  inputRowFocused: {
    backgroundColor: Colors.brandSoft,
  },
  prefix: {
    paddingRight: moderateScale(10),
    marginRight: moderateScale(6),
  },
  input: {
    flex: 1,
    fontFamily: Fonts.inter.regular,
    fontSize: moderateScale(16),
    color: Colors.black,
    paddingVertical: moderateScaleVertical(14),
  },
  inputWithIcons: {
    marginLeft: moderateScale(10),
  },
  inputIconLeft: {
    marginRight: moderateScale(2),
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
    backgroundColor: Colors.brand,
    borderRadius: moderateScale(16),
    minHeight: moderateScaleVertical(56),
    marginTop: moderateScaleVertical(8),
    shadowColor: Colors.brandDark,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: Colors.white,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    marginTop: moderateScaleVertical(20),
  },
  secureText: {
    color: Colors.muted,
    textAlign: 'center',
  },
});
