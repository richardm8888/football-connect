import neo4j from 'neo4j-driver';
import { sql } from "@vercel/postgres";

const URI = process.env.NEO4J_HOST || 'neo4j://localhost:7687';
const USER = process.env.NEO4J_USER || 'neo4j';
const PASSWORD = process.env.NEO4J_PASSWORD || 'qwerty123';
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function getCached() {
    const { rows } = await sql`SELECT * FROM games WHERE date = CURRENT_DATE;`;

    return rows[0];
}

async function saveCached(gameData) {
    await sql`INSERT INTO games (date, data) VALUES (CURRENT_DATE, ${JSON.stringify(gameData)});`;
}

async function getGameData() {

    const cached = await getCached();

    if (cached) {
        return JSON.parse(cached.data);
    } else {

        let finalPlayers = [];
        let allSelectedPlayers = [];
        let allClubs = [];
        try {
            const { records, summary, keys } = await driver.executeQuery(
                `
                MATCH (p:Player)-[pf:PLAYED_FOR]-(:Club) 
                WITH p, sum(pf.count) as totalPlayed WHERE totalPlayed > 100
                MATCH (p)-[:PLAYED_FOR]-(c:Club)-[:PLAYS_IN]-(cp:Competition WHERE cp.competitionId IN ['GB1'])
                WITH p.playerId as playerId, p.name as playerName, c.clubId as clubId, c.name as clubName, count(*) as n_clubs WHERE n_clubs > 1
                WITH playerId, playerName, clubId, clubName, n_clubs, rand() as r ORDER BY r LIMIT 1
                RETURN playerId, playerName, clubId, clubName`,
                {},
                { database: 'football' }
            );

            for(let record of records) {
                // Add first player
                finalPlayers[record.get('clubName')] = [record.get('playerName')];
                allSelectedPlayers.push(record.get('playerId').low);
                allClubs.push(record.get('clubId').low);
                const players = await lookupPlayersByClub(record.get('clubId').low, record.get('playerId').low, 3, allSelectedPlayers, []);

                for(let player of players) {
                    finalPlayers[record.get('clubName')].push(player.get('p').properties.name);
                    allSelectedPlayers.push(player.get('p').properties.playerId.low);
                    
                    finalPlayers[player.get('c2').properties.name] = [];
                    allClubs.push(player.get('c2').properties.clubId.low);
                    const morePlayers = await lookupPlayersByClub(player.get('c2').properties.clubId.low, player.get('p').properties.playerId.low, 4, allSelectedPlayers, allClubs);
                    for(let morePlayer of morePlayers) {
                        finalPlayers[player.get('c2').properties.name].push(morePlayer.get('p').properties.name);
                        allSelectedPlayers.push(morePlayer.get('p').properties.playerId.low);
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

        if (ret.length < 4) {
            return getGameData();
        }

        saveCached(ret);

        return ret;
    }
}


async function lookupPlayersByClub(clubId, playerId, numPlayers, excludePlayers, excludeClubs) {
    const { records, summary, keys } = await driver.executeQuery(
        `
        MATCH (p:Player WHERE NOT p.playerId IN $excludePlayers)-[pf:PLAYED_FOR]-(ec:Club WHERE NOT ec.clubId IN $excludeClubs) 
        WITH p, sum(pf.count) as totalPlayed WHERE totalPlayed > 100
        MATCH (p)-[:PLAYED_FOR]-(c:Club {clubId: $clubId})
        MATCH (p)-[:PLAYED_FOR]-(c2:Club)-[:PLAYS_IN]-(cp:Competition WHERE cp.competitionId IN ['GB1'])
        WITH p, c2, count(*) as n_clubs WHERE n_clubs > 1 AND c2.clubId <> $clubId
        RETURN p, c2, rand() as r ORDER BY r LIMIT toInteger($numPlayers)`,
        { clubId, playerId, numPlayers, excludePlayers, excludeClubs},
        { database: 'football' }
    );

    return records;
}

export default getGameData;
