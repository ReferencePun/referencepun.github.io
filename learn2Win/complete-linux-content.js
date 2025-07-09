// COMPLETE LINUX ESSENTIALS CONTENT FOR SYSADMIN EMPIRE
// Updated version with fixes, reorganization, and removed XP system
// Total: 130+ questions covering all Linux Essentials exam topics

// =============================================================================
// CATEGORY 1: FILE OPERATIONS
// =============================================================================
const fileOperationsChallenges = [
    // Basic file commands
    {
        question: "Which command lists the contents of a directory?",
        options: ["cd", "ls", "mkdir", "rm"],
        correct: 1,
        explanation: "ls (list) displays files and directories",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "Which command displays all files including hidden ones?",
        options: ["ls -a", "ls --hidden", "ls -h", "ls --a"],
        correct: 0,
        explanation: "ls -a shows all files, including hidden files starting with .",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "Which command lists all files starting with a capital letter?",
        options: ["ls [A-Z]*", "ls A-Z", "ls A-Z*", "ls --uppercase-files", "ls -uppercase-files"],
        correct: 0,
        explanation: "[A-Z]* matches files starting with any capital letter",
        category: "file-operations",
        difficulty: "medium"
    },
    {
        question: "Which command shows the current working directory and what does it stand for?",
        options: ["pwd - Print Working Directory", "pwd - Path Working Directory", "cwd - Current Working Directory", "pwd - Present Working Directory"],
        correct: 0,
        explanation: "pwd (Print Working Directory) shows the absolute path to current location",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "How do you copy a file in Linux?",
        options: ["copy", "cp", "cpy", "duplicate"],
        correct: 1,
        explanation: "cp (copy) duplicates files and directories",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "Which of the following commands can be used to create a file?",
        options: ["touch", "build", "nico", "create", "mkfile"],
        correct: 0,
        explanation: "touch creates empty files or updates timestamps",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "Which command will display the last line of file foo.txt?",
        options: ["head -n foo.txt", "tail foo.txt", "last -n 1 foo.txt", "tail -n 1 foo.txt"],
        correct: 3,
        explanation: "tail -n 1 displays exactly one line from the end",
        category: "file-operations",
        difficulty: "medium"
    },
    {
        question: "Which commands increase the number of elements in a directory? (Choose two)",
        options: ["touch newfile", "create newfile", "ls newfile", "rmdir newdirectory", "mkdir newdirectory"],
        correct: [0, 4],
        explanation: "touch creates files, mkdir creates directories",
        category: "file-operations",
        difficulty: "medium"
    },
    {
        question: "A file Access.txt was left when deleting all files beginning with 'a'. Why wasn't it deleted?",
        options: [
            "Files with extensions need different treatment",
            "rm had to be called with -R option", 
            "The file was probably opened by another application",
            "The file was hidden",
            "Linux file names are case sensitive"
        ],
        correct: 4,
        explanation: "Linux distinguishes between 'a' and 'A' - case matters",
        category: "file-operations",
        difficulty: "medium"
    },
    {
        question: "Which command copies all .txt files to /tmp/?",
        options: ["cp ??.txt /tmp/", "cp *.txt /tmp/", "cp .txt /tmp/", "cp ?.txt /tmp/", "cp $?.txt /tmp/"],
        correct: 1,
        explanation: "*.txt matches all files ending in .txt",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "Which command moves ~/summer-vacation and its content to ~/vacation/2011?",
        options: [
            "mv ~/vacation/2011 ~/summer-vacation",
            "move -R ~/summer-vacation ~/vacation/2011", 
            "mv /home/summer-vacation /home/vacation/2011",
            "mv ~/summer-vacation ~/vacation/2011",
            "mv -R ~/summer-vacation ~/vacation/2011"
        ],
        correct: 3,
        explanation: "mv source destination moves/renames files and directories",
        category: "file-operations",
        difficulty: "medium"
    },
    {
        question: "Which commands will archive /home and its content to /mnt/backup? (Choose two)",
        options: [
            "cp -ar /home /mnt/backup",
            "mv /home /mnt/backup", 
            "sync -r /home /mnt/backup",
            "tar -cf /mnt/backup/archive.tar /home",
            "copy -r /home /mnt/backup"
        ],
        correct: [0, 3],
        explanation: "cp -ar copies recursively preserving attributes, tar creates archives",
        category: "file-operations",
        difficulty: "hard"
    },
    {
        question: "Why is file data.txt empty after executing: sort data.txt > data.txt?",
        options: [
            "data.txt must have been empty before",
            "sort cannot sort text files, only binary files", 
            "sort detects that both files are the same",
            "The file gets truncated before sort is executed"
        ],
        correct: 3,
        explanation: "> truncates the file immediately, before sort can read it",
        category: "file-operations",
        difficulty: "hard"
    },
    // Questions moved from Linux Foundations
    {
        question: "What does .. (two dots) mean in a path?",
        options: ["Current directory", "Parent directory", "Home directory", "Root directory"],
        correct: 1,
        explanation: ". = current directory, .. = parent directory",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "Which path is absolute?",
        options: ["../Documents", "./files", "/home/user", "documents/file"],
        correct: 2,
        explanation: "Absolute paths start with / (root directory)",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "A user is in /home/user/Downloads/ and runs: ls ../Documents/ - Which directory's content is displayed?",
        options: [
            "/home/user/Documents/",
            "/home/user/Documents/Downloads/", 
            "/home/user/Downloads/Documents/",
            "/Documents/",
            "/home/Documents"
        ],
        correct: 0,
        explanation: ".. goes up one level to /home/user/, then into Documents/",
        category: "file-operations",
        difficulty: "medium"
    },
    {
        question: "Which are correct commands for changing to the user's home directory? (Select all that apply)",
        options: ["cd /home", "cd ~", "cd ..", "cd", "cd /"],
        correct: [1, 3],
        explanation: "cd ~ and cd (no arguments) both go to user's home directory",
        category: "file-operations",
        difficulty: "easy"
    },
    {
        question: "What is the first character for file/directory names if they should be hidden from ls unless specifically requested?",
        options: ["\\ (backslash)", ". (dot)", "- (minus)", "_ (underscore)"],
        correct: 1,
        explanation: "Files starting with . (dot) are hidden by default",
        category: "file-operations",
        difficulty: "easy"
    }
];

