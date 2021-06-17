import { localeStrings } from '../../locales';
export interface CardData {
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
}

export const resourceCards: Array<CardData> = [
  {
    imageUrl: '/assets/images/blog-card.webp',
    title: localeStrings.text.resource_hub.titles.blog,
    description: localeStrings.text.resource_hub.description.blog,
    linkUrl: 'https://aka.ms/pwabuilderv3',
  },
  {
    imageUrl: '/assets/images/demo-card.webp',
    title: localeStrings.text.resource_hub.titles.demo,
    description: localeStrings.text.resource_hub.description.demo,
    linkUrl: 'https://components.pwabuilder.com/',
  },
  {
    imageUrl: '/assets/images/docs-card.webp',
    title: localeStrings.text.resource_hub.titles.documentation,
    description: localeStrings.text.resource_hub.description.documentation,
    linkUrl: 'https://aka.ms/pwabuilderv3',
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
