<template>
  <main id="main">
    <HubHeader></HubHeader>

    <div
      v-if="openAndroid || openWindows || openTeams || showBackground"
      class="has-acrylic-40 is-dark"
      id="modalBackground"
    ></div>

    <!-- Toast notification for package download errors -->
    <div
      class="packageError"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-if="packageErrorMessage"
    >
      <div class="errorHeader">
        <strong class="errorTitle">
          <i class="fa fa-exclamation-circle text-danger"></i>
          Error creating package
        </strong>
        <button
          type="button"
          class="closeBtn"
          aria-label="Close"
          @click="packageErrorMessage = null"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="errorBody">
        <pre>{{packageErrorMessage}}</pre>
      </div>
      <div class="errorFooter">
        <a target="_blank" rel="noopener" :href="reportPackageErrorUrl">
          <i class="fa fa-bug"></i>
          Report a problem
        </a>
      </div>
    </div>    

    <Modal
      :title="$t('publish.package_name')"
      :button_name="$t('modal.done')"
      ref="androidPWAModal"
      @modalSubmit="androidOptionsModalSubmitted"
      @cancel="androidOptionsModalCancelled"
      v-on:modalOpened="modalOpened()"
      v-on:modalClosed="androidModalClosed()"
      v-if="androidForm"
    >
      <div id="topLabelBox" slot="extraP">
        <label id="topLabel">{{ $t("publish.package_name_detail") }}</label>
        <ul class="l-generator-error" v-if="androidPWAErrors.length">
          <li v-for="error in androidPWAErrors" v-bind:key="error">
            <i class="fas fa-exclamation-circle"></i>
            &nbsp;
            <span>{{ $t(error) }}</span>
          </li>
        </ul>
      </div>

      <section class="androidModalBody androidOptionsModalBody">
        <form style="width: 100%">
          <div class="row">
            <div class="col-lg-6 col-md-12">
              <div class="form-group">
                <label for="packageIdInput">
                  {{ $t("publish.label_package_name") }}
                  <i
                    class="fas fa-info-circle"
                    title="The unique identifier of your app. It should contain only letters, numbers, and periods. Example: com.companyname.appname"
                    aria-label="The unique identifier of your app. It should contain only letters, numbers, and periods. Example: com.companyname.appname"
                    role="definition"
                  ></i>
                </label>
                <input
                  id="packageIdInput"
                  class="form-control"
                  :placeholder="$t('publish.placeholder_package_name')"
                  type="text"
                  required
                  v-model="androidForm.packageId"
                />
              </div>

              <div class="row">
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="appNameInput">App name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="appNameInput"
                      placeholder="My Awesome PWA"
                      required
                      v-model="androidForm.name"
                    />
                  </div>
                </div>

                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="appLauncherNameInput">
                      Launcher name
                      <i
                        class="fas fa-info-circle"
                        title="The app name used on the Android launch screen. Typically, this is the short name of the app."
                        aria-label="The app name used on the Android launch screen. Typically, this is the short name of the app."
                        role="definition"
                      ></i>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="appLauncherNameInput"
                      placeholder="Awesome PWA"
                      required
                      v-model="androidForm.launcherName"
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="appVersionInput">
                      App version
                      <i
                        class="fas fa-info-circle"
                        title="The version of your app displayed to users. This is a string, typically in the form of '1.0.0.0'. Maps to android:versionName."
                        aria-label
                        role="definition"
                      ></i>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="appVersionInput"
                      placeholder="1.0.0.0"
                      required
                      v-model="androidForm.appVersion"
                    />
                  </div>
                </div>

                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="appVersionCodeInput">
                      <a
                        href="https://developer.android.com/studio/publish/versioning#appversioning"
                        target="_blank"
                        rel="noopener"
                      >App version code</a>
                      <i
                        class="fas fa-info-circle"
                        title="A positive integer used as an internal version number. This is not shown to users. Android uses this value to protect against downgrades. Maps to android:versionCode."
                        aria-label="A positive integer used as an internal version number. This is not shown to users. Android uses this value to protect against downgrades. Maps to android:versionCode."
                        role="definition"
                        style="margin-left: 5px;"
                      ></i>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="2100000000"
                      class="form-control"
                      id="appVersionCodeInput"
                      placeholder="1"
                      required
                      v-model="androidForm.appVersionCode"
                    />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="hostInput">Host</label>
                <input
                  type="url"
                  class="form-control"
                  id="hostInput"
                  placeholder="https://mysite.com"
                  required
                  v-model="androidForm.host"
                />
              </div>

              <div class="form-group">
                <label for="startUrlInput">
                  Start URL
                  <i
                    class="fas fa-info-circle"
                    title="The start path for the TWA. Must be relative to the Host URL. You can specify '/' if you don't have a start URL different from Host."
                    aria-label="The start path for the TWA. Must be relative to the Host URL."
                    role="definition"
                  ></i>
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="startUrlInput"
                  placeholder="/index.html"
                  required
                  v-model="androidForm.startUrl"
                />
              </div>

              <div class="form-group">
                <label for="manifestUrlInput">Manifest URL</label>
                <input
                  type="url"
                  class="form-control"
                  id="manifestUrlInput"
                  placeholder="https://mysite.com/manifest.json"
                  required
                  v-model="androidForm.webManifestUrl"
                />
              </div>
              <div class="row">
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="themeColorInput">
                      Status bar color
                      <i
                        class="fas fa-info-circle"
                        title="Also known as the theme color, this is the color of the Android status bar in your app. Note: the status bar will be hidden if Display Mode is set to fullscreen."
                        aria-label="Also known as the theme color, this is the color of the Android status bar in your app. Note: the status bar will be hidden if Display Mode is set to fullscreen."
                        role="definition"
                      ></i>
                    </label>
                    <input
                      type="color"
                      class="form-control"
                      id="themeColorInput"
                      v-model="androidForm.themeColor"
                    />
                  </div>
                </div>

                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="bgColorInput">
                      Splash color
                      <i
                        class="fas fa-info-circle"
                        title="Also known as background color, this is the color of the splash screen for your app."
                        aria-label="Also known as background color, this is the color of the splash screen for your app."
                        role="definition"
                      ></i>
                    </label>
                    <input
                      type="color"
                      class="form-control"
                      id="bgColorInput"
                      v-model="androidForm.backgroundColor"
                    />
                  </div>
                </div>
              </div>

              <!-- second row of colors -->
              <div class="row">

                <!-- Nav bar color -->
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="navigationColorInput">
                      Nav color
                      <i
                        class="fas fa-info-circle"
                        title="The color of the Android navigation bar in your app. Note: the navigation bar will be hidden if Display Mode is set to fullscreen."
                        aria-label="The color of the Android navigation bar in your app. Note: the navigation bar will be hidden if Display Mode is set to fullscreen."
                        role="definition"
                      ></i>
                    </label>
                    <input
                      type="color"
                      class="form-control"
                      id="navigationColorInput"
                      v-model="androidForm.navigationColor"
                    />
                  </div>
                </div>

                <!-- Nav bar dark color -->
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="navigationColorDarkInput">
                      Nav dark color
                      <i
                        class="fas fa-info-circle"
                        title="The color of the Android navigation bar in your app when Android is in dark mode."
                        aria-label="The color of the Android navigation bar in your app when Android is in dark mode."
                        role="definition"
                      ></i>
                    </label>
                    <input
                      type="color"
                      class="form-control"
                      id="navigationColorDarkInput"
                      v-model="androidForm.navigationColorDark"
                    />
                  </div>
                </div>
              </div>

              <!-- third row of colors -->
              <div class="row">

                <!-- Nav bar divider color -->
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="navigationDividerColorInput">
                      Nav divider color
                      <i
                        class="fas fa-info-circle"
                        title="The color of the Android navigation bar divider in your app."
                        aria-label="The color of the Android navigation bar divider in your app."
                        role="definition"
                      ></i>
                    </label>
                    <input
                      type="color"
                      class="form-control"
                      id="navigationDividerColorInput"
                      v-model="androidForm.navigationDividerColor"
                    />
                  </div>
                </div>

                <!-- Nav bar divider dark color -->
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="navigationDividerColorDarkInput">
                      Nav divider dark color
                      <i
                        class="fas fa-info-circle"
                        title="The color of the Android navigation navigation bar divider in your app when Android is in dark mode."
                        aria-label="The color of the Android navigation bar divider in your app when Android is in dark mode."
                        role="definition"
                      ></i>
                    </label>
                    <input
                      type="color"
                      class="form-control"
                      id="navigationDividerColorDarkInput"
                      v-model="androidForm.navigationDividerColorDark"
                    />
                  </div>
                </div>
              </div>

            </div>

            <!-- right half of the options dialog -->
            <div class="col-lg-6 col-md-12">
              <div class="form-group">
                <label for="iconUrlInput">Icon URL</label>
                <input
                  type="url"
                  class="form-control"
                  id="iconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512.png"
                  v-model="androidForm.iconUrl"
                />
              </div>

              <div class="form-group">
                <label for="maskIconUrlInput">
                  <a
                    href="https://web.dev/maskable-icon"
                    title="Read more about maskable icons"
                    target="_blank"
                    rel="noopener"
                    aria-label="Read more about maskable icons"
                  >Maskable icon</a> URL
                  <i
                    class="fas fa-info-circle"
                    title="Optional. The URL to an icon with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android platforms."
                    aria-label="Optional. The URL to an icon with a minimum safe zone of trimmable padding, enabling rounded icons on certain Android platforms."
                    role="definition"
                  ></i>
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="maskIconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512-maskable.png"
                  v-model="androidForm.maskableIconUrl"
                />
              </div>

              <div class="form-group">
                <label for="monochromeIconUrlInput">
                  <a
                    href="https://w3c.github.io/manifest/#monochrome-icons-and-solid-fills"
                    target="_blank"
                    rel="noopener"
                  >Monochrome icon</a> URL
                  <i
                    class="fas fa-info-circle"
                    title="Optional. The URL to an icon containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or contrast settings."
                    aria-label="Optional. The URL to an icon containing only white and black colors, enabling Android to fill the icon with user-specified color or gradient depending on theme, color mode, or contrast settings."
                    role="definition"
                  ></i>
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="monochromeIconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512-monochrome.png"
                  v-model="androidForm.monochromeIconUrl"
                />
              </div>

              <div class="form-group">
                <label for="splashFadeoutInput">Splash screen fade out duration (ms)</label>
                <input
                  type="number"
                  class="form-control"
                  id="splashFadeoutInput"
                  placeholder="300"
                  v-model="androidForm.splashScreenFadeOutDuration"
                />
              </div>

              <div class="form-group">
                <label>Fallback behavior</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="fallbackType"
                    id="fallbackCustomTabsInput"
                    value="customtabs"
                    v-model="androidForm.fallbackType"
                  />
                  <label class="form-check-label" for="fallbackCustomTabsInput">
                    Custom Tabs
                    <i
                      class="fas fa-info-circle"
                      title="Use Chrome Custom Tabs as a fallback for your PWA when the full trusted web activity (TWA) experience is unavailable."
                      aria-label="When trusted web activity (TWA) is unavailable, use Chrome Custom Tabs as a fallback for your PWA."
                      role="definition"
                    ></i>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="fallbackType"
                    id="fallbackWebViewInput"
                    value="webview"
                    v-model="androidForm.fallbackType"
                  />
                  <label class="form-check-label" for="fallbackWebViewInput">
                    Web View
                    <i
                      class="fas fa-info-circle"
                      title="Use a web view as the fallback for your PWA when the full trusted web activity (TWA) experience is unavailable."
                      aria-label="When trusted web activity (TWA) is unavailable, use a web view as the fallback for your PWA."
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Display mode</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="displayMode"
                    id="standaloneDisplayModeInput"
                    value="standalone"
                    v-model="androidForm.display"
                  />
                  <label class="form-check-label" for="standaloneDisplayModeInput">
                    Standalone
                    <i
                      class="fas fa-info-circle"
                      title="Your PWA will use the whole screen but keep the Android status bar and navigation bar."
                      aria-label="Your PWA will use the whole screen but keep the Android status bar and navigation bar."
                      role="definition"
                    ></i>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="displayMode"
                    id="fullscreenDisplayModeInput"
                    value="fullscreen"
                    v-model="androidForm.display"
                  />
                  <label class="form-check-label" for="fullscreenDisplayModeInput">
                    Fullscreen
                    <i
                      class="fas fa-info-circle"
                      title="Your PWA will use the whole screen and remove the Android status bar and navigation bar. Suitable for immersive experiences such as games or media apps."
                      aria-label="Your PWA will use the whole screen and remove the Android status bar and navigation bar. Suitable for immersive experiences such as games or media apps."
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Notification delegation</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="enableNotificationsInput"
                    v-model="androidForm.enableNotifications"
                  />
                  <label class="form-check-label" for="enableNotificationsInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="Whether to enable Push Notification Delegation. If enabled, your PWA can send push notifications without browser permission prompts."
                      aria-label="Whether to enable Push Notification Delegation. If enabled, your PWA can send push notifications without browser permission prompts."
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Location delegation</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="enableLocationInput"
                    v-model="androidForm.features.locationDelegation.enabled"
                  />
                  <label class="form-check-label" for="enableLocationInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="Whether to enable Location Delegation. If enabled, your PWA can acess navigator.geolocation without browser permission prompts."
                      aria-label="Whether to enable Location Delegation. If enabled, your PWA can acess navigator.geolocation without browser permission prompts."
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Google Play billing</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="enablePlayBillingInput"
                    v-model="androidForm.features.playBilling.enabled"
                  />
                  <label class="form-check-label" for="enablePlayBillingInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="Whether to enable in-app purchases through Google Play Billing and the Digital Goods API."
                      aria-label="Whether to enable in-app purchases through Google Play Billing and the Digital Goods API."
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Settings shortcut</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="enableSettingsShortcutInput"
                    v-model="androidForm.enableSiteSettingsShortcut"
                  />
                  <label class="form-check-label" for="enableSettingsShortcutInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app."
                      aria-label="If enabled, users can long-press on your app tile and a Settings menu item will appear, letting users manage space for your app."
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>ChromeOS only</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="chromeOSOnlyInput"
                    v-model="androidForm.isChromeOSOnly"
                  />
                  <label class="form-check-label" for="chromeOSOnlyInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="If enabled, your Android package will only run on ChromeOS devices"
                      aria-label="If enabled, your Android package will only run on ChromeOS devices"
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Include source code</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="includeSourceCodeInput"
                    v-model="androidForm.includeSourceCode"
                  />
                  <label class="form-check-label" for="includeSourceCodeInput">
                    Enable
                    <i
                      class="fas fa-info-circle"
                      title="If enabled, your download will include the source code for your Android app."
                      aria-label="If enabled, your download will include the source code for your Android app."
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Signing key</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="signingInput"
                    id="generateSigningKeyInput"
                    value="new"
                    v-model="androidForm.signingMode"
                    @change="androidSigningModeChanged"
                  />
                  <label class="form-check-label" for="generateSigningKeyInput">
                    Create new
                    <i
                      class="fas fa-info-circle"
                      title="PWABuilder will generate a new signing key for you and sign your APK with it. Your download will contain the new signing key and passwords."
                      aria-label="PWABuilder will generate a new signing key for you and sign your APK with it. Your download will contain the new signing key and passwords."
                      role="definition"
                    ></i>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="signingInput"
                    id="unsignedInput"
                    value="none"
                    v-model="androidForm.signingMode"
                    @change="androidSigningModeChanged"
                  />
                  <label class="form-check-label" for="unsignedInput">
                    None
                    <i
                      class="fas fa-info-circle"
                      title="PWABuilder will generate an unsigned APK. Google Play Store will sign your package. This is Google's recommended approach."
                      aria-label="PWABuilder will generate an unsigned APK. Google Play Store will sign your package. This is Google's recommended approach."
                      role="definition"
                    ></i>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="signingInput"
                    id="useMySigningInput"
                    value="mine"
                    v-model="androidForm.signingMode"
                    @change="androidSigningModeChanged"
                  />
                  <label class="form-check-label" for="useMySigningInput">
                    Use mine
                    <i
                      class="fas fa-info-circle"
                      title="Upload your existing signing key. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play."
                      aria-label="Upload your existing signing key. Use this option if you already have a signing key and you want to publish a new version of an existing app in Google Play."
                      role="definition"
                    ></i>
                  </label>
                </div>
              </div>

              <div
                v-if="androidForm.signingMode === 'mine' || androidForm.signingMode === 'new'"
                style="margin-left: 15px;"
              >
                <div class="form-group" v-if="androidForm.signingMode === 'mine'">
                  <label for="signingKeyInput">Key file</label>
                  <input
                    type="file"
                    class="form-control"
                    id="signingKeyInput"
                    @change="androidSigningKeyUploaded"
                    accept=".keystore"
                    required
                    style="border: none;"
                  />
                </div>

                <div class="form-group">
                  <label for="signingKeyAliasInput">Key alias</label>
                  <input
                    type="text"
                    class="form-control"
                    id="signingKeyAliasInput"
                    placeholder="my-key-alias"
                    required
                    v-model="androidForm.signing.alias"
                  />
                </div>

                <div class="form-group" v-if="androidForm.signingMode === 'new'">
                  <label for="signingKeyFullNameInput">Key full name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="signingKeyFullNameInput"
                    required
                    placeholder="John Doe"
                    v-model="androidForm.signing.fullName"
                  />
                </div>

                <div class="form-group" v-if="androidForm.signingMode === 'new'">
                  <label for="signingKeyOrgInput">Key organization</label>
                  <input
                    type="text"
                    class="form-control"
                    id="signingKeyOrgInput"
                    required
                    placeholder="My Company"
                    v-model="androidForm.signing.organization"
                  />
                </div>

                <div class="form-group" v-if="androidForm.signingMode === 'new'">
                  <label for="signingKeyOrgUnitInput">Key organizational unit</label>
                  <input
                    type="text"
                    class="form-control"
                    id="signingKeyOrgUnitInput"
                    required
                    placeholder="Engineering Department"
                    v-model="androidForm.signing.organizationalUnit"
                  />
                </div>

                <div class="form-group" v-if="androidForm.signingMode === 'new'">
                  <label for="signingKeyCountryCodeInput">
                    Key country code
                    <i
                      class="fas fa-info-circle"
                      title="The 2 letter country code to list on the signing key"
                      aria-label="The 2 letter country code to list on the signing key"
                      role="definition"
                    ></i>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="signingKeyCountryCodeInput"
                    required
                    placeholder="US"
                    v-model="androidForm.signing.countryCode"
                  />
                </div>

                <div class="form-group">
                  <label for="signingKeyPasswordInput">
                    Key password
                    <i
                        class="fas fa-info-circle"
                        title="The password for the signing key. Type a new password or leave empty to use a generated password."
                        aria-label="The password for the signing key. Type a new password or leave empty to use a generated password."
                        role="definition"
                      ></i>
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    id="signingKeyPasswordInput"
                    v-model="androidForm.signing.keyPassword"
                    :placeholder="androidPasswordPlaceholder"
                  />
                </div>

                <div class="form-group">
                  <label for="signingKeyStorePasswordInput">
                    Key store password
                    <i
                        class="fas fa-info-circle"
                        title="The password for the key store. Type a new password or leave empty to use a generated password."
                        aria-label="The password for the key store. Type a new password or leave empty to use a generated password."
                        role="definition"
                      ></i>
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    id="signingKeyStorePasswordInput"
                    v-model="androidForm.signing.storePassword"
                    :placeholder="androidPasswordPlaceholder"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </Modal>

    <!-- New Edge Modal -->

    <Modal
      title="Windows Package Options"
      :button_name="$t('modal.done')"
      ref="windowsPWAModal"
      :showSubmitButton="true"
      @modalSubmit="windowsOptionsModalSubmitted"
      @cancel="windowsOptionsModalCancelled"
      v-on:modalOpened="modalOpened()"
      v-on:modalClosed="windowsModalClosed()"
      v-if="windowsForm"
    >
      <div id="topLabelBox" slot="extraP">
        <label id="topLabel">Customize your Windows package below</label>
        <ul class="l-generator-error" v-if="windowsOptionsErrors.length">
          <li v-for="error in windowsOptionsErrors" v-bind:key="error">
            <i class="fas fa-exclamation-circle"></i>
            &nbsp;
            <span>{{ $t(error) }}</span>
          </li>
        </ul>
      </div>

      <section class="androidModalBody androidOptionsModalBody">
        <form style="width: 100%">
          <div class="row">
            <div class="col-lg-6 col-md-12">
              <div class="form-group">
                <label for="windowsPackageIdInput">
                  <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md">
                    {{ $t("publish.label_package_name") }}
                    <i
                      class="fas fa-info-circle"
                      title="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center. Click to learn more."
                      aria-label="The Microsoft Store's unique identifier for your app. You can find this value in Windows Partner Center. Click to learn more."
                      role="definition"
                    ></i>
                  </a>
                </label>
                <input
                  id="windowsPackageIdInput"
                  class="form-control"
                  :placeholder="$t('publish.placeholder_package_name')"
                  type="text"
                  required
                  v-model="windowsForm.packageId"
                />
              </div>

              <div class="row">
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="windowsAppNameInput">App name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="windowsAppNameInput"
                      placeholder="My Awesome PWA"
                      required
                      v-model="windowsForm.name"
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="windowsAppVersionInput">
                      <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md">
                        App version
                        <i
                          class="fas fa-info-circle"
                          title="Your app version in the form of '1.0.0'. This must be greater than classic package version. Click to learn more."
                          aria-label="Your app version in the form of '1.0.0'. This must be greater than classic package version. Click to learn more."
                          role="definition"
                        ></i>
                      </a>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="windowsAppVersionInput"
                      placeholder="1.0.1"
                      required
                      v-model="windowsForm.version"
                    />
                  </div>
                </div>

              </div>

              <div class="row" v-if="windowsFormConfiguration === 'anaheim'">
                <div class="col-lg-6 col-md-12">
                  <div class="form-group">
                    <label for="windowsClassicAppVersionInput">
                      <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/classic-package.md">
                        Classic package version
                        <i
                          class="fas fa-info-circle"
                          title="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version. Click to learn more."
                          aria-label="The version of your app that runs on older versions of Windows. Must be in the form of '1.0.0'. Must be less than app version. Click to learn more."
                          role="definition"
                        ></i>
                      </a>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="windowsClassicAppVersionInput"
                      placeholder="1.0.0"
                      required
                      v-model="windowsForm.classicPackage.version"
                    />
                  </div>
                </div>

              </div>

              <div class="form-group">
                <label for="windowsStartUrlInput">
                  URL
                  <i
                    class="fas fa-info-circle"
                    title="This is the URL for your PWA."
                    aria-label="This is the URL for your PWA."
                    role="definition"
                  ></i>
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="windowsStartUrlInput"
                  placeholder="/index.html"
                  required
                  v-model="windowsForm.url"
                />
              </div>

              <div class="form-group">
                <label for="windowsManifestUrlInput">
                  Manifest URL
                  <i
                    class="fas fa-info-circle"
                    title="The URL to your app manifest."
                    aria-label="The URL to your app manifest."
                    role="definition"
                  ></i>
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="windowsManifestUrlInput"
                  placeholder="https://mysite.com/manifest.json"
                  required
                  v-model="windowsForm.manifestUrl"
                />
              </div>

            </div>

            <!-- right half of the options dialog -->
            <div class="col-lg-6 col-md-12">
              <div class="form-group">
                <label for="windowsIconUrlInput">
                  <a href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/image-recommendations.md" target="_blank">
                    Icon URL
                    <i
                      class="fas fa-info-circle"
                      title="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger. Click to learn more."
                      aria-label="A large, square, PNG image from which PWABuilder will generate all required Windows app icons. Should be 512x512 or larger. Click to learn more."
                      role="definition"
                    ></i>
                  </a>
                </label>
                <input
                  type="url"
                  class="form-control"
                  id="windowsIconUrlInput"
                  placeholder="https://myawesomepwa.com/512x512.png"
                  v-model="windowsForm.images.baseImage"
                />
              </div>

              <div class="form-group">
                  <label for="windowsDisplayNameInput">
                    <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md">
                      Publisher display name
                      <i
                        class="fas fa-info-circle"
                        title="The display name of your app's publisher. You can find this in Windows Partner Center. Click to learn more."
                        aria-label="The display name of your app's publisher. You can find this in Windows Partner Center. Click to learn more."
                        role="definition"
                      ></i>
                    </a>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    for="windowsDisplayNameInput"
                    required
                    placeholder="US"
                    v-model="windowsForm.publisher.displayName"
                  />
                </div>

                <div class="form-group">
                  <label for="windowsPublisherIdInput">
                    <a target="_blank" href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/find-publisher.md">
                      Publisher ID
                      <i
                        class="fas fa-info-circle"
                        title="Your Windows Publisher ID. You can find this value in Windows Partner Center. Click to learn more."
                        aria-label="Your Windows Publisher ID. You can find this value in Windows Partner Center. Click to learn more."
                        role="definition"
                      ></i>
                    </a>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="windowsPublisherIdInput"
                    required
                    placeholder="CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca"
                    v-model="windowsForm.publisher.commonName"
                  />
                </div>
            </div>
          </div>
        </form>
      </section>
    </Modal>

    <div v-if="openAndroid" ref="androidModal" id="androidPlatModal">
      <button @click="closeAndroidModal()" id="closeAndroidPlatButton">
        <i class="fas fa-times"></i>
      </button>

      <section class="androidModalBody">
        <div>
          <p class="androidModalP">
            Download your
            <a
              href="https://developers.google.com/web/updates/2019/08/twas-quickstart"
            >PWA package</a>
            for Google Play
          </p>

          <p>
            Your download will contain
            <a
              href="https://github.com/pwa-builder/CloudAPK/blob/master/Next-steps.md"
            >instructions</a>
            for submitting your app to the Google Play store.
          </p>

          <p v-if="this.androidForm.package_name">
            <span>Package Name:</span>
            {{ $t(this.androidForm.package_name) }}
          </p>
        </div>

        <div id="androidModalButtonSection">
          <Download
            :showMessage="true"
            :androidOptions="this.androidForm"
            id="androidDownloadButton"
            class="androidDownloadButton"
            platform="androidTWA"
            message="Download"
            v-on:apkDownloaded="showInstall($event)"
            v-on:downloadPackageError="showPackageDownloadError($event)"
          />
          <button class="androidDownloadButton" @click="openAndroidOptionModal()">Options</button>
        </div>

        <!-- justin revisit -->
        <!--<div id="androidInstallWrapper" v-if="apkDownloaded">
          <p>Quickly install your APK to your device for testing! All you need to do is plug in your device via a USB cord.</p>

          <div id="androidInstallActions">
            <button class="androidDownloadButton" @click="connectDevice()">Connect to Device</button>
            <button
              :disabled="!connected"
              class="androidInstallButton"
              @click="installAPK()"
            >
            <span v-if="!installing">Install APK</span>

              <div v-if="installing">
                <div id="installSpinner" v-if="!isReady">
                  <div class="flavor">
                    <div class="colorbands"></div>
                  </div>
                  <div class="icon">
                    <div class="lds-dual-ring"></div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>-->

        <div id="extraSection">
          <p>
            Your PWA will be a <a href="https://developers.google.com/web/updates/2019/08/twas-quickstart" target="_blank" rel="noopener">Trusted Web Activity</a>.
            <Download
              :showMessage="true"
              id="legacyDownloadButton"
              class="webviewButton"
              platform="android"
              message="Use a legacy webview instead"
              v-on:downloadPackageError="showPackageDownloadError($event)"
            />
          </p>
        </div>
      </section>
    </div>

    <div v-if="openWindows" ref="windowsModal" id="androidPlatModal">
      <button @click="closeAndroidModal()" id="closeAndroidPlatButton">
        <i class="fas fa-times"></i>
      </button>

      <section class="androidModalBody">
        <div>
          <p class="androidModalP">
            Download your PWA package for Microsoft Store
          </p>
          <p>
            Your download will contain <a href="https://github.com/pwa-builder/pwabuilder-windows-chromium-docs/blob/master/next-steps-edgehtml.md" target="_blank">instructions</a> for submitting your app to the Microsoft Store.
            Your app will be <a href="https://link.medium.com/7lXJkhtaKab" target="_blank" rel="noopener">powered by Chromium-based Edge</a> platform (preview).
          </p>
        </div>

        <div id="androidModalButtonSection" class="edgeBlock">
          <Download
              class="androidDownloadButton"
              platform="windows10new"
              :windowsOptions="this.windowsAnaheimForm"
              :message="'Download'"
              :showMessage="true"
              v-on:downloadPackageError="showPackageDownloadError($event)"
            />
          <button
            class="androidDownloadButton"
            @click="openWindowsOptionsModal('anaheim')">
            Options
          </button>
        </div>

        <div id="extraSection">
          <p>
            Use EdgeHTML (legacy Edge) instead:

            <Download
              id="legacyEdgeBetaDownloadButton"
              class="webviewButton"
              platform="windows10"
              :windowsOptions="this.windowsSpartanForm"
              :message="$t('publish.download')"
              :showMessage="true"
              v-on:downloadPackageError="showPackageDownloadError($event)" />

            <button class="legacyEdgeBetaOptionsButton" @click="openWindowsOptionsModal('spartan')">Options</button>
          </p>
        </div>
      </section>
    </div>

    <div v-if="openTeams" ref="teamsModal" id="teamsModal" class="platModal">
      <button @click="closeTeamsModal()" class="closeModalPlatButton">
        <i class="fas fa-times"></i>
      </button>
      <section class="platModalBody platModalForm">
        <div class="platModalField">
          <label for="package-name">
            <h4>Publisher Name</h4>
          </label>
          <input
            type="text"
            name="package-name"
            placeholder="Publisher Name"
            v-model="teamsForm.publisherName"
            @change="validateTeamsForm()"
          />
        </div>
        <div class="platModalField">
          <label for="short-description">
            <h4>Short app description</h4>
            <p>Describe your app in 80 characters or less</p>
          </label>
          <textarea
            name="short-description"
            class="short"
            :class="{
              error:
                teamsForm.shortDescription !== null &&
                teamsForm.shortDescription.length > 80,
            }"
            v-model="teamsForm.shortDescription"
            @change="validateTeamsForm()"
          ></textarea>
        </div>
        <div class="platModalField">
          <label for="long-description">
            <h4>Long app description</h4>
            <p>Describe your app in 4000 characters or less</p>
          </label>
          <textarea
            name="long-description"
            :class="{
              error:
                teamsForm.longDescription !== null &&
                teamsForm.longDescription.length > 4000,
            }"
            v-model="teamsForm.longDescription"
            @change="validateTeamsForm()"
          ></textarea>
        </div>
        <div class="platModalField">
          <label for="privacy">
            <h4>Privacy URL</h4>
          </label>
          <input
            name="privacy"
            type="text"
            placeholder="www.somewebsite/privacy"
            v-model="teamsForm.privacyUrl"
            @change="validateTeamsForm()"
          />
        </div>
        <div class="platModalField">
          <label for="terms">
            <h4>Terms of Use URL</h4>
          </label>
          <input
            names="terms"
            type="text"
            placeholder="www.somewebsite/termsofuse"
            v-model="teamsForm.termsOfUseUrl"
            @change="validateTeamsForm()"
          />
        </div>

        <div class="platModalField file-chooser">
          <label for="upload-image-color">
            <h4>App Image</h4>
            <p>
              The image needs to be 192x192, a solid background color,
              preferably the same as your w3c manifest background color.
            </p>
          </label>
          <button
            id="uploadIconImage-color"
            name="upload-image-color"
            @click="clickUploadColorFileInput()"
          >Choose File</button>
          <input
            id="upload-file-input-color"
            name="upload-image-color"
            type="file"
            accept="image/jpeg image/png image/svg+xml"
            @change="handleUploadColorIcon()"
          />
          <Loading
            :active="true"
            class="image-upload-loader"
            v-show="this.uploadColorLoaderActive"
          />
          <p class="file-description" v-show="!this.uploadColorLoaderActive">
            {{
            this.teamsForm.colorImageFile
            ? this.teamsForm.colorImageFile.name
            : "No file chosen"
            }}
          </p>
        </div>

        <div class="platModalField file-chooser">
          <label for="upload-image-outline">
            <h4>Teams Silhouette (optional)</h4>
            <p>
              This image needs to be 32x32, the background transparent, and the
              silhouette of your app icon in white.
            </p>
          </label>
          <button
            id="uploadIconImage-outline"
            name="upload-image-outline"
            @click="clickUploadOutlineFileInput()"
          >Choose File</button>
          <input
            id="upload-file-input-outline"
            name="upload-image-outline"
            type="file"
            accept="image/jpeg image/png image/svg+xml"
            @change="handleUploadOutlineIcon()"
          />
          <Loading
            :active="true"
            class="image-upload-loader"
            v-show="this.uploadOutlineLoaderActive"
          />
          <p class="file-description" v-show="!this.uploadOutlineLoaderActive">
            {{
            this.teamsForm.outlineImageFile
            ? this.teamsForm.outlineImageFile.name
            : "No file chosen"
            }}
          </p>
        </div>

        <div class="platModalButtonSection">
          <Download
            class="platModalDownloadButton"
            platform="msteams"
            :packageName="this.teamsForm.publisherName"
            :parameters="[JSON.stringify(this.teamsForm)]"
            :message="$t('publish.download')"
            :showMessage="true"
            v-on:downloadPackageError="showPackageDownloadError($event)"
          />
        </div>
      </section>
    </div>

    <section id="publishSideBySide">
      <section id="publishLeftSide">
        <div id="introContainer">
          <h2>Everything you need to build and publish PWA</h2>

          <p>
            Publish your PWA to app stores to make your app more discoverable to users.
          </p>

          <!--<div id="publishActionsContainer">-->
          <!--<button id="downloadAllButton">Download your PWA files</button>-->
          <!--<Download id="downloadAllButton" platform="web" message="Download your PWA files"/>-->
          <!--</div>-->

          <!--temp impl for demo-->
        </div>
      </section>

      <section id="publishRightSide">
        <div id="platformsListContainer" v-if="manifest">
          <ul>
            <div
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
              id="pwaMainCard"
              class="pwaCard"
            >
              <div class="pwaCardHeaderBlock">
                <div class="pwaCardIconBlock">
                  <img class="pwaIcon" src="~/assets/images/pwaLogo.svg" alt="PWA Logo" />
                  <h2>Progressive Web App</h2>
                </div>
              </div>

              <p>
                If you haven’t already, download these files and publish it to
                your website. Making these changes to your website is all you
                need to become a PWA.
              </p>

              <section class="platformDownloadBar">
                <Download
                  class="platformDownloadButton"
                  platform="web"
                  message="Download your PWA files"
                  aria-label="Download your PWA files"
                  v-on:downloadPackageError="showPackageDownloadError($event)"
                />
              </section>
            </div>

            <div
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
              id="pwaAndroidCard"
              class="pwaCard"
            >
              <div class="pwaCardHeaderBlock">
                <i class="fab fa-android platformIcon" aria-label="Android Icon"></i>
                <h2>Android</h2>
              </div>

              <p>
                Publish your PWA to the Google Play Store to make your app more discoverable for Android users.
              </p>

              <section class="platformDownloadBar">
                <button
                  class="platformDownloadButton"
                  @click="openAndroidModal()"
                  aria-label="Open Android Modal"
                >
                  <i class="fas fa-long-arrow-alt-down" aria-label="Open Android Icon"></i>
                </button>
              </section>
            </div>

            <!--samsung platform-->
            <div
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
              id="pwaSamsungCard"
              class="pwaCard"
            >
              <div class="pwaCardHeaderBlock">
                <svg
                  width="89"
                  height="30"
                  viewBox="0 0 89 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Samsung Icon"
                >
                  <path
                    d="M88.5919 7.15122C87.3559 0.0897582 66.5652 -2.11414 42.1107 2.2037C31.8699 4.04778 22.6001 6.74643 15.3609 9.75992C16.4644 9.8049 17.3031 10.0298 17.7887 10.5695C18.186 10.9743 18.3625 11.514 18.3625 12.1887V12.9083H15.9789V12.2787C15.9789 11.7839 15.6699 11.4241 15.1402 11.4241C14.6988 11.4241 14.3898 11.649 14.3015 12.0538C14.2574 12.1887 14.2574 12.3686 14.3015 12.5485C14.5663 13.628 18.0977 14.2577 18.4949 16.2367C18.5391 16.5065 18.6274 17.0463 18.4949 17.8109C18.2742 19.3851 16.9058 20.0148 15.1402 20.0148C12.7124 20.0148 11.6971 18.8454 11.6971 17.2262V16.4616H14.2574V17.4061C14.2574 17.9458 14.6546 18.2607 15.1402 18.2607C15.6257 18.2607 15.9347 18.0358 16.023 17.631C16.0672 17.4511 16.1113 17.1812 16.023 16.9563C15.5375 15.7419 12.2268 15.1572 11.8296 13.2232C11.7413 12.7734 11.7413 12.4136 11.7854 11.9188C11.8296 11.649 11.9178 11.4241 12.0061 11.2442C4.10478 15.0223 -0.574232 19.2052 0.0437503 22.8484C1.27972 29.9098 22.0704 32.1137 46.4807 27.7509C57.2072 25.8619 66.8742 22.9833 74.2458 19.7899C74.1575 19.7899 74.0251 19.7899 73.9368 19.7899C72.2594 19.7899 70.7586 19.1602 70.6262 17.4061C70.5821 17.0912 70.5821 16.9563 70.5821 16.7764V12.7734C70.5821 12.5935 70.5821 12.2787 70.6262 12.1437C70.8028 10.4796 72.127 9.75992 73.9368 9.75992C75.3494 9.75992 77.0709 10.1647 77.2475 12.1437C77.2916 12.4136 77.2916 12.6385 77.2475 12.7284V13.0883H74.8197V12.5935C74.8197 12.5935 74.8197 12.3686 74.7755 12.2337C74.7314 12.0538 74.5548 11.559 73.8927 11.559C73.2306 11.559 73.054 12.0088 73.0098 12.2337C72.9657 12.3236 72.9657 12.5035 72.9657 12.6835V17.0463C72.9657 17.1812 72.9657 17.3161 72.9657 17.4061C72.9657 17.496 73.0981 18.0808 73.8927 18.0808C74.6872 18.0808 74.8197 17.496 74.8197 17.4061C74.8197 17.2712 74.8638 17.1362 74.8638 17.0463V15.6969H73.8927V14.2577H77.2475V16.8214C77.2475 17.0013 77.2475 17.1362 77.2033 17.4511C77.1592 17.9008 77.0267 18.3056 76.806 18.6205C84.6632 14.8424 89.1657 10.7044 88.5919 7.15122ZM25.2045 19.655L23.9685 11.1542H23.9244L22.6884 19.655H20.084L21.8056 10.0748H26.0432L27.7647 19.655H25.2045ZM37.6083 19.655L37.5641 11.3341H37.52L36.0192 19.655H33.5914L32.0906 11.3341H32.0464L32.0023 19.655H29.5745L29.7952 10.0748H33.6797L34.8274 17.1812H34.8715L36.0192 10.0748H39.9036L40.1243 19.655H37.6083ZM48.9527 17.7659C48.6878 19.61 46.9222 19.9248 45.642 19.9248C43.5674 19.9248 42.2431 19.0253 42.2431 17.1362V16.3716H44.8034V17.3161C44.8034 17.8109 45.1565 18.1257 45.6862 18.1257C46.1717 18.1257 46.4807 17.9458 46.569 17.496C46.6132 17.3161 46.6132 17.0463 46.569 16.8214C46.0835 15.607 42.817 15.0223 42.4197 13.0883C42.3314 12.6385 42.3314 12.2787 42.3756 11.8289C42.6404 10.0748 44.3178 9.71494 45.642 9.71494C46.8339 9.71494 47.7167 9.98481 48.2023 10.5245C48.5995 10.9293 48.7761 11.4691 48.7761 12.1437V12.8184H46.3925V12.1887C46.3925 11.649 46.0835 11.3791 45.5538 11.3791C45.1123 11.3791 44.8034 11.604 44.7151 12.0088C44.7151 12.0987 44.6709 12.2787 44.7151 12.5035C44.9799 13.583 48.5113 14.2127 48.8644 16.1917C48.9968 16.4616 49.041 17.0013 48.9527 17.7659ZM57.7369 16.9113C57.7369 17.0912 57.7369 17.4511 57.6927 17.541C57.5603 19.1152 56.4567 19.9248 54.4262 19.9248C52.3957 19.9248 51.2922 19.1152 51.1156 17.541C51.1156 17.4511 51.0715 17.0912 51.0715 16.9113V10.0298H53.4993V17.0912C53.4993 17.2712 53.4993 17.3611 53.4993 17.4511C53.5434 17.631 53.6758 18.1257 54.3821 18.1257C55.0442 18.1257 55.2208 17.631 55.2649 17.4511C55.2649 17.3611 55.2649 17.2262 55.2649 17.0912V10.0298H57.6927C57.7369 10.0298 57.7369 16.9113 57.7369 16.9113ZM68.1984 19.52H64.7995L62.5483 11.9188H62.5042L62.6366 19.52H60.2971V10.0298H63.8284L65.9472 17.3161H65.9913L65.8589 10.0298H68.2426V19.52H68.1984Z"
                    fill="#3C3C3C"
                  />
                </svg>

                <h2>Samsung</h2>
              </div>

              <p>
                Publish your PWA to the Samsung Galaxy Store to make your app more discoverable to users with Samsung Galaxy Android devices.
              </p>

              <section class="platformDownloadBar">
                <Download
                  class="platformDownloadButton"
                  platform="samsung"
                  message="Download"
                  aria-label="Download Samsung Package"
                  v-on:downloadPackageError="showPackageDownloadError($event)"
                />
              </section>
            </div>

            <div
              id="pwaWindowsCard"
              class="pwaCard"
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
            >
              <div class="pwaCardHeaderBlock" id="windowsCardHeaderBlock">
                <div id="windowsCardHeader">
                  <i class="fab fa-windows platformIcon" aria-label="Windows Icon"></i>
                  <h2>Windows</h2>
                </div>
              </div>

              <p>
                Publish your PWA to the Microsoft Store to make it available to the 1 billion Windows and XBox users worldwide.
              </p>

              <section class="platformDownloadBar">
                <button
                  class="platformDownloadButton"
                  @click="openWindowsModal()"
                  aria-label="Open Windows Modal"
                >
                  <i class="fas fa-long-arrow-alt-down" aria-label="Open Windows Icon"></i>
                </button>
              </section>
            </div>

            <div
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
              id="pwaMacosCard"
              class="pwaCard"
            >
              <div class="pwaCardHeaderBlock">
                <i class="fab fa-apple platformIcon" aria-label="Apple Icon"></i>
                <h2>MacOS</h2>
              </div>

              <p>
                Publish your app to the MacOS Store to make your PWA available to MacOS users. Your download will contain an Xcode project which you can build and submit to the MacOS Store.
              </p>

              <section class="platformDownloadBar">
                <Download
                  class="platformDownloadButton"
                  platform="macos"
                  message="Download"
                  aria-label="Download"
                  v-on:downloadPackageError="showPackageDownloadError($event)"
                />
              </section>
            </div>
          </ul>
        </div>
        <div id="skeletonSpan" v-if="!manifest">
          <ul>
            <li>
              <span class="skeletonSpan"></span>
            </li>
            <li>
              <span class="skeletonSpan"></span>
            </li>
            <li>
              <span class="skeletonSpan"></span>
            </li>
            <li>
              <span class="skeletonSpan"></span>
            </li>
          </ul>
        </div>
      </section>
    </section>

    <section id="bottomSection">
      <div id="coolPWAs">
        <h2>Scope out rad PWAs</h2>

        <p>
          Pinterest, Spotify, and more built some PWAs and they are like whoa!
          Check them out by clicking on the image or logos. Love doing PWAs?
          Submit your own!
        </p>

        <div id="iconGrid">
          <div>
            <i class="fab fa-pinterest platformIcon"></i>
          </div>
          <div>
            <i class="fab fa-spotify platformIcon"></i>
          </div>
          <div>
            <i class="fab fa-microsoft platformIcon"></i>
          </div>
        </div>
      </div>

      <div id="bottomImageSection">
        <span>I will hold things</span>
      </div>
    </section>

    <footer>
      <p>
        PWA Builder was founded by Microsoft as a community guided, open source project to help move PWA adoption forward.
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement"
        >Our Privacy Statement</a>

        <a href="https://raw.githubusercontent.com/pwa-builder/PWABuilder/master/TERMS_OF_USE.txt">Terms of Use</a>
      </p>
    </footer>
  </main>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";
