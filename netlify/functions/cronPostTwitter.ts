import { postarTweet } from "../..";
import { Handler,Context,HandlerEvent } from "@netlify/functions";
const {schedule} = require("@netlify/functions")

exports.handler = schedule('*/150 * * * * ', async() => {
  try {
    await postarTweet();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'O twitter sera postado a cada uma hora chamada com sucesso.' }),
    };
  } catch (error) {
    console.error('Erro ao chamar a função postarTweet:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor.' }),
    };
  }
});



