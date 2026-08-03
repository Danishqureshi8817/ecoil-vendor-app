import type {ImageSourcePropType} from 'react-native';
import {Colors} from '@/constants/colors';

export type OnboardingIllustrationTheme = 'green' | 'yellow';

export type OnboardingSlide = {
  id: string;
  image: ImageSourcePropType;
  tipIcon: ImageSourcePropType;
  illustrationTheme: OnboardingIllustrationTheme;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  tip: string;
  showBack: boolean;
  showSkip: boolean;
};

const ILLUSTRATION_BG: Record<OnboardingIllustrationTheme, string> = {
  green: Colors.onboardingIllustrationGreen,
  yellow: Colors.onboardingIllustrationYellow,
};

export function getOnboardingIllustrationBg(theme: OnboardingIllustrationTheme): string {
  return ILLUSTRATION_BG[theme];
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    image: require('@/assets/images/onboarding/onboarding1.png'),
    tipIcon: require('@/assets/images/onboarding/onboarding1icon.png'),
    illustrationTheme: 'green',
    titlePrefix: 'Cool down your',
    titleHighlight: 'Oil',
    subtitle: 'Let the oil cool for a few minutes before the next step.',
    tip: 'Cooling helps keep the oil safe and easy to handle.',
    showBack: false,
    showSkip: true,
  },
  {
    id: '2',
    image: require('@/assets/images/onboarding/onboarding2.png'),
    tipIcon: require('@/assets/images/onboarding/onboarding2icon.png'),
    illustrationTheme: 'yellow',
    titlePrefix: 'Fill it in a drum/',
    titleHighlight: 'bottle',
    subtitle: 'Pour the cooled oil into a clean drum or bottle.',
    tip: 'Use a clean, dry container to keep your oil fresh.',
    showBack: true,
    showSkip: false,
  },
  {
    id: '3',
    image: require('@/assets/images/onboarding/onboarding3.png'),
    tipIcon: require('@/assets/images/onboarding/onboarding3icon.png'),
    illustrationTheme: 'green',
    titlePrefix: 'Create a pickup',
    titleHighlight: 'request',
    subtitle: "Schedule a pickup in just a few taps and we'll handle the rest.",
    tip: "We'll pick up your used oil safely and responsibly.",
    showBack: true,
    showSkip: false,
  },
  {
    id: '4',
    image: require('@/assets/images/onboarding/onboarding4.png'),
    tipIcon: require('@/assets/images/onboarding/onboarding4icon.png'),
    illustrationTheme: 'green',
    titlePrefix: 'Earn Green Points and',
    titleHighlight: 'Rewards',
    subtitle: 'Collect points with every pickup and unlock exciting rewards.',
    tip: 'The more you recycle, the more you earn.',
    showBack: true,
    showSkip: false,
  },
  {
    id: '5',
    image: require('@/assets/images/onboarding/onboarding5.png'),
    tipIcon: require('@/assets/images/onboarding/onboarding5icon.png'),
    illustrationTheme: 'yellow',
    titlePrefix: 'FBO pickup from your',
    titleHighlight: 'premises',
    subtitle: "We'll come to your location and pick up the used oil, hassle-free.",
    tip: 'Safe and secure pickup, on-time service.',
    showBack: true,
    showSkip: false,
  },
];
