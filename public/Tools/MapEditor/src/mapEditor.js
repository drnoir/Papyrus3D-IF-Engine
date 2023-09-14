// map editor js - main js scrupt for the map editor for creating maps

//ADD TORCHES * TOD'S 
//PREFABS / TRIGGERS UI, 72, 72T2
//CHAR ID's - Looks at enemeis - Char+num
//Cylinders C
//Doors / locked / keys, 4, 4L, KB, KY, KR
//Exit 5 
//trigger Floor + trigger 20 T20
//damage floor 0HU20
//WATER - 6
// Playerstart P

// global map editor vars 
let sceneMetadata; let textures; let mapTemplate = [];
// prefabs are represented just by dummy models I think is best?
let prefabNew = '71T1';
let templateSize = 25;
let templateWalled = true;
let chars;
let mapRes;
let saveNum = 1;
let wallHeight = 5;
let heightY = 2.5
let currentEntity = 1;
let custumHeightString = '01'

// reassingnle textures allocation
let wallTexture; let floorTexture;
let doorTexture; let wallTexture2; let wallTexture3;
let waterTexture;

// custum height mode
let heightMode = false;
let playerPlaceMode = false;
let custumHeightY = 1;
let currentEntityCustom = 0;

// possible options - wall, door, enemies
let paintMode = ['wall', 'enemies', 'door', 'delete', 'height', 'prefabs', 'water', 'chars', 'lights'];
let currentPrefab = 0;

// boolean for triggger mode when in prefabs mode
let prefabTriggerMode = false;

const prefabs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let currentPaintMode = paintMode[0];
let deleteMode = false;

// char
const charIDRef = document.getElementById('charID');
let charID = charIDRef.value;

// scene elements
const scene = document.querySelector('a-scene');
const assets = document.querySelector('a-assets');

//buttons / ui
const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.addEventListener('mousedown', (event) => {
    exportJSON();
});

function clearScene() {
    const el = document.getElementById('room');
    el.parentNode.removeChild(el);
}

