// import app essential libraries
const express = require("express");
const session = require("express-session");
const formidable = require("express-formidable");
var bodyParser = require("body-parser");

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

const APP_CONFIG_FILE = "app_config.json";
// Global variable to store the api config from file
let appConfigJson;
// Load api config from json file
try {
  const apiConfigFilePath = path.resolve(__dirname, ".", APP_CONFIG_FILE);
  console.log(apiConfigFilePath);
  const apiConfigFileContent = fs.readFileSync(apiConfigFilePath, "utf8");
  appConfigJson = JSON.parse(apiConfigFileContent);
  console.log(appConfigJson);
} catch (e) {
  console.log(e);
  throw Error("API Start Error - Error while reading API config", e);
}

const TEST_LOCAL = 1;
var CHAINCODE_PATH;
var CERTIFICATE_PATH;
var CLI_PATH;
var CREATE_CHAINCODE_SCRIPT;

if (TEST_LOCAL == 1) {
  CHAINCODE_PATH = "../file_explorer/chaincodes";
  CERTIFICATE_PATH = "../file_explorer/certificates";
  CLI_PATH = "../../check_master";
  CREATE_CHAINCODE_SCRIPT = "./create_chaincode_stand_alone.sh";
} else {
  CHAINCODE_PATH = "../chaincodes";
  CERTIFICATE_PATH = "../orgca";
  CLI_PATH = "../../CLI";
  CREATE_CHAINCODE_SCRIPT = "./create_chaincode_stand_alone.sh";
}
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

// Enable app to access files under these folders
//app.use(express.static(CHAINCODE_PATH));
//app.use(express.static(CERTIFICATE_PATH));
app.use(express.static(CLI_PATH));

// Create a router for the express object
const router = express.Router();
const app_port_number = appConfigJson["tic_dashboard_port"];

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

  app_session = req.session;

  let response = {
    status: "Fail - Wrong credentials",
  };

  if (
    user_name === appConfigJson["tic_dashboard_user_name"] &&
    user_password === appConfigJson["tic_dashboard_user_password"]
  ) {
    app_session.user_name = user_name;
    app_session.password = user_password;

    response = {
      status: "success",
    };
  } else if (
    user_name === appConfigJson["tic_dashboard_user_name"] &&
    user_password !== appConfigJson["tic_dashboard_user_password"]
  ) {
    response = {
      status: "Fail - Wrong Password",
    };
  } else if (
    user_name !== appConfigJson["tic_dashboard_user_name"] &&
    user_password === appConfigJson["tic_dashboard_user_password"]
  ) {
    app_session = null;
    response = {
      status: "Fail - Wrong User Name",
    };
  }
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
  var githubAccessToken = req.body.githubAccessToken;
  var githubUrlBranch = req.body.githubUrlBranch;
  console.log(githubUrl);
  if (app_session.user_name && app_session.password) {
    var git_clone_command = "git clone ";
    if (githubUrlBranch) {
      //--single-branch --branch <branchname>
      git_clone_command =
        git_clone_command + "--single-branch --branch " + githubUrlBranch + " ";
    }

    if (githubRepoType === "public") {
      // git clone https://github.com/bityoga/smart_energy_chaincodes.git
      git_clone_command = git_clone_command + " " + githubUrl;
    } else {
      //git clone https://username:password@github.com/username/repository.git
      //git clone https://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@github.com/bityoga/smart_energy_chaincodes.git
      git_clone_command =
        git_clone_command +
        " https://" +
        githubAccessToken +
        "@" +
        githubUrl.replace(/(^\w+:|^)\/\//, "");
    }

    if (githubUrlRename) {
      console.log("new name");
      console.log(githubUrlRename);
      git_clone_command = git_clone_command + " " + githubUrlRename;
    }
    console.log("git_clone_command");
    console.log(git_clone_command);
    shell.cd(CHAINCODE_PATH);
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

/**
 * it gives a number as byte and convert it to KB, MB and GB (depends on file size) and return the result as string.
 * @param number file size in Byte
 */
function ConvertSize(number) {
  if (number <= 1024) {
    return `${number} Byte`;
  } else if (number > 1024 && number <= 1048576) {
    return (number / 1024).toPrecision(3) + " KB";
  } else if (number > 1048576 && number <= 1073741824) {
    return (number / 1048576).toPrecision(3) + " MB";
  } else if (number > 1073741824 && number <= 1099511627776) {
    return (number / 1073741824).toPrecision(3) + " GB";
  }
}

const getAllFilesListofArrays = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFilesListofArrays(
        dirPath + "/" + file,
        arrayOfFiles
      );
    } else {
      fileNameWithFullPath = path.join(__dirname, dirPath, "/", file);
      fileNameWithRelativePath = path.join(dirPath, "/", file);
      fileStats = fs.statSync(fileNameWithFullPath);
      filesize = ConvertSize(fileStats.size);
      fileDownloadButton =
        '<a class="btn btn-primary text-break" href="' +
        fileNameWithRelativePath +
        '" role="button" download><i class="fa fa-download" aria-hidden="true"></i> Download</a>';
      FileViewButton =
        '<button data-link="' +
        fileNameWithRelativePath +
        '"onclick="sendAjaxRequestToReadAndShowSelectedDataTableFile(this)" class="btn btn-primary viewFileButton"><i class="fa fa-eye" aria-hidden="true"></i> View File <span style="display:none" class="spinner-border spinner-border-sm allCertificatesFileViewSpinner" role="status" aria-hidden="true"></span></button>';
      fileinfoArray = [
        fileNameWithFullPath,
        filesize,
        new Date(fileStats.ctime).toLocaleString("no-No"),
        new Date(fileStats.mtime).toLocaleString("no-NO"),
        fileDownloadButton,
        FileViewButton,
      ];
      arrayOfFiles.push(fileinfoArray);
    }
  });

  return arrayOfFiles;
};

