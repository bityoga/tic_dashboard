// import app essential libraries
const express = require("express");
const session = require("express-session");
const formidable = require("express-formidable");
var bodyParser = require("body-parser");

// import fabric node sdk helper functions
const enrollAdmin = require("./fabric_node_sdk_helper/enrollAdmin");
const registerUser = require("./fabric_node_sdk_helper/registerUser");
const querychaincode = require("./fabric_node_sdk_helper/query");
const invokechaincode = require("./fabric_node_sdk_helper/invoke");
const { load_certificates_from_wallet } = require("./fileread");
const { sqlite_json_insert } = require("./db_query");
const { check_login_and_load_certificates } = require("./db_query");
const { db_query } = require("./db_query");

const shell = require("shelljs");
//const chaincode_path = "/root/CLI/chaincodes/";
const chaincode_path = "./chaincodes";

// Create a express object
const app = express();
app.use(session({ secret: "ssshhhhh" }));
//  Body-parser
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

// Create a router for the express object
const router = express.Router();
const app_port_number = 3003;

var app_session;

async function load_html_template_and_start_app(app_port_number) {
  try {
    //add the router

    //Store all HTML files in view folder.
    app.use(express.static(__dirname + "/html/view"));

    //Store all JS and CSS in Scripts folder.
    app.use(express.static(__dirname + "/html/script"));

    app.use("/", router);
    app.listen(process.env.port || app_port_number, "0.0.0.0");
    console.log(
      `######## App is Running at Port - ${app_port_number} #############`
    );
  } catch (error) {
    console.error(`Failed to load_html_template: ${error}`);
    process.exit(1);
  }
}

app.post("/register", async (req, res) => {
  console.log("inside register");
  let html_json_data;
  let user_role = "client";
  let register_status = "success";
  let combined_user_data;
  let fabric_register_status;
  let json_response = {};

  try {
    html_json_data = req.body;
    console.log(html_json_data);
    fabric_register_status = await registerUser(
      html_json_data["User_Name"],
      html_json_data["User_Password"],
      user_role
    );
    console.log(fabric_register_status);
    if (fabric_register_status.includes("Success")) {
      let user_certificates_json = await load_certificates_from_wallet(
        html_json_data["User_Name"]
      );
      combined_user_data = { ...html_json_data, ...user_certificates_json };
      let insert_status = await sqlite_json_insert(combined_user_data, "User");
      register_status = insert_status;
    } else {
      register_status = fabric_register_status;
    }
  } catch (e) {
    console.log(e);
    register_status = e;
  } finally {
    json_response["status"] = register_status;
    res.json(json_response);
  }
});

app.post("/", async (req, res) => {
  app_session = req.session;
  let response;
  console.log("app_session");
  console.log(app_session);

  if (app_session.user_name && app_session.password) {
    console.log("session exists");

    response = {
      status: "session active",
      user_name: app_session.user_name,
      user_password: app_session.password,
    };
    console.log(response);
  } else {
    response = {
      status: "session not active",
    };
    console.log(response);
  }

  res.json(response);
});

app.post("/logout", async (req, res) => {
  app_session = req.session;
  app_session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
});

app.post("/login", async (req, res) => {
  let html_json_data = req.body;
  let user_name = html_json_data["Login_User_Name"];
  let user_password = html_json_data["Login_Password"];

  //temp
  app_session = req.session;
  app_session.user_name = user_name;
  app_session.password = user_password;

  let response = {
    status: "success",
  };
  console.log(response);
  res.json(response);
});

async function main() {
  await load_html_template_and_start_app(app_port_number);
}
function isEmpty(str) {
  return !str || str.length === 0;
}

