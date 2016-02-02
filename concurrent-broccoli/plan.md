given the patch-dsl, we should decouple the API from sync experience. Enabling
concurrrent or even streaming file operations. This aims to fully utilize OS
and hardware concurrency.

The key will be relying on the patch-dsl's decoupling.

Order is also important, we must be sure the teardown and re-construction of
the FS topology is correctly orderd.

Strictly speaking the algorithm may be as follows: (Although in practice, other
affordances are possible)

Largely, the teardown of a tree must be depth-first, and re-construction must
be breadth-first. FS-tree already provides the ordering we require.

Additionally now, we aim to provide only concurrency at a per-plugin basis, a
plugin will only begin building if its inputs have reached their final state,
and its outputs will only begin building once its own input has reached its
final state.

### throttling

If we are to use available concurrency, we should be sure to avoid
over-saturation. A good rule of thumb, is to limit potentially parallism to the
number of available cores, but further experimentation is required. We can
likely assume, CPU instensive tasks should have a hard upper limit (available
cores), but IO related concurrecny will need further experimentation.

### Parallism

We should take advantage of available parallism.

For CPU bound tasks:

* node, processes (most important)
* jxcore, tasks (fun to experiment with)

For IO bound tasks:

* in-theory libuv on either node or jxcore should be sufficient
* benchmarks for the following will be needed:
  * tree reading


### Creation

### Teardown

To reduce potential latency of a large tree teardown, we can utilize the final
state constraint, by simply moving large trees out of the outputPath, and
asynchronously deleting them. The deletion could also be deferred to a idle
moments between builds. Worst case, if the ostmpdir is used, the OS will
eventually clean them up. Although that may be true, we should do our best to
correctly purge no-longer needed files and directories.



