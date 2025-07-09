// Study Guide Content for Learn2Win Linux Game
const STUDY_GUIDE_CONTENT = {
    sections: [
        {
            id: 'welcome',
            title: 'Linux Study Guide',
            icon: '🖥️',
            content: `
<h3>Welcome to Learn2Win!</h3>
<p>This comprehensive study guide covers all Linux concepts in the game, organized by the 9 mastery categories. Use this guide to master Linux commands and dominate the game board!</p>

<h3>🎮 How to Use This Guide</h3>
<ul>
<li><strong>Navigation</strong> - Click any category button above to jump to that section</li>
<li><strong>Structure</strong> - Each section covers one game category with all its commands</li>
<li><strong>Visual Cues</strong>:
  <ul>
    <li>💡 <strong>Tips</strong> = Key points and shortcuts for the game</li>
    <li>📌 <strong>Remember</strong> = Frequently tested concepts and gotchas</li>
  </ul>
</li>
<li><strong>Code Examples</strong> - Shows actual command usage with explanations</li>
<li><strong>Practice</strong> - Use Terminal Practice mode to test commands hands-on</li>
</ul>

<h3>🏆 Quick Game Strategy</h3>
<ul>
<li><strong>Focus on weak areas</strong> - The HOME square gives questions from your struggling categories</li>
<li><strong>Master the basics first</strong> - File Operations appear most frequently</li>
<li><strong>Use special squares wisely</strong>:
  <ul>
    <li>🎯 <strong>Challenge</strong> (top-right) - Worth 2x progress!</li>
    <li>🎲 <strong>Wild</strong> (bottom-right) - Random effects</li>
    <li>⚡ <strong>Power</strong> (bottom-left) - Bonus actions</li>
  </ul>
</li>
<li><strong>Save tokens strategically</strong> - Use them for retries on important questions</li>
</ul>

<h3>📚 Study Recommendations</h3>
<ol>
<li><strong>Start with File Operations</strong> - Foundation for everything else</li>
<li><strong>Learn command patterns</strong> - Many options repeat across commands:
  <ul>
    <li><code>-r</code> = recursive (works with many commands)</li>
    <li><code>-f</code> = force/file (context dependent)</li>
    <li><code>-h</code> = human-readable (for sizes)</li>
    <li><code>-n</code> = numeric/number related</li>
  </ul>
</li>
<li><strong>Practice command combinations</strong> - Pipes (<code>|</code>) and redirects (<code>></code>) are powerful</li>
<li><strong>Memorize key numbers</strong>:
  <ul>
    <li>Permission: 755 (rwxr-xr-x), 644 (rw-r--r--)</li>
    <li>Ports: SSH=22, HTTP=80, HTTPS=443</li>
    <li>UIDs: root=0, regular users=1000+</li>
  </ul>
</li>
</ol>

<div class="tip-box">
<h4>💡 Pro Tip:</h4>
<p>Use the mnemonic devices throughout this guide - they're designed to help you remember commands during the game. For example: <code>pwd</code> = <strong>P</strong>rint <strong>W</strong>orking <strong>D</strong>irectory</p>
</div>

<div class="remember-box">
<h4>📌 Remember:</h4>
<ul>
<li>Linux is case-sensitive - <code>File.txt</code> ≠ <code>file.txt</code></li>
<li>Everything in Linux is a file (even devices!)</li>
<li>The game tests real Linux knowledge - this guide works for actual Linux too!</li>
</ul>
</div>
`
        },
        {
            id: 'file-operations',
            title: 'FILE OPERATIONS',
            icon: '📁',
            content: `
<h3>Essential Commands</h3>
<ul>
<li><strong>pwd</strong> - <strong>P</strong>rint <strong>W</strong>orking <strong>D</strong>irectory (shows current location)</li>
<li><strong>cd</strong> - <strong>C</strong>hange <strong>D</strong>irectory
  <ul>
    <li><code>cd</code> or <code>cd ~</code> - go to home directory</li>
    <li><code>cd ..</code> - go up one level (parent directory)</li>
    <li><code>cd -</code> - return to previous directory</li>
  </ul>
</li>
<li><strong>ls</strong> - <strong>L</strong>i<strong>S</strong>t contents
  <ul>
    <li><code>ls -a</code> - show <strong>a</strong>ll files (including hidden)</li>
    <li><code>ls -l</code> - <strong>l</strong>ong format with details</li>
    <li><code>ls -la</code> - combine both options</li>
  </ul>
</li>
</ul>

<h3>File Management</h3>
<ul>
<li><strong>cp</strong> - <strong>C</strong>o<strong>P</strong>y files
  <ul>
    <li><code>cp file1 file2</code> - copy file</li>
    <li><code>cp -r dir1 dir2</code> - copy directory <strong>r</strong>ecursively</li>
    <li><code>cp *.txt /tmp/</code> - copy all .txt files</li>
  </ul>
</li>
<li><strong>mv</strong> - <strong>M</strong>o<strong>V</strong>e or rename
  <ul>
    <li><code>mv old new</code> - rename file</li>
    <li><code>mv ~/summer-vacation ~/vacation/2011</code> - move directory with contents</li>
  </ul>
</li>
<li><strong>rm</strong> - <strong>R</strong>e<strong>M</strong>ove files
  <ul>
    <li><code>rm -r directory</code> - remove <strong>r</strong>ecursively</li>
    <li><code>rm -f file</code> - <strong>f</strong>orce removal</li>
  </ul>
</li>
<li><strong>touch</strong> - create empty file or update timestamp</li>
<li><strong>mkdir</strong> - <strong>M</strong>a<strong>K</strong>e <strong>DIR</strong>ectory
  <ul>
    <li><code>mkdir -p parent/child</code> - create <strong>p</strong>arent directories if needed</li>
  </ul>
</li>
<li><strong>rmdir</strong> - <strong>R</strong>e<strong>M</strong>ove empty <strong>DIR</strong>ectory</li>
</ul>

<h3>Finding & Viewing Files</h3>
<ul>
<li><strong>find</strong> - search for files
  <ul>
    <li><code>find . -name "filename"</code> - search current directory</li>
    <li><code>find ~ -name "*.pdf"</code> - find all PDFs in home</li>
    <li><code>find /home -type d -name "folder"</code> - find directories only</li>
  </ul>
</li>
<li><strong>cat</strong> - con<strong>CAT</strong>enate files
  <ul>
    <li><code>cat -n file</code> - show with line <strong>n</strong>umbers</li>
  </ul>
</li>
<li><strong>head</strong> - show first 10 lines
  <ul>
    <li><code>head -n 20 file</code> - show first 20 lines</li>
  </ul>
</li>
<li><strong>tail</strong> - show last 10 lines
  <ul>
    <li><code>tail -n 1 file</code> - show last 1 line</li>
    <li><code>tail -f file</code> - <strong>f</strong>ollow file (monitor changes)</li>
  </ul>
</li>
<li><strong>less</strong> - view file with paging
  <ul>
    <li><code>/pattern</code> - search forward</li>
    <li><code>n</code> - next match</li>
    <li><code>q</code> - quit</li>
  </ul>
</li>
</ul>

<h3>Wildcards & Patterns</h3>
<ul>
<li><code>*</code> - matches any characters (e.g., <code>*.txt</code>)</li>
<li><code>?</code> - matches single character (e.g., <code>file?.txt</code>)</li>
<li><code>[A-Z]*</code> - matches files starting with capital letter</li>
<li><code>[abc]</code> - matches any character in brackets</li>
</ul>

<div class="remember-box">
<h4>📌 Remember:</h4>
<ul>
<li>Linux is case-sensitive! <code>Access.txt</code> ≠ <code>access.txt</code></li>
<li><code>.</code> = current directory, <code>..</code> = parent directory</li>
<li>Files starting with <code>.</code> are hidden</li>
<li>Absolute paths start with <code>/</code>, relative paths don't</li>
<li><code>sort file > file</code> empties the file because <code>></code> truncates before reading!</li>
</ul>
</div>
`
        },
        {
            id: 'archives',
            title: 'ARCHIVES',
            icon: '📦',
            content: `
<h3>tar (Tape Archive)</h3>
<h4>Creating Archives:</h4>
<ul>
<li><code>tar -cf archive.tar files/</code> - <strong>c</strong>reate <strong>f</strong>ile</li>
<li><code>tar -czf archive.tar.gz files/</code> - create with g<strong>z</strong>ip</li>
<li><code>tar -cjf archive.tar.bz2 files/</code> - create with bzip2 (<strong>j</strong>)</li>
<li><code>tar -cJf archive.tar.xz files/</code> - create with xz (<strong>J</strong>)</li>
</ul>

<h4>Extracting Archives:</h4>
<ul>
<li><code>tar -xf archive.tar</code> - e<strong>x</strong>tract <strong>f</strong>ile</li>
<li><code>tar -xzf archive.tar.gz</code> - extract g<strong>z</strong>ipped</li>
<li><code>tar -xjf archive.tar.bz2</code> - extract bzip2</li>
<li><code>tar -tf archive.tar</code> - lis<strong>t</strong> contents</li>
</ul>

<h3>Other Compression Tools</h3>
<ul>
<li><strong>zip/unzip</strong> - Windows-compatible compression
  <ul>
    <li><code>zip archive.zip file1 file2</code> - create zip</li>
    <li><code>unzip archive.zip</code> - extract zip</li>
  </ul>
</li>
<li><strong>gzip/gunzip</strong> - GNU compression (.gz files)</li>
<li><strong>bzip2/bunzip2</strong> - Better compression, slower (.bz2 files)</li>
</ul>

<div class="tip-box">
<h4>💡 Tip:</h4>
<p>tar only archives by default - add -z/-j/-J for compression!</p>
</div>
`
        },
        {
            id: 'permissions',
            title: 'PERMISSIONS',
            icon: '🔒',
            content: `
<h3>Permission Basics</h3>
<h4>Three permission sets:</h4>
<ul>
<li><strong>User</strong> (owner)</li>
<li><strong>Group</strong></li>
<li><strong>Others</strong></li>
</ul>

<h4>Three permission types:</h4>
<ul>
<li><strong>r</strong> (read) = 4</li>
<li><strong>w</strong> (write) = 2</li>
<li><strong>x</strong> (execute) = 1</li>
</ul>

<h3>chmod - Change Mode</h3>
<h4>Numeric mode:</h4>
<ul>
<li><code>chmod 755 file</code> = rwxr-xr-x</li>
<li><code>chmod 644 file</code> = rw-r--r--</li>
<li><code>chmod 600 file</code> = rw-------</li>
<li><code>chmod 777 file</code> = rwxrwxrwx</li>
</ul>

<h4>Symbolic mode:</h4>
<ul>
<li><code>chmod u+x file</code> - add e<strong>x</strong>ecute for <strong>u</strong>ser</li>
<li><code>chmod g-w file</code> - remove <strong>w</strong>rite for <strong>g</strong>roup</li>
<li><code>chmod o=r file</code> - set <strong>o</strong>thers to <strong>r</strong>ead only</li>
</ul>

<h3>Special Permissions</h3>
<ul>
<li><strong>Sticky bit</strong> (<code>t</code>) - Only file owner can delete in shared directories
  <ul>
    <li><code>/tmp</code> has permissions <code>rwxrwxrwt</code></li>
    <li>Set with: <code>chmod +t directory</code></li>
  </ul>
</li>
<li><strong>SUID</strong> (<code>s</code>) - Execute with owner's permissions</li>
<li><strong>SGID</strong> (<code>s</code>) - Execute with group's permissions</li>
</ul>

<h3>Ownership Commands</h3>
<ul>
<li><strong>chown</strong> - <strong>CH</strong>ange <strong>OWN</strong>er
  <ul>
    <li><code>chown user file</code></li>
    <li><code>chown user:group file</code></li>
  </ul>
</li>
<li><strong>chgrp</strong> - <strong>CH</strong>ange <strong>GR</strong>ou<strong>P</strong></li>
<li><strong>sudo</strong> - Execute as superuser</li>
<li><strong>su</strong> - Switch user</li>
</ul>

<div class="remember-box">
<h4>📌 Remember:</h4>
<ul>
<li>Every file has exactly ONE owner and ONE group</li>
<li>For directories, <code>x</code> means you can enter/access it</li>
<li>When a user is deleted, files show UID number instead of username</li>
</ul>
</div>
`
        },
        {
            id: 'text-processing',
            title: 'TEXT PROCESSING',
            icon: '📝',
            content: `
<h3>Searching & Patterns</h3>
<ul>
<li><strong>grep</strong> - Search text patterns
  <ul>
    <li><code>grep pattern file</code> - basic search</li>
    <li><code>grep -i pattern file</code> - case-<strong>i</strong>nsensitive</li>
    <li><code>grep -n pattern file</code> - show line <strong>n</strong>umbers</li>
    <li><code>grep -r pattern dir/</code> - <strong>r</strong>ecursive search</li>
    <li><code>grep -v pattern file</code> - in<strong>v</strong>ert match</li>
    <li><code>grep "^start" file</code> - lines starting with "start"</li>
    <li><code>grep "end$" file</code> - lines ending with "end"</li>
    <li><code>grep '[Ff]red' file</code> - matches Fred or fred</li>
  </ul>
</li>
</ul>

<h3>Text Manipulation</h3>
<ul>
<li><strong>sed</strong> - <strong>S</strong>tream <strong>ED</strong>itor
  <ul>
    <li><code>sed 's/old/new/' file</code> - replace first occurrence</li>
    <li><code>sed 's/old/new/g' file</code> - replace all (<strong>g</strong>lobal)</li>
  </ul>
</li>
<li><strong>awk</strong> - Pattern processing
  <ul>
    <li><code>awk '{print $1}'</code> - print first field</li>
  </ul>
</li>
<li><strong>sort</strong> - Sort lines alphabetically
  <ul>
    <li><code>sort -n</code> - sort <strong>n</strong>umerically</li>
    <li><code>sort -r</code> - <strong>r</strong>everse order</li>
  </ul>
</li>
<li><strong>uniq</strong> - Remove duplicate adjacent lines
  <ul>
    <li><code>uniq -c</code> - show <strong>c</strong>ount</li>
  </ul>
</li>
<li><strong>wc</strong> - <strong>W</strong>ord <strong>C</strong>ount
  <ul>
    <li><code>wc -l</code> - count <strong>l</strong>ines</li>
    <li><code>wc -w</code> - count <strong>w</strong>ords</li>
    <li><code>wc -c</code> - count <strong>c</strong>haracters</li>
  </ul>
</li>
</ul>

<h3>Redirection & Pipes</h3>
<ul>
<li><code>></code> - Redirect output (overwrite)</li>
<li><code>>></code> - Redirect output (append)</li>
<li><code><</code> - Read input from file</li>
<li><code>|</code> - Pipe output to next command</li>
<li><code>2></code> - Redirect errors</li>
<li><code>&></code> - Redirect both output and errors</li>
<li><code>2>&1</code> - Redirect errors to where output goes</li>
<li><code>command > output.txt 2>/dev/null</code> - Save output, discard errors</li>
</ul>

<div class="tip-box">
<h4>💡 Tip:</h4>
<p><code>sort data.txt > data.txt</code> empties the file because <code>></code> truncates immediately!</p>
</div>
`
        },
        {
            id: 'shell',
            title: 'SHELL & SCRIPTING',
            icon: '🐚',
            content: `
<h3>Shell Basics</h3>
<ul>
<li><strong>Shell prompts:</strong>
  <ul>
    <li><code>$</code> = regular user</li>
    <li><code>#</code> = root user</li>
  </ul>
</li>
<li><strong>Exit codes:</strong>
  <ul>
    <li><code>0</code> = success</li>
    <li>Any other number = error</li>
    <li>Check with: <code>echo $?</code></li>
  </ul>
</li>
</ul>

<h3>Important Variables</h3>
<ul>
<li><code>$HOME</code> - Home directory</li>
<li><code>$PATH</code> - Command search path</li>
<li><code>$SHELL</code> - Current shell</li>
<li><code>$USER</code> - Current username</li>
<li><code>$PWD</code> - Current directory</li>
</ul>

<h3>Shell Commands</h3>
<ul>
<li><strong>echo</strong> - Display text
  <ul>
    <li><code>echo -n</code> - no newline</li>
  </ul>
</li>
<li><strong>export</strong> - Make variable available to child processes
  <ul>
    <li><code>export PATH=/new/dir:$PATH</code></li>
  </ul>
</li>
<li><strong>alias</strong> - Create shortcuts</li>
<li><strong>history</strong> - Show command history
  <ul>
    <li><code>history -c</code> - <strong>c</strong>lear history</li>
  </ul>
</li>
<li><strong>man</strong> - <strong>Man</strong>ual pages</li>
<li><strong>info</strong> - Alternative help system</li>
</ul>

<h3>Shell Scripting</h3>
<h4>Script basics:</h4>
<pre><code>#!/bin/bash          # Shebang - MUST be first line
# This is a comment

NAME="value"         # Set variable
echo "$NAME"         # Use variable
DATE=$(date)         # Command substitution
</code></pre>

<h4>Script arguments:</h4>
<ul>
<li><code>$0</code> - Script name</li>
<li><code>$1</code>, <code>$2</code> - First, second arguments</li>
<li><code>$#</code> - Number of arguments</li>
<li><code>$@</code> - All arguments</li>
</ul>

<h4>Control structures:</h4>
<pre><code># For loop
for i in a b c; do
    echo -n \${i}     # Output: abc
done

# If statement
if [ condition ]; then
    commands
fi

# Case statement
case $variable in
    pattern) commands;;
    *) default;;
esac
</code></pre>

<div class="remember-box">
<h4>📌 Remember:</h4>
<ul>
<li>Scripts need executable permission: <code>chmod +x script.sh</code></li>
<li>Run with: <code>./script.sh</code></li>
<li><code>\</code> continues a line</li>
</ul>
</div>
`
        },
        {
            id: 'system',
            title: 'SYSTEM MONITORING',
            icon: '📊',
            content: `
<h3>Process Management</h3>
<ul>
<li><strong>ps</strong> - <strong>P</strong>rocess <strong>S</strong>tatus
  <ul>
    <li><code>ps</code> - current shell processes</li>
    <li><code>ps aux</code> - all processes</li>
  </ul>
</li>
<li><strong>top</strong> - Real-time process viewer
  <ul>
    <li>Shows processes ordered by CPU/RAM usage</li>
    <li>Press <code>q</code> to quit</li>
  </ul>
</li>
<li><strong>kill</strong> - Terminate process
  <ul>
    <li><code>kill PID</code> - send SIGTERM</li>
    <li><code>kill -9 PID</code> - force kill (SIGKILL)</li>
  </ul>
</li>
<li><strong>pidof</strong> - Find PID of named process</li>
</ul>

<h3>System Resources</h3>
<ul>
<li><strong>free</strong> - Memory usage
  <ul>
    <li><code>free -h</code> - <strong>h</strong>uman-readable</li>
  </ul>
</li>
<li><strong>df</strong> - <strong>D</strong>isk <strong>F</strong>ree space
  <ul>
    <li><code>df -h</code> - <strong>h</strong>uman-readable</li>
  </ul>
</li>
<li><strong>du</strong> - <strong>D</strong>isk <strong>U</strong>sage
  <ul>
    <li><code>du -sh directory</code> - <strong>s</strong>ummary, <strong>h</strong>uman-readable</li>
  </ul>
</li>
<li><strong>dmesg</strong> - Kernel messages (boot messages, hardware errors)</li>
<li><strong>uptime</strong> - System uptime and load average</li>
<li><strong>vmstat</strong> - Virtual memory statistics</li>
</ul>

<h3>Important Directories</h3>
<ul>
<li><code>/proc/</code> - Process information (one directory per PID)</li>
<li><code>/sys/</code> - System and device information</li>
<li><code>/var/log/</code> - Log files</li>
</ul>

<div class="tip-box">
<h4>💡 Tip:</h4>
<p>Load average shows average number of processes waiting to run</p>
</div>
`
        },
        {
            id: 'users',
            title: 'USER MANAGEMENT',
            icon: '👥',
            content: `
<h3>User Commands</h3>
<ul>
<li><strong>useradd</strong> - Add user
  <ul>
    <li><code>useradd -m username</code> - create with home directory</li>
    <li><code>useradd -M username</code> - no home directory</li>
    <li><code>useradd -d /path username</code> - custom home</li>
  </ul>
</li>
<li><strong>usermod</strong> - Modify user
  <ul>
    <li><code>usermod -a -G group user</code> - <strong>a</strong>dd to <strong>G</strong>roup</li>
  </ul>
</li>
<li><strong>userdel</strong> - Delete user
  <ul>
    <li><code>userdel -r username</code> - remove home too</li>
  </ul>
</li>
<li><strong>passwd</strong> - Change password</li>
<li><strong>id</strong> - Show user/group IDs</li>
<li><strong>groups</strong> - Show group memberships</li>
</ul>

<h3>Important Files</h3>
<ul>
<li><code>/etc/passwd</code> - User accounts (NOT passwords!)
  <ul>
    <li>Contains: username, UID, GID, home, shell</li>
  </ul>
</li>
<li><code>/etc/shadow</code> - Encrypted passwords</li>
<li><code>/etc/group</code> - Group definitions</li>
<li><code>/etc/skel/</code> - Template for new user homes</li>
</ul>

<h3>User Facts</h3>
<ul>
<li><strong>UID 0</strong> = root (superuser)</li>
<li><strong>UID 1000+</strong> = regular users</li>
<li>Home directories: <code>/home/username</code></li>
<li>Every user belongs to at least one group</li>
<li>Passwords are hashed, not encrypted</li>
</ul>

<div class="remember-box">
<h4>📌 Remember:</h4>
<p>When user is deleted, their files remain but show UID number</p>
</div>
`
        },
        {
            id: 'networking',
            title: 'NETWORKING',
            icon: '🌐',
            content: `
<h3>Network Commands</h3>
<ul>
<li><strong>ping</strong> - Test connectivity
  <ul>
    <li><code>ping -c 4 host</code> - send 4 packets</li>
  </ul>
</li>
<li><strong>ifconfig</strong> - Show/configure network interfaces</li>
<li><strong>ip addr</strong> - Modern alternative to ifconfig</li>
<li><strong>netstat</strong> - Network statistics
  <ul>
    <li><code>netstat -tuln</code> - show listening ports</li>
  </ul>
</li>
<li><strong>route</strong> - Show routing table (gateway info)</li>
<li><strong>ssh</strong> - <strong>S</strong>ecure <strong>Sh</strong>ell
  <ul>
    <li>Default port: <strong>22</strong></li>
    <li><code>ssh user@host</code></li>
  </ul>
</li>
</ul>

<h3>DNS Tools</h3>
<ul>
<li><strong>host</strong> - Simple DNS lookup</li>
<li><strong>nslookup</strong> - Query DNS servers</li>
<li><strong>dig</strong> - Detailed DNS information</li>
</ul>

<h3>File Transfer</h3>
<ul>
<li><strong>wget</strong> - Download files from web</li>
<li><strong>curl</strong> - Transfer data from URLs</li>
<li><strong>scp</strong> - Secure copy over SSH</li>
</ul>

<h3>Important Concepts</h3>
<ul>
<li><strong>lo</strong> - Loopback interface (always exists)
  <ul>
    <li>IP: <strong>127.0.0.1</strong> (localhost)</li>
  </ul>
</li>
<li><strong>DHCP</strong> - Dynamic Host Configuration Protocol (automatic IP assignment)</li>
<li><code>/etc/hosts</code> - Local hostname to IP mappings</li>
</ul>
`
        },
        {
            id: 'linux-foundations',
            title: 'LINUX FOUNDATIONS',
            icon: '🐧',
            content: `
<h3>System Architecture</h3>
<ul>
<li><strong>Kernel</strong> - Core OS, interfaces with hardware</li>
<li><strong>Daemon</strong> - Background process without user interaction</li>
<li><strong>BIOS</strong> - Basic Input/Output System
  <ul>
    <li>Located on motherboard (in ROM/EEPROM)</li>
  </ul>
</li>
<li><strong>Terminal</strong> - Provides command line access</li>
</ul>

<h3>Linux Distributions</h3>
<h4>Debian-based:</h4>
<ul>
<li>Debian → Ubuntu</li>
<li>Uses <strong>dpkg</strong> and <strong>apt</strong> package management</li>
</ul>

<h4>Red Hat-based:</h4>
<ul>
<li>Red Hat Enterprise Linux → CentOS</li>
<li>Uses <strong>rpm</strong> and <strong>yum/dnf</strong> package management</li>
</ul>

<h4>Special Purpose:</h4>
<ul>
<li>Android - Linux-based mobile OS</li>
<li>Raspberry Pi OS - Debian-based for Raspberry Pi (boots from SD card)</li>
</ul>

<h3>Package Management</h3>
<ul>
<li><strong>Preferred source</strong>: Distribution's package repository</li>
<li><strong>Config files location</strong>: <code>/etc/</code></li>
<li><strong>Documentation</strong>: <code>/usr/share/doc/</code></li>
</ul>

<h3>Hardware & Devices</h3>
<ul>
<li><strong>Storage devices</strong>: <code>/dev/sda</code>, <code>/dev/sdb</code> (first, second disk)</li>
<li><strong>Partitions</strong>: <code>/dev/sda1</code>, <code>/dev/sda2</code> (first, second partition)</li>
<li><strong>SATA</strong> - Interface connecting hard drives to motherboard</li>
<li><strong>HDMI</strong> - Combined audio/video digital interface</li>
<li><strong>Switch</strong> - Links computers in Ethernet LAN</li>
</ul>

<h3>File System</h3>
<ul>
<li><code>/</code> - Root directory</li>
<li><code>/boot</code> - Kernel and boot files</li>
<li><code>/etc</code> - Configuration files</li>
<li><code>/home</code> - User home directories</li>
<li><code>/var</code> - Variable data (logs, etc.)</li>
<li><code>/tmp</code> - Temporary files (cleared on reboot)</li>
<li><code>/proc</code> - Process information</li>
<li><code>/sys</code> - System/device information</li>
</ul>

<h3>Software & Licensing</h3>
<p><strong>LAMP Stack</strong> = Linux + Apache + MySQL + PHP</p>

<h4>License Types:</h4>
<ul>
<li><strong>GPL</strong> - Must share source code with modifications</li>
<li><strong>BSD</strong> - Less restrictive, no source sharing requirement</li>
<li><strong>Open Source</strong> - Available for commercial use</li>
</ul>

<h4>Applications:</h4>
<ul>
<li>Web servers: Apache HTTPD, NGINX</li>
<li>Mail server: Postfix</li>
<li>Text browsers: Links, Lynx</li>
<li>Graphical browsers: Firefox, Chrome, Opera</li>
</ul>

<div class="tip-box">
<h4>💡 Tip:</h4>
<p>LTS = Long Term Support (most stable for business)</p>
</div>
`
        },
        {
            id: 'quick-reference',
            title: 'QUICK COMMAND REFERENCE',
            icon: '📋',
            content: `
<h3>Most Used Commands</h3>
<pre><code># Navigation
cd ~                # Go home
pwd                 # Where am I?
ls -la              # List all with details

# Files
cp -r src/ dst/     # Copy directory
mv old new          # Rename/move
rm -rf dir/         # Force remove directory
find . -name "*.txt" # Find text files

# Permissions
chmod 755 script.sh # Make executable
chown user:group file # Change ownership

# Archives
tar -czf backup.tar.gz files/ # Create compressed
tar -xzf backup.tar.gz        # Extract

# Text
grep -i "error" log.txt # Case-insensitive search
sort file | uniq        # Sort and deduplicate

# System
ps aux | grep process  # Find process
df -h                  # Disk space
free -h                # Memory usage

# Network
ping -c 4 google.com   # Test connectivity
ssh user@server        # Remote login
</code></pre>

<h3>🎯 GAME SUCCESS TIPS</h3>
<ol>
<li><strong>Master the basics first</strong> - File operations are foundation</li>
<li><strong>Learn command patterns</strong> - Many use similar options (-r = recursive, -f = force/file)</li>
<li><strong>Remember mnemonics</strong> - pwd = Print Working Directory</li>
<li><strong>Practice wildcards</strong> - <code>*</code>, <code>?</code>, <code>[A-Z]</code> appear often</li>
<li><strong>Know the numbers</strong> - Permissions (755), ports (SSH=22), UIDs (root=0)</li>
<li><strong>Understand redirection</strong> - <code>></code> overwrites, <code>>></code> appends, <code>|</code> pipes</li>
</ol>

<div class="tip-box" style="text-align: center; font-size: 1.2em;">
<p>Good luck, future Linux master! 🐧✨</p>
</div>
`
        }
    ]
};

// Function to get the study guide section by category
function getStudyGuideSection(categoryId) {
    return STUDY_GUIDE_CONTENT.sections.find(s => s.id === categoryId);
}

// Function to get all sections
function getAllStudyGuideSections() {
    return STUDY_GUIDE_CONTENT.sections;
}