# Publishing Your PWA

Once you've developed your PWA using the starter, it's time to publish your application to the web. 
This not only makes your PWA available through the browser, but also allows you to package your application for different app stores with [PWABuilder.](/builder/quick-start)

For now, we only have guidance for publishing with Azure Static Web Apps and GitHub Pages, but will be adding additional routes in the future.

!> This guidance is intended for progressive web apps built with the PWA Starter. These steps might need to be altered slightly for PWAs built from other templates or tech stacks.

## Azure Static Web Apps

One option for deploying your PWA is Azure Static Web Apps, and can be set up in just minutes using the Azure Static Web Apps command line tool.

The Azure Static Web Apps CLI is included in the PWA Starter's Node dependencies, and will be installed when you run `npm install`.

You can check out the Azure SWA CLI website [here.](https://azure.github.io/static-web-apps-cli/)

### Prerequisites:

What you'll need before we get started:
  
* [Free Azure account](https://azure.microsoft.com/en-us/free)

### Step By Step

To deploy the PWA Starter as an Azure static web app:

1. Install dependencies with npm:
```
npm install
```

2. The Starter comes with a deploy script that will trigger the static web app CLI. Run this command:
```
npm run deploy
```
3. Log in to your Azure account when prompted.

4. When asked, ensure you use the default settings for your app, which can be found in the `swa-cli.config.json` file in the root of your app.

5. And thats it, finish following the prompts from the Azure Static Web Apps CLI and your app will be deployed to Azure.

### Next Steps

To learn more about the SWA CLI, check out their documentation [here.](https://azure.github.io/static-web-apps-cli/)

If you want some more general guidance on Azure Static Web Apps, more information can be found [here.](https://docs.microsoft.com/en-us/azure/static-web-apps/)

## Github Pages

!> Github Pages support is not currently working on the latest versions of the template. We are taking a look at what happened and will find a fix as soon as possible. Feel free to follow these steps if you would like to give it a try yourself, but it may result in a buggy deploy experience.

Another quick and easy option for deploying your PWA is Github Pages. 

The Starter has a built in Workflow that will build your PWA for GitHub Pages entirely on the cloud, no pushing or pulling to the repo is necessary.

### Prerequisites

Some things you’ll need before we get started:

- Github account

- Personal version of the PWA Starter hosted on Github

### Enabling Github Pages

In order to use Github Pages, it has to be enabled for your repository:

1. Navigate to your repository's `Settings` tab.

2. Go to `Pages`.

3. Under `Build and Deployment`, set `Source` to `Github Actions` and you're good to go!

<div class="docs-image">
   <img src="/assets/starter/publishing/enable-pages.png" alt="Image showing how to enable GitHub pages in repository settings.">
</div>

### Deploying to GitHub Pages

Once you've enabled Pages, you just need to run the GitHub action that deploys the Starter to your static GitHub site:

1. Go to your PWA's repository on GitHub.

2. Click the `Actions` tab.

3. Under `Workflows`, select `Deploy PWA Starter to GitHub Pages`.

4. Click `Run Workflow`

5. Wait for your build and deploy steps to complete. This should only take 1-2 minutes.

<div class="docs-image">
     <img src="/assets/starter/publishing/pages-build.png" alt="Image showing how to start the GitHub Pages action on your repository." width=650>
</div>

6. After your PWA has been successfully deployed, you will be able to find your app at the URL formatted like this: `https://[GITHUB USERNAME].github.io/[REPOSITORY NAME]/`

That's it! Your progressive web app is now deployed to GitHub pages.

### Next Steps

You can trigger a new deployment by repeating the steps done in the ***Building for Deployment*** subsection.

If you want to set up automatic deployments, navigate to your `.github/workflows/main.yml` file and add this snippet on line 5:

```yml
push:
  branches:
    - main
```

This enables the *push* trigger for your workflow. Anytime you push to main, the workflow will be triggered.