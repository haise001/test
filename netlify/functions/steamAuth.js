const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

export const handler = async (event) => {
  if (admin.apps.length === 0) {
    try {
      const keyPositions = [
        path.join(__dirname, 'firebase-admin-key.json'),
        path.join(process.cwd(), 'netlify', 'functions', 'firebase-admin-key.json'),
        path.join(process.cwd(), 'firebase-admin-key.json')
      ];

      let keyPath = null;
      for (const pos of keyPositions) {
        if (fs.existsSync(pos)) {
          keyPath = pos;
          break;
        }
      }

      if (keyPath) {
        const fileContent = fs.readFileSync(keyPath, 'utf8');
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(fileContent))
        });
      } else {
        const envConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!envConfig) throw new Error("Firebase credentials missing.");
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(envConfig))
        });
      }
    } catch (err) {
      return { statusCode: 500, body: `Firebase Init Error: ${err.message}` };
    }
  }

  const db = admin.firestore();
  const STEAM_API_KEY = process.env.STEAM_API_KEY;
  const host = event.headers['host'] || 'localhost:8888';
  const query = event.queryStringParameters || {};
  const protocol = host.includes('localhost') ? 'http' : 'https';

  const claimedId = query['openid.claimed_id'];
  const isValid = query['openid.op_endpoint'] === 'https://steamcommunity.com/openid/login';

  if (claimedId && isValid) {
    const steamId = claimedId.split('/').pop();

    if (steamId) {
      try {
        const userResponse = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
        );
        const userData = await userResponse.json();
        const player = userData?.response?.players?.[0];

        if (player) {
          const gamesResponse = await fetch(
            `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_played_free_games=true&appids_filter[0]=393380`
          );
          const gamesData = await gamesResponse.json();
          const squadGame = gamesData?.response?.games?.[0];
          const squadHours = squadGame ? Math.floor(squadGame.playtime_forever / 60) : 0;

          const userId = 'steam_' + steamId;

          // ПИШЕМ СРАЗУ В MEMBERS, ЧТОБЫ ИСКЛЮЧИТЬ ПУСТЫЕ КОЛЛЕКЦИИ
          await db.collection('members').doc(userId).set({
            uid: userId,
            nick: player.personaname,
            avatar: player.avatarfull, // Ссылка на аватарку высокого разрешения
            hours: squadHours,
            steamId: steamId,
            role: 'recruit',
            rankName: 'Private',
            status: 'online',
            joinedDate: new Date().toISOString().split('T')[0]
          }, { merge: true });

          return {
            statusCode: 302,
            headers: { 'Location': `${protocol}://${host}/?auth_success_id=${userId}` },
            body: ''
          };
        }
      } catch (error) {
        console.error('Steam API error:', error);
        return { statusCode: 500, body: 'Steam API error' };
      }
    }
  }

  const returnUrl = `${protocol}://${host}/.netlify/functions/steamAuth`;
  const realmUrl = `${protocol}://${host}`;

  const steamUrl = `https://steamcommunity.com/openid/login?` +
    `openid.ns=http://specs.openid.net/auth/2.0&` +
    `openid.mode=checkid_setup&` +
    `openid.return_to=${encodeURIComponent(returnUrl)}&` +
    `openid.realm=${encodeURIComponent(realmUrl)}&` +
    `openid.identity=http://specs.openid.net/auth/2.0/identifier_select&` +
    `openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;

  return {
  statusCode: 302,
  headers: { 'Location': `${protocol}://${host}/?auth_success_id=${userId}` },
  body: ''
};