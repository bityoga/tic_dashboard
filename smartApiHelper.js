const axios = require("axios");
const https = require("https");
async function getSmartApiAuthenticationToken(appConfigJson) {
  let smartApiAuthorizationToken = null;
  try {
    const smartApiAuthenticationCredentials = {
      username: appConfigJson["smart_rest_api_authentication_user_name"],
      password: appConfigJson["smart_rest_api_authentication_user_password"],
    };

    const axiosRequest = {
      method: "post",
      url:
        appConfigJson["ARTICONF_SMART_API_AUTHENTICATION_ACCESS_ACCESS_URL"] +
        "/api/tokens",
      // To bypass  "Error: self signed certificate in certificate chain"
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {
        /*"Content-Type": "text/plain",*/
      },

      data: smartApiAuthenticationCredentials,
    };

    const response = await axios(axiosRequest);
    //console.log(response);
    //console.log(response.data);

    smartApiAuthorizationToken = response["data"]["token"];
  } catch (error) {
    console.error("getHlfExplorerAuthenticationToken() Error :", error);
  } finally {
    console.log("smartApiAuthorizationToken");
    console.log(smartApiAuthorizationToken);
    return smartApiAuthorizationToken;
  }
}

async function getUseCaseListFromSmartApi(
  passedAuthenticationToken,
  appConfigJson
) {
  let useCaseList = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken(
      appConfigJson
    );

    if (smartAuthenticationToken) {
      let jwtToken;
      if (passedAuthenticationToken) {
        jwtToken = passedAuthenticationToken;
      } else {
        jwtToken = smartAuthenticationToken;
      }
      var axiosRequest = {
        method: "get",
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        url:
          appConfigJson["ARTICONF_SMART_API_USECASE_ACCESS_URL"] +
          "/api/use-cases",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
      };
      //console.log(axiosRequest);
      const response = await axios(axiosRequest);
      //console.log(response.data);
      useCaseList = response.data;
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("getUseCaseListFromSmartApi() Error : ".error);
  } finally {
    //console.log(useCaseList);
    return useCaseList;
  }
}
function checkIfUseCaseExists(useCaseList, useCaseNameToCheck) {
  return useCaseList.some(function (el) {
    return el.name === useCaseNameToCheck;
  });
}

async function createNewUseCaseInSmart(useCaseName, appConfigJson) {
  let createNewUseCaseInSmartApiResponse = null;

  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken(
      appConfigJson
    );
    if (smartAuthenticationToken) {
      const existingUseCaseList = await getUseCaseListFromSmartApi(
        smartAuthenticationToken,
        appConfigJson
      );
      // console.log(existingUseCaseList);
      const useCaseExists = checkIfUseCaseExists(
        existingUseCaseList,
        useCaseName
      );
      console.log("useCaseExists ", useCaseExists);
      if (!useCaseExists) {
        var data = JSON.stringify({ name: useCaseName });
        var config = {
          method: "post",
          url:
            appConfigJson["ARTICONF_SMART_API_USECASE_ACCESS_URL"] +
            "/api/use-cases?name=" +
            useCaseName,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + smartAuthenticationToken,
          },
          data: data,
        };
        console.log(config);
        try {
          const axiosResponse = await axios(config);
          console.log(createNewUseCaseInSmartApiResponse);
          const useCaseCreateMessage = "UseCase Created Successfully!";
          createNewUseCaseInSmartApiResponse = {};

          createNewUseCaseInSmartApiResponse["axiosResponseStatus"] =
            axiosResponse.status;
          createNewUseCaseInSmartApiResponse[
            "useCaseCreateMessage"
          ] = useCaseCreateMessage;
        } catch (error) {
          //console.log(Object.keys(error), error.message);
          console.log("axios error");
          //createNewUseCaseInSmartApiResponse = error.response.status;
          console.log(error.response.status, error.response.data);
          createNewUseCaseInSmartApiResponse = {};

          createNewUseCaseInSmartApiResponse["axiosResponseStatus"] =
            error.response.status;
          createNewUseCaseInSmartApiResponse[
            "useCaseCreateMessage"
          ] = useCaseCreateMessage;
        }
      } else {
        const useCaseCreateMessage =
          "Create New Use: Use case '" +
          useCaseName +
          "' already exists. So skipping ...";

        createNewUseCaseInSmartApiResponse = 400;

        createNewUseCaseInSmartApiResponse = {};

        createNewUseCaseInSmartApiResponse["axiosResponseStatus"] = 400;
        createNewUseCaseInSmartApiResponse[
          "useCaseCreateMessage"
        ] = useCaseCreateMessage;
      }
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("createNewUseCaseInSmart() Error : ".error);
  } finally {
    console.log("createNewUseCaseInSmartApiResponse");
    console.log(createNewUseCaseInSmartApiResponse);
    return createNewUseCaseInSmartApiResponse;
  }
}

