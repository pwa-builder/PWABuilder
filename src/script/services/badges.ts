import { TestResult } from '../utils/interfaces';
import { getResults } from './app-info';

const possible_badges = [
  { name: 'pwa', url: '/assets/badges/pwa_badge.svg' },
  { name: 'security', url: '/assets/badges/security_badge.svg' },
  { name: 'sw', url: '/assets/badges/service_worker_badge.svg' },
  { name: 'manifest', url: '/assets/badges/manifest_small_badge.svg' },
  { name: 'store_ready', url: '/assets/badges/store_ready_badge.svg' },
];

const current_badges: Array<{name: string, url: string}> = [];

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
        if (badge.name === 'manifest') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }

    if (hasSW) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'sw') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }

    if (security) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'security') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }

    if (hasMani && hasSW && security) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'pwa') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }

    if (hasMani && hasSW && security && has_good_icon) {
      const badge = possible_badges.find(badge => {
        if (badge.name === 'store_ready') return badge;
      });

      if (badge) {
        current_badges.push(badge);
      }
    }
  }
}

export function getCurrentBadges(): Array<{name: string, url: string}> {
  return current_badges;
}

export function getPossibleBadges(): Array<{name: string, url: string}> {
  return possible_badges;
}
