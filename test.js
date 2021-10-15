const fs = require("fs")
const path = require("path")


/**
 * it gives a number as byte and convert it to KB, MB and GB (depends on file size) and return the result as string.
 * @param number file size in Byte
 */
 function ConvertSize(number)
 {
     if(number <= 1024) { return (`${number} Byte`); }
     else if(number > 1024 && number <= 1048576) { return ((number / 1024).toPrecision(3) + ' KB'); }
     else if(number > 1048576 && number <= 1073741824) { return ((number / 1048576).toPrecision(3) + ' MB'); }
     else if(number > 1073741824 && number <= 1099511627776) { return ((number / 1073741824).toPrecision(3) + ' GB'); }
 }


const getAllFiles = function(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)
  
    arrayOfFiles = arrayOfFiles || []
  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        fileNameWithFullPath = path.join(__dirname, dirPath, "/", file);
        fileStats = fs.statSync(fileNameWithFullPath);
        filesize = ConvertSize(fileStats.size);
        fileinfodict = {
            'fileNameWithFullPath': fileNameWithFullPath,
            'filesize':filesize,
            'fileCreatedTime':fileStats.ctime,
            'fileLastModified':fileStats.mtime,
        }
        arrayOfFiles.push(fileinfodict)
      }
    })
  
    return arrayOfFiles
  }

const getAllFilesListofArrays = function(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)
  
    arrayOfFiles = arrayOfFiles || []
  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFilesListofArrays(dirPath + "/" + file, arrayOfFiles)
      } else {
        fileNameWithFullPath = path.join(__dirname, dirPath, "/", file);
        fileStats = fs.statSync(fileNameWithFullPath);
        filesize = ConvertSize(fileStats.size);
        fileinfoArray = [
         fileNameWithFullPath,
         filesize,
         fileStats.ctime,
         fileStats.mtime,
        ];
        arrayOfFiles.push(fileinfoArray)
      }
    })
  
    return arrayOfFiles
  }


  const result = getAllFilesListofArrays("./chaincodes/hlft-store/hlft-store/hlfMSP/");
  console.log(result);