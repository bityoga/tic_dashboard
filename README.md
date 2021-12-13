# Articonf TIC DASHBOARD Node App

![Screenshot from 2021-12-10 20-28-57](https://user-images.githubusercontent.com/30879156/145630856-8e9c173e-a8a4-416d-b975-7b6558451ff4.png)

# Requirements

1. Bityoga fabric sdk should be up and running
2. Node version
   - Supports node version >=v11.0.0
   - Tested with v11.0.0

# Run Instructions

1. ## Clone this repository

   - `git clone https://github.com/bityoga/tic_dashboard.git`

2. ## Run npm install

   - cd tic_dashboard/
   - **Set node version :** `nvm use node v11.0.0` (using nvm)
   - **Execute Command :** `npm install`

3. ## (Optional Step) Follow this step only if running the app locally

   - In app.js , update `const TEST_LOCAL = 0;` to `const TEST_LOCAL = 1`;
   - create a directory "file_explorer" one level outside the tic_dashboard directory
     ```sh
     mkdir -p ../file_explorer/certificates &&
     mkdir -p ../file_explorer/chaincodes
     ```
   - **../file_explorer/certificates -** This is path of certificates locally. Put some files under this for testing locally.
   - **../file_explorer/chaincodes -** This is path of certificates locally. Put some files under this for testing locally. Create a drectory for each chaincode and put some files here.

4. ## Start App

   - `cd tic_dashboard/`
   - **Execute Command :** `node app.js`
   - app will be running in **'localhost' at port 3003**
   - **open in browser:** http://localhost:3003/

   ### fabric_as_code deployment

   - This is deployed along with the cli service playbook[103.deploy_cli.yml](https://github.com/bityoga/fabric_as_code/blob/master/103.deploy_cli.yml)
   - Deployment happens throuh [CLI.sh](https://github.com/bityoga/fabric_as_code/blob/master/roles/hlf/cli/cli/files/CLI.sh)

## Dockerisation

### 1) Build Docker Image

```sh
$ git clone https://github.com/bityoga/tic_dashboard.git
$ cd tic_dashboard
$ npm i # Run this to generate package-lock.json which will be required for creating docker image
```

Do step 3 as said above if running locally

```sh
$ docker build --tag tic-dashboard-app .
```

### 2a) Run as a docker container

```sh
$ docker run -d --name tic-dashboard-app -p 3003:3003 tic-dashboard-app:latest
```

### 2b) Run as a docker service with replicas

```sh
$ docker service create --name tic-dashboard-service --replicas 1 -p 3003:3003 tic-dashboard-app:latest
```
