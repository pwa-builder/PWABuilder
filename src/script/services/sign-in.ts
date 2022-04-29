import { Router } from '@vaadin/router';
import {
  Manifest,
  ManifestContext,
  RawTestResult,
  TestResult,
} from '../utils/interfaces';
import { getManifestContext } from './app-info';

function setCookie(token: string): void {
  //todo : add expiry
  //todo : consider storing access tokne in a variable and refresh token as a cookie https://indepth.dev/posts/1382/localstorage-vs-cookies
  // document.cookie = "username=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC; path=/";
  // console.log("Cookie stored", token)
  localStorage.setItem('token', token);
}

export function getUserToken(): string | null {
  const providerData = localStorage.getItem('pwa-auth-token-Microsoft');
  if (providerData) {
    return JSON.parse(providerData).token;
  }
  return null;
}

export function isUserLoggedIn(): boolean {
  const item = localStorage.getItem('pwa-auth-token-Microsoft');
  return item !== null;
}
//Set the user as signed in
export function signInUser(token: string, redirect: boolean = false): void {
  //todo : add expiry
  //todo : consider storing access tokne in a variable and refresh token as a cookie https://indepth.dev/posts/1382/localstorage-vs-cookies
  // document.cookie = "username=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC; path=/";
  // console.log("Cookie stored", token)
  if (!isUserLoggedIn()) {
    setCookie(token);
  }
  if (redirect) {
    console.log('Redirect');
    Router.go('/userDashboard');
  }
}

export function signOutUser(): void {
  Router.go('/');
}

export async function storeOrUpdateUrlManifestScores(
  testResults: RawTestResult
) {
  const maniContext = getManifestContext();
  console.log('Going to store ', testResults);
  const jsonObj = {
    siteUrl: maniContext.siteUrl,
    manifestContext: maniContext,
    testResults: testResults,
    isTested: true,
    time: new Date(),
  };
  const token = getUserToken();
  if (token !== null) {
    //const resp = await setUserDetails(token, jsonObj);
    // const resp = await getUserDetails(token, jsonObj.siteUrl);
    // const result = await resp.json();
    // console.log('Result', result);
    //if user and siteurl exists
    const response = await setUserDetails(token, jsonObj);
    //const response = await setUserDetails(token, jsonObj);
    console.log(response);
  }
}

export async function getUserDetailsById() {
  const token = getUserToken();
  if (token !== null) {
    try {
      const result = await fetch(
        'https://pwabuilder-signin.azurewebsites.net/GetUserDetailsById',
        {
          method: 'GET',
          headers: { Authorization: setHeader(token) },
        }
      );
      console.log('Error', result);
      return result;
    } catch (e) {
      console.log('Error getting user details', e);
    }
  }
}

// async function getUserDetailsByIdAndSiteUrl(token: string, siteUrl: string) {
//   return await fetch(
//     'http://localhost:7071/api/GetUserDetailsByIdAndSiteUrl?siteUrl=' + siteUrl,
//     {
//       method: 'GET',
//       headers: { Authorization: setHeader(token) },
//     }
//   );
// }

async function setUserDetails(token: string, jsonObj: any) {
  return await fetch(
    'https://pwabuilder-signin.azurewebsites.net/api/UpdateUserDetails',
    {
      method: 'POST',
      headers: { Authorization: setHeader(token) },
      body: JSON.stringify(jsonObj),
    }
  );
}

async function setUserScoreDetails(token: string, jsonObj: any) {}
export function setHeader(token: string) {
  return `Bearer ${token}`;
}
