export interface infoPanel {
  description: string;
  purpose?: string;
  example: string;
  code: string;
  required: boolean;
  location?: "info" | "settings" | "platform" | "icons" | "screenshots";
}

export const testInfo: { [field: string]: infoPanel} = {
  "categories": {
                  description: "categories is an optional member that specifies an array of categories that the application belongs to. Though this array isn't limited to specific values, you can find a list of known categories here.",
                  purpose: "categories is an optional member that specifies an array of categories that the application belongs to. Though this array isnt limited to specific values, you can find a list of known categories here.",
                  example: "idk whats gonna go here its supposed to be a step by step thing but we'll see, i am just gonna type for now and see waht happens whenever zach gets me the code and we'll go from there cool, sounds good to me.",
                  code: `"categories": ["games", "finance", "navigation"]`,
                  required: false,
                  location: "platform"
                },
  "display_override": {
                  description: "display_override is similar to the display member, but allows you to select a fallback order for different display modes. In addition to the four display values above, display_override can also take the value window-control-overlay. Window-control-overlay is a desktop-only display mode and adds a native-style overlay to the top of your application.",
                  purpose: "You should use the display override field because it gives you more control over the way that your app is displayed. In cases where you first choice display option isn't available, it gives you control over the fall backs. On the Windows platform, the option 'window-control-overlay' gives you more control over the styles of the toolbar in your PWA",
                  example: "idk whats gonna go here its supposed to be a step by step thing but we'll see, i am just gonna type for now and see waht happens whenever zach gets me the code and we'll go from there cool, sounds good to me.",
                  code: `"display_override": [
  "window-control-overlay",
  "standalone",
  "browser"
]`,
                  required: false,
                  location: "settings"
                },
}
