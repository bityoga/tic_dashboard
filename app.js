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
const chaincode_path = "/root/CLI/chaincodes/";
//const chaincode_path = "./chaincodes";

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

    // let user_assets = await get_user_assets_from_chaicode();
    // let all_assets = await get_all_assets_from_chaicode();
    // var user_assets_json = JSON.parse(user_assets["data"]);
    // var all_assets_json = JSON.parse(all_assets["data"]);
    // console.log("all_assets_json");
    // console.log(all_assets_json);
    // app_session.assets = [];
    // for (var i = 0; i < all_assets_json.length; i++) {
    //   console.log("all_assets_json[i].Key");
    //   app_session.assets.push(all_assets_json[i].Key);
    // }
    // console.log("app_session.assets");
    // console.log(app_session.assets);
    // app_session.balance = user_assets_json["Balance"];
    //app_session.capacity = user_assets_json['size'];

    response = {
      status: "session active",
      user_name: app_session.user_name,
      user_password: app_session.password,
      // wallet: app_session.balance,
      // address: app_session.address,
      // smart_meter_id: app_session.smart_meter_id,
      // capacity: app_session.capacity,
      // assets: app_session.assets,
    };
    console.log(response);
  } else {
    response = {
      status: "session not active",
    };
    console.log(response);
    //res.json(response);
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

// app.get('/logout', async (req, res,next) => {
//   if (req.session) {
//     // delete session object
//     req.session.destroy(function(err) {
//       if(err) {
//         return next(err);
//       } else {
//         return res.redirect('/');
//       }
//     });
//   }
// });

app.post("/login", async (req, res) => {
  let html_json_data = req.body;
  let user_name = html_json_data["Login_User_Name"];
  let user_password = html_json_data["Login_Password"];

  //temp
  app_session = req.session;
  app_session.user_name = user_name;
  app_session.password = user_password;

  // let login_status = await check_login_and_load_certificates(
  //   user_name,
  //   user_password
  // );
  // if (login_status["status"] === "success") {
  //   app_session = req.session;
  //   app_session.user_name = user_name;
  //   app_session.password = user_password;
  //   app_session.user_id = login_status["User_Id"];
  //   app_session.assets = [];

  //   user_assets = await get_user_assets_from_chaicode();
  //   let all_assets = await get_all_assets_from_chaicode();
  //   var user_assets_json = JSON.parse(user_assets["data"]);
  //   var all_assets_json = JSON.parse(all_assets["data"]);
  //   console.log("all_assets_json");
  //   console.log(all_assets_json.length);
  //   for (var i = 0; i < all_assets_json.length; i++) {
  //     console.log("all_assets_json[i].Key");
  //     app_session.assets.push(all_assets_json[i].Key);
  //   }
  //   console.log("app_session.assets");
  //   console.log(app_session.assets);

  //   app_session.balance = user_assets_json["amount"];
  //   app_session.address = user_assets_json["color"];
  //   app_session.smart_meter_id = user_assets_json["owner"];
  //   app_session.capacity = user_assets_json["size"];
  // }

  let response = {
    //status: login_status["status"],
    status: "success",
    //user_assets: user_assets,
  };
  console.log(response);
  res.json(response);
});

app.post("/ad_submit", async (req, res) => {
  let response;
  app_session = req.session;
  if (app_session.user_name && app_session.password) {
    let user_name = app_session.user_name;

    let html_json_data = req.body;
    //html_json_data["User_Capacity"] = app_session.capacity;
    // let post_timestamp = html_json_data["Posted_Timestamp"];
    // let tic_dashboard_to_sell = html_json_data["tic_dashboard_To_Sell"];
    // let cost = html_json_data["Cost"];
    let session_info = {
      User_Id: app_session.user_id,
    };
    let combined_user_data = { ...html_json_data, ...session_info };
    let insert_status = await sqlite_json_insert(
      combined_user_data,
      "Advertisement"
    );

    response = {
      status: "success",
      data: insert_status,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }

  console.log(response);
  res.json(response);
});

app.post("/sell", async (req, res) => {
  let response;
  let car_license_plate = req.body.car_license_plate;

  let CHAIN_CODE_NAME = req.body.Chain_Code_Name;
  let CHAIN_CODE_FUNCTION_NAME = req.body.Chain_Code_Function_Name;
  let HISTORY_USER_NAME = req.body.History_User_Name;
  app_session = req.session;
  if (app_session.user_name && app_session.password) {
    let user_name = app_session.user_name;
    const CHANNEL_NAME = "appchannel";
    //const CHAIN_CODE_NAME = "carcc";
    //const CHAIN_CODE_FUNCTION_NAME = "createCar";

    let invoke_result = await querychaincode(
      user_name,
      CHANNEL_NAME,
      CHAIN_CODE_NAME,
      CHAIN_CODE_FUNCTION_NAME,
      HISTORY_USER_NAME
    );

    response = {
      status: "success",
      data: invoke_result,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }
  console.log(response);
  res.json(response);
});

app.post("/create_user_asset", async (req, res) => {
  let response;

  let user_name = req.body.User_Name;
  let user_wallet = "100";

  let CHAIN_CODE_NAME = "tic_dashboard";
  let CHAIN_CODE_FUNCTION_NAME = "CreateAsset";
  app_session = req.session;

  const CHANNEL_NAME = "appchannel";

  let invoke_result = await invokechaincode(
    user_name,
    CHANNEL_NAME,
    CHAIN_CODE_NAME,
    CHAIN_CODE_FUNCTION_NAME,
    user_name,
    user_wallet,
    "Initial Credit"
  );

  response = {
    status: "success",
    data: invoke_result,
  };

  console.log(response);
  res.json(response);
});

app.post("/buy_confirm_invoke_chaincode", async (req, res) => {
  let response;
  app_session = req.session;
  let from_user_name = app_session.user_name;
  let to_user_name = req.body.seller_user_input;
  let amount = req.body.total_power_price_input;

  let CHAIN_CODE_NAME = "tic_dashboard";
  let CHAIN_CODE_FUNCTION_NAME = "TransferBalance";

  if (app_session.user_name && app_session.password) {
    let user_name = app_session.user_name;
    const CHANNEL_NAME = "appchannel";
    //const CHAIN_CODE_NAME = "carcc";
    //const CHAIN_CODE_FUNCTION_NAME = "createCar";

    let invoke_result = await invokechaincode(
      user_name,
      CHANNEL_NAME,
      CHAIN_CODE_NAME,
      CHAIN_CODE_FUNCTION_NAME,
      from_user_name,
      to_user_name,
      amount
    );

    let user_assets = await get_user_assets_from_chaicode();
    var user_assets_json = JSON.parse(user_assets["data"]);
    app_session = req.session;
    app_session.balance = user_assets_json["Balance"];
    //app_session.address = user_assets_json['color'];
    //app_session.smart_meter_id = user_assets_json['owner'];
    app_session.capacity = user_assets_json["size"];

    console.log("after buy");
    console.log(app_session);

    response = {
      status: "success",
      data: invoke_result,
      user_balance: app_session.balance,
      user_capacity: app_session.capacity,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }
  console.log(response);
  res.json(response);
});

app.post("/query_chain_code", async (req, res) => {
  let response;
  let CHAIN_CODE_NAME = req.body.Chain_Code_Name;
  let CHAIN_CODE_FUNCTION_NAME = req.body.Chain_Code_Function_Name;
  app_session = req.session;
  if (app_session.user_name && app_session.password) {
    let user_name = app_session.user_name;
    let CHANNEL_NAME = "appchannel";
    //let CHAIN_CODE_NAME = "carcc";
    //let CHAIN_CODE_FUNCTION_NAME = "listCars";

    let query_result = await querychaincode(
      user_name,
      CHANNEL_NAME,
      CHAIN_CODE_NAME,
      CHAIN_CODE_FUNCTION_NAME
    );

    response = {
      status: "success",
      data: query_result,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }

  console.log(response);
  res.json(response);
});

app.post("/get_user_balance", async (req, res) => {
  let response;
  let CHAIN_CODE_NAME = "tic_dashboard";
  let CHAIN_CODE_FUNCTION_NAME = "ReadAsset";
  let QUERY_USER_NAME = req.body.Query_User_Name;
  app_session = req.session;
  if (app_session.user_name && app_session.password) {
    let user_name = app_session.user_name;
    let CHANNEL_NAME = "appchannel";
    //let CHAIN_CODE_NAME = "carcc";
    //let CHAIN_CODE_FUNCTION_NAME = "listCars";

    let query_result = await querychaincode(
      user_name,
      CHANNEL_NAME,
      CHAIN_CODE_NAME,
      CHAIN_CODE_FUNCTION_NAME,
      QUERY_USER_NAME
    );

    response = {
      status: "success",
      data: query_result,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }

  console.log(response);
  res.json(response);
});

app.post("/transfer_amount", async (req, res) => {
  let response;
  let CHAIN_CODE_NAME = "tic_dashboard";
  let CHAIN_CODE_FUNCTION_NAME = "TransferBalance";
  let FROM_USER_NAME = req.body.From_User_Name;
  let TO_USER_NAME = req.body.To_User_Name;
  let AMOUNT = req.body.Amount;
  let REASON = req.body.Reason;
  app_session = req.session;
  if (app_session.user_name && app_session.password) {
    let user_name = app_session.user_name;
    let CHANNEL_NAME = "appchannel";
    //let CHAIN_CODE_NAME = "carcc";
    //let CHAIN_CODE_FUNCTION_NAME = "listCars";

    let query_result = await invokechaincode(
      user_name,
      CHANNEL_NAME,
      CHAIN_CODE_NAME,
      CHAIN_CODE_FUNCTION_NAME,
      FROM_USER_NAME,
      TO_USER_NAME,
      AMOUNT,
      REASON
    );

    response = {
      status: "success",
      data: query_result,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }

  console.log(response);
  res.json(response);
});

async function get_user_assets_from_chaicode() {
  let response;
  let CHAIN_CODE_NAME = "tic_dashboard";
  let CHAIN_CODE_FUNCTION_NAME = "ReadAsset";
  //app_session = req.session;
  if (app_session.user_name && app_session.password) {
    let user_name = app_session.user_name;
    let CHANNEL_NAME = "appchannel";
    //let CHAIN_CODE_NAME = "carcc";
    //let CHAIN_CODE_FUNCTION_NAME = "listCars";

    let query_result = await querychaincode(
      user_name,
      CHANNEL_NAME,
      CHAIN_CODE_NAME,
      CHAIN_CODE_FUNCTION_NAME,
      user_name
    );

    response = {
      status: "success",
      data: query_result,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }

  return response;
  //console.log(response);
  //res.json(response);
}

async function get_all_assets_from_chaicode() {
  let response;
  let CHAIN_CODE_NAME = "tic_dashboard";
  let CHAIN_CODE_FUNCTION_NAME = "GetAllAssets";
  //app_session = req.session;
  if (app_session.user_name && app_session.password) {
    let user_name = app_session.user_name;
    let CHANNEL_NAME = "appchannel";
    //let CHAIN_CODE_NAME = "carcc";
    //let CHAIN_CODE_FUNCTION_NAME = "listCars";

    let query_result = await querychaincode(
      user_name,
      CHANNEL_NAME,
      CHAIN_CODE_NAME,
      CHAIN_CODE_FUNCTION_NAME
    );

    response = {
      status: "success",
      data: query_result,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }

  return response;
  //console.log(response);
  //res.json(response);
}

app.post("/buy_ad_loader", async (req, res) => {
  let response;
  app_session = req.session;
  if (app_session.user_name && app_session.password) {
    let sql_query =
      "SELECT Advertisement.*, User.User_Name, User.User_Image,User.User_Profile_Rating,User.Accumulated_Generated_Power  FROM Advertisement JOIN User USING(User_Id) order by(Advertisement.Posted_Timestamp) desc";
    let db_query_result = await db_query(sql_query);

    response = {
      status: "success",
      data: db_query_result,
    };
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
  }

  console.log(response);
  res.json(response);
});

async function main() {
  //admin_enroll_status = await enrollAdmin();
  //console.log(admin_enroll_status);
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
  console.log(githubUrl);
  if (app_session.user_name && app_session.password) {
    var git_clone_command = "git clone " + githubUrl;
    if (githubUrlRename) {
      console.log("new name");
      console.log(githubUrlRename);
      git_clone_command = git_clone_command + " " + githubUrlRename;
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
  var chaincodeVersion = $req.body.chaincodeVersion;
  var peer = req.body.peer;
  var channel = req.body.channel;
  var language = req.body.language;
  var chaincodeSrcPath = req.body.chaincodeSrcPath;

  if (app_session.user_name && app_session.password) {
    shell.exec("export PEER_HOST=" + peer);
    shell.exec("export CORE_PEER_ADDRESS=" + peer + ":7051");
    shell.exec(
      "export CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp"
    );
    shell.exec(
      "export CORE_PEER_TLS_ROOTCERT_FILE=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp/tls/ca.crt"
    );

    var chaincode_install_command =
      "CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode install -n " +
      chaincodeName +
      " -v " +
      chaincodeVersion +
      " -l " +
      language +
      " -p " +
      chaincodeSrcPath;

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

main();
