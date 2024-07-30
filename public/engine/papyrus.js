// PAPYRUS 3D FRAMEWORK CORE CODE 
// Reassignable global game stare vars
let player;
// CONFIG CHARECTERS AND ENEMIES STORE
let config; let chars; let enemies;
// Diagoloue and scene metadata etc
let diag; let mono; let sceneMetadata; let interactions; let charDiagIDs = [];
let lockedDoors = [];
// STORE TEXTURE INFO
let textures; let prefabs;
// diaglog UI Globals / shit 
let currentDiagID = 0; let numInteraction = 0; let currentScene = 1; let nextSceneToLoad = currentScene + 1;
let randomMode = false; let introID = 1; // for optional intro dialogue loading
let currentChar = 0; let mapSource = 0;
// combat var defaults SIMULATED DICE - Combat system is based on D and D - INIT vals / max 
let CombatDiceNumber = 15; let CombatDMGDiceNumber = 15;
// dialogueUI Elements Based on a-frame defaults 
const scene = document.querySelector('a-scene'); const assets = document.querySelector('a-assets');

// DATA LOADING ROUTINES
async function loadData() {
    //config and diagloue loading
    await loadPlayer();
    await setupPlayerInfo();
    await loadTextures(currentScene);
    await loadConfig();
    await loadChars();
    await loadPrefabs();
    await loadDiag(currentScene);
    await loadInteractions(currentScene);
    //scene loading / aFrame loading
    await loadSceneMetaData(currentScene);
    await loadMap(currentScene);
    // run create scene routine
    await createRooms();

    
    // testing dialogue.json UI population
    const sound = document.querySelector('[sound]');
    sound.components.sound.playSound();
}

// Load engine Config file (JSON) - As the engine relies on configurable json there can be custum values 
async function loadConfig() {
    const res = await fetch('config.json');
    config = await res.json();
    CombatDiceNumber = config.CombatDiceNumber; CombatDMGDiceNumber = config.CombatDMGDiceNumber;
}
// Load engine setup file (JSON)
async function loadSetup() {
    const res = await fetch('setup.json');
    const setup = await res.json();
    randomMode = setup.randomMode;
    console.log('Setup loaded: ', setup);
}
async function loadPlayer() {
    const res = await fetch('player.json')
    player = await res.json();
}

async function loadChars() {
    const res = await fetch('characters.json')
    chars = await res.json();
    console.log(chars);
}

async function loadDiag(sceneToLoad) {
    // fetch dialogues NPC
    let fetchURL = './scenes/scene' + sceneToLoad + '/dialogue.json';
    const res = await fetch(fetchURL)
    diag = await res.json();
    // fetch monologues PC Solo
    let fetchURL2 = './scenes/scene' + sceneToLoad + '/monologues.json';
    const res2 = await fetch(fetchURL2)
    mono = await res2.json();
    console.log(mono);
}

async function loadInteractions(sceneToLoad) {
    let fetchURL = './scenes/scene' + sceneToLoad + '/interactions.json';
    const res = await fetch(fetchURL)
    interactions = await res.json();
    console.log(interactions);
}

async function loadPrefabs() {
    const res = await fetch('prefabs.json')
    prefabs = await res.json();
    console.log(prefabs);
}

async function loadMap(mapToLoad) {
    let fetchURL = './scenes/scene' + mapToLoad + '/map.json';
    const res = await fetch(fetchURL)
    mapSource = await res.json();
}

async function loadTextures(textureScene) {
    let fetchURL = './scenes/scene' + textureScene + '/textures.json';
    const res = await fetch(fetchURL)
    textures = await res.json();
}

async function loadSceneMetaData(metaDataToLoad) {
    let fetchURL = './scenes/scene' + metaDataToLoad + '/scene.json';
    const res = await fetch(fetchURL)
    sceneMetadata = await res.json();
    introID = sceneMetadata.IntroID;
    if (sceneMetadata.Intro){populateMono('Player',introID)};
}