// =============================================================================
// CATEGORY 2: ARCHIVES & COMPRESSION
// =============================================================================
const archivesChallenges = [
    {
        question: "Which tar option creates an archive?",
        options: ["-x", "-c", "-t", "-r"],
        correct: 1,
        explanation: "c = create, x = extract, t = list, r = append, f = filename",
        category: "archives",
        difficulty: "easy"
    },
    {
        question: "Which command creates an archive file work.tar from the contents of directory ./work/?",
        options: [
            "tar --new work.tar ./work/",
            "tar -cf work.tar ./work/",
            "tar --create work.tgz --content ./work/", 
            "tar work.tar < ./work/",
            "tar work > work.tar"
        ],
        correct: 1,
        explanation: "tar -cf creates archive (-c) with filename (-f)",
        category: "archives",
        difficulty: "medium"
    },
    {
        question: "Which tar options handle compression? (Choose two)",
        options: ["-bz", "-z", "-g", "-j", "-z2"],
        correct: [1, 3],
        explanation: "-z = gzip compression, -j = bzip2 compression",
        category: "archives",
        difficulty: "medium"
    },
    {
        question: "Which command extracts the contents of compressed archive file1.tar.gz?",
        options: [
            "tar -czf file1.tar.gz",
            "ztar file1.tar.gz", 
            "tar -xzf file1.tar.gz",
            "tar --extract file1.tar.gz",
            "detar file1.tar.gz"
        ],
        correct: 2,
        explanation: "tar -xzf: extract (-x) with gzip (-z) from file (-f)",
        category: "archives",
        difficulty: "medium"
    },
    {
        question: "Which command will create an archive named backup.tar containing all files from /home?",
        options: [
            "tar /home backup.tar",
            "tar -cf /home backup.tar", 
            "tar -xf /home backup.tar",
            "tar -xf backup.tar /home",
            "tar -cf backup.tar /home"
        ],
        correct: 4,
        explanation: "tar -cf archive_name source_directory",
        category: "archives",
        difficulty: "medium"
    },
    {
        question: "What file extension typically indicates a gzip compressed file?",
        options: [".zip", ".bz2", ".gz", ".tar"],
        correct: 2,
        explanation: ".gz indicates gzip compression",
        category: "archives",
        difficulty: "easy"
    },
    {
        question: "Which command compresses a file using gzip?",
        options: ["zip file", "gzip file", "compress file", "tar -z file"],
        correct: 1,
        explanation: "gzip compresses files in place, replacing the original",
        category: "archives",
        difficulty: "easy"
    },
    {
        question: "What does a .tar.bz2 file extension indicate?",
        options: [
            "A tar archive compressed with zip",
            "A tar archive compressed with bzip2",
            "A broken tar file",
            "An encrypted tar file"
        ],
        correct: 1,
        explanation: "tar.bz2 indicates a tar archive compressed with bzip2",
        category: "archives",
        difficulty: "medium"
    },
    {
        question: "Which command creates a zip archive of multiple files?",
        options: ["zip archive.zip file1 file2", "tar -z archive.zip file1 file2", "gzip archive.zip file1 file2", "compress archive.zip file1 file2"],
        correct: 0,
        explanation: "zip creates compressed archives compatible with Windows",
        category: "archives",
        difficulty: "easy"
    },
    {
        question: "How do you extract a zip file?",
        options: ["unzip file.zip", "zip -x file.zip", "extract file.zip", "tar -xf file.zip"],
        correct: 0,
        explanation: "unzip extracts files from zip archives",
        category: "archives",
        difficulty: "easy"
    },
    {
        question: "Which compression format typically achieves the best compression ratio?",
        options: ["gzip", "zip", "bzip2", "tar"],
        correct: 2,
        explanation: "bzip2 generally achieves better compression than gzip or zip, but is slower",
        category: "archives",
        difficulty: "medium"
    },
    {
        question: "What's the difference between tar and zip?",
        options: [
            "tar compresses better than zip",
            "tar only archives, zip archives and compresses",
            "zip is only for Windows",
            "They are the same"
        ],
        correct: 1,
        explanation: "tar creates archives (needs -z or -j for compression), zip does both",
        category: "archives",
        difficulty: "medium"
    }
];

