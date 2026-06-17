const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

export const handler = async (event) => {
  if (admin.apps.length === 0) {
    const envConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(envConfig))
    });
  }

  const db = admin.firestore();
  const STEAM_API_KEY = process.env.STEAM_API_KEY;
  const host = event.headers['host'] || 'localhost:8888';
  const query = event.queryStringParameters || {};
  const protocol = host.includes('localhost') ? 'http' : 'https';

  const claimedId = query['openid.claimed_id'];
  const isValid = query['openid.op_endpoint'] === 'https://steamcommunity.com/openid/login';

  // Если вернулись от Steam с успешным инфо
  if (claimedId && isValid) {
    const steamId = claimedId.split('/').pop();

    if (steamId) {
      try {
        // Получаем инфо о юзере
        const userResponse = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
        );
        const userData = await userResponse.json();
        const player = userData?.response?.players?.[0];

        if (player) {
          const userId = 'steam_' + steamId;

          // Сохраняем в Firestore
          await db.collection('users').doc(userId).set({
            uid: userId,
            displayName: player.personaname,
            photoURL: player.avatarfull,
            steamId: steamId,
            lastLogin: new Date().toISOString()
          }, { merge: true });

          // Редиректим на фронт, передавая ТОЛЬКО чистый steamId
          return {
            statusCode: 302,
            headers: { 'Location': `${protocol}://${host}/?auth_success_id=${userId}` },
            body: ''
          };
        }
      } catch (err) {
        return { statusCode: 500, body: 'Database or Steam API Error' };
      }
    }
  }

  // Если это первый клик (отправка в Steam)
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