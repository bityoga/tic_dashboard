function logout() {
  $.ajax({
    type: "POST",
    url: "/logout",
    async: true,
    complete: function (data) {
      console.log(data);
      //$("#login_button").removeClass("w3-hide");
      // document.getElementById("welcome_user_span").style.display = "none";
      //document.getElementById("logout_button").style.display = "none";
      window.location.href = "/";
    },
  });
}

function get_session_details() {
  $.ajax({
    type: "POST",
    url: "/",
    async: true,
    complete: function (data) {
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      console.log(json);
      if (json["status"] === "session active") {
        $(".session_user_name").text(json["user_name"]);
        $(".user_id").text(json["smart_meter_id"]);
        $(".user_address").text(json["address"]);

        $(".user_wallet").text(json["wallet"]);
        $(".user_capacity").text(json["capacity"]);
      } else {
        $(".session_user_name").text("Session Expired");
      }
    },
  });
}

function update_select_drop_downs(select_id, data_array) {
  var select = document
    .getElementById("my_profile_iframe")
    .contentWindow.document.getElementById(select_id);
  console.log(select);
  // Optional: Clear all existing options first:
  select.innerHTML = "";
  var options = data_array;

  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }
}

function update_select_drop_downs_local(select_id, data_array) {
  var select = document.getElementById(select_id);
  console.log(select);
  // Optional: Clear all existing options first:
  select.innerHTML = "";
  var options = data_array;

  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }
}
function check_session() {
  $.ajax({
    type: "POST",
    url: "/",
    async: true,
    complete: function (data) {
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      console.log(json);
      if (json["status"] === "session active") {
        //document.getElementById("session_user_name").textContent=json['user_name'];
        //document.getElementById("welcome_user_span").style.display = "block";
        //document.getElementById("logout_button").style.display = "block";
        //document.getElementById('home').style.display = "block";

        //$("#session_user_name").text(json['user_name']);

        // console.log($('#my_profile').contents().find('div .session_user_name'));
        // $('#my_profile').contents().find('.session_user_name').html(json['user_name']);

        //$(".session_user_name").text(json['user_name']);

        $(".login_button").hide();
        $(".register_button").hide();

        $("#welcome_user_span").show();
        $(".logout_button").show();
        $(".notification_button").show();
        $(".buy_button").show();
        $(".query_button").show();
        $(".invoke_button").show();
        $(".my_profile_button").show();

        $("#login_check").hide();
        $("#register_check").hide();
        $("#buy").hide();
        $("#my_profile").show();
        console.log('json["assets"]');
        console.log(json["assets"]);
        if (json["assets"].length > 0) {
          update_select_drop_downs("Query_User_Name", json["assets"]);
          update_select_drop_downs("From_User_Name", json["assets"]);
          update_select_drop_downs("To_User_Name", json["assets"]);
          update_select_drop_downs_local("History_User_Name", json["assets"]);
        }
      } else {
        //document.getElementById("welcome_user_span").style.display = "none";
        //document.getElementById("logout_button").style.display = "none";

        $(".login_button").show();
        $(".register_button").show();

        $("#welcome_user_span").hide();
        $(".logout_button").hide();
        $(".notification_button").hide();
        $(".buy_button").hide();
        $(".query_button").hide();
        $(".invoke_button").hide();
        $(".my_profile_button").hide();

        $("#my_profile").hide();
        $("#register_check").hide();
        $("#buy").hide();

        $("#login_check").show();

        //document.getElementById('login_check').style.display = "block";
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
        //document.getElementById("session_user_name").textContent=json['user_name'];
        //$("#login_button").addClass("w3-hide");
        //document.getElementById("welcome_user_span").style.display = "block";
        //document.getElementById("logout_button").style.display = "block";
        //window.location.href = "/home_page.html";
        //document.getElementById('home').style.display = "block";
        console.log("session active");
        //             app_session.balance = user_assets_json['amount'];
        // app_session.address = user_assets_json['color'];
        // app_session.smart_meter_id = user_assets_json['owner'];
        // app_session.capacity = user_assets_json['size'];

        $(".session_user_name").text(json["user_name"]);
        //$(".session_user_name").text(json['wallet']);
        //$(".session_user_name").text(json['capacity']);
        $(".user_wallet").text(json["wallet"]);
        $(".user_capacity").text(json["capacity"]);
        console.log('json["assets"]');
        console.log(json["assets"]);
        var $dropdown = $("#Query_User_Name");
        if (json["assets"].length > 0) {
          $.each(json["assets"], function () {
            $dropdown.append($("<option />").val(this).text(this));
          });
        }
      } else {
        // document.getElementById("welcome_user_span").style.display = "none";
        //document.getElementById("logout_button").style.display = "none";
        // $("#login_button").removeClass("w3-hide");
        //document.getElementById('login_check').style.display = "block";
        window.location.href = "/";
      }
    },
  });
}

