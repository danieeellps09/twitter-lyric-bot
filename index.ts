import axios from 'axios';
import { CronTime } from 'cron';
const CronJob = require("cron").CronJob;
import { getLyrics } from 'genius-lyrics-api';
import { TwitterApi } from "twitter-api-v2";


const T = new TwitterApi({
    appKey: 'FwnW4b2vTi8ZaM4w2JhqfaJJX',
    appSecret: 'p5N172jZDOXamtfc8xPb97tCYpvttcRoOnnSfWl3kN5YCcFPo0',
    accessToken: '1462192256333619201-0ujTbp9aaVt5f7u0wsEp7hzUx1AOhp',
    accessSecret: 'HHKNx8sXFi5diyHRE2cPsChtWFR1k5C83upzDiK2umLJn',
});
const dev_client = new TwitterApi('AAAAAAAAAAAAAAAAAAAAAMoeqAEAAAAARENSvBD6oJ7Ml0%2BSJMYrMNeVNeA%3DPMIuNSIEZiAVuG8sqMU3KbfjXXrVm4zEwj1meZozHp6E2fCgOj');
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
             apiKey: 'tGvqViygd3N99gAuFa-B3iNlf0pkqnhTWK7QyGZdKAdP_-xCHVZbC2rkQJPoMQo1',
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

        for (const word of words) {
            if (currentChunk.length + word.length + 1 <= maxCharsPerTweet) { 
                currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
            } else {
                if (currentChunk.length <= maxCharsPerTweet) {
                    validChunks.push(currentChunk);
                }
                currentChunk = word;
            }
        }

        if (currentChunk.length <= maxCharsPerTweet) {
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













