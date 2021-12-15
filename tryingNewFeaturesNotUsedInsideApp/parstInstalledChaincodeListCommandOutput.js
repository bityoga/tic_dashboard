const output = 'Get instantiated chaincodes on channel appchannel:\n' +


    'Name: anandTestMogChaincode, Version: 1.0, Path: smartcontract, Escc: escc, Vscc: vscc\n' +


    'Name: articonfBank, Version: 1.0, Path: /root/CLI/chaincodes/articonf-bank-chaincode/bank_chaincode/src/, Escc: escc, Vscc: vscc\n' +


    'Name: baby, Version: 2.0, Path: /root/CLI/chaincodes/newborntime-consent-app-chaincodes/baby/chaincode/src/, Escc: escc, Vscc: vscc\n' +


    'Name: bank, Version: 1.0, Path: /root/CLI/chaincodes/articonf-bank-chaincode/bank_chaincode/src, Escc: escc, Vscc: vscc\n' +


    'Name: car-details, Version: 3.0, Path: /root/CLI/chaincodes/car-details/car-details/chaincode/src/, Escc: escc, Vscc: vscc\n' +


    'Name: consent, Version: 1.0, Path: /root/CLI/chaincodes/newborntime-consent-app-chaincodes/consent/chaincode/src, Escc: escc, Vscc: vscc\n' +


    'Name: mogVideoChaincodeTest, Version: 1.0, Path: smartcontract, Escc: escc, Vscc: vscc\n' +


    'Name: mother, Version: 1.0, Path: /root/CLI/chaincodes/newborntime-consent-app-chaincodes/mother/chaincode/src, Escc: escc, Vscc: vscc\n';

function parseCommandLineOutputOfChainCodeObjectList(string) {
    var properties = string.split(', ');
    var obj = {};
    properties.forEach(function (property) {
        var tup = property.split(': ');
        obj[tup[0]] = tup[1];
    });
    return obj;
}
function parseChainCodeListCommandOutput(output) {
    let parsedResponse = output.split(/\r?\n/);
    //console.log(parsedResponse);
    let finalChainCodeDetailsArray = []
    for (chaincode of parsedResponse) {
        let parsedChaincodeDetails = parseCommandLineOutputOfChainCodeObjectList(chaincode);
        if ('Name' in parsedChaincodeDetails) {
            finalChainCodeDetailsArray.push(Object.values(parsedChaincodeDetails));
        }
    }
    return finalChainCodeDetailsArray;
}

//console.log(finalChainCodeDetailsArray);



/* var string = 'Name: anandTestMogChaincode, Version: 1.0, Path: smartcontract, Escc: escc, Vscc: vscc';
console.log(parseCommandLineOutputOfChainCodeObjectList(string)); */

console.log(parseChainCodeListCommandOutput(output).length);