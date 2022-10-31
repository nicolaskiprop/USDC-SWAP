import 'dotenv/config';

export const config = {
    // JSON_URL
    JSON_URL: 'https://eth-mainnet.public.blastapi.io',

    // PRIVATE_KEY
    PRIVATE_KEY: process.env.PRIVATE_KEY,

    // WETH_ADDRESS
    WETH_ADDRESS: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',

    // ROUTER_ADDRESS
    ROUTER_ADDRESS: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',

    // USDC_ADDRESS
    USDC_ADDRESS: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',


    // SLIPPAGE in %
    SLIPPAGE: '0.8'

}