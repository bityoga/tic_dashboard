/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '.', 'network_profile.json');


async function registerUser(user_name, user_password, user_role) {
    let return_value;
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(user_name);
        
        if (userExists) {
            return_value = 'An identity for the user "'+user_name+'" already exists in the wallet';
        }

        else {
            // Check to see if we've already enrolled the admin user.
            const adminExists = await wallet.exists('admin');
            if (!adminExists) {
                return_value = "An identity for the admin user 'admin' does not exist in the wallet. Call 'enrollAdmin' function before retrying";
            }
            else {
                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: false } });

                
                // Get the CA client object from the gateway for interacting with the CA.
                const ca = gateway.getClient().getCertificateAuthority();
                const adminIdentity = gateway.getCurrentIdentity();


                // Register the user, enroll the user, and import the new identity into the wallet.
                const secret = await ca.register({ enrollmentID: user_name,role: user_role,enrollmentSecret:user_password }, adminIdentity);
                const enrollment = await ca.enroll({ enrollmentID: user_name, enrollmentSecret: secret });
                const userIdentity = X509WalletMixin.createIdentity('hlfMSP', enrollment.certificate, enrollment.key.toBytes());
                await wallet.import(user_name, userIdentity);
                return_value = 'Successfully registered and enrolled user "'+user_name+'" with role "'+user_role+'" and imported it into the wallet';
            }
        }
    } 
    catch (error) {
            //return_value = `Failed to register user ${user_name}: ${error}`;
            return_value = "Failed to register user "+user_name+": " + error;
        }
    finally{
        console.log("'registerUser' function -> returning value");
        return return_value;
    }
}

module.exports = registerUser;
