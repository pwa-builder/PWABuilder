# Create a New PWA
Creating a new progressive web app with PWA Studio is easy: the extension has a built in command to clone the [PWA Starter template.]()
The PWA Starter is a lightweight, fast, extensible template that allows you to get your progressive web app off the ground right away. 
Combined with the extension, it's perfect for someone to looking to build their first PWA.

There are two ways to start a new PWA using the extension, both of which will clone the starter, install all dependencies, and open your project in a new Code window.


## Using the Interface
To start a new PWA using the PWA Studio interface:
1. Tap on the PWA Studio icon on the left side of the VSCode Window
   
2. Click the `Start new PWA` button on the bottom bar of VSCode.
   
3. Enter a repository name and hit enter.
   
4. Choose a location for your repository to live.
   
5. Your PWA repository will open in Visual Studio Code, with all the dependencies installed and ready to start coding.

<div class="docs-image">
    <img src="/assets/studio/create-new/command-bar-startnew.png" width=800/>
</div>


## With a Command
You can also start a new PWA with a command. To do this:

1. In a Code Window, hit `ctrl-shift-P` to open the command prompt.
   
2. Search for "New PWA" in the command window
   
3. Select `PWABuilder: New PWA`.
   
4. Enter a repoitory name and hit enter.
   
5. Choose a location for your repository to live.
   
6. Your PWA repository will open in Visual Studio Code, with all the dependencies installed and ready to start coding.

<div class="docs-image">
    <img src="/assets/studio/create-new/new-pwa-cmd.png" width=600/>
</div>

## Next Steps

After generating your app, you are now ready to start coding! You can also hit `F5` in VS Code to run your PWA right after cloning. The PWA Starter will open in a standalone browser window as an installed app.
The extension initializes your app as a local git repository, but if you want to add it to GitHub, you'll need to associate it with an upstream repo.

You can learn more about the PWA Starter, how to develop on it, and the stack it uses at the  [PWA Starter documentation.](https://aka.ms/starter-docs)
There you can learn how to:

- Add pages to your PWA and manage routing
  
- Add web capabilities like notifications
  
- Work with your PWA's service worker
  