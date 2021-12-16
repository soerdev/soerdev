function branch
 echo (command git symbolic-ref HEAD 2> /dev/null | sed -e 's|^refs/heads/||')
end
