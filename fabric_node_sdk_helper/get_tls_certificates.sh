#!/bin/bash
set -x #echo on

IP_ADDRESS="104.248.203.116"
REMOTE_MACHINE_ORDERER_TLS_CERT_FILE="/root/hlft-store/orgca/orderer/msp/tls/ca.crt"
REMOTE_MACHINE_PEER2_TLS_CERT_FILE="/root/hlft-store/orgca/peer2/msp/tls/ca.crt"
LOCAL_ORDER_TLS_CERT_FILE="./hlft-store/orderer/tls-msp/tlscacerts/ca.crt"
LOCAL_ORDER_PEER2_CERT_FILE="./hlft-store/peer2/tls-msp/tlscacerts/ca.crt"

scp -r root@$IP_ADDRESS:$REMOTE_MACHINE_ORDERER_TLS_CERT_FILE $LOCAL_ORDER_TLS_CERT_FILE &&
scp -r root@$IP_ADDRESS:$REMOTE_MACHINE_PEER2_TLS_CERT_FILE $LOCAL_ORDER_PEER2_CERT_FILE