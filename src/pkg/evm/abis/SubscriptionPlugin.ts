import { parseAbi } from 'viem';

export const SubscriptionPluginAbi = parseAbi([
  'constructor(uint256)',
  'error AlreadyInitialized()',
  'error InvalidAction()',
  'error NotContractCaller(address)',
  'error NotImplemented(bytes4,uint8)',
  'error NotInitialized()',
  'event PlanCreated(bytes32 indexed,bytes32 indexed,uint256,uint256,bool)',
  'event PlanUpdated(bytes32 indexed,bool)',
  'event ProductCreated(bytes32 indexed,address indexed,bytes32,address,uint256,bool)',
  'event ProductUpdated(bytes32 indexed,address,address,uint256,bool)',
  'event Subscribed(address indexed,address,bytes32 indexed,bytes32 indexed,bytes32)',
  'event SubscriptionCharged(address indexed,bytes32,bytes32 indexed,uint256)',
  'event SubscriptionPlanChanged(address indexed,bytes32,bytes32)',
  'event UnSubscribed(address indexed,bytes32)',
  'function AUTHOR() view returns (string)',
  'function NAME() view returns (string)',
  'function VERSION() view returns (string)',
  'function admin() view returns (address)',
  'function changeSubscriptionPlan(bytes32,bytes32,bytes32,address)',
  'function charge(bytes32,address,bytes32,address,bytes32)',
  'function createPlan(bytes32,uint32,uint256)',
  'function createProduct(bytes32,address,address,uint256)',
  'function currentChainId() view returns (uint256)',
  'function getManifestHash() view returns (bytes32)',
  'function getUserSubscriptions(address) view returns (tuple(bytes32,bytes32,address,bytes32,uint256,bool)[])',
  'function isSubscribedToProduct(address,bytes32) view returns (bool)',
  'function onInstall(bytes) pure',
  'function onUninstall(bytes) pure',
  'function pluginManifest() pure returns (tuple(bytes4[],bytes4[],bytes4[],bytes4[],bool,bool,tuple(address,bool,bytes4[])[],tuple(bytes4,tuple(uint8,uint8,uint256))[],tuple(bytes4,tuple(uint8,uint8,uint256))[],tuple(bytes4,tuple(uint8,uint8,uint256))[],tuple(bytes4,tuple(uint8,uint8,uint256))[],tuple(bytes4,tuple(uint8,uint8,uint256),tuple(uint8,uint8,uint256))[]))',
  'function pluginMetadata() pure returns (tuple(string,string,string,tuple(bytes4,string)[]))',
  'function postExecutionHook(uint8,bytes)',
  'function preExecutionHook(uint8,address,uint256,bytes) returns (bytes)',
  'function preRuntimeValidationHook(uint8,address,uint256,bytes)',
  'function preUserOpValidationHook(uint8,tuple(address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32) returns (uint256)',
  'function productNonces(address) view returns (uint256)',
  'function providerPlans(address,bytes32) view returns (bytes32, bytes32, address, uint256, uint32, bool)',
  'function providerProducts(address,bytes32) view returns (bytes32, bytes32, address, address, address, uint256, uint8, bool)',
  'function runtimeValidationFunction(uint8,address,uint256,bytes)',
  'function subscribe(bytes32,bytes32,address)',
  'function subscriptionNonces(address) view returns (uint256)',
  'function supportsInterface(bytes4) view returns (bool)',
  'function unSubscribe(bytes32)',
  'function updatePlan(bytes32,bool)',
  'function updateProduct(bytes32,address,address,uint256,bool)',
  'function userOpValidationFunction(uint8,tuple(address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32) returns (uint256)',
  'function userSubscriptions(address,bytes32) view returns (bytes32, bytes32, address, bytes32, uint256, bool)',
]);
