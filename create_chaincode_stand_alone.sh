#!/bin/bash
set -x #echo on
CHAINCODE_NAME="$1" #"smart-meter"
CHAINCODE_CLASS_NAME="$2" #"SmartMeterChaincode"
CREATE_DIRECTORY="$3"
platform='unknown'

rm -rf $CHAINCODE_NAME
git clone https://github.com/bityoga/fabric_chaincode_template.git $CREATE_DIRECTORY/$CHAINCODE_NAME

unamestr=$(uname)
if [ "$unamestr" = 'Linux' ]; then
   platform='linux'
elif [ "$unamestr" = 'FreeBSD' ]; then
   platform='freebsd'
fi

if [ "$platform" = 'linux' ]; then

   find $CREATE_DIRECTORY/$CHAINCODE_NAME/chaincode/src/lib/META-INF/statedb/couchdb/indexes/AssetUtil.json -type f -exec sed -i "s/AssetUtil/$CHAINCODE_CLASS_NAME/g" {} \; && 
   find $CREATE_DIRECTORY/$CHAINCODE_NAME/chaincode/ -type f -exec sed -i "s/CHAINCODE-NAME/$CHAINCODE_NAME/g" {} \; && 
   find $CREATE_DIRECTORY/$CHAINCODE_NAME/chaincode/ -type f -exec sed -i "s/CHAINCODE_CLASS_NAME/$CHAINCODE_CLASS_NAME/g" {} \;

elif [ "$platform" = 'freebsd' ]; then
  find $CREATE_DIRECTORY/$CHAINCODE_NAME/chaincode/src/lib/META-INF/statedb/couchdb/indexes/AssetUtil.json -type f -exec sed -i '.bak' "s/AssetUtil/$CHAINCODE_CLASS_NAME/g" {} \;&& 
  find $CREATE_DIRECTORY/$CHAINCODE_NAME/chaincode/ -type f -exec sed -i '.bak' "s/CHAINCODE-NAME/$CHAINCODE_NAME/g" {} \;&&
  find $CREATE_DIRECTORY/$CHAINCODE_NAME/chaincode/ -type f -exec sed -i '.bak' "s/CHAINCODE_CLASS_NAME/$CHAINCODE_CLASS_NAME/g" {} \;

fi

mv $CREATE_DIRECTORY/$CHAINCODE_NAME/chaincode/src/lib/META-INF/statedb/couchdb/indexes/AssetUtil.json $CREATE_DIRECTORY/$CHAINCODE_NAME/chaincode/src/lib/META-INF/statedb/couchdb/indexes/index$CHAINCODE_CLASS_NAME.json 
rm $CREATE_DIRECTORY/$CHAINCODE_NAME/create_chaincode.sh
rm $CREATE_DIRECTORY/$CHAINCODE_NAME/create_chaincode_stand_alone.sh
rm $CREATE_DIRECTORY/$CHAINCODE_NAME/.gitignore
rm $CREATE_DIRECTORY/$CHAINCODE_NAME/LICENSE
rm $CREATE_DIRECTORY/$CHAINCODE_NAME/README.md
rm -rf $CREATE_DIRECTORY/$CHAINCODE_NAME/.git
