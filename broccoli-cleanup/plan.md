relatively straight-froward, basically we should add crash protection to
broccoli builds, but rather then doing it on a per file basis, we can likely do
it on a per temp-directory basis.

While creating all input/output dir, we should log this in some predictable
location. Something like $TMPDIR/broccoli-logs/<process-id>.log

1. <process-id>.log should contain a list of directories known to be created by broccoli
2. on successful teardown, this file should be purged.
3. successful teardown should have purged all the files the log contained
4. on startup, this directory should be scanned.
4.1 for all entries in this directories, extract the PID. If no such PID is
running, the current process should attempt to safely destroy the files which
it contains. If successful, it should also purge the corresponding file.
4.2 the purging of these files, should assume more then one process may b
e purging those files. Although slightly sloppy, this does simply things nicely
as its optimistic nature assumes no conflict, but if there is, it should
gracefully handle it.