import GeneratorMenu from "~/components/GeneratorMenu.vue";
import StartOver from "~/components/StartOver.vue";
import Download from "~/components/Download.vue";
import Loading from "~/components/Loading.vue";
import Modal from "~/components/Modal.vue";
import PublishCard from "~/components/PublishCard.vue";
import Toolbar from "~/components/Toolbar.vue";
import HubHeader from "~/components/HubHeader.vue";
import * as publish from "~/store/modules/publish";
import { findSuitableIcon } from "~/utils/icon-utils";
import {
  name as generatorName,
  Icon,
  Manifest,
} from "~/store/modules/generator";
import {
  validateAndroidOptions,
  generatePackageId,
} from "~/utils/android-utils";

import { validateWindowsOptions, generateWindowsPackageId } from "~/utils/windows-utils";

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);
const GeneratorState = namespace(generatorName, State);
const GeneratorAction = namespace(generatorName, Action);

@Component({
  components: {
    GeneratorMenu,
    Loading,
    Download,
    StartOver,
    Modal,
    PublishCard,
    Toolbar,
    HubHeader,
  },
})
export default class extends Vue {
  public appxForm: publish.AppxParams = {
    publisher: null,
    publisher_id: null,
    package: null,
    version: null,
  };

  // Set default web checked items
  public files: any[] = [
    "manifest",
    "serviceWorkers",
    "apiSamples",
    "windows10Package",
  ];

