import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const STEAM_API_KEY = '44C5D04C2E8832A497800D9D812630DF'; // Замени на свой ключ

// Получение данных профиля по SteamID
app.get('/api/steam/user/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Steam API error' });
  }
});

// Получение игрового времени в Squad
app.get('/api/steam/games/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_played_free_games=true&appids_filter[0]=393380`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Steam API error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Steam proxy running on port ${PORT}`);
});
