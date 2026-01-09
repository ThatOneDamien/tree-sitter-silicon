((identifier) @variable
  (#set! priority 95))

(module_identifier) @module

[
  ; "as"
  ; "auto"
  ; "bitfield"
  ; "break"
  ; "case"
  ; "const"
  ; "continue"
  ; "default"
  ; "distinct"
  ; "else"
  ; "enum"
  ; "extern"
  ; "false"
  "fn"
  ; "for"
  ; "goto"
  ; "if"
  "import"
  "mod"
  ; "nullptr"
  (visibility_token)
  ; "return"
  ; "struct"
  ; "switch"
  ; "true"
  ; "typedef"
  ; "union"
  ; "while"
] @keyword

[
  ";"
  ; ":"
  ; ","
  ; "."
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
  ; "="
  ; "-"
  "*"
  ; "/"
  ; "+"
  ; "%"
  ; "~"
  ; "|"
  ; "&"
  ; "^"
  ; "<<"
  ; ">>"
  ; ">>>"
  "->"
  ; "<->"
  ; "<"
  ; "<="
  ; ">="
  ; ">"
  ; "=="
  ; "!="
  ; "!"
  ; "&&"
  ; "||"
  ; "-="
  ; "+="
  ; "*="
  ; "/="
  ; "%="
  ; "|="
  ; "&="
  ; "^="
  ; ">>="
  ; ">>>="
  ; "<<="
  ; "--"
  ; "++"
] @operator

(primitive_type) @type.builtin

(type_identifier) @type

(number_literal) @number

(boolean_literal) @boolean

(nullptr) @constant.builtin

(function_definition
  symbol: (identifier) @function)

(function_signature
  return_value: (identifier) @variable.parameter)

(param_declaration
  symbol: (identifier) @variable.parameter)

(comment) @comment