AFRAME.registerComponent('editor-listener', {
    schema: {
        parse: AFRAME.utils.styleParser.parse,
        visible: { type: 'boolean', default: true },
        index: { type: 'number', default: 0 },
        colors: { type: 'array', default: ['red', 'white'] }
    },
    init: function () {
        const data = this.data;
        let index = data.index;
        const el = this.el;
        this.el.addEventListener('mousedown', function (evt) {
            console.log('current enttity should be ' + currentEntity);
            const WALL_HEIGHT = wallHeight;
            if (currentPaintMode === "wall") {
                el.setAttribute('material', 'src:#' + wallTexture);
                el.setAttribute('height', wallHeight);
                if (currentEntity === 1 && !deleteMode && !heightMode) {
                    el.object3D.position.y = 2.5;
                } else if (currentEntity === 2 && !deleteMode && !heightMode) {
                    el.object3D.position.y = 1;
                    el.setAttribute('material', 'src:#' + wallTexture2);
                }
                else if (currentEntity === 3 && !deleteMode && !heightMode) {
                    el.object3D.position.y = 0.5;
                    el.setAttribute('material', 'src:#' + wallTexture3);
                }
                else if (currentEntity === 0 && deleteMode && !heightMode) {
                    el.object3D.position.y = 0;
                    el.setAttribute('height', WALL_HEIGHT / 20);
                    el.setAttribute('material', 'src:#' + floorTexture);
                }
                else if (currentEntity.charAt(0) === "0" && currentEntity.charAt(1) !== null && !deleteMode && heightMode) {
                    console.log('custum wall height draw on scene');
                    custumHeightString = '0' + currentEntityCustom.toString();
                    let floorHeight = custumHeightY;
                    el.setAttribute('class', 'floor');
                    el.setAttribute('height', floorHeight);
                    el.setAttribute('static-body', '');
                    el.setAttribute('material', 'src:#' + floorTexture);
                }
                else {
                    el.object3D.position.y = 0;
                    el.setAttribute('height', WALL_HEIGHT / 20);
                    el.setAttribute('material', 'src:#' + floorTexture);
                }
            }

            // check if playerstart on map first 
            const playerMarker = document.getElementById('playerStart');
            if (playerPlaceMode && currentEntity === "P" && !deleteMode && !heightMode && playerMarker === null) {
                // custumHeightString = '0' + currentEntityCustom.toString();
                const playerPlaceElm = document.createElement('a-box');
                const playerText = document.createElement('a-text');
                playerText.setAttribute('value', 'PLAYER START');
                playerText.object3D.position.y = 1;
                playerText.object3D.position.x = -0.5;
                playerPlaceElm.setAttribute('height', WALL_HEIGHT / 20);
                playerPlaceElm.object3D.position.y = 0.1;
                playerPlaceElm.setAttribute('color', 'green');
                playerPlaceElm.setAttribute('id', 'playerStart');
                playerPlaceElm.appendChild(playerText)
                el.appendChild(playerPlaceElm);
            }
            else {
                if (playerPlaceMode) {
                    let txt;
                    if (confirm("You have already placed the Player Start Position, Would you like to reset it?")) {
                        const playerStartPos = document.getElementById('playerStart');
                        playerStartPos.parentNode.removeChild(playerStartPos);
                        updateMap(index, 0);
                        txt = "You pressed OK, Player position can now be reset";
                        // remove P from array and update with floor
                        currentEntity === 'P';
                    } else {
                        txt = "You pressed Cancel, Player Position will remain in place";
                        currentEntity === 0;
                    }

                }
            }
            // door - not locked
            if (currentPaintMode === "door" && currentEntity === 4 && !deleteMode && !heightMode) {
                // custumHeightString = '0' + currentEntityCustom.toString();
                const door = document.createElement('a-box');
                door.setAttribute('height', WALL_HEIGHT);
                door.object3D.position.y = 1.2;
                door.setAttribute('material', 'src:#' + doorTexture);
                el.appendChild(door);
            }

            // light
            if (currentPaintMode === "lights" && currentEntity === 't' && !deleteMode && !heightMode) {
                let light = document.createElement('a-entity');
                light.setAttribute('light', 'type: point; intensity: 0.25; distance: 1; decay: 0');
                light.setAttribute('color' + 'yellow');
                el.object3D.position.y = 0.2;
                el.appendChild(light);
            }

            // water
            if (currentPaintMode === "water" && currentEntity === 6 && !deleteMode && !heightMode) {
                const water = document.createElement('a-plane');
                water.setAttribute('height', WALL_HEIGHT / 40);
                water.setAttribute('width', WALL_HEIGHT / 7.5);
                water.setAttribute('depth', WALL_HEIGHT / 10);
                water.setAttribute('static-body', '');
                water.setAttribute('rotation', '90 0 0');
                water.setAttribute('scale', '1 5.72 2');
                water.setAttribute('material', 'src:#' + waterTexture + '; color:#86c5da; opacity: 0.85; transparent: true;side: double; shader:phong; reflectivity: 0.9; shininess: 70;');
                water.object3D.position.y = 0.15;
                el.appendChild(water);
            }
            // prefabs paint
            if (currentPaintMode === "prefabs" && currentEntity === 7 && !deleteMode && !heightMode) {
                // prefabs - 71T6 7:type prefav 1 number prefav T trigger flag 6 number dialog to trigger
                // setup dummy box model with a text number on it 
                let prefabBox = document.createElement('a-box');
                let prefabElmNum = prefabs[currentPrefab];
                console.log('prefab num' + prefabElmNum)
                prefabBox.setAttribute('text:', 'value' + prefabElmNum);
                // check if the prefab has interaction associated with it else do default
                if (prefabTriggerMode) {
                    let triggerCheck = triggerPrefab ? 'T' : null;
                    // create string for referencing prefab info with associated trigger and diag ref 
                    // prefabNew = 7 + prefabElmNum + triggerCheck + DiagTriggerNum.toString();
                    prefabNew = 7 + prefabElmNum + triggerCheck + DiagTriggerNum.toString();
                }
                else {
                    prefabNew = '7' + prefabElmNum
                }
                // console.log('prefab string now' + prefabNew);
                prefabBox.setAttribute('class', 'floor');
                prefabBox.setAttribute('height', 1);
                prefabBox.setAttribute('scale', '1 3 1');
                prefabBox.setAttribute('color', 'white');

                const prefabText = document.createElement('a-text');
                prefabText.setAttribute('value',  'Prefab Num:'+ prefabElmNum );
                prefabText.object3D.position.y = 0.8;
                prefabText.object3D.position.x = -0.5;
                prefabBox.appendChild(prefabText);
                el.object3D.position.y = 0;
                el.appendChild(prefabBox);
                // set up different rotation presets?
                //    prefabBox.setAttribute('rotation', prefabElmNum.rotation);
            }
            // enemy paint
            if (currentPaintMode === "enemies" && currentEntity === 9 && !deleteMode && !heightMode) {
                console.log('enemy paint triggered')
                const enemy1 = document.createElement('a-box');
                enemy1.setAttribute('color', 'red');
                enemy1.setAttribute('scale', '0.8 5 0.8');
                enemy1.setAttribute('static-body', '');
                el.setAttribute('height', WALL_HEIGHT / 20);
                el.object3D.position.y = 0;
                el.appendChild(enemy1);
            }
            if (currentEntity === 7) {
                updateMap(index, prefabNew);
            } else {
                updateMap(index, !heightMode ? currentEntity : custumHeightString);
            }
        });
    },
});


