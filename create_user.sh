#!/bin/bash

read -p "Enter username: " username
read -s -p "Enter password: " password
echo

payload=$(printf '{"name": "%s", "pass": "%s"}' "$username" "$password")

curl -X POST \
  http://localhost:19851/auth/register \
  -H 'Content-Type: application/json' \
  -d "$payload"