// PLAYER SETUP
function setupPlayerInfo() {
    player = {
        name: player.name,
        health: player.health,
        strength: player.strength,
        constitution: player.constitution,
        // player model face states - WIP WHEN UI is done - DOOM style injury states 
        playerFaceState: player.playerFaceState,
        playerFaceState25: player.playerFaceState25,
        playerFaceState50: player.playerFaceState50,
        playerFaceState85: player.playerFaceState85,
        playerFaceStateDead: player.playerFaceStateDead,
    }
}

// CHARECETERS AND ENEMIES =--<
//Add chareceter to scene function 
function addChar(charNumber) {
    let indexCharNumber = charNumber - 1;
    let modelID = '#' + chars.characters[indexCharNumber].name;
    let char = document.createElement('a-entity');
    char.setAttribute('id', chars.characters[indexCharNumber].id);
    char.setAttribute('name', chars.characters[indexCharNumber].name);
    char.setAttribute('gltf-model', modelID);
    char.setAttribute('scale', chars.characters[indexCharNumber].scale);
    char.setAttribute('animation-mixer', "clip: *; loop: repeat;");
    charDiagIDs.push(charNumber);
    console.log('char ids' + charDiagIDs);
    return char;
}

// Add a torch / light to geometry 
function addTorch(torchColor, torchIndex) {
    let torch = document.createElement('a-box');
    torch.setAttribute('id', torch + [torchIndex]);
    let fire = document.createElement('a-entity');
    fire.setAttribute('light', 'type: point; intensity: 0.35; distance: 1; decay: 0');
    fire.setAttribute('color' + torchColor);
    torch.appendChild(fire);
    return torch;
}

// KEYS
function addKey(keyColor, keyIndex) {
    let key = document.createElement('a-box');
    let color = returnKeyColor(keyColor);
    key.setAttribute('id', key + [keyIndex]);
    key.setAttribute('color', color);
    key.setAttribute('scale', '0.2, 0.2, 0.2');
    return key;
}

function returnKeyColor(colorCode) {
    if (colorCode == 'B') {
        return 'blue';
    }
    if (colorCode == 'Y') {
        return 'yellow';
    }
    if (colorCode == 'R') {
        return 'red';
    }
}

// LEVEL LOADING 
//Move to next dialogue passage  
function nextScene() {
    if (diag.passage.length - 1 !== currentDiagID) {
        currentChar = diag.passage[currentDiagID].char;
        console.log(diag.passage.length - 1, currentDiagID, currentChar);
        // currentDiagID++;
        // populateDiag(currentDiagID, currentChar);
        makeCharActive(currentChar);
        // hide after certain time
        setTimeout(hideDialogueUI, 10000);
    } else {
        // reset for now
        currentDiagID = 0;
    }
}

async function loadNewLevel(mapToLoad) {
    await clearScene();
    await loadSceneMetaData(mapToLoad);
    await loadTextures(mapToLoad);
    if (sceneMetadata.roomType === "Indoor") {
        await loadMap(mapToLoad);
    }
    await createRooms();
    await loadDiag(mapToLoad);
    await loadInteractions(mapToLoad);
    // await populateDiag(0, 0);
    currentScene = mapToLoad;
}

// DIALOGUE 
function showDialogueUI() {
    const dialogueUI = document.getElementById('dialogueBox');
    dialogueUI.setAttribute('visible', true);
}

function hideDialogueUI() {
    const dialogueUI = document.getElementById('dialogueBox')
    dialogueUI.setAttribute('visible', false); addButton
}

