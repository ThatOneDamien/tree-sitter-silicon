((identifier) @variable
  (#set! priority 95))

(module_identifier) @module
(member_identifier) @property

[
  "var"
  "const"
  "#const"
] @keyword

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
  "for"
  "in"
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
  "#const"
  "#offsetof"
  "#sizeof"
  "#type_equal"
  "#type_max"
  "#type_min"
  "#typeof"
  "#unreachable"
] @keyword.directive
 (#set! priority 95))

[
  "#alignof"
  "#assert"
  "#offsetof"
  "#sizeof"
  "#type_equal"
  "#type_max"
  "#type_min"
] @function.builtin

[
  "extern"
  (visibility_token)
] @keyword.modifier


[
  ";"
  ":"
  ","
  "."
  "::"
  ".."
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
  "=>"
  "<->"
  "<"
  "<="
  ">="
  ">"
  "=="
  "!="
  "!"
  "?"
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

[
  (primitive_type)
  (void_expression)
] @type.builtin

(type_identifier) @type

(escape_sequence) @string.escape
(string_literal) @string
(raw_string_literal) @string
(number_literal) @number
(char_literal) @character
(boolean_literal) @boolean

(attribute) @attribute

(label_identifier) @label

(null) @constant.builtin

(enum_member
  member: (identifier) @constant)

(member_access_expression
  parent: (identifier_expression
            (identifier) @type)
  member: (member_identifier) @constant
  (#match? @constant "^[A-Z]"))

(inferred_member_expression
  member: (member_identifier) @constant)

(function_definition
  name: (identifier) @function)

(call_expression
  function: (identifier_expression 
              (identifier) @function))

(call_expression
  function: (member_access_expression
              member: (member_identifier) @function))

(param_declaration
  name: (identifier) @variable.parameter)

(comment) @comment
