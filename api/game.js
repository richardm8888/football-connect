import getGameData from "../src/generate";

export default async function handler(
  request,
  response
) {
    if (!request.url) return response.status(400);
    
    const GameData = await getGameData();
    
    return response.status(200).json({ GameData });
}
