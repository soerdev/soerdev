function rlog -d "Remote docker logs"
	set -l scope $argv[1]
	set -l scopes school nestdonate
	test -e $scope; and return
	if contains $scope $scopes
		ssh -t -p $SSH_PORT -l $SSH_USER $SSH_HOST 'docker logs '$scope
		return
	end
	if [ $scope = 'donate' ]
		ssh -t -p $SSH_PORT -l $SSH_USER $SSH_HOST 'docker logs nestdonate'
		return
	end
	echo 'Unknown scope "'$scope'" plese use one of the following: '(string join , $scopes)
end	
