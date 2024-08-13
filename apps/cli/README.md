# PWABuilder CLI

The [PWABuilder](https://www.pwabuilder.com/) CLI allows you to create a new Progressive Web App from the command line.

## Installing

To install with npm:

`npm install -g @pwabuilder/cli`

The `-g` flag indicates a global installation and will allow you to use the CLI from any directory.

## Basic Usage

## create

The CLI's primary purpose to create new Progressive Web Apps. To create a new app, open a command line of your choice and run:

`pwa create`

This command will prompt you for a name, but you can skip prompting by providing a name:

`pwa create <app-name>`

### Using Templates

PWABuilder currently offers two different PWA templates:

* **default** - The original PWA Starter template. This template has [full documentation]() available and is our recommended choice.
* **basic** - A simplified version of the PWA Starter template. This template has fewer dependencies and is closer to VanillaJS than the default template.
* **whisper** - The original PWA Starter template set up to get you started with on-device AI. This adds [Fluent UI](https://learn.microsoft.com/en-us/fluent-ui/web-components/) and [Transformers.js](https://huggingface.co/docs/transformers.js/index) on top of the original Starter template.

You can specify a template with the `-t|--template` option:

`pwa create <app-name> -t=basic`

## start

When run from a valid PWA Starter directory, the start command will use Vite to host your PWA on a development server:

`pwa start`

You can pass arguments to vite with the `--viteArgs` options:

`pwa start --viteArgs="<argument string here>"`

See [Vite's Config Reference](https://vitejs.dev/config/) for more details.

## build

When run from a valid PWA Starter directory, the build command will use Vite to build and pack your app for production:

`pwa build`

You can pass arguments to Vite with the `--viteArgs` options:

`pwa build --viteArgs="<argument string here>"`

See [Vite's Config Reference](https://vitejs.dev/config/) for more details.

## Resources

* [PWABuilder Website](https://www.pwabuilder.com/)

* [Full PWABuilder Documentation](https://docs.pwabuilder.com/#/)

* [PWA Starter Documentation](https://docs.pwabuilder.com/#/starter/quick-start)