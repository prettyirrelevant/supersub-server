import { baseSepolia, polygonAmoy } from 'viem/chains';
import { getAddress } from 'viem';

export const CHUNK_SIZE = 3000;
export const SUBSCRIPTION_PLUGIN_INIT_BLOCK = 7611467n;
export const ALCHEMY_WEBHOOK_ID = 'wh_gef4b1xyathmy1qm';
export const SUBSCRIPTION_PLUGIN_ADDRESS = getAddress('0x37604f45111AB488aeC38DBb17F90Ef1CC90cc32');

interface deploymentVars {
  subscriptionPlugin: string;
  tokenBridge: string;
  initBlock: number;
}
export function getDeploymentVarsByChain(chainId: string | number) {
  const dict: Record<string, deploymentVars> = {
    [baseSepolia.id]: {
      subscriptionPlugin: '0x7b5F4a4aB2E879a0dAB3B678D84a2832c6FB7f78',
      tokenBridge: '0x8877bd8D5F89FAeDf7f189Bb3f9aAF5ab32B5862',
      initBlock: 11719734,
    },
    [polygonAmoy.id]: {
      subscriptionPlugin: '0x791ab50d4A494376b87426c0D09DED05861c31f9',
      tokenBridge: '0x1F7B6e0A5331412cf28F2ea83804929A41a742F7',
      initBlock: 8630864,
    },
  };
  return dict[String(chainId)];
}