function updateMap(indexToReplace, mapNumType) {
    console.log('update map index' + indexToReplace, mapNumType)
    mapTemplate.splice(indexToReplace, 1, mapNumType);
    console.log('map arr is now' + mapTemplate, mapNumType + 'replaced' + indexToReplace);
}

AFRAME.registerComponent('map', {
    schema: {
        mapData: { type: 'array', default: mapTemplate },
        parse: AFRAME.utils.styleParser.parse,
        visible: { type: 'boolean', default: true },
    },
    init: function () {
        let data = this.data;
        object3D.position.set(data.x, data.y, data.z);
    },
    update: function () {

    }
});

//create the blank map scene
init();

async function init() {
    let room = document.createElement('a-entity');
    room.setAttribute('id', 'room');
    scene.appendChild(room);
    await loadTextures();
    await loadMapTemplateData(templateSize);
    await createRooms();
}

// function to handle loading of template and textures data 
async function loadMapTemplateData(templateSize) {
    let fetchURL;
    if (!templateWalled) {
        fetchURL = './mapTemplates/map' + templateSize + templateSize + '.json';
    }
    else {
        fetchURL = './mapTemplates/map' + templateSize + templateSize + 'Walled.json';
    }
    const res = await fetch(fetchURL)
    mapRes = await res.json();
    mapTemplate = mapRes.data;
    console.log(mapRes.length);
}

async function loadTextures(e) {
    let fetchURL = './textures/textures.json';
    const res = await fetch(fetchURL)
    textures = await res.json();
    // allocate textures from JSON config
    wallTexture = textures.textures[0].id;
    floorTexture = textures.textures[1].id;
    doorTexture = textures.textures[2].id;
    wallTexture2 = textures.textures[3].id;
    wallTexture3 = textures.textures[4].id;
    waterTexture = textures.textures[5].id
}

