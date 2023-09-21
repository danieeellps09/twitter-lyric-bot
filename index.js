"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postarTweet = void 0;
const axios_1 = __importDefault(require("axios"));
const CronJob = require("cron").CronJob;
const genius_lyrics_api_1 = require("genius-lyrics-api");
const twitter_api_v2_1 = require("twitter-api-v2");
const T = new twitter_api_v2_1.TwitterApi({
    appKey: 'FwnW4b2vTi8ZaM4w2JhqfaJJX',
    appSecret: 'p5N172jZDOXamtfc8xPb97tCYpvttcRoOnnSfWl3kN5YCcFPo0',
    accessToken: '1462192256333619201-0ujTbp9aaVt5f7u0wsEp7hzUx1AOhp',
    accessSecret: 'HHKNx8sXFi5diyHRE2cPsChtWFR1k5C83upzDiK2umLJn',
});
const dev_client = new twitter_api_v2_1.TwitterApi('AAAAAAAAAAAAAAAAAAAAAMoeqAEAAAAARENSvBD6oJ7Ml0%2BSJMYrMNeVNeA%3DPMIuNSIEZiAVuG8sqMU3KbfjXXrVm4zEwj1meZozHp6E2fCgOj');
// );
const clientId = 'aa471e0e3dff4b39850d2fa210aa4daf';
const clientSecret = 'c23a041c08b44c1a8cfa4f07460e8260';
const authUrl = 'https://accounts.spotify.com/api/token';
const data = new URLSearchParams();
data.append('grant_type', 'client_credentials');
const authHeader = {
    headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};
function getToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(authUrl, data, authHeader);
            let accessToken = response.data.access_token;
            return accessToken;
        }
        catch (error) {
            console.error('Erro ao obter o token de acesso:', error);
        }
    });
}
const artistId = '0aLsJXIaJ6MMCZIzaGpMaX';
const artistName = 'LittleJoy';
function getTrackings() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accessToken = yield getToken();
            const response = yield axios_1.default.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const albums = response.data.items;
            const albumIds = albums.map((album) => album.id);
            const allTracks = [];
            for (const albumId of albumIds) {
                const albumTracksResponse = yield axios_1.default.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                const tracks = albumTracksResponse.data.items;
                const trackNames = tracks.map((track) => {
                    const nameParts = track.name.split(' - ');
                    return nameParts[0];
                });
                allTracks.push(...trackNames);
            }
            return allTracks;
        }
        catch (error) {
            console.error('Ocorreu um erro:', error);
        }
    });
}
function getLyricOfTrack() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const listOfTracks = yield getTrackings();
            if (listOfTracks !== undefined) {
                const randomIndex = Math.floor(Math.random() * listOfTracks.length);
                let randomTrack = listOfTracks[randomIndex];
                const options = {
                    apiKey: 'tGvqViygd3N99gAuFa-B3iNlf0pkqnhTWK7QyGZdKAdP_-xCHVZbC2rkQJPoMQo1',
                    title: `${randomTrack}`,
                    artist: `${artistName}`,
                    optimizeQuery: true
                };
                const lyrics = yield (0, genius_lyrics_api_1.getLyrics)(options).then((lyrics) => lyrics);
                return lyrics;
            }
            else {
                throw new Error("A lista de faixas está vazia ou indefinida.");
            }
        }
        catch (error) {
            throw error;
        }
    });
}
function getRandomLyricChunk() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let lyrics = yield getLyricOfTrack();
            const maxCharsPerTweet = 100;
            const tweetChunks = [];
            let currentChunk = '';
            let lastWordBreakIndex = -1;
            for (let i = 0; i < lyrics.length; i++) {
                const char = lyrics[i];
                if (currentChunk.length + 1 <= maxCharsPerTweet) {
                    currentChunk += char;
                    if (/\s/.test(char)) {
                        lastWordBreakIndex = i;
                    }
                }
                else {
                    if (lastWordBreakIndex !== -1) {
                        tweetChunks.push(lyrics.substring(0, lastWordBreakIndex + 1));
                        lyrics = lyrics.substring(lastWordBreakIndex + 1);
                        lastWordBreakIndex = -1;
                    }
                    else {
                        tweetChunks.push(currentChunk);
                        currentChunk = char;
                    }
                }
            }
            if (currentChunk.length > 0) {
                tweetChunks.push(currentChunk);
            }
            const randomIndex = Math.floor(Math.random() * tweetChunks.length);
            const randomChunk = tweetChunks[randomIndex];
            console.log(randomChunk);
            return randomChunk;
        }
        catch (error) {
            throw error;
        }
    });
}
const read = T.readWrite;
function postarTweet() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const randomLyricChunk = yield getRandomLyricChunk();
            yield read.v2.tweet(randomLyricChunk);
            console.log('Tweet:', randomLyricChunk);
        }
        catch (error) {
            console.error('Erro ao escrever:', error);
        }
    });
}
exports.postarTweet = postarTweet;
postarTweet();
