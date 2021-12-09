# Articonf TIC DASHBOARD Node App

![Screenshot from 2021-12-09 20-21-11](https://user-images.githubusercontent.com/30879156/145461917-0d1177a0-ecaf-49a6-b75d-e9fc5de5da79.png)


# Requirements

1. Bityoga fabric sdk should be up and running
2. Node version
   - Supports node version >=v11.0.0
   - Tested with v11.0.0

# Run Instructions

1. ## Clone this repository

   - git clone https://github.com/bityoga/tic_dashboard.git

2. ## Run npm install

   - cd tic_dashboard/
   - #### Set node version
     - nvm use node v11.Updated REAdm0.0 (using nvm)
   - **Execute Command :** npm install

3. ## Update fabric ip address in 'tic_dashboard/fabric_node_sdk_helper/network_profile.json'

   - (For other New App Developers) fabric_node_sdk_helper is available in git repository : https://github.com/bityoga/fabric_node_sdk_helper.git
   - **update the url ip addresses of orderer, peer2, orgca, tlsca (4 places)**.
   - update it with your prime manager's ip address

4. ## Retrieve hyperledger fabric tls certificates of 'orderer' and 'peer2'
   #### Through shell script - needs ssh permission
   - cd tic_dashboard/fabric_node_sdk_helper
   - In 'tic_dashboard/fabric_node_sdk_helper/get_tls_certificates.sh' Replace **IP_ADDRESS="178.62.207.235"** with your fabric prime manager's ip address
   - **Execute Command :** bash get_tls_certificates.sh
   #### (OR) Through Manual scp commands - needs ssh permission
   - Replace ipaddress in the below scp commands with your fabric prime manager's ip address.
   - scp -r root@178.62.207.235:/root/hlft-store/orderer/tls-msp/tlscacerts/tls-tlsca-7054.pem .tic_dashboard/fabric_node_sdk_helper/hlft-store/orderer/tls-msp/tlscacerts/tls-tlsca-7054.pem
   - scp -r root@178.62.207.235:/root/hlft-store/peer2/tls-msp/tlscacerts/tls-tlsca-7054.pem .tic_dashboard/fabric_node_sdk_helper/hlft-store/peer2/tls-msp/tlscacerts/tls-tlsca-7054.pem
   #### (OR) Manually edit the following two files - no need of ssh permission
   - tic_dashboard/fabric_node_sdk_helper/hlft-store/orderer/tls-msp/tlscacerts/tls-tlsca-7054.pem
   - tic_dashboard/fabric_node_sdk_helper/hlft-store/peer2/tls-msp/tlscacerts/tls-tlsca-7054.pem
5. ## Start App
   - cd tic_dashboard/
   - **Execute Command :** node app.js
   - app will be running in 'localhost' at port 3000
   - open in browser: http://localhost:3000/

## Dockerisation

### 1) Build Docker Image

```sh
$ git clone https://github.com/bityoga/tic_dashboard.git
$ cd tic_dashboard
```

Do step 3 & 4 as said above

```sh
$ docker build --tag tic-dashboard-app .
```

### 2a) Run as a docker container

```sh
$ docker run -d --name tic-dashboard-app -p 3000:3000 tic-dashboard-app:latest
```

### 2b) Run as a docker service with replicas

```sh
$ docker service create --name tic-dashboard-service --replicas 1 -p 3000:3000 tic-dashboard-app:latest
```
