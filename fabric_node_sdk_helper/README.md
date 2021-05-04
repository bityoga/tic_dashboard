# Fabric SDK Adaptor

Node sdk examples to interact with bityoga fabric set up

# Requirements
  1. Bityoga fabric sdk should be up and running
  2. Node version
     - Supports node version >=8
     - Tested with v8.10.0

# Run Instructions
  1. ## Clone this repository into your app directory
      - git clone https://github.com/bityoga/fabric_node_sdk_helper.git
    
  2. ## Update your app's package.json
      - Edit your app's **package.json with the "fabric_node_sdk_helper/package.json"** found in this repository.
   
  3. ## Run npm install
      - ####  Set node version
          -  nvm use node v8.9.0   (using nvm)
      - npm install
      
  3. ## Update ip address in 'fabric_node_sdk_helper/network_profile.json'
      - **update the url ip addresses of orderer, peer2, orgca, tlsca (4 places).**
      - update it with your prime manager's ip address
      
  4.  ## Retrieve hyperledger fabric tls certificates of 'orderer' and 'peer2'
      #### Through shell script - needs ssh permission
         - cd fabric_node_sdk_helper/
        - In 'fabric_node_sdk_helper/get_tls_certificates.sh' Replace **IP_ADDRESS="178.62.207.235"** with your fabric prime manager's ip address
        - **Execute  Command :** bash get_tls_certificates.sh
      #### (OR) Through Manual scp commands - needs ssh permission
        - Replace ipaddress in the below scp commands with your fabric prime manager's ip address.
        - scp -r root@178.62.207.235:/root/hlft-store/orderer/tls-msp/tlscacerts/tls-tlsca-7054.pem ./fabric_node_sdk_helper/hlft-store/orderer/tls-msp/tlscacerts/tls-tlsca-7054.pem
        - scp -r root@178.62.207.235:/root/hlft-store/peer2/tls-msp/tlscacerts/tls-tlsca-7054.pem ./fabric_node_sdk_helper/hlft-store/peer2/tls-msp/tlscacerts/tls-tlsca-7054.pem
        
      #### (OR) Manually edit the following two files - no need of ssh permission
        - fabric_node_sdk_helper/hlft-store/orderer/tls-msp/tlscacerts/tls-tlsca-7054.pem
        - fabric_node_sdk_helper/hlft-store/peer2/tls-msp/tlscacerts/tls-tlsca-7054.pem
         
        
   5. ## Enroll admin
        - #### Call this function "once" when your app starts.
        - When this function is called, a **wallet** directory will be created in the current directory
        - Admin user will be enrolled and the certificates will availalble in **wallet** directory
        - If fabric certificates are changed in future, this wallet directory should cleaned, and this function must be called again to get the new certificates
        - check wallet directory
           - a directory named 'admin' will be available
              - certificates for admin will be available under this directory.
        - sample : 
          ``` Javascript
           // import fabric node sdk helper functions
          const enrollAdmin = require('./fabric_node_sdk_helper/enrollAdmin');

          async function main() {
              admin_enroll_status = await enrollAdmin();
              console.log(admin_enroll_status);
          }

          main();
          ```

   6. ## Register user
        - sample : 
          ``` Javascript
           // import fabric node sdk helper functions
          const registerUser = require('./fabric_node_sdk_helper/registerUser');

          app.post('/register', async (req, res) =>  {
    
            let user_name = req.body.uname;
            let user_password = req.body.psw;
            let user_role = "client";


            let register_status = await registerUser(user_name,
                                                    user_password,
                                                    user_role);

            let response = {
                            status:register_status
                       };
            res.json(response);
          });
          ```
        - check wallet directory
           - a directory with the name of the 'registerd user name' will be available
              - certificates for the registerd user  will be available under this directory.
    
   7. ## Query a chaincode
        - sample : 
          ``` Javascript
           // import fabric node sdk helper functions
          const querychaincode = require('./fabric_node_sdk_helper/query');

          app.post('/query', async (req, res) =>  {

            let user_name = req.body.uname;

            let CHANNEL_NAME  = "appchannel";
            let CHAIN_CODE_NAME = "carcc";
            let CHAIN_CODE_FUNCTION_NAME = "listCars";
             
            // Without Arguments
            let query_result = await querychaincode(user_name,CHANNEL_NAME,CHAIN_CODE_NAME, CHAIN_CODE_FUNCTION_NAME);
            // With Arguments
            let query_result = await querychaincode(user_name,CHANNEL_NAME,CHAIN_CODE_NAME, CHAIN_CODE_FUNCTION_NAME , "a");

            let response = {
                            "status":"success",
                            "data":query_result
                       };
            console.log(response);
            res.json(response);
          });
          ```
        
   8. ## Invoke a chaincode
        - sample : 
          ``` Javascript
           // import fabric node sdk helper functions
          const invokechaincode = require('./fabric_node_sdk_helper/invoke');

          app.post('/invoke', async (req, res) =>  {

            let user_name = req.body.uname;
            let car_license_plate = req.body.car_license_plate;

            let CHANNEL_NAME  = "appchannel";
            let CHAIN_CODE_NAME = "carcc";
            let CHAIN_CODE_FUNCTION_NAME = "listCars";

            let invoke_result = await invokechaincode(user_name, 
                                            CHANNEL_NAME, 
                                            CHAIN_CODE_NAME, 
                                            CHAIN_CODE_FUNCTION_NAME,
                                            car_license_plate,
                                            "Opel","Corsa","Light Blue","7","2050","1");
            let response = {
                            "status":"success",
                            "data":invoke_result
                       };
            console.log(response);
            res.json(response);
          });
          ```
