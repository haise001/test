const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

exports.handler = async (event) => {
  // 1. Инициализируем Firebase прямо здесь с жестким отловом ошибок
  if (admin.apps.length === 0) {
    try {
      // Ищем ключ в корне проекта и в папке функции для надежности
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
        const serviceAccount = JSON.parse(fileContent);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log("◈ [Firebase] Успешно подключено через найденный файл:", keyPath);
      } else {
        // Если файла нет, пробуем прочитать переменную окружения
        const envConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!envConfig) {
          throw new Error("Файл 'firebase-admin-key.json' не найден, и переменная FIREBASE_SERVICE_ACCOUNT пуста.");
        }
        
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(envConfig))
        });
        console.log("◈ [Firebase] Успешно подключено через Environment Variables");
      }
    } catch (err) {
      // Возвращаем ошибку прямо на экран в браузере, чтобы мы её увидели
      return {
        statusCode: 500,
        body: `Ошибка инициализации Firebase SDK: ${err.message}. Проверьте наличие ключа.`
      };
    }
  }

  // 2. Подключаем базу данных, теперь это безопасно
  const db = admin.firestore();

  const STEAM_API_KEY = process.env.STEAM_API_KEY;
  const host = event.headers['host'] || 'localhost:8888';
  const query = event.queryStringParameters || {};

  if (!STEAM_API_KEY) {
    return { 
      statusCode: 500, 
      body: 'Steam API key missing. Добавьте STEAM_API_KEY в файл .env' 
    };
  }

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
          const userPayload = {
            displayName: player.personaname,
            photoURL: player.avatarfull,
            squadHours,
            steamId,
            lastLogin: new Date().toISOString()
          };

          await db.collection('users').doc(userId).set(userPayload, { merge: true });

          const memberRef = db.collection('members').doc(userId);
          const memberSnap = await memberRef.get();
          if (!memberSnap.exists) {
            await memberRef.set({
              nick: player.personaname,
              role: 'recruit',
              rankName: 'Private',
              hours: squadHours,
              avatar: player.avatarfull,
              steamId,
              joinedDate: new Date().toISOString().split('T')[0],
              status: 'online'
            });
          }

          return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: getRedirectPage({
              uid: userId,
              displayName: player.personaname,
              photoURL: player.avatarfull,
              squadHours,
              steamId
            })
          };
        }
      } catch (error) {
        console.error('Steam API error:', error);
        return { statusCode: 500, body: 'Steam API error' };
      }
    }
  }

// Используем localhost, но без порта 8888 (Akamai не любит нестандартные порты бэкенда)
// Код сам поймет, запущен он на localhost или в облаке Netlify
  const protocol = host.includes('localhost') ? 'http' : 'https';
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
    headers: { 'Location': steamUrl },
    body: ''
  };
};