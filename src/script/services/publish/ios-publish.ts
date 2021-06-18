export let ios_generated = false;

const generateAppUrl = "";

export async function generateIOSPackage(
  iosOptions: any
) {
  try {
    const response = await fetch(generateAppUrl, {
      method: 'POST',
      body: JSON.stringify(iosOptions),
      headers: new Headers({ 'content-type': 'application/json' }),
    });

    if (response.status === 200) {
      //set generated flag
      ios_generated = true;

      return await response.blob();
    }
    else {

    }
  }
  catch (err) {

  }
}

export async function createIOSPackageOptionsFromForm(form: HTMLFormElement) {

}

export async function createIOSPackageOptionsFromManifest() {
  
}