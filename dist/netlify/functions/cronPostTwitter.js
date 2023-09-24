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
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const { schedule } = require("@netlify/functions");
exports.handler = schedule('*/90 * * * * ', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, __1.postarTweet)();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'O twitter sera postado a cada uma hora chamada com sucesso.' }),
        };
    }
    catch (error) {
        console.error('Erro ao chamar a função postarTweet:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno do servidor.' }),
        };
    }
}));