// show passagebtn relative to character model
function addButton(diagID, charID) {
    // check if there is an existing button element first before adding a new one
    if (!document.getElementById('nextPassageBtn')) {
        let nextPassageBtn = document.createElement('a-box')
        nextPassageBtn.setAttribute('id', 'nextPassageBtn');
        nextPassageBtn.setAttribute('choice-btn', 'diagID:'+diagID,'charID:'+charID);
        nextPassageBtn.setAttribute('depth', '0.01');
        nextPassageBtn.setAttribute('height', '0.5');
        nextPassageBtn.setAttribute('width', '0.5');
        nextPassageBtn.setAttribute('material', 'color: black');
        nextPassageBtn.setAttribute('position', '0.6 -0.1 0.1');
        // addtext
        let nextPassageBtnTxt = document.createElement('a-text');
        nextPassageBtnTxt.setAttribute('value', '>');
        nextPassageBtnTxt.setAttribute('height', '6');
        nextPassageBtnTxt.setAttribute('width', '6');
        nextPassageBtnTxt.setAttribute('position', '0 0 0.1')
        nextPassageBtnTxt.setAttribute('material', 'color: white');
        nextPassageBtn.appendChild(nextPassageBtnTxt);

        return nextPassageBtn;

    } else {
        console.log('Opps something went wrong - There is already a passage btn on the scene')
    }
}

function addChoiceButton(choice, charID, loopNum) {
        let choiceBtn = document.createElement('a-box')
        choiceBtn.setAttribute('class', 'choiceBtn'+charID);
        // nextPassageBtn.setAttribute('choice-btn', 'diagID:'+diagID,'charID:'+charID);
        choiceBtn.setAttribute('depth', '0.01');
        choiceBtn.setAttribute('height', '0.5');
        choiceBtn.setAttribute('width', '1');
        choiceBtn.setAttribute('material', 'color: black');
        choiceBtn.setAttribute('position', '0',loopNum+0.5,'0');
        // addtext
        let choiceBtnTxt = document.createElement('a-text');
        choiceBtnTxt.setAttribute('value',choice);
        choiceBtnTxt.setAttribute('height', '2');
        choiceBtnTxt.setAttribute('width', '2');
        choiceBtnTxt.setAttribute('position', '0 0 0.1')
        choiceBtnTxt.setAttribute('material', 'color: white');
        choiceBtn.appendChild(choiceBtnTxt);
        return choiceBtn;
}

// ICON for triggering dialogues - Chars
function addCharBtn(charNumber) {
    let indexCharNumber = charNumber - 1;
    let diagCount = countDialogue(charNumber);
    let modelID = '#' + chars.characters[indexCharNumber].name;

    let charBtn = document.createElement('a-box');
    charBtn.setAttribute('scale', '0.8 0.8 0.01');
    charBtn.setAttribute('material', 'src:#talk; opacity:0.5;transparent:true;');
    charBtn.setAttribute('character', 'modelPath:' + modelID + 'charID:' + charNumber + ';' + 'numDiag:', diagCount + ';');
    return charBtn;
}

function populateDiag(currentChar, numDiag) {
    showDialogueUI();
    let newDiagPassage = diag.passage[currentChar].text;
    let newCharName = diag.passage[currentChar].char;
    let newCharChoices = diag.passage[currentChar].choices;
    console.log(diag.passage[currentChar], newCharChoices);
    currentDiagID = currentChar - 1;
    populateMessage(newCharName, newDiagPassage, newCharChoices);
}


function populateMono(playerName, numMono) {
    showDialogueUI();
    console.log(mono.passage[numMono-1].text);
    let newDiagPassage = mono.passage[numMono-1].text;
    let newCharName =playerName;
    populateMessage(newCharName, newDiagPassage);
}


function populateInteractions(numInteraction) {
    // add button test function
    showDialogueUI();
    console.log(numInteraction);
    // populate dialog with text / name
    let newDiagPassage = interactions.interactions[numInteraction].text;
    let newObjectName = interactions.interactions[numInteraction].Object;
    let newObjectChoices = interactions.interactions[numInteraction].choices;
    console.log(diag.passage[currentChar], newObjectChoices);
    
    populateMessage(newObjectName, newDiagPassage);
    setTimeout(hideDialogueUI, 10000);
}