// =============================================================================
// CATEGORY 3: PERMISSIONS
// =============================================================================
const permissionsChallenges = [
    {
        question: "What does chmod stand for?",
        options: ["Change Mode", "Check Module", "Create Mode", "Copy Module"],
        correct: 0,
        explanation: "chmod = CHange MODe - changes file permissions",
        category: "permissions",
        difficulty: "easy"
    },
    {
        question: "Which permissions are set by chmod 654 file.txt?",
        options: ["drw-r-xr--", "d--wxr-x--", "--wxr-x--x", "-rwxrw---x", "-rw-r-xr--"],
        correct: 4,
        explanation: "6=rw- (owner), 5=r-x (group), 4=r-- (others). Leading - means regular file",
        category: "permissions",
        difficulty: "hard"
    },
    {
        question: "What are the three sets of permissions for a file?",
        options: [
            "User, group, others",
            "Administrator, group, others", 
            "User, standard user, others",
            "Administrator, standard user, others"
        ],
        correct: 0,
        explanation: "Linux uses owner/user, group, and others for permission sets",
        category: "permissions",
        difficulty: "easy"
    },
    {
        question: "What permissions should be given to a file that needs to be opened and edited by the owner and opened read-only by the group?",
        options: ["0751", "0466", "0540", "0640", "0444"],
        correct: 3,
        explanation: "0640: owner has rw- (6), group has r-- (4), others have --- (0)",
        category: "permissions",
        difficulty: "hard"
    },
    {
        question: "What is true about the owner of a file?",
        options: [
            "Each file is owned by exactly one user and one group",
            "The owner always has full permissions when accessing the file",
            "The user owning a file must be a member of the file's group", 
            "When a user is deleted, all files owned by the user disappear",
            "The owner cannot be changed once assigned"
        ],
        correct: 0,
        explanation: "Every file has exactly one owner (user) and one group",
        category: "permissions",
        difficulty: "medium"
    },
    {
        question: "Which permissions are set on the /tmp/ directory?",
        options: ["rwxrwxrwt", "------rwx", "rwsrw-rw", "rwxrws--", "r-xr-x--t"],
        correct: 0,
        explanation: "The 't' (sticky bit) means only file owners can delete their own files",
        category: "permissions",
        difficulty: "hard"
    },
    {
        question: "What does the sticky bit (t) do on directories?",
        options: [
            "Makes files sticky in memory",
            "Prevents non-owners from deleting files", 
            "Makes directory temporary",
            "Speeds up access"
        ],
        correct: 1,
        explanation: "Sticky bit prevents users from deleting files they don't own",
        category: "permissions",
        difficulty: "hard"
    },
    {
        question: "Which command changes the ownership of a file?",
        options: ["chmod", "chown", "change", "owner"],
        correct: 1,
        explanation: "chown (change owner) changes file ownership",
        category: "permissions",
        difficulty: "easy"
    },
    {
        question: "The ownership of the file doku.odt should be changed. The new owner is named tux. Which command accomplishes this?",
        options: ["chmod u=tux doku.odt", "newuser doku.odt tux", "chown tux doku.odt", "transfer tux: doku.odt", "passwd doku.odt:tux"],
        correct: 2,
        explanation: "chown user file changes file ownership",
        category: "permissions",
        difficulty: "medium"
    },
    {
        question: "What does the 'x' permission mean for directories?",
        options: [
            "Execute programs in the directory",
            "Delete the directory",
            "Access/enter the directory",
            "Export the directory"
        ],
        correct: 2,
        explanation: "For directories, 'x' means you can access/traverse the directory",
        category: "permissions",
        difficulty: "medium"
    },
    {
        question: "Which numeric permission gives read, write, and execute to everyone?",
        options: ["777", "666", "755", "644"],
        correct: 0,
        explanation: "777 = rwxrwxrwx (read, write, execute for owner, group, others)",
        category: "permissions",
        difficulty: "easy"
    },
    {
        question: "What command would you use to run a command as another user?",
        options: ["su", "sudo", "switch", "user"],
        correct: 1,
        explanation: "sudo allows running commands with elevated privileges",
        category: "permissions",
        difficulty: "easy"
    },
    {
        question: "Which statement about Linux passwords is true?",
        options: [
            "All passwords can be decrypted using the administrator's master password",
            "Passwords may never start with a non-letter", 
            "Users cannot change their password once set",
            "Passwords are only stored in hashed form",
            "Passwords may be at most six characters long"
        ],
        correct: 3,
        explanation: "Passwords are hashed (one-way), not encrypted (two-way)",
        category: "permissions",
        difficulty: "medium"
    }
];

// =============================================================================
// CATEGORY 4: TEXT PROCESSING
// =============================================================================
const textProcessingChallenges = [
    {
        question: "Which command searches for text patterns in files?",
        options: ["search", "find", "grep", "look"],
        correct: 2,
        explanation: "grep searches for text patterns within files",
        category: "text-processing",
        difficulty: "easy"
    },
    {
        question: "Which command finds all lines containing either 'Fred' or 'fred'? (Select all that apply)",
        options: [
            "grep -v fred data_file",
            "grep '[f]red' data_file", 
            "egrep fred data_file",
            "grep '[Ff]red' data_file",
            "grep -i fred data_file"
        ],
        correct: [3, 4],
        explanation: "[Ff] matches both cases, -i flag ignores case",
        category: "text-processing",
        difficulty: "medium"
    },
    {
        question: "Which command finds all lines in operating-systems.txt containing 'linux' regardless of case?",
        options: [
            "igrep linux operating-systems.txt",
            "less -i linux operating-systems.txt", 
            "grep -i linux operating-systems.txt",
            "cut linux operating-systems.txt",
            "cut [Ll][Ii][Nn][Uu][Xx] operating-systems.txt"
        ],
        correct: 2,
        explanation: "grep -i performs case-insensitive searches",
        category: "text-processing",
        difficulty: "medium"
    },
    {
        question: "Which command puts the lines of file data.csv into alphabetical order?",
        options: ["a..z data.csv", "sort data.csv", "abc data.csv", "wc -s data.csv", "grep --sort data.csv"],
        correct: 1,
        explanation: "sort arranges lines in alphabetical/numerical order",
        category: "text-processing",
        difficulty: "easy"
    },
    {
        question: "What is the output of: tail -n 20 test.txt?",
        options: [
            "The first 20 lines of test.txt",
            "The last 20 lines omitting blank lines", 
            "The last 20 lines with line numbers",
            "The last 20 lines including blank lines"
        ],
        correct: 3,
        explanation: "tail -n 20 shows the last 20 lines, including any blank lines",
        category: "text-processing",
        difficulty: "easy"
    },
    {
        question: "Which command shows the first 10 lines of a file?",
        options: ["head file", "top file", "first file", "start file"],
        correct: 0,
        explanation: "head displays the first lines of a file (default 10)",
        category: "text-processing",
        difficulty: "easy"
    },
    {
        question: "What does sed stand for?",
        options: ["Stream Editor", "Search Edit", "Simple Editor", "System Editor"],
        correct: 0,
        explanation: "sed is the Stream Editor for filtering and transforming text",
        category: "text-processing",
        difficulty: "easy"
    },
    {
        question: "Which command counts lines, words, and characters in a file?",
        options: ["count", "wc", "calc", "stats"],
        correct: 1,
        explanation: "wc (word count) shows lines, words, and byte counts",
        category: "text-processing",
        difficulty: "easy"
    },
    {
        question: "What does the pipe operator (|) do?",
        options: [
            "Saves output to a file",
            "Sends output of one command as input to another",
            "Runs commands in parallel",
            "Combines files"
        ],
        correct: 1,
        explanation: "The pipe (|) sends stdout from one command to stdin of another",
        category: "text-processing",
        difficulty: "medium"
    },
    {
        question: "Which command removes duplicate adjacent lines?",
        options: ["unique", "uniq", "dedup", "distinct"],
        correct: 1,
        explanation: "uniq removes duplicate consecutive lines",
        category: "text-processing",
        difficulty: "easy"
    },
    {
        question: "How do you search for a pattern and show line numbers?",
        options: ["grep -n pattern file", "grep -l pattern file", "grep -c pattern file", "grep -w pattern file"],
        correct: 0,
        explanation: "grep -n shows line numbers with matching lines",
        category: "text-processing",
        difficulty: "medium"
    },
    {
        question: "Which awk command prints the first field of each line?",
        options: ["awk '{print $1}'", "awk '{print 1}'", "awk '{first}'", "awk '{$1}'"],
        correct: 0,
        explanation: "In awk, $1 refers to the first field, $2 to second, etc.",
        category: "text-processing",
        difficulty: "hard"
    },
    {
        question: "What does > do in shell commands?",
        options: ["Pipes output to another command", "Appends to file", "Overwrites file with output", "Reads from file"],
        correct: 2,
        explanation: "> overwrites file, >> appends, | pipes to another command",
        category: "text-processing",
        difficulty: "medium"
    },
    {
        question: "How can normal output be written to a file while discarding error output?",
        options: [
            "command>2>file &1>/dev/null",
            "command /dev/null", 
            "command>2>discard-error>file",
            "command> /dev/null 2&>1 output",
            "command > output.txt 2>/dev/null"
        ],
        correct: 4,
        explanation: "> redirects stdout to file, 2>/dev/null discards stderr",
        category: "text-processing",
        difficulty: "hard"
    },
    // Questions moved from Linux Foundations
    {
        question: "Which command can be used to view a file and search within it while viewing?",
        options: ["less", "find", "grep", "report", "see"],
        correct: 0,
        explanation: "less allows viewing files with search capabilities (use /pattern)",
        category: "text-processing",
        difficulty: "easy"
    },
    {
        question: "Which key can be pressed to exit less?",
        options: ["l", "x", "e", "q", "!"],
        correct: 3,
        explanation: "Press 'q' to quit less",
        category: "text-processing",
        difficulty: "easy"
    }
];

