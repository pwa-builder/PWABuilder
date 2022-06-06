# @pwabuilder/manifest-validation

This package runs our validation tests against a Web Manifest. It can be used in both Node.js and the browser.

- [Getting Started](#getting-started)
- [Methods](#methods)
- [Types](#types)

## Getting Started
- Get a standard web manifest object as JSON. This can be done in any way you need and is a seperate concern from this package.
- Start by calling one of the methods below and passing in the manifest JSON from step two. Note that you will first need to import that method first
   - `import { validateRequired } from 'manifest-validation';`

## Methods

- validateRequiredFields
   - This method will validate the manifest against the required fields.
   - Parameters:
     - manifest: The manifest to validate as a standard JSON object
   - Returns: An array of `Validation` that contains each field that failed validation
   - Usage Example: 
    ```javascript 
    const result = validateRequiredFields(manifest);
    ```
- reportMissing
  - This method will find all of fields that are missing in the passed manifest
  - Parameters:
    - manifest: The manifest to validate as a standard JSON object
  - Returns: An array of `string` that contains each field that could not be found in the manifest
  - Usage Example: Same as the above method
  
- validateManifest
  - This method will validate the manifest against all fields and all issues
  - Parameters:
    - manifest: The manifest to validate as a standard JSON object
  - Returns: An array of `Validation` that contains each field that failed validation
  - Usage: Same as the above method

- validateSingleField
  - This method will validate the value in the web manifest agains the given field + value
    - field: TA member of your Web Manifest that you would like to validate, such as `theme_color`
    - value: The current value of the field passed in above
  - Returns: a `Validation` if it failed, `true` if passed and `undefined` if the field is not in the manifest
  - Usage: 
  ```javascript 
    const result = validateSingleField("theme_color", "#ffffff");
    ```
## Types
The following types are exported and can be used in your code by importing the desired type from the package.

```typescript
// Represents the result of a validation test
interface Validation {
    infoString?: string;
    category: string;
    member: string;
    defaultValue?: string | any[];
    docsLink?: string;
    errorString?: string;
    quickFix: boolean;
    test?: Function;
    testName?: string;
}

// Represents a Web Manifest and includes all
// potential members
interface Manifest {
    ...
}
```