// function to create room geometry 
function createRooms() {
    const mapData = mapTemplate;
    let roomType = "Map Editor";
    // char info
    const chars = mapRes.chars; const charNum = mapRes.charnumber;
    let charLoopIndex = 0;

    const WALL_SIZE = 0.8;
    const WALL_HEIGHT = wallHeight;
    const el = document.getElementById('room');
    let wall;
    let floorIndex = 0;

    if (roomType === "Indoor") {
        let ceil = document.createElement('a-box');
        let ceilArea = (mapRes.width * mapRes.height);
        ceil.setAttribute('width', ceilArea * 2);
        ceil.setAttribute('height', ceilArea * 2);
        ceil.setAttribute('rotation', '-90 0 0');
        ceil.setAttribute('position', '0 6 0');
        ceil.setAttribute('scale', '0.2 0.2 0.2');
        ceil.setAttribute('material', 'src: #grunge; repeat: 1 2');
        el.appendChild(ceil);
    }

    for (let x = 0; x < mapRes.height; x++) {
        for (let y = 0; y < mapRes.width; y++) {
            floorIndex++;
            const i = (y * mapRes.width) + x;
            const floorPos = `${((x - (mapRes.width / 2)) * WALL_SIZE)} 0 ${(y - (mapRes.height / 2)) * WALL_SIZE}`;
            const position = `${((x - (mapRes.width / 2)) * WALL_SIZE)} ${(WALL_HEIGHT / 2)} ${(y - (mapRes.height / 2)) * WALL_SIZE}`;
            const halfYposition = `${((x - (mapRes.width / 2)) * WALL_SIZE)} 1 ${(y - (mapRes.height / 2)) * WALL_SIZE}`;
            const quarterYposition = `${((x - (mapRes.width / 2)) * WALL_SIZE)} 0 ${(y - (mapRes.height / 2)) * WALL_SIZE}`;
            const charPos = `${((x - (mapRes.width / 2)) * WALL_SIZE)} 0 ${(y - (mapRes.height / 2)) * WALL_SIZE}`;
            const torchPosition = `${((x - (mapRes.width / 2)) * WALL_SIZE)} 4 ${(y - (mapRes.height / 2)) * WALL_SIZE}`;
            const stairsPos = `${((x - (mapRes.width / 2)) * WALL_SIZE)} ${(y - (mapRes.height)) * WALL_SIZE} ${(y - (mapRes.height / 2)) * WALL_SIZE}`;

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

            // if the number is 1 - 4, create a wall
            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "0" || mapData[i] === 0 || mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                wall.setAttribute('material', 'src: #grunge; repeat: 1 2');
                wall.setAttribute('editor-listener', 'index:' + floorIndex);
                el.appendChild(wall);

                // floor
                if (mapData[i] === 0) {
                    // wall.setAttribute('color', '#000');
                    wall.setAttribute('height', WALL_HEIGHT / 20);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', floorPos);
                    // wall.setAttribute('index', y);
                    // wall.setAttribute('load-texture', '');
                    wall.setAttribute('material', 'src:#' + floorTexture);
                }
                // floor with custom height
                if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "0") {
                    let floorHeight1 = mapData[i].charAt(1) ? mapData[i].charAt(1) : 0;
                    let floorHeight2 = mapData[i].charAt(2) ? mapData[i].charAt(2) : 0;
                    let floorHeight = mapData[i].charAt(1) && mapData[i].charAt(2) ? floorHeight1 + floorHeight2 : floorHeight1;
                    wall.setAttribute('class', 'floor');
                    wall.setAttribute('height', floorHeight);
                    wall.setAttribute('static-body', '');
                    wall.setAttribute('position', floorPos);
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
                    wall.setAttribute('position', quarterYposition);
                    wall.setAttribute('material', 'src:#' + wallTexture2);
                }
            }
        }
    }
}

//JSON export function
function exportJSON() {
    let data = {
        key: 'data'
    };
    let fileName = 'newPapyrusMap' + saveNum + '.json';
    // structure the map for consumption by engine
    // for every width length - add a space - FOR EXAMPLE 25 - ADD NEW LINEBREAK EVERY 25 ARR ELEMENTS
    // let structArr = addNewlines(mapTemplate, templateSize);
    let JSONBlog = JSON.stringify(mapTemplate);
    // Create a blob of the data
    const fileToSave = new Blob([JSONBlog], {
        type: 'application/json'
    });

    //Save the file
    saveAs(fileToSave, fileName);
    // increment save num for file names
    saveNum++;
}

function addNewlines(arr, breakLength) {
    arr.toString();
    while (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            //if increment is divided by 2 and there is not a remainder of 0
            if (i % breakLength === 0 && i !== 0) {
                // console.log(arr[i])
                //append a line break after every 10th element
                arr[i] = parseInt(arr[i] + "\n");
            }
        }
        return arr;
    }
}

// UI set option
function setOption(id) {
    const e = document.getElementById(id);
    let value = e.value;
    allHeightSwitch(value);
    return parseInt(value);
}

// UI elements and associated event listeners 
const wallType = document.getElementById('wallType')
// reassign types for select dropdown UI
wallType.addEventListener("change", function () {
    currentEntity = setOption('wallType');
});

const mapTemplateSize = document.getElementById('templateSize')
// reassign types template size for select dropdown UI
mapTemplateSize.addEventListener("change", function () {
    templateSize = setOption('templateSize');
    clearScene();
    init();
});

const paintModeSelect = document.getElementById('paintmode')
// reassign types for select dropdown UI
paintModeSelect.addEventListener("change", function () {
    let SelectedPaintMode = setOption('paintmode');
    currentPaintMode = paintMode[SelectedPaintMode];
    switchPaintMode(currentPaintMode);
    console.log(currentPaintMode, paintMode[SelectedPaintMode]);
});

const enemyTypeSelect = document.getElementById('enemies"')

