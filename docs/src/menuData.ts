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
          pageTitle: "Benefits of Progressive Web Apps",
          menuTitle: "Why Build A PWA?",
          path: "/home/benefits-of-pwa",
          includeOnHomePage: true
        },
        {
          pageTitle: "Introduction to Service Workers",
          menuTitle: "Service Workers",
          path: "/home/sw-intro",
          includeOnHomePage: true
        },
        {
          pageTitle: "Adding App Capabilities to Your PWA",
          menuTitle: "Adding App Capabilities",
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
          pageTitle: "PWA Starter - CLI Usage",
          menuTitle: "CLI Usage",
          path: "/starter/cli-usage",
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
<style>
/* Accessible navigation tree styles */
.nav-tree {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin: 2px 0;
}

.nav-item:hover, .nav-item:focus {
  background-color: #f0f0f0;
  outline: 2px solid #0066cc;
  outline-offset: -2px;
}

.nav-item.selected {
  background-color: #e6f3ff;
  font-weight: bold;
}

.section-header {
  margin: 16px 0 8px 0;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-left: 4px solid #0066cc;
  cursor: pointer;
  border-radius: 4px;
}

.section-header:hover, .section-header:focus {
  background-color: #e9ecef;
  outline: 2px solid #0066cc;
  outline-offset: -2px;
}

.section-articles {
  list-style: none;
  padding-left: 20px;
  margin: 0;
}

.article-item {
  padding: 4px 12px;
  margin: 2px 0;
  border-radius: 4px;
}

.article-item:focus {
  outline: 2px solid #0066cc;
  outline-offset: -2px;
}

.article-link {
  color: #0066cc;
  text-decoration: none;
  display: block;
  padding: 4px 0;
}

.article-link:hover {
  text-decoration: underline;
}

/* Hidden expanded/collapsed state indicators for screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

<script>
(function() {
  // Wait for DOM to be ready
  function initAccessibleNavigation() {
    const navTree = document.querySelector('.nav-tree');
    const sections = document.querySelectorAll('.section-header');
    
    if (!navTree) return;
    
    let currentFocus = 0;
    const focusableElements = [];
    
    // Collect all focusable elements
    function updateFocusableElements() {
      focusableElements.length = 0;
      
      // Add top-level nav items
      const navItems = navTree.querySelectorAll('.nav-item');
      navItems.forEach(item => focusableElements.push(item));
      
      // Add section headers
      sections.forEach(header => focusableElements.push(header));
      
      // Add visible article items
      const visibleArticles = document.querySelectorAll('.section-articles .article-item');
      visibleArticles.forEach(item => focusableElements.push(item));
      
      // Set initial focus to selected item or first item
      const selectedItem = navTree.querySelector('.nav-item.selected');
      if (selectedItem) {
        currentFocus = focusableElements.indexOf(selectedItem);
      }
      
      updateTabIndexes();
    }
    
    function updateTabIndexes() {
      focusableElements.forEach((element, index) => {
        element.tabIndex = index === currentFocus ? 0 : -1;
      });
    }
    
    function setFocus(index) {
      if (index >= 0 && index < focusableElements.length) {
        currentFocus = index;
        updateTabIndexes();
        focusableElements[currentFocus].focus();
        
        // Announce position for screen readers
        const element = focusableElements[currentFocus];
        const position = index + 1;
        const total = focusableElements.length;
        
        // Update aria-posinset for current context
        element.setAttribute('aria-posinset', position);
        element.setAttribute('aria-setsize', total);
      }
    }
    
    function handleKeydown(event) {
      let handled = false;
      
      switch(event.key) {
        case 'ArrowDown':
          setFocus(currentFocus + 1);
          handled = true;
          break;
          
        case 'ArrowUp':
          setFocus(currentFocus - 1);
          handled = true;
          break;
          
        case 'Home':
          setFocus(0);
          handled = true;
          break;
          
        case 'End':
          setFocus(focusableElements.length - 1);
          handled = true;
          break;
          
        case 'Enter':
        case ' ':
          const currentElement = focusableElements[currentFocus];
          if (currentElement) {
            if (currentElement.classList.contains('nav-item')) {
              // Navigate to the href
              const href = currentElement.getAttribute('data-href');
              if (href) {
                location.href = href;
              }
            } else if (currentElement.classList.contains('article-item')) {
              // Click the link
              const link = currentElement.querySelector('a');
              if (link) {
                link.click();
              }
            }
          }
          handled = true;
          break;
      }
      
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    
    // Handle clicks on nav items
    function handleNavClick(event) {
      const navItem = event.target.closest('.nav-item');
      if (navItem) {
        const href = navItem.getAttribute('data-href');
        if (href) {
          location.href = href;
        }
      }
    }
    
    // Initialize navigation
    updateFocusableElements();
    
    // Add event listeners
    document.addEventListener('keydown', handleKeydown);
    if (navTree) {
      navTree.addEventListener('click', handleNavClick);
    }
    
    // Handle section expand/collapse (for future enhancement)
    sections.forEach(header => {
      header.addEventListener('click', function() {
        const section = this.parentElement;
        const articles = section.querySelector('.section-articles');
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        this.setAttribute('aria-expanded', !isExpanded);
        
        // Add screen reader announcement
        const announcement = document.createElement('div');
        announcement.className = 'sr-only';
        announcement.setAttribute('aria-live', 'polite');
        announcement.textContent = isExpanded ? 
          this.textContent + ' section collapsed' : 
          this.textContent + ' section expanded';
        document.body.appendChild(announcement);
        
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
        
        updateFocusableElements();
      });
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccessibleNavigation);
  } else {
    initAccessibleNavigation();
  }
  
  // Also initialize after docsify renders content
  if (window.$docsify) {
    window.$docsify.plugins = window.$docsify.plugins || [];
    window.$docsify.plugins.push(function(hook) {
      hook.doneEach(function() {
        setTimeout(initAccessibleNavigation, 100);
      });
    });
  }
})();
</script>`;