function nextver 
 test -z (branch); and return
 standard-version --dry-run | grep release | awk '{print $4}' | string replace -r -a '[^\d.]+' ''
end
