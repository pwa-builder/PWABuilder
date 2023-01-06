import { Router } from '@vaadin/router';
import { AndroidPackageOptions } from '../utils/android-validation';
import { env } from '../utils/environment';
import { IOSAppPackageOptions } from '../utils/ios-validation';
import { OculusAppPackageOptions } from '../utils/oculus-validation';
import { WindowsPackageOptions } from '../utils/win-validation';
import { Platform } from './publish';

export const pwabuilder_token = 'pwa-auth-token';
export abstract class User {
  //private static userDetails: UserDetails;
  private static userProjects: UserProject[];
  static setUserDetails(details: UserDetails) {
    //User.userDetails = details;
    sessionStorage.setItem('user-details', JSON.stringify(details));
  }

  static setUserProjects(projects: UserProject[]) {
    User.userProjects = projects;
    sessionStorage.setItem('user-projects', JSON.stringify(projects));
  }

  static getUserDetails(): UserDetails {
    const userDetails = JSON.parse(
      sessionStorage.getItem('user-details')!
    ) as UserDetails;
    return userDetails;
  }

  static getUserProjects(): UserProject[] {
    return User.userProjects;
  }
}

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
export async function signInUser(): Promise<UserDetails | null> {
  const jsonToken = getAccessToken();
  console.log('JSON token', jsonToken);
  if (jsonToken !== null) {
    try {
      const response = await fetch(env.signinFunctionsUrl + '/LoginUser', {
        method: 'POST',
        headers: { Authorization: setHeader(jsonToken) },
      });
      const details = await response.json();
      User.setUserDetails({ name: details.name, id: details.id });
      return details;
    } catch (e) {
      console.log('Error getting user details', e);
    }
  } else {
    console.log('Error logging in');
  }
  return null;
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
  platform: Platform,
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
  return undefined;
}

export async function getUserProjectByUrl(url: string): Promise<UserProject> {
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
  return {} as UserProject;
}

export interface UserDetails {
  name?: string;
  id?: string;
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
