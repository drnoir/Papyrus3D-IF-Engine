// main js
// global game vars
let config;
let chars;
let diag;
let sceneMetadata;
let textures;
let currentDiagID = 0;
let currentScene = 1;
let currentChar = 0;
let mapSource = 0;


// dialogueUI Elements
const scene = document.querySelector('a-scene');
const assets = document.querySelector('a-assets');
const dialogueUI = document.getElementById("dialogueID");
loadData();


async function loadData() {
// game vars
    await loadConfig();
    await loadChars();
    await loadDiag(1);
    await loadMap(1);
    await loadSceneMetaData(1);
    await createRooms();
    // await populateScene();
    await populateDiag(0)
    // testing dialogue.json UI population
    console.log(config, chars, diag, mapSource);
}

async function loadConfig() {
    const res = await fetch('config.json')
    config = await res.json();
}

async function loadChars() {
    const res = await fetch('charecters.json')
    chars = await res.json();
}

async function loadDiag(sceneToLoad) {
    let fetchURL = 'scenes/scene' + sceneToLoad + '/dialogue.json';
    const res = await fetch(fetchURL)
    diag = await res.json();
}

async function loadMap(mapToLoad) {
    let fetchURL = 'scenes/scene' + mapToLoad + '/map.json';
    const res = await fetch(fetchURL)
    mapSource = await res.json();
}

async function loadSceneMetaData(metaDataToLoad) {
    let fetchURL = 'scenes/scene' + metaDataToLoad + '/scene.json';
    const res = await fetch(fetchURL)
    sceneMetadata = await res.json();
}


// populate scene function
function populateScene() {
    // add character info and model path
    for (let i = 0; i < chars.characters.length; i++) {
        let assetItem = document.createElement('a-asset-item');
        assetItem.setAttribute('id', chars.characters[i].id);
        assetItem.setAttribute('src', chars.characters[i].model);
        assets.appendChild(assetItem);

        // // add charecters to scene
        let modelRef = chars.characters[i].id;
        let modelID = '#' + modelRef;
        console.log(modelRef);
        let char = document.createElement('a-entity');
        char.setAttribute('name', chars.characters[i].name);
        char.setAttribute('gltf-model', modelID);
        char.setAttribute('position', '0 0 -5');
        char.setAttribute('scale', 1, 1, 1);
        scene.appendChild(char);
    }
    // createSquareRoom();
}

function addChar(charID) {
    console.log(chars.characters[charID].id, chars.characters[charID].name);
    let modelRef = chars.characters[charID].id;
    let modelID = '#' + modelRef;
    console.log(modelRef);
    let char = document.createElement('a-entity');
    char.setAttribute('id', chars.characters[charID].name);
    char.setAttribute('name', chars.characters[charID].name);
    char.setAttribute('gltf-model', modelID);
    // char.setAttribute(' glowfx', "color:red;");
    // char.setAttribute('position', '0 -5 -5');
    char.setAttribute('scale', "3 3 3");
    char.setAttribute('animation-mixer', "clip: *; loop: repeat;");
    return char;
}

// NEEDS FIX FOR POSITIONING LATER
function addTorch(torchColor, torchIndex) {
    let torch = document.createElement('a-box');
    torch.setAttribute('id', torch+[torchIndex]);
    let fire = document.createElement('a-entity');
    fire.setAttribute('light', 'type: point; intensity: 0.75; distance: 50; decay: 2');
    fire.setAttribute('color'+torchColor);
    torch.appendChild(fire);
    return torch;
}

// function to move to next scene
function nextScene() {
    if (diag.passage.length - 1 !== currentDiagID) {
        currentChar = diag.passage[currentDiagID].char;
        console.log(diag.passage.length - 1, currentDiagID, currentChar)
        currentDiagID++;
        populateDiag(currentDiagID, currentChar);
        makeCharActive(currentChar);
    } else {
        // reset for now
        currentDiagID = 0;
    }
}

// function to clear scene
function clearScene() {

}

function populateDiag(passageID, currentChar) {
    // add button test function
    addButton(currentChar);
    let newPassage = diag.passage[passageID].text;
    let newCharName = diag.passage[passageID].char;
    currentDiagID = passageID;
    dialogueUI.setAttribute('text', 'wrapCount:' + 125);
    dialogueUI.setAttribute('text', 'width:' + 3, 2);
    dialogueUI.setAttribute('text', 'value:' + newCharName + '\n' + newPassage);
}

// make glow component show on specified char indicating char speaking
function makeCharActive(charID) {
    const charRef = document.getElementById(charID);
    if (charRef.getAttribute('glowfx', 'visible:false;')) {
        charRef.setAttribute('glowfx', 'visible:true;');
    }
}

