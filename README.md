## Papyrus 3D - Interactive Fiction Engine by Chris Godber
#### GNU GENERAL PUBLIC LICENSE
##### Current Version: 0.1.4
![alt text](https://raw.githubusercontent.com/drnoir/Papyrus3D-IF-Engine/main/Papyrus3D.jpg)

### SIMPLE OPEN SOURCE WebGL GAME ENGINE / FRAMEWORK FOR VR / AR / Web (Pre-Alpha 0.1.2)
Open source game engine for generating 3D FIrst Person Interactive Fiction games based on JSON configs powered by A-Frame.

Edit the json files in the public folder and then use the preview and export buttons to export your game.

Allows for customisation and export of games as a separate html / javascript bundle or an exe. Incudes a demo game for guidance (Vault Tech).

Multi-Platform support - Desktop, Mobile, VR / AR.

Game build in the public folder. Currently, a test game but will be replaced with a generic template you can build on (Vault Tech). Soon there will be a demos folder for example games once Alpha is ready for release.

### A note on GNU licensing / Licensing for any games built with  Papyrus3D
All the code for this project is released under a GNU3 licence, and you can read the full licence for the software in the licence file. You are free to charge for or distrubute any games you make with the Papyrus3D framework however you want but the source code of anything you release will also be GNU3. It does not allow for you to download the engine code, claim is as your own and start charging for it. Any code that is based upon the source code MUST be released under GNU3 with the same conditions. This project is already built upon A-Frame which is itself an open source project.

### Donating to the Papyrus3D project
If you appriciate the work I have put into this project for free and want to donate to it. Please donate via https://www.buymeacoffee.com/noirnerd or sponser the project on GitHub. This is a work of passion and for my own self learning but to maintain it long term and to ensure its long term maintenance it helps to get donations from people. All the source code for this project is released to the public for free and with GNU 3 licence which you can find out more about here at https://www.gnu.org/licenses/gpl-3.0.en.html

### Features
* Component system for character loading and enemy loading
* Map Editor - basic map editor for easy creation of scenes - /Tools/MapEditor/
* Random map generation - Proceudral maps with randomPapyrus.js  - /Tools/randomMapGenerator/
* Define 3D Scenes with character components and assets
* Create unique repayable games that the engine can generate based on easily editable JSON templates
* Load assets into template (index.html in public)
* Customise scenes with different colours textures, background elements etc
* Gaze based movement system ensuring maximum multi platform support
* Dialogue system for multiple chars
* Color keys and unlockable doors
* interactive objects
* torch  lighting
* Build web version as an EXE with electron for desktop distrubution 

### Future planned FEATURES
* Trigger events on choices / interactions (choices to come soon)
* Basic enemy AI and Attack system (Optional) WIP
* Posters for walls with custom textures
* More custom textures / material options

Please leave feature requests if you are interested in the project.  

### Current Tech Stack / dependencies
* Rendering / 3D - A-Frame + a-frame component libraries 
* Electron for generating builds
* Node / NPM - mostly for handling local testing and builds.

## Local Setup Instructions 
Clone the repo and install via node. 

The following are instructions for setting up Papyrus3D for local development. Make sure you have node installed and npm for package management
check node version with 

> node -v 

## Install Packages 
> npm install 

to install required packages in the root directory for building from /public

## Local testing
open shell and generate key. This generates a key for ssl for a year. To regenerate run the command again. 
> openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

## Run Local dev server
> npm run dev

to boot up local server for testing with pacakge http-server

# Trigger builds
> npm run dist

To create a distribution build with electron (Windows, Linux, Mobile App (Android / Apple))
Not fully tested for all build types yet. Build is of the public folder with entry point index.html (The entry point for your game)

# screen grabs of current version
![alt text](https://github.com/drnoir/Papyrus3D-IF-Engine/blob/main/screengrab.png?raw=true)
![alt text](https://github.com/drnoir/Papyrus3D-IF-Engine/blob/main/screengrab2.png?raw=true)
![alt text](https://github.com/drnoir/Papyrus3D-IF-Engine/blob/main/screengrab3.png?raw=true)
![alt text](https://github.com/drnoir/Papyrus3D-IF-Engine/blob/main/screengrab4.png?raw=true)

## Documentation (WIP) 
(Will be added when Engine is in Alpha. I will also produce a series of video tutorials)

* Creating Your Story
* Adding characters and editing story config
* Customizing UI 
* Creating Player Choices
* Map Creator
* Exporting your project 
  - Web / VR
  - Desktop
  - Mobile

  ## Map Symbol Guide
* char + number - char ref to display numbered NPC Example "char1"
* 0 - floor
* 0 + any number - custom height wall
* 0 + any number+T - Wall trigger (Triggers interaction)
* 1 - Full height wall
* 2 - 1/2 height wall
* 3 - 1/3 height wall
* 4 - door
* 5 - exit door
* X - Exit door (Ends game / triggers end of game scene)
* 6 - Water
* 7 + Options - Custom prefabs Example : 71T6 7:type prefav 1 number prefab T trigger flag 6 number dialog to trigger
* 9 - Enemies 
* P - Playerstart
* t - light (t is for 'torch' and its referenced in papyrus as torch)
* KB - Key and then Blue for blue, y for tellow , R for red, G for Green
* 4LB - Locked door and key color