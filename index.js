
// Format: YEAR, MONTH, DAY, (HOUR, MINUTE, SECOND)
// Remember: MONTH starts at 0 for January!
let dateLimit = new Date(2019, 8, 6);


let mainSeriesUrl = "https://www.speedrun.com/api/v1/series/pokemon/games?_bulk=yes&orderby=released";
let fanGamesSeriesUrl = "https://www.speedrun.com/api/v1/series/pkmnfangames/games?_bulk=yes&orderby=released";
let categoryExtensions = [
    {id: "pkmnrbyext", names: {international: "Pokémon RBY Category Extensions "}, abbreviation: "pkmnrbyext", weblink: "https://www.speedrun.com/pkmnrbyext"},
    {id: "pkmngscext", names: {international: "Pokémon GSC Category Extensions"}, abbreviation: "pkmngscext", weblink: "https://www.speedrun.com/pkmngscext"},
    {id: "pkmngen3ext", names: {international: "Pokémon RSE/FRLG Category Extensions"}, abbreviation: "pkmngen3ext", weblink: "https://www.speedrun.com/pkmngen3ext"},
    {id: "pkmngen4ext", names: {international: "Pokémon DPPt/HGSS Category Extensions"}, abbreviation: "pkmngen4ext", weblink: "https://www.speedrun.com/pkmngen4ext"},
    {id: "pkmngen5ext", names: {international: "Pokémon BW/B2W2Category Extensions"}, abbreviation: "pkmngen5ext", weblink: "https://www.speedrun.com/pkmngen5ext"},
    {id: "pkmngen6ext", names: {international: "Pokémon XY/ORAS Category Extensions"}, abbreviation: "pkmngen6ext", weblink: "https://www.speedrun.com/pkmngen6ext"},
    {id: "pkmngen7ext", names: {international: "Pokémon SM/USUM/LGPE Category Extensions"}, abbreviation: "pkmngen7ext", weblink: "https://www.speedrun.com/pkmngen7ext"},
];

let gamesWithEmulatorHidden = [
    "yd4qeg6e", // Pocket Monsters Stadium
    "j1lqqj6g", // Pokémon Snap
    "o6gnn812", // Pokémon Stadium
    "m1zkk010", // Pokémon Stadium 2
    "9d38801l", // Pokémon Ruby/Sapphire
    "76r95468", // Pokémon Channel
    "268w996p", // Pokémon Colosseum
    "w6j7726j", // Pokémon FireRed/LeafGreen
    "o1yjjv1q", // Pokémon Emerald
    "9do8xk1p", // Pokémon XD: Gale of Darkness
    "k6qwpm6g", // Pokémon Mystery Dungeon: Red/Blue Rescue Team
    "yd4krg6e", // Pokémon Ranger
    "3dxky51y", // Pokémon Diamond/Pearl
    "3698w3dl", // Pokémon Battle Revolution
    "76r34v68", // Pokémon Mystery Dungeon: Explorers of Time/Darkness
    "nd2n3vd0", // Pokémon Ranger: Shadows of Almia
    "46w2rl6r", // Pokémon Platinum
    "j1lqnj6g", // Pokémon Mystery Dungeon: Explorers of Sky
    "pdv29k6w", // Pokémon Rumble
    "o6gnk812", // Pokémon HeartGold/SoulSilver
    "pd0qn31e", // PokéPark Wii: Pikachu's Adventure
    "4d757n67", // Pokémon Ranger: Guardian Signs
    "y655576e", // Pokémon Black/White
    "ldejwj13", // PokéPark 2: Wonders Beyond
    "m1mne3d2", // Pokémon Conquest
    "kdkmmx1m", // Pokémon Black 2/White 2
    "v1pxlz68", // Pokémon Mystery Dungeon: Gates to Infinity
    "pkmngen4ext", // Pokémon DPPt/HGSS Category Extensions
    "pkmngen5ext", // Pokémon BW/B2W2 Category Extensions
    "pkmngen6ext", // Pokémon XY/ORAS Category Extensions
    "pkmngen7ext", // Pokémon SM/USUM/LGPE Category Extensions
    "46w3vn71", // Pokémon CAWPS

];

let gamesWithEmulatorBanned = [
    "m1z9v3d0", // Pokemon Rumble U
    "4d7nnr67", // Pokémon X/Y
    "nd288qd0", // Pokémon Omega Ruby/Alpha Sapphire
    "kdk4ol1m", // Pokémon Sun/Moon
    "lde39vl6", // Pokémon Ultra Sun/Ultra Moon
    "j1llzoz1", // Pokémon Let's Go Pikachu/Eevee
    "v1povxm6", // Pokémon Uranium
];


let request = require("request");
let fs = require("fs");

let done = false;

/**
 *
 * @type {Array<{resolve: function, url: string}>}
 */
let requests = [];

/**
 *
 * @param url string
 * @returns {Promise<object>}
 */
function enqueueRequest(url) {
    return new Promise(resolve => {
        requests.push({
            resolve: resolve,
            url: url,
        });
    });
}


