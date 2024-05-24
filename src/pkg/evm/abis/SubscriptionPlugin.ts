export const SubscriptionPluginAbi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    name: 'AlreadyInitialized',
    type: 'error',
    inputs: [],
  },
  {
    name: 'InvalidAction',
    type: 'error',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: 'caller',
      },
    ],
    name: 'NotContractCaller',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'selector',
        type: 'bytes4',
      },
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
    ],
    name: 'NotImplemented',
    type: 'error',
  },
  {
    name: 'NotInitialized',
    type: 'error',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
        indexed: true,
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
        indexed: true,
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
        name: 'price',
      },
      {
        internalType: 'uint256',
        name: 'chargeInterval',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'bool',
        name: 'isActive',
        indexed: false,
        type: 'bool',
      },
    ],
    name: 'PlanCreated',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
        indexed: true,
      },
      {
        internalType: 'bool',
        name: 'isActive',
        indexed: false,
        type: 'bool',
      },
    ],
    name: 'PlanUpdated',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
        name: 'name',
      },
      {
        internalType: 'enum SubscriptionPlugin.ProductType',
        name: 'productType',
        indexed: false,
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'chargeToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'receivingAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'destinationChain',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'bool',
        name: 'isActive',
        indexed: false,
        type: 'bool',
      },
    ],
    name: 'ProductCreated',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'receivingAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'destinationChain',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'bool',
        name: 'isActive',
        indexed: false,
        type: 'bool',
      },
    ],
    name: 'ProductUpdated',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'subscriber',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
        indexed: false,
      },
      {
        internalType: 'uint256',
        name: 'product',
        type: 'uint256',
        indexed: true,
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
        name: 'plan',
      },
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Subscribed',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'subscriber',
        type: 'address',
        indexed: true,
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
        indexed: false,
      },
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
        indexed: true,
      },
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
        indexed: true,
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
        name: 'amount',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionCharged',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        indexed: true,
        name: 'user',
      },
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
        indexed: false,
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
        name: 'planId',
      },
    ],
    name: 'SubscriptionPlanChanged',
    anonymous: false,
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        indexed: true,
        name: 'user',
      },
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'UnSubscribed',
    anonymous: false,
    type: 'event',
  },
  {
    outputs: [
      {
        internalType: 'string',
        type: 'string',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'AUTHOR',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'string',
        type: 'string',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'NAME',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'string',
        type: 'string',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'VERSION',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'admin',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
    ],
    name: 'changeSubscriptionEndTime',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
      },
    ],
    name: 'changeSubscriptionPlan',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'subscriber',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'charge',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_productId',
        type: 'uint256',
      },
      {
        name: '_chargeInterval',
        internalType: 'uint32',
        type: 'uint32',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '_price',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'createPlan',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        type: 'bytes32',
        name: '_name',
      },
      {
        internalType: 'enum SubscriptionPlugin.ProductType',
        name: '_type',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: '_chargeToken',
        type: 'address',
      },
      {
        name: '_receivingAddress',
        internalType: 'address',
        type: 'address',
      },
      {
        name: '_destinationChain',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'createProduct',
    type: 'function',
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'currentChainId',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'bytes32',
        type: 'bytes32',
        name: '',
      },
    ],
    name: 'getManifestHash',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'subscriptionId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'product',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'provider',
            type: 'address',
          },
          {
            internalType: 'uint256',
            type: 'uint256',
            name: 'plan',
          },
          {
            internalType: 'uint256',
            name: 'lastChargeDate',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'endTime',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isActive',
            type: 'bool',
          },
        ],
        internalType: 'struct SubscriptionPlugin.UserSubscription[]',
        name: 'subscriptions',
        type: 'tuple[]',
      },
    ],
    inputs: [
      {
        internalType: 'address',
        name: 'subscriber',
        type: 'address',
      },
    ],
    name: 'getUserSubscriptions',
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'subscriber',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    name: 'isSubscribedToProduct',
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        type: 'bytes',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'onInstall',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        type: 'bytes',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'onUninstall',
    type: 'function',
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'planNonce',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'price',
      },
      {
        internalType: 'uint32',
        name: 'chargeInterval',
        type: 'uint32',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'plans',
  },
  {
    outputs: [
      {
        components: [
          {
            internalType: 'bytes4[]',
            name: 'interfaceIds',
            type: 'bytes4[]',
          },
          {
            name: 'dependencyInterfaceIds',
            internalType: 'bytes4[]',
            type: 'bytes4[]',
          },
          {
            name: 'executionFunctions',
            internalType: 'bytes4[]',
            type: 'bytes4[]',
          },
          {
            name: 'permittedExecutionSelectors',
            internalType: 'bytes4[]',
            type: 'bytes4[]',
          },
          {
            name: 'permitAnyExternalAddress',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'canSpendNativeToken',
            internalType: 'bool',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'externalAddress',
                type: 'address',
              },
              {
                name: 'permitAnySelector',
                internalType: 'bool',
                type: 'bool',
              },
              {
                internalType: 'bytes4[]',
                name: 'selectors',
                type: 'bytes4[]',
              },
            ],
            internalType: 'struct ManifestExternalCallPermission[]',
            name: 'permittedExternalCalls',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'associatedFunction',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestAssociatedFunction[]',
            name: 'userOpValidationFunctions',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'associatedFunction',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestAssociatedFunction[]',
            name: 'runtimeValidationFunctions',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'associatedFunction',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestAssociatedFunction[]',
            name: 'preUserOpValidationHooks',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'associatedFunction',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestAssociatedFunction[]',
            name: 'preRuntimeValidationHooks',
            type: 'tuple[]',
          },
          {
            components: [
              {
                name: 'executionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'preExecHook',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'enum ManifestAssociatedFunctionType',
                    name: 'functionType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint8',
                    name: 'functionId',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'dependencyIndex',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct ManifestFunction',
                name: 'postExecHook',
                type: 'tuple',
              },
            ],
            internalType: 'struct ManifestExecutionHook[]',
            name: 'executionHooks',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct PluginManifest',
        type: 'tuple',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'pluginManifest',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            type: 'string',
            name: 'name',
          },
          {
            internalType: 'string',
            name: 'version',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'author',
            type: 'string',
          },
          {
            components: [
              {
                name: 'functionSelector',
                internalType: 'bytes4',
                type: 'bytes4',
              },
              {
                name: 'permissionDescription',
                internalType: 'string',
                type: 'string',
              },
            ],
            internalType: 'struct SelectorPermission[]',
            name: 'permissionDescriptors',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct PluginMetadata',
        type: 'tuple',
        name: '',
      },
    ],
    stateMutability: 'pure',
    name: 'pluginMetadata',
    type: 'function',
    inputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        name: 'preExecHookData',
        internalType: 'bytes',
        type: 'bytes',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'postExecutionHook',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        internalType: 'address',
        type: 'address',
        name: 'sender',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
      {
        internalType: 'bytes',
        type: 'bytes',
        name: 'data',
      },
    ],
    outputs: [
      {
        internalType: 'bytes',
        type: 'bytes',
        name: '',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'preExecutionHook',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        internalType: 'address',
        type: 'address',
        name: 'sender',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
      {
        internalType: 'bytes',
        type: 'bytes',
        name: 'data',
      },
    ],
    name: 'preRuntimeValidationHook',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        components: [
          {
            internalType: 'address',
            type: 'address',
            name: 'sender',
          },
          {
            internalType: 'uint256',
            type: 'uint256',
            name: 'nonce',
          },
          {
            internalType: 'bytes',
            name: 'initCode',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'callGasLimit',
            type: 'uint256',
          },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'paymasterAndData',
            internalType: 'bytes',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct UserOperation',
        name: 'userOp',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'userOpHash',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    name: 'preUserOpValidationHook',
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'productNonce',
    type: 'function',
    inputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        type: 'bytes32',
        name: 'name',
      },
      {
        internalType: 'enum SubscriptionPlugin.ProductType',
        name: 'productType',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'chargeToken',
        type: 'address',
      },
      {
        name: 'receivingAddress',
        internalType: 'address',
        type: 'address',
      },
      {
        name: 'destinationChain',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    stateMutability: 'view',
    name: 'products',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        internalType: 'address',
        type: 'address',
        name: 'sender',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'value',
      },
      {
        internalType: 'bytes',
        type: 'bytes',
        name: 'data',
      },
    ],
    name: 'runtimeValidationFunction',
    stateMutability: 'nonpayable',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'planId',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'subscribe',
    type: 'function',
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
    ],
    name: 'subscriptionNonces',
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        type: 'bool',
        name: '',
      },
    ],
    name: 'supportsInterface',
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'unSubscribe',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_planId',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_isActive',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'updatePlan',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_productId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_receivingAddr',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_destChain',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_isActive',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    name: 'updateProduct',
    type: 'function',
    outputs: [],
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'functionId',
        type: 'uint8',
      },
      {
        components: [
          {
            internalType: 'address',
            type: 'address',
            name: 'sender',
          },
          {
            internalType: 'uint256',
            type: 'uint256',
            name: 'nonce',
          },
          {
            internalType: 'bytes',
            name: 'initCode',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'callGasLimit',
            type: 'uint256',
          },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'paymasterAndData',
            internalType: 'bytes',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct UserOperation',
        name: 'userOp',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'userOpHash',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    name: 'userOpValidationFunction',
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    outputs: [
      {
        internalType: 'uint256',
        name: 'subscriptionId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'product',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: 'plan',
      },
      {
        internalType: 'uint256',
        name: 'lastChargeDate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    inputs: [
      {
        internalType: 'address',
        type: 'address',
        name: '',
      },
      {
        internalType: 'uint256',
        type: 'uint256',
        name: '',
      },
    ],
    name: 'userSubscriptions',
    stateMutability: 'view',
    type: 'function',
  },
] as const;
