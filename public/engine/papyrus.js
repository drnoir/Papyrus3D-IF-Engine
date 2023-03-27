// main js 
// ENGINE CODE 

// Reassignable global game stare vars
let player; let player1;
// CONFIG CHARECTERS AND ENEMIES STORE
let config; let chars; let enemies;
// Diagoloue and scene metadata shit
let diag; let sceneMetadata;
// STORE TEXTURE INFO
let textures;
// diaglog UI Globals / shit 
let currentDiagID = 0;let currentScene = 1;
let currentChar = 0;let mapSource = 0;let turn = 0;
// combat var defaults SIMULATED DICE - Combat system is based on D and D - INIT vals / max 
let CombatDiceNumber = 6;
let CombatDMGDiceNumber = 6;
// dialogueUI Elements Based on a-frame defaults 
const scene = document.querySelector('a-scene');
const assets = document.querySelector('a-assets');

// loadData();

async function loadData() {
//game vars
//config and diagloue loading
    await loadPlayer();
    await loadTextures(1);
    await loadConfig();
    await loadChars();
    await loadEnemies();
    await loadDiag(1);
    //scene loading / aFrame loading
    await loadMap(1);
    await loadSceneMetaData(1);
    await setupPlayerInfo();
    // run create scene routine
    await createRooms();
    // await populateScene(); What does this do - CHECK 
    // await populateDiag(0) - restore later when adding diag func
    // testing dialogue.json UI population
    turn++;
    const sound = document.querySelector('[sound]');
    sound.components.sound.playSound();
    // Testing
    console.log(config, chars, enemies, diag, mapSource, textures);
}

