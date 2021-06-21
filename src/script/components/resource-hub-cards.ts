export interface CardData {
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
}

export const resourceCards: Array<CardData> = [
  {
    imageUrl: '/assets/images/blog-card.webp',
    title: 'Blog',
    description:
      'Check out the PWABuilder blog for all the latest on PWABuilder and PWAs',
    linkUrl: 'https://blog.pwabuilder.com',
  },
  {
    imageUrl: '/assets/images/docs-card.webp',
    title: 'Documentation',
    description:
      'Looking for our documentation? Tap View Documentation to get started!',
    linkUrl: 'https://blog.pwabuilder.com/docs',
  },
  {
    imageUrl: '/assets/images/demo-card.webp',
    title: 'Demos',
    description:
      'Check out our demos to see what PWAs are capable of!',
    linkUrl: 'https://blog.pwabuilder.com/demos',
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
