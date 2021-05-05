export interface CardData {
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
}

export const resourceCards: Array<CardData> = [
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Blog',
    description:
      'Check out the PWABuilder blog for all the latest on PWABuilder and PWAs',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Demo',
    description:
      'Check out our demos to see what PWAs are capable of!',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Components',
    description:
      'Looking to upgrade your PWA? Check out some of our components we offer!',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Documentation',
    description:
      'Looking for our documentation? Tap View Documentation to get started!',
    linkUrl: '',
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
