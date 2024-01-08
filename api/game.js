import getGameData from "./_generate.js";

export const config = {
    runtime: 'edge',
};

export default async function handler(
  request,
  response
) {
    const GameData = await getGameData();    
    return Response.json({ GameData }, {
            headers: {
            'Cache-Control': 'public, s-maxage=3600'        
        }
    });
}
