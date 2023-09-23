"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geniusKey = exports.configSpotify = exports.configTwitter = void 0;
require('dotenv').config();
exports.configTwitter = {
    apiKey: process.env.API_KEY || '',
    apiSecret: process.env.API_SECRET || '',
    accessToken: process.env.ACCESS_TOKEN || '',
    accessSecret: process.env.ACCES_SECRET || '',
    bearerToken: process.env.BEARER_TOKEN || ''
};
exports.configSpotify = {
    clientID: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    authURL: process.env.AUTH_URL || '',
    artistID: process.env.ARTIST_ID || ''
};
exports.geniusKey = {
    apiKey: process.env.GENIUS_KEY || ''
};