// this is the id of the form
$("#register_form").submit(function (e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  document.getElementById("register_loader").style.display = "block";
  // var user_name = document.getElementById("User_Name").value;
  // var user_password = document.getElementById("User_Password").value;
  // var smart_meter_id = document.getElementById("User_House_Number").value;
  var user_json = {
    User_Name: document.getElementById("User_Name").value,
    User_Password: document.getElementById("User_Password").value,
  };

  $.ajax({
    type: "POST",
    url: "/register",
    async: true,
    dataType: "json",
    data: user_json,
    complete: function (data) {
      //document.getElementById("register_loader").style.display = "none";
      console.log(data);
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      //swal.fire(json.status);
      swal.fire({
        title: "Registration Status",
        text: json.status,
        icon: "success",
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
      });
      if (json["status"] === "success") {
        //document.getElementById("register").style.display = "none";
        //window.location.href = "/login_check.html";
        create_user_asset_in_chaincode();
      }
    },
  });
});

function create_user_asset_in_chaincode() {
  // e.preventDefault(); // avoid to execute the actual submit of the form.

  // var form = $(this);
  var user_json = {
    User_Name: document.getElementById("User_Name").value,
    User_Password: document.getElementById("User_Password").value,
  };
  document.getElementById("register_loader").style.display = "block";
  $.ajax({
    type: "POST",
    url: "/create_user_asset",
    async: true,
    dataType: "json",
    data: user_json, // serializes the form's elements.
    complete: function (data) {
      document.getElementById("register_loader").style.display = "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      //swal.fire(json["status"]);
      console.log(json);
      window.location.href = "/login_check.html";
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
      //swal.fire(json["status"]);
      //swal.fire(json["status"]);

      swal.fire({
        title: "Registration Status",
        text: json["status"],
        icon: "success",
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
      });

      if (json["status"] === "success") {
        //console.log(document.getElementById('Login_User_Name').value);
        //$(parent.document).find("#session_user_name").text(document.getElementById("Login_User_Name").value);
        //$(parent.document).find("#welcome_user_span").show();
        //$(parent.document).find("#logout_button").show();
        window.top.location.href = "/";
      }
    },
  });
});

$("#sell_form").submit(function (e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  var form = $(this);
  document.getElementById("sell_loader").style.display = "block";
  $.ajax({
    type: "POST",
    url: "/sell",
    async: true,
    data: form.serialize(), // serializes the form's elements.
    complete: function (data) {
      document.getElementById("sell_loader").style.display = "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      //swal.fire(json["data"]);
      swal.fire({
        title: "<i>Transaction History</i>",
        html: json["data"],
        confirmButtonText: "<u>Ok</u>",
      });
    },
  });
});

