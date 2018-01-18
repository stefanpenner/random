use std::io;
use std::io::Write;
use std::process;

fn main() {
    // repl
    //
    loop {
        print!("hi > ");

        let mut input = String::new();

        io::stdout().flush().unwrap();
        io::stdin().read_line(&mut input).unwrap();

        if input.trim() == ".exit" {
            process::exit(0);
        } else {
            println!("Unrecognized command '{}'.", input.trim());
        }
    }
}
