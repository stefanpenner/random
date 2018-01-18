#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct InputBuffer {
  char* buffer;
  size_t buffer_length;
  ssize_t input_length;
} InputBuffer;

InputBuffer* InputBuffer_new() {
  InputBuffer* input_buffer = malloc(sizeof(InputBuffer));
  input_buffer->buffer = NULL;
  input_buffer->buffer_length = 0;
  input_buffer->input_length = 0;

  return input_buffer;
}

InputBuffer* InputBuffer_fromInput() {
  InputBuffer* input = InputBuffer_new();

  ssize_t read = getline(&(input->buffer), &(input->buffer_length), stdin);

  // Ignore trailing newline
  input->input_length = read - 1;
  input->buffer[read - 1] = 0;
  return input;
}

int InputBuffer_equal(InputBuffer* input, char* buffer) {
  return strcmp(input->buffer, buffer);
}

void InputBuffer_print(InputBuffer* input) {
  printf("%s\n", input->buffer);
}

void InputBuffer_free(InputBuffer* input) {
  free(input->buffer);
  free(input);
}
void printPrompt() {
  printf("hi > ");
}

int main() {
  while (1) {
    printPrompt();

    InputBuffer* input = InputBuffer_fromInput();

    if (InputBuffer_equal(input, ".exit") == 0) {
      exit(EXIT_SUCCESS);
    } else {
      printf("Unrecognized command '%s'.\n", input->buffer);;
    }

    InputBuffer_free(input);
  }
}