// Height switching for passed entity 
function allHeightSwitch(currentEntity) {
    // console.log('passed Curr'+currentEntity);
    if (currentEntity == 0) {
        wallHeight = 0;
        heightY = wallHeight / 2;
    }
    if (currentEntity == 0 && heightMode) {
        wallHeight = custumHeightY;
        currentEntity = '0' + custumHeightY;
        custumHeightString = '0' + custumHeightY;
        console.log(currentEntity);
    }
    if (currentEntity == 1) {
        wallHeight = 5;
        heightY = wallHeight / 2;
    }
    else if (currentEntity == 2) {
        console.log("current entity matched" + currentEntity);
        wallHeight = 5 / 2;
        heightY = 1;
        console.log(wallHeight);
    }
    else if (currentEntity == 3) {
        console.log("current entity matched" + currentEntity);
        wallHeight = 5 / 4;
        heightY = 0;
        console.log(wallHeight);
    }
    else if (currentEntity == 4) {
        console.log("current entity matched" + currentEntity);
        wallHeight = 2.5;
    }
    //water
    else if (currentEntity == 6) {
        console.log("current entity matched" + currentEntity);
        wallHeight = 0;
        console.log(wallHeight);
    }
    // prefabs
    else if (currentEntity == 7) {
        console.log("current entity matched" + currentEntity);
        wallHeight = 0;
        console.log(wallHeight);
    }
    // enemies
    else if (currentEntity == 9) {
        console.log("current entity matched" + currentEntity);
        wallHeight = 0;
    }
    else {
        wallHeight = 5;
    }
}

// Painting mode ?
function switchPaintMode(currentPaintMode) {
    console.log(currentPaintMode);
    const enemyTitle = document.getElementById('enemiesTitle');
    if (currentPaintMode === "walls") {
        enemyTypeSelect.setAttribute('hidden', '');
        enemyTitle.setAttribute('hidden', '');
    }
    if (currentPaintMode === "walls" && heightMode) {
        enemyTypeSelect.setAttribute('hidden', '');
        enemyTitle.setAttribute('hidden', '');
        custumHeightString = '0' + custumHeightY;
    }
    if (currentPaintMode === "enemies") {
        console.log('current paint mode' + currentPaintMode);
        currentEntity = 9;
        console.log('enemies')
        wallHeight = 0;
        heightY = 0;
    }
    if (currentPaintMode === "door") {
        currentEntity = 4;
        wallHeight = 2.5;
        heightY = 1;
    }
    if (currentPaintMode === "prefabs") {
        currentEntity = 7;
        wallHeight = 0;
        heightY = 0;
    }
    if (currentPaintMode === "lights") {
        currentEntity = 't';
        wallHeight = 0;
        heightY = 0;
    }
    if (currentPaintMode === "playerplace") {
        currentEntity = "P";
        wallHeight = 0;
        heightY = 0;
    }
    if (currentPaintMode === "water") {
        currentEntity = 6;
        wallHeight = 0;
        heightY = 0;
    }
}

// Check if Delete mode is on and init delete Mode if it is 
const deleteCheckbox = document.querySelector("input[name=deletemode]");
deleteCheckbox.addEventListener('change', function () {
    if (this.checked) {
        deleteMode = true;
        currentEntity = 0;
        console.log(deleteMode)
    }
    if (!this.checked) {
        deleteMode = false;
        currentEntity = setOption('wallType');
        console.log(deleteMode)
    }
});

// Check if player place mode is on and init player place (only 1 allowed) if it is 
const playerPlaceCheckbox = document.querySelector("input[name=playermode]");
playerPlaceCheckbox.addEventListener('change', function () {
    if (this.checked) {
        playerPlaceMode = true;
        currentEntity = "P";
        console.log(playerPlaceMode)
    }
    if (!this.checked) {
        playerPlaceMode = false;
        currentEntity = setOption('wallType');
        console.log(playerPlaceMode)
    }
});


// Check if Height mode is on and init delete Mode if it is 
const heightCheckbox = document.querySelector("input[name=heightmode]");
heightCheckbox.addEventListener('change', function () {
    if (this.checked) {
        heightMode = true;
        custumHeightY = 0;
        console.log(heightMode);
    }
    if (!this.checked) {
        heightMode = false;
        console.log(heightMode);
    }
});

// slider for height mode
const slider = document.getElementById("myRange");
const output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function () {
    output.innerHTML = this.value;
    custumHeightY = this.value;
    console.log('custum height Y' + custumHeightY);
}


// Get the modal
const modal = document.getElementById("myModal");


// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
function openModal() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}