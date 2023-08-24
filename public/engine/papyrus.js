// PAPYRUS 3D ENGINE CODE 
// Reassignable global game stare vars
let player;
// CONFIG CHARECTERS AND ENEMIES STORE
let config; let chars; let enemies; let gun = true;
// Diagoloue and scene metadata etc
let diag; let sceneMetadata; let interactions; let charDiagIDs = [];
let lockedDoors = [];
// STORE TEXTURE INFO
let textures; let prefabs;
// diaglog UI Globals / shit 
let currentDiagID = 0; let currentScene = 1; let nextSceneToLoad = currentScene+1;
let currentChar = 0; let mapSource = 0; let currentInteraction = 0;
// combat var defaults SIMULATED DICE - Combat system is based on D and D - INIT vals / max 
let CombatDiceNumber = 6;
let CombatDMGDiceNumber = 6;
// dialogueUI Elements Based on a-frame defaults 
const scene = document.querySelector('a-scene'); const assets = document.querySelector('a-assets');

// DATA LOADING ROUTINES
async function loadData() {
    //config and diagloue loading
    await loadPlayer();
    await loadTextures(currentScene);
    await loadConfig();
    await loadChars();
    await loadEnemies();
    await loadPrefabs();
    await loadDiag(1);
    await loadInteractions(1);
    //scene loading / aFrame loading
    await loadSceneMetaData(currentScene);
    await loadMap(currentScene);
    await setupPlayerInfo();
    // run create scene routine
    await createRooms();
    await populateDiag(1, 1);
    // testing dialogue.json UI population
    const sound = document.querySelector('[sound]');
    sound.components.sound.playSound();
}

// Load engine Config file (JSON) - As the engine relies on configurable json there can be custum values 
async function loadConfig() {
    const res = await fetch('config.json');
    config = await res.json();
    CombatDiceNumber = config.CombatDiceNumber; CombatDMGDiceNumber = config.CombatDMGDiceNumber;
    gun = config.Gun;
    if (gun) {
        const gunModel = document.getElementById('gun');
        gunModel.setAttribute('visible:', true);
    }
    console.log('combat dice num' + CombatDiceNumber, CombatDMGDiceNumber)
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
    let fetchURL = './scenes/scene' + sceneToLoad + '/dialogue.json';
    const res = await fetch(fetchURL)
    diag = await res.json();
    console.log(diag);
}

async function loadInteractions(sceneToLoad) {
    let fetchURL = './scenes/scene' + sceneToLoad + '/interactions.json';
    const res = await fetch(fetchURL)
    interactions = await res.json();
    console.log(interactions);
}

async function loadEnemies() {
    const res = await fetch('enemies.json')
    enemies = await res.json();
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
}

