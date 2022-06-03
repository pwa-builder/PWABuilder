import { Manifest, Validation } from "../interfaces";
import { maniTests } from "../validations";

export function isStandardOrientation(orientation: string): boolean {
  const standardOrientations = [
    "any",
    "natural",
    "landscape",
    "landscape-primary",
    "landscape-secondary",
    "portrait",
    "portrait-primary",
    "portrait-secondary",
  ];
  return standardOrientations.includes(orientation);
}

// is this valid JSON
export function isValidJSON(json: Manifest): boolean {
  try {
    JSON.parse(JSON.stringify(json));
    return true;
  } catch (e) {
    return false;
  }
}

export async function loopThroughKeys(manifest: Manifest): Promise<Array<Validation>> {
  return new Promise((resolve) => {
      let data: Array<Validation> = [];

      const keys = Object.keys(manifest);

      keys.forEach((key) => {
          maniTests.forEach(async (test) => {
              if (test.member === key && test.test) {
                  const testResult = await test.test(manifest[key]);
  
                  if (testResult === false) {
                      test.valid = false;
                      data.push(test);
                  }
                  else {
                      test.valid = true;
                      data.push(test);
                  }
              }
          })
      })

      resolve(data);
  })
}

export async function loopThroughRequiredKeys(manifest: Manifest): Promise<Array<Validation>> {
  return new Promise((resolve) => {
      let data: Array<Validation> = [];

      const keys = Object.keys(manifest);

      keys.forEach((key) => {
          maniTests.forEach(async (test) => {
              if (test.category === "required") {
                  if (test.member === key && test.test) {
                      const testResult = await test.test(manifest[key]);
  
                      if (testResult === false) {
                          test.valid = false;
                          data.push(test);
                      }
                      else {
                          test.valid = true;
                          data.push(test);
                      }
                  }
              }
          })
      })

      resolve(data);
  })
}
