import CustomText from '@/components/global/CustomText';
import {Container} from '@/components/global/Container';
import AppBar from '@/components/global/AppBar';
import Body from '@/components/global/Body';
import {Colors} from '@/constants/colors';
import {Fonts} from '@/constants/fonts';
import {theme} from '@/constants/theme';
import {moderateScale, moderateScaleVertical} from '@/utils/responsiveSize';
import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RFValue} from 'react-native-responsive-fontsize';

const EMAIL = 'arises.org@gmail.com';
const PHONE = '18008903841';
const WEBSITE = 'https://www.ecoil.in';

const COLLECT_ITEMS = [
  'Name',
  'Email Address',
  'Mobile Number',
  'Pickup Address',
  'Device Information',
  'Usage & Diagnostic Data',
] as const;

const USE_ITEMS = [
  'Provide and manage our services',
  'Schedule collection requests',
  'Contact you regarding your requests',
  'Improve app performance and user experience',
  'Comply with legal obligations',
] as const;

const PERMISSION_ITEMS: {
  title: string;
  body: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    title: 'Location',
    body: 'To identify your pickup location.',
    icon: 'location-outline',
  },
  {
    title: 'Camera',
    body: 'To capture images related to collection requests.',
    icon: 'camera-outline',
  },
  {
    title: 'Storage/Photos',
    body: 'To upload images or documents.',
    icon: 'images-outline',
  },
  {
    title: 'Notifications',
    body: 'To send pickup status and important service updates.',
    icon: 'notifications-outline',
  },
];

const DELETE_STEPS = [
  'Using the Delete Account option available in the Ecoil mobile application (if available), or',
  'Sending an account deletion request to arises.org@gmail.com.',
] as const;

const AFTER_VERIFY = [
  'Your account and personal information will be permanently deleted from our active systems.',
  'Some information may be retained where required by applicable laws or regulatory obligations.',
  'Once deleted, your account cannot be recovered.',
] as const;

function PolicyCard({
  icon,
  title,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name={icon} size={moderateScale(18)} color={Colors.brand} />
        </View>
        <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.cardTitle}>
          {title}
        </CustomText>
      </View>
      {children}
    </View>
  );
}

function BulletList({items}: {items: readonly string[]}) {
  return (
    <View style={styles.list}>
      {items.map(item => (
        <View key={item} style={styles.bulletRow}>
          <View style={styles.bullet}>
            <Ionicons name="checkmark" size={moderateScale(10)} color={Colors.brand} />
          </View>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.para}>
            {item}
          </CustomText>
        </View>
      ))}
    </View>
  );
}

function ContactLink({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({pressed}) => [styles.contactRow, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={moderateScale(18)} color={Colors.brand} />
      </View>
      <View style={styles.contactCopy}>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.contactHint}>
          {hint}
        </CustomText>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.contactText}>
          {label}
        </CustomText>
      </View>
      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={moderateScale(14)} color={Colors.brand} />
      </View>
    </Pressable>
  );
}

