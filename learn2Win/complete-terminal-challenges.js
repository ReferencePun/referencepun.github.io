// Complete Terminal Challenge Database for SysAdmin Empire
// Replace the basic TERMINAL_CHALLENGES with this comprehensive version

const TERMINAL_CHALLENGES = {
    'file-operations': [
        // Basic navigation
        {
            question: "Show your current directory location",
            answer: "pwd",
            hint: "Print working directory"
        },
        {
            question: "List all files in the current directory",
            answer: "ls",
            hint: "The basic list command"
        },
        {
            question: "List all files including hidden ones",
            answer: "ls -a",
            hint: "Use the -a flag",
            alternatives: ["ls --all"]
        },
        {
            question: "List files with detailed information (permissions, size, date)",
            answer: "ls -l",
            hint: "Use the long format flag",
            alternatives: ["ls --long"]
        },
        {
            question: "List all files with details, including hidden files",
            answer: "ls -la",
            hint: "Combine the -l and -a flags",
            alternatives: ["ls -al", "ls -l -a", "ls -a -l"]
        },
        
        // Directory navigation
        {
            question: "Change to your home directory",
            answer: "cd ~",
            hint: "Use the tilde symbol",
            alternatives: ["cd", "cd $HOME"]
        },
        {
            question: "Go up one directory level",
            answer: "cd ..",
            hint: "Two dots mean parent directory"
        },
        {
            question: "Change to the /tmp directory",
            answer: "cd /tmp",
            hint: "Use the absolute path starting with /"
        },
        {
            question: "Return to the previous directory you were in",
            answer: "cd -",
            hint: "Use the dash/minus symbol"
        },
        
        // File creation and manipulation
        {
            question: "Create an empty file named 'notes.txt'",
            answer: "touch notes.txt",
            hint: "Use the touch command"
        },
        {
            question: "Create a new directory called 'projects'",
            answer: "mkdir projects",
            hint: "Make directory command"
        },
        {
            question: "Create nested directories 'work/reports/2024' in one command",
            answer: "mkdir -p work/reports/2024",
            hint: "Use the -p flag for parent directories"
        },
        {
            question: "Copy file.txt to backup.txt",
            answer: "cp file.txt backup.txt",
            hint: "Use cp source destination"
        },
        {
            question: "Copy the entire 'docs' directory to 'docs-backup'",
            answer: "cp -r docs docs-backup",
            hint: "Use -r for recursive copy",
            alternatives: ["cp -R docs docs-backup"]
        },
        {
            question: "Move report.txt to the Documents directory",
            answer: "mv report.txt Documents/",
            hint: "Use mv source destination",
            alternatives: ["mv report.txt Documents"]
        },
        {
            question: "Rename oldfile.txt to newfile.txt",
            answer: "mv oldfile.txt newfile.txt",
            hint: "mv is used for renaming too"
        },
        {
            question: "Delete the file temp.txt",
            answer: "rm temp.txt",
            hint: "Use the remove command"
        },
        {
            question: "Remove an empty directory called 'old'",
            answer: "rmdir old",
            hint: "Remove directory command",
            alternatives: ["rm -d old"]
        },
        {
            question: "Delete a directory 'logs' and all its contents",
            answer: "rm -r logs",
            hint: "Use -r for recursive removal",
            alternatives: ["rm -rf logs", "rm -R logs"]
        },
        
        // Viewing files
        {
            question: "Display the contents of config.txt",
            answer: "cat config.txt",
            hint: "Use the concatenate command"
        },
        {
            question: "Show the first 10 lines of log.txt",
            answer: "head log.txt",
            hint: "Use the head command",
            alternatives: ["head -n 10 log.txt"]
        },
        {
            question: "Display the last 20 lines of system.log",
            answer: "tail -n 20 system.log",
            hint: "Use tail with -n flag",
            alternatives: ["tail -20 system.log"]
        },
        {
            question: "View large.txt page by page",
            answer: "less large.txt",
            hint: "Use the pager command",
            alternatives: ["more large.txt"]
        },
        
        // Finding files
        {
            question: "Find all .txt files in the current directory and subdirectories",
            answer: "find . -name '*.txt'",
            hint: "Use find with -name pattern",
            alternatives: ["find . -name \"*.txt\""]
        },
        {
            question: "Search for a file named 'config.conf' starting from root",
            answer: "find / -name config.conf",
            hint: "Use find with the starting path and -name"
        }
    ],
    
    'archives': [
        // Creating archives
        {
            question: "Create a tar archive named backup.tar containing the 'data' directory",
            answer: "tar -cf backup.tar data",
            hint: "Use -c to create, -f for filename",
            alternatives: ["tar cf backup.tar data"]
        },
        {
            question: "Create a compressed tar.gz archive of the 'project' folder",
            answer: "tar -czf project.tar.gz project",
            hint: "Add -z for gzip compression",
            alternatives: ["tar czf project.tar.gz project", "tar -zcf project.tar.gz project"]
        },
        {
            question: "Create a tar.bz2 archive of multiple files: file1 file2 file3",
            answer: "tar -cjf files.tar.bz2 file1 file2 file3",
            hint: "Use -j for bzip2 compression",
            alternatives: ["tar cjf files.tar.bz2 file1 file2 file3"]
        },
        
        // Viewing archive contents
        {
            question: "List the contents of archive.tar without extracting",
            answer: "tar -tf archive.tar",
            hint: "Use -t to list contents",
            alternatives: ["tar tf archive.tar"]
        },
        {
            question: "View what's inside compressed backup.tar.gz",
            answer: "tar -tzf backup.tar.gz",
            hint: "Add -z for gzipped archives",
            alternatives: ["tar tzf backup.tar.gz", "tar -ztf backup.tar.gz"]
        },
        
        // Extracting archives
        {
            question: "Extract the contents of data.tar",
            answer: "tar -xf data.tar",
            hint: "Use -x to extract",
            alternatives: ["tar xf data.tar"]
        },
        {
            question: "Extract project.tar.gz to the current directory",
            answer: "tar -xzf project.tar.gz",
            hint: "Add -z for gzip",
            alternatives: ["tar xzf project.tar.gz", "tar -zxf project.tar.gz"]
        },
        {
            question: "Extract archive.tar.bz2",
            answer: "tar -xjf archive.tar.bz2",
            hint: "Use -j for bzip2",
            alternatives: ["tar xjf archive.tar.bz2"]
        },
        {
            question: "Extract backup.tar to a specific directory /tmp/restore",
            answer: "tar -xf backup.tar -C /tmp/restore",
            hint: "Use -C to change directory",
            alternatives: ["tar xf backup.tar -C /tmp/restore"]
        },
        
        // Individual compression
        {
            question: "Compress largefile.log using gzip",
            answer: "gzip largefile.log",
            hint: "This replaces the original file"
        },
        {
            question: "Decompress data.gz",
            answer: "gunzip data.gz",
            hint: "Use gunzip or gzip -d",
            alternatives: ["gzip -d data.gz"]
        },
        {
            question: "Compress report.txt using bzip2",
            answer: "bzip2 report.txt",
            hint: "Creates report.txt.bz2"
        },
        {
            question: "Decompress file.bz2",
            answer: "bunzip2 file.bz2",
            hint: "Use bunzip2 or bzip2 -d",
            alternatives: ["bzip2 -d file.bz2"]
        },
        
        // Zip files
        {
            question: "Create a zip file called docs.zip containing all .txt files",
            answer: "zip docs.zip *.txt",
            hint: "zip outputfile inputfiles"
        },
        {
            question: "Extract the contents of archive.zip",
            answer: "unzip archive.zip",
            hint: "Use the unzip command"
        },
        {
            question: "Create a zip file of the entire 'website' directory",
            answer: "zip -r website.zip website",
            hint: "Use -r for recursive",
            alternatives: ["zip -r website.zip website/"]
        }
    ],
    
    'permissions': [
        // Basic chmod
        {
            question: "Make script.sh executable for the owner",
            answer: "chmod u+x script.sh",
            hint: "u=user/owner, +x adds execute",
            alternatives: ["chmod +x script.sh"]
        },
        {
            question: "Remove write permission for group on data.txt",
            answer: "chmod g-w data.txt",
            hint: "g=group, -w removes write"
        },
        {
            question: "Give read permission to others for public.txt",
            answer: "chmod o+r public.txt",
            hint: "o=others, +r adds read"
        },
        {
            question: "Make config.sh readable and executable by everyone",
            answer: "chmod a+rx config.sh",
            hint: "a=all users",
            alternatives: ["chmod +rx config.sh"]
        },
        
        // Numeric permissions
        {
            question: "Set permissions to rwxr-xr-x on program.sh",
            answer: "chmod 755 program.sh",
            hint: "7=rwx, 5=r-x, 5=r-x"
        },
        {
            question: "Make private.key readable/writable by owner only (rw-------)",
            answer: "chmod 600 private.key",
            hint: "6=rw-, 0=---, 0=---"
        },
        {
            question: "Set permissions to rw-r--r-- on document.txt",
            answer: "chmod 644 document.txt",
            hint: "6=rw-, 4=r--, 4=r--"
        },
        {
            question: "Give full permissions to everyone on temp.txt (rwxrwxrwx)",
            answer: "chmod 777 temp.txt",
            hint: "7=rwx for all three groups"
        },
        {
            question: "Set permissions to rwxr-x--- on secure.sh",
            answer: "chmod 750 secure.sh",
            hint: "7=rwx, 5=r-x, 0=---"
        },
        
        // Ownership
        {
            question: "Change owner of file.txt to alice",
            answer: "chown alice file.txt",
            hint: "chown newowner filename"
        },
        {
            question: "Change owner to bob and group to developers for app.sh",
            answer: "chown bob:developers app.sh",
            hint: "Use owner:group format"
        },
        {
            question: "Change only the group of data.csv to analysts",
            answer: "chgrp analysts data.csv",
            hint: "chgrp changes group ownership",
            alternatives: ["chown :analysts data.csv"]
        },
        {
            question: "Recursively change owner of 'project' directory to john",
            answer: "chown -R john project",
            hint: "Use -R for recursive"
        },
        
        // Special permissions
        {
            question: "Add execute permission for owner only on backup.sh",
            answer: "chmod u+x backup.sh",
            hint: "u=user/owner, +x adds execute"
        },
        {
            question: "Remove all permissions for others on secret.txt",
            answer: "chmod o-rwx secret.txt",
            hint: "o=others, -rwx removes all",
            alternatives: ["chmod o= secret.txt"]
        },
        {
            question: "Copy permissions from template.sh to newscript.sh",
            answer: "chmod --reference=template.sh newscript.sh",
            hint: "Use --reference to copy permissions"
        },
        
        // sudo/su
        {
            question: "Run the updatedb command as root",
            answer: "sudo updatedb",
            hint: "sudo runs commands as superuser"
        },
        {
            question: "Switch to root user account",
            answer: "su",
            hint: "su without arguments switches to root",
            alternatives: ["su -", "su root"]
        },
        {
            question: "Switch to user account 'webadmin'",
            answer: "su webadmin",
            hint: "su username switches to that user",
            alternatives: ["su - webadmin"]
        }
    ],
    
    'text-processing': [
        // grep
        {
            question: "Search for the word 'error' in log.txt",
            answer: "grep error log.txt",
            hint: "grep pattern file",
            alternatives: ["grep 'error' log.txt", "grep \"error\" log.txt"]
        },
        {
            question: "Search for 'WARNING' case-insensitively in system.log",
            answer: "grep -i warning system.log",
            hint: "Use -i for case-insensitive",
            alternatives: ["grep -i WARNING system.log"]
        },
        {
            question: "Find lines that do NOT contain 'success' in results.txt",
            answer: "grep -v success results.txt",
            hint: "Use -v to invert match"
        },
        {
            question: "Search for 'failed' and show line numbers",
            answer: "grep -n failed log.txt",
            hint: "Use -n for line numbers"
        },
        {
            question: "Count how many lines contain 'user' in access.log",
            answer: "grep -c user access.log",
            hint: "Use -c to count matches"
        },
        {
            question: "Search for 'error' in all .log files in current directory",
            answer: "grep error *.log",
            hint: "Use wildcards for multiple files"
        },
        {
            question: "Recursively search for 'TODO' in all files under current directory",
            answer: "grep -r TODO .",
            hint: "Use -r for recursive search",
            alternatives: ["grep -R TODO ."]
        },
        
        // sed
        {
            question: "Replace first occurrence of 'old' with 'new' in file.txt",
            answer: "sed 's/old/new/' file.txt",
            hint: "s/pattern/replacement/ syntax"
        },
        {
            question: "Replace ALL occurrences of 'localhost' with '127.0.0.1' in config.txt",
            answer: "sed 's/localhost/127.0.0.1/g' config.txt",
            hint: "Add 'g' flag for global replacement"
        },
        {
            question: "Delete lines containing 'debug' from output.log",
            answer: "sed '/debug/d' output.log",
            hint: "Use /pattern/d to delete matching lines"
        },
        {
            question: "Delete line 5 from data.txt",
            answer: "sed '5d' data.txt",
            hint: "Use line number followed by 'd'"
        },
        
        // awk
        {
            question: "Print the first column from data.csv",
            answer: "awk '{print $1}' data.csv",
            hint: "$1 represents first field"
        },
        {
            question: "Print the third and fifth columns from report.txt",
            answer: "awk '{print $3, $5}' report.txt",
            hint: "Separate fields with comma"
        },
        {
            question: "Print lines where the second column equals 'active' from status.txt",
            answer: "awk '$2 == \"active\"' status.txt",
            hint: "Use field comparison",
            alternatives: ["awk '$2 == \"active\" {print}' status.txt"]
        },
        
        // sort/uniq
        {
            question: "Sort the contents of names.txt alphabetically",
            answer: "sort names.txt",
            hint: "sort command alone sorts alphabetically"
        },
        {
            question: "Sort numbers.txt numerically",
            answer: "sort -n numbers.txt",
            hint: "Use -n for numeric sort"
        },
        {
            question: "Sort data.txt in reverse order",
            answer: "sort -r data.txt",
            hint: "Use -r for reverse"
        },
        {
            question: "Remove duplicate lines from list.txt",
            answer: "sort list.txt | uniq",
            hint: "uniq only removes adjacent duplicates, so sort first",
            alternatives: ["sort -u list.txt"]
        },
        {
            question: "Count occurrences of each unique line in votes.txt",
            answer: "sort votes.txt | uniq -c",
            hint: "Use uniq -c to count"
        },
        
        // wc
        {
            question: "Count the number of lines in document.txt",
            answer: "wc -l document.txt",
            hint: "Use -l for line count"
        },
        {
            question: "Count words in essay.txt",
            answer: "wc -w essay.txt",
            hint: "Use -w for word count"
        },
        {
            question: "Get line, word, and character count for report.txt",
            answer: "wc report.txt",
            hint: "wc alone shows all counts"
        },
        
        // cut
        {
            question: "Extract the first field from a colon-delimited file passwd.txt",
            answer: "cut -d: -f1 passwd.txt",
            hint: "Use -d for delimiter, -f for field"
        },
        {
            question: "Extract characters 1-10 from each line of data.txt",
            answer: "cut -c1-10 data.txt",
            hint: "Use -c for character positions"
        },
        
        // pipes
        {
            question: "Count how many files are in the current directory",
            answer: "ls | wc -l",
            hint: "Pipe ls output to wc -l"
        },
        {
            question: "Find all .conf files and count them",
            answer: "find . -name '*.conf' | wc -l",
            hint: "Pipe find results to wc",
            alternatives: ["find . -name \"*.conf\" | wc -l"]
        },
        {
            question: "Show unique logged-in users from who command",
            answer: "who | cut -d' ' -f1 | sort | uniq",
            hint: "Extract usernames, sort, then get unique"
        }
    ],
    
    'shell': [
        // Variables
        {
            question: "Create a variable named NAME with value 'Linux'",
            answer: "NAME=Linux",
            hint: "No spaces around the equals sign",
            alternatives: ["NAME='Linux'", "NAME=\"Linux\""]
        },
        {
            question: "Display the value of variable HOME",
            answer: "echo $HOME",
            hint: "Use $ to access variable value"
        },
        {
            question: "Export variable PATH to make it available to child processes",
            answer: "export PATH",
            hint: "export makes variables available to subprocesses"
        },
        {
            question: "Set and export EDITOR to 'vim' in one command",
            answer: "export EDITOR=vim",
            hint: "Combine export with assignment",
            alternatives: ["export EDITOR='vim'", "export EDITOR=\"vim\""]
        },
        
        // Command history
        {
            question: "Display your command history",
            answer: "history",
            hint: "Shows numbered list of previous commands"
        },
        {
            question: "Execute command number 50 from history",
            answer: "!50",
            hint: "Use ! followed by the number"
        },
        {
            question: "Run the last command again",
            answer: "!!",
            hint: "Double exclamation marks"
        },
        {
            question: "Search command history for 'docker'",
            answer: "history | grep docker",
            hint: "Pipe history to grep"
        },
        
        // Aliases
        {
            question: "Create an alias 'la' for 'ls -la'",
            answer: "alias la='ls -la'",
            hint: "alias name='command'"
        },
        {
            question: "Display all current aliases",
            answer: "alias",
            hint: "alias command alone shows all"
        },
        {
            question: "Remove the alias named 'temp'",
            answer: "unalias temp",
            hint: "Use unalias command"
        },
        
        // Script basics
        {
            question: "Make script.sh executable",
            answer: "chmod +x script.sh",
            hint: "Add execute permission",
            alternatives: ["chmod u+x script.sh", "chmod 755 script.sh"]
        },
        {
            question: "Run script.sh in the current directory",
            answer: "./script.sh",
            hint: "Use ./ for current directory"
        },
        {
            question: "Display 'Hello World' on the screen",
            answer: "echo 'Hello World'",
            hint: "echo prints text",
            alternatives: ["echo \"Hello World\"", "echo Hello World"]
        },
        {
            question: "Store the output of 'date' command in variable NOW",
            answer: "NOW=$(date)",
            hint: "Use command substitution with $()",
            alternatives: ["NOW=`date`"]
        },
        
        // Environment
        {
            question: "Display all environment variables",
            answer: "env",
            hint: "env shows all environment variables",
            alternatives: ["printenv"]
        },
        {
            question: "Show the current shell you're using",
            answer: "echo $SHELL",
            hint: "$SHELL variable contains shell path"
        },
        {
            question: "Display your username",
            answer: "whoami",
            hint: "whoami shows current username",
            alternatives: ["echo $USER"]
        },
        {
            question: "Show which bash executable is being used",
            answer: "which bash",
            hint: "which finds command locations"
        },
        
        // Redirection
        {
            question: "Save the output of 'ls' to files.txt",
            answer: "ls > files.txt",
            hint: "> redirects output to file"
        },
        {
            question: "Append the date to log.txt",
            answer: "date >> log.txt",
            hint: ">> appends instead of overwriting"
        },
        {
            question: "Redirect error messages from 'find /' to errors.txt",
            answer: "find / 2> errors.txt",
            hint: "2> redirects stderr"
        },
        {
            question: "Run 'command' and discard all output (stdout and stderr)",
            answer: "command > /dev/null 2>&1",
            hint: "Redirect both to /dev/null",
            alternatives: ["command &> /dev/null"]
        }
    ],
    
    'system': [
        // Process management
        {
            question: "Show all running processes",
            answer: "ps aux",
            hint: "aux shows all users' processes",
            alternatives: ["ps -ef"]
        },
        {
            question: "Display processes in a tree format",
            answer: "pstree",
            hint: "Shows parent-child relationships",
            alternatives: ["ps auxf"]
        },
        {
            question: "Show real-time process information",
            answer: "top",
            hint: "Interactive process viewer"
        },
        {
            question: "Display only processes containing 'apache'",
            answer: "ps aux | grep apache",
            hint: "Pipe ps to grep"
        },
        {
            question: "Kill process with PID 1234",
            answer: "kill 1234",
            hint: "kill followed by process ID"
        },
        {
            question: "Forcefully kill process 5678",
            answer: "kill -9 5678",
            hint: "Use -9 for SIGKILL",
            alternatives: ["kill -KILL 5678"]
        },
        {
            question: "Kill all processes named 'firefox'",
            answer: "killall firefox",
            hint: "killall uses process name"
        },
        
        // System information
        {
            question: "Display system memory usage",
            answer: "free",
            hint: "Shows RAM and swap usage"
        },
        {
            question: "Show memory in human-readable format (GB/MB)",
            answer: "free -h",
            hint: "Use -h for human-readable",
            alternatives: ["free -m", "free -g"]
        },
        {
            question: "Display disk space usage",
            answer: "df",
            hint: "Shows filesystem disk usage"
        },
        {
            question: "Show disk usage in human-readable format",
            answer: "df -h",
            hint: "Use -h flag"
        },
        {
            question: "Display the size of current directory",
            answer: "du -sh .",
            hint: "du shows disk usage, -s for summary, -h for human-readable",
            alternatives: ["du -sh"]
        },
        {
            question: "Show sizes of all files and directories in current location",
            answer: "du -sh *",
            hint: "Use wildcard with du"
        },
        
        // System monitoring
        {
            question: "Display system uptime and load average",
            answer: "uptime",
            hint: "Shows how long system has been running"
        },
        {
            question: "Show kernel messages",
            answer: "dmesg",
            hint: "Display message buffer"
        },
        {
            question: "Display the last 20 kernel messages",
            answer: "dmesg | tail -n 20",
            hint: "Pipe dmesg to tail",
            alternatives: ["dmesg | tail -20"]
        },
        {
            question: "Monitor system calls of process 1234",
            answer: "strace -p 1234",
            hint: "Use strace with -p for PID"
        },
        
        // Hardware info
        {
            question: "Display CPU information",
            answer: "lscpu",
            hint: "Lists CPU architecture information",
            alternatives: ["cat /proc/cpuinfo"]
        },
        {
            question: "Show all PCI devices",
            answer: "lspci",
            hint: "Lists PCI devices"
        },
        {
            question: "Display USB devices",
            answer: "lsusb",
            hint: "Lists USB devices"
        },
        {
            question: "Show detailed hardware information",
            answer: "lshw",
            hint: "Lists hardware",
            alternatives: ["sudo lshw"]
        },
        
        // System control
        {
            question: "Reboot the system",
            answer: "reboot",
            hint: "Restarts the system",
            alternatives: ["sudo reboot", "shutdown -r now"]
        },
        {
            question: "Shut down the system immediately",
            answer: "shutdown now",
            hint: "Use shutdown with 'now'",
            alternatives: ["shutdown -h now", "poweroff"]
        },
        {
            question: "Schedule shutdown in 10 minutes",
            answer: "shutdown +10",
            hint: "Use + for minutes from now"
        }
    ],
    
    'users': [
        // User information
        {
            question: "Display your current username",
            answer: "whoami",
            hint: "Who am I?"
        },
        {
            question: "Show detailed information about current user",
            answer: "id",
            hint: "Shows UID, GID, and groups"
        },
        {
            question: "Display information about user 'john'",
            answer: "id john",
            hint: "id followed by username"
        },
        {
            question: "List all groups you belong to",
            answer: "groups",
            hint: "Shows group memberships"
        },
        {
            question: "Show groups that user 'alice' belongs to",
            answer: "groups alice",
            hint: "groups followed by username"
        },
        {
            question: "Display currently logged in users",
            answer: "who",
            hint: "Shows who is logged in",
            alternatives: ["w"]
        },
        
        // User management
        {
            question: "Create a new user named 'bob'",
            answer: "useradd bob",
            hint: "Basic user addition",
            alternatives: ["sudo useradd bob"]
        },
        {
            question: "Create user 'alice' with home directory",
            answer: "useradd -m alice",
            hint: "Use -m to create home directory",
            alternatives: ["sudo useradd -m alice"]
        },
        {
            question: "Create user 'dev' with bash as default shell",
            answer: "useradd -s /bin/bash dev",
            hint: "Use -s to specify shell",
            alternatives: ["useradd -m -s /bin/bash dev"]
        },
        {
            question: "Delete user 'temp'",
            answer: "userdel temp",
            hint: "Remove user account",
            alternatives: ["sudo userdel temp"]
        },
        {
            question: "Delete user 'old' and their home directory",
            answer: "userdel -r old",
            hint: "Use -r to remove home directory too",
            alternatives: ["sudo userdel -r old"]
        },
        
        // Password management
        {
            question: "Change your own password",
            answer: "passwd",
            hint: "passwd alone changes current user's password"
        },
        {
            question: "Change password for user 'john'",
            answer: "passwd john",
            hint: "passwd followed by username",
            alternatives: ["sudo passwd john"]
        },
        {
            question: "Lock user account 'suspended'",
            answer: "usermod -L suspended",
            hint: "Use usermod with -L to lock",
            alternatives: ["passwd -l suspended"]
        },
        {
            question: "Unlock user account 'active'",
            answer: "usermod -U active",
            hint: "Use usermod with -U to unlock",
            alternatives: ["passwd -u active"]
        },
        
        // Group management
        {
            question: "Create a new group called 'developers'",
            answer: "groupadd developers",
            hint: "groupadd creates groups",
            alternatives: ["sudo groupadd developers"]
        },
        {
            question: "Add user 'alice' to group 'sudo'",
            answer: "usermod -a -G sudo alice",
            hint: "Use usermod with -a -G",
            alternatives: ["usermod -aG sudo alice"]
        },
        {
            question: "Change primary group of 'bob' to 'staff'",
            answer: "usermod -g staff bob",
            hint: "Use -g for primary group"
        },
        {
            question: "Remove user 'temp' from group 'admin'",
            answer: "gpasswd -d temp admin",
            hint: "Use gpasswd with -d"
        },
        
        // File viewing
        {
            question: "View the /etc/passwd file",
            answer: "cat /etc/passwd",
            hint: "Contains user account information",
            alternatives: ["less /etc/passwd"]
        },
        {
            question: "See all groups on the system",
            answer: "cat /etc/group",
            hint: "Group information file",
            alternatives: ["less /etc/group"]
        },
        {
            question: "Check if user 'www-data' exists",
            answer: "grep www-data /etc/passwd",
            hint: "Search for user in passwd file",
            alternatives: ["id www-data"]
        }
    ],
    
    'networking': [
        // Basic connectivity
        {
            question: "Test connectivity to google.com",
            answer: "ping google.com",
            hint: "ping sends ICMP packets"
        },
        {
            question: "Ping 8.8.8.8 with only 4 packets",
            answer: "ping -c 4 8.8.8.8",
            hint: "Use -c for count"
        },
        {
            question: "Show the route packets take to reach debian.org",
            answer: "traceroute debian.org",
            hint: "Traces the network path",
            alternatives: ["tracepath debian.org"]
        },
        
        // Network configuration
        {
            question: "Display all network interfaces",
            answer: "ifconfig",
            hint: "Interface configuration",
            alternatives: ["ip addr show", "ip a"]
        },
        {
            question: "Show only the eth0 interface details",
            answer: "ifconfig eth0",
            hint: "Specify interface name",
            alternatives: ["ip addr show eth0"]
        },
        {
            question: "Display the routing table",
            answer: "route",
            hint: "Shows routing information",
            alternatives: ["route -n", "ip route", "netstat -r"]
        },
        {
            question: "Show all network connections",
            answer: "netstat",
            hint: "Network statistics"
        },
        {
            question: "Display all listening ports",
            answer: "netstat -l",
            hint: "Use -l for listening",
            alternatives: ["ss -l"]
        },
        {
            question: "Show listening ports with program names",
            answer: "netstat -tlnp",
            hint: "t=tcp, l=listening, n=numeric, p=programs",
            alternatives: ["ss -tlnp", "sudo netstat -tlnp"]
        },
        
        // DNS
        {
            question: "Look up the IP address of example.com",
            answer: "nslookup example.com",
            hint: "Name server lookup",
            alternatives: ["host example.com", "dig example.com"]
        },
        {
            question: "Query DNS for google.com using dig",
            answer: "dig google.com",
            hint: "Domain information groper"
        },
        {
            question: "Display contents of DNS resolver configuration",
            answer: "cat /etc/resolv.conf",
            hint: "DNS resolver config file"
        },
        {
            question: "Show the system hostname",
            answer: "hostname",
            hint: "Displays the system's hostname"
        },
        {
            question: "Display the hosts file",
            answer: "cat /etc/hosts",
            hint: "Local hostname mappings"
        },
        
        // File transfer
        {
            question: "Download file.zip from http://example.com/file.zip",
            answer: "wget http://example.com/file.zip",
            hint: "wget downloads files"
        },
        {
            question: "Download and save as newname.zip",
            answer: "wget -O newname.zip http://example.com/file.zip",
            hint: "Use -O for output filename"
        },
        {
            question: "Download using curl and display on screen",
            answer: "curl http://example.com/file.txt",
            hint: "curl transfers data"
        },
        {
            question: "Download with curl and save to file.txt",
            answer: "curl -o file.txt http://example.com/file.txt",
            hint: "Use -o for output file",
            alternatives: ["curl http://example.com/file.txt > file.txt"]
        },
        
        // SSH
        {
            question: "Connect to server.com as current user via SSH",
            answer: "ssh server.com",
            hint: "Secure shell connection"
        },
        {
            question: "SSH to server.com as user 'admin'",
            answer: "ssh admin@server.com",
            hint: "Use username@hostname format"
        },
        {
            question: "SSH to 192.168.1.100 on port 2222",
            answer: "ssh -p 2222 192.168.1.100",
            hint: "Use -p for non-standard port"
        },
        {
            question: "Copy file.txt to remote server.com's /tmp directory",
            answer: "scp file.txt server.com:/tmp/",
            hint: "Secure copy syntax",
            alternatives: ["scp file.txt server.com:/tmp"]
        },
        {
            question: "Copy remote file from server.com:/etc/config to current directory",
            answer: "scp server.com:/etc/config .",
            hint: "Remote source, local destination"
        },
        
        // Ports and services
        {
            question: "Check if port 80 is open on localhost",
            answer: "telnet localhost 80",
            hint: "telnet can test ports",
            alternatives: ["nc -zv localhost 80"]
        },
        {
            question: "Scan ports on scanme.nmap.org",
            answer: "nmap scanme.nmap.org",
            hint: "Network mapper tool"
        }
    ],
    
    'linux-foundations': [
        // System information
        {
            question: "Display the kernel version",
            answer: "uname -r",
            hint: "Use -r for kernel release",
            alternatives: ["uname -a"]
        },
        {
            question: "Show all system information",
            answer: "uname -a",
            hint: "Use -a for all information"
        },
        {
            question: "Display the Linux distribution information",
            answer: "lsb_release -a",
            hint: "LSB release info",
            alternatives: ["cat /etc/os-release"]
        },
        {
            question: "Check what Linux distribution you're using",
            answer: "cat /etc/os-release",
            hint: "OS release file",
            alternatives: ["cat /etc/*release"]
        },
        
        // Package management - Debian/Ubuntu
        {
            question: "Update package list on Debian/Ubuntu",
            answer: "apt update",
            hint: "Refreshes package database",
            alternatives: ["sudo apt update", "apt-get update"]
        },
        {
            question: "Install nginx package on Ubuntu",
            answer: "apt install nginx",
            hint: "apt install packagename",
            alternatives: ["sudo apt install nginx", "apt-get install nginx"]
        },
        {
            question: "Search for packages containing 'python' on Debian",
            answer: "apt search python",
            hint: "apt search searches package descriptions",
            alternatives: ["apt-cache search python"]
        },
        {
            question: "Remove apache2 package on Ubuntu",
            answer: "apt remove apache2",
            hint: "apt remove packagename",
            alternatives: ["sudo apt remove apache2", "apt-get remove apache2"]
        },
        {
            question: "Upgrade all packages on Debian/Ubuntu",
            answer: "apt upgrade",
            hint: "Upgrades installed packages",
            alternatives: ["sudo apt upgrade", "apt-get upgrade"]
        },
        
        // Package management - Red Hat/CentOS
        {
            question: "Install httpd package on CentOS",
            answer: "yum install httpd",
            hint: "yum install packagename",
            alternatives: ["sudo yum install httpd", "dnf install httpd"]
        },
        {
            question: "Update all packages on Red Hat",
            answer: "yum update",
            hint: "Updates all packages",
            alternatives: ["sudo yum update", "dnf update"]
        },
        {
            question: "Search for packages with 'mysql' on CentOS",
            answer: "yum search mysql",
            hint: "yum search keyword",
            alternatives: ["dnf search mysql"]
        },
        {
            question: "List installed packages on Red Hat system",
            answer: "rpm -qa",
            hint: "Query all with rpm",
            alternatives: ["yum list installed"]
        },
        
        // Man pages and help
        {
            question: "Display the manual page for ls command",
            answer: "man ls",
            hint: "man shows manual pages"
        },
        {
            question: "Search man pages for 'network'",
            answer: "man -k network",
            hint: "Use -k for keyword search",
            alternatives: ["apropos network"]
        },
        {
            question: "Get quick help for cp command",
            answer: "cp --help",
            hint: "Most commands support --help",
            alternatives: ["help cp"]
        },
        {
            question: "Display info documentation for bash",
            answer: "info bash",
            hint: "info shows detailed documentation"
        },
        
        // System directories
        {
            question: "Change to the system configuration directory",
            answer: "cd /etc",
            hint: "/etc contains configs"
        },
        {
            question: "List contents of the system binary directory",
            answer: "ls /bin",
            hint: "/bin has essential commands",
            alternatives: ["ls /usr/bin"]
        },
        {
            question: "Go to the system log directory",
            answer: "cd /var/log",
            hint: "/var/log contains logs"
        },
        {
            question: "Display contents of system temporary directory",
            answer: "ls /tmp",
            hint: "/tmp is for temporary files"
        },
        
        // Services and systemd
        {
            question: "Check status of ssh service",
            answer: "systemctl status ssh",
            hint: "systemctl manages services",
            alternatives: ["service ssh status", "systemctl status sshd"]
        },
        {
            question: "Start the nginx service",
            answer: "systemctl start nginx",
            hint: "systemctl start servicename",
            alternatives: ["sudo systemctl start nginx", "service nginx start"]
        },
        {
            question: "Enable apache2 to start at boot",
            answer: "systemctl enable apache2",
            hint: "enable makes it start at boot",
            alternatives: ["sudo systemctl enable apache2"]
        },
        {
            question: "Restart the network service",
            answer: "systemctl restart network",
            hint: "restart stops and starts",
            alternatives: ["service network restart", "systemctl restart networking"]
        },
        
        // Environment and basics
        {
            question: "Display current date and time",
            answer: "date",
            hint: "date command shows current time"
        },
        {
            question: "Show system calendar",
            answer: "cal",
            hint: "cal displays calendar"
        },
        {
            question: "Clear the terminal screen",
            answer: "clear",
            hint: "clear command cleans screen",
            alternatives: ["ctrl+l"]
        },
        {
            question: "Display 'Hello from Linux' on screen",
            answer: "echo 'Hello from Linux'",
            hint: "echo prints text",
            alternatives: ["echo \"Hello from Linux\"", "echo Hello from Linux"]
        }
    ]
};