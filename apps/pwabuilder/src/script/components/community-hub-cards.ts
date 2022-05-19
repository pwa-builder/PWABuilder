import { localeStrings } from '../../locales';
export interface CardData {
  imageUrl: string;
  title: string;
  description: string;
  links: link[];
  company: string;
}

export interface link {
    link: string,
    text: string
}

export const communityCards: Array<CardData> = [
  {
    imageUrl: '/assets/new/github.png',
    title: localeStrings.text.community_hub.titles.github,
    description: localeStrings.text.community_hub.description.github,
    links: [
      {
        link: 'https://github.com/pwa-builder/PWABuilder',
        text: 'Visit us on GitHub'
      },
      {
        link: 'https://github.com/pwa-builder/PWABuilder/wiki/How-to-contribute-to-PWABuilder',
        text: 'Contribute to project'
      }
    ],
    company: "github"
  },
  {
    imageUrl: '/assets/new/twitter.png',
    title: localeStrings.text.community_hub.titles.twitter,
    description: localeStrings.text.community_hub.description.twitter,
    links: [
      {
        link: 'https://twitter.com/pwabuilder',
        text: 'Follow our Twitter'
      }
    ],
    company: "twitter"
  },
  {
    imageUrl: '/assets/new/discord.png',
    title: localeStrings.text.community_hub.titles.discord,
    description: localeStrings.text.community_hub.description.discord,
    links: [
      {
        link: 'https://aka.ms/pwabuilderdiscord',
        text: 'Join our Discord'
      }
    ],
    company: "discord"
  },
];

export function getCards() {
  return communityCards;
}
