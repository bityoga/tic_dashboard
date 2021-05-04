/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { FileSystemWallet, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");

const ccpPath = path.resolve(__dirname, ".", "network_profile.json");

async function invokechaincode(
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
      //console.log('An identity for the user "user1" does not exist in the wallet');
      //console.log('Run the registerUser.js application before retrying');
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

      // Submit the specified transaction.
      // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
      // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')

      //await contract.submitTransaction(CHAIN_CODE_FUNCTION_NAME, "BE8800","Opel","Corsa","Light Blue","7","2050","1");

      return_value = await contract.submitTransaction(
        CHAIN_CODE_FUNCTION_NAME,
        ...ARGS
      );
      return_value = return_value.toString();

      //await contract.submitTransaction(CHAIN_CODE_FUNCTION_NAME, "b","a","1");

      console.log("Transaction has been submitted");

      // Disconnect from the gateway.
      await gateway.disconnect();
    }
  } catch (error) {
    return_value = `Failed to evaluate transaction: ${error}`;
    //process.exit(1);
  } finally {
    return return_value;
  }
}

module.exports = invokechaincode;
