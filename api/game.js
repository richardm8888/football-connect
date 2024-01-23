import getGameData from "./_generate.js";

export default async function handler(
  request,
  response
) {
    if (!request.url) return response.status(400);

    const GameData = await getGameData(request);

    return response.status(200).json({ GameData });
}