// =============================================================================
// CATEGORY 5: SHELL & SCRIPTING
// =============================================================================
const shellChallenges = [
    {
        question: "Which shell prompt character indicates root privileges?",
        options: ["$", "#", ">", "%"],
        correct: 1,
        explanation: "# = root user, $ = regular user",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "What is the exit code for successful command execution?",
        options: ["1", "-1", "0", "255"],
        correct: 2,
        explanation: "0 = success, any other number = error",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "What two-character sequence is present at the beginning of an interpreted script?",
        options: ["#!", "//", "/*", "<!"],
        correct: 0,
        explanation: "#! (shebang) specifies which interpreter should run the script",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "How can you determine if an executable file is a shell script for Bash?",
        options: [
            "The r bit is set",
            "The file must end with .sh", 
            "The first line starts with #!/bin/bash",
            "/bin/bash has to be run in debug mode",
            "Scripts are never executable files"
        ],
        correct: 2,
        explanation: "#!/bin/bash shebang line indicates Bash script",
        category: "shell",
        difficulty: "medium"
    },
    {
        question: "What keyword is missing from this shell script segment: for i in *; ---- cat $i; done",
        options: ["do", "then", "endo", "fi", "run"],
        correct: 0,
        explanation: "'do' keyword starts the loop body in for loops",
        category: "shell",
        difficulty: "medium"
    },
    {
        question: "Which statement can be used to access the second command line argument in a script?",
        options: ["\"ARG$2\"", "$1", "\"$2\"", "\"$1\""],
        correct: 2,
        explanation: "$2 refers to the second command line argument",
        category: "shell",
        difficulty: "medium"
    },
    {
        question: "What is the output of: for token in a b c; do echo -n ${token}; done",
        options: ["a\\nb\\nc\\n", "abc", "$token$token$token", "{a}{b}{c}", "a b c"],
        correct: 1,
        explanation: "echo -n prints without newlines, so tokens are concatenated",
        category: "shell",
        difficulty: "hard"
    },
    {
        question: "The output of 'date' should be saved in variable actdat. What is the correct statement?",
        options: ["actdat=$(date)", "set actdat='date'", "date | actdat", "date > $actdat", "actdat=date"],
        correct: 0,
        explanation: "$() performs command substitution to capture output",
        category: "shell",
        difficulty: "medium"
    },
    {
        question: "Which command sets a shell variable for subsequently executed programs?",
        options: ["export", "announce", "env", "transfer", "mv"],
        correct: 0,
        explanation: "export makes variables available to child processes",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "What single character can split a command across multiple lines?",
        options: ["\\", "/", "|", "&"],
        correct: 0,
        explanation: "Backslash (\\) is the line continuation character",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "Which echo option prevents outputting a trailing newline?",
        options: ["-e", "-p", "-n", "-s"],
        correct: 2,
        explanation: "echo -n suppresses the trailing newline character",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "Which commands will set the variable text to 'olaf is home'? (Choose two)",
        options: ["text='olaf is home'", "text=$olaf is home", "text=\"olaf is home\"", "text=='olaf is home'", "text==\"olaf is home\""],
        correct: [0, 2],
        explanation: "Both single and double quotes work for strings with spaces",
        category: "shell",
        difficulty: "medium"
    },
    {
        question: "Which function does a shell program serve?",
        options: [
            "It provides a graphical environment",
            "It establishes connections to other computers", 
            "It receives user commands and executes them",
            "It logs users into the system"
        ],
        correct: 2,
        explanation: "The shell acts as an interface between users and the operating system",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "Which command shows if /usr/bin is in the current shell search path?",
        options: ["cat PATH", "echo $PATH", "cat %PATH", "echo %PATH%"],
        correct: 1,
        explanation: "$PATH environment variable contains the shell's search path",
        category: "shell",
        difficulty: "easy"
    },
    // Questions moved from Linux Foundations
    {
        question: "Which command provides comprehensive documentation about any Linux command?",
        options: ["help command", "echo command", "locate command", "man command", "get command"],
        correct: 3,
        explanation: "man (manual) command displays comprehensive documentation",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "Which commands provide help for a specific Linux command? (Choose two)",
        options: ["info", "man", "helpme", "ask", "whatdoes"],
        correct: [0, 1],
        explanation: "info and man both provide detailed command documentation",
        category: "shell",
        difficulty: "easy"
    },
    {
        question: "Which command adds /new/dir/ to the PATH environment variable?",
        options: [
            "$PATH=/new/dir:$PATH",
            "PATH=/new/dir:PATH", 
            "export PATH=/new/dir:PATH",
            "export $PATH=/new/dir:$PATH",
            "export PATH=/new/dir:$PATH"
        ],
        correct: 4,
        explanation: "export makes the variable available to child processes",
        category: "shell",
        difficulty: "medium"
    }
];

