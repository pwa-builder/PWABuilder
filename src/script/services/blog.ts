import { platform } from "./publish";

export interface BlogPost {
  title: string;
  description: string;
  date: string; // make into Date object?
  imageUrl: string;
  shareUrl: string;
  clickUrl: string;
  tags: Array<string>;
  relatedPlatform?: platform
}

export const allPosts: Array<BlogPost> = [
  {
    title: 'Bringing Chromium Edge PWAs to the Microsoft Store',
    description: 'Learn more details on what Chromium Edge PWAs mean for you and your app!',
    date: 'Date of Post',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: 'https://medium.com/pwabuilder/bringing-chromium-edge-pwas-progressive-web-apps-to-the-microsoft-store-c0bd07914ed9?source=friends_link&sk=04ca8b2ae2bd094b04ef6b53780b5698',
    clickUrl: 'https://medium.com/pwabuilder/bringing-chromium-edge-pwas-progressive-web-apps-to-the-microsoft-store-c0bd07914ed9?source=friends_link&sk=04ca8b2ae2bd094b04ef6b53780b5698',
    tags: ['a', 'b'],
    relatedPlatform: "windows"
  },
  {
    title: 'PWAs in the Google Play Store',
    description: 'description post',
    date: 'Date of Post',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: 'https://medium.com/pwabuilder/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store-b59710e487?source=friends_link&sk=a633482f2510eba814b1949219c74d6d',
    clickUrl: 'https://medium.com/pwabuilder/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store-b59710e487?source=friends_link&sk=a633482f2510eba814b1949219c74d6d',
    tags: ['a', 'b'],
    relatedPlatform: "android"
  },
  {
    title: 'Title of Post',
    description: 'description post',
    date: 'Date of Post',
    imageUrl: '/assets/icons/icon_120.png',
    shareUrl: '',
    clickUrl: '',
    tags: ['a', 'b'],
  },
];
