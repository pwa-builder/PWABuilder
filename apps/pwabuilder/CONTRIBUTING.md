# Contributing Guide + Coding Guidelines

## Why 

Coding guidelines are important to an open-source project because they provide a consistent and organized way of writing code. They also help ensure that the code is readable, maintainable, and reliable. By following coding guidelines, we can avoid common pitfalls such as introducing bugs or making changes that conflict with existing code.  

Additionally, coding guidelines help ensure that the project remains consistent and organized over time, which makes it easier for new developers to get up to speed quickly, or for us to make changes more quickly.  

## Required Tools 

- [Visual Studio Code (aka VSCode)](https://code.visualstudio.com/)

- [The latest LTS (Long Term Servicing) node.js release installed](https://nodejs.org/en)[

- [Windows Terminal](https://www.bing.com/ck/a?!&&p=d0b29d1f2233a278JmltdHM9MTY4MTI1NzYwMCZpZ3VpZD0xNzY3NzIzMS0zMTlmLTYyN2UtMzc5ZS02MmNlMzAyYzYzZDAmaW5zaWQ9NTQ4OQ&ptn=3&hsh=3&fclid=17677231-319f-627e-379e-62ce302c63d0&psq=windows+terminal&u=a1bXMtd2luZG93cy1zdG9yZTovL3BkcC8_UHJvZHVjdElkPTlOMERYMjBISzcwMSZyZWZlcnJlcj1iaW5nd2Vic2VhcmNoJm9jaWQ9YmluZ3dlYnNlYXJjaA&ntb=1)

## Code Style Guide 

1. Use camelCase for variables, functions, and object properties 
2. Use PascalCase for classes and type aliases 
3. Use UPPERCASE for constants 
4. Always use const or let to declare variables 
5. Use variable names that describe the value the variable is being assigned too. 
6. Avoid single-letter variable names unless they are used as loop counters (such as `I` in a for loop) 
7. Use meaningful variable and function names that describe what they do 
8. Avoid long lines of code; try to keep lines shorter than 80 characters  
9. Put spaces around operators like = + - * /  
10. Put spaces after commas in argument lists  
11. Put spaces before and after curly braces {}  
12. End files with a single blank line 

13. Strings should be put into a `strings.ts` file

## Branching Guidelines 

### Overview of our standard branches 

Branch Name: main 

Purpose: main is only for in-production code. Main is auto deployed to production at pwabuilder.com and is protected by branch protection 

---  

Branch Name: staging 

Purpose: staging is our beta branch. The staging branch is auto deployed to `preview.pwabuilder.com` and is meant to be used for code that needs to be tested before going into production. All new features should be merged to this branch first 


### Scenarios 

This section is meant to help you figure out what you should do branch wise for common scenarios. 

#### Bug Fixes 

- Make your branch from main 

- Do you work in that new branch 

- Test the fix on your machine and ensure it fixes the issue 

- Ensure that the project you are working on builds locally 

- Make a PR (pull request) targeted at the main branch 

- Request a review from someone 

- When this PR is merged, make a new PR to update staging from main, and merge this new PR yourself. This will keep staging updated, while also ensuring that bug fixes get out quickly to our users 

#### Features and other enhancements 

- Make your branch from staging 

- Do your work in that new branch 

- Test the feature on your machine and ensure it works as you expect 

- Make a PR targeted at the staging branch 

- Request a review from someone 

When this PR is merged, dev.pwabuilder.com will be updated. Test your feature on preview.pwabuilder.com.

## Standard Releases 

Once a month, unless we are planning a release around a specific timeline, our “code leader” (Justin W will take on this task at first, but we should explore sharing this position if the team thinks this would be useful) will: 

- Do a PR from staging that targets main 

- Make a page in our “Advocacy Materials” section in Loop 

- Write a single paragraph describing any new features or important bug fixes in section as a new page 

- For bigger releases, reach out to Sana for potential graphics 

- Give one day for the team to review this content 

- The following day, this paragraph and any associated content will be sent as an internal email, tweet (with TLDR from paragraph) and discord message 

- For bigger releases, the above content should also include a blog post. 

## Tests 

### Integration Tests 

Our integration tests are written using Playwright Test , and can be found in the `tests` directory in the site repo. 

### Running Tests 

Our tests can be run by running `npm run test` in your terminal with the site repo opened. If all tests succeed, you will get a green message in the console. If tests fail, Playwright will open an html file in your browser that goes through what tests failed and why. 

### Writing new Tests 

Docs for how to write tests using Playwright Test: Writing tests | Playwright. Your new tests file should be added to the tests directory linked to above. The file name should match the following pattern: 

`blah.spec.ts` with .spec.ts always being the file ending. 

 
### Advice for writing tests: 

- Write concise and readable test code that follows the same coding standards and conventions as your production code. 

- Use descriptive and meaningful names for your test methods, classes, and variables. 

- Organize your test code in a logical and consistent way, such as using packages, folders, or files to group related tests. 

- Document your test code with comments or annotations that explain the purpose and logic of each test case. 

- Define clear and realistic test scenarios that cover the most important and common use cases of your system or application. 

 

### Testing Accessibility 

Accessibility will always be checked at build time in GitHub, but I recommend using Edge Devtools to look for Issues while you are developing, and before submitting a PR. 

#### Edge Devtools 

To test accessibility with Edge devtools, you can use the Issues tool and the Inspect tool. The Issues tool automatically detects common accessibility problems such as missing labels, alt text, and contrast. The Inspect tool lets you hover over any element on the webpage and see its accessibility properties and issues. You can also use the Accessibility tab in the Elements tool to view the accessibility tree and the computed roles, states, and properties of any element. 

More Info: Overview of accessibility testing using DevTools - Microsoft Edge Development | Microsoft Learn 

#### Axe Chromium Extension 

The Axe chrome extension is a tool that helps you test the accessibility of your web pages. It can detect common issues such as missing alt text, low contrast, keyboard traps, and more. To use it, you need to install it from the Chrome Extension store and then click on the Axe icon in the browser toolbar. You will see a panel with options to analyze the entire page or a specific element. After running the analysis, you will get a report with the number of violations, passes, and incomplete tests. You can also view the details of each issue and get suggestions on how to fix them. The Axe chromium extension is a simple and effective way to improve the accessibility of your web projects. 

More Info: axe DevTools - Web Accessibility Testing - Chrome Web Store (google.com)  

#### CI (continuous integration testing) 

Our GitHub Actions for the site include an accessibility test using Axe. You will get a notification at the bottom of your PR that lets you know what accessibility problems you may have. These are ALWAYS required to be fixed before we merge. 

## Project Structure

| Folders | Description |
| --- | --- |
| .vscode | Contains Visual Studio Code settings for the project |
| playwright-report | Contains Playwright test reports |
| public | Contains public files such as images and icons |
| src  | Contains source code for the project |
| src/utils | Contains common functions that are used across the app and do not interact with the network (no fetch calls). |
| src/components  | Contains all our components that may or may not be used on separate pages of the app. None of these components should be included in our router config, that is for pages. |
| src/services  | Contains functions that interact with the network and / or store local state. Think of these as “controllers” in an Angular project. |
| src/pages | Contains components that act as the pages of our app. |
| styles | Contains CSS (Cascading Style Sheets) stylesheets for the project that are used across the project. These are for global styles that affect the entire app |
| tests | Contains test files for the project |
| utils | Contains utility files for the project |
| workers | Contains service worker files for the project |

| Files | Description |
| --- | --- |
|README.md   | Documentation file |
| rollup.config.js   | Bundler configuration file |
| tsconfig.json   | TypeScript configuration file |
| pwabuilder-sw.js   | Service worker file |
| package.json   | Node.js package configuration file |
| package-lock.json   | Node.js package lock file |
|   manifest.json | Web app manifest file |
| index.prod.html | Production index.html file |
| index.html | Development index.html file |