// =============================================================================
// CATEGORY 6: SYSTEM MONITORING
// =============================================================================
const systemChallenges = [
    {
        question: "What information can be displayed by top?",
        options: [
            "Existing files, ordered by their size",
            "Running processes, ordered by CPU or RAM consumption", 
            "User accounts, ordered by the number of logins",
            "User groups, ordered by the number of members",
            "User accounts, ordered by the number of files"
        ],
        correct: 1,
        explanation: "top shows real-time process information sorted by CPU/memory usage",
        category: "system",
        difficulty: "easy"
    },
    {
        question: "Which commands are used to view real-time memory usage? (Choose two)",
        options: ["memory", "top", "ps", "free", "nice"],
        correct: [1, 3],
        explanation: "top shows real-time system info including memory, free shows memory statistics",
        category: "system",
        difficulty: "medium"
    },
    {
        question: "What is the number used to identify a process called?",
        options: ["Proc Num", "PIN", "Process Entry", "PID"],
        correct: 3,
        explanation: "PID (Process ID) is a unique numerical identifier for each running process",
        category: "system",
        difficulty: "easy"
    },
    {
        question: "What command shows system boot time messages?",
        options: ["dmesg", "echo", "lspci", "display system boot", "messages"],
        correct: 0,
        explanation: "dmesg displays kernel ring buffer messages from boot time",
        category: "system",
        difficulty: "easy"
    },
    {
        question: "What can be found in the /proc/ directory?",
        options: [
            "One directory per installed program",
            "One device file per hardware device", 
            "One file per existing user account",
            "One directory per running process",
            "One log file per running service"
        ],
        correct: 3,
        explanation: "/proc contains virtual directories numbered by process ID",
        category: "system",
        difficulty: "medium"
    },
    {
        question: "Which command shows disk space usage?",
        options: ["ds", "df", "du", "disk"],
        correct: 1,
        explanation: "df (disk free) shows file system disk space usage",
        category: "system",
        difficulty: "easy"
    },
    {
        question: "What does ps stand for?",
        options: ["Process Status", "Program Start", "Print System", "Process Show"],
        correct: 0,
        explanation: "ps shows Process Status - a snapshot of current processes",
        category: "system",
        difficulty: "easy"
    },
    {
        question: "Which command shows the size of directories and their contents?",
        options: ["df", "du", "size", "dirsize"],
        correct: 1,
        explanation: "du (disk usage) shows space used by files and directories",
        category: "system",
        difficulty: "easy"
    },
    {
        question: "How do you see all processes running on the system?",
        options: ["ps", "ps -a", "ps aux", "ps --all"],
        correct: 2,
        explanation: "ps aux shows all processes with detailed information",
        category: "system",
        difficulty: "medium"
    },
    {
        question: "Which signal forcefully terminates a process?",
        options: ["SIGTERM", "SIGKILL", "SIGHUP", "SIGINT"],
        correct: 1,
        explanation: "SIGKILL (9) forcefully terminates a process that cannot be caught or ignored",
        category: "system",
        difficulty: "medium"
    },
    {
        question: "What does the load average represent?",
        options: [
            "CPU temperature",
            "Number of users logged in",
            "Average number of processes waiting to run",
            "Network traffic"
        ],
        correct: 2,
        explanation: "Load average shows the average number of processes in the run queue",
        category: "system",
        difficulty: "hard"
    }
];

// =============================================================================
// CATEGORY 7: USER MANAGEMENT
// =============================================================================
const usersChallenges = [
    {
        question: "What is the UID of the root user?",
        options: ["1", "-1", "255", "65536", "0"],
        correct: 4,
        explanation: "Root always has UID 0",
        category: "users",
        difficulty: "easy"
    },
    {
        question: "What UID does the first regular user typically have?",
        options: ["0", "100", "500", "1000"],
        correct: 3,
        explanation: "Regular users start at UID 1000",
        category: "users",
        difficulty: "easy"
    },
    {
        question: "Which command adds the new user tux and creates the user's home directory with default configuration files?",
        options: ["defaultuser tux", "useradd -m tux", "usercreate tux", "useradd -o default tux", "passwd -a tux"],
        correct: 1,
        explanation: "useradd -m creates user with home directory and skeleton files",
        category: "users",
        difficulty: "medium"
    },
    {
        question: "When a new user is added, where is the user ID stored?",
        options: ["/etc/users", "/etc/realm", "/etc/pass", "/etc/shpasswd", "/etc/passwd"],
        correct: 4,
        explanation: "/etc/passwd contains user account information including UIDs",
        category: "users",
        difficulty: "medium"
    },
    {
        question: "What information is stored in /etc/passwd? (Choose three)",
        options: ["The user's storage space limit", "The numerical user ID", "The username", "The user's default shell", "The user's home directory"],
        correct: [1, 2, 3],
        explanation: "/etc/passwd stores UID, username, home directory, and default shell (NOT encrypted passwords)",
        category: "users",
        difficulty: "hard"
    },
    {
        question: "Which statement about users and user groups is correct?",
        options: [
            "A group can only have one main user",
            "There can be only one user group on a system", 
            "Users do not have to belong to a user group",
            "Every user belongs to at least one user group"
        ],
        correct: 3,
        explanation: "Every user must belong to at least one group for access control",
        category: "users",
        difficulty: "medium"
    },
    {
        question: "Which command displays the list of groups to which a user belongs?",
        options: ["whoami", "isgroup", "who", "id"],
        correct: 3,
        explanation: "id command shows user ID, group ID, and all group memberships",
        category: "users",
        difficulty: "easy"
    },
    {
        question: "What happens to a file outside the home directory when the file owner's account is deleted? (Choose two)",
        options: [
            "The file is moved to /lost+found",
            "The file is removed from the file system", 
            "The UID of the former owner is shown when listing the file",
            "The user root is set as the new owner",
            "Ownership and permissions remain unchanged"
        ],
        correct: [2, 4],
        explanation: "Files keep their UID but show the number instead of username",
        category: "users",
        difficulty: "hard"
    },
    {
        question: "Which command changes a user's password?",
        options: ["password", "passwd", "chpasswd", "setpass"],
        correct: 1,
        explanation: "passwd command changes user passwords",
        category: "users",
        difficulty: "easy"
    },
    {
        question: "What is the usual absolute path of the personal directory for user foo?",
        options: ["/home", "/home/foo", "/users/foo", "/user/foo"],
        correct: 1,
        explanation: "User home directories are typically in /home/username",
        category: "users",
        difficulty: "easy"
    },
    {
        question: "Which file contains the encrypted user passwords?",
        options: ["/etc/passwd", "/etc/shadow", "/etc/passwords", "/etc/secure"],
        correct: 1,
        explanation: "/etc/shadow stores encrypted passwords, readable only by root",
        category: "users",
        difficulty: "medium"
    },
    {
        question: "How do you add a user to an additional group?",
        options: ["useradd -g group user", "usermod -a -G group user", "groupadd user group", "adduser group user"],
        correct: 1,
        explanation: "usermod -a -G adds user to supplementary groups",
        category: "users",
        difficulty: "hard"
    }
];