$("#buy_form").submit(function (e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  var form = $(this);
  document.getElementById("buy_power_confirm_loader").style.display = "block";
  $.ajax({
    type: "POST",
    url: "/buy_confirm_invoke_chaincode",
    async: true,
    data: form.serialize(), // serializes the form's elements.
    complete: function (data) {
      document.getElementById("buy_confirm_invoke_chaincode").style.display =
        "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      swal.fire(json["status"]);
      if (json["status"] == "success") {
        //$(".session_user_name").text(json['user_name']);
        //$(".user_id").text(json['smart_meter_id']);
        //$(".user_address").text(json['address']);

        $(".user_wallet").text(json["user_balance"]);
        $(".user_capacity").text(json["user_capacity"]);

        document.getElementById("buy_power_confirm").style.display = "none";
      }
      //console.log(JSON.parse(json['data']));
    },
  });
});

$("#query_chain_code").submit(function (e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  var form = $(this);
  document.getElementById("query_chain_code_loader").style.display = "block";
  $.ajax({
    type: "POST",
    url: "/query_chain_code",
    async: true,
    data: form.serialize(), // serializes the form's elements.
    complete: function (data) {
      document.getElementById("query_chain_code_loader").style.display = "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      swal.fire({
        title: "<i>All assets</i>",
        html: json["data"],
        confirmButtonText: "<u>Ok</u>",
      });
      console.log(JSON.parse(json["data"]));
    },
  });
});

$("#get_user_balance").submit(function (e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  var form = $(this);
  document.getElementById("get_balance_loader").style.display = "block";
  $.ajax({
    type: "POST",
    url: "/get_user_balance",
    async: true,
    data: form.serialize(), // serializes the form's elements.
    complete: function (data) {
      document.getElementById("get_balance_loader").style.display = "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      //swal.fire(JSON.parse(json["data"]).Balance.toString());
      swal.fire({
        title: "tic_dashboard Balance",
        text: JSON.parse(json["data"]).Balance.toString(),
        icon: "success",
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
      });
      console.log(JSON.parse(json["data"]));
    },
  });
});

$("#transfer_amount").submit(function (e) {
  e.preventDefault(); // avoid to execute the actual submit of the form.

  var form = $(this);
  document.getElementById("transfer_loader").style.display = "block";
  $.ajax({
    type: "POST",
    url: "/transfer_amount",
    async: true,
    data: form.serialize(), // serializes the form's elements.
    complete: function (data) {
      document.getElementById("transfer_loader").style.display = "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      console.log(json);
      //swal.fire(JSON.parse(json["data"]).Balance.toString());
      swal.fire({
        title: "Transaction Status",
        text: json["status"].toString(),
        icon: "success",
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
      });
      console.log(json["status"]);
    },
  });
});

$("#ad_submit").click(function () {
  //swal.fire("cancel");
  document.getElementById("ad_loader").style.display = "block";
  var time = new Date();
  var user_json = {
    Posted_Timestamp: time.toString().slice(0, -41),
    tic_dashboard_To_Sell: document.getElementById("tic_dashboard_selling").value,
    Cost: document.getElementById("tic_dashboard_cost").value,
    Advertisement_text: document.getElementById("advertisement_text").value,
    Advertisement_text: document.getElementById("advertisement_text").value,
  };

  $.ajax({
    type: "POST",
    url: "/ad_submit",
    async: true,
    dataType: "json",
    data: user_json,
    complete: function (data) {
      document.getElementById("ad_loader").style.display = "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      swal.fire(json["status"]);
      if (json["status"] === "success") {
        //console.log(document.getElementById('Login_User_Name').value);
        //$(parent.document).find("#session_user_name").text(document.getElementById("Login_User_Name").value);
        //$(parent.document).find("#welcome_user_span").show();
        //$(parent.document).find("#logout_button").show();
        console.log(json["status"]);
        //get_advertisements();
        //document.getElementById('iframeID').contentWindow.location.reload();
        //parent.document.getElementById("buy").location.reload();
        //swal.fire(json["status"]);
        window.top.location.href = "/";
      }
    },
  });
});

