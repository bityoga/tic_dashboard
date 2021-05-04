/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '.', 'network_profile.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const admin_username = "ca-admin-orgca";
const admin_password = "orgcapw";
const ORGANISATION_MSP = "hlfMSP";
const CA_ORGANISATION_NAME = "orgca";



async function enrollAdmin() {
    let return_value;
    try {
        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[CA_ORGANISATION_NAME];
        console.log(caInfo);
        const caTLSCACerts = [];
        //const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');

        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            return_value = 'An identity for the admin user "admin" already exists in the wallet';
        }

        else {
            // Enroll the admin user, and import the new identity into the wallet.
            const enrollment = await ca.enroll({ enrollmentID: admin_username, enrollmentSecret: admin_password });
            const identity = X509WalletMixin.createIdentity(ORGANISATION_MSP, enrollment.certificate, enrollment.key.toBytes());
            await wallet.import('admin', identity);
            return_value = 'Successfully enrolled admin user "admin" and imported it into the wallet';
        }
    } 
    catch (error) {
        
        return_value = `Failed to enroll admin user "admin": ${error}`;
    }
    finally {
        console.log("'enrollAdmin' function -> returning value");
        return return_value;
    }
}
module.exports = enrollAdmin;