import bs58 from 'bs58'
import { Jupiter, RouteInfo, TOKEN_LIST_URL, TransactionFeeInfo } from '@jup-ag/core'
import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, sendAndConfirmTransaction, AccountMeta } from '@solana/web3.js'
//Debug error is executed, it is solved by executing json file.
//import fetch from 'node-fetch'
import {
    ENV,
    Token,
} from "./constants";
import tokens_json from './tokens.json'

export const WALLET_PRIVATE_KEY = "";
export const USER_PRIVATE_KEY = bs58.decode(WALLET_PRIVATE_KEY);
export const USER_KEYPAIR = Keypair.fromSecretKey(USER_PRIVATE_KEY);


const SOLANA_RPC_ENDPOINT = "https://solana-api.projectserum.com";
const INPUT_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const OUTPUT_MINT_ADDRESS = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
const sleep = async (ms: number) => {
    return new Promise((r) => setTimeout(r, ms));
};
const getPossiblePairsTokenInfo = ({
    tokens,
    routeMap,
    inputToken,
}: {
    tokens: Token[];
    routeMap: Map<string, string[]>;
    inputToken?: Token;
}) => {
    try {
        if (!inputToken) {
            return {};
        }

        const possiblePairs = inputToken
            ? routeMap.get(inputToken.address) || []
            : []; // return an array of token mints that can be swapped with SOL
        const possiblePairsTokenInfo: { [key: string]: Token | undefined } = {};
        possiblePairs.forEach((address) => {
            possiblePairsTokenInfo[address] = tokens.find((t) => {
                return t.address == address;
            });
        });
        // Perform your conditionals here to use other outputToken
        // const alternativeOutputToken = possiblePairsTokenInfo[USDT_MINT_ADDRESS]
        return possiblePairsTokenInfo;
    } catch (error) {
        throw error;
    }
};
 (async () => {
    // ...
    const connection = new Connection(SOLANA_RPC_ENDPOINT); 
    //  Load Jupiter
     console.log(USER_PRIVATE_KEY)
     console.log(USER_KEYPAIR)
    const jupiter = await Jupiter.load({
        connection,
        cluster: ENV,
        user: USER_KEYPAIR, // or public key
        // platformFeeAndAccounts:  NO_PLATFORM_FEE,
        // routeCacheDuration: CACHE_DURATION_MS
        // wrapUnwrapSOL: true (default) | false 
    });
    const token_list = TOKEN_LIST_URL[ENV].toString()
     const tokens = tokens_json as Token[];
     const inputToken:Token = tokens.find((t) => t.address == INPUT_MINT_ADDRESS) as Token; // USDC Mint Info
     const outputToken: Token = tokens.find((t) => t.address == OUTPUT_MINT_ADDRESS) as Token; // USDT Mint Info
     const routeMap: Map<string, string[]> = jupiter.getRouteMap()
     
    //tokens = await (await fetch(TOKEN_LIST_URL[ENV])).json(); 
     // Alternatively, find all possible outputToken based on your inputToken
     //const possiblePairsTokenInfo = await getPossiblePairsTokenInfo({
     //    tokens,
     //    routeMap,
     //    inputToken,
     //});
     //const possiblePairsTokenInfoOut = await getPossiblePairsTokenInfo({
     //    tokens,
     //    routeMap,
     //    inputToken:outputToken,
     //});
     //
     //console.log(tokens_json)
     const inputAmount = 1000000
     const slippage  = 0.1
     const routes = await jupiter.computeRoutes({
         inputMint: new PublicKey(inputToken.address),
         outputMint: new PublicKey(inputToken.address),
         inputAmount, // 1000000 => 1 USDC if inputToken.address is USDC mint
         slippage,  // 1 = 1%
         onlyDirectRoutes:false
         // forceFetch (optional) to force fetching routes and not use the cache
         // intermediateTokens, if provided will only find routes that use the intermediate tokens
         // feeBps
     })
     let inputAmountOut = routes.routesInfos[0].outAmount
     
     const routesOut = await jupiter.computeRoutes({
         inputMint: new PublicKey(outputToken.address),
         outputMint: new PublicKey(inputToken.address),
         inputAmount: inputAmountOut, // 1000000 => 1 USDC if inputToken.address is USDC mint
         slippage  // 1 = 1%
         // forceFetch (optional) to force fetching routes and not use the cache
         // intermediateTokens, if provided will only find routes that use the intermediate tokens
         // feeBps
     })


     let bestRoute = routes.routesInfos[0];
     let bestRoute_Tx2 = routesOut.routesInfos[0];
     console.log("====================bestRouteOut===================");
     console.log(bestRoute);
     try {
         const { execute } = await jupiter.exchange({
             routeInfo: bestRoute
         });
         const swapResult = await execute();
         //
         //
         //=====================================================================//
         //                            Challenge 1                              //
         //=====================================================================//
         //Error: Invalid arguments: userQuoteTokenAccount not provided. or Error: Invalid arguments: destinationTokenAccount not provided.
         //
         //Is the getDepositAndFeeOut setting not working?
         //
         //console.log(bestRoute.getDepositAndFee())
         //console.log(bestRoute_Tx2.getDepositAndFee())
         //bestRoute.marketInfos = bestRoute.marketInfos.concat(bestRoute_Tx2.marketInfos);
         //bestRoute.outAmount = bestRoute_Tx2.outAmount;
         //bestRoute.outAmountWithSlippage = bestRoute_Tx2.outAmountWithSlippage;
         //bestRoute.priceImpactPct = bestRoute.priceImpactPct + bestRoute_Tx2.priceImpactPct;
         //let getDepositAndFeeOut:()=>Promise<TransactionFeeInfo | undefined> = () =>jupiter.getDepositAndFees({
         //    marketInfos: bestRoute.marketInfos,
         //    userPublicKey: USER_KEYPAIR.publicKey,
         //    serumOpenOrdersPromise: Jupiter.findSerumOpenOrdersForOwner({
         //        userPublicKey: USER_KEYPAIR.publicKey,
         //        cluster: ENV,
         //        connection
         //    }),
         //}).catch(undefined);
         //bestRoute.getDepositAndFee = getDepositAndFeeOut;
         //
         //
         //
         // Routes are sorted based on outputAmount, so ideally the first route is the best.
         // const { execute } = await jupiter.exchange({
         //     routeInfo: bestRoute
         // });
         // const swapResult = await execute()
         //if ("txid" in swapResult) {
         //   console.log("Executed swap, signature:", swapResult.txid);
         //} else if ("error" in swapResult) {
         //    console.log("error:", swapResult.error);
         //}
         //if (swapResult.error) {
         //    console.log(swapResult.error);
         //} else {
         //    console.log(`https://explorer.solana.com/tx/${swapResult.txid}`);
         //    console.log(`inputAddress=${swapResult.inputAddress.toString()} outputAddress=${swapResult.outputAddress.toString()}`);
         //    console.log(`inputAmount=${swapResult.inputAmount} outputAmount=${swapResult.outputAmount}`);
         //}
         //========================================================================


        //=====================================================================//
        //                            Challenge 2(sendTransaction)             //
        //=====================================================================//
        //================No error, but I can't send.==========================//
        //   console.log(routes.routesInfos[0])
        //
        //
        //   const setupTransaction_tx1 = await (await jupiter.exchange({
        //       routeInfo: bestRoute
        //   })).transactions.swapTransaction as Transaction;
        //
        //   const setupTransaction_tx2 = await (await jupiter.exchange({
        //       routeInfo: bestRoute_Tx2
        //   })).transactions.swapTransaction as Transaction;
        //
        //   const transaction = new Transaction();
        //   transaction.add(setupTransaction_tx1);
        //   transaction.add(setupTransaction_tx2);
        //   transaction.setSigners(USER_KEYPAIR.publicKey);
        //   const txid =connection.sendTransaction(transaction, [USER_KEYPAIR]);
        //
        //   console.log(txid);         // Execute swap
        //=====================================================================//
        //                            Challenge 3 (sendRawTransaction)         //
        //=====================================================================//
        //   const rawTransaction = transaction.serialize();
        //   connection.sendRawTransaction(rawTransaction, {
        //    skipPreflight: true,
        //});
        //   await sleep(500);
        //=================================================================


     } catch (error) {
         console.log({ error });
     }
     console.log("end")
    // ...
})()