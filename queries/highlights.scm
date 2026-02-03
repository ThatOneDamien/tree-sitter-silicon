((identifier) @variable
  (#set! priority 95))

(module_identifier) @module
(member_identifier) @property

[
  ; "bitfield"
  "distinct"
  "enum"
  "struct"
  "typedef"
  "union"
] @keyword.type

[
  "break"
  "continue"
  ; "for"
  "while"
] @keyword.repeat

[
  "case"
  "default"
  "else"
  "if"
  "switch"
] @keyword.conditional

[
  "import"
  "mod"
] @keyword.import

[
  "cast"
  "#typeof"
] @keyword.operator

"fn" @keyword.function
"return" @keyword.return

([
  "#alignof"
  "#assert"
  "#offsetof"
  "#sizeof"
  "#typeof"
  "#unreachable"
] @keyword.directive
 (#set! priority 95))

[
  "#alignof"
  "#assert"
  "#offsetof"
  "#sizeof"
] @function.builtin

[
  ; "extern"
  (visibility_token)
] @keyword.modifier


[
  ";"
  ":"
  ","
  "."
  "::"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

"..." @punctuation.special

[
  "="
  "-"
  "*"
  "/"
  "+"
  "%"
  "~"
  "|"
  "&"
  "^"
  "<<"
  ">>"
  ">>>"
  "->"
  "<->"
  "<"
  "<="
  ">="
  ">"
  "=="
  "!="
  "!"
  "&&"
  "||"
  "-="
  "+="
  "*="
  "/="
  "%="
  "|="
  "&="
  "^="
  ">>="
  ">>>="
  "<<="
  "--"
  "++"
] @operator

(cast_expression
  [
    "<"
    ">"
  ] @punctuation.bracket
  (#set! priority 105))

(primitive_type) @type.builtin
(auto_type) @type.builtin

(type_identifier) @type

(escape_sequence) @string.escape
(string_literal) @string
(number_literal) @number
(char_literal) @character
(boolean_literal) @boolean

(attribute) @attribute


(nullptr) @constant.builtin

(function_definition
  name: (identifier) @function)

(function_signature
  return_value: (identifier) @variable.parameter)

(param_declaration
  name: (identifier) @variable.parameter)

(comment) @comment
