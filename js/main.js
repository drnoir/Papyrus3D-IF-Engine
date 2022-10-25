// main js

// global game vars
let config;
let chars;
let diag;
let textures;

// dialogueUI Elements
const scene = document.querySelector('a-scene')
const dialogueUI = document.getElementById("dialogueID");

loadData();

async function loadData(){
// game vars
   await loadConfig();
   await loadChars();
   await  loadDiag();
   await  populateScene();
   // testing dialogue UI population
   populateDiag(3)
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

    createSquareRoom();
}

// function to move to next scene
function nextScene(){

}

// function to clear scene
function clearScene(){

}

function populateDiag(passageID){
    let newPassage = diag.passage[passageID].text;
    let newCharName = diag.passage[passageID].char;
    dialogueUI.setAttribute('text', 'wrapCount:'+125);
    dialogueUI.setAttribute('text', 'width:'+3,2);
    dialogueUI.setAttribute('text', 'value:'+newCharName+'\n'+newPassage);
}

function populateChoiceUI(){

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

function createSquareRoom(){
    let wall1= document.createElement('a-box');
    let wall2= document.createElement('a-box');

    wall1.setAttribute('position', '0 2 10');
    wall1.setAttribute('rotation', '0 0 0');
    wall1.setAttribute('width', '20');
    wall1.setAttribute('height', '5');
    wall1.setAttribute('color', 'lightblue');

    wall2.setAttribute('position', '0 2 -10');
    wall2.setAttribute('rotation', '0 0 0');
    wall2.setAttribute('width', '20');
    wall2.setAttribute('height', '5');
    wall2.setAttribute('color', 'lightblue');

    scene.appendChild(wall1);
    scene.appendChild(wall2);
}