// Load engine Config file (JSON) - As the engine relies on configurable json there can be custum values 
async function loadConfig() {
    const res = await fetch('config.json')
    config = await res.json();
    CombatDiceNumber = config.CombatDiceNumber;
    CombatDMGDiceNumber = config.CombatDMGDiceNumber;
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

async function loadEnemies() {
    const res = await fetch('enemies.json')
    enemies = await res.json();
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
    let fetchURL = './scenes/scene' + textureScene + '/textures.json';
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

function setupPlayerInfo() {
    player1 = {
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
    // char.setAttribute(' glowfx', "color:red;");
    // char.setAttribute('position', '0 -5 -5');
    char.setAttribute('scale', "3 3 3");
    char.setAttribute('animation-mixer', "clip: *; loop: repeat;");
    return char;
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

//Move to next dialogue passage  
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

//Populate diagloue information with current passage 
function populateDiag(passageID, currentChar) {
    const dialogueUI = document.getElementById("dialogueID");
    // add button test function
    addButton(currentChar);
    let newPassage = diag.passage[passageID].text;
    let newCharName = diag.passage[passageID].char;
    currentDiagID = passageID;
    // TEXT WRAPPING
    dialogueUI.setAttribute('text', 'wrapCount:' + 125); dialogueUI.setAttribute('text', 'width:' + 3, 2);
    dialogueUI.setAttribute('text', 'value:' + newCharName + '\n' + newPassage);
}

// make glow component show on specified char indicating char speaking
function makeCharActive(charID) {
    const charRef = document.getElementById(charID);
    if (charRef.getAttribute('glowfx', 'visible:false;')) {
        charRef.setAttribute('glowfx', 'visible:true;');
    }
}

// Create rooms loop - called at init
function createRooms() {
    const mapData = mapSource.data;
    let roomType = sceneMetadata.roomtype;
    // TEST
    console.log(mapData, mapSource.height);
    // char info
    const chars = mapSource.chars; const charNum = mapSource.charnumber;
    let charLoopIndex = 0;
    // allocate textures from JSON config
    let wallTexture = textures.textures[0].id;
    let floorTexture = textures.textures[1].id;
    let doorTexture = textures.textures[2].id;
    let wallTexture2 = textures.textures[3].id;
    console.log(typeof wallTexture);

    const WALL_SIZE = 0.8;
    const WALL_HEIGHT = 5;
    const el = document.getElementById('room')
    // let playerPos;

    let door;
    let wall;
    if (roomType === "Indoor") {
        let ceil = document.createElement('a-box');
        let ceilArea = (mapSource.width * mapSource.height);
        ceil.setAttribute('width', ceilArea);
        ceil.setAttribute('height', ceilArea);
        ceil.setAttribute('rotation', '-90 0 0');
        ceil.setAttribute('position', '0 5 0');
        ceil.setAttribute('static-body', '');
        ceil.setAttribute('scale', '0.2 0.2 0.2');
        ceil.setAttribute('material', 'src: #grunge; repeat: 5 5');
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
                el.appendChild(char);
                charLoopIndex++;
            }
            // play pos
            // else if (mapData === 100) {
            //     const playerFace = document.createElement('a-entity');
            //     const playerAim= document.createElement('a-entity');
            //     const camera = document.createElement('a-entity');
            //     // // this is for handling enemy death animation
            //     // enemy1.setAttribute('animation__001', 'property:opacity;from: 1; to: 0;opacity:1 to 0;dur: 5000; easing: easeInOutSine; loop: false; startEvents: enemydead');
            //     const playerStart = document.createElement('a-entity');
            //     playerStart.setAttribute('playercam', '');
            //     playerStart.setAttribute('position', position)
            //     playerStart.setAttribute('static-body', '');
            //     playerStart.setAttribute('id', i);
            //     playerStart.setAttribute('class', player.name);
            //
            //     camera.setAttribute('camera', '');
            //     camera.setAttribute('look-controls')
            //     camera.setAttribute('wasd-controls', '');
            //
            //     playerFace.setAttribute('playerface', player.playerFaceState +
            //         'format:glb;animated:true;' + 'health:' + player.health +
            //         'id:' + i + 'scale:' + player.scale + 'position:' + player.position);
            //     playerFace.setAttribute('id', i);
            //     playerFace.setAttribute('class', player.name);
            //     playerFace.setAttribute('status', 'alive');
            //
            //     playerAim.setAttribute( 'animation__click',"property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1");
            //     playerAim.setAttribute(  'animation__fusing',"property: scale; startEvents: fusing; easing: easeInCubic; dur: 1500; from: 1 1 1; to: 0.1 0.1 0.1")
            //     playerAim.setAttribute(' animation__mouseleave', 'property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 500; to: 1 1 1');
            //     playerAim.setAttribute(  'cursor', "fuse: true;")
            //     playerAim.setAttribute('color', 'white; shader: flat');
            //     playerAim.setAttribute('position', '0 0 -1');
            //     playerAim.setAttribute('geometry', "primitive: ring; radiusInner: 0.2; radiusOuter: 0.25;")
            //     playerAim.setAttribute('scale', "0.1 0.1 0.1")
            //
            //     let floor = document.createElement('a-box');
            //     floor.setAttribute('height', WALL_HEIGHT / 20);
            //     floor.setAttribute('width', WALL_SIZE);
            //     floor.setAttribute('depth', WALL_SIZE);
            //     floor.setAttribute('static-body', '');
            //     floor.setAttribute('position', floorPos);
            //     floor.setAttribute('editor-listener', '');
            //     floor.setAttribute('material', 'src:#' + floorTexture);
            //     el.appendChild(floor);
            //
            //     el.appendChild(playerStart);
            //     playerStart.appendChild(camera);
            //     camera.appendChild(playerAim);
            //     el.appendChild(floor);
            // }

            // enemy slots
            if (mapData[i] === 9) {
                const enemy1 = document.createElement('a-entity');
                const enemyNum = enemies.enemies[0];
                console.log(enemyNum)
                enemy1.setAttribute('enemy', 'modelPath:./models/hellknight/hellknightGLB.glb; ' +
                    'format:glb;animated:true;' + 'health:' + enemyNum.health +
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
            // if the number is 1 - 4, create a wall
            if (mapData[i] === 0 || mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                wall.setAttribute('material', 'src:#' + wallTexture);
                // console.log(el, wall'
                el.appendChild(wall);

                // floor
                if (mapData[i] === 0) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT / 20);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', floorPos);
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('playermovement', '');
                    wall.setAttribute('material', 'src:#' + floorTexture);
                }
                // full height wall
                if (mapData[i] === 1) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT);
                    wall.setAttribute('static-body', '');
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('position', position);
                    wall.setAttribute('material', 'src:#' + wallTexture);
                }
                // 1/2 height wall
                if (mapData[i] === 2) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT / 2);
                    wall.setAttribute('static-body', '');
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('position', halfYposition);
                    wall.setAttribute('material', 'src:#' + wallTexture2);
                }
                //  1/4 height wall
                if (mapData[i] === 3) {
                    wall.setAttribute('height', WALL_HEIGHT / 4);
                    wall.setAttribute('static-body', '');
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('position', quarterYposition);
                    wall.setAttribute('material', 'src:#' + wallTexture2);
                }
                // door
                if (mapData[i] === 4) {
                    wall.setAttribute('id', 'door');
                    // create component for door / lock
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('door', 'false');
                    wall.setAttribute('locked', 'false');
                    wall.setAttribute('material', 'src:#' + doorTexture);
                }
            }
        }
    }
    // top down map update pos - TEST
    MapMaker(mapData);
}

