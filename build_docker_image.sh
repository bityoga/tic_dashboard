#!/bin/bash
set -x #echo on
docker build --tag tic-dashboard-app . &&
docker image prune --filter label=stage=tic-dashboard-app-stage1-docker-builder --force &&
docker image prune --filter label=stage=tic-dashboard-app-stage2-docker-builder --force &&
docker image rm mhart/alpine-node:12 --force &&
docker image rm mhart/alpine-node:slim-12 --force
