function ver
 if test -e package.json
   cat package.json | grep "\"version\"" | awk '{print $2}' | string replace -r -a '[^\d.\n]+' ''
  end
end
