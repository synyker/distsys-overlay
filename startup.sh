# Distributed Systems Project, Spring 2015
# Jonne Airaksinen, 013932592

folder=$(pwd)

ssh ukko182.hpc.cs.helsinki.fi "cd $folder && node overlay-controller.js" & 
#node overlay-controller.js &

for i in {1..64}
do
	ssh ukko183.hpc.cs.helsinki.fi "cd $folder && node overlay-node.js $i" & 
	#node overlay-node.js $i &
done
