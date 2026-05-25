import ExternalTabBar from '@/navigations/ExternalTabBar';
import {VendorChrome} from '@/navigations/VendorChrome';
import React from 'react';

/** Stack screen hosting bottom tabs (nested navigator). */
export default function MainScreen() {
  return (
    <VendorChrome>
      <ExternalTabBar />
    </VendorChrome>
  );
}