// Map on 2D Map?
function MapMaker(mapData) {
    const playerMap = document.createElement('a-entity');
    playerMap.setAttribute('playermap', '');
    document.querySelector('#mapUI').appendChild(playerMap)
}

// DIALOGUE OPTIONS - WIP 

// show passagebtn relative to character model I.E BELOW
function addButton(activeChar) {
    console.log('charID passed' + activeChar);
    // check if there is an existing button element first before adding a new one
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

// COMBAT SYSTEM 

// MELEE ATTACK PLAYER 
function startMeleeCombatAttack(enemyID) {
    const currentEnemy = enemies.enemies[enemyID]; let enemyConst = parseInt(currentEnemy.constitution);
    let playerDicerollDmg = 0; let playerDicerollHit = RandomDiceRoll(1, CombatDiceNumber);
    console.log('player hitroll ' + playerDicerollHit)
    let attackAudio = document.querySelector("#playerattack");
    attackAudio.play();
    
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
        player1.health = -enemyDicerollDmg;
        console.log(player1.health);
    } else {
        console.log(enemyDicerollHit / CombatDiceNumber + 'You Missed! and caused ' + enemyDicerollDmg + 'damage');
        return enemyDicerollDmg;
    }
}

// RETURN player health
function getPlayerHealth() {
    if (player1) {
        return player1.health;
    }
}

// UNCOMMOMENT WHEN TESTING PLAYERFACE FUNC (LATER)
// function c(playerHealth) {
//     let playerFace = document.window.getElementById('playerFace');
//     // add setup assign player face
//     switch (playerHealth) {
//         case player1.health = player1.health / 100 + 25:
//             playerFace = // modelref
//             break;
//         case:
//             player1.health = player1.health / 100 - 50;
//             playerFace = // modelref
//             return
//             break;
//         case:
//             player1.health = player1.health / 100 - 75;
//             playerFace = // modelref
//             break;
//         case:
//             player1.health = player1.health / 100 + 85;
//             playerFace = // modelref
//             break;
//         case:
//             player1.health = 0;
//             playerFace = // modelref
//             break;
//         default:
//     }
// }

// simulate random dice roll
function RandomDiceRoll(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// remove next button (UNTESTED)
function removeButton() {
    const passageBtn = document.getElementById('nextPassageBtn');
    if (passageBtn != null) {
        bobGuy.removeChild(passageBtn);
    }
}

// Update Player pos
function updatePlayerPos(newPlayPos) {
    document.querySelector('#player').setAttribute('position', newPlayPos);
}
// EXPORT JS 
export {nextScene, loadData, startMeleeCombatAttack, enemyCombatAttack, getPlayerHealth};