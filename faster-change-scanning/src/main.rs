use std::fs::read_dir;
use std::path::PathBuf;
use std::env;
use std::os::unix::fs::MetadataExt;
use std::collections::HashMap;

extern crate notify;

use notify::{RecommendedWatcher, Error, Watcher};

use std::sync::mpsc::channel;
use std::thread;

// test
// build a DS of all entries
// print it
//  - text
//  - json
// cleanup
// set
//  - root
//  - map of path -> entry
//  - fs.events to update tree
//  - calculated changesets
//  - handle concurrency safely
//  - cursor (likely via tree versions)
//  tree
//    https://doc.rust-lang.org/std/collections/struct.BTreeMap.html
//  - ordered change operations
//    entry {
//      txn: u64
//    }
fn scan(path: &str) -> u32 {
  _scan(PathBuf::from(path), PathBuf::from(""))
}

fn _scan(path: PathBuf, root: PathBuf) -> u32 {
  let mut count = 0;
  for entry_res in read_dir(path).unwrap() {
    let entry = entry_res.unwrap();
    count += 1;
    // let file_name_buf = entry.file_name();
    // let file_name = file_name_buf.to_str().unwrap();
    if entry.file_type().unwrap().is_dir() {
      count += _scan(entry.path(), root.clone());
    } else {
      let meta = entry.metadata().unwrap();
      // print!("relative_path: {:?}, size: {}, mode: {}, mtime: {}", entry.path().to_str(), meta.size(), meta.mode(), meta.mtime());
      // println!("");
    }
  }

  count
}

fn main() {

  // new tree
  // listen for changes
  //  if a change occurs, fill job queue with change tasks
  //  if dropped, schedule task
  // crawl
  //  flush job queue
  if let Some(arg1) = env::args().nth(1) {
    println!("{}", scan(&arg1));

    // for (key, value) in files.iter() {
    //   println!("{}:{}", key, value);
    // }
  } else {
    println!("needs arg");
  }
  // Create a channel to receive the events.
  let (tx, rx) = channel();

  // Automatically select the best implementation for your platform.
  // You can also access each implementation directly e.g. INotifyWatcher.
  let mut w: Result<RecommendedWatcher, Error> = Watcher::new(tx);

  match w {
    Ok(mut watcher) => {
      // Add a path to be watched. All files and directories at that path and
      // below will be monitored for changes.
      watcher.watch("../../ember-cli");
      watcher.watch("../../ember-cli");

      let count = 0;
      loop {
        let val = rx.recv();
        // update tree
        println!("{:?}", val.unwrap());
      }
    },

    Err(e) => println!("Error")
  }
}
