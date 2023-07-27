import { Article, ChildMenu, ParentMenu } from "./menuInterfaces";

export const parentMenuData: ParentMenu = {
  childMenus: [
    {
      header: "Home", 
      path: "/home/",
      articles: [
        {
          pageTitle: "PWABuilder Suite Documentation",
          menuTitle: "About",
          path: "/",
          includeOnHomePage: true
        },
        {
          pageTitle: "Beginner's Guide to PWA",
          menuTitle: "PWA Overview",
          path: "/home/pwa-intro",
          includeOnHomePage: true
        },
        {
          pageTitle: "Introduction to Service Workers",
          menuTitle: "Service Workers",
          path: "/home/sw-intro",
          includeOnHomePage: true
        },
        {
          pageTitle: "Adding Native Features to Your PWA",
          menuTitle: "Adding Native Features",
          path: "/home/native-features.md",
          includeOnHomePage: true
        },
        {
          pageTitle: "Progressive Web App Intro Workshop",
          menuTitle: "PWA Workshop",
          path: "/home/pwa-workshop",
          includeOnHomePage: true
        },
        {
          pageTitle: "Resources",
          menuTitle: "Resources",
          path: "/home/resources",
          includeOnHomePage: true
        }
      ]
    },
    {
      header: "PWA Starter",
      path: "/starter/",
      articles: [
        {
          pageTitle: "PWA Starter - Quick Start",
          menuTitle: "Quick Start",
          path: "/starter/quick-start",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWA Starter - Routing and Navigation",
          menuTitle: "Routing",
          path: "/starter/adding-content",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWA Starter - Using Service Workers",
          menuTitle: "Service Workers",
          path: "/starter/service-worker",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWA Starter - Publish Your PWA to the Web",
          menuTitle: "Publish Your PWA",
          path: "/starter/publish",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWA Starter - Tech Overview",
          menuTitle: "Tech Overview",
          path: "/starter/tech-overview",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWA Starter - FAQ",
          menuTitle: "FAQ",
          path: "/starter/faq",
          includeOnHomePage: false
        }
      ]
    },
    {
      header: "PWABuilder",
      path: "/builder/",
      articles: [
        {
          pageTitle: "PWABuilder - Quick Start",
          menuTitle: "Quick Start",
          path: "/builder/quick-start",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - Using PWABuilder Features",
          menuTitle: "Using PWABuilder Features",
          path: "/builder/using-pwabuilder-features ",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - Customizing Your Web App Manifest",
          menuTitle: "Manifest Options",
          path: "/builder/manifest",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - Packaging for the Microsoft Store",
          menuTitle: "Microsoft Store",
          path: "/builder/windows",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - Packaging for the Google Play Store",
          menuTitle: "Google Play Store",
          path: "/builder/android",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - Creating Android Packages",
          menuTitle: "Other Android",
          path: "/builder/other-android",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - Meta Quest",
          menuTitle: "Meta Quest",
          path: "/builder/meta",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - Packaging for the App Store",
          menuTitle: "iOS App Store",
          path: "/builder/app-store",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - Fixing Your Android Asset Links",
          menuTitle: "Asset Links Help",
          path: "/builder/asset-links-faq",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder - FAQ",
          menuTitle: "FAQ",
          path: "/builder/faq",
          includeOnHomePage: false
        }
      ]
    },
    {
      header: "PWABuilder Studio",
      path: "/studio/",
      articles: [
        {
          pageTitle: "PWABuilder Studio - Quick Start",
          menuTitle: "Quick Start",
          path: "/studio/quick-start",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder Studio - Create a New PWA",
          menuTitle: "Create a New PWA",
          path: "/studio/create-new",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder Studio - Dev Dashboard",
          menuTitle: "Dev Dashboard",
          path: "/studio/dev-dashboard",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder Studio - Converting Existing Apps",
          menuTitle: "Converting Existing Apps",
          path: "/studio/existing-app",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder Studio - Package Your PWA For Stores",
          menuTitle: "Package Your PWA",
          path: "/studio/package",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder Studio - Code Snippets",
          menuTitle: "Code Snippets",
          path: "/studio/snippets",
          includeOnHomePage: false
        },
        {
          pageTitle: "PWABuilder Studio - FAQ",
          menuTitle: "FAQ",
          path: "/studio/faq",
          includeOnHomePage: false
        }
      ]
    },
    {
      header: "Release Notes",
      path: "/release-notes/",
      articles: [
        {
          pageTitle: "Release Notes - 2023",
          menuTitle: "2023",
          path: "/release-notes/2023",
          includeOnHomePage: true
        },
        {
          pageTitle: "Release Notes - 2022",
          menuTitle: "2022",
          path: "/release-notes/2022",
          includeOnHomePage: true
        }
      ]
    }
  ]
}

export const topLevelNavEntries: string[][] = [
  ["Home", "/#"],
  ["PWABuilder","/#/builder/quick-start"],
  ["PWA Starter","/#/starter/quick-start"],
  ["PWABuilder Studio", "/#/studio/quick-start"]
];

export const headerHTMLString: string = `<div align=center>
  <img src="assets/icons/pwa-builder.png" alt="PWABuilder Logo">
</div>`;

export const quickMenuListenerScriptString: string = `
<script>
  const menu = document.querySelector('sl-menu');
  menu.addEventListener('click', event => {
    const href = event.target.dataset.href;
    console.log("event recieved");
    console.log(href);
    if (href) {
      location.href = href;
    }
  });
</script>`;