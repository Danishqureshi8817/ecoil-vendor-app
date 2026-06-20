import type {ComponentType} from 'react';
import type {SvgProps} from 'react-native-svg';
import {
  HomeServiceFSSAITrainingIcon,
  HomeServiceOilCollectionIcon,
  HomeServicePestServiceIcon,
  HomeServiceRestaurantReviewManagementIcon,
  HomeServiceTestingIcon,
} from '@/components/icon/icon';

type IconEntry = {
  match: (name: string) => boolean;
  Icon: ComponentType<SvgProps>;
};

const ENTRIES: IconEntry[] = [
  {
    match: n => /oil\s*collection/i.test(n),
    Icon: HomeServiceOilCollectionIcon,
  },
  {
    match: n => /fssai|training/i.test(n),
    Icon: HomeServiceFSSAITrainingIcon,
  },
  {
    match: n => /pest/i.test(n),
    Icon: HomeServicePestServiceIcon,
  },
  {
    match: n => /restaurant|review/i.test(n),
    Icon: HomeServiceRestaurantReviewManagementIcon,
  },
  {
    match: n => /test/i.test(n),
    Icon: HomeServiceTestingIcon,
  },
];

export function getHomeServiceIcon(
  serviceName: string,
): ComponentType<SvgProps> | null {
  const normalized = serviceName.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return ENTRIES.find(e => e.match(normalized))?.Icon ?? null;
}

export function filterServicesWithHomeIcons<T extends {name: string}>(
  services: T[],
): T[] {
  return services.filter(s => getHomeServiceIcon(s.name) != null);
}
