const client = require("fabric-client");
let targets = client.buildTargets; //build the list of peers that will require this chaincode
let chaincode_path =
  "/home/ark/milestone1/fabric_2.2/check_master/tic_dashboard/chaincodes/articonf-bank-chaincode/bank_chaincode/src";
//let metadata_path = path.resolve(__dirname, "../chaincode/my_indexes");

// send proposal to install
var request = {
  targets: targets,
  chaincodePath: chaincode_path,
  //metadataPath: metadata_path, // notice this is the new attribute of the request
  chaincodeId: "my_chaincode",
  chaincodeType: "node",
  chaincodeVersion: "v1",
};

client.installChaincode(request).then(
  (results) => {
    var proposalResponses = results[0];
    // check the results
    console.lof(proposalResponses);
  },
  (err) => {
    console.log(
      "Failed to send install proposal due to error: " + err.stack
        ? err.stack
        : err
    );
    throw new Error(
      "Failed to send install proposal due to error: " + err.stack
        ? err.stack
        : err
    );
  }
);
