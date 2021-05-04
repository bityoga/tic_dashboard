var fs = require('fs').promises;




async function load_certificates_from_wallet(user_name) {
    let certificates_json = {};
    let cert_path = './wallet/'+user_name+'/'; 
    try {
            //get all filenames under a directory
            var file_list = await fs.readdir(cert_path);
            console.log(file_list);
            for (index = 0; index < file_list.length; index++) { 
                console.log(file_list[index]);
                if (file_list[index].includes('-priv')) {
                    let full_file_path = cert_path + file_list[index];
                    //read file contents to a string
                    certificates_json['User_Private_Key'] = await fs.readFile(full_file_path, "utf8");
                }
                if (file_list[index].includes('-pub')) {
                    let full_file_path = cert_path + file_list[index];
                    //read file contents to a string
                    certificates_json['User_Public_Key'] = await fs.readFile(full_file_path, "utf8");
                }
            
                if (file_list[index].includes(user_name)) {
                    let full_file_path = cert_path + file_list[index];
                    //read file contents to a string
                    certificates_json['User_Enrollment_Certificate'] = await fs.readFile(full_file_path, "utf8");
                }
                
            }
        }
    catch(e) {
        console.log(e);
    }

    finally {
        return certificates_json;
    } 
}

async function checkDirectorySync(directory) {  
    try {
    await fs.stat(directory);
    } catch(e) {
      await fs.mkdir(directory);
    }
  }

async function write_certificates_from_db_to_wallet(db_user_info,enrollment_signingIdentity) {
    let write_status;
    let user_name = db_user_info['User_Name'];
    let cert_path = './wallet/'+user_name+'/'; 
    try {
        //get all filenames under a directory
        await checkDirectorySync(cert_path);
        var file_list = await fs.readdir(cert_path);
        if(file_list.length==0){
            console.log(db_user_info["User_Private_Key"]);
            await fs.writeFile(cert_path+enrollment_signingIdentity+"-priv", db_user_info["User_Private_Key"]); 
            await fs.writeFile(cert_path+enrollment_signingIdentity+"-pub", db_user_info["User_Public_Key"]); 
            await fs.writeFile(cert_path+user_name, db_user_info["User_Enrollment_Certificate"]);
            write_status = "success";
        }
        else {
            write_status = "success";
        }
        
    }
    catch(e) {
        write_status = e;
    }
    finally {
        return write_status;
    }

}






// async function check_file_load_to_wallet(user_name) {
//     let load_status = await write_certificates_from_db_to_wallet(user_name);
//     console.log(load_status);
// }
// let user_info = {};
// user_info["User_Name"] = "ark";
// user_info["User_Password"] = "ark";
// check_file_load_to_wallet(user_info);


// async function check_file_load_to_db(user_name) {
//     let load_status = await load_certificates_from_wallet(user_name);
//     console.log(load_status);
// }

// await check_file_load_to_db('ark');


module.exports = { 
    load_certificates_from_wallet : load_certificates_from_wallet,
    write_certificates_from_db_to_wallet : write_certificates_from_db_to_wallet
};