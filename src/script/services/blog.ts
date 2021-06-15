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
    date: 'Oct 20, 2020 ',
    imageUrl: '/assets/images/windows_blog.png',
    shareUrl: 'https://medium.com/pwabuilder/bringing-chromium-edge-pwas-progressive-web-apps-to-the-microsoft-store-c0bd07914ed9?source=friends_link&sk=04ca8b2ae2bd094b04ef6b53780b5698',
    clickUrl: 'https://medium.com/pwabuilder/bringing-chromium-edge-pwas-progressive-web-apps-to-the-microsoft-store-c0bd07914ed9?source=friends_link&sk=04ca8b2ae2bd094b04ef6b53780b5698',
    tags: ['Windows', 'Store'],
    relatedPlatform: "windows"
  },
  {
    title: 'PWAs in the Google Play Store',
    description: 'Learn more about how to ship your PWA to the Google Play Store!',
    date: 'Jul 9, 2020 ',
    imageUrl: '/assets/images/android_blog.png',
    shareUrl: 'https://medium.com/pwabuilder/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store-b59710e487?source=friends_link&sk=a633482f2510eba814b1949219c74d6d',
    clickUrl: 'https://medium.com/pwabuilder/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store-b59710e487?source=friends_link&sk=a633482f2510eba814b1949219c74d6d',
    tags: ['Android', 'Store'],
    relatedPlatform: "android"
  },
  {
    title: 'Building PWAs with Web Components!',
    description: 'Learn how the PWABuilder team builds PWAs!',
    date: 'Jan 11, 2021',
    imageUrl: '/assets/images/pwa_web_components.png',
    shareUrl: 'https://medium.com/pwabuilder/building-pwas-with-web-components-33f986bf8e4c?source=friends_link&sk=9f449e76bbb37f063283602c6c3f946f',
    clickUrl: 'https://medium.com/pwabuilder/building-pwas-with-web-components-33f986bf8e4c?source=friends_link&sk=9f449e76bbb37f063283602c6c3f946f',
    tags: ['Web Components', 'PWA'],
  },
];
