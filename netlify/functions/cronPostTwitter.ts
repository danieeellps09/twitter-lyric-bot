// import { postarTweet } from "..";

import { Handler,Context,HandlerEvent,schedule } from "@netlify/functions";

exports.handler = async (event:HandlerEvent) => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Tarefa agendada executada com sucesso.', }),
    };
};