// PLAYER SETUP
function setupPlayerInfo() {
    player = {
        name: player.name,
        health: player.health,
        strength: player.strength,
        constitution: player.strength,
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
    // console.log(chars.characters[charID].id, chars.characters[charID].name);
    let indexCharNumber = charNumber - 1;
    console.log('char param passed' + charNumber)
    let modelID = '#' + chars.characters[indexCharNumber].name;
    let char = document.createElement('a-entity');
    char.setAttribute('id', chars.characters[indexCharNumber].name);
    char.setAttribute('name', chars.characters[indexCharNumber].name);
    char.setAttribute('gltf-model', modelID);
    char.setAttribute('scale', "1 1 1");
    char.setAttribute('animation-mixer', "clip: *; loop: repeat;");
    charDiagIDs.push(charNumber);
    console.log(charDiagIDs);
    return char;
}

//Add chareceter to scene function 
function addEnemy(enemyID) {
    console.log(enemies.enemies[enemyID].id, enemies.enemies[enemyID].name);
    let modelRef = enemies.enemies[enemyID].id;
    let modelID = '#' + modelRef;
    console.log(modelRef);
    let enemy = document.createElement('a-entity');
    enemy.setAttribute('id', enemies.enemies[enemyID].name);
    enemy.setAttribute('name', enemies.enemies[enemyID].name);
    enemy.setAttribute('gltf-model', modelID);
    enemy.setAttribute('scale', "0.01 0.01 0.01");
    enemy.setAttribute('enemy', '');
    enemy.setAttribute('animation-mixer', "clip: *; loop: repeat;");
    enemy.setAttribute('animation-mixer', {timeScale: 1});
    return enemy;
}

// Add a torch / light to geometry 
function addTorch(torchColor, torchIndex) {
    let torch = document.createElement('a-box');
    torch.setAttribute('id', torch + [torchIndex]);
    let fire = document.createElement('a-entity');
    fire.setAttribute('light', 'type: point; intensity: 0.25; distance: 1; decay: 0');
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
        console.log(diag.passage.length - 1, currentDiagID, currentChar)
        currentDiagID++;
        populateDiag(currentDiagID, currentChar);
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
    await loadInteractions(1);
    await populateDiag(1, 1);
    currentScene = mapToLoad;
}

// DIALOGUE 
function showDialogueUI() {
    const dialogueUI = document.getElementById('dialogueID');
    dialogueUI.setAttribute('visible', true);
}

function hideDialogueUI() {
    const dialogueUI = document.getElementById('dialogueID')
    dialogueUI.setAttribute('visible', false);
}

// show passagebtn relative to character model
function addButton(diagID) {
    // check if there is an existing button element first before adding a new one
    if (!document.getElementById('nextPassageBtn')) {
        let nextPassageBtn = document.createElement('a-box')
        nextPassageBtn.setAttribute('id', 'nextPassageBtn');
        nextPassageBtn.setAttribute('cursor-listener', '');
        nextPassageBtn.setAttribute('depth', '0.01');
        nextPassageBtn.setAttribute('height', '0.15');
        nextPassageBtn.setAttribute('width', '0.15');
        nextPassageBtn.setAttribute('material', 'color: white');
        nextPassageBtn.setAttribute('position', '0.2 1.6 0.1');
        // addtext
        let nextPassageBtnTxt = document.createElement('a-text');
        nextPassageBtnTxt.setAttribute('value', '>');
        nextPassageBtnTxt.setAttribute('height', '1');
        nextPassageBtnTxt.setAttribute('width', '3');
        nextPassageBtnTxt.setAttribute('position', '-0.05 0.015 0.1')
        nextPassageBtnTxt.setAttribute('material', 'color: black');
        let char = document.getElementById('char' + diagID) // FOR TESTING PURPOSES - needs to be passed associated char
        char.appendChild(nextPassageBtn);
        nextPassageBtn.appendChild(nextPassageBtnTxt);
    } else {
        console.log('Opps something went wrong - There is already a passage btn on the scene')
    }
}

function createChoiceButtons(amount, charID) {
    // check if there is an existing button element first before adding a new one
    if (!document.getElementById('choiceButtons')) {
        let char = document.getElementById(charID);// FOR TESTING PURPOSES - needs to be passed associated char
        let choiceButtons = document.createElement('a-entity')
        char.appendChild(choiceButtons);
        let initX = -0.06
        for (let x = 0; x < amount; x++) {
            let nextChoiceBtn = document.createElement('a-box')
            nextChoiceBtn.setAttribute('id', 'choiceButton' + x);
            nextChoiceBtn.setAttribute('cursor-listener', '');
            nextChoiceBtn.setAttribute('depth', '0.01');
            nextChoiceBtn.setAttribute('height', '0.15');
            nextChoiceBtn.setAttribute('width', '0.15');
            nextChoiceBtn.setAttribute('material', 'color: white');
            nextChoiceBtn.setAttribute('position', initX + 0.02 + '1.6 0.1');
            // addtext
            let nextChoiceBtnTxt = document.createElement('a-text');
            nextChoiceBtnTxt.setAttribute('value' + x);
            nextChoiceBtnTxt.setAttribute('height', '1');
            nextChoiceBtnTxt.setAttribute('width', '3');
            nextChoiceBtnTxt.setAttribute('position', '0 0.015 0.1')
            nextChoiceBtnTxt.setAttribute('material', 'color: black');
            char.appendChild(nextChoiceBtn);
            nextChoiceBtn.appendChild(nextChoiceBtnTxt);
            choiceButtons.appendChild(nextChoiceBtn);
        }
    } else {
        console.log('Opps something went wrong - There must already be some choice buttons on screen or the engine could not find the choices')
    }
}

function populateDiag(currentDiagID, currentChar) {
    const dialogueUI = document.getElementById('dialogueID');
    // add button test function
    showDialogueUI();

    // const choicesCheck = diag.passage[passageID].choices;
    // console.log(choicesCheck);
    // if (choicesCheck){
    // createChoiceButtons(choicesCheck.length)
    // }

    let newPassage = diag.passage[currentChar].text;
    let newCharName = diag.passage[currentChar].char;
    currentDiagID = currentChar;
    dialogueUI.setAttribute('text', 'wrapCount:' + 100);
    dialogueUI.setAttribute('text', 'width:' + 3);
    dialogueUI.setAttribute('text', 'value:' + newCharName + '\n' + newPassage);
}

function populateInteractions(interactionID, currentInteraction) {
    const dialogueUI = document.getElementById('dialogueID');
    const passageBtn = document.getElementById('nextPassageBtn');
    // add button test function
    showDialogueUI();
    // const passageBtn = document.getElementById('nextPassageBtn');
    if (!passageBtn) {
        addButton(currentInteraction);
    }
    let newPassage = interactions.interactions[interactionID].text;
    let newCharName = interactions.interactions[interactionID].char;
    currentDiagID = currentInteraction;
    dialogueUI.setAttribute('text', 'wrapCount:' + 100);
    dialogueUI.setAttribute('text', 'width:' + 3);
    dialogueUI.setAttribute('text', 'value:' + newCharName + '\n' + newPassage);
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

function removeButton() {
    const passageBtn = document.getElementById('nextPassageBtn');
    if (passageBtn != null) {
        bobGuy.removeChild(passageBtn);
    }
}

function gotKey(keyNum) {
    // arr the key here (current key)
    doors.push
}

// ROOM CREATION
// Create rooms loop - called at init
function createRooms() {
    const mapData = mapSource.data;
    let roomType = sceneMetadata.roomType;
    console.log(roomType)
    // char info
    const chars = mapSource.chars; const charNum = mapSource.charnumber;
    // allocate textures from JSON config
    let wallTexture = textures.textures[0].id; let floorTexture = textures.textures[1].id;
    let doorTexture = textures.textures[2].id; let wallTexture2 = textures.textures[3].id;
    let exitTexture = textures.textures[4].id; let waterTexture = textures.textures[5].id;
    let keyTexture = textures.textures[6].id;

    const WALL_SIZE = 1;
    const WALL_HEIGHT = 3.5;
    let el = document.getElementById('room')
    if (el===null){
        const scene = document.querySelector('a-scene');
        el = document.createElement('a-entity');
        el.setAttribute('id', 'room');
        scene.appendChild(el);
    }
    let door; let wall;
    if (roomType === "Indoor") {
        let ceil = document.createElement('a-box');
        let ceilArea = (mapSource.width * mapSource.height);
        ceil.setAttribute('width', ceilArea);
        ceil.setAttribute('height', ceilArea);
        ceil.setAttribute('rotation', '-90 0 0');
        ceil.setAttribute('position', '0 3.5 0');
        ceil.setAttribute('static-body', '');
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
        console.log('Mapsource pre loop outdoor' + mapSource);
        for (let x = 0; x < mapSource.height; x++) {
            for (let y = 0; y < mapSource.width; y++) {
                const i = (y * mapSource.height) + x;
                const floorPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            
                // flat floor for outdoor
                if (mapSource[i] === 0) {
                    console.log('loop', mapSource[i])
                    const floor = document.createElement('a-box');
                    floor.setAttribute('height', WALL_HEIGHT / 20);
                    floor.setAttribute('width', WALL_SIZE);
                    floor.setAttribute('depth', WALL_SIZE);
                    floor.setAttribute('static-body', '');
                    floor.setAttribute('position', floorPos);
                    // wall.setAttribute('load-texture', '');
                    floor.setAttribute('editor-listener', '');
                    floor.setAttribute('material', 'src:#' + floorTexture);
                    newRoom.appendChild(floor);
                }
            }
        }
        enviroment.setAttribute('environment', "preset: arches; ground:hills; groundYScale:1; playArea:300;  dressingAmount: 10; dressingVariance:1 2 1; shadow:true;");
        newRoom.appendChild(enviroment);
    }
    // LOOP to map geometry 
    for (let x = 0; x < mapSource.height; x++) {
        for (let y = 0; y < mapSource.width; y++) {
            const i = (y * mapSource.width) + x;
            const floorPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const position = `${((x - (mapSource.width / 2)) * WALL_SIZE)} ${(WALL_HEIGHT / 2)} ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const halfYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 1 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const quarterYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const charPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0.05 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const torchPosition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 4 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const keyPosition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0.4 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const stairsPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} ${(y - (mapSource.height)) * WALL_SIZE} ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            // char
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c" && mapData[i].charAt(1) === "h") {
                console.log("its a char!")
                let charNumber = mapData[i].charAt(4) ? String(mapData[i].charAt(4) + mapData[i].charAt(5)) : mapData[i].charAt(4);
                console.log(mapData[i].charAt(4));
                let char = addChar(charNumber);
                console.log('char ran and char is' + char)
                char.setAttribute('position', charPos);
                char.setAttribute('static-body', '');
                char.setAttribute('glowfx', 'visible:true;');
                char.setAttribute('character', 'charID:' + charNumber + ';');
                const floor = document.createElement('a-box');
                floor.setAttribute('height', WALL_HEIGHT / 20);
                floor.setAttribute('width', WALL_SIZE);
                floor.setAttribute('depth', WALL_SIZE);
                floor.setAttribute('static-body', '');
                floor.setAttribute('position', floorPos);
                floor.setAttribute('editor-listener', '');
                floor.setAttribute('material', 'src:#' + floorTexture);
                el.appendChild(floor);
                el.appendChild(char);
                // charLoopIndex++;
            }
            // playercam
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "P") {
                const playerPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 1.5 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
                updatePlayerPos(playerPos);
                const floor = document.createElement('a-box');
                floor.setAttribute('height', WALL_HEIGHT / 20);
                floor.setAttribute('width', WALL_SIZE);
                floor.setAttribute('depth', WALL_SIZE);
                floor.setAttribute('static-body', '');
                floor.setAttribute('position', floorPos);
                // wall.setAttribute('load-texture', '');
                floor.setAttribute('editor-listener', '');
                floor.setAttribute('material', 'src:#' + floorTexture);
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

                console.log('diaglogue trigger:' + diagTrigger + 'dialogueNum' + triggerNum);
                const prefabElm = document.createElement('a-entity');
                const prefabElmNum = prefabs.prefabs[1];
                console.log(prefabElmNum)
                prefabElm.setAttribute('gltf-model', '#' + prefabElmNum.id);
                prefabElm.setAttribute('scale', prefabElmNum.scale);
                prefabElm.setAttribute('rotation', prefabElmNum.rotation);
                prefabElm.setAttribute('animation-mixer', "clip: *; loop: repeat;");
                prefabElm.setAttribute('prefab', 'triggerDialogue:' + diagTrigger + ';diagNum:' + triggerNum + ';');
                prefabElm.setAttribute('id', 'prefab' + prefabElmNum.ID);
                const floor = document.createElement('a-box');
                floor.setAttribute('height', WALL_HEIGHT / 20);
                floor.setAttribute('width', WALL_SIZE);
                floor.setAttribute('depth', WALL_SIZE);
                floor.setAttribute('static-body', '');
                floor.setAttribute('position', floorPos);
                // wall.setAttribute('load-texture', '');
                floor.setAttribute('editor-listener', '');
                floor.setAttribute('material', 'src:#' + floorTexture);
                el.appendChild(floor);
                floor.appendChild(prefabElm);
            }
            // enemy slots
            if (mapData[i] === 9) {
                let enemy1 = addEnemy(1);
                enemy1.setAttribute('id', i);
                enemy1.setAttribute('status', 'alive');
                enemy1.setAttribute('animation-mixer', "clip: *; loop: repeat;");
                enemy1.setAttribute('mixamo.com', 'property:opacity;from: 1; to: 0;opacity:1 to 0;dur: 5000; easing: easeInOutSine; loop: false; startEvents: enemydead');
                // enemy1.setAttribute('animation-mixer', {timeScale: 1});
                enemy1.setAttribute('position', charPos);
                enemy1.setAttribute('static-body', '');
                const floor = document.createElement('a-box');
                floor.setAttribute('height', WALL_HEIGHT / 20);
                enemy1.setAttribute('enemy', 'modelID:' + enemy1.model + ';' +
                    'format:glb; animated:true;' + 'health:' + enemy1.health +
                    'id:' + i + 'constitution:' + enemy1.constitution);
                floor.setAttribute('width', WALL_SIZE);
                floor.setAttribute('depth', WALL_SIZE);
                floor.setAttribute('static-body', '');
                floor.setAttribute('position', floorPos);
                floor.setAttribute('editor-listener', '');
                floor.setAttribute('material', 'src:#' + floorTexture);
                el.appendChild(floor);
                el.appendChild(enemy1);
            }
            //  water
            if (mapData[i] === 6) {
                const water = document.createElement('a-plane');
                water.setAttribute('height', WALL_HEIGHT / 20);
                water.setAttribute('width', WALL_SIZE);
                water.setAttribute('depth', WALL_SIZE);
                water.setAttribute('static-body', '');
                water.setAttribute('position', floorPos);
                water.setAttribute('rotation', '90 0 0');
                water.setAttribute('scale', '1 5.72 2');
                water.setAttribute('material', 'src:#' + waterTexture + '; color:#86c5da; opacity: 0.85; transparent: true;side: double; shader:phong; reflectivity: 0.9; shininess: 70;');
                el.appendChild(water);
            }
            // add exit
            if (mapData[i] === 5) {
                wall.setAttribute('id', 'exit');
                wall.setAttribute('class', 'floor');
                wall.setAttribute('playermovement', '');
                wall.setAttribute('glow', '');
                // create component for exit  
                wall.setAttribute('exit', 'toLoad:' + nextSceneToLoad++ + ';');
                wall.setAttribute('material', 'src:#' + exitTexture);
                wall.setAttribute('color', 'green');
                // wall.setAttribute('color', 'green');
                const floor = document.createElement('a-box');
                floor.setAttribute('height', WALL_HEIGHT / 20);
                floor.setAttribute('width', WALL_SIZE);
                floor.setAttribute('depth', WALL_SIZE);
                floor.setAttribute('static-body', '');
                floor.setAttribute('position', floorPos);
                // wall.setAttribute('load-texture', '');
                floor.setAttribute('editor-listener', '');
                floor.setAttribute('material', 'src:#' + floorTexture);
                floor.setAttribute('playermovement', '');
                el.appendChild(floor);
            }
            // add torch / light
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "t") {
                console.log("its a torch!")
                let torch = addTorch('yellow', i);
                console.log('torch ran and char is' + torch)
                torch.setAttribute('position', torchPosition);
                // add floor 
                const floor = document.createElement('a-box');
                floor.setAttribute('height', WALL_HEIGHT / 20);
                floor.setAttribute('width', WALL_SIZE);
                floor.setAttribute('depth', WALL_SIZE);
                floor.setAttribute('static-body', '');
                floor.setAttribute('position', floorPos);
                // wall.setAttribute('load-texture', '');
                floor.setAttribute('editor-listener', '');
                floor.setAttribute('material', 'src:#' + floorTexture);
                floor.setAttribute('playermovement', '');

                el.appendChild(torch);
                el.appendChild(floor);
            }
            // add keys
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "K") {
                console.log("its a key!")
                // map data index 1 contains color coding b, y, r etc
                let key = addKey(mapData[i].charAt(1), i);
                key.setAttribute('position', keyPosition);
                key.setAttribute('material', 'src:#' + keyTexture);

                const floor = document.createElement('a-box');
                floor.setAttribute('height', WALL_HEIGHT / 20);
                floor.setAttribute('width', WALL_SIZE);
                floor.setAttribute('depth', WALL_SIZE);
                floor.setAttribute('static-body', '');
                floor.setAttribute('position', floorPos);
                floor.setAttribute('editor-listener', '');
                floor.setAttribute('material', 'src:#' + floorTexture);
                floor.setAttribute('playermovement', '');
                el.appendChild(floor);
                el.appendChild(key);
            }
            // add cam - UPDATE CONDITIONAL THIS IS TERRIBLE JSUT KEEPING IT FOR TESTING
            else if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c" && mapData[i].charAt(1) === "a") {
                const camPoint = document.createElement('a-entity');
                camPoint.setAttribute('id', 'cam' + [i]);
                camPoint.setAttribute('player', 'position:' + position);
                const camPointDebug = document.createElement('a-box');
                camPointDebug.setAttribute('visible', false)
                el.appendChild(camPoint);
            }
            // if the number is 1 - 5,  create a wall
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "0" || mapData[i] === 0 || mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                wall.setAttribute('material', 'src:#' + wallTexture);
                // console.log(el, wall'
                el.appendChild(wall);
                // floor standard
                if (mapData[i] === 0) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('class', 'floor');
                    wall.setAttribute('height', WALL_HEIGHT / 20);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', floorPos);
                    wall.setAttribute('playermovement', '');
                    wall.setAttribute('material', 'src:#' + floorTexture);
                }
                // custom floor height
                if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "0") {
                    let floorHeight1 = mapData[i].charAt(1) ? mapData[i].charAt(1) : 0;
                    let floorHeight2 = mapData[i].charAt(2) ? mapData[i].charAt(2) : 0;
                    let floorHeight = mapData[i].charAt(1) && mapData[i].charAt(2) ? floorHeight1 + floorHeight2 : floorHeight1;
                    let floorTrigger = floorHeight > 9 ? mapData[i].charAt(3) : mapData[i].charAt(2);
                    let triggerCheck = floorTrigger === 'T' ? true : false;
                    console.log(triggerCheck);
                    if (triggerCheck) {
                        console.log(floorTrigger, triggerCheck)
                        wall.setAttribute('triggerdiagfloor', '');
                        wall.setAttribute('glowfx', 'color:#ffde85;');
                    }
                    wall.setAttribute('class', 'wall');
                    wall.setAttribute('height', floorHeight);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', floorPos);
                    wall.setAttribute('material', 'src:#' + floorTexture);
                }
                // full height wall
                if (mapData[i] === 1) {
                    wall.setAttribute('class', 'wall');
                    wall.setAttribute('height', WALL_HEIGHT);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', position);
                    wall.setAttribute('material', 'src:#' + wallTexture);
                    wall.setAttribute('material', 'repeat:0.5 1');
                }
                // 1/2 height wall
                if (mapData[i] === 2) {
                    wall.setAttribute('class', 'wall');
                    wall.setAttribute('height', WALL_HEIGHT / 2);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', halfYposition);
                    wall.setAttribute('material', 'src:#' + wallTexture2);
                }
                //  1/4 height wall
                if (mapData[i] === 3) {
                    wall.setAttribute('class', 'wall');
                    wall.setAttribute('height', WALL_HEIGHT / 4);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', quarterYposition);
                    wall.setAttribute('material', 'src:#' + wallTexture2);
                }
                // door
                if (mapData[i] === 4) {
                    wall.setAttribute('id', 'door');
                    // create component for door / lock
                    wall.setAttribute('height', WALL_HEIGHT);
                    wall.setAttribute('door', 'false');
                    wall.setAttribute('locked', 'false');
                    wall.setAttribute('door', '');
                    wall.setAttribute('scale', '1 1 0.89');
                    wall.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1');
                    const floor = document.createElement('a-box');
                    floor.setAttribute('height', WALL_HEIGHT / 20);
                    floor.setAttribute('width', WALL_SIZE);
                    floor.setAttribute('depth', WALL_SIZE);
                    floor.setAttribute('static-body', '');
                    floor.setAttribute('position', floorPos);
                    floor.setAttribute('editor-listener', '');
                    floor.setAttribute('material', 'src:#' + floorTexture);
                    floor.setAttribute('playermovement', '');
                    el.appendChild(floor);
                }
                // door locked
                if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "4" && mapData[i].charAt(1) === "_") {
                    let doorNum2 = mapData[i].charAt(2) ? mapData[i].charAt(2) : 0;
                    let doorNum = doorNum2;
                    wall.setAttribute('id', 'door');
                    // door locked set num 
                    wall.setAttribute('height', WALL_HEIGHT);
                    wall.setAttribute('door', 'doorLockNum:' + doorNum);
                    wall.setAttribute('locked', 'true');
                    wall.setAttribute('material', 'src:#' + doorTexture + ';repeat: 1 1');
                    const floor = document.createElement('a-box');
                    floor.setAttribute('height', WALL_HEIGHT / 20);
                    floor.setAttribute('width', WALL_SIZE);
                    floor.setAttribute('depth', WALL_SIZE);
                    floor.setAttribute('static-body', '');
                    floor.setAttribute('position', floorPos);
                    floor.setAttribute('editor-listener', '');
                    floor.setAttribute('material', 'src:#' + floorTexture);
                    floor.setAttribute('playermovement', '');
                    el.appendChild(floor);
                }
            }
        }
    }
    // top down map update pos - FUTURE FEATURE
    // MapMaker(mapData);
}

// Map on 2D Map?
// function MapMaker(mapData) {
//     const playerMap = document.createElement('a-entity');
//     playerMap.setAttribute('playermap', '');
//     document.querySelector('#mapUI').appendChild(playerMap)
// }

function createOutdoorFloor(floorNum) {
    let floorPanels = [];
    for (let i = 0; i < floorNum; i++) {
        floorPanels.push(0);
    }
    console.log(floorPanels)
    return floorPanels;
}

// COMBAT SYSTEM -->
// SHOOT
function shootAt(enemyID) {
    const currentEnemy = enemies.enemies[enemyID]; let enemyConst = parseInt(currentEnemy.constitution);
    let playerDicerollDmg = 0; let playerDicerollHit = RandomDiceRoll(1, CombatDiceNumber);
    console.log('player hitroll ' + playerDicerollHit)
    let attackAudio = document.querySelector("#playerattack");
    attackAudio.play();
    triggerMuzzleFX();

    if (playerDicerollHit >= enemyConst) {
        let hitAudio = document.querySelector("#hit");
        hitAudio.play();
        playerDicerollDmg = RandomDiceRoll(1, CombatDMGDiceNumber);
        console.log('You hit! ' + playerDicerollHit / CombatDiceNumber + 'The enemy takes' + playerDicerollDmg);
        return playerDicerollDmg;
    } else {
        console.log(playerDicerollHit / CombatDiceNumber + 'You Missed! and caused ' + playerDicerollDmg + 'damage');
        return playerDicerollDmg;
    }
}
// MELEE ENEMY ATTACK
function enemyCombatAttack(enemyID) {
    const currentEnemy = enemies.enemies[enemyID];
    let playerConst = parseInt(player.constitution);
    let enemyDicerollDmg = 0;
    let enemyDicerollHit = RandomDiceRoll(1, CombatDiceNumber);
    console.log('player hitroll ' + enemyDicerollHit)
    let attackAudio = document.querySelector("#attack");
    attackAudio.play();
    if (enemyDicerollHit >= playerConst) {
        let hitAudio = document.querySelector("#playerhit");
        hitAudio.play();
        enemyDicerollDmg = RandomDiceRoll(1, CombatDMGDiceNumber);
        console.log('The Enemy hit you ' + enemyDicerollHit / CombatDiceNumber + ' you take' + enemyDicerollDmg);
        player.health = -enemyDicerollDmg;
        console.log(player.health);
    } else {
        console.log(enemyDicerollHit / CombatDiceNumber + 'You Missed! and caused ' + enemyDicerollDmg + 'damage');
        return enemyDicerollDmg;
    }
}

// RETURN player health
function getPlayerHealth() {
    if (player) {
        return player.health;
    }
}

// FX AND 3D UI 0--0
function triggerMuzzleFX() {
    console.log('triggerMUZZLE FX');
    const muzzle = document.getElementById('muzzleFX');
    console.log(muzzle);
    muzzle.setAttribute('visible', true);
    let shotAudio = document.querySelector("#pistolshot");
    shotAudio.play();
    setTimeout(stopMuzzle, 300);

    function stopMuzzle() {
        muzzle.setAttribute('visible', false);
    }
}

function createHealthBar() {
    // player health bar UI
    const PlayerhealthBar = document.createElement('a-box');
    const PlayerhealthBarTracker = document.createElement('a-box');
    let PlayerhealthBarVal = 100;
    PlayerhealthBar.setAttribute('height', 0.5);
    PlayerhealthBar.setAttribute('position', '0 8 0');
    PlayerhealthBar.setAttribute('width', 3);
    PlayerhealthBar.setAttribute('depth', 0.1);
    PlayerhealthBar.setAttribute('material', 'color:white');
    PlayerhealthBarTracker.setAttribute('height', 0.4);
    PlayerhealthBarTracker.setAttribute('width', PlayerhealthBarVal.toString());
    PlayerhealthBarTracker.setAttribute('depth', 0.1);
    PlayerhealthBarTracker.setAttribute('position', '0 0 0.1');
    PlayerhealthBarTracker.setAttribute('material', 'color:red');
    PlayerhealthBarTracker.setAttribute('HealthBarid', id);
    PlayerhealthBar.appendChild(PlayerhealthBarTracker);
    newFace.appendChild(PlayerhealthBar);
}

// RANDOM AND UTILS ?
// simulate random dice roll
function RandomDiceRoll(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// Update Player pos
function updatePlayerPos(newPlayPos) {
    document.querySelector('#playercam').setAttribute('position', newPlayPos);
}

function clearScene() {
    const el = document.getElementById('room');
    const scene = document.querySelector('a-scene');
    el.parentNode.removeChild(el);
}

// EXPORTS 
export { nextScene, loadNewLevel, populateDiag, populateInteractions, clearScene, loadData, shootAt, enemyCombatAttack, getPlayerHealth };