#!/bin/bash

# Make sure you're running from sudo bash
# Sourced from https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

echo "Make sure you're running this script from sudo bash!"

echo "Setting up MongoDB repo..."

apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list
apt-get update

echo "Installing MongoDB..."

apt-get install -y mongodb-org
