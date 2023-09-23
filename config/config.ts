require('dotenv').config();

export const configTwitter = {
  apiKey: process.env.API_KEY || '',
  apiSecret: process.env.API_SECRET || '',
  accessToken: process.env.ACCESS_TOKEN || '',
  accessSecret: process.env.ACCES_SECRET || '',
  bearerToken: process.env.BEARER_TOKEN || ''
};


export const configSpotify = {
    clientID: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    authURL: process.env.AUTH_URL || '',
    artistID: process.env.ARTIST_ID || ''
  };

export const geniusKey = {
    apiKey: process.env.GENIUS_KEY || ''
}