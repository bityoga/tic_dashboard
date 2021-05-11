var express = require("express");
//const sqlite3 = require('sqlite3').verbose();

let db_name = "tic_dashboard.sqlite";
const sqlite3_async = require("sqlite-async");

var fs = require("fs").promises;
const { write_certificates_from_db_to_wallet } = require("./fileread");
//let table_name = "User";

// let json = {
//     "User_Id":	"2",
// 	"User_Name":	"1",
// 	"User_Password":	"1",
// 	"User_Enrollment_Certificate":	"1",
// 	"User_Public_Key":	"1",
// 	"User_Private_Key":	"1",
// 	"User_Image":	"1",
// 	"User_House_Number":	"1",
// 	"User_Address":	"1",
// 	"User_Geo_Location":	"1",
// 	"User_Asset_Balance":	0,
// 	"Available_tic_dashboard_Sources":	"1",
// 	"Accumulated_Generated_Power": 0,
// 	"Accumulated_Consumed_Power":	0,
// 	"Smart_Meter_Reading_Updated_Timestamp":	"1",
// 	"User_Profile_Rating":	0,
// 	"Sell_Count":	0,
// 	"Buy_Count"	:0,
// 	"Profile_Updated_Timestamp":"1"
//     };

async function sqlite_json_insert(json_dict, table_name) {
  let insert_status;
  try {
    table_keys = Object.keys(json_dict).join(", ");
    table_values = Object.values(json_dict).join("','");
    let sql =
      "INSERT INTO " +
      table_name +
      "(" +
      table_keys +
      ") VALUES ('" +
      table_values +
      "')";
    console.log(sql);

    // open the database connection
    let db_con = await sqlite3_async.open(db_name);
    insert_status = await db_con.run(sql);
    if ("changes" in insert_status) {
      if (insert_status["changes"] > 0) {
        insert_status = "success";
      }
    }
    await db_con.close();
  } catch (e) {
    insert_status = e;
  } finally {
    return insert_status;
  }
}

// const {load_certificates_from_wallet} = require('./fileread');
// async function check_insert(){
//     let html_json_data = {
//         "User_Name" : "ark",
//         "user_Password": "ark",
//         "User_House_Number" : "4A"
//     }
//     let user_certificates_json = await load_certificates_from_wallet(html_json_data["User_Name"]);
//     let combined_user_data = {...html_json_data,...user_certificates_json};
//     let insert_status = await sqlite_json_insert(combined_user_data,"User");
//     console.log(insert_status);
// }
//  check_insert();

async function check_login_and_load_certificates(user_name, user_password) {
  let login_status = {};
  login_status["status"] = "";

  try {
    console.log("1");
    let db_con = await sqlite3_async.open(db_name);
    let let_sql_query =
      'SELECT * FROM User where User.User_Name = "' + user_name + '" ;';
    console.log(let_sql_query);
    const result = await db_con.all(let_sql_query);
    await db_con.close();
    console.log(result.length);
    console.log("2");
    if (result.length > 0) {
      let user_info = result[0];
      login_status["User_Id"] = user_info["User_Id"];
      if (user_info["User_Password"] === user_password) {
        let enrollment_json = JSON.parse(
          user_info["User_Enrollment_Certificate"]
        );
        let enrollment_signingIdentity =
          enrollment_json["enrollment"]["signingIdentity"];
        console.log(
          "enrollment_signingIdentity = " + enrollment_signingIdentity
        );
        console.log("3");
        //console.log(user_info);
        write_status = await write_certificates_from_db_to_wallet(
          user_info,
          enrollment_signingIdentity
        );
        console.log(write_status);
        login_status["status"] = write_status;

        console.log("4");
      } else {
        login_status["status"] = "Password is wrong";
      }
    } else {
      login_status["status"] = "Account does not exist - Please register";
    }
  } catch (e) {
    console.log(e);
    login_status["status"] = e;
  } finally {
    console.log("5");
    return login_status;
  }
}
// async function check_login(){
// let login_status = await check_login_and_load_certificates("ark","ark");
// console.log(login_status);
// }
// check_login();

async function db_query(let_sql_query) {
  let status;
  try {
    console.log("1");
    let db_con = await sqlite3_async.open(db_name);
    //let let_sql_query = 'SELECT * FROM '+table_name+';';
    console.log(let_sql_query);
    const result = await db_con.all(let_sql_query);
    await db_con.close();
    console.log(result.length);
    console.log("2");
    status = result;
  } catch (e) {
    console.log(e);
    status = e;
  } finally {
    console.log("5");
    return status;
  }
}

module.exports = {
  sqlite_json_insert: sqlite_json_insert,
  check_login_and_load_certificates: check_login_and_load_certificates,
  db_query: db_query,
};