// show a message from enviroment
function populateMessage(char, message) {
    console.log('populate dialogue box with' + char, message)
    const dialogueUI = document.getElementById('dialogueContent');
    const dialogueTitle = document.getElementById('dialogueTitle');
    // add button test function
    showDialogueUI();
    dialogueUI.setAttribute('text', 'wrapCount:' + 100);
    dialogueUI.setAttribute('text', 'width:' + 1.5);
    dialogueUI.setAttribute('text', 'height:' + 2);
    dialogueUI.setAttribute('text', 'color:black');
    dialogueTitle.setAttribute('text', 'value:' + char);
    dialogueUI.setAttribute('text', 'value:' + message);
    // setTimeout(hideDialogueUI, 10000);
}

// make glow component show on specified char indicating char speaking
function makeCharActive(charID) {
    const charRef = document.getElementById(charID);
    if (charRef.getAttribute('glowfx', 'visible:false;')) {
        charRef.setAttribute('glowfx', 'visible:true;');
        let charName = charRef.getAttribute('id')
        console.log('check current' + charName);
    }
}

function makeCharInactive(charID) {
    const charRef = document.getElementById(charID);
    charRef.setAttribute('glowfx', 'visible:false;');
    let charName = charRef.getAttribute('id')
    console.log('check current' + charName);
}

function gotKey(keyColor) {
    // arr the key here (current key)
    lockedDoors.push(keyColor);
    console.log('lockeddoors with keys' + lockedDoors);
}

// create a floor with params
function createFloor(floorPos, WALL_HEIGHT, WALL_SIZE, PREFAB) {
    const floor = document.createElement('a-box');
    floor.setAttribute('height', WALL_HEIGHT / 20);
    floor.setAttribute('width', WALL_SIZE);
    floor.setAttribute('depth', WALL_SIZE);
    floor.setAttribute('static-body', 'mass: 0');
    floor.setAttribute('position', floorPos);
    floor.setAttribute('editor-listener', '');
    if (!PREFAB) { floor.setAttribute('playermovement', '') };
    floor.setAttribute('material', 'src:#floor');
    return floor;
}

function createWall(WALL_SIZE, WALL_HEIGHT, position, wallTexture, poster, posterNum) {
    const wall = document.createElement('a-box');
    wall.setAttribute('class', 'wall');
    wall.setAttribute('width', WALL_SIZE);
    wall.setAttribute('height', WALL_HEIGHT);
    wall.setAttribute('depth', WALL_SIZE);
    wall.setAttribute('position', position);
    wall.setAttribute('material', 'src:#' + wallTexture);
    wall.setAttribute('static-body', 'mass: 0');
    if (poster) {
        // Create the poster element
        let posterTexture = textures.textures[7].id;
        const poster = document.createElement('a-box');
        poster.setAttribute('class', 'poster');
        poster.setAttribute('width', WALL_SIZE); // Smaller than the wall
        poster.setAttribute('height', WALL_HEIGHT / 2); // Smaller than the wall
        poster.setAttribute('depth', WALL_SIZE / 100); // Very thin, like a poster
        poster.setAttribute('position', '0 0 0.5'); // Slightly in front of the wall
        poster.setAttribute('material', 'src:#' + 'poster' + posterNum); // Example material, can be changed

        // Append the poster to the wall
        wall.appendChild(poster);
    }
    return wall;
}


