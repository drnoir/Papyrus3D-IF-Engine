// main js
// import {loadData} from './loader.js';

// global game vars
let config;
let chars;
let diag;
let textures;

loadData();

async function loadData(){
// game vars
   await loadConfig();
   await loadChars();
   await  loadDiag();
   await  populateScene();
   console.log(typeof  config, chars, diag);
}

async function loadConfig() {
    const res = await fetch('Game/config.json')
    config = await res.json();
}

async function loadChars() {
    const res = await fetch('Game/charecters.json')
    chars = await res.json();
}

async function loadDiag() {
    const res = await fetch('Game/dialogue.json')
    diag = await res.json();
}

// populate scene function
function populateScene(){
    // load assets
    let scene = document.querySelector('a-scene')
    let assets = document.createElement('a-assets');
    scene.appendChild(assets);
    // add character info and model path
    for (let i = 0; i < chars.characters.length; i++) {
        let assetItem = document.createElement('a-asset-item');
        assetItem.setAttribute('id',chars.characters[i].id)
        assetItem.setAttribute('src',chars.characters[i].model)
        assets.appendChild(assetItem);

        // // add charecters to scene
        let modelRef = '#'+chars.characters[i].id;
        console.log(modelRef);
        let char = document.createElement('a-entity');
        char.setAttribute('name', chars.characters[i].name);
        char.setAttribute('gltf-model', modelRef);
        char.setAttribute('position', '0 0 -5');
        char.setAttribute('scale', 1,1 ,1);
        scene.appendChild(char);
    }
}

// function to move to next scene
function nextScene(){

}

// function to clear scene
function clearScene(){

}

// create room function
function createRoom(roomType, roomWidth, roomHeight, roomDepth){
    let roomArea = roomWidth * roomDepth;
    switch(roomType) {
        case 'indoor':
            // code block
            break;
        case 'outdoor':
            // code block
            break;
        default:
        // code block
    }
}