// main js 
// ENGINE CODE 

// Reassignable global game stare vars
let player; let player1;
// CONFIG CHARECTERS AND ENEMIES STORE
let config; let chars; let enemies;
// Diagoloue and scene metadata shit
let diag; let sceneMetadata;
let custumEnemyModelPaths = [];
let lockedDoors = [];
// STORE TEXTURE INFO
let textures; let prefabs;
// diaglog UI Globals / shit 
let currentDiagID = 0; let currentScene = 1;
let currentChar = 0; let mapSource = 0;
// combat var defaults SIMULATED DICE - Combat system is based on D and D - INIT vals / max 
let CombatDiceNumber = 6;
let CombatDMGDiceNumber = 6;
// dialogueUI Elements Based on a-frame defaults 
const scene = document.querySelector('a-scene'); const assets = document.querySelector('a-assets');

async function loadData(currentScene) {
    //game vars
    //config and diagloue loading
    await loadPlayer();
    await loadTextures(currentScene);
    await loadConfig();
    await loadChars();
    await loadEnemies();
    await loadPrefabs();
    await loadDiag(1);
    //scene loading / aFrame loading
    await loadMap(currentScene);
    await loadSceneMetaData(currentScene);
    await setupPlayerInfo();
    // run create scene routine
    await createRooms();
    await populateDiag(0);
    // testing dialogue.json UI population
    const sound = document.querySelector('[sound]');
    sound.components.sound.playSound();
}

// Load engine Config file (JSON) - As the engine relies on configurable json there can be custum values 
async function loadConfig() {
    const res = await fetch('config.json'); config = await res.json();
    CombatDiceNumber = config.CombatDiceNumber; CombatDMGDiceNumber = config.CombatDMGDiceNumber;
    console.log('combat dice num' + CombatDiceNumber, CombatDMGDiceNumber)
}

async function loadPlayer() {
    const res = await fetch('player.json')
    player = await res.json();
}

async function loadChars() {
    const res = await fetch('characters.json')
    chars = await res.json();
}