// ROOM CREATION
// Create rooms loop - called at init - Adds Entities to scene
function createRooms() {
    const mapData = mapSource.data;
    let roomType = sceneMetadata.roomType;
    console.log(roomType)
    // allocate textures from JSON config
    let wallTexture = textures.textures[0].id; let floorTexture = textures.textures[1].id;
    let doorTexture = textures.textures[2].id; let wallTexture2 = textures.textures[3].id;
    let exitTexture = textures.textures[4].id; let waterTexture = textures.textures[5].id;
    let keyTexture = textures.textures[6].id;

    const WALL_SIZE = 1;
    const WALL_HEIGHT = 3.5;
    let el = document.getElementById('room')
    if (el === null) {
        const scene = document.querySelector('a-scene');
        el = document.createElement('a-entity');
        el.setAttribute('id', 'room');
        scene.appendChild(el);
    }
    let wall;
    if (roomType === "Indoor") {
        let ceil = document.createElement('a-box');
        ceil.setAttribute('width', mapSource.width);
        ceil.setAttribute('height', mapSource.height);
        ceil.setAttribute('rotation', '-90 0 0');
        ceil.setAttribute('position', '0 3.5 0');
        ceil.setAttribute('static-body', 'mass: 0');
        ceil.setAttribute('scale', '1 1 1');
        ceil.setAttribute('material', 'src: #grunge; repeat: 10 10');
        el.appendChild(ceil);
    }
    // outdoor stuff - reimplement later
    else {
        // scene data 
        const newRoom = document.createElement('a-entity');
        newRoom.setAttribute('id', 'room');
        scene.appendChild(newRoom);
        const enviroment = document.createElement('a-entity');
        enviroment.setAttribute('id', 'outdoors');
        console.log('Mapsource pre loop outdoor' + mapSource);
        for (let x = 0; x < mapSource.height; x++) {
            for (let y = 0; y < mapSource.width; y++) {
                const i = (y * mapSource.height) + x;
                const floorPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
                // flat floor for outdoor
                if (mapSource[i] === 0) {
                    // console.log('loop', mapSource[i])
                    const floor = createFloor(floorPos);
                    newRoom.appendChild(floor);
                }
            }
        }
        enviroment.setAttribute('environment', "active: true; preset: starry; dressing:appartus;dressingColor:white; dressingAmount:20; seed:1; groundYScale:0.5; playArea:500; shadow:true;");
        enviroment.setAttribute('position', '0 -1.5 10')
        newRoom.appendChild(enviroment);
    }
    // LOOP to map geometry 
    for (let x = 0; x < mapSource.height; x++) {
        for (let y = 0; y < mapSource.width; y++) {
            const i = (y * mapSource.width) + x;
            const floorPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const position = `${((x - (mapSource.width / 2)) * WALL_SIZE)} ${(WALL_HEIGHT / 2)} ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const halfYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const quarterYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const charPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} -0.001 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const torchPosition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 4 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const keyPosition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0.4 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const stairsPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} ${(y - (mapSource.height)) * WALL_SIZE} ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            // char
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c" && mapData[i].charAt(1) === "h") {
                console.log("its a char!")
                let charNumber = mapData[i].charAt(4) ? String(mapData[i].charAt(4) + mapData[i].charAt(5)) : mapData[i].charAt(4);
                console.log(mapData[i].charAt(4));
                let char = addChar(charNumber);
                let charBtn = addCharBtn(charNumber);
                char.setAttribute('position', charPos);
                charBtn.setAttribute('position', '0.18 2 0');
                char.setAttribute('glowfx', 'visible:true;');

                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                el.appendChild(floor);
                el.appendChild(char);
                char.appendChild(charBtn);
            }
            // playercam
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "P") {
                const playerPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 1.5 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
                updatePlayerPos(playerPos);
                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                el.appendChild(floor);
            }
            // prefabs
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "7") {
                let prefabNum1 = mapData[i].charAt(1) ? mapData[i].charAt(1) : 0;
                let prefabNum2 = mapData[i].charAt(2) ? mapData[i].charAt(2) : 0;
                let prefabNum = mapData[i].charAt(1) && mapData[i].charAt(2) ? prefabNum1 + prefabNum2 : prefabNum1;
                let prefabTrigger = prefabNum > 9 ? mapData[i].charAt(3) : mapData[i].charAt(2);
                let dataLength = mapData[i].length;
                let diagTrigger = prefabTrigger === 'T' ? true : false;
                let triggerNum = prefabTrigger === 'T' ? mapData[i].charAt(dataLength - 1) : null;
                let prefabChoices = [];
                if (diagTrigger){
                prefabChoices = interactions.interactions[triggerNum].choices;
                }
                console.log('prefab choices' + prefabChoices);
                const prefabElm = document.createElement('a-entity');
                const prefabElmNum = prefabs.prefabs[prefabNum1];
                const prefabName = prefabs.prefabs[prefabNum1].name;
                prefabElm.setAttribute('gltf-model', '#' + prefabElmNum.id);
                prefabElm.setAttribute('scale', prefabElmNum.scale);
                prefabElm.setAttribute('rotation', prefabElmNum.rotation);
                prefabElm.setAttribute('animation-mixer', "clip: *; loop: repeat;");
                //add prefab componenet
                prefabElm.setAttribute('prefab', 'triggerDialogue:' + diagTrigger + ';interactionNum:' + triggerNum + ';' +'interactionName:'+prefabName+'choices:'+ prefabChoices +';');
                prefabElm.setAttribute('id', 'prefab' + prefabElmNum.id);
                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE, true); // true is to remove playermovement
                el.appendChild(floor);
                floor.appendChild(prefabElm);
            }
            //  water
            if (mapData[i] === 6) {
                const water = document.createElement('a-plane');
                water.setAttribute('height', WALL_HEIGHT / 20);
                water.setAttribute('width', WALL_SIZE);
                water.setAttribute('depth', WALL_SIZE);
                water.setAttribute('static-body', 'mass: 0');
                water.setAttribute('position', floorPos);
                water.setAttribute('rotation', '90 0 0');
                water.setAttribute('scale', '1 5.72 2');
                water.setAttribute('material', 'src:#' + waterTexture + '; color:#86c5da; opacity: 0.85; transparent: true;side: double; shader:phong; reflectivity: 0.9; shininess: 70;');
                el.appendChild(water);
            }
            // add torch / light
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "t") {
                console.log("its a torch!")
                let torch = addTorch('yellow', i);
                console.log('torch ran and char is' + torch)
                torch.setAttribute('position', torchPosition);
                // add floor 
                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                el.appendChild(torch);
                el.appendChild(floor);
            }
            // add Locked doors (Non Key)
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "4" && mapData[i].charAt(1) === "L") {
                const door = document.createElement('a-box');
                door.setAttribute('id', 'door');
                // create component for door / lock
                door.setAttribute('height', WALL_HEIGHT);
                door.setAttribute('door', 'locked: true;key:true;');
                door.setAttribute('scale', '1 1 0.6');
                door.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1;');
                door.setAttribute('position', position);
                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                el.appendChild(door);
                el.appendChild(floor);
            }
            // add keys
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "K") {
                console.log("its a key!")
                // map data index 1 contains color coding b, y, r etc
                let key = addKey(mapData[i].charAt(1), i);
                key.setAttribute('position', keyPosition);
                key.setAttribute('material', 'src:#' + keyTexture);
                key.setAttribute('key', '');
                key.setAttribute('editor-listener', '');
                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                el.appendChild(floor);
                el.appendChild(key);
            }
            // add cylinder
            if (mapData[i] === "C") {
                const cylinderElm = document.createElement('a-entity');
                cylinderElm.setAttribute('gltf-model', '#' + 'cylinder');
                cylinderElm.setAttribute('scale', '1 1 3');
                cylinderElm.setAttribute('rotation', '90 0 0');
                cylinderElm.setAttribute('position', floorPos);
                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                el.appendChild(cylinderElm);
                el.appendChild(floor);
            }
            // poster on wall
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "P" && mapData[i].charAt(1) === "O") {
                let posterNum = mapData[i].charAt(2) ? mapData[i].charAt(2) : 1;
                let posterTrigger = mapData[i].charAt(3) === 'T' ? true : false;
                wall = createWall(WALL_SIZE, WALL_HEIGHT, position, wallTexture, true, posterNum);

                if (posterTrigger) {
                    const triggerTextRef = mapData[i].charAt(3)
                    wall.setAttribute('triggerdiagfloor', 'numDiag:' + triggerTextRef);
                    wall.setAttribute('glowfx', 'color:#ffde85;');
                }
                el.appendChild(wall);
            }
            // custum wall
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "0") {
                // custom floor height
                let floorHeight1 = mapData[i].charAt(1) ? mapData[i].charAt(1) : 0;
                let floorHeight2 = mapData[i].charAt(2) ? mapData[i].charAt(2) : 0;
                let floorHeight = mapData[i].charAt(1) && mapData[i].charAt(2) ? floorHeight1 + floorHeight2 : floorHeight1;
                let floorTrigger = floorHeight > 9 ? mapData[i].charAt(3) : mapData[i].charAt(2);
                let triggerCheck = floorTrigger === 'T' ? true : false;
                wall = createWall(WALL_SIZE, floorHeight, floorPos, wallTexture, false);
                console.log(triggerCheck);
                if (triggerCheck) {
                    const triggerTextRef = mapData[i].charAt(3);
                    wall.setAttribute('triggerdiagfloor', 'numDiag:' + triggerTextRef);
                    wall.setAttribute('glowfx', 'color:#ffde85;');
                }
                el.appendChild(wall);
                console.log('custumheight check' + floorHeight);
            }
            // if the number is 1 - 4,  create a wall 1-5 STANDARD WALLS
            if (mapData[i] === 0 || mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4 || mapData[i] === 5) {
                wall = createWall(WALL_SIZE, WALL_HEIGHT, position, wallTexture, false);
                el.appendChild(wall);
                // floor standard
                if (mapData[i] === 0) {
                    wall.setAttribute('class', 'floor');
                    wall.setAttribute('height', WALL_HEIGHT / 20);
                    wall.setAttribute('static-body', 'mass: 0');
                    wall.setAttribute('position', floorPos);
                    wall.setAttribute('playermovement', '');
                    wall.setAttribute('material', 'src:#' + 'floor');
                }
                // cause pain trigger floor
                if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "0" && mapData[i].charAt(1) === "H" && mapData[i].charAt(2) === "U") {
                    let dmg1 = mapData[i].charAt(3) ? mapData[i].charAt(3) : 0;
                    let dmg2 = mapData[i].charAt(4) ? mapData[i].charAt(4) : 0;
                    wall = createWall(WALL_SIZE, WALL_HEIGHT, position, wallTexture, false);
                    wall.setAttribute('editor-listener', '');
                    wall.setAttribute('playermovement', '');
                }
                // full height wall
                if (mapData[i] === 1) {
                    wall = createWall(WALL_SIZE, WALL_HEIGHT, position, wallTexture, false);
                    wall.setAttribute('material', 'repeat:0.5 1');
                }
                // 1/2 height wall
                if (mapData[i] === 2) {
                    wall = createWall(WALL_SIZE, WALL_HEIGHT, halfYposition, wallTexture2, false);
                    const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                    el.appendChild(floor);
                }
                //  1/4 height wall
                if (mapData[i] === 3) {
                    wall = createWall(WALL_SIZE, WALL_HEIGHT, quarterYposition, wallTexture2, false);
                }
                // door
                if (mapData[i] === 4) {
                    wall.setAttribute('id', 'door');
                    // create component for door / lock
                    wall.setAttribute('height', WALL_HEIGHT);
                    // check if door should be locked or not 
                    wall.setAttribute('locked', 'false')
                    wall.setAttribute('door', '');
                    wall.setAttribute('scale', '1 1 0.4');
                    wall.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1');
                    const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                    el.appendChild(floor);
                }
                // door locked KEY DOOR
                if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "4" && mapData[i].charAt(1) === "L") {
                    let doorNum2 = mapData[i].charAt(2) ? mapData[i].charAt(2) : 0;
                    let doorNum = doorNum2;
                    let doorColor = mapData[i].charAt(2) ? mapData[i].charAt(2) : null;
                    wall.setAttribute('id', 'door');
                    // door locked set num 
                    wall.setAttribute('height', WALL_HEIGHT);
                    let doorLockColor = returnKeyColor(doorColor);
                    wall.setAttribute('door', 'doorLockNum:' + doorNum + 'key:true;keyColour:' + doorLockColor);
                    doorNum++;
                    wall.setAttribute('locked', 'true');
                    wall.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1;' + 'color:' + doorLockColor);
                    const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                    el.appendChild(floor);
                }
            }
            // add exit MAP TYPE 5
            if (mapData[i] === 5) {
                wall.setAttribute('id', 'door');
                // create component for door / lock
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('scale', '1 1 1');
                wall.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1');
                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                wall.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1');
                wall.setAttribute('exit', 'toLoad:' + nextSceneToLoad++ + ';');
                el.appendChild(wall);
                el.appendChild(floor);
            }
            // add exit (End Game) - MAP TYPE X 
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "X") {
                wall.setAttribute('id', 'door');
                // create component for door / lock
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('door', 'false');
                wall.setAttribute('locked', 'false');
                wall.setAttribute('door', '');
                wall.setAttribute('scale', '1 1 1');
                wall.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1');
                const floor = createFloor(floorPos, WALL_HEIGHT, WALL_SIZE);
                wall.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1');
                wall.setAttribute('exit', 'endGame:' + true);
                el.appendChild(wall);
                el.appendChild(floor);
                // trigger end of game
            }
        }
    }
    // top down map update pos - FUTURE FEATURE
    // MapMaker(mapData);
} //END ROOM LOOP

// Map on 2D Map?
// function MapMaker(mapData) {
//     const playerMap = document.createElement('a-entity');
//     playerMap.setAttribute('playermap', '');
//     document.querySelector('#mapUI').appendChild(playerMap)
// }


// RETURN player health
function getPlayerHealth() {
    if (player) {
        return player.health;
    }
}

function setPlayerHealth(amountToTakeOff) {
    if (player) {
        player.health = player.health - amountToTakeOff;
        console.log(player.health);
        if (player.health <= 0) {
            console.log('player should now die');
            // init playdeath sequence
            playerDeath();
        }
    }
}

function resetPlayerHealth() {
    if (player) {
        player.health = 100;
    }
}

// calc dialogue lengths per char 
function countDialogue(charID) {
    let counter = 0;
    const diagArr = diag.passage;

    for (charID in diagArr) {
        if (diagArr.hasOwnProperty(charID)) {
            ++counter;
        }
    }
    console.log('counter val' + counter);
    return counter;
};

function finalDiagID(charID) {
    const finalDiagID = countDialogue(charID);
    return diag.passage[finalDiagID - 1].diagID;
};

// RANDOM AND UTILS ?
// simulate random dice roll
function RandomDiceRoll(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// Update Player pos
function updatePlayerPos(newPlayPos) {
    document.querySelector('#playercam').setAttribute('position', newPlayPos);
}

function getPlayerKeysInfo() {
    return lockedDoors;
}

function clearScene() {
    const el = document.getElementById('room');
    const scene = document.querySelector('a-scene');
    el.parentNode.removeChild(el);
}

// func to call on event of playerdeath health reaching 0
function playerDeath() {
    let deathAudio = document.querySelector("#playerdeath");
    deathAudio.play();
    setTimeout(clearScene(), 2500);
    setTimeout(loadData(), 2500);
    setTimeout(resetPlayerHealth(), 2500);
}

// EXPORTS 
export {
    nextScene, loadNewLevel, populateDiag, addButton, addChoiceButton,
    populateInteractions, populateMessage, clearScene, loadData, gotKey, getPlayerKeysInfo, getPlayerHealth, setPlayerHealth, playerDeath
};