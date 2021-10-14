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
        $("#login_check").hide();
        $("#chaincode_management").show();

        console.log('json["assets"]');
        console.log(json["assets"]);
      } else {
        $(".login_button").show();
        $("#chaincode_management").hide();
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
        console.log("session active");

        $(".session_user_name").text(json["user_name"]);

        console.log('json["assets"]');
        console.log(json["assets"]);
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

      swal.fire({
        title: "Login Status",
        text: json["status"],
        icon: "success",
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
      });

      if (json["status"] === "success") {
        window.top.location.href = "/";
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
