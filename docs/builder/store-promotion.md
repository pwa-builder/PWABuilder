# Free Microsoft Developer Account Promotion

For a limited time, PWABuilder is offering free Microsoft Store Developer accounts (approximately $19 in value) to individual developers who have a [Progressive Web App](/home/pwa-intro) that meets specific requirements. With a Microsoft Store Developer account, you can deploy your Progressive Web App to the Microsoft Store, extending your app's reach to users on Windows.

## Requirements 

To qualify for a free Microsoft Store developer account, you must:

  * own a PWA that is installable, contains all required manifest fields, and implements at least two desktop enhancements. See our [Beginner's Guide to Progressive Web Apps](/home/pwa-intro) for more info.
  * live in a country or region where the Windows program in Partner Center is offered. See [here](https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/account-types-locations-and-fees#developer-account-and-app-submission-markets) for the full list of countries
  * have a valid Microsoft Account to use to sign up for the Microsoft Store on Windows developer account
  * not have an existing Microsoft Store on Windows individual developer/publisher account
  * use the Store Token to create a Microsoft Store on Windows developer account within 30 calendar days of Microsoft sending you the token, using the same Microsoft Account you used to sign in here
  * plan to publish an app in the store this calendar year (prior to 12/31/2023 midnight Pacific Standard Time)

To check if your PWA qualifies and to claim a token, follow the directions below.

## Claiming a Token

Before you can get started claiming a token, make sure you have a valid, public URL for your Progressive Web App.

1. Head to the [PWABuilder.com Store Promotion Page](https://www.pwabuilder.com/freeToken).

2. Enter the URL to your Progressive Web App and hit `Start`.

3. Your PWA will be evaluated to see if it qualifies, if passes all tests, you can continue. Otherwise, you will need to update your PWA to match the requirements. If you see three green check marks at the top right, your PWA is good to go!

4. Click `Sign in with a Microsoft Account to Continue`.

<div class="docs-image">
   <img src="/assets/builder/store-promotion/tests-passed.png" alt="The success screen on the PWABuilder token promotion page.">
</div>

5. Sign in with a personal Microsoft account. You can create one for free [here.](https://account.microsoft.com/account)

6. You will need to accept the promotion terms before you can view your token. 

7. Click `View Token Code`.

<div class="docs-image">
   <img src="/assets/builder/store-promotion/view-token-code.png" alt="PWABuilder promotion page with terms acceptance and token view button.">
</div>

8. You can now use your token to sign up for an Microsoft Store developer account. See the following section on specific guidance on using your token.

If something unexpected went wrong during the claim process, go to [Common Errors](/builder/store-promotion?id=common-errors).

## Using Your Token

Once you have your token, complete the following steps:

1. Navigate to the [Microsoft Developer Sign Up page.](https://developer.microsoft.com/en-us/microsoft-store/register/)

2. Click `Sign Up`.

3. Login with a personal Microsoft account. If you don't have one yet, head to [account.microsoft.com](https://account.microsoft.com/).

4. Select the desired country/region  under `Account country/region`.

5. Select `Individual` under `Account type`.

<div class="docs-image">
    <img src="/assets/builder/store-promotion/promo-registration-info.png" alt="Microsoft Developer account registration info panel.">
</div>

6. Pick a `Publisher display name` that you will publish your apps under.

7. Fill out the contact info that will be associated with your developer account.

8. Next, under `Registration - Payment`, you will see a `Promo Code` field. Enter the code supplied by PWABuilder here.

<div class="docs-image">
    <img src="/assets/builder/store-promotion/promo-registration-payment.png" alt="Microsoft Developer account registration payment panel.">
</div>

9. That's all you need to do to take advantage of the PWABuilder promotion, complete the rest of the sign up as guided.

## Common Errors

There's a few reasons you might not be able to claim a token with a certain URL:
#### URL already in use.

This warning will be displayed if you try to claim a token with a Progressive Web App that is already found in the Microsoft Store. URLs used to claim tokens must not be associated with an app that is already listed.

#### This is a known PWA belonging to an organization or business.

This warning will be displayed if you try to claim a token with a URL that belongs to well-known business or organization. You must claim a token with a personal project that belongs to you.

#### URL already claimed.

This warning will be displayed if you try to claim a token with a URL that has already been used to claim a token. Each URL can only be used once to claim a token. If you are trying to reclaim a token that you already claimed, click `Reclaim Token` at the bottom of this warning.

## Next steps

Once you have created account, you are now able to publish a packaged PWA to the Microsoft Store:

[Learn how to publish a PWA to the Microsoft Store.](/builder/windows)

If you just need help packaging a PWA for Windows:

[Learn how to package your PWA for Windows.](/builder/windows?id=packaging)
