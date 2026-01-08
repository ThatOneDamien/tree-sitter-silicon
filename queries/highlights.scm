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
  ; "module"
  ; "nullptr"
  ; "priv"
  ; "pub"
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
  ; "["
  ; "]"
  "{"
  "}"
] @punctuation.bracket

(function_definition
  symbol: (identifier) @function)

(comment) @comment