function template_ad_content(json_data) {
  var user_image = json_data["User_Image"];
  var image_number = Math.floor(Math.random() * (+6 - +2)) + +2;
  var user_image = "/images/avatar" + String(image_number) + ".png";
  //var user_image = "/images/avatar2.png";
  //var user_image = "/images/anand.jpg";
  var user_name = json_data["User_Name"];
  var user_id = json_data["User_Id"];
  var cost = json_data["Cost"];
  var tic_dashboard_To_Sell = json_data["tic_dashboard_To_Sell"];
  var tic_dashboard_Sources = json_data["tic_dashboard_Source_Type"];
  tic_dashboard_Sources =
    '<span><label><i class="fas fa-sun"></i> Solar ,</label>&nbsp;&nbsp;<label><i class="fas fa-fan"></i> Wind</label></span>';
  var Capacity = json_data["User_Capacity"];
  var Likes_Count = json_data["Likes_Count"];
  var seller_rating = json_data["User_Profile_Rating"];
  var price_comparison = json_data["Cost"];
  var ad_text = json_data["Advertisement_Text"];
  var timestamp = json_data["Posted_Timestamp"];

  var add_content =
    ' <div class="w3-row w3-padding-24 w3-animate-bottom">' +
    '<div class="w3-twothird w3-container">' +
    '<div class="w3-container w3-card w3-white w3-round ad_content_div"><br>' +
    '<img src="' +
    user_image +
    '" alt="Avatar" class="w3-left w3-circle w3-margin-right" style="width:60px">' +
    '<span class="w3-right w3-opacity ad_time_stamp"><i class="far fa-clock" aria-hidden="true"></i> ' +
    timestamp +
    "</span>" +
    '<h4 class="ad_user_name">' +
    user_name +
    "</h4><br>" +
    '<div class="ad_user_id" style="display:none;">' +
    user_id +
    "</div>" +
    '<hr class="w3-clear">' +
    "<p>" +
    ad_text +
    "</p>" +
    '<div class="w3-row-padding " >' +
    '<div class="w3-quarter w3-center w3-right">' +
    "<p >" +
    '<span class="w3-text-dark-gray"><i class="fas fa-coins" aria-hidden="true"></i> Price (tic_dashboard Tokens)</span><br>' +
    '<span class="ad_cost">' +
    cost +
    "</span> / kwh" +
    "</p>" +
    "</div>" +
    '<div class="w3-quarter w3-center w3-right ">' +
    "<p >" +
    '<span class="w3-text-dark-gray"><i class="fas fa-battery-half" aria-hidden="true"></i> Selling</span><br>' +
    '<span class="ad_tic_dashboard_to_sell">' +
    tic_dashboard_To_Sell +
    " kwh</span>" +
    "</p>" +
    "</div>" +
    '<div class="w3-quarter w3-center w3-right ">' +
    "<p >" +
    '<span class="w3-text-dark-gray"><i class="fas fa-charging-station" aria-hidden="true"></i> Source(s)</span><br>' +
    '<span class="ad_tic_dashboard_sources">' +
    tic_dashboard_Sources +
    " </span>" +
    "</p>" +
    "</div>" +
    '<div class="w3-quarter w3-center w3-right w3-hide-small w3-hide-medium">' +
    "<p >" +
    '<span class="w3-text-dark-gray"><i class="fas fa-battery-full" aria-hidden="true"></i> Battery Capacity</span><br>' +
    '<span class="ad_capacity">' +
    Capacity +
    " kwh  </span>" +
    "</p>" +
    "</div>" +
    '</div><hr class="w3-clear">' +
    '<button type="button" class="w3-button w3-theme-d1 w3-margin-bottom"><i class="fa fa-thumbs-up"></i>  Like <span>' +
    Likes_Count +
    "</span></button> " +
    '<!-- <button type="button" class="w3-button w3-theme-d2 w3-margin-bottom"><i class="fa fa-comment"></i>  Comment <span>16</span></button> -->' +
    '<button  type="button" onclick="buy_button_clicked.call(this)" class="buy_tic_dashboard_button w3-button w3-theme-d2 w3-margin-bottom w3-right w3-teal w3-hover-opacity"><i class="fa fa-shopping-cart"></i> Buy</button>' +
    "</div>" +
    "</div>" +
    '<div class="w3-third w3-container w3-hide-small " style="margin-top: 25px;">' +
    '<p class="w3-card w3-padding-large w3-padding-32 w3-center w3-animate-right">' +
    '<img src="/images/profile_rating_icon.png" aria-hidden="true" alt="Avatar" class="w3-left w3-circle w3-margin-right" style="width:60px">' +
    '<span class="w3-text-dark-gray"><i class="fas fa-star-half-alt" aria-hidden="true"></i> Seller Rating</span><br>' +
    '<span class="ad_seller_rating">' +
    seller_rating +
    '%  <i class="far fa-heart" aria-hidden="true"></i></span>' +
    "</p>" +
    '<p class="w3-card w3-padding-large w3-padding-32 w3-center w3-animate-left">' +
    '<i class="fas fa-chart-line w3-xxxlarge w3-circle w3-left" aria-hidden="true"></i>' +
    '<span class="w3-text-dark-gray"> Price Meter </span><br>' +
    '<span class="ad_price_comparison">' +
    price_comparison +
    '% <i class="far fa-arrow-alt-circle-down" aria-hidden="true"></i> </span>' +
    "</p>" +
    "</div>" +
    "</div>";
  return add_content;
}

