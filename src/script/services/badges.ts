import { TestResult } from '../utils/interfaces';
import { getResults } from './app-info';

const possible_badges = [
  { name: 'PWA', url: '/assets/badges/pwa_badge.svg' },
  { name: 'Security', url: '/assets/badges/security_badge.svg' },
  { name: 'Service Worker', url: '/assets/badges/service_worker_badge.svg' },
  { name: 'Manifest', url: '/assets/badges/manifest_small_badge.svg' },
  { name: 'Store Ready', url: '/assets/badges/store_ready_badge.svg' },
];

const current_badges: Array<{ name: string; url: string }> = [];

export const no_pwa_icon = {
  name: 'Not a PWA',
  url: '/assets/badges/pwa_grey.svg',
};

export function giveOutBadges() {
  const results = getResults();

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
  }

  sessionStorage.setItem('current_badges', JSON.stringify(current_badges));
}

export function getCurrentBadges(): Array<{ name: string; url: string }> | null {
  const savedCurrentBadges = sessionStorage.getItem('current_badges');

  if (current_badges && current_badges.length > 0) {
    return current_badges;
  }
  else if (savedCurrentBadges) {
    return JSON.parse(savedCurrentBadges);
  }
  else {
    return null;
  }
}

export function getPossibleBadges(): Array<{ name: string; url: string }> {
  return possible_badges;
}

export function sortBadges(): Array<{ name: string; url: string }> {
  const possible_badges = getPossibleBadges();
  const current_badges = getCurrentBadges();

  const combined: Array<{ name: string; url: string }> = [];

  possible_badges.forEach(badge => {
    combined.push(badge);
  });

  current_badges?.forEach(badge => {
    combined.push(badge);
  });

  const duplicates = combined.reduce(
    (
      acc: Array<{ name: string; url: string }>,
      currentValue,
      index,
      array: Array<{ name: string; url: string }>
    ) => {
      if (
        array.indexOf(currentValue) != index &&
        !acc.includes((currentValue.name as any))
      )
        acc.push(currentValue);
      return acc;
    },
    []
  );

  return duplicates;
}
