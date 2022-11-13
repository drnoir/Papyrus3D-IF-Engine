// map editor js - main js scrupt for the map editor for creating maps

// global map editor vars

let sceneMetadata;
let textures;
let mapTemplate = [];
let templateSize = 25;
let chars;
let mapRes;
let saveNum = 1;
const mapNumTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 'char', 't', 'cam']

let currentEntity= 1;

// textures

let wallTexture;
let floorTexture;
let doorTexture;
let  wallTexture2;
// dialogueUI Elements
const scene = document.querySelector('a-scene');
const assets = document.querySelector('a-assets');

//buttons / ui
const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.addEventListener('mousedown', (event) => {
    exportJSON();
});

AFRAME.registerComponent('editor-listener', {
    schema: {
        parse: AFRAME.utils.styleParser.parse,
        visible: {type: 'boolean', default: true},
        index: {type: 'number', default: 0},
        colors: {type: 'array', default: ['red', 'white']}
    },
    init: function () {
        const data = this.data;
        let index = data.index;

        // this.el.addEventListener('mouseover', function (evt) {
        //     let lastHoverIndex = (lastHoverIndex + 1) % data.colors.length;
        //     this.el.setAttribute('material', 'color', data.colors[lastHoverIndex]);
        // });
        //
        // this.el.addEventListener('mouseout', function (evt) {
        //     let lastHoverIndex = (lastHoverIndex - 1) % data.colors.length;
        //     this.el.setAttribute('material', 'color', "#fff");
        // });

        this.el.addEventListener('click', function (evt) {
            let lastIndex = -1;
            lastIndex = (lastIndex + 1) % mapTemplate.length;
            // this.setAttribute('material', 'color', "#000");
            this.setAttribute('height', '5');
            this.setAttribute('material', 'src:#'+wallTexture);
            console.log('I was clicked at: ', evt.detail.intersection.point);
            console.log('I was clicked at: ', evt.detail.intersection);
            console.log('index Map: ', index);
            // REPLACE WITH MAP NUM TYPE WHEN READY TO PASS DOWN PARAM SETUP T
             updateMap(index, currentEntity);
        });
    },

});

function updateMap(indexToReplace, mapNumType) {
    console.log('update map index'+indexToReplace, mapNumType)
    mapTemplate.splice(indexToReplace, 1, mapNumType);
    console.log('map arr is now' + mapTemplate)
}

AFRAME.registerComponent('map', {
    schema: {
        mapData: {type: 'array', default: mapTemplate},
        parse: AFRAME.utils.styleParser.parse,
        visible: {type: 'boolean', default: true},
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
    // await loadChars();
    await loadTextures();
    await loadMapTemplateData( templateSize);
    await createRooms();
}

async function loadMapTemplateData(templateSize) {
    let fetchURL = './mapTemplates/map' + templateSize + templateSize + '.json';
    const res = await fetch(fetchURL)
    mapRes = await res.json();
    mapTemplate = mapRes.data;
}

async function loadChars() {
    const res = await fetch('../../DemoGame/charecters.json')
    chars = await res.json();
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
}

function createRooms() {


    const mapData = mapTemplate;
    console.log(mapData, mapRes.height);
    let roomType = "Map Editor";
    // char info
    const chars = mapRes.chars;
    const charNum = mapRes.charnumber;
    let charLoopIndex = 0;


    console.log(typeof wallTexture);

    const WALL_SIZE = 0.8;
    const WALL_HEIGHT = 5;
    const el = document.getElementById('room')
    // let playerPos;
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

            if (mapData[i] === 9) {
                const enemy1 = document.createElement('a-entity');
                enemy1.setAttribute('enemy', 'modelPath:./models/Hellknight.obj; format:obj;');
                enemy1.setAttribute('id', 'enemy');
                enemy1.setAttribute('position', charPos);
                el.appendChild(enemy1);
            }


            if (typeof mapData[i] === 'string' && mapData[i].charAt(0) === "d") {
                const door = document.createElement('a-box');
                door.setAttribute('width', WALL_SIZE);
                door.setAttribute('height', WALL_HEIGHT);
                door.setAttribute('depth', WALL_SIZE);
                door.setAttribute('position', position);
                door.setAttribute('material', 'src: #grunge; repeat: 1 2');
                // create component for door / lock
                door.setAttribute('locked', 'false');
            }

            // if the number is 1 - 4, create a wall
            if (mapData[i] === 0 || mapData[i] === 1 || mapData[i] == 2 || mapData[i] === 3 || mapData[i] === 4) {
                wall = document.createElement('a-box');
                wall.setAttribute('width', WALL_SIZE);
                wall.setAttribute('height', WALL_HEIGHT);
                wall.setAttribute('depth', WALL_SIZE);
                wall.setAttribute('position', position);
                wall.setAttribute('material', 'src: #grunge; repeat: 1 2');
                wall.setAttribute('editor-listener', 'index:'+floorIndex);
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
                // door
                if (mapData[i] === 4) {
                    wall.setAttribute('id', 'door');
                    // create component for door / lock
                    wall.setAttribute('material', 'src:#' + doorTexture);
                }
            }
        }
    }
}

function exportJSON() {

    let data = {
        key: 'data'
    };
    let fileName = 'newPapyrusMap'+saveNum+'.json';
    // structure the map for consumption by engine
    // for every width length - add a space - FOR EXAMPLE 25 - ADD NEW LINEBREAK EVERY 25 ARR ELEMENTS
   let JSONBlog = JSON.stringify(mapTemplate);
    let JSONParsed = addNewlines(JSONBlog)
    // Create a blob of the data
         const fileToSave = new Blob([JSONParsed], {
        type: 'application/json'
    });
// Save the file
    saveAs(fileToSave, fileName);
    // increment save num for file names
    saveNum++;
}

function addNewlines(str) {
    let result = '';
    while (str.length > 0) {
        result += str.substring(0, mapRes.width * 4 ) + '\n';
        str = str.substring(mapRes.height * 4 );
    }
    return result;
}