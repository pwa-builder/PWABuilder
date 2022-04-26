import { Platform } from './publish';

export interface BlogPost {
  title: string;
  description: string;
  date: string; // make into Date object?
  imageUrl: string;
  shareUrl: string;
  clickUrl: string;
  tags: Array<string>;
  relatedPlatform?: Platform;
}

export const allPosts: Array<BlogPost> = [
  {
    title: 'Bringing Chromium Edge PWAs to the Microsoft Store',
    description:
      'Learn more details on what Chromium Edge PWAs mean for you and your app!',
    date: 'Oct 20, 2020',
    imageUrl: '/assets/images/edge-chromium.webp',
    shareUrl:
      'https://blog.pwabuilder.com/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/',
    clickUrl:
      'https://blog.pwabuilder.com/posts/bringing-chromium-edge-pwas-to-the-microsoft-store/',
    tags: ['Windows', 'Store'],
    relatedPlatform: 'windows',
  },
  {
    title: 'PWAs in the Google Play Store',
    description:
      'Learn more about how to ship your PWA to the Google Play Store!',
    date: 'Jul 9, 2020',
    imageUrl: '/assets/images/android_blog.png',
    shareUrl:
      'https://blog.pwabuilder.com/posts/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store/',
    clickUrl:
      'https://blog.pwabuilder.com/posts/microsoft-and-google-team-up-to-make-pwas-better-in-the-play-store/',
    tags: ['Android', 'Store'],
    relatedPlatform: 'android',
  },
  {
    title: 'Publisher your PWA to the iOS App Store',
    description:
      'Learn how your PWA can run on iOS and be published to the iOS App Store',
    date: 'Oct 28, 2021',
    imageUrl: 'https://blog.pwabuilder.com/posts/announcing-ios/ios-announcement.png',
    shareUrl:
      'https://blog.pwabuilder.com/posts/publish-your-pwa-to-the-ios-app-store/',
    clickUrl:
      'https://blog.pwabuilder.com/posts/publish-your-pwa-to-the-ios-app-store/',
    tags: ['Android', 'Store'],
    relatedPlatform: 'ios',
  },
  {
    title: 'Building PWAs with Web Components!',
    description: 'Learn how the PWABuilder team builds PWAs!',
    date: 'Jan 11, 2021',
    imageUrl: '/assets/images/pwa_web_components.png',
    shareUrl:
      'https://blog.pwabuilder.com/posts/building-pwas-with-web-components!/',
    clickUrl:
      'https://blog.pwabuilder.com/posts/building-pwas-with-web-components!/',
    tags: ['Web Components', 'PWA'],
  },
];
