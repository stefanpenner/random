#include <stdio.h>
#include <stdlib.h>
#include <dirent.h>

int main(void) {
  struct dirent **namelist;
  int n = scandir("../../ember-cli", &namelist, NULL, alphasort);
  if (n < 0)
    perror("scandir");
  else {
    while (n--) {
      printf("%s\n", namelist[n]->d_mtime);
    }
  }
}
