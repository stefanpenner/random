use std::collections::BTreeMap;
fn apple<'a>() -> &'a str {
  "hello world"
}

// fn print(map: Some) {
//   for (key, value) in map.iter() {
//     println!("{}:{}", key, value);
//   }
// }

fn print_vect(v: &Vec<u32>) {
  for i in v {
    println!("{}", i);
  }
}

fn print_btree(v: &Some) {
  for i in v.iter() {
    println!("{}", i);
  }
}

fn main() {
  let string = apple();
  let v = vec![1,2,3];
  let mut b = BTreeMap::new();

  b.insert(1, "a");


  print_vect(&v);
  print_btree(&v);

  println!("{}", string)
}