function handleNextRequest() {
    if (done) {
        return;
    }

    if (requests.length === 0) {
        return setTimeout(handleNextRequest, 50);
    }


    let r = requests.shift();

    request(r.url, {
        method: "GET",
        headers: {
            "User-Agent": "PSR Leaderboard Bot 0.1",
        },
    }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            requests.unshift(r);
        } else {
            r.resolve(JSON.parse(body));
        }

        setTimeout(handleNextRequest, 800);
    });
}

function secondsToTimeExpression(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = seconds - hours * 3600 - minutes * 60;

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (seconds < 10) {
        seconds = "0" + seconds.toLocaleString("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    } else {
        seconds = seconds.toLocaleString("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    }

    return `${hours}:${minutes}:${seconds}`;
}

function formatToDate(dateString) {
    let date = new Date(dateString);

    return date.toLocaleDateString("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatToDateTime(dateString) {
    let date = new Date(dateString);

    return date.toLocaleString("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
    });
}

handleNextRequest();

let results = {};


let runners = {};
try {
    runners = JSON.parse(fs.readFileSync("./runners.json", "utf8"));
} catch (e) {
    console.log("Runner file not found, creating a new one.");
}

(async () => {

    console.log("Starting PSR Leaderboard Bot");

    /**
     * @type Array<object>
     */
    let games = (await enqueueRequest(mainSeriesUrl)).data;

    console.log("Loaded " + games.length + " games from Pokémon main series.");

    games = games.concat(categoryExtensions);

    console.log("\"Loaded\" " + categoryExtensions.length + " games as category extensions.");

    let fanGames = (await enqueueRequest(fanGamesSeriesUrl)).data;

    console.log("Loaded " + fanGames.length + " games from Pokémon Fan Games series.");

    games = games.concat(fanGames);

    for (let game of games) {

        let emulatorBanned = gamesWithEmulatorBanned.indexOf(game.id) !== -1;
        let emulatorHidden = gamesWithEmulatorHidden.indexOf(game.id) !== -1;

        if (emulatorBanned) {
            console.log("Emulators for this game are BANNED.");
        } else if (emulatorHidden) {
            console.log("Emulators for this game are HIDDEN.");
        } else {
            console.log("Emulators for this game are ALLOWED.");
        }

        console.log("Loading categories for: " + game.names.international);
        let categories = (await enqueueRequest(`https://www.speedrun.com/api/v1/games/${game.id}/categories`)).data;

        for (let category of categories) {

            if (category.type !== "per-game") {
                continue;
            }

            let variables =  (await enqueueRequest(`https://www.speedrun.com/api/v1/categories/${category.id}/variables`)).data;

            let variableList = [];

            for (let variable of variables) {
                if (variable["is-subcategory"]) {
                    variableList.push({
                        id: variable.id,
                        name: variable.name,
                        values: variable.values.choices,
                    });
                }
            }

            let baseUrl = `https://www.speedrun.com/api/v1/leaderboards/${game.id}/category/${category.id}?`;

            let urlList = [{
                description: category.name,
                url: baseUrl,
            }];

            for (let variable of variableList) {
                let newUrlList = [];

                for (let key in variable.values) {
                    if (!variable.values.hasOwnProperty(key)) {
                        continue;
                    }

                    for (let url of urlList) {

                        newUrlList.push({
                            description: url.description + " - " + variable.values[key],
                            url: url.url + "var-" + variable.id + "=" + key + "&",
                        });
                    }
                }

                urlList = newUrlList;
            }

            for (let url of urlList) {

                console.log("Loading leaderboards for: " + game.names.international + " -- " + url.description);

                let loadedUrl = url.url;

                if (emulatorBanned) {
                    loadedUrl+= "emulators=0";
                }

                let runs = (await enqueueRequest(loadedUrl)).data.runs;

                for (let run of runs) {

                    if (!run.run.status || run.run.status.status !== "verified") {
                        continue;
                    }

                    let date = new Date(run.run.date);

                    let submittedDate = new Date(run.run.submitted);

                    let addRunToList = false;

                    if (date > dateLimit || submittedDate > dateLimit) {
                        addRunToList = true;
                    } else if (run.run.status["verify-date"]) {
                        let verifyDate = new Date(run.run.status["verify-date"]);

                        if (verifyDate > dateLimit) {
                            addRunToList = true;
                        }
                    }

                    if (!addRunToList) {
                        continue;
                    }


                    console.log("New run to add (Rank " + run.place + ")");

                    results[game.names.international] = results[game.names.international] || {};
                    results[game.names.international][url.description] = results[game.names.international][url.description] || [];

                    let result = {
                        run: run,
                        runners: [],
                    };

                    if (emulatorHidden) {
                        result.emuPlace = run.place;
                    } else {
                        result.place = run.place;
                    }

                    for (const player of run.run.players) {

                        if (player.rel === "guest") {

                            result.runners.push({
                                type: "guest",
                                names: {
                                    international: player.name,
                                }
                            });

                        } else {
                            if (!runners[player.id]) {
                                runners[player.id] = (await enqueueRequest(player.uri)).data;

                                console.log("Retrieved runner data: " + runners[player.id].names.international);

                            } else {
                                console.log("Backed up runner data: " + runners[player.id].names.international);

                            }

                            result.runners.push(runners[player.id]);
                        }

                    }

                    results[game.names.international][url.description].push(result);

                }

                if (!emulatorHidden || !results[game.names.international] || !results[game.names.international][url.description]) {
                    continue;
                }

                console.log("Loading leaderboards for (without emulator): " + game.names.international + " -- " + url.description);


                loadedUrl = url.url + "&emulators=0";

                runs = (await enqueueRequest(loadedUrl)).data.runs;

                let currentResults = results[game.names.international][url.description];

                for (let run of runs) {

                    for (let currentResult of currentResults) {

                        if (currentResult.run.run.id === run.run.id) {


                            currentResult.place = run.place;
                            break;
                        }
                    }
                }
            }
        }
    }

    done = true;

    function escapeHtml(text) {
        if (!text) {
            return "";
        }
        let map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };

        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    let html = "<!DOCTYPE html>\n" +
        "<html lang=\"en\">\n" +
        "<head>\n" +
        "    <meta charset=\"UTF-8\">\n" +
        "    <link rel=\"stylesheet\" href=\"https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css\" integrity=\"sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T\" crossorigin=\"anonymous\">\n" +
        "    <style>th {white-space: nowrap} img {height: 15px; display: inline-block; margin-right: 3px; margin-top: -3px;}h2 {margin-top: 35px;}</style>\n" +
        "    <title>Leaderboard Roundup</title>\n" +
        "</head>\n" +
        "<body>\n" +
        "\n" +
        "<div class=\"container-fluid\"><h1>Leaderboard roundup</h1>\n";


    for (let game in results) {
        if (!results.hasOwnProperty(game)) {
            continue;
        }
        html+= "<h2>" + escapeHtml(game) + "</h2>";
        html+= "<table class='table table-striped table-sm'>";
        html+= "<thead>";
        html+= "<tr><th>#</th><th>Runner(s)</th><th>Time</th><th>Run Date</th><th>Submission / Approval</th><th style='width: 50%'>Comment</th></tr>";
        html+= "</thead>\n";
        html+= "<tbody>";

        for (let category in results[game]) {
            if (!results[game].hasOwnProperty(category)) {
                continue;
            }
            html+= "<tr><td class='align-middle' colspan='7' style='padding: 20px 15px;'><strong>" + escapeHtml(category) + "</strong></td></tr>\n";

            for (let i = 0; i < results[game][category].length; ++i) {
                let result = results[game][category][i];
                let place = result.place;
                let emuPlace = result.emuPlace;
                let run = result.run;
                let runners = results[game][category][i].runners;

                if (place === 1) {
                    html+= "<tr class='table-info'>";
                } else {
                    html+= "<tr>";
                }

                if (emuPlace) {

                    if (!place) {
                        place = "-";
                    }

                    html+= "<td class='align-middle' style='text-align: center'>" + place + "<br><span style='font-size: 0.75em'>Emu: " + emuPlace +"</span></td><td class='align-middle'>";
                } else {
                    html+= "<td class='align-middle'>" + place + "</td><td class='align-middle'>";
                }

                for (let j = 0; j < runners.length; ++j) {
                    let runner = runners[j];

                    if (runner.type === "guest") {
                        html+=  runner.names.international;
                    } else {
                        if (runner.location && runner.location.country) {
                            // html+= "(" + runner.location.country.code + ") ";
                            html += "<img src='https://www.speedrun.com/images/flags/" + runner.location.country.code + ".png' title='" + runner.location.country.names.international + "'> ";
                        }

                        html += "<a href='" + runner.weblink + "'>" + (runner.names.international || runner.names.japanese) + "</a>";
                    }

                    if (j < runners.length - 1) {
                        html+= "<br>";
                    }

                }

                html+= "</td>";

                html+= "<td class='align-middle' style='white-space: nowrap'><a href='" + run.run.weblink +"'>" + secondsToTimeExpression(run.run.times.primary_t)  +"</a></td>"
                html+= "<td class='align-middle' style='white-space: nowrap'>" + (run.run.date ? formatToDate(run.run.date) : "-")  +"</td>"
                html+= "<td class='align-middle' style='white-space: nowrap; font-size: 0.8em; '>Submitted: " + (run.run.submitted ? formatToDate(run.run.submitted) : "-")  +"<br>"
                html+= "Verified: " + (run.run.status && run.run.status["verify-date"] ? formatToDate(run.run.status["verify-date"]) : "-")  +"</td>"
                html+= "<td class='align-middle' style='font-size: 0.8em; white-space: pre-line'>" + escapeHtml(run.run.comment)  +"</td>"

                // html+= "<td style='white-space: pre;font-size: 0.7em;'>" + JSON.stringify(run, null, 4) + "</td>";

                html+= "</tr>\n";
            }
        }
        html+= "</tbody></table>";
    }


    fs.writeFileSync("./output.html", html);
    fs.writeFileSync("./runners.json", JSON.stringify(runners));

})();


