import { localeStrings } from '../../locales';
export interface CardData {
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
}

export const resourceCards: Array<CardData> = [
  {
    imageUrl: '/assets/new/manifest.svg',
    title: localeStrings.text.resource_hub_new.titles.manifest,
    description: localeStrings.text.resource_hub_new.description.manifest,
    linkUrl: 'https://docs.pwabuilder.com/#/home/pwa-intro?id=web-app-manifests',
  },
  {
    imageUrl: '/assets/new/sw.svg',
    title: localeStrings.text.resource_hub_new.titles.sw,
    description: localeStrings.text.resource_hub_new.description.sw,
    linkUrl: 'https://docs.pwabuilder.com/#/home/sw-intro',
  },
  {
    imageUrl: '/assets/new/https.svg',
    title: localeStrings.text.resource_hub_new.titles.https,
    description: localeStrings.text.resource_hub_new.description.https,
    linkUrl: 'https://docs.pwabuilder.com/#/home/sw-intro?id=security',
  },
];

// for the landing page
export function landingCards() {
  return resourceCards;
}

// For the complete page
export function publishCards() {
  return resourceCards.slice(1);
}
