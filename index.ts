import axios from 'axios';
import { CronTime } from 'cron';
const CronJob = require("cron").CronJob;
import { getLyrics } from 'genius-lyrics-api';
import { TwitterApi } from "twitter-api-v2";
import { configTwitter, configSpotify, geniusKey } from './config/config';


const T = new TwitterApi({
    appKey: configTwitter.apiKey,
    appSecret: configTwitter.apiSecret,
    accessToken: configTwitter.accessToken,
    accessSecret: configTwitter.accessSecret,
});
const dev_client = new TwitterApi(configTwitter.bearerToken);
// );


const clientId = configSpotify.clientID;
const clientSecret = configSpotify.clientSecret;
const authUrl = configSpotify.authURL;
const data = new URLSearchParams();
data.append('grant_type', 'client_credentials');

const authHeader = {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
};

async function getToken() {
    try {
        const response = await axios.post(authUrl, data, authHeader);
        let accessToken = response.data.access_token;
        return accessToken
    } catch (error) {
        console.error('Erro ao obter o token de acesso:', error);
    }
}


const artistId = '0aLsJXIaJ6MMCZIzaGpMaX';
const artistName = 'LittleJoy';


async function getTrackings() {
    
    try{

        const accessToken = await getToken();
        const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
            const albums: any[] = response.data.items;
            const albumIds: any[] = albums.map((album: any) => album.id);
            const allTracks:string[] = [];
        
            for (const albumId of albumIds) {
                const albumTracksResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                const tracks:any = albumTracksResponse.data.items;
        
                const trackNames = tracks.map((track:any ) => {
                    const nameParts = track.name.split(' - ');
                    return nameParts[0]; 
                  });
                  allTracks.push(...trackNames); 
            }

            return allTracks;

    }catch(error) {
            console.error('Ocorreu um erro:', error);
        }

}


async function getLyricOfTrack(){
    try{
        const listOfTracks: string[] | undefined = await getTrackings(); 
        if (listOfTracks !== undefined) {
         const randomIndex = Math.floor(Math.random() * listOfTracks.length);
         let randomTrack = listOfTracks[randomIndex];
         const options = {
             apiKey: geniusKey.apiKey,
             title: `${randomTrack}`,
             artist: `${artistName}`,
             optimizeQuery: true
         };
         
        const lyrics = await  getLyrics(options).then((lyrics:any) => lyrics);
         return lyrics
       } else{
         throw new Error("A lista de faixas está vazia ou indefinida.");
       }  
    }catch(error){
        throw error;
    }
}

 

async function getRandomLyricChunk() {
    try {
        let lyrics = await getLyricOfTrack();
        
        const maxCharsPerTweet = 280;
        const validChunks = [];
        let currentChunk = '';
        const words = lyrics.split(/\s+/);
        let verseCount = 0;

        for (const word of words) {
            if (currentChunk.length + word.length + 1 <= maxCharsPerTweet) { 
                currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
            } else {
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
    } catch (error) {
        throw error;
    }
}
const read = T.readWrite

export async function postarTweet() {
    try {
        const randomLyricChunk = await getRandomLyricChunk();
        await read.v2.tweet(randomLyricChunk)
        console.log('Tweet:', randomLyricChunk);
    } catch (error) {
        console.error('Erro ao escrever:', error);
    }
}


getRandomLyricChunk()