app.post("/upload_smart_contract_git_clone", async (req, res) => {
  let response;

  app_session = req.session;
  var githubUrl = req.body.githubUrlPath;
  var githubUrlRename = req.body.githubUrlRenamePath;
  var githubRepoType = req.body.githubRepoType;
  var githubUserName = req.body.githubUserName;
  var githubUserPassword = req.body.githubUserPassword;

  console.log(githubUrl);
  if (app_session.user_name && app_session.password) {
    var git_clone_command = "git clone " + githubUrl;
    if (githubUrlRename) {
      console.log("new name");
      console.log(githubUrlRename);
      if (githubRepoType === "public") {
        // git clone https://github.com/bityoga/smart_energy_chaincodes.git
        git_clone_command = git_clone_command + " " + githubUrlRename;
      } else {
        //git clone https://username:password@github.com/username/repository.git
        git_clone_command =
          git_clone_command +
          " https://" +
          githubUserName +
          ":" +
          githubUserPassword +
          githubUrlRename +
          "@" +
          githubUrlRename.replace(/(^\w+:|^)\/\//, "");
      }
    }
    console.log(git_clone_command);
    shell.cd(chaincode_path);
    shell.exec(git_clone_command, function (code, stdout, stderr) {
      console.log("Exit code:", code);
      console.log("Program output:", stdout);
      console.log("Program stderr:", stderr);
      var exec_command_status = {
        Exit_Code: code,
        Output: stdout,
        Error: stderr,
      };
      response = {
        status: "success",
        data: exec_command_status,
      };
      console.log(response);
      res.json(response);
    });
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
    console.log(response);
    res.json(response);
  }
});

app.post("/install_smart_contract", async (req, res) => {
  let response;

  app_session = req.session;

  var chaincodeName = req.body.chaincodeName;
  var chaincodeVersion = req.body.chaincodeVersion;
  var peer = req.body.peer;
  var channel = req.body.channel;
  var language = req.body.language;
  var chaincodeSrcPath = req.body.chaincodeSrcPath;

  if (app_session.user_name && app_session.password) {
    var PEER_HOST = peer;
    var CORE_PEER_ADDRESS = PEER_HOST + ":7051";
    var CORE_PEER_MSPCONFIGPATH = "/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp";
    var CORE_PEER_TLS_ROOTCERT_FILE =
      "/root/CLI/${ORGCA_HOST}/" + PEER_HOST + "/msp/tls/ca.crt";

    var chaincode_install_command =
      "CORE_PEER_ADDRESS=" +
      CORE_PEER_ADDRESS +
      " CORE_PEER_MSPCONFIGPATH=" +
      CORE_PEER_MSPCONFIGPATH +
      " CORE_PEER_TLS_ROOTCERT_FILE=" +
      CORE_PEER_TLS_ROOTCERT_FILE +
      " peer chaincode install -n " +
      chaincodeName +
      " -v " +
      chaincodeVersion +
      " -l " +
      language +
      " -p " +
      chaincodeSrcPath;

    console.log("chaincode_install_command");
    console.log(chaincode_install_command);

    shell.exec(chaincode_install_command, function (code, stdout, stderr) {
      console.log("Exit code:", code);
      console.log("Program output:", stdout);
      console.log("Program stderr:", stderr);
      var exec_command_status = {
        Exit_Code: code,
        Output: stdout,
        Error: stderr,
      };
      response = {
        status: "success",
        data: exec_command_status,
      };
      console.log(response);
      res.json(response);
    });
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
    console.log(response);
    res.json(response);
  }
});

app.post("/instantiate_smart_contract", async (req, res) => {
  let response;

  app_session = req.session;

  var chaincodeName = req.body.chaincodeName;
  var chaincodeVersion = req.body.chaincodeVersion;
  var peer = req.body.peer;
  var channel = req.body.channel;
  var language = req.body.language;
  var chaincodeSrcPath = req.body.chaincodeSrcPath;
  var chaincodeInstantiateParams = req.body.chaincodeInstantiateParams;

  if (app_session.user_name && app_session.password) {
    var PEER_HOST = peer;
    var CORE_PEER_ADDRESS = PEER_HOST + ":7051";
    var CORE_PEER_MSPCONFIGPATH = "/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp";
    var CORE_PEER_TLS_ROOTCERT_FILE =
      "/root/CLI/${ORGCA_HOST}/" + PEER_HOST + "/msp/tls/ca.crt";

    // CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode instantiate -C $CHANNEL_NAME -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -c $INSTANTIATE_PARAMS -o ${ORDERER_HOST}:7050 --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}

    var chaincode_instantiate_command =
      "CORE_PEER_ADDRESS=" +
      CORE_PEER_ADDRESS +
      " CORE_PEER_MSPCONFIGPATH=" +
      CORE_PEER_MSPCONFIGPATH +
      " CORE_PEER_TLS_ROOTCERT_FILE=" +
      CORE_PEER_TLS_ROOTCERT_FILE +
      " peer chaincode instantiate -C " +
      channel +
      " -n " +
      chaincodeName +
      " -v " +
      chaincodeVersion +
      " -c '" +
      chaincodeInstantiateParams +
      "' -o ${ORDERER_HOST}:7050 --tls --cafile " +
      CORE_PEER_TLS_ROOTCERT_FILE;

    console.log("chaincode_instantiate_command");
    console.log(chaincode_instantiate_command);

    shell.exec(chaincode_instantiate_command, function (code, stdout, stderr) {
      console.log("Exit code:", code);
      console.log("Program output:", stdout);
      console.log("Program stderr:", stderr);
      var exec_command_status = {
        Exit_Code: code,
        Output: stdout,
        Error: stderr,
      };
      response = {
        status: "success",
        data: exec_command_status,
      };
      console.log(response);
      res.json(response);
    });
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
    console.log(response);
    res.json(response);
  }
});

main();
