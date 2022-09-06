import { Router } from '@vaadin/router';
import { AndroidPackageOptions } from '../utils/android-validation';
import { env } from '../utils/environment';
import { IOSAppPackageOptions } from '../utils/ios-validation';
import { OculusAppPackageOptions } from '../utils/oculus-validation';
import { WindowsPackageOptions } from '../utils/win-validation';

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

//Set the user as signed out and return to homepage
export function signOutUser(): void {
  Router.go('/');
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

export async function storePackageOptionsForProject(
  userPackageOptions: any,
  platform: 'windows' | 'android' | 'other-android' | 'ios' | 'oculus',
  url: string
) {
  const jsonToken = getAccessToken();
  console.log('Store package options platform', platform);
  if (jsonToken !== null) {
    try {
      console.log('User object', userPackageOptions);
      await fetch(env.signinFunctionsUrl + '/CreateOrUpdatePackageOptions', {
        method: 'POST',
        headers: { Authorization: setHeader(jsonToken) },
        body: JSON.stringify({
          options: userPackageOptions,
          platform: platform,
          url: url,
        }),
      });
    } catch (e) {
      console.log('Error saving user details');
    }
  }
}

export async function getUserProjects(): Promise<UserProject[] | undefined> {
  const jsonToken = getAccessToken();
  console.log('json token', jsonToken);
  if (jsonToken !== null) {
    try {
      const result = await fetch(env.signinFunctionsUrl + '/GetUserProjects', {
        method: 'GET',
        headers: { Authorization: setHeader(jsonToken) },
      });
      const userProjects: UserProject[] = await result?.json();
      // sessionStorage.setItem(
      //   'user-projects',
      //   JSON.stringify(
      //     userProjects.map(p => {
      //       return JSON.stringify(p);
      //     })
      //   )
      // );
      return userProjects;
    } catch (e) {
      console.log('Error getting user details', e);
    }
  }
}

export async function getUserProjectByUrl(
  url: string
): Promise<UserProject | null> {
  const jsonToken = getAccessToken();
  if (jsonToken !== null) {
    try {
      const response = await fetch(
        env.signinFunctionsUrl + '/GetUserProjectByUrl?url=' + url,
        { method: 'GET', headers: { Authorization: setHeader(jsonToken) } }
      );
      return (await response?.json()) as UserProject;
    } catch (e) {
      console.log('Error fetching project', e);
    }
  }
  return null;
}
export interface UserProject {
  id?: string;
  url?: string;
  lastTested?: string;
  maniResult?: string;
  secResult?: string;
  swResult?: string;
  packageOptions?:
    | AndroidPackageOptions
    | IOSAppPackageOptions
    | WindowsPackageOptions
    | OculusAppPackageOptions;
}
