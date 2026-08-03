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

const PHONE = '18008903841';
const EMAIL = 'vendorsupport@knparises.com';
const ADDRESS =
  'Cabin No. 17, 4th Floor, Creware Coworks, Business Park, Near Khatu Shyam Ji Temple, Iskcon Road, New Sanganer Road, Jaipur, Rajasthan – 302020';

type ContactRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent: string;
  accentSoft: string;
  label: string;
  children: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
};

function ContactRow({
  icon,
  accent,
  accentSoft,
  label,
  children,
  onPress,
  showChevron,
}: ContactRowProps) {
  const content = (
    <View style={styles.rowInner}>
      <View style={[styles.iconWrap, {backgroundColor: accentSoft}]}>
        <Ionicons name={icon} size={moderateScale(22)} color={accent} />
      </View>
      <View style={styles.rowCopy}>
        <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.rowLabel}>
          {label}
        </CustomText>
        {children}
      </View>
      {showChevron ? (
        <View style={[styles.chevronWrap, {backgroundColor: accentSoft}]}>
          <Ionicons name="chevron-forward" size={moderateScale(14)} color={accent} />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
        accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

export default function ContactUsScreen() {
  return (
    <Container fullScreen statusBarStyle="light-content">
      <AppBar title="Contact Us" leading="menu" />
      <Body contentContainerStyle={styles.body}>
        <LinearGradient
          colors={['#E8F5EC', '#F7FBF8', Colors.white]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="leaf-outline" size={moderateScale(16)} color={Colors.brand} />
            <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.heroBadgeText}>
              We're here to help
            </CustomText>
          </View>
          <CustomText variant="h5" fontFamily={Fonts.montserrat.bold} style={styles.heroTitle}>
            Get in touch with Ecoil
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.heroIntro}>
            Looking to sell Used Cooking Oil or purchase biodiesel? We can help you. Get in touch
            now!
          </CustomText>
        </LinearGradient>

        <CustomText variant="h7" fontFamily={Fonts.montserrat.semiBold} style={styles.sectionTitle}>
          Reach us
        </CustomText>

        <ContactRow
          icon="location-outline"
          accent={Colors.brand}
          accentSoft={Colors.brandSoft}
          label="Office Location">
          <CustomText variant="h7" fontFamily={Fonts.montserrat.medium} style={styles.addressText}>
            {ADDRESS}
          </CustomText>
        </ContactRow>

        <ContactRow
          icon="call-outline"
          accent={Colors.brandMid}
          accentSoft="#D1FAE5"
          label="Give Us A Call"
          showChevron
          onPress={() => void Linking.openURL(`tel:${PHONE}`)}>
          <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={styles.linkText}>
            {PHONE}
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.hintText}>
            Tap to call
          </CustomText>
        </ContactRow>

        <ContactRow
          icon="mail-outline"
          accent="#0E7490"
          accentSoft={Colors.blueSoft}
          label="Send Us A Message"
          showChevron
          onPress={() => void Linking.openURL(`mailto:${EMAIL}`)}>
          <CustomText variant="h6" fontFamily={Fonts.montserrat.bold} style={[styles.linkText, {color: '#0E7490'}]}>
            {EMAIL}
          </CustomText>
          <CustomText variant="h7" fontFamily={Fonts.montserrat.regular} style={styles.hintText}>
            Tap to email
          </CustomText>
        </ContactRow>
      </Body>
    </Container>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScaleVertical(14),
    paddingBottom: moderateScaleVertical(40),
  },
  hero: {
    borderRadius: moderateScale(18),
    padding: moderateScale(18),
    marginBottom: moderateScaleVertical(20),
    borderWidth: 1,
    borderColor: '#D8EDE0',
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScaleVertical(5),
    borderRadius: moderateScale(20),
    marginBottom: moderateScaleVertical(12),
    borderWidth: 1,
    borderColor: '#D1E7D9',
  },
  heroBadgeText: {
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
  sectionTitle: {
    color: Colors.muted,
    fontSize: RFValue(11),
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: moderateScaleVertical(10),
    marginLeft: moderateScale(2),
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
  cardPressed: {
    opacity: 0.9,
    transform: [{scale: 0.99}],
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(12),
  },
  iconWrap: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    paddingTop: moderateScaleVertical(2),
  },
  rowLabel: {
    color: Colors.muted,
    fontSize: RFValue(11),
    marginBottom: moderateScaleVertical(4),
  },
  addressText: {
    color: Colors.black,
    fontSize: RFValue(12),
    lineHeight: RFValue(18),
  },
  linkText: {
    color: Colors.brand,
    fontSize: RFValue(14),
    letterSpacing: -0.2,
  },
  hintText: {
    color: Colors.placeHolderColor,
    fontSize: RFValue(10),
    marginTop: moderateScaleVertical(3),
  },
  chevronWrap: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScaleVertical(8),
  },
});
