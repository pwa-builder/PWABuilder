import { Router } from '@vaadin/router';
import { env } from '../utils/environment';

function setCookie(token: string): void {
  //todo : add expiry
  //todo : consider storing access tokne in a variable and refresh token as a cookie https://indepth.dev/posts/1382/localstorage-vs-cookies
  // document.cookie = "username=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC; path=/";
  // console.log("Cookie stored", token)
  localStorage.setItem('pwabuilder-token', token);
}

export const pwabuilder_token = 'pwa-auth-token';

export function isUserLoggedIn(): boolean {
  const item = localStorage.getItem(pwabuilder_token);
  return item !== null;
}
export function setHeader(token: string) {
  return `Bearer ${token}`;
}

function getAccessToken(): string | null {
  const providerData = localStorage.getItem(pwabuilder_token);
  if (providerData !== null) {
    const jsonToken = JSON.parse(providerData).token;
    return jsonToken;
  }
  return null;
}
//Set the user as signed in
export async function signInUser(): Promise<void> {
  const jsonToken = getAccessToken();
  if (jsonToken !== null) {
    try {
      await fetch(env.signinFunctionsUrl + '/LoginUser', {
        method: 'POST',
        headers: { Authorization: setHeader(jsonToken) },
      });
      Router.go('/userDashboard');
    } catch (e) {
      console.log('Error getting user details', e);
    }
  } else {
    console.log('Error logging in');
  }
}

export async function storeUserProject(userProjectObj: any) {
  const jsonToken = getAccessToken();
  if (jsonToken !== null) {
    try {
      console.log('User object', userProjectObj);
      await fetch(env.signinFunctionsUrl + '/CreateOrUpdateUserProject', {
        method: 'POST',
        headers: { Authorization: setHeader(jsonToken) },
        body: JSON.stringify(userProjectObj),
      });
    } catch (e) {
      console.log('Error saving user details');
    }
  }
}

export async function getUserProjects() {
  const jsonToken = getAccessToken();
  console.log('json token', jsonToken);
  if (jsonToken !== null) {
    try {
      const result = await fetch(env.signinFunctionsUrl + '/GetUserProjects', {
        method: 'GET',
        headers: { Authorization: setHeader(jsonToken) },
      });
      console.log('Error', result);
      return result;
    } catch (e) {
      console.log('Error getting user details', e);
    }
  }
}
