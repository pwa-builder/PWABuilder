import { html } from 'lit-element';

interface CardData {
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
      'Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Demo',
    description:
      'Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Components',
    description:
      'Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Documentation',
    description:
      'Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing',
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
