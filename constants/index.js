"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_KEYPAIR = exports.USER_PRIVATE_KEY = exports.WALLET_PRIVATE_KEY = exports.ENV = void 0;
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
require("dotenv").config();
// Endpoints, connection
exports.ENV = "mainnet-beta";
// Wallets
exports.WALLET_PRIVATE_KEY = "3qswEeCJcA9ogpN3JEuXBtmnU35YPzSxBwzrk6sdTPhogMJ64WuabU9XWg2yUegJvv1qupYPqo2jQrrK26N7HGsD";
exports.USER_PRIVATE_KEY = bs58_1.default.decode(exports.WALLET_PRIVATE_KEY);
exports.USER_KEYPAIR = web3_js_1.Keypair.fromSecretKey(exports.USER_PRIVATE_KEY);
//# sourceMappingURL=index.js.map