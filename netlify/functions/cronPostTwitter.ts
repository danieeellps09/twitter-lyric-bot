// import { postarTweet } from "..";

import { Handler,Context,HandlerEvent } from "@netlify/functions";

exports.handler = async() => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Tarefa executada', }),
    };
};



