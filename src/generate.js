const neo4j = require('neo4j-driver');

const URI = 'neo4j://localhost:7687';
const USER = 'neo4j';
const PASSWORD = 'qwerty123';
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function getGameData() {
    let finalPlayers = [];
    let allSelectedPlayers = [];
    try {
        const { records, summary, keys } = await driver.executeQuery(
            `MATCH (p:Player)-[:PLAYED_FOR]-(c:Club)-[:PLAYS_IN]-(cp:Competition WHERE cp.competitionId IN ['GB1'])
            WITH p.playerId as playerId, p.name as playerName, c.clubId as clubId, c.name as clubName, count(*) as n_clubs WHERE n_clubs > 1
            WITH playerId, playerName, clubId, clubName, n_clubs, rand() as r ORDER BY r LIMIT 1
            RETURN playerId, playerName, clubId, clubName`,
            {},
            { database: 'football' }
        );

        for(record of records) {
            // Add first player
            finalPlayers[record.get('clubName').valueOf()] = [record.get('playerName')];
            const players = await lookupPlayersByClub(record.get('clubId').valueOf(), record.get('playerId').valueOf(), 3, allSelectedPlayers);

            for(player of players) {
                finalPlayers[record.get('clubName').valueOf()].push(player.get('p').properties.name);
                
                finalPlayers[player.get('c2').properties.name.valueOf()] = [];
                const morePlayers = await lookupPlayersByClub(player.get('c2').properties.clubId.valueOf(), player.get('p').properties.playerId.valueOf(), 4, allSelectedPlayers);
                for(morePlayer of morePlayers) {
                    finalPlayers[player.get('c2').properties.name.valueOf()].push(morePlayer.get('p').properties.name);
                }
            }
        }

    } catch (error) {
        console.error(error);
    }


    let i = 1;

    let ret = []; 
    for (const [key, value] of Object.entries(finalPlayers)) {
        ret.push(
            {
                category: key,
                words: value,
                difficulty: i
            }
        );
        i++;
    }

    console.log(ret);

    return ret;
}


async function lookupPlayersByClub(clubId, playerId, numPlayers, excludePlayers) {
    const { records, summary, keys } = await driver.executeQuery(
        `MATCH (p:Player)-[:PLAYED_FOR]-(c:Club {clubId: $clubId}) 
        WITH p, c WHERE NOT p.playerId IN $excludePlayers
        MATCH (p)-[:PLAYED_FOR]-(c2:Club)-[:PLAYS_IN]-(cp:Competition WHERE cp.competitionId IN ['GB1'])
        WITH p, c2, count(*) as n_clubs WHERE n_clubs > 1 AND c2.clubId <> $clubId
        RETURN p, c2, rand() as r ORDER BY r LIMIT toInteger($numPlayers)`,
        { clubId, playerId, numPlayers, excludePlayers},
        { database: 'football' }
    );

    return records;
}


// getGameData(); //.then(data => console.log(data));

export default getGameData;