// =============================================================================
// CATEGORY 8: NETWORKING
// =============================================================================
const networkingChallenges = [
    {
        question: "Which command tests connectivity to a remote host?",
        options: ["test", "ping", "connect", "reach"],
        correct: 1,
        explanation: "ping sends ICMP packets to test network connectivity",
        category: "networking",
        difficulty: "easy"
    },
    {
        question: "Which command can be used to resolve a DNS name to an IP address?",
        options: ["dnsname", "dns", "query", "host", "iplookup"],
        correct: 3,
        explanation: "host command performs DNS lookups",
        category: "networking",
        difficulty: "easy"
    },
    {
        question: "Which command is used to lookup the current IP address of a system?",
        options: ["less /proc/net/ipconfig", "ifconfig", "showip", "ipconfig", "sysinfo | grep ipaddress"],
        correct: 1,
        explanation: "ifconfig displays network interface configuration including IP addresses",
        category: "networking",
        difficulty: "medium"
    },
    {
        question: "Which network interface always exists in a Linux system?",
        options: ["eth0", "sit0", "wlan0", "vlan0", "lo"],
        correct: 4,
        explanation: "lo (loopback) interface always exists at 127.0.0.1",
        category: "networking",
        difficulty: "medium"
    },
    {
        question: "Which protocol is used for automatic IP address configuration?",
        options: ["NFS", "LDAP", "SMTP", "DNS", "DHCP"],
        correct: 4,
        explanation: "DHCP (Dynamic Host Configuration Protocol) assigns IP addresses automatically",
        category: "networking",
        difficulty: "easy"
    },
    {
        question: "A Linux computer has no internet access. Which command displays network gateway information?",
        options: ["traceroute", "ifconfig", "gateway", "route", "ipconfig"],
        correct: 3,
        explanation: "route command shows routing table including gateway information",
        category: "networking",
        difficulty: "medium"
    },
    {
        question: "What does SSH stand for?",
        options: ["Secure Shell", "System Shell", "Server Shell", "Simple Shell"],
        correct: 0,
        explanation: "SSH (Secure Shell) provides encrypted remote access",
        category: "networking",
        difficulty: "easy"
    },
    {
        question: "Which port does SSH typically use?",
        options: ["21", "22", "23", "25"],
        correct: 1,
        explanation: "SSH uses port 22 by default",
        category: "networking",
        difficulty: "easy"
    },
    {
        question: "Which command downloads files from the web?",
        options: ["get", "download", "wget", "fetch"],
        correct: 2,
        explanation: "wget downloads files from HTTP, HTTPS, and FTP",
        category: "networking",
        difficulty: "easy"
    },
    {
        question: "What is the loopback IP address?",
        options: ["192.168.1.1", "10.0.0.1", "127.0.0.1", "255.255.255.255"],
        correct: 2,
        explanation: "127.0.0.1 is the loopback address (localhost)",
        category: "networking",
        difficulty: "easy"
    },
    {
        question: "Which file contains hostname to IP address mappings?",
        options: ["/etc/hosts", "/etc/networks", "/etc/hostname", "/etc/resolv.conf"],
        correct: 0,
        explanation: "/etc/hosts contains static hostname to IP mappings",
        category: "networking",
        difficulty: "medium"
    }
];