  @GeneratorState manifest: Manifest;
  @GeneratorState manifestUrl: string;
  @GeneratorState icons: Icon[];
  @GeneratorAction uploadIcon;
  @GeneratorAction generateMissingImages;
  @GeneratorAction updateManifest;
  @GeneratorAction updateLinkFromStorage;
  @GeneratorAction getManifestInformation;

  @PublishState appXLink: string;
  @PublishState downloadDisabled: boolean;

  @PublishAction updateStatus;
  @PublishAction disableDownloadButton;
  @PublishAction enableDownloadButton;

  public appxError: string | null = null;
  public androidPWAErrors: string[] = [];
  public apkDownloaded: boolean = false;
  public modalStatus = false;
  public openAndroid: boolean = false;
  public openWindows: boolean = false;
  public openTeams: boolean = false;
  public showBackground: boolean = false;

  public samsungDevice: boolean = false;
  public androidDevice: boolean = false;
  public iphoneDevice: boolean = false;
  public pcDevice: boolean = true;
  public macDevice: boolean = false;
  public teamsDevice: boolean = false;

  public uploadColorLoaderActive: boolean = false;
  public uploadOutlineLoaderActive: boolean = false;
  public androidForm: publish.AndroidApkOptions | null = null;
  public androidFormCopyForCancellation: publish.AndroidApkOptions | null = null;
  public teamsForm: publish.TeamsParams | null = null;

