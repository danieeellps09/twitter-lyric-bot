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
const config_1 = require("./config/config");
const T = new twitter_api_v2_1.TwitterApi({
    appKey: config_1.configTwitter.apiKey,
    appSecret: config_1.configTwitter.apiSecret,
    accessToken: config_1.configTwitter.accessToken,
    accessSecret: config_1.configTwitter.accessSecret,
});
const dev_client = new twitter_api_v2_1.TwitterApi(config_1.configTwitter.bearerToken);
// );
const clientId = config_1.configSpotify.clientID;
const clientSecret = config_1.configSpotify.clientSecret;
const authUrl = config_1.configSpotify.authURL;
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
                    apiKey: config_1.geniusKey.apiKey,
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
            const maxCharsPerTweet = 280;
            const validChunks = [];
            let currentChunk = '';
            const words = lyrics.split(/\s+/);
            let verseCount = 0;
            for (const word of words) {
                if (currentChunk.length + word.length + 1 <= maxCharsPerTweet) {
                    currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
                }
                else {
                    if (currentChunk.length <= maxCharsPerTweet) {
                        validChunks.push(currentChunk);
                    }
                    currentChunk = word;
                }
                // Conta os versos
                if (/\[Verse \d+\]/.test(word)) {
                    verseCount++;
                    if (verseCount >= 3) {
                        if (currentChunk.length <= maxCharsPerTweet) {
                            validChunks.push(currentChunk);
                        }
                        break;
                    }
                }
            }
            if (currentChunk.length <= maxCharsPerTweet && verseCount >= 2) {
                validChunks.push(currentChunk);
            }
            const filteredChunks = validChunks.filter(chunk => chunk.length <= maxCharsPerTweet);
            if (filteredChunks.length === 0) {
                throw new Error("Nenhuma parte da letra se encaixa dentro do limite de caracteres.");
            }
            const randomIndex = Math.floor(Math.random() * filteredChunks.length);
            const randomChunk = filteredChunks[randomIndex];
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
getRandomLyricChunk();
