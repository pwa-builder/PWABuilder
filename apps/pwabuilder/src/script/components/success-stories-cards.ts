import { localeStrings } from '../../locales';
export interface CardData {
  imageUrl: string;
  stat: string;
  description: string;
  value: string;
  company: string;
  source: string
}

export const communityCards: Array<CardData> = [
  {
    imageUrl: '/assets/new/trivago.png',
    stat: localeStrings.text.success_stories.stat.trivago,
    description: localeStrings.text.success_stories.description.trivago,
    value: localeStrings.text.success_stories.value.trivago,
    company: "trivago",
    source: "https://www.thinkwithgoogle.com/intl/en-gb/marketing-strategies/app-and-mobile/trivago-embrace-progressive-web-apps-as-the-future-of-mobile/"
  },
  {
    imageUrl: '/assets/new/alibaba.png',
    stat: localeStrings.text.success_stories.stat.alibaba,
    description: localeStrings.text.success_stories.description.alibaba,
    value: localeStrings.text.success_stories.value.alibaba,
    company: "alibaba",
    source: "https://developers.google.com/web/showcase/2016/alibaba"
  },
  {
    imageUrl: '/assets/new/pintrest.png',
    stat: localeStrings.text.success_stories.stat.pintrest,
    description: localeStrings.text.success_stories.description.pintrest,
    value: localeStrings.text.success_stories.value.pintrest,
    company: "pintrest",
    source: "https://medium.com/dev-channel/a-pinterest-progressive-web-app-performance-case-study-3bd6ed2e6154"
  },
  {
    imageUrl: '/assets/new/tinder.png',
    stat: localeStrings.text.success_stories.stat.tinder,
    description: localeStrings.text.success_stories.description.tinder,
    value: localeStrings.text.success_stories.value.tinder,
    company: "tinder",
    source: "https://medium.com/@addyosmani/a-tinder-progressive-web-app-performance-case-study-78919d98ece0"
  },
  
];

export function getCards() {
  return communityCards;
}
