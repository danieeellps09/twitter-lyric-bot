import { postarTweet } from "../..";
import { Handler,Context,HandlerEvent } from "@netlify/functions";
const {schedule} = require("@netlify/functions")

const handler: Handler = async() => {
  try {
    await postarTweet();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Função postarTweet chamada com sucesso.' }),
    };
  } catch (error) {
    console.error('Erro ao chamar a função postarTweet:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor.' }),
    };
  }
};

const agendarTweet = schedule("@hourly", handler)

export { agendarTweet };


