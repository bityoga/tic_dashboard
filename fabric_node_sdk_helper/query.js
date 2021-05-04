/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { FileSystemWallet, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");

const ccpPath = path.resolve(__dirname, ".", "network_profile.json");

async function querychaincode(
  USER_NAME,
  CHANNEL_NAME,
  CHAIN_CODE_NAME,
  CHAIN_CODE_FUNCTION_NAME,
  ...ARGS
) {
  let return_value;
  try {
    // Create a new file system based wallet for managing identities.

    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(USER_NAME);
    if (!userExists) {
      // console.log('An identity for the user "user1" does not exist in the wallet');
      // console.log('Run the registerUser.js application before retrying');
      return_value =
        'An identity for the user "user1" does not exist in the wallet. Run the registerUser.js application before retrying';
    } else {
      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();

      await gateway.connect(ccpPath, {
        wallet,
        identity: USER_NAME,
        discovery: { enabled: false, asLocalhost: false },
      });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway.getNetwork(CHANNEL_NAME);

      // Get the contract from the network.
      const contract = network.getContract(CHAIN_CODE_NAME);

      // Evaluate the specified transaction.
      // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
      // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
      console.log(ARGS);
      console.log(CHAIN_CODE_FUNCTION_NAME);
      // if (ARGS.length > 0 ) {
      //     console.log(CHAIN_CODE_FUNCTION_NAME);
      //     return_value = await contract.evaluateTransaction(CHAIN_CODE_FUNCTION_NAME,ARGS);
      //     return_value = return_value.toString();
      // }
      // else {
      //     return_value = await contract.evaluateTransaction(CHAIN_CODE_FUNCTION_NAME);
      //     return_value = return_value.toString();
      // }

      return_value = await contract.evaluateTransaction(
        CHAIN_CODE_FUNCTION_NAME,
        ...ARGS
      );
      return_value = return_value.toString();
      //const result = await contract.evaluateTransaction(CHAIN_CODE_FUNCTION_NAME,"b");
      //const result = await contract.evaluateTransaction(CHAIN_CODE_FUNCTION_NAME,"a");
      console.log(
        `Transaction has been evaluated, result is: ${return_value.toString()}`
      );

      //return_value = result;
    }
    //return result;
    //process.exit(1);
  } catch (error) {
    return_value = `Failed to evaluate transaction: ${error}`;
    //process.exit(1);
  } finally {
    return return_value;
  }
}

module.exports = querychaincode;
