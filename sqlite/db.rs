
use std::io;
use std::io::Write;
use std::process;

fn repl() {
    loop {
        let mut input = String::new();

        print!("hi > ");


        io::stdout().flush().unwrap();
        io::stdin().read_line(&mut input).unwrap();

        if input.trim() == ".exit" {
            process::exit(0);
        } else {
            println!("Unrecognized command '{}'.", input.trim());
        }
    }
}

fn main() {
    repl()
}