async function loadDiag(sceneToLoad) {
    let fetchURL = './scenes/scene' + sceneToLoad + '/dialogue.json';
    const res = await fetch(fetchURL)
    diag = await res.json();
    console.log(diag);
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

function setupPlayerInfo() {
    player = {
        name: player.name,
        health: player.health,
        strength: player.strength,
        constitution: player.strength,
        // player model face states - WIP WHEN UI is done - DOOM injury states 
        playerFaceState: player.playerFaceState,
        playerFaceState25: player.playerFaceState25,
        playerFaceState50: player.playerFaceState50,
        playerFaceState85: player.playerFaceState85,
        playerFaceStateDead: player.playerFaceStateDead,
    }
}

//Add chareceter to scene function 
function addChar(charID) {
    console.log(chars.characters[charID].id, chars.characters[charID].name);
    let modelRef = chars.characters[charID].id;
    let modelID = '#' + modelRef;
    console.log(modelRef);
    let char = document.createElement('a-entity');
    char.setAttribute('id', chars.characters[charID].name);
    char.setAttribute('name', chars.characters[charID].name);
    char.setAttribute('gltf-model', modelID);
    char.setAttribute('scale', "1 1 1");
    char.setAttribute('animation-mixer', "clip: *; loop: repeat;");
    return char;
}

//Add chareceter to scene function 
function addEnemy(enemyID) {
    console.log(enemies.enemies[enemyID].id, enemies.enemies[enemyID].name);
    let modelRef = enemies.enemies[enemyID].id;
    let modelID = '#' + modelRef;
    console.log(modelRef);
    let enemy = document.createElement('a-entity');
    enemy.setAttribute('id', chars.characters[charID].name);
    enemy.setAttribute('name', chars.characters[charID].name);
    enemy.setAttribute('gltf-model', modelID);
    enemy.setAttribute('scale', "1 1 1");
    enemy.setAttribute('animation-mixer', "clip: *; loop: repeat;");
    return enemy;
}


// Add a torch to geometry 
function addTorch(torchColor, torchIndex) {
    let torch = document.createElement('a-box');
    torch.setAttribute('id', torch + [torchIndex]);
    let fire = document.createElement('a-entity');
    fire.setAttribute('light', 'type: point; intensity: 0.10; distance: 1; decay: 0');
    fire.setAttribute('color' + torchColor);
    torch.appendChild(fire);
    return torch;
}

function populateDiag(passageID, currentChar) {
    const dialogueUI = document.getElementById('dialogueID');
    // add button test function
    showDialogueUI();
    const passageBtn = document.getElementById('nextPassageBtn');
    if (passageBtn){
        addButton(currentChar);
    }

    let newPassage = diag.passage[passageID].text;
    let newCharName = diag.passage[passageID].char;
    currentDiagID = passageID;
    dialogueUI.setAttribute('text', 'wrapCount:' + 80);
    dialogueUI.setAttribute('text', 'width:' + 3, 4);
    dialogueUI.setAttribute('text', 'value:' + newCharName + '\n' + newPassage);
}

// make glow component show on specified char indicating char speaking
function makeCharActive(charID) {
    const charRef = document.getElementById(charID);
    if (charRef.getAttribute('glowfx', 'visible:false;')) {
        charRef.setAttribute('glowfx', 'visible:true;');
    }
}

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

async function loadNewLevel(mapToLoad){
    await clearScene();
    await loadMap(mapToLoad);
    await loadSceneMetaData(mapToLoad);
    await createRooms();
}

function showDialogueUI() {
    const dialogueUI = document.getElementById('dialogueID');
    dialogueUI.setAttribute('visible', true);
}

function hideDialogueUI() {
    const dialogueUI = document.getElementById('dialogueID')
    dialogueUI.setAttribute('visible', false);
}

// show passagebtn relative to character model
function addButton() {
    // console.log('charID passed' + activeChar);
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
        let char = document.getElementById('bobGuy') // FOR TESTING PURPOSES - needs to be passed associated char
        char.appendChild(nextPassageBtn);
        nextPassageBtn.appendChild(nextPassageBtnTxt);

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

function gotKey(keyNum) {
    doors.push
}

// Create rooms loop - called at init
function createRooms() {
    const mapData = mapSource.data;
    let roomType = sceneMetadata.roomtype;
    // char info
    const chars = mapSource.chars; const charNum = mapSource.charnumber;
    let charLoopIndex = 0;
    // allocate textures from JSON config
    let wallTexture = textures.textures[0].id; let floorTexture = textures.textures[1].id;
    let doorTexture = textures.textures[2].id; let wallTexture2 = textures.textures[3].id;
    let exitTexture = textures.textures[4].id; let waterTexture = textures.textures[5].id;

    const WALL_SIZE = 0.8;
    const WALL_HEIGHT = 3.5;
    const el = document.getElementById('room')

    let door; let wall;

    if (roomType === "Indoor") {
        let ceil = document.createElement('a-box');
        let ceilArea = (mapSource.width * mapSource.height);
        ceil.setAttribute('width', ceilArea);
        ceil.setAttribute('height', ceilArea);
        ceil.setAttribute('rotation', '-90 0 0');
        ceil.setAttribute('position', '0 3.5 0');
        ceil.setAttribute('static-body', '');
        ceil.setAttribute('scale', '0.2 0.2 0.2');
        ceil.setAttribute('material', 'src: #grunge; repeat: 10 10');
        el.appendChild(ceil);
    }
    // LOOP to map geometry 
    for (let x = 0; x < mapSource.height; x++) {
        for (let y = 0; y < mapSource.width; y++) {
            const i = (y * mapSource.width) + x;
            const floorPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const position = `${((x - (mapSource.width / 2)) * WALL_SIZE)} ${(WALL_HEIGHT / 2)} ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const halfYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 1 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const quarterYposition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const charPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 0 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const torchPosition = `${((x - (mapSource.width / 2)) * WALL_SIZE)} 4 ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            const stairsPos = `${((x - (mapSource.width / 2)) * WALL_SIZE)} ${(y - (mapSource.height)) * WALL_SIZE} ${(y - (mapSource.height / 2)) * WALL_SIZE}`;
            // char
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "c" && mapData[i].charAt(1) === "h") {
                console.log("its a char!")
                let char = addChar(charLoopIndex);
                console.log('char ran and char is' + char)
                char.setAttribute('position', charPos);
                char.setAttribute('static-body', '');
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
                el.appendChild(char);
                charLoopIndex++;
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
                console.log('diaglogue trigger:'+diagTrigger+'dialogueNum'+ triggerNum);
                const prefabElm = document.createElement('a-entity');
                const prefabElmNum = prefabs.prefabs[1];
                console.log(prefabElmNum)
               
                prefabElm.setAttribute('gltf-model', '#'+prefabElmNum.id);
                prefabElm.setAttribute('scale', prefabElmNum.scale);
                prefabElm.setAttribute('rotation', prefabElmNum.rotation);
                prefabElm.setAttribute('animation-mixer', "clip: *; loop: repeat;");
                prefabElm.setAttribute('prefab', 'triggerDialogue:'+diagTrigger+';diagNum:'+triggerNum+';');
                prefabElm.setAttribute('id', 'prefab'+prefabElmNum.ID);

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
                const enemy1 = document.createElement('a-entity');
                const enemyNum = enemies.enemies[0];
                console.log(enemyNum)
                enemy1.setAttribute('enemy', 'modelID:' + enemyNum.model + ';' +
                    'format:glb; animated:true;' + 'health:' + enemyNum.health +
                    'id:' + i + 'constitution:' + enemyNum.constitution + 'scale:' + enemyNum.scale);
                enemy1.setAttribute('id', i);
                enemy1.setAttribute('class', enemyNum.name);
                enemy1.setAttribute('status', 'alive');
                // this is for handling enemy death animation
                enemy1.setAttribute('animation__001', 'property:opacity;from: 1; to: 0;opacity:1 to 0;dur: 5000; easing: easeInOutSine; loop: false; startEvents: enemydead');
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
                floor.appendChild(enemy1);
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
                water.setAttribute('scale', '1 4.6 2');
                water.setAttribute('material', 'src:#' + waterTexture + '; color:#86c5da; opacity: 0.85; transparent: true;side: double; shader:phong; reflectivity: 0.9; shininess: 70;');
                el.appendChild(water);
            }
            // add exit
            if (mapData[i] === 5) {
                wall.setAttribute('id', 'exit');
                wall.setAttribute('class', 'floor');
                wall.setAttribute('playermovement', '');
                // create component for exit  
                wall.setAttribute('exit', '');
                wall.setAttribute('material', 'src:#' + exitTexture);
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
                el.appendChild(torch);
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
                    wall.setAttribute('class', 'floor');
                    wall.setAttribute('height', floorHeight);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', floorPos);
                    wall.setAttribute('material', 'src:#' + floorTexture);
                }
                // full height wall
                if (mapData[i] === 1) {
                    wall.setAttribute('height', WALL_HEIGHT);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', position);
                    wall.setAttribute('material', 'src:#' + wallTexture);
                    wall.setAttribute('material', 'repeat:0.5 1');
                }
                // Posterwall - WIP
            //     if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "1") {
            //     let posterNum = mapData[i].charAt(2) ? mapData[i].charAt(2) : 0;
            //     wall.setAttribute('height', WALL_HEIGHT);
            //     wall.setAttribute('static-body', '');
            //     wall.setAttribute('position', position);
            //     wall.setAttribute('material', 'src:#' + wallTexture);
            //     wall.setAttribute('material', 'repeat:0.5 1');
            //     let poster = document.createElement('a-box');
            //     let posterZ = position.z+0.5; let x = position.x; let y = position.y;
            //     poster.setAttribute('width', WALL_SIZE);
            //     poster.setAttribute('height', WALL_HEIGHT);
            //     poster.setAttribute('depth', WALL_SIZE);
            //     poster.setAttribute('position', x,y,posterZ);
            //     poster.setAttribute('material', 'src:#' + 'poster');
            //     el.appendChild(poster);          
            //   }
                // 1/2 height wall
                if (mapData[i] === 2) {
                    wall.setAttribute('height', WALL_HEIGHT / 2);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', halfYposition);
                    wall.setAttribute('material', 'src:#' + wallTexture2);
                }
                //  1/4 height wall
                if (mapData[i] === 3) {
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


// COMBAT SYSTEM
// MELEE ATTACK PLAYER 
function startMeleeCombatAttack(enemyID) {
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
        enemyCombatAttack();
        return playerDicerollDmg;
    } else {
        console.log(playerDicerollHit / CombatDiceNumber + 'You Missed! and caused ' + playerDicerollDmg + 'damage');
        enemyCombatAttack();
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

// simulate random dice roll
function RandomDiceRoll(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}


// Update Player pos
function updatePlayerPos(newPlayPos) {
    document.querySelector('#player').setAttribute('position', newPlayPos);
}

function clearScene() {
    const el = document.getElementById('room');
    const scene = document.querySelector('a-scene');
    el.parentNode.removeChild(el);
    // ADD ENTITY BACK
    const newRoom = document.createElement('a-entity');
    newRoom.setAttribute('id', 'room');
    scene.appendChild(newRoom)
};

// EXPORT JS 
export { nextScene, loadNewLevel, populateDiag, clearScene, loadData, startMeleeCombatAttack, enemyCombatAttack, getPlayerHealth };