// =============================================================================
// CATEGORY 9: LINUX FOUNDATIONS (Concepts, Distributions, Hardware, etc.)
// =============================================================================
const linuxFoundationsChallenges = [
    // Basic System Concepts
    {
        question: "Which of the following can be used to access the command line?",
        options: ["BIOS", "Terminal", "XWindow", "Firefox", "Xargs"],
        correct: 1,
        explanation: "Terminal provides direct access to the command line interface",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Where is the BIOS located?",
        options: ["RAM", "Hard drive", "Motherboard", "LCD Monitor"],
        correct: 2,
        explanation: "BIOS is firmware stored in a chip on the motherboard",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Which of the following is NOT a core component of the Linux kernel?",
        options: [
            "System call interface",
            "Process scheduler", 
            "Memory management",
            "Graphical user interface (GUI)"
        ],
        correct: 3,
        explanation: "GUIs like GNOME or KDE run on top of the kernel, not inside it",
        category: "linux-foundations",
        difficulty: "medium"
    },
    
    // Package Management
    {
        question: "Which package management tool is used in Red Hat-based Linux systems?",
        options: ["portage", "rpm", "apt-get", "dpkg", "packagectl"],
        correct: 1,
        explanation: "rpm (Red Hat Package Manager) is used in Red Hat/CentOS/Fedora",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "Which Linux distributions use the dpkg package management system? (Choose two)",
        options: ["SUSE", "Red Hat", "Debian", "Ubuntu", "Mandriva"],
        correct: [2, 3],
        explanation: "Debian and Ubuntu both use dpkg for package management",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "What is the preferred source for installing new applications in Linux?",
        options: [
            "The vendor's version management system",
            "A CD-ROM disk", 
            "The distribution's package repository",
            "The vendor's website",
            "A retail store"
        ],
        correct: 2,
        explanation: "Package repositories provide tested, compatible software for each distribution",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "After installing a new package, where are you most likely to find its configuration file?",
        options: ["/lib", "/conf", "/etc", "/usr", "/opt"],
        correct: 2,
        explanation: "/etc directory contains system-wide configuration files",
        category: "linux-foundations",
        difficulty: "easy"
    },
    
    // Directory Structure
    {
        question: "Which directories often contain documentation for installed packages?",
        options: ["/home", "/var", "/temp", "/dev", "/usr/share/doc/"],
        correct: 4,
        explanation: "/usr/share/doc/ contains documentation and example files",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Which directory is often used to store log files?",
        options: ["/home", "/var", "/temp", "/dev", "/usr"],
        correct: 1,
        explanation: "/var contains variable data including log files",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Which directory must be mounted with read and write access if it's on its own filesystem?",
        options: ["/opt", "/lib", "/etc", "/var", "/usr"],
        correct: 3,
        explanation: "/var contains changing data and must be writable",
        category: "linux-foundations",
        difficulty: "medium"
    },
    
    // Hardware & System Concepts
    {
        question: "What are the differences between hard disk drives and solid state disks? (Choose two)",
        options: [
            "Hard disks have moving parts, SSDs do not",
            "Hard disks can fail, SSDs cannot fail", 
            "SSDs store much more data than hard disks",
            "/dev/sda is hard disk, /dev/ssda is SSD",
            "SSDs provide faster access than hard disks"
        ],
        correct: [0, 4],
        explanation: "HDDs have moving parts and are slower; SSDs have no moving parts and are faster",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "Which type of bus can connect hard disk drives with the motherboard?",
        options: ["The RAM bus", "The NUMA bus", "The CPU bus", "The SATA bus", "The Auto bus"],
        correct: 3,
        explanation: "SATA (Serial ATA) is the standard interface for connecting storage devices",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Which device represents a hard disk partition?",
        options: ["/dev/ttyS0", "/dev/sata0", "/dev/part0", "/dev/sda2", "/dev/sda/p2"],
        correct: 3,
        explanation: "/dev/sda2 represents the second partition on the first SATA drive",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "Which hardware device links computers together to form an Ethernet LAN?",
        options: ["Server", "Switch", "Connector", "Access point", "Terminal"],
        correct: 1,
        explanation: "Switches connect multiple computers in a LAN",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Which is a combined audio/video interface for digital data transmission?",
        options: ["ATI", "DVD", "HDMI", "VGA", "DVI"],
        correct: 2,
        explanation: "HDMI carries both audio and video in a single digital cable",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Where is the operating system of a Raspberry Pi stored?",
        options: [
            "On the master device attached to the IDE bus",
            "On a read-only partition next to the BIOS", 
            "On a removable SD card",
            "On a Linux extension module connected to GPIO pins",
            "On built-in rewritable flash storage"
        ],
        correct: 2,
        explanation: "Raspberry Pi boots from SD card containing the OS",
        category: "linux-foundations",
        difficulty: "easy"
    },
    
    // Linux Distributions
    {
        question: "Which Linux distribution is used as a basis for Ubuntu Linux?",
        options: ["Red Hat Linux", "Arch Linux", "SUSE Linux", "Gentoo Linux", "Debian Linux"],
        correct: 4,
        explanation: "Ubuntu is based on Debian Linux",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Which Linux distribution is derived from Red Hat Enterprise Linux?",
        options: ["Raspbian", "openSUSE", "Debian", "Ubuntu", "CentOS"],
        correct: 4,
        explanation: "CentOS is derived from Red Hat Enterprise Linux source code",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "What is a Linux distribution?",
        options: [
            "The Linux file system as seen from root account",
            "A bundling of the Linux kernel, system utilities and other software", 
            "The set of rules governing Linux kernel source distribution",
            "An OS based on Linux but incompatible with the regular kernel",
            "Changes to Linux enabling it to run on different architectures"
        ],
        correct: 1,
        explanation: "A distribution packages the kernel with utilities, applications, and configuration",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "Which is a Linux-based operating system for mobile devices?",
        options: ["iOS", "CentOS", "Android", "Debian"],
        correct: 2,
        explanation: "Android is based on the Linux kernel",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Members of a team have Red Hat Enterprise Linux experience. For a hobby project without subscription costs, which distribution lets them apply the most knowledge?",
        options: ["Ubuntu Linux LTS", "Raspbian", "Debian GNU/Linux", "CentOS", "openSUSE"],
        correct: 3,
        explanation: "CentOS is binary-compatible with Red Hat Enterprise Linux",
        category: "linux-foundations",
        difficulty: "hard"
    },
    {
        question: "Which Ubuntu release is considered most stable for business purposes?",
        options: ["LTS", "Xubuntu", "Ubuntu Vanilla", "Kubuntu", "Xubuntu Server"],
        correct: 0,
        explanation: "LTS (Long Term Support) releases provide 5 years of support and updates",
        category: "linux-foundations",
        difficulty: "easy"
    },
    
    // Software Licensing
    {
        question: "What is defined by a Free Software license?",
        options: [
            "Technical documentation requirements for contributors",
            "Programming languages that may be used to extend the software", 
            "Complete list of required libraries for compilation",
            "Limits on purposes for which the software may be used",
            "Conditions for modifying and distributing the software"
        ],
        correct: 4,
        explanation: "Free software licenses define rights and obligations for use, modification, and distribution",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "Which statement about the General Public License (GPL) is true?",
        options: [
            "The GPL ensures that source code remains freely available",
            "The GPL is identical to the BSD license", 
            "GPL software may never be sold for money",
            "Changes must be sent to the original author for approval",
            "GPL software may not be used for critical systems"
        ],
        correct: 0,
        explanation: "GPL's main requirement is keeping source code freely available",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "What is a requirement of the GPL license but not the BSD license?",
        options: [
            "Users who modify and distribute must make modifications available under the same license",
            "Forbids removal of copyright and license notices", 
            "Contains a disclaimer of warranty",
            "Requires legal disputes be settled with the Free Software Foundation"
        ],
        correct: 0,
        explanation: "GPL requires derivative works to remain under GPL (copyleft)",
        category: "linux-foundations",
        difficulty: "hard"
    },
    {
        question: "What is true about open source software?",
        options: [
            "Open source software cannot be copied for free",
            "Open source software is available for commercial use", 
            "Freedom to redistribute must include binary forms but not source code",
            "Open source software is not for sale"
        ],
        correct: 1,
        explanation: "Open source software can be used commercially without restrictions",
        category: "linux-foundations",
        difficulty: "easy"
    },
    
    // Applications & Software
    {
        question: "Which program is NOT a graphical web browser?",
        options: ["Konqueror", "Firefox", "Links", "Opera", "Chrome"],
        correct: 2,
        explanation: "Links is a text-based browser, others are graphical",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "Which programs are web servers? (Choose two)",
        options: ["Apache HTTPD", "Postfix", "Curl", "Dovecot", "NGINX"],
        correct: [0, 4],
        explanation: "Apache HTTPD and NGINX are web servers",
        category: "linux-foundations",
        difficulty: "medium"
    },
    {
        question: "Which software package is an email server?",
        options: ["Postfix", "Thunderbird", "Apache", "GIMP", "MySQL"],
        correct: 0,
        explanation: "Postfix is a mail transfer agent (email server)",
        category: "linux-foundations",
        difficulty: "easy"
    },
    {
        question: "What does LAMP mean?",
        options: [
            "Linux Advanced Mode Programming Interface for developers",
            "Bus ID of USB device that emits light", 
            "Lightweight Access Management Protocol for network permissions",
            "The combination of Linux, Apache, MySQL, and PHP",
            "Lamport-clock important in distributed computing"
        ],
        correct: 3,
        explanation: "LAMP = Linux + Apache + MySQL + PHP web development stack",
        category: "linux-foundations",
        difficulty: "medium"
    }
];

