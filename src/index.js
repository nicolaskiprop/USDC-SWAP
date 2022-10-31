import { sushiswap } from "./swap.js"

const Main = async() => {


    let args = process.argv.slice(2)

    let [amountIn, toToken] = args

    // init swap

    console.info(`Swapping ${amountIn} USDC to ${toToken}...`)
   let hash =  await sushiswap.swap(
        toToken,
        amountIn
    )

    console.log('Tx Hash:', hash)
}


Main()