async function getPushedTransactionListFromSmartApi(
  useCaseName,
  appConfigJson
) {
  let transactionList = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken(
      appConfigJson
    );
    if (smartAuthenticationToken) {
      var axiosRequest = {
        method: "get",
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        url:
          appConfigJson[
          "ARTICONF_SMART_API_BLOCKCHAIN_TRACE_RETRIEVAL_ACCESS_URL"
          ] +
          "/api/use_cases/" +
          useCaseName +
          "/transactions",
        headers: {
          Authorization: "Bearer " + smartAuthenticationToken,
        },
      };
      console.log(axiosRequest);
      try {
        const response = await axios(axiosRequest);
        //console.log(response.data);
        transactionList = response.data;
      } catch (error) {
        console.log("axios error");
        console.log(error.response.status, error.response.data);
      }
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("getPushedTransactionListFromSmartApi() Error : ".error);
  } finally {
    console.log(transactionList);
    return transactionList;
  }
}

async function getUseCaseTableListFromSmartApi(
  passedAuthenticationToken,
  useCaseName
) {
  updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let useCaseTableList = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();

    if (smartAuthenticationToken) {
      let jwtToken;
      if (passedAuthenticationToken) {
        jwtToken = passedAuthenticationToken;
      } else {
        jwtToken = smartAuthenticationToken;
      }
      var axiosRequest = {
        method: "get",
        // To bypass  "Error: self signed certificate in certificate chain"
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        url:
          appConfigJson["ARTICONF_SMART_API_USECASE_ACCESS_URL"] +
          "/api/use-cases/" +
          useCaseName +
          "/tables",
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
      };
      //console.log(axiosRequest);
      const response = await axios(axiosRequest);
      //console.log(response.data);
      useCaseTableList = response.data;
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("getUseCaseTableListFromSmartApi() Error : ".error);
  } finally {
    //console.log(useCaseTableList);
    return useCaseTableList;
  }
}

function checkIfUseCaseTableExists(useCaseTableList, tableNameToCheck) {
  return useCaseTableList.some(function (el) {
    return el.name === tableNameToCheck;
  });
}

async function createNewTableInUseCaseInSmart(
  useCaseName,
  tableName,
  tableMappings,
  appConfigJson
) {
  //updateAppConfigJsonGlobalVariableWithLatestChangesFromFile();
  let createNewUseCaseTableInSmartApiResponse = null;
  try {
    const smartAuthenticationToken = await getSmartApiAuthenticationToken(
      appConfigJson
    );
    if (smartAuthenticationToken) {
      const existingUseCaseTableList = await getUseCaseTableListFromSmartApi(
        smartAuthenticationToken,
        useCaseName
      );
      // console.log(existingUseCaseTableList);
      const useCaseTableExists = checkIfUseCaseTableExists(
        existingUseCaseTableList,
        tableName
      );
      console.log("useCaseTableExists ", useCaseTableExists);
      if (!useCaseTableExists) {
        var data = JSON.stringify({
          name: tableName,
          use_case: useCaseName,
          mappings: tableMappings,
        });
        const staticToken =
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InJlZ3VsYXJAaXRlYy5hYXUuYXQiLCJjcmVhdGVkX2F0IjoiMjAyMS0xMi0xNSAyMToyODo1Ny45MjE3ODgiLCJ2YWxpZF91bnRpbCI6IjIwMjEtMTItMTYgMjE6Mjg6NTcuOTIxNzg4In0.gp13LARYOduRFHSNk9dKl_9Vtehkg2CXQu_Wiez4ptc";
        var config = {
          method: "post",
          url:
            appConfigJson["ARTICONF_SMART_API_USECASE_ACCESS_URL"] +
            "/api/use-cases/" +
            useCaseName +
            "/tables",
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + smartAuthenticationToken,
          },
          data: data,
        };
        console.log(config);
        try {
          const axiosResponse = await axios(config);
          console.log(createNewUseCaseTableInSmartApiResponse);
          createNewUseCaseTableInSmartApiResponse = axiosResponse.status;
        } catch (error) {
          //console.log(Object.keys(error), error.message);
          console.log("axios error");
          createNewUseCaseTableInSmartApiResponse = error.response.status;
          console.log(error.response.status, error.response.data);
        }
      } else {
        console.log(
          "Create New Use Case Table: Use case '" +
          useCaseName +
          "' Table '" +
          tableName +
          "' already exists. So skipping ..."
        );
        createNewUseCaseTableInSmartApiResponse = 400;
      }
    } else {
      console.log("Smart Rest Api Authentication retrieval failed");
    }
  } catch (error) {
    console.error("createNewTableInUseCaseInSmart() Error : ".error);
  } finally {
    console.log("createNewUseCaseTableInSmartApiResponse");
    console.log(createNewUseCaseTableInSmartApiResponse);
    return createNewUseCaseTableInSmartApiResponse;
  }
}

// add the code below
module.exports = {
  createNewUseCaseInSmart,
  getPushedTransactionListFromSmartApi,
  createNewTableInUseCaseInSmart,
};