  public windowsForm: publish.WindowsPackageOptions | null = null;
  public windowsFormCopyForCancellation: publish.WindowsPackageOptions | null = null;
  private windowsAnaheimForm: publish.WindowsPackageOptions | null = null;
  private windowsSpartanForm: publish.WindowsPackageOptions | null = null;
  public windowsOptionsErrors: string[] = [];
  public windowsOptionsApplied: boolean = false;

  private readonly maxKeyFileSizeInBytes = 2097152; // 2MB. Typically, Android keystore files are ~3KB.

  private webadb: any;
  private connected: boolean = false;
  private apk: Blob;
  private packageErrorMessage: string | null = null;
  private reportPackageErrorUrl: string | null;
  installing: boolean = false;

  public created(): void {
    this.updateStatus();
    this.androidForm = this.createAndroidPackageOptionsFromManifest();
    this.windowsAnaheimForm = this.createWindowsPackageOptionsFromManifest("anaheim");
    this.windowsSpartanForm = this.createWindowsPackageOptionsFromManifest("spartan");
    this.windowsForm = this.windowsSpartanForm;
  }

  showInstall(event) {
    if ((navigator as any).usb) {
      this.apkDownloaded = true;
      this.apk = event.detail;
    }
  }

  showPackageDownloadError(e: any) {
    this.packageErrorMessage = e.detail;
    this.reportPackageErrorUrl = this.getReportErrorUrl(e.detail, e.platform);
    console.error(this.packageErrorMessage, this.reportPackageErrorUrl);
  }

