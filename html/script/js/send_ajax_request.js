function check_session() {
  $.ajax({
    type: "POST",
    url: "/",
    async: true,
    complete: function (data) {
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      console.log(json);
      if (json["status"] === "session active") {
        $(".login_button").hide();
        $(".session_active_menu_bar_item").show();
        $("#chaincode_management_div").show();
        $("#login_check").hide();
        sendAjaxReqToGetListOfCertificateFiles();
      } else {
        $(".login_button").show();
        $(".session_active_menu_bar_item").hide();
        $("#chaincode_management_div").hide();
        $("#login_check").show();
      }
    },
  });
}

function check_iframe_session() {
  $.ajax({
    type: "POST",
    url: "/",
    async: true,
    complete: function (data) {
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      console.log(json);
      if (json["status"] === "session active") {
        console.log("iframe session active");
      } else {
        window.location.href = "/";
      }
    },
  });
}

$("#login_form").submit(function (e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  document.getElementById("login_loader").style.display = "block";

  var user_json = {
    Login_User_Name: document.getElementById("Login_User_Name").value,
    Login_Password: document.getElementById("Login_Password").value,
  };

  $.ajax({
    type: "POST",
    url: "/login",
    async: true,
    dataType: "json",
    data: user_json,
    complete: function (data) {
      document.getElementById("login_loader").style.display = "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      if (json["status"] === "success") {
        swal.fire({
          title: "Login Status",
          text: json["status"],
          icon: "success",
          confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
        });
        window.top.location.href = "/";
      }
      else {
        swal.fire({
          title: "Login Status",
          text: json["status"],
          icon: "fail",
          confirmButtonText: '<i class="fa fa-thumbs-down"></i> Login Failed',
        });
      }
    },
  });
});

function logout() {
  $.ajax({
    type: "POST",
    url: "/logout",
    async: true,
    complete: function (data) {
      console.log(data);
      window.location.href = "/";
    },
  });
}

function sendAjaxReqToGetListOfCertificateFiles() {
  $.ajax({
    type: "POST",
    url: "/getCertificateFileList",
    async: true,
    complete: function (data) {
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      console.log(json);
      if (json["status"] === "success") {
        $("#certificates_datatable").DataTable({
          data: json["data"],
          responsive: true,
          pageLength: 5,
          columns: [
            { title: "File Name" },
            { title: "Size" },
            { title: "Created" },
            { title: "Last Modified" },
            { title: "Download" },
            { title: "View" },
          ],
        });
      }
    },
  });
}



function sendAjaxRequestToReadAndShowFileConents(buttonObject) {
  var fileName = buttonObject.getAttribute("data-link");

  document.getElementById("index_login_loader").style.display = "block";

  var request_json = {
    fileName: fileName
  };

  $.ajax({
    type: "POST",
    url: "/viewFileContent",
    async: true,
    dataType: "json",
    data: request_json,
    complete: function (data) {
      document.getElementById("index_login_loader").style.display = "none";
      //console.log(JSON.parse(data.responseText));
      //var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      var json = JSON.parse(data.responseText);
      if (json["status"] === "success") {
        swal.fire({
          title: "File Contents : " + fileName,
          width: '45vw',
          showCloseButton: true,
          html: '<div class="codeBlock" style="max-height:40vh; overflow-y:scroll; text-align:initial"><pre><code id="fileContent">' + json["data"] + '</code></pre></div>',
          icon: "success",
          showCancelButton: true,
          buttons: {
            confirm: {
              //text: "OK",
              value: true,
              visible: true,
              className: "",
              closeModal: false
            },
            cancel: {
              //text: "Cancel",
              value: false,
              visible: true,
              className: "",
              closeModal: true,
            }
          },
          confirmButtonText: '<i class="fa fa-file"></i> Copy to Clipboard !',
          cancelButtonText: '<i class="fa fa-close"></i> Close',
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            var copyText = document.getElementById("fileContent");
            //copyText.select();
            //copyText.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(copyText.textContent);

            Swal.fire('Copied to Clipboard!', '', 'success')
          }
        });

        hljs.highlightAll();
        // apply HighlightJS
        var pres = document.querySelectorAll("pre>code");
        for (var i = 0; i < pres.length; i++) {
          hljs.highlightBlock(pres[i]);
        }

        // add HighlightJS-badge (options are optional)
        var options = {   // optional
          contentSelector: ".codeBlock",

          // CSS class(es) used to render the copy icon.
          copyIconClass: "fas fa-copy",
          // CSS class(es) used to render the done icon.
          checkIconClass: "fas fa-check text-success"
        };
        window.highlightJsBadge(options);

      }
      else {
        swal.fire({
          title: "File Read : " + fileName,
          text: json["status"],
          icon: "error",
          confirmButtonText: '<i class="fa fa-thumbs-down"></i> File Read Failed',
        });
      }
    },
  });
}



$("#createChaincodeForm").submit(function (e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  $('.overlay').show();

  var user_json = {
    chaincodeNameInput: document.getElementById("chaincodeNameInput").value,
    chaincodeClassNameInput: document.getElementById("chaincodeClassNameInput").value,
    /* downloadZip : document.getElementById("downloadZip").value, */
  };

  console.log(user_json);

  $.ajax({
    type: "POST",
    url: "/createChaincode",
    async: true,
    dataType: "json",
    data: user_json,
    complete: function (data) {
      $('.overlay').hide();
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      console.log(json);
      if (json["status"] === "success") {
        swal.fire({
          title: "Create Chaincode Status",
          text: json["status"],
          icon: "success",
          confirmButtonText: '<i class="fa fa-thumbs-up"></i> Chaincode Created Successfully!',
        });
      }
      else {
        swal.fire({
          title: "Create Chaincode Status",
          text: json["status"],
          icon: "fail",
          confirmButtonText: '<i class="fa fa-thumbs-down"></i> Chaincode Creation Failed',
        });
      }
    },
  });
});