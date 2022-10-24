// fetch config , game and dialogue - preload?
loadData();


function loadData(){
// game vars
    loadConfig();
    loadChars();
    loadDiag();
}

async function loadConfig() {
    await fetch("Game/config.json")
                .then(response => response.json())
                .then(json => console.log(json));
}

async function loadChars() {
    await fetch("Game/charecters.json")
        .then(response => response.json())
        .then(json => console.log(json));
}

async function loadDiag() {
    await fetch("Game/dialogue.json")
        .then(responseDiag => responseDiag.json())
        .then(jsonDiag => console.log(jsonDiag));
}

export {loadData};