  getReportErrorUrl(errorMessage: string, platform: string): string {
    if (!errorMessage) {
      return "https://github.com/pwa-builder/pwabuilder/issues/new";
    }

    const quotedError = ">" + errorMessage.split("\n").join("\n>"); // Append the Github markdown for quotes to each line.
    const title = encodeURIComponent(`Error generating ${platform} package`);
    const message = encodeURIComponent(
      `I received the following error when generating a package for ${
        this.manifest.url || "my app"
      }\n\n${quotedError}`
    );
    return `https://github.com/pwa-builder/pwabuilder/issues/new?title=${title}&body=${message}`;
  }

  async connectDevice() {
    try {
      let webusb = await (window as any).Adb.open("WebUSB");
      let adb = await webusb.connectAdb("host::");

      this.webadb = adb;

      console.log(this.webadb);

      this.connected = true;
      console.log(this.connected);
    } catch (err) {
      console.error(err);

      this.androidPWAErrors = [err];
    }
  }

  async installAPK() {
    if (this.webadb) {
      try {
        this.installing = true;

        let sync = await this.webadb.sync();

        await sync.push(
          this.apk,
          `/data/local/tmp/pwabuilder`,
          "0644",
          async (done, total) => {
            console.log(done);
            console.log(total);
          }
        );

        await sync.quit();

        let shell = await this.webadb.shell(
          `pm install -r /data/local/tmp/pwabuilder`
        );
        let r = await shell.receive();

        let decoder = new TextDecoder();

        while (r.cmd == "WRTE") {
          if (r.data != null) {
            // Log the data decoder.decode(r.data)
            console.log(decoder.decode(r.data));
          }

          shell.send("OKAY");
          r = await shell.receive();
        }

        this.installing = false;
      } catch (err) {
        this.androidPWAErrors = [err.toString()];
        this.installing = false;
      }
    }
  }

  createWindowsPackageOptionsFromManifest(windowsConfiguration: "anaheim" | "spartan"): publish.WindowsPackageOptions {
    const pwaUrl = this.manifest.url;
    if (!pwaUrl) {
      throw new Error("Can't find the current URL");
    }

    const name = this.manifest.short_name || this.manifest.name || "My PWA";
    const packageID = generateWindowsPackageId(new URL(pwaUrl).hostname);
    const manifestIcons = this.manifest.icons || [];
    const icon =
      findSuitableIcon(manifestIcons, "any", 512, 512, "image/png") ||
      findSuitableIcon(manifestIcons, "any", 192, 192, "image/png") ||
      findSuitableIcon(manifestIcons, "any", 512, 512, "image/jpeg") || 
      findSuitableIcon(manifestIcons, "any", 192, 192, "image/jpeg") ||
      findSuitableIcon(manifestIcons, "any", 512, 512, undefined) || // Fallback to a 512x512 with an undefined type.
      findSuitableIcon(manifestIcons, "any", 192, 192, undefined) || // Fallback to a 192x192 with an undefined type.
      findSuitableIcon(manifestIcons, "any", 0, 0, "image/png") || // No large PNG and no large JPG? See if we have *any* PNG
      findSuitableIcon(manifestIcons, "any", 0, 0, "image/jpeg") || // No large PNG and no large JPG? See if we have *any* JPG
      findSuitableIcon(manifestIcons, "any", 0, 0, undefined); // Welp, we sure tried. Grab any image available.

    const packageOptions: publish.WindowsPackageOptions = {
      name: name,
      packageId: packageID,
      url: pwaUrl,
      version: windowsConfiguration === "spartan" ? "1.0.0" : "1.0.1",
      allowSigning: true,
      publisher: {
        displayName: "Contoso, Inc.",
        commonName: "CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca"
      },
      generateModernPackage: windowsConfiguration === "anaheim",
      classicPackage: {
        generate: windowsConfiguration === "anaheim",
        version: "1.0.0",
        url: pwaUrl,
      },
      edgeHtmlPackage: {
        generate: windowsConfiguration === "spartan"
      },
      manifestUrl: this.manifestUrl,
      manifest: this.manifest,
      images: {
        baseImage: icon && icon.src ? icon.src : "",
        backgroundColor: "transparent",
        padding: 0.3
      }
    };
    
    return packageOptions;
  }

