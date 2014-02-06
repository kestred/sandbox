import os, sys, resource, fcntl

def daemonize(pid, action, keep_fds=[], *args, **kwargs):
    process_id = os.fork()
    if process_id < 0:
        sys.exit(1)
    elif process_id != 0:
        sys.exit(0)

    # Stop listening for signals that the parent process receives.
    # setsid puts the process in a new parent group and detaches its controlling terminal.
    process_id = os.setsid()
    if process_id == -1:
        sys.exit(1)

    # Close all file descriptors, except the ones mentioned in self.keep_fds.
    devnull = "/dev/null"
    if hasattr(os, "devnull"):
        devnull = os.devnull

    for fd in range(resource.getrlimit(resource.RLIMIT_NOFILE)[0]):
        if fd not in keep_fds:
            try:
                os.close(fd)
            except OSError:
                pass

    os.open(devnull, os.O_RDWR)
    os.dup(0)
    os.dup(0)

    # Set umask to default to safe file permissions when running as a root daemon. 027 is an
    # octal number which we are typing as 0o27 for Python3 compatibility.
    os.umask(0o27)

    # Change to a known directory. If this isn't done, starting a daemon in a subdirectory that
    # needs to be deleted results in "directory busy" errors.
    os.chdir("/")

    # Create a lockfile so that only one instance of this daemon is running at any time.
    lockfile = open(pid, "w")

    # Try to get an exclusive lock on the file. This will fail if another process has the file
    # locked.
    fcntl.lockf(lockfile, fcntl.LOCK_EX | fcntl.LOCK_NB)

    # Record the process id to the lockfile. This is standard practice for daemons.
    lockfile.write("%s" % (os.getpid()))
    lockfile.flush()

    # Start the daemon
    action(*args, **kwargs)
