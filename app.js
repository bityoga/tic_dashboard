// import app essential libraries
const express = require("express");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const shell = require("shelljs");
const path = require("path");
const axios = require("axios");
const https = require("https");
const hljs = require("highlight.js"); // https://highlightjs.org/
// Actual default values
const md = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});

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
const REST_API_README_FILE_URL =
  "https://raw.githubusercontent.com/bityoga/fabric_as_code_restapi/main/curl_instructions/README.md";
const REST_API_SETUP_README_FILE_URL =
  "https://raw.githubusercontent.com/bityoga/fabric_as_code_restapi/main/README.md";

const NODE_SDK_TESTER_README_FILE_URL =
  "https://raw.githubusercontent.com/bityoga/fabric_node_sdk_tester/master/README.md";

const NODE_SDK_HELPER_README_FILE_URL =
  "https://raw.githubusercontent.com/bityoga/fabric_node_sdk_helper/master/README.md";

if (TEST_LOCAL === 1) {
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
console.log(CHAINCODE_PATH);
console.log(CERTIFICATE_PATH);
console.log(CLI_PATH);
console.log(CREATE_CHAINCODE_SCRIPT);
// Create a express object
const app = express();
// default file Upload options
app.use(fileUpload());
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

app.post("/getAllUploadedChainCodeFilesListToInstall", async (req, res) => {
  let response;

  app_session = req.session;

  if (app_session.user_name && app_session.password) {
    var fileList = getAllChainCodeFilesListOfArraysToInstall(CHAINCODE_PATH);
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
        '"onclick="sendAjaxRequestToReadAndShowSelectedDataTableFile(this)" class="btn btn-primary viewFileButton"><i class="fa fa-eye" aria-hidden="true"></i> View <span style="display:none" class="spinner-border spinner-border-sm chainCodeFileViewSpinner" role="status" aria-hidden="true"></span></button>';
      deleteFileButton =
        '<button data-link="' +
        fileNameWithFullPath +
        '"onclick="processRequestToDeleteSelectedChainCodeFile(this)" class="btn btn-primary deleteFileButton"><i class="fa fa-trash" aria-hidden="true"></i> Delete <span style="display:none" class="spinner-border spinner-border-sm chainCodeFileDeleteSpinner" role="status" aria-hidden="true"></span></button>';
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

const getAllChainCodeFilesListOfArraysToInstall = function (
  dirPath,
  arrayOfFiles
) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllChainCodeFilesListOfArraysToInstall(
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
        '"onclick="sendAjaxRequestToReadAndShowSelectedDataTableFile(this)" class="btn btn-primary viewFileButton"><i class="fa fa-eye" aria-hidden="true"></i> View <span style="display:none" class="spinner-border spinner-border-sm chainCodeFileViewSpinner" role="status" aria-hidden="true"></span></button>';
      deleteFileButton =
        '<button data-link="' +
        fileNameWithFullPath +
        '"onclick="processRequestToDeleteSelectedChainCodeFile(this)" class="btn btn-primary deleteFileButton"><i class="fa fa-trash" aria-hidden="true"></i> Delete <span style="display:none" class="spinner-border spinner-border-sm chainCodeFileDeleteSpinner" role="status" aria-hidden="true"></span></button>';
      const chaincodeName = fileNameWithRelativePath
        .split(CHAINCODE_PATH + "/")
        .pop()
        .split("/")[0];
      fileInfoDict = {
        chainCodeName: chaincodeName,
        fileName: fileNameWithFullPath,
      };
      /* filesize,
        new Date(fileStats.ctime).toLocaleString("no-No"),
        new Date(fileStats.mtime).toLocaleString("no-NO"),
        deleteFileButton,
        fileDownloadButton,
        FileViewButton, */

      arrayOfFiles.push(fileInfoDict);
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

function generateGitCloneCommand(
  githubUrl,
  githubUrlBranch,
  githubUrlRename,
  githubRepoType,
  githubAccessToken
) {
  var gitCloneCommand = "git clone ";
  if (githubUrlBranch) {
    //--single-branch --branch <branchname>
    gitCloneCommand =
      gitCloneCommand + "--single-branch --branch " + githubUrlBranch + " ";
  }

  if (githubRepoType === "public") {
    // git clone https://github.com/bityoga/smart_energy_chaincodes.git
    gitCloneCommand = gitCloneCommand + " " + githubUrl;
    console.log("pubic gitCloneCommand");
    console.log(gitCloneCommand);
  } else {
    //git clone https://username:password@github.com/username/repository.git
    //git clone https://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@github.com/bityoga/smart_energy_chaincodes.git
    gitCloneCommand =
      gitCloneCommand +
      " https://" +
      githubAccessToken +
      "@" +
      githubUrl.replace(/(^\w+:|^)\/\//, "");
  }

  var repoName = githubUrl.split("/").pop(); // will return repoName.git

  var repoDirectoryName = repoName.split(".")[0]; // will get repoName

  if (githubUrlRename) {
    console.log("new name");
    console.log(githubUrlRename);
    gitCloneCommand =
      gitCloneCommand + " " + CHAINCODE_PATH + "/" + githubUrlRename;
  } else {
    gitCloneCommand =
      gitCloneCommand + " " + CHAINCODE_PATH + "/" + repoDirectoryName;
  }

  gitCloneCommand =
    "rm -rf " +
    CHAINCODE_PATH +
    "/" +
    repoDirectoryName +
    " && " +
    gitCloneCommand;
  return gitCloneCommand;
}

app.post("/uploadChainCode", async (req, res) => {
  let response;

  app_session = req.session;
  console.log(req.body);

  var fileUploadTypeSelection = req.body.fileUploadTypeSelection;
  if (fileUploadTypeSelection === "fileUpload") {
    // file upload option selected
    let fileToUpload;
    let uploadPath;
    // console.log("req");
    // console.log(req);

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    // The name of the input field (i.e. "fileToUpload") is used to retrieve the uploaded file
    console.log("req.files");
    console.log(req.files);
    fileToUpload = req.files.fileToUpload;
    console.log("fileToUpload");
    console.log(fileToUpload);
    uploadPath = CHAINCODE_PATH + "/" + fileToUpload.name;
    console.log("uploadPath");
    console.log(uploadPath);

    // Use the mv() method to place the file somewhere on your server
    fileToUpload.mv(uploadPath, function (err) {
      if (err) return res.status(500).send(err);
      console.log("File Uploaded");
      // upload is success
      // unzip ../file_explorer/chaincodes/articonf-bank-chaincode-main.zip -d ../file_explorer/chaincodes/ && rm -f ../file_explorer/chaincodes/articonf-bank-chaincode-main.zip
      var unZipCommand =
        "unzip -o " +
        uploadPath.replace(/(?=[() ])/g, "\\") +
        " -d " +
        CHAINCODE_PATH +
        "/" +
        " && rm -f " +
        uploadPath.replace(/(?=[() ])/g, "\\");
      console.log("unZipCommand");
      console.log(unZipCommand);

      shell.exec(unZipCommand, function (code, stdout, stderr) {
        console.log("Exit code:", code);
        console.log("Program output:", stdout);
        console.log("Program stderr:", stderr);
        var execCommandStatus = {
          Exit_Code: code,
          Output: stdout,
          Error: stderr,
        };
        response = {
          status: "success",
          data: execCommandStatus,
        };
        console.log(response);
        res.json(response);
      });
      //res.send(response);
    });
  } else {
    // github option selected
    var githubUrl = req.body.githubUrl;
    var githubUrlBranch = req.body.githubUrlBranch;
    var githubUrlRename = req.body.githubUrlRename;
    var githubRepoType = req.body.githubRepoType;
    var githubAccessToken = req.body.githubAccessToken;
    var generatedGitCloneCommand = generateGitCloneCommand(
      githubUrl,
      githubUrlBranch,
      githubUrlRename,
      githubRepoType,
      githubAccessToken
    );
    console.log("generatedGitCloneCommand");
    console.log(generatedGitCloneCommand);
    //shell.cd(CHAINCODE_PATH);
    shell.exec(generatedGitCloneCommand, function (code, stdout, stderr) {
      console.log("Exit code:", code);
      console.log("Program output:", stdout);
      console.log("Program stderr:", stderr);
      var execCommandStatus = {
        Exit_Code: code,
        Output: stdout,
        Error: stderr,
      };
      response = {
        status: "success",
        data: execCommandStatus,
      };
      console.log(response);
      res.json(response);
    });
  }
});

app.post("/installChaincode", async (req, res) => {
  let response;

  app_session = req.session;
  console.log(req.body);

  var chaincodeName = req.body.chaincodeNameInput;
  var chaincodeVersion = req.body.chaincodeVersionInput;
  var peer = req.body.peerSelection;
  /* var channel = req.body.channelSelection; */
  var language = req.body.chainCodeProgrammingLanguage;
  var chaincodeSrcPath = req.body.selectedChainCodeRootSrcFile;
  chaincodeSrcPath = chaincodeSrcPath.substring(
    0,
    chaincodeSrcPath.lastIndexOf("/") + 1
  );

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

app.post("/instantiateChaincode", async (req, res) => {
  let response;

  app_session = req.session;
  console.log(req.body);

  var chaincodeName = req.body.chaincodeNameInput;
  var chaincodeVersion = req.body.chaincodeVersionInput;
  var peer = req.body.peerSelection;
  var channel = req.body.channelSelection;
  var chaincodeInstantiateParams = req.body.chaincodeInstantiateParams;
  var isUsingPrivateData = req.body.isChaincodeUsingPrivateDataCollections;
  var collectionsConfigFile = req.body.selectedChainCodeCollectionsConfigFile;

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
    if (isUsingPrivateData==="yes") {
      chaincode_instantiate_command = chaincode_instantiate_command + " --collections-config " + collectionsConfigFile;
    }
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

app.post("/upgradeChaincode", async (req, res) => {
  let response;

  app_session = req.session;
  console.log(req.body);

  var chaincodeName = req.body.chaincodeNameInput;
  var chaincodeVersion = req.body.chaincodeVersionInput;
  var peer = req.body.peerSelection;
  var channel = req.body.channelSelection;
  var chaincodeInstantiateParams = req.body.chaincodeInstantiateParams;
  var chaincodeSrcPath = req.body.selectedChainCodeRootSrcFile;
  var isUsingPrivateData = req.body.isChaincodeUsingPrivateDataCollections;
  var collectionsConfigFile = req.body.selectedChainCodeCollectionsConfigFile;
  chaincodeSrcPath = chaincodeSrcPath.substring(
    0,
    chaincodeSrcPath.lastIndexOf("/") + 1
  );

  if (app_session.user_name && app_session.password) {
    var PEER_HOST = peer;
    var CORE_PEER_ADDRESS = PEER_HOST + ":7051";
    var CORE_PEER_MSPCONFIGPATH = "/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp";
    var CORE_PEER_TLS_ROOTCERT_FILE =
      "/root/CLI/${ORGCA_HOST}/" + PEER_HOST + "/msp/tls/ca.crt";

    //instantiate- CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode instantiate -C $CHANNEL_NAME -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -c $INSTANTIATE_PARAMS -o ${ORDERER_HOST}:7050 --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}
    //upgrade -  CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode upgrade -C $CHANNEL_NAME -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -c $INSTANTIATE_PARAMS -p $CHAINCODE_SRC_CODE_PATH -o ${ORDERER_HOST}:7050 --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}

    var chaincodeUpgradeCommand =
      "CORE_PEER_ADDRESS=" +
      CORE_PEER_ADDRESS +
      " CORE_PEER_MSPCONFIGPATH=" +
      CORE_PEER_MSPCONFIGPATH +
      " CORE_PEER_TLS_ROOTCERT_FILE=" +
      CORE_PEER_TLS_ROOTCERT_FILE +
      " peer chaincode upgrade -C " +
      channel +
      " -n " +
      chaincodeName +
      " -v " +
      chaincodeVersion +
      " -c '" +
      chaincodeInstantiateParams +
      "' -p " +
      chaincodeSrcPath +
      " -o ${ORDERER_HOST}:7050 --tls --cafile " +
      CORE_PEER_TLS_ROOTCERT_FILE;
    if (isUsingPrivateData==="yes") {
      chaincodeUpgradeCommand = chaincodeUpgradeCommand + " --collections-config " + collectionsConfigFile;
    }
    console.log("chaincodeUpgradeCommand");
    console.log(chaincodeUpgradeCommand);

    shell.exec(chaincodeUpgradeCommand, function (code, stdout, stderr) {
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

app.post("/queryChaincode", async (req, res) => {
  let response;

  app_session = req.session;
  console.log(req.body);

  var chaincodeName = req.body.chaincodeNameInput;
  var peer = req.body.peerSelection;
  var channel = req.body.channelSelection;
  var chainCodeQueryParameters = req.body.chainCodeQueryParameters;

  if (app_session.user_name && app_session.password) {
    var PEER_HOST = peer;
    var CORE_PEER_ADDRESS = PEER_HOST + ":7051";
    var CORE_PEER_MSPCONFIGPATH = "/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp";
    var CORE_PEER_TLS_ROOTCERT_FILE =
      "/root/CLI/${ORGCA_HOST}/" + PEER_HOST + "/msp/tls/ca.crt";

    //instantiate- CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode instantiate -C $CHANNEL_NAME -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -c $INSTANTIATE_PARAMS -o ${ORDERER_HOST}:7050 --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}
    //upgrade -  CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode upgrade -C $CHANNEL_NAME -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -c $INSTANTIATE_PARAMS -p $CHAINCODE_SRC_CODE_PATH -o ${ORDERER_HOST}:7050 --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}
    //query -    CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c $QUERY_PARAMS
    var chaincodeQueryCommand =
      "CORE_PEER_ADDRESS=" +
      CORE_PEER_ADDRESS +
      " CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/" +
      peer +
      "/msp" +
      " CORE_PEER_TLS_ROOTCERT_FILE=" +
      CORE_PEER_TLS_ROOTCERT_FILE +
      " peer chaincode query -C " +
      channel +
      " -n " +
      chaincodeName +
      " -c '" +
      chainCodeQueryParameters +
      "'";

    console.log("chaincodeQueryCommand");
    console.log(chaincodeQueryCommand);

    shell.exec(chaincodeQueryCommand, function (code, stdout, stderr) {
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

app.post("/invokeChaincode", async (req, res) => {
  let response;

  app_session = req.session;
  console.log(req.body);

  var chaincodeName = req.body.chaincodeNameInput;
  var peer = req.body.peerSelection;
  var channel = req.body.channelSelection;
  var chainCodeInvokeParameters = req.body.chainCodeInvokeParameters;

  if (app_session.user_name && app_session.password) {
    var PEER_HOST = peer;
    var CORE_PEER_ADDRESS = PEER_HOST + ":7051";
    var CORE_PEER_MSPCONFIGPATH = "/root/CLI/${ORGCA_HOST}/${ADMIN_USER}/msp";
    var CORE_PEER_TLS_ROOTCERT_FILE =
      "/root/CLI/${ORGCA_HOST}/" + PEER_HOST + "/msp/tls/ca.crt";

    //instantiate- CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode instantiate -C $CHANNEL_NAME -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -c $INSTANTIATE_PARAMS -o ${ORDERER_HOST}:7050 --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}
    //upgrade -  CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode upgrade -C $CHANNEL_NAME -n $CHAINCODE_NAME -v $CHAINCODE_VERSION -c $INSTANTIATE_PARAMS -p $CHAINCODE_SRC_CODE_PATH -o ${ORDERER_HOST}:7050 --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}
    //query -    CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c $QUERY_PARAMS
    //invoke -   CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/${PEER_HOST}/msp CORE_PEER_TLS_ROOTCERT_FILE=$CORE_PEER_TLS_ROOTCERT_FILE peer chaincode invoke -C $CHANNEL_NAME -n $CHAINCODE_NAME -c $INVOKE_PARAMS -o ${ORDERER_HOST}:7050 --tls --cafile ${CORE_PEER_TLS_ROOTCERT_FILE}

    var chaincodeInvokeCommand =
      "CORE_PEER_ADDRESS=" +
      CORE_PEER_ADDRESS +
      " CORE_PEER_MSPCONFIGPATH=/root/CLI/${ORGCA_HOST}/" +
      peer +
      "/msp" +
      " CORE_PEER_TLS_ROOTCERT_FILE=" +
      CORE_PEER_TLS_ROOTCERT_FILE +
      " peer chaincode invoke -C " +
      channel +
      " -n " +
      chaincodeName +
      " -c '" +
      chainCodeInvokeParameters +
      "' -o ${ORDERER_HOST}:7050 --tls --cafile " +
      CORE_PEER_TLS_ROOTCERT_FILE;

    console.log("chaincodeInvokeCommand");
    console.log(chaincodeInvokeCommand);

    shell.exec(chaincodeInvokeCommand, function (code, stdout, stderr) {
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

app.post("/getRestApiGitHubReadMe", async (req, res) => {
  let response;

  app_session = req.session;

  if (app_session.user_name && app_session.password) {
    axios
      .get(REST_API_README_FILE_URL, {
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: { "Access-Control-Allow-Origin": "*" },
      })
      .then((r) => {
        console.log(r.data);
        const searchRegExp = /LOCALHOST_OR_YOUR_MASTER_MACHINE_IP_ADDRESS/g;
        const replaceWith = appConfigJson["tic_master_machine_ip_address"];
        const ipAddressReplacedData = r.data.replace(searchRegExp, replaceWith);

        response = {
          status: "success",
          data: md.render(ipAddressReplacedData),
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

app.post("/getNodeSdkTesterReadMe", async (req, res) => {
  let response;

  app_session = req.session;

  if (app_session.user_name && app_session.password) {
    axios
      .get(NODE_SDK_TESTER_README_FILE_URL, {
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: { "Access-Control-Allow-Origin": "*" },
      })
      .then((r) => {
        console.log(r.data);
        const searchRegExp = /LOCALHOST_OR_YOUR_MASTER_MACHINE_IP_ADDRESS/g;
        const replaceWith = appConfigJson["tic_master_machine_ip_address"];
        const ipAddressReplacedData = r.data.replace(searchRegExp, replaceWith);

        response = {
          status: "success",
          data: md.render(ipAddressReplacedData),
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

app.post("/getNodeSdkHelperReadMe", async (req, res) => {
  let response;

  app_session = req.session;

  if (app_session.user_name && app_session.password) {
    axios
      .get(NODE_SDK_HELPER_README_FILE_URL, {
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: { "Access-Control-Allow-Origin": "*" },
      })
      .then((r) => {
        console.log(r.data);
        const searchRegExp = /LOCALHOST_OR_YOUR_MASTER_MACHINE_IP_ADDRESS/g;
        const replaceWith = appConfigJson["tic_master_machine_ip_address"];
        const ipAddressReplacedData = r.data.replace(searchRegExp, replaceWith);

        response = {
          status: "success",
          data: md.render(ipAddressReplacedData),
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

app.post("/getRestApiSetUpInstructionsGitHubReadMe", async (req, res) => {
  let response;

  app_session = req.session;

  if (app_session.user_name && app_session.password) {
    axios
      .get(REST_API_SETUP_README_FILE_URL, {
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: { "Access-Control-Allow-Origin": "*" },
      })
      .then((r) => {
        console.log(r.data);
        const searchRegExp = /LOCALHOST_OR_YOUR_MASTER_MACHINE_IP_ADDRESS/g;
        const replaceWith = appConfigJson["tic_master_machine_ip_address"];
        const ipAddressReplacedData = r.data.replace(searchRegExp, replaceWith);
        response = {
          status: "success",
          data: md.render(ipAddressReplacedData),
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