  createAndroidPackageOptionsFromManifest(): publish.AndroidApkOptions {
    const pwaUrl = this.manifest.url;
    if (!pwaUrl) {
      throw new Error("Can't find the current URL");
    }

    const appName = this.manifest.short_name || this.manifest.name || "My PWA";
    const packageName = generatePackageId(new URL(pwaUrl).hostname);

    // Use standalone display mode unless the manifest has fullscreen specified.
    const display =
      this.manifest.display === "fullscreen" ? "fullscreen" : "standalone";

    // StartUrl must be relative to the host.
    // We make sure it is below.
    let relativeStartUrl: string;
    if (!this.manifest.start_url || this.manifest.start_url === "/" || this.manifest.start_url === "." || this.manifest.start_url === "./") {
      // First, if we don't have a start_url in the manifest, or it's just "/",
      // then we can just use that.
      relativeStartUrl = "/";
    } else {
      // The start_url in the manifest is either a relative or absolute path.
      // Ensure it's a path relative to the root.
      const absoluteStartUrl = new URL(this.manifest.start_url, pwaUrl);
      relativeStartUrl =
        absoluteStartUrl.pathname + (absoluteStartUrl.search || "");
    }

    const manifestIcons = this.manifest.icons || [];
    const icon =
      findSuitableIcon(manifestIcons, "any", 512, 512, "image/png") ||
      findSuitableIcon(manifestIcons, "any", 192, 192, "image/png") ||
      findSuitableIcon(manifestIcons, "any", 512, 512, "image/jpeg") ||
      findSuitableIcon(manifestIcons, "any", 192, 192, "image/jpeg") ||
      findSuitableIcon(manifestIcons, "any", 512, 512, undefined) || // A 512x512 or larger image with unspecified type
      findSuitableIcon(manifestIcons, "any", 192, 192, undefined) || // A 512x512 or larger image with unspecified type
      findSuitableIcon(manifestIcons, "any", 0, 0, undefined); // Welp, we tried. Any image of any size, any type.
    const maskableIcon =
      findSuitableIcon(manifestIcons, "maskable", 512, 512, "image/png") ||
      findSuitableIcon(manifestIcons, "maskable", 192, 192, "image/png") ||
      findSuitableIcon(manifestIcons, "maskable", 192, 192, undefined);
    const monochromeIcon =
      findSuitableIcon(manifestIcons, "monochrome", 512, 512, "image/png") ||
      findSuitableIcon(manifestIcons, "monochrome", 192, 192, "image/png") || 
      findSuitableIcon(manifestIcons, "monochrome", 192, 192, undefined);
    const navColorOrFallback = 
      this.manifest.theme_color ||
        this.manifest.background_color ||
        "#000000";
    return {
      appVersion: "1.0.0.0",
      appVersionCode: 1,
      backgroundColor:
        this.manifest.background_color ||
        this.manifest.theme_color ||
        "#FFFFFF",
      display: display,
      enableNotifications: true,
      enableSiteSettingsShortcut: true,
      fallbackType: "customtabs",
      features: {
        locationDelegation: {
          enabled: true
        },
        playBilling: {
          enabled: false
        }
      },
      host: pwaUrl,
      iconUrl: icon ? icon.src : "",
      includeSourceCode: false,
      isChromeOSOnly: false,
      launcherName: this.manifest.short_name || appName, // launcher name should be the short name. If none is available, fallback to the full app name.
      maskableIconUrl: maskableIcon ? maskableIcon.src : "",
      monochromeIconUrl: monochromeIcon ? monochromeIcon.src : "",
      name: appName,
      navigationColor: navColorOrFallback,
      navigationColorDark: navColorOrFallback,
      navigationDividerColor: navColorOrFallback,
      navigationDividerColorDark: navColorOrFallback,
      orientation: this.manifest.orientation || "default",
      packageId: packageName,
      shortcuts: this.manifest.shortcuts || [],
      signing: {
        file: null,
        alias: "my-key-alias",
        fullName: `${
          this.manifest.short_name || this.manifest.name || "App"
        } Admin`,
        organization: this.manifest.name || "PWABuilder",
        organizationalUnit: "Engineering",
        countryCode: "US",
        keyPassword: "", // If empty, one will be generated by CloudAPK service
        storePassword: "", // If empty, one will be generated by CloudAPK service
      },
      signingMode: "new",
      splashScreenFadeOutDuration: 300,
      startUrl: relativeStartUrl,
      themeColor: this.manifest.theme_color || "#FFFFFF",
      shareTarget: this.manifest.share_target,
      webManifestUrl: this.manifestUrl,
    };
  }

  public mounted(): void {
    const overrideValues = {
      uri: window.location.href,
      pageName: "publishPage",
      pageHeight: window.innerHeight,
    };

    if (this.manifest && this.manifest.description && this.teamsForm) {
      if (this.manifest.description.length > 80) {
        this.teamsForm.longDescription = this.manifest.description;
      } else {
        this.teamsForm.shortDescription = this.manifest.description;
      }
    }

    if (!this.manifest) {
      const currentURL = sessionStorage.getItem("currentURL");
      if (currentURL) {
        try {
          this.updateLinkFromStorage(currentURL);
          this.getManifestInformation();
          this.enableDownloadButton();
        } catch (err) {
          console.error(err);
        }
      } else {
        this.disableDownloadButton();
      }
    } else {
      this.enableDownloadButton();
    }

    this.$awa(overrideValues);
  }

  /**
   * Called when the user changes the signing mode.
   */
  androidSigningModeChanged() {
    if (!this.androidForm || !this.androidForm.signing) {
      return;
    }

    // If the user chose "mine", clear out existing values.
    if (this.androidForm.signingMode === "mine") {
      this.androidForm.signing.alias = "";
      this.androidForm.signing.fullName = "";
      this.androidForm.signing.organization = "";
      this.androidForm.signing.organizationalUnit = "";
      this.androidForm.signing.countryCode = "";
      this.androidForm.signing.keyPassword = "";
      this.androidForm.signing.storePassword = "";
    } else if (this.androidForm.signingMode === "new") {
      this.androidForm.signing.alias = "my-key-alias";
      this.androidForm.signing.fullName = `${
        this.manifest.short_name || this.manifest.name || "App"
      } Admin`;
      this.androidForm.signing.organization =
        this.manifest.name || "PWABuilder";
      this.androidForm.signing.organizationalUnit = "Engineering";
      this.androidForm.signing.countryCode = "US";
      this.androidForm.signing.keyPassword = "";
      this.androidForm.signing.storePassword = "";
      this.androidForm.signing.file = null;
    }
  }

  get androidPasswordPlaceholder(): string {
    if (!this.androidForm) {
      return "";
    }

    if (this.androidForm.signingMode === "new") {
      return "Type a new password or leave empty to generate one";
    }

    return "";
  }

  /**
   * Called when the user uploads their Android keystore signing file.
   */
  androidSigningKeyUploaded(event: InputEvent) {
    if (!this.androidForm || !this.androidForm.signing) {
      return;
    }

    const signing = this.androidForm.signing;
    const filePicker = event.target as HTMLInputElement;
    if (filePicker && filePicker.files && filePicker.files.length > 0) {
      const keyFile = filePicker.files[0];

      // Make sure it's a reasonable size.
      if (keyFile.size > this.maxKeyFileSizeInBytes) {
        console.error("Keystore file is too large.", {
          maxSize: this.maxKeyFileSizeInBytes,
          fileSize: keyFile.size,
        });
        this.androidForm.signingMode = "none";
      }

      // Read it in as a Uint8Array and store it in our signing object.
      const fileReader = new FileReader();
      fileReader.onload = () => (signing.file = fileReader.result as string);
      fileReader.onerror = (progressEvent) => {
        console.error(
          "Unable to read keystore file",
          fileReader.error,
          progressEvent
        );
        signing.file = null;
        if (this.androidForm) {
          this.androidForm.signingMode = "none";
        }
      };

      fileReader.readAsDataURL(keyFile);
    }
  }

  platCardHover(ev) {
    if (ev.target) {
      const parent = ev.target.children[2];

      let targetButton: HTMLButtonElement | null = null;

      if (parent) {
        targetButton = ev.target.children[2].children[0];
      }

      if (targetButton) {
        targetButton.classList.add("platformDownloadButtonHover");
      }
    }
  }

  platCardUnHover(ev) {
    const targetButton: HTMLButtonElement = ev.target.children[2].children[0];

    if (targetButton) {
      targetButton.classList.remove("platformDownloadButtonHover");
    }
  }

  public goToHome(): void {
    this.$router.push({
      path: this.$i18n.path(""),
    });
  }

  public openAppXModal(): void {
    this.openWindows = false;
    (this.$refs.appxModal as Modal).show();
  }

  public openAndroidOptionModal(): void {
    this.openAndroid = false;

    // Create a copy of the Android form. If the user cancels the dialog, we'll revert back to this copy.
    if (this.androidForm) {
      this.androidFormCopyForCancellation = { ...this.androidForm };
      if (this.androidForm.signing) {
        this.androidFormCopyForCancellation.signing = {
          ...this.androidForm.signing,
        };
      }
    }

    (this.$refs.androidPWAModal as Modal).show();
  }

  public openAndroidModal(): void {
    this.openAndroid = true;
  }

  public closeAndroidModal(): void {
    this.openAndroid = false;
    this.openWindows = false;
  }

  public openWindowsModal(): void {
    this.openWindows = true;
  }

  public openWindowsOptionsModal(config: "anaheim" | "spartan"): void {
    this.openWindows = false;
    this.windowsFormConfiguration = config;

   // Create a copy of the Windows form. If the user cancels the dialog, we'll revert back to this copy.
    if (this.windowsForm) {
      this.windowsFormCopyForCancellation = { ...this.windowsForm };
    }

    (this.$refs.windowsPWAModal as Modal).show();
    Vue.prototype.$awa({ referrerUri: 'https://www.pwabuilder.com/publish/windows10-appx' });
  }

  public openTeamsModal(): void {
    this.openTeams = true;
    this.disableDownloadButton();
  }

  public closeWindowsModal(): void {
    this.openWindows = false;
  }

  public closeTeamsModal(): void {
    this.openTeams = false;

    this.teamsForm = {
      publisherName: null,
      shortDescription: null,
      longDescription: null,
      privacyUrl: null,
      termsOfUseUrl: null,
      colorImageFile: null,
      outlineImageFile: null,
    };

    if (this.manifest && this.manifest.description) {
      if (this.manifest.description.length > 80) {
        this.teamsForm.longDescription = this.manifest.description;
      } else {
        this.teamsForm.shortDescription = this.manifest.description;
      }
    }

    this.enableDownloadButton();
  }

  public async handleUploadColorIcon(): Promise<void> {
    if (!this.teamsForm) {
      return;
    }

    this.uploadColorLoaderActive = true;
    const el = <HTMLInputElement>(
      document.getElementById("upload-file-input-color")
    );
    if (el && el.files) {
      this.teamsForm.colorImageFile = el.files[0];
    }

    await this.uploadIcon(this.teamsForm.colorImageFile);
    await this.updateManifest(this.manifest);
    this.validateTeamsForm();
    this.uploadColorLoaderActive = false;
  }

  public clickUploadColorFileInput(): void {
    const el = document.getElementById("upload-file-input-color");
    if (el) {
      el.click();
    }
  }

  public async handleUploadOutlineIcon(): Promise<void> {
    if (!this.teamsForm) {
      return;
    }

    this.uploadOutlineLoaderActive = true;
    const el = <HTMLInputElement>(
      document.getElementById("upload-file-input-outline")
    );
    if (el && el.files) {
      this.teamsForm.outlineImageFile = el.files[0];
    }

    await this.uploadIcon(this.teamsForm.outlineImageFile);
    await this.updateManifest(this.manifest);
    this.validateTeamsForm();
    this.uploadOutlineLoaderActive = false;
  }

