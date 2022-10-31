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
        // swap fromToken to toToken
        try {
            let fromTokenDecimals = await this.#decimals(fromToken)

            amountIn = utils.parseUnits(amountIn, fromTokenDecimals);

            let path = await this.#buildPath(fromToken, toToken)

            console.log({ path })
            let amountOutMin = await this.#getAmountOutMin(
                amountIn,
                path
            )
            let to = await this.signer.getAddress()

            let deadline = Math.floor(Date.now() / 1000) + 60 * 20;

            console.log({
                fromTokenDecimals,
                amountIn,
                amountOutMin,
                to,
                deadline
            })

            // TODO: approve router


            let { hash } = await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountIn,
                amountOutMin,
                path,
                to,
                deadline, {
                // gasLimit: 400_000
            }
            )
            return hash;

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

    #getAmountOutMin = async (amountIn, path) => {
        let toToken = path[path.length - 1]
        let toTokenDecimals = await this.#decimals(toToken)

        let amounts = await this.router.getAmountsOut(
            amountIn,
            path,
        )
        let executionPrice = amounts[amounts.length - 1]

        executionPrice = utils.formatUnits(executionPrice, toTokenDecimals)

        let amountOutMin = parseFloat(executionPrice) * (100 - parseFloat(config.SLIPPAGE))

        return utils.parseUnits(amountOutMin.toFixed(toTokenDecimals), toTokenDecimals)

    }

    #buildPath = async (fromToken, toToken) => {

        try {


            let factory = await this.router.factory()

            let fContract = new Contract(factory, ['function getPair(address tokenA, address tokenB) external view returns (address pair)'], this.provider)

            let pair = await fContract.getPair(fromToken, toToken)

            console.log({ pair })

            if (pair == constants.AddressZero) {
                throw new Error('No Pair')
            }
            return [fromToken, toToken]

        } catch (error) {
            return [
                fromToken,
                config.WETH_ADDRESS,
                toToken]
        }

    }
}


export const sushiswap = new SushiSwap()
