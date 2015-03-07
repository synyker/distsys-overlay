# Distributed Systems Project, Spring 2015
# Jonne Airaksinen, 013932592

folder=$(pwd)
baseip=".hpc.cs.helsinki.fi"
linecounter=1
char="p"

ssh ukko182.hpc.cs.helsinki.fi "cd $folder && node overlay-controller.js" & 
#node overlay-controller.js &

for i in {1..1024}
do	

	host=$(sed -n "$linecounter$char" < ukkonodes)

	ssh $node$baseip "cd $folder && node overlay-node.js $i" & 
	#node overlay-node.js $i &

	if (( $i % 32 == 0 ))
	then
		linecounter=$[$linecounter+1]
	fi
done
