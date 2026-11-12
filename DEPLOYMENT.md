# Deploying PWABuilder

This guide covers deploying the PWABuilder web app, Google Play platform, and
Microsoft Store platform. GitHub Actions deploys pull request previews and
staging updates automatically; promoting staging to production requires a
manual Azure deployment slot swap.

## 1. Submit a pull request

Submit a PR targeting `main` from a branch in this repository. GitHub Actions
automatically creates a deployment slot for each affected service. Once the
deployment is ready, it updates the PR description with links to the deployment
slots where you can test your changes.

Fork PRs do not receive deployment slots. PR slots are for testing only;
**never swap a PR slot into production**.

## 2. Get approval and merge

Get the PR approved, then merge it into `main`. GitHub Actions automatically
deploys the changed services to their shared staging environments:

| Service | Staging environment | Azure slot |
| --- | --- | --- |
| PWABuilder web app | [preview.pwabuilder.com](https://preview.pwabuilder.com) | `preview` |
| Google Play platform | [pwabuilder-cloudapk-staging.azurewebsites.net](https://pwabuilder-cloudapk-staging.azurewebsites.net) | `staging` |
| Microsoft Store platform | [pwabuilder-windows-docker-staging.azurewebsites.net](https://pwabuilder-windows-docker-staging.azurewebsites.net) | `staging` |

Wait for the relevant GitHub Actions deployments to finish successfully before
testing staging.

## 3. Test in staging

Test your changes in the staging environments listed above. Verify the affected
user flows, including app packaging when applicable.

Staging slots are shared and can be updated by subsequent merges. Before
promoting, confirm the slot still contains the version you tested. Coordinate
releases when breaking changes affect both the web app and a packaging service.

## 4. Elevate your Azure role

Open [Azure Privileged Identity Management](https://ms.portal.azure.com/?feature.msaljs=true#view/Microsoft_Azure_PIMCommon/ActivationMenuBlade/~/azurerbac/provider/azurerbac)
and activate your **Contributor** role for the **PWA Builder** subscription.
Wait until activation is complete before proceeding.

## 5. Swap to production

Open the Azure web app for the service you are deploying:

- [pwabuilder](https://ms.portal.azure.com/#resource/subscriptions/fd642677-2fa9-4d8a-8b25-788656871b24/resourceGroups/pwabuilder-prod/providers/Microsoft.Web/sites/pwabuilder), the web app running on pwabuilder.com
- [pwabuilder-cloudapk](https://ms.portal.azure.com/#resource/subscriptions/fd642677-2fa9-4d8a-8b25-788656871b24/resourceGroups/pwabuilder-prod/providers/Microsoft.Web/sites/pwabuilder-cloudapk), the web app that packages PWAs for the Google Play Store
- [pwabuilder-windows-docker](https://ms.portal.azure.com/#resource/subscriptions/fd642677-2fa9-4d8a-8b25-788656871b24/resourceGroups/pwabuilder-prod/providers/Microsoft.Web/sites/pwabuilder-windows-docker), the web app that packages PWAs for the Microsoft Store

Go to **Deployments** and click **Swap**. Select the tested staging slot as the
source (`preview` for the web app, `staging` for either platform) and
**production** as the target. Review the swap details, then confirm the swap.
Repeat for each service being released.

After the swap completes, verify the affected flows in production.

For deployment workflow internals and PR slot configuration, see the
[README deployment section](README.md#deployment).
