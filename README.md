## Papyrus 3D - Interactive Fiction Engine by Chris Godber
#### GNU GENERAL PUBLIC LICENSE
##### Current Version: 0.1.1
![alt text](https://raw.githubusercontent.com/drnoir/Papyrus3D-IF-Engine/main/Papyrus3D.jpg)

### SIMPLE OPEN SOURCE WebGL GAME ENGINE / FRAMEWORK FOR VR / AR / Web
Open source game engine for generating 3D FIrst Person Interactive Fiction games based on JSON configs.
Edit the json files in the public folder and then use the preview and export buttons to export your game.
Allow for customisation and export of games as a separate html / javascript bundle or an exe.

Multi-Platform support - Desktop, Mobile, VR / AR.

### Features
* Component system for character loading in enemeies 
* Map Editor WIP- basic map editor for easy creation of scenes
* Define 3D Scenes with character components and assets
* Create unique repayable games that the engine can generate based on easily editable JSON files
* Customise scenes with different colours textures, background elements etc
* melee combat system

### Possible future Features
* torch / advanced lighting 

### Current Tech Stack / dependencies
* Rendering / 3D - A-Frame + a-frame component libraries 
* Electron for generating builds

## Local testing
open shell and generate key 
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

## Run Local dev server
npm run dev
to boot up local server for testing 

# Trigger builds
npm run dist

## Documentation (WIP) 
(Will be added when Engine is in BETA)
* Creating Your Story
* Adding characters and editing story config
* Customizing UI 
* Creating Player Choices
* Map Creatopm
* Exporting your project 
  - Web / VR
  - Desktop
  - Mobile