# Using the PWABuilder CLI

The PWABuilder allows you to create new progressive web app(PWA) projects from a template in just a few seconds. This article has more in-depth coverage on usage of the CLI. If you want to get started quickly with the PWA Starter, check out the [Quick Start.](/starter/quick-start)

## create

The `create` command allows you to create a new progressive web app project from one of our templates.

#### Basic usage

```
pwa create <pwa-name>
```

If you don't pass a name argument, this command will prompt you to enter one. The name you enter for your app will be used throughout the template.

#### Pass a name as an argument

If you want to skip prompting, you can pass the name argument directly to the command like so:

```
pwa create <app-name>
```

This will directly create your application directory without prompting for a username.

#### Specify a template

By default, the `create` command will fetch the default version of the PWA Starter. However, if you want to specify a different template, you can use the `-t` or `--template` flag.

To specify a template:

```
pwa create <app-name> -t [default | basic]
```

As of right now, the CLI has two available templates: `default` and `basic`.

The `default` template is the classic version of the PWA Starter, with all included dependencies.

The `basic` template is a new template that has fewer dependencies and is closer to VanillaJS than the original PWA Starter template.

!> The default template is our recommended choice of template, and has complete documentation available for developing on it.

## start

The `start` command allows you to start your PWA on a local development server for testing and debugging. The PWA Starter uses [Vite](https://vitejs.dev/) for its development server and build processes.

#### Basic usage

To deploy your PWA locally, run this command from the root of your project:

```
pwa start
```

By default, this will open your PWA in a new browser window.

#### Passing custom arguments to Vite

You can also pass custom arguments to Vite when you launch the development server using the `--viteArgs` flag.

Anything passed in the `viteArgs` string will be passed directly to Vite:

```
pwa start --viteArgs="Custom Args String"
```

Using custom args will not open your PWA in the browser by default, pass the `--open` arg to Vite if you want this behavior.

To learn more about what you can do with Vite, check out [their documentation](https://vitejs.dev/config/server-options.html)

## build

The build command builds your application for deployment using TSC and Vite. As of right now, there's no custom behavior for this command besides running the basic command.

#### Basic usage

To build your app with the CLI, run this command from the root of your project:

```
pwa build
```

The build command outputs a transpiled and server-ready version of your application to the `dist` directory. You can use this command once you are ready to deploy your PWA to a production server.