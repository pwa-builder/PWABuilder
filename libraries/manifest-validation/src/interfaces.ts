export interface Validation {
    infoString?: string;
    displayString?: string;
    category: string;
    member: string;
    defaultValue?: string | boolean | any[]; // prefer related apps is a boolean
    docsLink?: string;
    errorString: string;
    quickFix: boolean;
    test?: Function;
    testRequired?: boolean;
    testName?: string;
    valid?: boolean;
}

export type PartialValidation = {
    member: string;
    displayString?: string;
    errorString?: string;
    infoString?: string;
    docsLink?: string;
    valid: boolean;
}

export interface Manifest {
    background_color?: string;
    description?: string;
    dir?: "auto" | "ltr" | "rtl" | string;
    display?: "standalone" | "fullscreen" | "fullscreen-sticky";
    lang?: string | undefined;
    name?: string | undefined;
    orientation?:
      | "any"
      | "natural"
      | "landscape"
      | "portrait"
      | "portrait-primary"
      | "portrait-secondary"
      | "landscape-primary"
      | "landscape-secondary";
    prefer_related_applications?: boolean;
    related_applications?: RelatedApplication[];
    scope?: string;
    short_name?: string;
    start_url?: string;
    theme_color?: string;
    generated?: boolean;
    shortcuts?: ShortcutItem[];
    categories?: string[];
    screenshots?: Screenshot[];
    iarc_rating_id?: string;
    iconBlobUrls?: string[];
    icons?: Icon[];
    share_target?: ShareTarget;
  
    // for custom properties as well as using object notations: manifest[key]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - accomodate custom entries... these can be a pain
    [key: string]: string | boolean | undefined | Array<any> | any;
  }
  
  export interface ShortcutItem {
    name: string;
    url: string;
    description?: string;
    short_name?: string;
    icons?: Icon[];
  }
  
  export interface Icon {
    src: string;
    generated?: boolean;
    type?: string;
    sizes?: string;
    purpose?: "any" | "maskable" | "monochrome";
    label?: string;
  }
  
  export interface Screenshot extends Icon {
    platform?:
      | "narrow"
      | "wide"
      | "android"
      | "chromeos"
      | "ios"
      | "kaios"
      | "macos"
      | "windows"
      | "xbox"
      | "chrome_web_store"
      | "play"
      | "itunes"
      | "microsoft-inbox"
      | "microsoft-store";
  }
  
  export interface RelatedApplication {
    platform: string;
    url?: string | null;
    id?: string | null;
    min_version?: string | null;
    fingerprints?: Fingerprint[];
  }
  
  export interface Fingerprint {
    type: string;
    value: string;
  }
  
  export interface ShareTarget {
    action?: string;
    method?: string;
    enctype?: string;
    params?: ShareTargetParams;
  }
  
  export interface ShareTargetParams {
    title?: string;
    text?: string;
    url?: string;
    files?: FilesParams[];
  }
  
  export interface FilesParams {
    name: string;
    accept: string[];
  }

  export interface singleFieldValidation {
    valid: Boolean;
    errors?: string[];
  }

  export interface TokensValidation {
    installable: {
      short_name: PartialValidation,
      name: PartialValidation,
      description: PartialValidation,
      display: PartialValidation,
      icons: PartialValidation,
    }
    additional: {
      id: PartialValidation,
      launch_handler: PartialValidation,
      orientation: PartialValidation,
      background_color: PartialValidation,
      theme_color: PartialValidation,
      screenshots: PartialValidation,
      categories: PartialValidation
    },
    progressive: {
      share_target: PartialValidation,
      protocol_handlers: PartialValidation,
      file_handlers: PartialValidation,
      shortcuts: PartialValidation,
      display_override: PartialValidation,
      edge_side_panel: PartialValidation,
      scope_extensions: PartialValidation,
      widgets: PartialValidation
    }
  }