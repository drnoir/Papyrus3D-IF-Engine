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

loadData();

async function loadData() {
// game vars
//     config and diagloue loading
    await loadTextures(2);
    await loadConfig();
    await loadChars();
    await loadDiag(2);
    //scene loading / aFrame loading
    await loadMap(2);
    await loadSceneMetaData(2);
   // run create scene routine
    await createRooms();
    // await populateScene();
    // await populateDiag(0)
    // testing dialogue.json UI population
    console.log(config, chars, diag, mapSource, textures);
}

async function loadConfig() {
    const res = await fetch('config.json')
    config = await res.json();
}

async function loadChars() {
    const res = await fetch('characters.json')
    chars = await res.json();
}

async function loadDiag(sceneToLoad) {
    let fetchURL = './scenes/scene' + sceneToLoad + '/dialogue.json';
    const res = await fetch(fetchURL)
    diag = await res.json();
}

async function loadMap(mapToLoad) {
    let fetchURL = './scenes/scene' + mapToLoad + '/map.json';
    const res = await fetch(fetchURL)
    mapSource = await res.json();
}

async function loadTextures(textureScene) {
    let fetchURL = './scenes/scene' +textureScene + '/textures.json';
    const res = await fetch(fetchURL)
    textures = await res.json();
}

async function loadSceneMetaData(metaDataToLoad) {
    let fetchURL = './scenes/scene' + metaDataToLoad + '/scene.json';
    const res = await fetch(fetchURL)
    sceneMetadata = await res.json();
}

