#!/usr/bin/bash


# Show next version of project
echo $(npx standard-version --dry-run | grep "release v" | awk '{ print $4 }' | sed 's/[\"v]//g' | tr -d '[[:space:]]')
