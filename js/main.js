// main js
// global game vars
let config;
let chars;
let diag;
let textures;
let currentDiagID = 0;
let currentScene = 1;
let currentChar;
let mapSource = 0;

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
   await loadMap(1);
   await createRooms();
   // await populateScene();
   // await populateDiag(0)
   // testing dialogue.json UI population
   console.log(config, chars, diag, mapSource);
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

async function loadMap(mapToLoad) {
    let fetchURL = 'Game/scenes/scene'+mapToLoad+'/map.json';
    const res = await fetch(fetchURL)
    mapSource= await res.json();
}


// populate scene function
function populateScene(){
    // add character info and model path
    for (let i = 0; i < chars.characters.length; i++) {
        let assetItem = document.createElement('a-asset-item');
        assetItem.setAttribute('id',chars.characters[i].id);
        assetItem.setAttribute('src',chars.characters[i].model);
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


    // createSquareRoom();

    createRooms();
}

// function to move to next scene
function nextScene(){
    if (diag.passage.length-1!==currentDiagID) {
        currentChar = diag.passage[currentDiagID].char;
        console.log(diag.passage.length-1, currentDiagID)
        currentDiagID++;
        populateDiag(currentDiagID);
        makeCharActive(currentChar);
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

// make glow component show on specified char indicating char speaking
function makeCharActive(charID) {
    const charRef = document.getElementById(charID);
    if (charRef.getAttribute('glowFX','visible:false;')) {
        charRef.setAttribute('glowFX', 'visible:true;');
    }
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

function createRooms() {
    const mapData = mapSource.data;
    console.log(mapData, mapSource.height)
    const WALL_SIZE = 4;
    const WALL_HEIGHT = 12;
    const el = document.getElementById('room')
    // let playerPos;
    let wall;
    let floor = document.createElement('a-plane');
    let floorArea = (mapSource.width*mapSource.height);
    floor.setAttribute('width', floorArea*2);
    floor.setAttribute('height', floorArea*2);
    floor.setAttribute('rotation', '-90 0 0');
    floor.setAttribute('position', '0 -4 0');
    floor.setAttribute('scale', '0.2 0.2 0.2');
    floor.setAttribute('material', 'src: #grunge; repeat: 1 2');
    el.appendChild(floor);

    let ceil = document.createElement('a-box');
    let ceilArea = (mapSource.width*mapSource.height);
    ceil.setAttribute('width', ceilArea*2);
    ceil.setAttribute('height', ceilArea*2);
    ceil.setAttribute('rotation', '-90 0 0');
    ceil.setAttribute('position', '0 6 0');
    ceil.setAttribute('scale', '0.2 0.2 0.2');
    ceil.setAttribute('material', 'src: #grunge; repeat: 1 2');
    el.appendChild(ceil);

    for (var x = 0; x <  mapSource.height; x++) {
        for (var y = 0; y < mapSource.width; y++) {

            const i = (y * mapSource.width) + x;
            const position = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 1.5 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;

            // if the number is 1 - 4, create a wall
            if (mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                console.log(el, wall)
                el.appendChild(wall);

                // black wall
                if (mapData[i] === 2) {
                    wall.setAttribute('color', '#000');
                    wall.setAttribute('static-body', '');
                }
                // secretwall
                else if (mapData[i] === 3) {
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick;; repeat: 1 20');
                }
                // brick wall
                else if (mapData[i] === 4) {
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick; repeat: 20 20');
                    wall.setAttribute('static-body', '');
                } else { // normal walls
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick; repeat: 0.2 0.25');
                    wall.setAttribute('static-body', '');
                }
            }
            // set player position if the number is a 2
            // if (mapData === 8) {
            //     playerPos = position;
            // }
            // if (mapData === 9) {
            //     console.log(position);
            // }
        }
    }
    // document.querySelector('#player').setAttribute('position', playerPos);
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