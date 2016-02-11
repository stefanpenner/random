just a spike

async cleanup is problematic, during cleanup a process can be forced to exist
(crash). This is an experiment to see if we can safely be better custodians of
trash we create.

some thoughts:

* before deleting a tmpdir, move it to the tmpdir (so if something goes really
  bad, eventually it will be pruned on reboot or cleanup task)
* delete the tmpdir async
* if on startup we discover other processes have left in an untidy state, lets
  help them complete their cleanup (but async)

* track what files are created, to we can double check that they are cleanedup
* leave a file representing if a process if active (obviously if it is really
  fucked up, this wont work)
* if a paths file is present, buts it process file is not we must assume
  * those files might be in the process of being deleted
  * we should ensure on startup that we clean them up

- [ ] just implement all the tmpdir stuff here
- [ ] attempt to wait for rimraf to complete
- [ ] better debug warnings
- [ ] tests
- [ ] more auditing and playing