// =============================================================================
// COMBINE ALL CHALLENGES INTO SINGLE ARRAY
// =============================================================================
const allLinuxChallenges = [
    ...fileOperationsChallenges,
    ...archivesChallenges,
    ...permissionsChallenges,
    ...textProcessingChallenges,
    ...shellChallenges,
    ...systemChallenges,
    ...usersChallenges,
    ...networkingChallenges,
    ...linuxFoundationsChallenges
];

// =============================================================================
// FINAL EXPORT - Everything the game needs
// =============================================================================
const completeLinuxContent = {
    // Main question database organized by category
    challenges: allLinuxChallenges,
    
    // Category-specific challenges
    categories: {
        'file-operations': fileOperationsChallenges,
        'archives': archivesChallenges,
        'permissions': permissionsChallenges,
        'text-processing': textProcessingChallenges,
        'shell': shellChallenges,
        'system': systemChallenges,
        'users': usersChallenges,
        'networking': networkingChallenges,
        'linux-foundations': linuxFoundationsChallenges
    },
    
    // Statistics
    stats: {
        totalQuestions: allLinuxChallenges.length,
        totalCategories: 9,
        questionsByCategory: {
            'file-operations': fileOperationsChallenges.length,
            'archives': archivesChallenges.length,
            'permissions': permissionsChallenges.length,
            'text-processing': textProcessingChallenges.length,
            'shell': shellChallenges.length,
            'system': systemChallenges.length,
            'users': usersChallenges.length,
            'networking': networkingChallenges.length,
            'linux-foundations': linuxFoundationsChallenges.length
        }
    },
    
    // Utility functions
    getQuestionsByCategory: (category) => {
        return completeLinuxContent.categories[category] || [];
    },
    
    getRandomQuestion: () => {
        return allLinuxChallenges[Math.floor(Math.random() * allLinuxChallenges.length)];
    },
    
    getCategoryForCommand: (command) => {
        const categories = {
            'ls': 'file-operations', 'cd': 'file-operations', 'pwd': 'file-operations',
            'find': 'file-operations', 'cp': 'file-operations', 'mv': 'file-operations',
            'rm': 'file-operations', 'touch': 'file-operations', 'mkdir': 'file-operations',
            
            'tar': 'archives', 'zip': 'archives', 'gzip': 'archives', 
            'unzip': 'archives', 'bzip2': 'archives',
            
            'chmod': 'permissions', 'chown': 'permissions', 'sudo': 'permissions',
            'umask': 'permissions', 'su': 'permissions',
            
            'grep': 'text-processing', 'sed': 'text-processing', 'awk': 'text-processing',
            'head': 'text-processing', 'tail': 'text-processing', 'sort': 'text-processing',
            'less': 'text-processing',
            
            'bash': 'shell', 'export': 'shell', 'echo': 'shell',
            'alias': 'shell', 'history': 'shell', 'man': 'shell',
            
            'ps': 'system', 'top': 'system', 'free': 'system',
            'df': 'system', 'du': 'system', 'dmesg': 'system',
            
            'useradd': 'users', 'passwd': 'users', 'id': 'users',
            'groups': 'users', 'usermod': 'users',
            
            'ping': 'networking', 'ssh': 'networking', 'wget': 'networking',
            'curl': 'networking', 'netstat': 'networking', 'ifconfig': 'networking'
        };
        return categories[command] || 'linux-foundations';
    }
};

// Validation and logging
console.log('🎮 SysAdmin Empire Content Loaded - Updated Version!');
console.log(`📚 ${completeLinuxContent.stats.totalQuestions} questions available`);
console.log('📊 Questions per category:');
Object.entries(completeLinuxContent.stats.questionsByCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} questions`);
});

// Export for use in the game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = completeLinuxContent; // Node.js
} else if (typeof window !== 'undefined') {
    window.completeLinuxContent = completeLinuxContent; // Browser
}