import { postarTweet } from "../..";
import { Handler,Context,HandlerEvent } from "@netlify/functions";
// import { schedule } from "@netlify/functions";

exports.handler = async() => {
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



