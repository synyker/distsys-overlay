# Distributed Systems Project, Spring 2015
# Jonne Airaksinen, 013932592

# A helper script, used for killing the user's running processes on the 
# nodes specified in the ukkonodes files.

i=1
length=$(cat ukkonodes|wc -l)
char="p"
baseip=".hpc.cs.helsinki.fi"
user=$(whoami)

while [ $i -le $length ]; do
        node=$(sed -n "$i$char" < ukkonodes)
        ssh $node$baseip "killall -u $user"
        i=$[$i+1]
done