export default function PrivacyPolicyScreen() {
  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar title="Privacy Policy" leading="menu" />
      <Body contentContainerStyle={styles.content}>
        <LinearGradient
          colors={['#E8F5EC', '#F7FBF8', Colors.white]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark-outline" size={moderateScale(15)} color={Colors.brand} />
              <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.heroBadgeText}>
                Your privacy matters
              </CustomText>
            </View>
            <View style={styles.updatedPill}>
              <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.updatedText}>
                July 2026
              </CustomText>
            </View>
          </View>
          <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.heroTitle}>
            Privacy Policy
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.heroIntro}>
            KNP Arises Green Energy Pvt. Ltd. ("Company", "We", "Us", "Our") respects your privacy.
            This policy explains how we collect, use, and protect your information in the Ecoil
            Mobile Application (Android & iOS) and on our website.
          </CustomText>
        </LinearGradient>

        <PolicyCard icon="document-text-outline" title="Information We Collect">
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.lead}>
            We may collect the following information:
          </CustomText>
          <View style={styles.chipWrap}>
            {COLLECT_ITEMS.map(item => (
              <View key={item} style={styles.chip}>
                <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.chipText}>
                  {item}
                </CustomText>
              </View>
            ))}
          </View>
        </PolicyCard>

        <PolicyCard icon="construct-outline" title="How We Use Your Information">
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.lead}>
            We use your information to:
          </CustomText>
          <BulletList items={USE_ITEMS} />
        </PolicyCard>

        <PolicyCard icon="phone-portrait-outline" title="Mobile Permissions">
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.lead}>
            The Ecoil App may request the following permissions:
          </CustomText>
          <View style={styles.permissionList}>
            {PERMISSION_ITEMS.map(item => (
              <View key={item.title} style={styles.permissionRow}>
                <View style={styles.permissionIcon}>
                  <Ionicons name={item.icon} size={moderateScale(16)} color={Colors.brand} />
                </View>
                <View style={styles.permissionCopy}>
                  <CustomText
                    variant="h7"
                    fontFamily={Fonts.montserrat.semiBold}
                    style={styles.permissionTitle}>
                    {item.title}
                  </CustomText>
                  <CustomText
                    variant="h7"
                    fontFamily={Fonts.montserrat.regular}
                    style={styles.permissionBody}>
                    {item.body}
                  </CustomText>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={moderateScale(16)} color={Colors.brand} />
            <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.noteText}>
              Permissions are requested only when required and can be managed through your device
              settings.
            </CustomText>
          </View>
        </PolicyCard>

        <PolicyCard icon="lock-closed-outline" title="Data Security">
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.para}>
            We use reasonable security measures to protect your personal information. However, no
            method of electronic storage or internet transmission is completely secure.
          </CustomText>
        </PolicyCard>

        <PolicyCard icon="trash-outline" title="Account Deletion">
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.lead}>
            You may request permanent deletion of your Ecoil account at any time.
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.subhead}>
            You can delete your account by:
          </CustomText>
          <BulletList items={DELETE_STEPS} />
          <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.subhead}>
            After verification:
          </CustomText>
          <BulletList items={AFTER_VERIFY} />
        </PolicyCard>

        <PolicyCard icon="refresh-outline" title="Changes to this Privacy Policy">
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.para}>
            We may update this Privacy Policy from time to time. Any changes will be posted within
            the application and/or on our website.
          </CustomText>
        </PolicyCard>

        <PolicyCard icon="mail-outline" title="Contact Us">
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.lead}>
            If you have any questions or wish to request account deletion, contact us:
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.bold} style={styles.company}>
            KNP Arises Green Energy Pvt. Ltd.
          </CustomText>

          <View style={styles.contactStack}>
            <ContactLink
              icon="mail-outline"
              hint="Email"
              label={EMAIL}
              onPress={() => void Linking.openURL(`mailto:${EMAIL}`)}
            />
            <ContactLink
              icon="globe-outline"
              hint="Website"
              label="www.ecoil.in"
              onPress={() => void Linking.openURL(WEBSITE)}
            />
            <ContactLink
              icon="call-outline"
              hint="Phone"
              label={PHONE}
              onPress={() => void Linking.openURL(`tel:${PHONE}`)}
            />
          </View>
        </PolicyCard>
      </Body>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(14),
    paddingBottom: moderateScaleVertical(40),
  },
  hero: {
    borderRadius: moderateScale(18),
    padding: moderateScale(18),
    marginBottom: moderateScaleVertical(16),
    borderWidth: 1,
    borderColor: '#D8EDE0',
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(12),
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(5),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: '#D1E7D9',
  },
  heroBadgeText: {
    color: Colors.brandDark,
    fontSize: RFValue(10),
  },
  updatedPill: {
    backgroundColor: Colors.brandSoft,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(5),
    borderRadius: moderateScale(20),
  },
  updatedText: {
    color: Colors.brandDark,
    fontSize: RFValue(10),
  },
  heroTitle: {
    color: Colors.brandDark,
    fontSize: RFValue(17),
    letterSpacing: -0.4,
    marginBottom: moderateScaleVertical(8),
  },
  heroIntro: {
    color: Colors.muted,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.line,
    padding: moderateScale(14),
    marginBottom: moderateScaleVertical(12),
    ...theme.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    marginBottom: moderateScaleVertical(12),
  },
  cardIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    color: Colors.brandDark,
    fontSize: RFValue(13),
  },
  lead: {
    color: Colors.muted,
    fontSize: RFValue(12),
    lineHeight: RFValue(17),
    marginBottom: moderateScaleVertical(10),
  },
  para: {
    color: Colors.black,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
  },
  chip: {
    backgroundColor: '#F4FBF6',
    borderWidth: 1,
    borderColor: '#D8EDE0',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScaleVertical(6),
  },
  chipText: {
    color: Colors.brandDark,
    fontSize: RFValue(11),
  },
  list: {
    gap: moderateScaleVertical(8),
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(10),
  },
  bullet: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScaleVertical(1),
  },
  permissionList: {
    gap: moderateScaleVertical(10),
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(10),
    backgroundColor: '#F8FBF9',
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
  },
  permissionIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#D8EDE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionCopy: {
    flex: 1,
  },
  permissionTitle: {
    color: Colors.brandDark,
    fontSize: RFValue(12),
    marginBottom: moderateScaleVertical(2),
  },
  permissionBody: {
    color: Colors.muted,
    fontSize: RFValue(11),
    lineHeight: RFValue(16),
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(8),
    marginTop: moderateScaleVertical(12),
    backgroundColor: Colors.brandSoft,
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
  },
  noteText: {
    flex: 1,
    color: Colors.brandDark,
    fontSize: RFValue(11),
    lineHeight: RFValue(16),
  },
  subhead: {
    color: Colors.brandDark,
    fontSize: RFValue(12),
    marginTop: moderateScaleVertical(12),
    marginBottom: moderateScaleVertical(8),
  },
  company: {
    color: Colors.brandDark,
    fontSize: RFValue(12),
    marginBottom: moderateScaleVertical(12),
  },
  contactStack: {
    gap: moderateScaleVertical(8),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
    backgroundColor: '#F8FBF9',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E5F0E9',
    padding: moderateScale(10),
  },
  contactIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCopy: {
    flex: 1,
  },
  contactHint: {
    color: Colors.muted,
    fontSize: RFValue(10),
    marginBottom: moderateScaleVertical(2),
  },
  contactText: {
    color: Colors.brand,
    fontSize: RFValue(12),
  },
  chevronWrap: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
