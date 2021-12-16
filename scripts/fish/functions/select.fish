function select -d "select data from sqlite bases on web server"
        set -l host_db $argv[1]
        set -l host_query $argv[2]
        test -e $host_db; and return
        test -e $host_query; and return

	set -l output (ssh -t -p $SSH_PORT -l $SSH_USER $SSH_HOST 'sqlite3 ~/utils/data/'$host_db'/db.sqlite "select '$host_query'"')
	
	if contains -- --json $argv
		for json in $output
		  echo $json | jq --color-output
		end
	else
		for line in $output 
	  	  echo $line
		end
	end
end
