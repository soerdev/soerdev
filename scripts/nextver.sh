#!/usr/bin/bash

# show version  's/[\",]//g'
echo $(npx standard-version --dry-run | grep release | awk '{ print $4 }' | sed 's/[\"v]//g' | tr -d '[[:space:]]')
