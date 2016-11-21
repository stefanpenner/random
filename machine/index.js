const PUSH  = 0;
const ADD = 1;
const PRINT = 2;
const POP = 3;
const PRINT_STACK = 4;

const STACK = [];

const SOURCE = [
  '$STACK.push($VAL);',
  '$STACK.push($STACK.pop() + $STACK.pop());',
  'console.log($STACK[$STACK.length - 1]);',
  '$STACK.pop();',
  'console.log($STACK);'
];

const PROCEDURES = SOURCE.map(source => new Function('$STACK', '$VAL', source));
// PROCEDURES.forEach( p => p([], 1)); // TODO: why is this slow

var MY_PROGRAM = [
  [PUSH, 1],
  [PUSH, 1],
  [ADD],
  [PRINT],
  [POP],
  [PRINT_STACK],
  [PUSH, 1],
  [PUSH, 1],
  [ADD],
  [PRINT],
  [POP],
  [PRINT_STACK],
]
var source = compile(MY_PROGRAM);

// console.log(source);

const program = new Function(source);
program();
console.time('compiled');
program();
console.timeEnd('compiled');

console.time('interpret');
interpret(MY_PROGRAM);
console.timeEnd('interpret');

function interpret(program) {
  for (let i = 0; i < program.length; i++) {
    let [op, value] = program[i];
    let procedure = PROCEDURES[op];
    // console.log(procedure.name, value);
    // console.log('STACK', STACK);
    procedure(STACK, value);
  }
}

function compile(program) {
  var result = 'let $VAL;\n';
  result += 'const $STACK = [];\n';
  for (let i = 0; i < program.length; i++) {
    let step = program[i];
    let [op, value] = step;
    let procedure = SOURCE[op];
    if (step.length > 1) {
      procedure = procedure.replace('$VAL', value);
    }
    result += procedure  +'\n';
  }
  return result;
}
