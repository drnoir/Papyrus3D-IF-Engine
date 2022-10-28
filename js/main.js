// main js
// global game vars
let config;
let chars;
let diag;
let textures;
let currentDiagID = 0;
let currentScene = 1;

// dialogueUI Elements
const scene = document.querySelector('a-scene');
const assets = document.querySelector('a-assets');
const dialogueUI = document.getElementById("dialogueID");
loadData();

async function loadData(){
// game vars
   await loadConfig();
   await loadChars();
   await loadDiag(1);
   await populateScene();
   await populateDiag(0)
   // testing dialogue.json UI population
   console.log(config, chars, diag);
}

async function loadConfig() {
    const res = await fetch('Game/config.json')
    config = await res.json();
}

async function loadChars() {
    const res = await fetch('Game/charecters.json')
    chars = await res.json();
}

async function loadDiag(sceneToLoad) {
    let fetchURL = 'Game/scenes/scene'+sceneToLoad+'/dialogue.json';
    const res = await fetch(fetchURL)
    diag = await res.json();
}


// populate scene function
function populateScene(){
    // add character info and model path
    for (let i = 0; i < chars.characters.length; i++) {
        let assetItem = document.createElement('a-asset-item');
        assetItem.setAttribute('id',chars.characters[i].id)
        assetItem.setAttribute('src',chars.characters[i].model)
        assets.appendChild(assetItem);

        // // add charecters to scene
        let modelRef = chars.characters[i].id;
        let modelID = '#'+modelRef;
        console.log(modelRef);
        let char = document.createElement('a-entity');
        char.setAttribute('name', chars.characters[i].name);
        char.setAttribute('gltf-model', modelID );
        char.setAttribute('position', '0 0 -5');
        char.setAttribute('scale', 1,1 ,1);
        scene.appendChild(char);
    }


    createSquareRoom();
}

// function to move to next scene
function nextScene(){
    if (diag.passage.length-1!==currentDiagID) {
        console.log(diag.passage.length-1, currentDiagID)
        currentDiagID++;
        populateDiag(currentDiagID)
    }
    else{
        // reset for now
        currentDiagID=0;
    }
}

// function to clear scene
function clearScene(){

}

function populateDiag(passageID){
    // add button test function
    addButton();
    let newPassage = diag.passage[passageID].text;
    let newCharName = diag.passage[passageID].char;
    currentDiagID = passageID;
    dialogueUI.setAttribute('text', 'wrapCount:'+125);
    dialogueUI.setAttribute('text', 'width:'+3,2);
    dialogueUI.setAttribute('text', 'value:'+newCharName+'\n'+newPassage);
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

function createSquareRoom(textureWall, textureFloor){
    let wall1= document.createElement('a-box');
    let wall2= document.createElement('a-box');
    let wallSide1= document.createElement('a-box');
    let wallSide2= document.createElement('a-box');
    let floor= document.createElement('a-plane');


    floor.setAttribute('position', '0 0 0');
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('width', '20');
    floor.setAttribute('height', '20');
    floor.setAttribute('material', 'src', '#grunge');

    wall1.setAttribute('position', '0 2 10');
    wall1.setAttribute('rotation', '0 0 0');
    wall1.setAttribute('width', '20');
    wall1.setAttribute('height', '5');
    wall1.setAttribute('color', 'white');
    wall1.setAttribute('material', 'src', '#brick');

    wall2.setAttribute('position', '0 2 -10');
    wall2.setAttribute('rotation', '0 0 0');
    wall2.setAttribute('width', '20');
    wall2.setAttribute('height', '5');
    wall2.setAttribute('color', 'white');
    wall2.setAttribute('material', 'src', '#brick');

    wallSide1.setAttribute('position', '9 2 0.5');
    wallSide1.setAttribute('rotation', '0 90 0');
    wallSide1.setAttribute('width', '20');
    wallSide1.setAttribute('height', '5');
    wallSide1.setAttribute('color', 'white');
    wallSide1.setAttribute('material', 'src', '#brick');

    wallSide2.setAttribute('position', '-9.5 2 0.4');
    wallSide2.setAttribute('rotation', '0 90 0');
    wallSide2.setAttribute('width', '20');
    wallSide2.setAttribute('height', '5');
    wallSide2.setAttribute('color', 'white');
    wallSide2.setAttribute('material', 'src', '#brick');

    scene.appendChild(floor);
    scene.appendChild(wall1);
    scene.appendChild(wall2);
    scene.appendChild(wallSide1);
    scene.appendChild(wallSide2);
}

// UI functions - functions and actions for UI
function populateChoiceUI(){

}

// show passagebtn relative to character model
function addButton() {
    // check if there is an existing button element firsst before adding a new one
    if(!document.getElementById('nextPassageBtn')) {
        let nextPassageBtn = document.createElement('a-box')
        nextPassageBtn.setAttribute('id', 'nextPassageBtn');
        nextPassageBtn.setAttribute('cursor-listener', '');
        nextPassageBtn.setAttribute('depth', '0.01');
        nextPassageBtn.setAttribute('height', '0.15');
        nextPassageBtn.setAttribute('width', '0.15');
        nextPassageBtn.setAttribute('material', 'color: red');
        nextPassageBtn.setAttribute('position', '0.2 1.6 0.1');
        // addtext
        let nextPassageBtnTxt = document.createElement('a-text');
        nextPassageBtnTxt.setAttribute('value', '>');
        nextPassageBtnTxt.setAttribute('height', '1');
        nextPassageBtnTxt.setAttribute('width', '3');
        nextPassageBtnTxt.setAttribute('position', '-0.05 0.015 0.1');
        nextPassageBtn.appendChild(nextPassageBtnTxt);

        let bobGuy = document.getElementById('bobGuy') // FOR TESTING PURPOSES - needs to be passed associated char
        bobGuy.appendChild(nextPassageBtn);

    }
    else{
        console.log('Opps something went wrong - There is already a passage btn on the scene')
    }
}

function removeButton() {
    const passageBtn = document.getElementById('nextPassageBtn');
    if (passageBtn !=null){
        bobGuy.removeChild(passageBtn);
    }
}
export {nextScene};