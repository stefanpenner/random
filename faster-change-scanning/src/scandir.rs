#[macro_use]
extern crate syscall;

fn scandir(fd: usize, buf: &[u8]) {
    unsafe {
        syscall!(SCANDIR, fd, buf.as_ptr(), buf.len());
    }
}