// create room function
function createRoom(roomType, roomWidth, roomHeight, roomDepth) {
    let roomArea = roomWidth * roomDepth;
    switch (roomType) {
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

function createRooms() {
    const mapData = mapSource.data;
    console.log(mapData, mapSource.height);
    let roomType = sceneMetadata.roomtype;
    // char info
    const chars = mapSource.chars;
    const charNum = mapSource.charnumber;
    let charLoopIndex = 0;

    const WALL_SIZE = 5;
    const WALL_HEIGHT = 15;
    const el = document.getElementById('room')
    // let playerPos;
    let wall;

    if (roomType === "Indoor") {

        let floor = document.createElement('a-plane');
        let floorArea = (mapSource.width * mapSource.height);
        floor.setAttribute('width', floorArea * 2);
        floor.setAttribute('height', floorArea * 2);
        floor.setAttribute('rotation', '-90 0 0');
        floor.setAttribute('position', '0 -4 0');
        floor.setAttribute('scale', '0.2 0.2 0.2');
        floor.setAttribute('material', 'src: #grunge; repeat: 1 2');
        el.appendChild(floor);

        let ceil = document.createElement('a-box');
        let ceilArea = (mapSource.width * mapSource.height);
        ceil.setAttribute('width', ceilArea * 2);
        ceil.setAttribute('height', ceilArea * 2);
        ceil.setAttribute('rotation', '-90 0 0');
        ceil.setAttribute('position', '0 6 0');
        ceil.setAttribute('scale', '0.2 0.2 0.2');
        ceil.setAttribute('material', 'src: #grunge; repeat: 1 2');
        el.appendChild(ceil);
    }

    for (var x = 0; x < mapSource.height; x++) {
        for (var y = 0; y < mapSource.width; y++) {

            const i = (y * mapSource.width) + x;
            const position = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 1.5 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const halfYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} -3 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const charPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} -4 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const torchPosition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 2.5 ${(y - (mapSource.height / 2))  * WALL_SIZE /1.2}`;
            // console.log(mapData[i].charAt(0));
            // char
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c"&& mapData[i].charAt(1) === "h") {
                console.log("its a char!")
                let char = addChar(charLoopIndex);
                console.log('char ran and char is' + char)
                char.setAttribute('position', charPos);
                el.appendChild(char);
                charLoopIndex++;
            }
            // add torch / light
            else if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "t") {
                console.log("its a torch!")
                let torch = addTorch('yellow', i);
                console.log('torch ran and char is' + torch)
                torch.setAttribute('position', torchPosition);
                torch.setAttribute('position', torchPosition);
                el.appendChild(torch);
            }

            // add   cam - UPDATE CONDITIONAL THIS IS TERRIBLE JSUT KEEPING IT FOR TESTING
            else if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c"&& mapData[i].charAt(1) === "a") {
                const camPoint = document.createElement('a-entity');
                camPoint.setAttribute('id', 'cam' + [i]);
                camPoint.setAttribute('position', position);
                const camPointDebug = document.createElement('a-box');
                camPointDebug.setAttribute('visible', false)
                el.appendChild(camPoint);
            }

            // if the number is 1 - 4, create a wall
            if (mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                console.log(el, wall)
                el.appendChild(wall);

                // 1/2 wall
                if (mapData[i] === 2) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT / 2);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', halfYposition);
                }
                // door
                else if (mapData[i] === 3) {
                    const door = document.createElement('a-box');
                    door.setAttribute('id', door);
                    door.setAttribute('material', 'src: #door; repeat: 1 2');
                    // create component for door / lock
                    door.setAttribute('locked', 'false');
                } else { // normal walls
                    wall.setAttribute('color', '#fff');
                    wall.setAttribute('material', 'src: #brick; repeat: 1 1');
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
function populateChoiceUI() {

}

// show passagebtn relative to character model
function addButton(activeChar) {
    console.log('charID passed' + activeChar);
    // check if there is an existing button element firsst before adding a new one
    if (!document.getElementById('nextPassageBtn')) {
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
        let bobGuy = document.getElementById(activeChar) // FOR TESTING PURPOSES - needs to be passed associated char
        bobGuy.appendChild(nextPassageBtn);
    } else {
        console.log('Opps something went wrong - There is already a passage btn on the scene')
    }
}

function removeButton() {
    const passageBtn = document.getElementById('nextPassageBtn');
    if (passageBtn != null) {
        bobGuy.removeChild(passageBtn);
    }
}

export {nextScene};