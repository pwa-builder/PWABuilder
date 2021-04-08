import { TestResult } from '../utils/interfaces';
import { getResults } from './app-info';

const possible_badges = [
  { name: 'PWA', url: '/assets/badges/pwa_badge.svg' },
  { name: 'Security', url: '/assets/badges/security_badge.svg' },
  { name: 'Service Worker', url: '/assets/badges/service_worker_badge.svg' },
  { name: 'Manifest', url: '/assets/badges/manifest_small_badge.svg' },
  { name: 'Store Ready', url: '/assets/badges/store_ready_badge.svg' },
];

const current_badges: Array<{name: string, url: string}> = [];

export const no_pwa_icon = {
  name: "Not a PWA",
  url: "/assets/badges/pwa_grey.svg"
}

export function giveOutBadges() {
  const results = getResults();

  console.log(possible_badges);

  console.log(results);

  if (results) {
    const hasMani = results.manifest[0].result;
    const hasSW = results.service_worker[0].result;
    const security = results.security[0].result;

    //has 512 icon
    const has_good_icon = (results.manifest as TestResult[]).map(result =>
      result.infoString.includes('512x512') ? result.result : false
    );

    if (hasMani) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'Manifest') return badge;
      });

      console.log('maniBadge', badge);

      if (badge) {
        current_badges.push(badge);
      }
    }

    if (hasSW) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'Service Worker') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }

    if (security) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'Security') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }

    if (hasMani && hasSW && security) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'PWA') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }

    if (hasMani && hasSW && security && has_good_icon) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'Store Ready') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }

    console.log('current', current_badges);
  }
}

export function getCurrentBadges(): Array<{name: string, url: string}> {
  return current_badges;
}

export function getPossibleBadges(): Array<{name: string, url: string}> {
  return possible_badges;
}
