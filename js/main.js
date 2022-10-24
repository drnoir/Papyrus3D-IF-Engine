// main js
// import {loadData} from './loader.js';

// global game vars
let config;
let chars;
let diag;

initLoad();

// load JSON data
async function initLoad() {
    await loadData();
    await populateScene();
}

function loadData(){
// game vars
    config = loadConfig();
    chars = loadChars();
    diag = loadDiag();
    console.log(config, chars, diag);
}

async function loadConfig() {
    await fetch("Game/config.json")
        .then((response) => {
            return response.json().then((data) => {
                console.log(data);
                return data;
            }).catch((err) => {
                console.log(err);
            })
        });
}
async function loadChars() {
    await fetch("Game/charecters.json")
        .then((response) => {
            return response.json().then((data) => {
                console.log(data);
                return data;
            }).catch((err) => {
                console.log(err);
            })
        });
}
async function loadDiag() {
    await fetch("Game/dialogue.json")
        .then((response) => {
            return response.json().then((data) => {
                console.log(data);
                return data;
            }).catch((err) => {
                console.log(err);
            })
        });
}

function populateScene(){
    console.log('testing data at load'+ chars);
    // load assets
    let scene = document.querySelector('a-frame')
    let assets = document.createElement('a-assets')
    scene.appendChild(assets);
    // add character info and model path
    chars.forEach(char=> assets.appendChild(char));
}

function nextScene(){

}

function clearScene(){

}

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