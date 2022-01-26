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
    const smartAuthenticationToken = await getSmartApiAuthenticationToken();
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
          createNewUseCaseInSmartApiResponse = axiosResponse.status;
        } catch (error) {
          //console.log(Object.keys(error), error.message);
          console.log("axios error");
          createNewUseCaseInSmartApiResponse = error.response.status;
          console.log(error.response.status, error.response.data);
        }
      } else {
        console.log(
          "Create New Use: Use case '" +
            useCaseName +
            "' already exists. So skipping ..."
        );
        createNewUseCaseInSmartApiResponse = 400;
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
