# Publishing Your PWA

Once you've developed your PWA using the starter, it's time to publish your application to the web. 
This not only makes your PWA available through the browser, but also allows you to package your application for different app stores with <a href=#/builder/quick-start>PWABuilder.</a>

For now, we only have guidance for publishing with Azure Static Web Apps and GitHub Pages, but will be adding additional routes in the future.

!> This guidance is intended for progressive web apps built with the PWA Starter. These steps might need to be altered slightly for PWAs built from other templates or tech stacks.

## Azure Static Web Apps

One option for deploying your PWA is Azure Static Web Apps, and can be set up in just minutes using the Azure Static Web Apps command line tool.

The Azure Staic Web Apps CLI is included in the PWA Starter's Node dependencies, and will be installed when you run `npm install`.

You can check out the Azure SWA CLI website [here.](https://azure.github.io/static-web-apps-cli/)

#### Prerequisites:

What you'll need before we get started:
  
* <a href="https://azure.microsoft.com/en-us/free"> Free Azure account </a>

#### Step By Step

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

#### Next Steps

To learn more about the SWA CLI, check out their documentation [here.](https://azure.github.io/static-web-apps-cli/)

If you want some more general guidance on Azure Static Web Apps, more information can be found [here.](https://docs.microsoft.com/en-us/azure/static-web-apps/)

## Github Pages

!> Built-in support for Github Pages was added to the Starter in June 2022. If you cloned the starter template before then, deploying to GitHub pages may not work by default.

Another quick and easy option for deploying your PWA is Github Pages. 

The Starter has a built in Workflow that will build your PWA for GitHub Pages entirely on the cloud, no pushing or pulling to the repo is necessary.

#### Prerequisites

Some things you’ll need before we get started:

- Github account

- Personal version of the PWA Starter hosted on Github

#### Building For Deployment

First, let's bundle and build your PWA for deployment:

1. Go to your PWA's repository on GitHub.

2. Click the `Actions` tab.

3. Under `Workflows`, select `Deploy PWA Starter to GitHub Pages`.

4. Click `Run Workflow`

5. Wait for your build to complete. This should only take 1-2 minutes.

<div class="docs-image">
     <img src="/assets/starter/publishing/pages-build.png" alt="Image showing how to start the GitHub Pages action on your repository." width=650>
</div>

#### Enabling GitHub Pages

Once you have run the workflow, you can enable GitHub pages to display your site:

1. Go to the `Settings` tab in your PWA's repository.

2. Navigate to the `Pages` subsection.

3. Under `Source`, select `gh-pages` as your branch and `/ (root)` as your directory.

4. Click `Save`.
   
5. Your PWA will deploy to your personal Pages site!

<div class="docs-image">
     <img src="/assets/starter/publishing/enable-pages.png" alt="Image showing how to enable GitHub Pages on your repository." width=650>
</div>

#### Next Steps

You can trigger a new deployment by repeating the steps done in the ***Building for Deployment*** subsection.

If you want to set up automatic deployments, navigate to your `.github/workflows/main.yml` file and add this snippet on line 5:

```yml
push:
  branches:
    - main
```

This enables the *push* trigger for your workflow. Anytime you push to main, the workflow will be triggered.