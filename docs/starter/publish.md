# Publishing Your PWA

Once you've develop your PWA using the starter, it's time to publish your application to the web. 
This not only makes your PWA available through the browser, but also allows you to package your application for different app stores with <a href=#/builder/quick-start>PWABuilder.</a>

Here are some select ways to publish your PWA quickly and easily, but there are plenty of other options available.

## Azure Static Web Apps

Azure Static Web apps are a great option for deploying your PWA, and can be set up in just minutes using the Azure command line tool.

You can download the Azure CLI <a href="https://docs.microsoft.com/en-us/cli/azure/install-azure-cli">here.</a>

#### Prerequisites:

Some things you'll need before we get started:

* Installed Azure CLI
  
* PWA source repository hosted on GitHub
  
* <a href="https://azure.microsoft.com/en-us/free"> Free Azure account </a>

#### Step by Step

1. Use this command to log in to Azure with the CLI. It will redirect you to the browser to authenticate.

```bash
az login
```

2. Create a resource group with this command.

```bash
az group create --name my-swa-group --location "eastus2"
```

3. For this next step, you will need your GitHub repository URL. Replace the `name`, `app-location` and `source` arguments and run this command

```bash
az staticwebapp create \
    --name <name of your PWA> \
    --resource-group my-swa-group \
    --source <URL to your Github repository> \
    --location "eastus2" \
    --branch main \
    --app-location "<path to your PWA's root>" \
    --login-with-github
```

?> **Note** The `app-location` argument is the root directory of your PWA in the repository. If your PWA lives at the top level of your repo, just use `/`.

4. You will be prompted in the command line to authorize GitHub, follow the link and enter the provided code.

5. Run a query command to find your PWA's URL.

```
az staticwebapp show --name random-pwa --query "defaultHostname"
```

6. That's it, your PWA can be found at that URL. If your static web app didn't deploy properly, check out the `Actions` tab on your GitHub repository for possible errors.

#### Next Steps

You can trigger a new deployment of your PWA by commiting to the branch that your GitHub Action is associated with. Check the `Actions` tab for status of recent deployments.

If you want to learn more about Azure Static Web Apps, check out the <a href="https://docs.microsoft.com/en-us/azure/static-web-apps/"> documentation. </a>