// function addTextureAssets(){
//     const assets= document.createElement('a-assets');
//     scene.appendChild(assets)
//     for (let t= 0; t < textures.length;t++) {
//         let assetIMG = document.createElement('img');
//         assetIMG.setAttribute('id',textures.textures[t].id)
//         assetIMG.setAttribute('src',textures.textures[t].path)
//         assets.appendChild(assets)
//     }
// }

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
    torch.setAttribute('id', torch + [torchIndex]);
    let fire = document.createElement('a-entity');
    fire.setAttribute('light', 'type: point; intensity: 0.10; distance: 1; decay: 0');
    fire.setAttribute('color' + torchColor);
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
    const dialogueUI = document.getElementById("dialogueID");
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

    // allocate textures from JSON config
    let wallTexture = textures.textures[0].id;
    let floorTexture = textures.textures[1].id;
    let doorTexture = textures.textures[2].id;
    let wallTexture2 = textures.textures[3].id;
    console.log(typeof  wallTexture);

    const WALL_SIZE = 0.8;
    const WALL_HEIGHT = 5;
    const el = document.getElementById('room')
    // let playerPos;

    let door; let wall;
    if (roomType === "Indoor") {
        let ceil = document.createElement('a-box');
        let ceilArea = (mapSource.width * mapSource.height);
        ceil.setAttribute('width', ceilArea );
        ceil.setAttribute('height', ceilArea );
        ceil.setAttribute('rotation', '-90 0 0');
        ceil.setAttribute('position', '0 5 0');
        ceil.setAttribute('static-body', '');
        ceil.setAttribute('scale', '0.2 0.2 0.2');
        ceil.setAttribute('material', 'src: #grunge; repeat: 5 5');
        el.appendChild(ceil);
    }
    for (let x = 0; x < mapSource.height; x++) {
        for (let y = 0; y < mapSource.width; y++) {

            const i = (y * mapSource.width) + x;
            const floorPos= `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const position = `${((x - (mapSource.width / 2)) * WALL_SIZE)} ${(WALL_HEIGHT/2)} ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const halfYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 1 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const quarterYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const charPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const torchPosition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 4 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const stairsPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} ${( y- (mapSource.height)) * WALL_SIZE} ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            // char
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c" && mapData[i].charAt(1) === "h") {
                console.log("its a char!")
                let char = addChar(charLoopIndex);
                console.log('char ran and char is' + char)
                char.setAttribute('position', charPos);
                char.setAttribute('static-body', '');
                el.appendChild(char);
                charLoopIndex++;
            }

            if (mapData[i] === 9 ) {
                const enemy1 = document.createElement('a-entity');
                enemy1.setAttribute('enemy', 'modelPath:./models/Hellknight.obj; format:obj;');
                enemy1.setAttribute('id','enemy');
                enemy1.setAttribute('position',charPos);
                el.appendChild(enemy1);
            }
            // add torch / light
             if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "t") {
                console.log("its a torch!")
                let torch = addTorch('yellow', i);
                console.log('torch ran and char is' + torch)
                torch.setAttribute('position', torchPosition );
                // let floor = document.createElement('a-entity');
                // floor.setAttribute('height', WALL_HEIGHT / 20);
                // floor.setAttribute('static-body', '');
                // floor.setAttribute('position', position);
                // floor.setAttribute('editor-listener', '');
                // floor.setAttribute('static-body', '');
                el.appendChild(torch);
                // el.appendChild(floor);
            }
            // add   cam - UPDATE CONDITIONAL THIS IS TERRIBLE JSUT KEEPING IT FOR TESTING
            else if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c" && mapData[i].charAt(1) === "a") {
                const camPoint = document.createElement('a-entity');
                camPoint.setAttribute('id', 'cam' + [i]);
                camPoint.setAttribute('player','position:'+position);
                const camPointDebug = document.createElement('a-box');
                camPointDebug.setAttribute('visible', false)
                el.appendChild(camPoint);
            }
            // if the number is 1 - 4, create a wall
            if (mapData[i] === 0 || mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                wall.setAttribute('material', 'src:#'+wallTexture);
         
                // console.log(el, wall'
                el.appendChild(wall);

                // floor
                if (mapData[i] === 0) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT / 20);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', floorPos);
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('editor-listener', '');
                    wall.setAttribute('material', 'src:#'+floorTexture);
                }
                // full height wall
                if (mapData[i] === 1) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT);
                    wall.setAttribute('static-body', '');
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('position', position);
                    wall.setAttribute('material', 'src:#'+wallTexture);
                }
                // 1/2 height wall
                if (mapData[i] === 2) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT / 2);
                    wall.setAttribute('static-body', '');
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('position', halfYposition);
                    wall.setAttribute('material', 'src:#'+wallTexture2);
                }
                //  1/4 height wall
                if (mapData[i] === 3) {
                    wall.setAttribute('height', WALL_HEIGHT / 4);
                    wall.setAttribute('static-body', '');
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('position', quarterYposition);
                    wall.setAttribute('material', 'src:#'+wallTexture2);
                }
                // door
                if (mapData[i] === 4) {
                    wall.setAttribute('id', 'door');
                    // create component for door / lock
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('door', 'false');
                    wall.setAttribute('locked', 'false');
                    wall.setAttribute('material', 'src:#'+doorTexture);
                }

                // // play pos
                // else if (mapData === 8) {
                //     const playerStart = document.createElement('a-entity');
                //     playerStart.setAttribute('playercam', '');
                //     playerStart.setAttribute('position',position)
                //     playerStart.setAttribute('static-body', '');
                //     el.appendChild(playerStart);
                // }
                // else { // normal walls
                //     let floor = document.createElement('a-entity');
                //     floor.setAttribute('height', WALL_HEIGHT / 20);
                //     floor.setAttribute('static-body', '');
                //     floor.setAttribute('position', position);
                //     // wall.setAttribute('material', 'src: #brick; repeat: 1 1');
                //     floor.setAttribute('editor-listener', '');
                //     floor.setAttribute('static-body', '');
                //     el.appendChild(floor);
                // }
            }
        }
    }
// document.querySelector('#player').setAttribute('position', playerPos);
//     MapMaker(mapData);
}

function MapMaker(mapData){
    const playerMap = document.createElement('a-entity');
    playerMap.setAttribute('playermap', '');
    document.querySelector('#mapUI').appendChild(playerMap)
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
        let bobGuy = document.getElementById('bobGuy') // FOR TESTING PURPOSES - needs to be passed associated char
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

function updatePlayerPos(newPlayPos){
   document.querySelector('#player').setAttribute('position', newPlayPos);
}

export {nextScene};