  public clickUploadOutlineFileInput(): void {
    const el = document.getElementById("upload-file-input-outline");
    if (el) {
      el.click();
    }
  }

  public validateTeamsForm(): void {
    if (!this.teamsForm) {
      return;
    }

    const buttonDisabled = this.downloadDisabled;
    const formFilled =
      typeof this.teamsForm.publisherName === "string" &&
      typeof this.teamsForm.shortDescription === "string" &&
      typeof this.teamsForm.longDescription === "string" &&
      typeof this.teamsForm.privacyUrl === "string" &&
      typeof this.teamsForm.termsOfUseUrl === "string" &&
      this.teamsForm.colorImageFile !== null;

    if (buttonDisabled && formFilled) {
      this.enableDownloadButton();
    } else if (!buttonDisabled && !formFilled) {
      this.disableDownloadButton();
    }
  }

  public async androidOptionsModalSubmitted(): Promise<void> {
    if (!this.androidForm) {
      return;
    }

    const validationErrors = validateAndroidOptions(this.androidForm);
    if (validationErrors.length > 0) {
      this.androidPWAErrors = validationErrors.map((e) => e.error);
      return;
    }

    (this.$refs.androidPWAModal as Modal).hide();
    this.openAndroid = true;
    this.androidPWAErrors = [];
  }

  public androidOptionsModalCancelled() {
    this.androidForm =
      this.androidFormCopyForCancellation ||
      this.createAndroidPackageOptionsFromManifest();
    this.androidPWAErrors = [];
    (this.$refs.androidPWAModal as Modal).hide();
    this.openAndroid = true;
  }

  public windowsOptionsModalCancelled() {
    this.windowsForm = 
      this.windowsFormCopyForCancellation ||
      this.createWindowsPackageOptionsFromManifest(this.windowsFormConfiguration);

    this.windowsOptionsErrors = [];

    (this.$refs.windowsPWAModal as Modal).hide();
    this.openWindows = true;
  }

  public windowsOptionsModalSubmitted() {
   if (!this.windowsForm) {
      return;
    }

    const validationErrors = validateWindowsOptions(this.windowsForm, this.windowsFormConfiguration);
    if (validationErrors.length > 0) {
      this.windowsOptionsErrors = validationErrors.map((e) => e.error);
      return;
    }

    (this.$refs.windowsPWAModal as Modal).hide();
    this.openWindows = true;
    this.windowsOptionsErrors = [];

    this.windowsOptionsApplied = true;
  }

  public ConstructErrorMessage(list) {
    if (list.length === 1) {
      return `Invalid package name. "${list[0]}" is a keyword.`;
    } else {
      return `Invalid package name. "${list
        .slice(0, list.length - 1)
        .join(", ")} and ${list[list.length - 1]}" are keywords`;
    }
  }

  public onCancelAppxModal(): void {
    this.appxForm = {
      publisher: null,
      publisher_id: null,
      package: null,
      version: null,
    };
  }

  public modalOpened() {
    window.scrollTo(0, 0);

    this.modalStatus = true;
    this.showBackground = true;
  }

  public modalClosed() {
    this.modalStatus = false;
    this.showBackground = false;
  }

  public androidModalClosed() {
    this.modalStatus = false;
    this.showBackground = false;
    this.openAndroid = true;
  }

  public windowsModalClosed() {
    this.modalStatus = false;
    this.showBackground = false;
    this.openWindows = true;
  }

  get windowsFormConfiguration(): "spartan" | "anaheim" {
    if (this.windowsForm && this.windowsForm.edgeHtmlPackage && this.windowsForm.edgeHtmlPackage.generate) {
      return "spartan";
    }

    return "anaheim";
  }

  set windowsFormConfiguration(val: "spartan" | "anaheim") {
    if (val === "spartan") {
      this.windowsForm = this.windowsSpartanForm;
    } else if (val === "anaheim") {
      this.windowsForm = this.windowsAnaheimForm;
    }
  }
}

Vue.prototype.$awa = function (config) {
  if (awa) {
    awa.ct.capturePageView(config);
  }

  return;
};

declare var awa: any;
</script>

<style lang="scss">
/* stylelint-disable */

@import "~assets/scss/base/variables";

// Hide macOS card for now
#pwaMacosCard {
  display: none;
}

.pwaCardHeaderBlock #windowsCardHeader {
  display: flex;
  align-items: center;
  justify-content: center;
}

#windowsCardHeaderBlock {
  justify-content: space-between;
}

#windowsCardHeaderBlock span {
  font-weight: bold;
}

#androidInstallWrapper {
  padding: 10px;
  border: solid 1px #3c3c3c;
  border-radius: 10px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  text-align: center;
  padding-bottom: 24px;
  flex-direction: column;
  padding-left: 1em;
  padding-right: 1em;
}

#androidInstallWrapper p {
  color: #3c3c3c;
  display: block;
  margin-bottom: 2em;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 21px;
}

#androidInstallActions {
  display: flex;
}

.androidInstallButton {
  background: #3c3c3c;
  color: white;
  font-size: 14px;
  border-radius: 20px;
  width: 150px;
  height: 40px;
  padding-left: 20px;
  padding-right: 20px;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  margin-left: 12px;
  border: none;
}

.androidInstallButton:disabled {
  background: #8a8a8a;
}

#installSpinner {
  margin-top: -1px !important;
  height: 32px;
  display: inline-block;
  padding-top: 4px;
}

@-moz-document url-prefix() {
  #installSpinner {
    margin-top: 38px !important;
    margin-left: 10px !important;
  }
}

.flavor {
  width: 32px;
  height: 32px;
  border-radius: 40px;
  overflow: hidden;
}

.flavor > .colorbands {
  position: relative;
  top: 0%;
  left: -20%;

  width: 140%;
  height: 800%;

  background-image: linear-gradient(
    0deg,
    #1fc2c8 25%,
    #9337d8 50%,
    #9337d8 75%,
    #1fc2c8 100%
  );
  background-position: 0px 0px;
  background-repeat: repeat-y;

  animation: colorbands 100s linear infinite;
  transform: rotate(180deg);
}

@keyframes colorbands {
  to {
    background-position: 0 -1000vh;
  }
}

.icon {
  position: relative;
  color: white;
  top: -25px;
  left: 7px;

  .lds-dual-ring {
    display: inline-block;
    width: 32px;
    height: 32px;
  }

  .lds-dual-ring:after {
    content: " ";
    display: block;
    width: 16px;
    height: 16px;
    margin: 1px;
    border-radius: 50%;
    border: 5px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: lds-dual-ring 1.2s linear infinite;
  }

  @keyframes lds-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}

#skeletonSpan {
  width: 30em;
  justify-content: center;

  ul {
    flex-grow: 2;
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: 42px;

    li {
      font-size: 14px;
      font-weight: bold;
      padding: 0.5em;
      padding-left: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 5px;
      color: #3c3c3c span {
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 18px;
        color: #3c3c3c;
      }
    }
  }

  .skeletonSpan {
    background: linear-gradient(
      to right,
      rgba(140, 140, 140, 0.8),
      rgba(140, 140, 140, 0.18),
      rgba(140, 140, 140, 0.33)
    );
    background-size: 800px 104px;
    animation-duration: 1s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    height: 1em;
    width: 100%;
  }

  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }

    100% {
      background-position: 468px 0;
    }
  }
}

#devicePreviews {
  height: 504px;
}

#desktopDevicePreview {
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 24em;
  }
}

#mobileDevicePreview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28em;

  svg {
    width: 18em;
    height: 53em;
  }

  img {
    height: 20em;
  }
}

@keyframes publishfadein {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

footer {
  display: flex;
  justify-content: center;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 12px;
  color: rgba(60, 60, 60, 0.5);
  background: white;
}

footer p {
  text-align: center;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  color: #707070;
}

footer a {
  color: #707070;
  text-decoration: underline;
}

.pwaIcon {
  height: 22px;
  margin-right: 10px;
}

#teamsIconImg {
  height: 40px;
  width: 42px;
}

@media (max-height: 700px) {
  #scorepublishSideBySide header {
    top: 51px;
  }
}

#modalBackground {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 98999;
  will-change: opacity;
}

#appxModal .modal {
  @media (max-width: 640px) {
    .modal-box {
      width: 100%;

      .closeButtonDiv {
        margin-top: 20px;
      }
    }
  }
}

@keyframes opened {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.7;
  }
}

#appxModalBody {
  input {
    padding: initial;
  }

  div {
    margin-top: 40px;

    #topLabel {
      font-weight: initial;
    }

    label {
      font-weight: bold;
      margin-bottom: 20px;
      display: block;
    }
  }
}

#publishSideBySide {
  display: flex;
  background: linear-gradient(-32deg, #9337d8, #1fc2c8);

  #publishLeftSide {
    height: 100%;
    flex: 1;

    display: flex;
    justify-content: center;
    align-self: center;
    align-items: center;

    header {
      display: flex;
      align-items: center;
      padding-left: 159px;
      margin-top: 32px;

      #headerText {
        font-size: 28px;
        font-weight: normal;
      }

      #logo {
        background: lightgrey;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        margin-right: 12px;
      }
    }

    #introContainer {
      color: white;
      margin-left: 20px;
      margin-right: 20px;

      h2 {
        font-family: sans-serif;
        font-weight: 600;
        font-size: 24px;
      }

      p {
        font-size: 18px;
      }

      #publishActionsContainer {
        display: flex;
        width: 100%;

        button {
          border: none;
          width: 264px;
          border-radius: 20px;
          font-size: 18px;
          font-weight: bold;
          padding-top: 9px;
          padding-bottom: 11px;
        }

        #downloadAllButton {
          margin-right: 11px;
          background: $color-button-primary-purple-variant;
          color: white;
          width: 264px;
          border-radius: 20px;
          font-size: 18px;
          padding-top: 9px;
          padding-bottom: 11px;
          font-weight: bold;
          display: flex;
          justify-content: center;
        }

        #downloadAllButton:hover {
          cursor: pointer;
        }
      }
    }
  }

  #publishRightSide {
    height: 100%;
    flex: 2;
    display: flex;
    flex-direction: column;
    background: white;
    align-items: center;
    justify-content: center;
    padding-bottom: 100px;

    #platformsListContainer {
      padding-top: 20px;
      padding-right: 20px;
      padding-left: 20px;
      color: white;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        display: grid;
        // flex-direction: column;
        // flex-wrap: wrap;

        .pwaCard {
          background: #f0f0f0;
          border-radius: 4px;
          color: #3c3c3c;
          padding-left: 24px;
          padding-right: 24px;
          padding-top: 20px;
          padding-bottom: 40px;
          margin: 10px;
          position: relative;
          transition: box-shadow 0.3s;

          .pwaCardHeaderBlock {
            display: flex;
            align-items: center;
          }

          .pwaCardHeaderBlock h2 {
            font-style: normal;
            font-weight: bold;
            font-size: 16px;
            line-height: 24px;
            color: rgba(60, 60, 60, 0.9);
          }

          .platformDownloadBar {
            position: absolute;
            bottom: 20px;
            right: 20px;
            height: 30px;
          }

          .pwaCardIconBlock {
            display: flex;
            align-items: center;
          }

          .platformDownloadButton {
            border-radius: 50%;
            width: 30px;
            height: 30px;
            border: none;
            background: rgba(60, 60, 60, 0.1);
          }

          .platformDownloadButtonHover {
            border-radius: 50%;
            width: 30px;
            height: 30px;
            border: none;
            background-image: linear-gradient(to right, #1fc2c8, #9337d8 116%);
            color: white;
          }

          .platformIcon {
            font-size: 32px;
            margin-right: 10px;
          }

          p {
            font-style: normal;
            font-weight: normal;
            font-size: 14px;
            line-height: 21px;
            margin-top: 15px;
          }
        }

        .pwaCard:hover {
          box-shadow: 0 1px 8px 4px #9a989869;
        }

        #pwaMainCard {
          grid-column-start: span 2;
        }

        #pwaTeamsCard {
          grid-column-start: span 2;
        }

        // #pwaWindowsCard {
        //   #platformIcon {
        //     margin-right: 42px;
        //   }

        //   .pwaCardHeaderBlock {
        //     margin-right: 100px;
        //   }

        //   h2 {
        //     margin-right: -96px;
        //   }
        // }

        #windowsListItem {
          height: 100px;
        }

        li {
          display: flex;
          height: 84px;
          margin-bottom: 30px;

          span {
            margin-left: 19px;
            font-size: 14px;
            font-weight: normal;
            width: 476px;
          }

          #platformButtonBlock {
            display: flex;
            flex-direction: column;
            align-items: center;

            .platformIcon {
              font-size: 44px;
            }
          }
        }
      }
    }
  }
}