app.post("/getCertificateFileList", async (req, res) => {
  let response;

  app_session = req.session;

  if (app_session.user_name && app_session.password) {
    var fileList = getAllFilesListofArrays(CERTIFICATE_PATH);
    response = {
      status: "success",
      data: fileList,
    };
    console.log(response);
    res.json(response);
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
    console.log(response);
    res.json(response);
  }
});

app.post("/getAllUploadedChainCodeFilesList", async (req, res) => {
  let response;

  app_session = req.session;

  if (app_session.user_name && app_session.password) {
    var fileList = getAllChainCodeFilesListOfArrays(CHAINCODE_PATH);
    response = {
      status: "success",
      data: fileList,
    };
    console.log(response);
    res.json(response);
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
    console.log(response);
    res.json(response);
  }
});

app.post("/viewFileContent", async (req, res) => {
  let response;

  app_session = req.session;
  var fileName = req.body.fileName;

  if (app_session.user_name && app_session.password) {
    try {
      const fileNameWithPath = path.resolve(__dirname, ".", fileName);
      console.log(fileNameWithPath);
      const fileContent = fs.readFileSync(fileNameWithPath, "utf8");
      //appConfigJson = JSON.parse(fileContent);
      //console.log(appConfigJson);
      response = {
        status: "success",
        data: fileContent,
      };
    } catch (e) {
      console.log(e);
      response = {
        status: "Failed",
        data: "File Read Failed" + String(e),
      };
    }
    res.json(response);
  } else {
    response = {
      status: "Failed",
      data: "Session Expired - Please Login",
    };
    console.log(response);
    res.json(response);
  }
});

app.post("/createChaincode", async (req, res) => {
  let response;

  app_session = req.session;

  var chaincodeNameInput = req.body.chaincodeNameInput;
  var chaincodeClassNameInput = req.body.chaincodeClassNameInput;

  if (app_session.user_name && app_session.password) {
    var chaincodeCreateCommand =
      "sh " +
      CREATE_CHAINCODE_SCRIPT +
      " " +
      chaincodeNameInput +
      " " +
      chaincodeClassNameInput +
      " " +
      CHAINCODE_PATH +
      "/" +
      chaincodeNameInput;

    console.log("chaincodeCreateCommand");
    console.log(chaincodeCreateCommand);

    shell.exec(chaincodeCreateCommand, function (code, stdout, stderr) {
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

const getAllChainCodeFilesListOfArrays = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllChainCodeFilesListOfArrays(
        dirPath + "/" + file,
        arrayOfFiles
      );
    } else {
      fileNameWithFullPath = path.join(__dirname, dirPath, "/", file);
      fileNameWithRelativePath = path.join(dirPath, "/", file);
      fileStats = fs.statSync(fileNameWithFullPath);
      filesize = ConvertSize(fileStats.size);
      fileDownloadButton =
        '<a class="btn btn-primary text-break" href="' +
        fileNameWithRelativePath +
        '" role="button" download><i class="fa fa-download" aria-hidden="true"></i> Download</a>';
      FileViewButton =
        '<button data-link="' +
        fileNameWithRelativePath +
        '"onclick="sendAjaxRequestToReadAndShowSelectedDataTableFile(this)" class="btn btn-primary viewFileButton"><i class="fa fa-eye" aria-hidden="true"></i> View File <span style="display:none" class="spinner-border spinner-border-sm chainCodeFileViewSpinner" role="status" aria-hidden="true"></span></button>';
      deleteFileButton =
        '<button data-link="' +
        fileNameWithFullPath +
        '"onclick="processRequestToDeleteSelectedChainCodeFile(this)" class="btn btn-primary deleteFileButton"><i class="fa fa-trash" aria-hidden="true"></i> Delete File <span style="display:none" class="spinner-border spinner-border-sm chainCodeFileDeleteSpinner" role="status" aria-hidden="true"></span></button>';
      const chaincodeName = fileNameWithRelativePath
        .split(CHAINCODE_PATH + "/")
        .pop()
        .split("/")[0];
      fileinfoArray = [
        chaincodeName,
        fileNameWithFullPath,
        filesize,
        new Date(fileStats.ctime).toLocaleString("no-No"),
        new Date(fileStats.mtime).toLocaleString("no-NO"),
        deleteFileButton,
        fileDownloadButton,
        FileViewButton,
      ];
      arrayOfFiles.push(fileinfoArray);
    }
  });

  return arrayOfFiles;
};

app.post("/deleteSelectedChainCodeUpload", async (req, res) => {
  let response;

  app_session = req.session;

  var fileName = req.body.fileName;

  if (app_session.user_name && app_session.password) {
    var chainCodeFileWithFullPath = CHAINCODE_PATH + "/" + fileName;
    var removeChainCodeFolderCommand = "rm -rf " + chainCodeFileWithFullPath;

    console.log("removeChainCodeFolderCommand");
    console.log(removeChainCodeFolderCommand);

    shell.exec(removeChainCodeFolderCommand, function (code, stdout, stderr) {
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

app.post("/deleteSelectedChainCodeFile", async (req, res) => {
  let response;

  app_session = req.session;

  var fileName = req.body.fileName;

  if (app_session.user_name && app_session.password) {
    var removeChainCodeFileCommand = "rm -rf " + fileName;

    console.log("removeChainCodeFileCommand");
    console.log(removeChainCodeFileCommand);

    shell.exec(removeChainCodeFileCommand, function (code, stdout, stderr) {
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
