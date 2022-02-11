import { localeStrings } from '../../locales';
export interface CardData {
  imageUrl: string;
  stat: string;
  description: string;
  value: string;
}

export const communityCards: Array<CardData> = [
  {
    imageUrl: '/assets/new/trivago.png',
    stat: localeStrings.text.success_stories.stat.trivago,
    description: localeStrings.text.success_stories.description.trivago,
    value: localeStrings.text.success_stories.value.trivago
  },
  {
    imageUrl: '/assets/new/alibaba.png',
    stat: localeStrings.text.success_stories.stat.alibaba,
    description: localeStrings.text.success_stories.description.alibaba,
    value: localeStrings.text.success_stories.value.alibaba
  },
  {
    imageUrl: '/assets/new/pintrest.png',
    stat: localeStrings.text.success_stories.stat.pintrest,
    description: localeStrings.text.success_stories.description.pintrest,
    value: localeStrings.text.success_stories.value.pintrest
  },
  {
    imageUrl: '/assets/new/tinder.png',
    stat: localeStrings.text.success_stories.stat.tinder,
    description: localeStrings.text.success_stories.description.tinder,
    value: localeStrings.text.success_stories.value.tinder
  },
  
];

export function getCards() {
  return communityCards;
}