#topLabelBox {
  margin-bottom: 1em;
}

#bottomSection {
  display: none;

  #coolPWAs {
    padding-left: 10em;
    flex: 1;

    h2 {
      font-size: 36px;
      font-weight: bold;
    }

    p {
      width: 392px;
      font-size: 18px;
    }

    #iconGrid {
      display: grid;
      grid-template-columns: auto auto auto;
      width: 392px;
      margin-top: 36px;

      svg {
        font-size: 64px;
      }
    }
  }

  #bottomImageSection {
    flex: 1;
  }
}

.androidModalBody #extraSection p {
  color: grey;
  font-size: 14px;
}

.androidModalBody #extraSection #legacyDownloadButton, 
.androidModalBody #androidModalButtonSection #legacyDownloadButton, 
#legacyEdgeBetaDownloadButton, 
.legacyEdgeBetaOptionsButton {
  color: grey;
  font-size: 14px;
  background: transparent;
  padding-left: 0;
  border: none;
  margin-top: 1em;
}

#legacyDownloadButton {
  vertical-align: bottom;
}

#legacyEdgeBetaDownloadButton {
  vertical-align: bottom;
}

#legacyEdgeBetaDownloadButton #colorSpinner {
  transform: scale(0.5) translateY(-5px);
  max-height: 16px;
}

#legacyEdgeBetaDownloadButton, .legacyEdgeBetaOptionsButton {
  color: #9337d8;
  border: solid 1px;
  padding: 4px;
  margin-right: 4px;
}

.edgeBlock {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.androidModalBody {
  width: 34em;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 60px;
  padding-right: 60px;
  border-radius: 12px;
}

.androidModalBody.androidOptionsModalBody {
  width: 100%;
  align-items: start;
  padding-left: 0;
  max-height: 500px;
  overflow: auto;
}

/* On smaller screens, reduce the padding on modals */
@media (max-width: $media-screen-m) {
  .androidModalBody.androidOptionsModalBody {
    padding-left: 10px;
    padding-right: 10px;
  }
}

.androidModalBody.androidOptionsModalBody input {
  margin-bottom: 12px;
  border-color: #00000075;
}

.androidModalBody.androidOptionsModalBody label {
  display: block;
  margin-bottom: 10px;
}

.androidModalBody.androidOptionsModalBody + .modal-buttons {
  margin-top: 2em;
  margin-bottom: 2em;
}

.androidModalBody.androidOptionsModalBody .fa-info-circle {
  color: $color-muted;
  cursor: help;
}

.androidModalBody.androidOptionsModalBody a .fa-info-circle {
  cursor: pointer;
}

#closeAndroidPlatButton {
  top: 10px;
  border: none;
  float: right;
  height: 32px;
  background: #3c3c3c;
  color: white;
  border-radius: 50%;
  width: 32px;
  margin-top: 10px;
  margin-right: 10px;
  right: 10px;
  position: absolute;
  font-size: 14px;
}

.androidModalP {
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.02em;
  margin-top: 40px;
}

.androidModalP a {
  color: #9337d8;
}

.androidModalBody #androidModalSubText {
  color: #3c3c3c;
  display: block;
  margin-bottom: 2em;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 21px;
}

#androidModalButtonSection {
  display: flex;
  justify-content: space-around;
  width: 80%;
  margin-top: 1em;
  margin-bottom: 20px;
}

.androidDownloadButton {
  background: #9337d8;
  color: white;
  font-size: 14px;
  border-radius: 20px;
  width: 150px;
  height: 40px;
  padding-left: 20px;
  padding-right: 20px;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.androidDownloadButton #installSpinner {
  margin-top: 4px;
}

.androidDownloadButton.webviewButton {
  width: 183px;
  background: #3c3c3c;
}

.androidDownloadButton:hover {
  cursor: pointer;
}

#androidPlatModal {
  background: transparent;
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  animation-name: opened;
  animation-duration: 250ms;
  border-radius: 4px;
  will-change: opacity transform;
}

.platModalBody #extraSection p {
  color: grey;
  font-size: 10px;
}

.platModalBody #extraSection #legacyDownloadButton {
  color: grey;
  font-size: 10px;
  background: transparent;
}

.platModalBody {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  width: 34em;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 60px;
  padding-right: 60px;
  border-radius: 12px;
  text-align: center;
}

.platModalForm {
  max-height: 800px;
  padding: 36px 60px;
  overflow: scroll;
  justify-content: space-between;
  align-content: space-between;

  .platModalField {
    width: 100%;
    text-align: left;
    flex: 0 0;

    &:not(:first-child) {
      margin-top: 14px;
    }

    label {
      h4 {
        font-size: 16px;
        line-height: 19px;

        color: #000000;
      }

      p {
        margin: 8px 0;
        font-size: 14px;
        line-height: 16px;
        color: #808080;
      }

      margin-bottom: 16px;
    }

    input,
    textarea {
      width: 100%;
      font-size: 14px;
      border-color: #f4f4f4;

      &:focus {
        border-color: #9337d8;
        outline: none;
      }

      &.error {
        border-color: #a80000;
      }
    }

    input {
      height: 35px;
      padding: 8px 8px 8px 0;
      border-width: 0 0 1px;
    }

    textarea {
      height: 120px;
      resize: none;

      &.short {
        height: 40px;
      }
    }

    .image-upload-loader {
      display: inline-block;
      margin-left: 8px;
      vertical-align: middle;
    }

    &.file-chooser {
      #uploadIconImage-color,
      #uploadIconImage-outline {
        font-size: 14px;
        line-height: 16px;
        text-align: center;
        display: inline-block;
        padding: 8px 32px;
        color: #000000;
        border: 1px solid #3c3d3e;

        &:focus {
          border-color: #9337d8;
        }
      }

      #upload-file-input-color,
      #upload-file-input-outline {
        display: none;
      }

      .file-description {
        display: inline-block;
        margin-left: 14px;
        font-size: 14px;
        line-height: 16px;
        color: #808080;
      }
    }
  }
}

.closeModalPlatButton {
  top: 10px;
  border: none;
  float: right;
  height: 32px;
  background: #3c3c3c;
  color: white;
  border-radius: 50%;
  width: 32px;
  margin-top: 10px;
  margin-right: 10px;
  right: 10px;
  position: absolute;
  font-size: 14px;
}

.platModalP {
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.02em;
  margin-top: 40px;
}

.platModalP a {
  color: #9337d8;
}

.platModalBody .platModalSubText {
  color: #3c3c3c;
  display: block;
  margin-bottom: 2em;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 21px;
}

.platModalButtonSection {
  display: flex;
  justify-content: space-around;
  width: 80%;
  margin-top: 1em;
  margin-bottom: 20px;
}

.platModalDownloadButton {
  background: #9337d8;
  color: white;
  font-size: 14px;
  border-radius: 20px;
  width: 150px;
  height: 40px;
  padding-left: 20px;
  padding-right: 20px;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.platModalDownloadButton #installSpinner {
  height: 32px;
  margin-top: 4px !important;
}

.platModalDownloadButton.webviewButton {
  width: 183px;
  background: #3c3c3c;
}

.platModalDownloadButton:hover {
  cursor: pointer;
}

.platModal {
  background: transparent;
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  animation-name: opened;
  animation-duration: 250ms;
  border-radius: 4px;
  will-change: opacity transform;
}

#teamsModal {
  align-items: baseline;
}

@keyframes opened {
  from {
    transform: scale(0.4, 0.4);
    opacity: 0.4;
  }

  to {
    transform: scale(1, 1);
    opacity: 1;
  }
}

.modalBackground {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: grey;
  opacity: 0.8;
  z-index: 98999;
}

.packageError {
  position: fixed;
  bottom: 2em;
  right: 2em;
  max-width: 350px;
  overflow: hidden;
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.85);
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 0.25rem;
  z-index: 999999;

  .errorHeader {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    color: #6c757d;
    background-color: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .errorTitle {
      flex-grow: 1;
    }

    .closeBtn {
      opacity: 0.5;
      border: 0;
      background-color: transparent;
      padding: 0;
      font-size: 1.5rem;
      font-weight: bold;

      &:hover {
        color: #000;
        opacity: 0.75;
      }
    }
  }

  .errorBody {
    padding: 0 12px;
    max-height: 300px;
    overflow: auto;

    pre {
      font-family: $font-family-l3;
    }
  }

  .errorFooter {
    padding: 12px;
    display: flex;
    justify-content: flex-end;
    font-size: 90%;
    color: rgba(140, 140, 140, 0.18);
  }
}

@media (min-width: 1200px) {
  #main {
    height: 100vh;
  }

  #publishSideBySide {
    height: 100vh;
  }
}

@media (max-width: 920px) {
  #publishSideBySide {
    flex-direction: column;
  }

  #publishSideBySide #publishLeftSide #introContainer {
    margin-top: 20px;
    margin-left: 30px;
    margin-right: 30px;
  }
}

@media (max-width: 550px) {
  #publishSideBySide #publishRightSide #platformsListContainer ul {
    display: flex;
    flex-direction: column;
  }
}
</style>
