import neo4j from 'neo4j-driver';
import { sql } from "@vercel/postgres";
import { min } from 'date-fns';

const URI = process.env.NEO4J_HOST || 'neo4j://localhost:7687';
const USER = process.env.NEO4J_USER || 'neo4j';
const PASSWORD = process.env.NEO4J_PASSWORD || 'qwerty123';
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function getYesterdaysGame() {

    let clubs, players = null;

    const { records: clubRecords } = await driver.executeQuery(
        `
        MATCH (g:Game {date: date() - duration('P1D')})-[:CONTAINS_CLUB]-(c:Club)
        RETURN collect(c.clubId) as clubIds
        `,
        {}
    );

    if (clubRecords.length) {
        clubs = clubRecords[0].get('clubIds');
    } 

    const { records: playerRecords, summary, keys } = await driver.executeQuery(
        `
        MATCH (g:Game {date: date() - duration('P1D')})-[:CONTAINS_PLAYER]-(p:Player)
        RETURN collect(p.playerId) as playerIds
        `,
        {}
    );

    if (playerRecords.length) {
        players = playerRecords[0].get('playerIds');
    } 

    return { clubs, players };
}


async function getGame() {

    const { records, summary, keys } = await driver.executeQuery(
        `
        MATCH (g:Game {date: date()})
        RETURN g.game_data as gameData
        `,
        {}
    );

    if (records.length) {
        return records[0].get('gameData');
    } else {
        return null;
    }
}

async function saveGame(gameData, clubIds, playerIds) {
    const { records, summary, keys } = await driver.executeQuery(
        `
        CREATE (g:Game {date: date(), game_data: $gameData})
        WITH g
        UNWIND $clubIds as clubId
        WITH DISTINCT clubId, g
        MATCH (c:Club {clubId: toInteger(clubId)})
        CREATE (g)-[:CONTAINS_CLUB]->(c)
        WITH g
        UNWIND $playerIds as playerId
        WITH DISTINCT playerId, g
        MATCH (p:Player {playerId: toInteger(playerId)})
        CREATE (g)-[:CONTAINS_PLAYER]->(p)`,
        { gameData: JSON.stringify(gameData), clubIds, playerIds }
    );
}

async function getGameData() {
    const cached = await getGame();

    if (cached) {
        return JSON.parse(cached);
    } else {
        const ydayGame = await getYesterdaysGame();
        let excludedClubs = ydayGame.clubs ?? [];
        let excludedPlayers =ydayGame.players ?? [];

        let allSelectedPlayers = {};
        let game = {};
        const clubs = await getClubs(['GB1'], excludedClubs);
        let allClubIds = clubs.map(club => club.clubId);
        let clubIndex = 1;
        for(let club in clubs) {
            const clubId = clubs[club].clubId;
            const clubName = clubs[club].clubName;
            game[clubName] = [];
            for (let i = 0; i < 4; i++) {
                let allExcludedPlayers = Object.keys(allSelectedPlayers).map(playerId => parseInt(playerId)).concat(excludedPlayers);
                let excludedClubs = [];
                let minClubs = 2;
                let minApps = 100 - (150 / (clubIndex + 1));
                if (clubIndex == 4) {
                    excludedClubs = allClubIds.filter(cId => cId !== clubId);
                    minClubs = 1;
                } 
                const players = await lookupPlayerByClub(clubId, allExcludedPlayers, excludedClubs, minClubs, minApps);
                const player = players[0];
                allSelectedPlayers[player.get('p').properties.playerId.low] = player.get('clubs').map(club => club.properties.clubId.low);
                game[clubName].push(player.get('p').properties.name);
            }
            clubIndex++;
        }

        const playersMultipleClubsInGame = {};

        for (let player of Object.keys(allSelectedPlayers)) {
            const clubsInGame = allSelectedPlayers[player].filter(club => allClubIds.includes(club));
            if (clubsInGame.length > 1) {
                playersMultipleClubsInGame[player] = clubsInGame.sort();
            }
        }

        // If there are more than 1 player with more than 2 clubs in this game, check they are not the same two clubs
        let invalidGame = false;
        if (Object.keys(playersMultipleClubsInGame).length > 1) {
            for (let player of Object.keys(playersMultipleClubsInGame)) {
                for (let player2 of Object.keys(playersMultipleClubsInGame)) {
                    if (player !== player2) {
                        if (intersect(playersMultipleClubsInGame[player], playersMultipleClubsInGame[player2]).length > 1) {
                            invalidGame = true;
                        }
                    }
                }
            }
        }

        if (invalidGame) {
            return getGameData();
        }

        let i = 1;

        let ret = []; 
        for (const [key, value] of Object.entries(game)) {
            ret.push(
                {
                    category: key,
                    words: value,
                    difficulty: i
                }
            );
            i++;
        }

        if (ret.length < 4) {
            return getGameData();
        }

        await saveGame(ret, allClubIds, Object.keys(allSelectedPlayers).map(playerId => parseInt(playerId)));

        return ret;
    }
}


async function getClubs(countries = ['GB1'], excludeClubs = []) {
    const { records, summary, keys } = await driver.executeQuery(
        `
        MATCH (c:Club WHERE NOT c.clubId IN $excludeClubs)-[:PLAYS_IN]-(cp:Competition WHERE cp.competitionId IN $countries) 
        WITH c.clubId as clubId, c.name as clubName
        WITH clubId, clubName, rand() as r ORDER BY r LIMIT 4
        RETURN clubId, clubName`,
        { countries, excludeClubs }
    );

    let clubs = [];
    for(let record of records) {
        clubs.push({
            clubId: record.get('clubId').low,
            clubName: record.get('clubName')
        });
    }

    return clubs;
}


async function lookupPlayerByClub(clubId, excludedPlayers, excludedClubs = [], minClubs = 1, minApps = 50) {
    const { records, summary, keys } = await driver.executeQuery(
        `
            MATCH (p:Player WHERE NOT p.playerId IN $excludedPlayers)-[pf:PLAYED_FOR]-(ec:Club)-[:PLAYS_IN]-(cp:Competition WHERE cp.competitionId IN ['GB1'])
            WITH p, sum(pf.count) as totalPlayed WHERE totalPlayed > $minApps
            MATCH (p)-[pf:PLAYED_FOR WHERE pf.count > 10]-(c:Club {clubId: $clubId})
            WITH DISTINCT p, c
            MATCH (p)-[:PLAYED_FOR]-(c2:Club WHERE NOT c2.clubId IN $excludedClubs)-[:PLAYS_IN]-(cp:Competition WHERE cp.competitionId IN ['GB1', 'FR1', 'ES1', 'IT1', 'NL1'])
            WITH p, collect(DISTINCT c2) as clubs WHERE size(clubs) > $minClubs
            RETURN p, clubs, rand() as r ORDER BY r LIMIT 1
        `,
        { clubId, excludedPlayers, excludedClubs, minClubs, minApps },
    );

    if (!records.length) {
        return lookupPlayerByClub(clubId, excludedPlayers, excludedClubs);
    }

    return records;
}

function intersect(a, b) {
    var setB = new Set(b);
    return [...new Set(a)].filter(x => setB.has(x));
}

export default getGameData;
