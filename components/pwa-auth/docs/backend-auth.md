# Authenticating users on your backend

This guide shows an example of how to use pwa-auth's `accessToken` to validate a sign-in in your backend server code.

When a user signs-in with pwa-auth, you'll receive a `signin-completed` event:

```javascript

const pwaAuth = document.querySelector("pwa-auth");
pwaAuth.addEventListener("signin-completed", e => {
    const signIn = e.detail;
    if (!signIn.error) {
        console.error("Sign in failed", signIn.error);
    } else {
        console.log("Email: ", signIn.email);
        console.log("Name: ", signIn.name);
        console.log("Picture: ", signIn.imageUrl);
        console.log("Access token", signIn.accessToken);
        console.log("Access token expiration date", signIn.accessTokenExpiration);
        console.log("Provider (MS, Google, FB): ", signIn.provider);
        console.log("Raw data from provider: ", signIn.providerData);
    }
});
```

When that event fires, you should send off the sign-in attempt to your backend to validate the sign-in and do whatever you normally do during sign-in: set an auth cookie, a JWT token, etc.

```javascript
pwaAuth.addEventListener("signin-completed", e => {
    const signIn = e.detail;
    if (!signIn.error) {
        console.error("Sign in failed", signIn.error);
    } else {
        // Send a POST to our backend to sign-in the user.
        fetch("/users/signInWith3rdParty", {
            method: "POST",
            body: JSON.stringify(signIn)
        });
    }
});
```

On your backend code, your `signInWith3rdParty` should validate the sign-in. Pseudocode would look like:

```typescript
function signInWith3rdParty(signIn) {
    if(validateSignIn(signIn.accessToken)) {
        // Proceed with sign-in...
    }
    ...
}
```

What does `validateSignIn` look like? That's provider-specific. Details on each provider below:

## Validating a sign-in with Google

See Google's [Authenticating with a backend sever](https://developers.google.com/identity/sign-in/web/backend-auth) for full details.

In short, use one of the [Google API Client Library for your language](https://developers.google.com/identity/sign-in/web/backend-auth#using-a-google-api-client-library), or alternately you can do a GET query to https://oauth2.googleapis.com/tokeninfo?id_token=abc123

```
TODO: continue here
```

## Validating a sign-in with Microsoft

## Validating a sign-in with Apple

## Validating a sign-in with Facebook