function get_advertisements() {
  $.ajax({
    type: "POST",
    url: "/buy_ad_loader",
    async: true,
    dataType: "json",
    //data : user_json,
    complete: function (data) {
      //document.getElementById("buy_ad_loader").style.display = "none";
      var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
      //swal.fire(json['status']);
      if (json["status"] === "success") {
        //console.log(document.getElementById('Login_User_Name').value);
        //$(parent.document).find("#session_user_name").text(document.getElementById("Login_User_Name").value);
        //$(parent.document).find("#welcome_user_span").show();
        //$(parent.document).find("#logout_button").show();
        //window.top.location.href = "/";
        console.log(json["data"]);

        var joined_ad_content = "";
        for (i = 0; i < json["data"].length; i++) {
          //$(".add_container").prepend(template_ad_content(json["data"][i]));
          joined_ad_content =
            joined_ad_content + template_ad_content(json["data"][i]);
        }
        $(joined_ad_content).prependTo("#adv_container");
      }
    },
  });
}

$("#upload_next_button").click(function () {
  alert("hifi");
  // var smartContractChoosenFile = document.getElementById(
  //   "smart-contract-file-chosen"
  // );

  var file_data = $("#smart-contract-file-chosen").prop("files")[0]; // Getting the properties of file from file field
  console.log(file_data);
  var form_data = new FormData(); // Creating object of FormData class
  form_data.append("file", file_data); // Appending parameter named file with properties of file_field to form_dat
  console.log(form_data);

  // $.ajax({
  //   type: "POST",
  //   url: "/upload_smart_contract",
  //   async: true,
  //   dataType: "json",
  //   data: user_json,
  //   complete: function (data) {
  //     document.getElementById("ad_loader").style.display = "none";
  //     var json = JSON.parse(data.responseText.replace(/\bNaN\b/g, "null"));
  //     swal.fire(json["status"]);
  //     if (json["status"] === "success") {
  //       //console.log(document.getElementById('Login_User_Name').value);
  //       //$(parent.document).find("#session_user_name").text(document.getElementById("Login_User_Name").value);
  //       //$(parent.document).find("#welcome_user_span").show();
  //       //$(parent.document).find("#logout_button").show();
  //       console.log(json["status"]);
  //       //get_advertisements();
  //       //document.getElementById('iframeID').contentWindow.location.reload();
  //       //parent.document.getElementById("buy").location.reload();
  //       //swal.fire(json["status"]);
  //       window.top.location.href = "/";
  //     }
  //   },
  // });
});
