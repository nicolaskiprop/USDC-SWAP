import { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, Percent } from '@uniswap/sdk'
import { constants, Contract, providers, utils, Wallet } from "ethers"
import { ROUTER_ABI } from "./constants/router.js";
import { config } from './config/config.js'
class SushiSwap {
    router;
    provider;
    signer;
    constructor() {
        this.provider = new providers.JsonRpcProvider(config.JSON_URL)
        this.signer = new Wallet(config.PRIVATE_KEY, this.provider)
        this.router = new Contract(config.ROUTER_ADDRESS, ROUTER_ABI, this.signer)
    }

    swap = async (
        toToken,
        amountIn,
        fromToken = config.USDC_ADDRESS
    ) => {
        try {
            let decimals = await this.#decimals(fromToken)

            fromToken = new Token(ChainId.MAINNET, fromToken, decimals)

            amountIn = utils.parseUnits(amountIn, decimals);

            decimals = await this.#decimals(toToken)
            toToken = new Token(ChainId.MAINNET, toToken, decimals)

            let pair = await Fetcher.fetchPairData(toToken, fromToken[toToken.chainId])

            let route = new Route([pair], fromToken[toToken.chainId])


            let trade = new Trade(route, new TokenAmount(fromToken[toToken.chainId], amountIn), TradeType.EXACT_INPUT)

            let slippageTolerance = new Percent((config.SLIPPAGE * 10).toString(), '10000') 

            let amountOutMin = trade.minimumAmountOut(slippageTolerance).raw // needs to be converted to e.g. hex
            let path = [fromToken[toToken.chainId].address, toToken.address]

            let to = await this.signer.getAddress()
            let deadline = Math.floor(Date.now() / 1000) + 60 * 20 


            // TODO: approve router

            await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            )

        } catch (error) {
            console.error(error)
            throw new Error(error)
        }

    }


    #decimals = async (address) => {
        let contract = new Contract(address,
            [{
                constant: true,
                inputs: [],
                name: "decimals",
                outputs: [
                    {
                        name: "",
                        type: "uint8",
                    },
                ],
                payable: false,
                stateMutability: "view",
                type: "function",
            },
            ],
            this.provider)

        return Number(await contract.decimals());
    }


}


export const sushiswap = new SushiSwap()
