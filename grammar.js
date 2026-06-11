/**
 * @file Tree-sitter parser for my language, silicon.
 * @author Damien Wilson <djwilson7704@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
const PREC = {
  PAREN: -10,
  ASSIGN: -3,
  RANGE: -2,
  CONDITIONAL: -1,
  DEFAULT: 0,
  LOG_OR: 1,
  LOG_AND: 2,
  BIT_OR: 3,
  BIT_XOR: 4,
  BIT_AND: 5,
  RELATIONAL: 6,
  ADD: 7,
  SHIFT: 8,
  MULT: 9,
  CAST: 10,
  UNARY: 11,
  CALL: 12,
  MEMBER_ACCESS: 13,
  ARRAY_ACCESS: 14,
  CT_EXPR: 15,
};

export default grammar({
  name: "silicon",

  extras: $ => [
    /\s/,
    $.comment,
  ],

  inline: $ => [
    $._label_identifier,
    $._module_identifier,
    $._type_identifier,
    $._member_identifier,
    $._base_type,
  ],

  supertypes: $ => [
    $.expression,
    $.statement,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.identifier_expression, $.struct_init_expression]
  ],

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($.top_level),

    top_level: $ => seq(
      repeat($.attribute),
      optional($.visibility_token),
      optional('extern'),
      choice(
        $.function_definition,
        $.import_statement,
        $.module_definition,
        $.struct_union_definition,
        $.declaration_statement,
        $.enum_definition,
        $.typedef,
        $.ct_assert_statement,
        ';',
    )),

    attribute: $ => seq(
      $.attribute_name,
      optional($.argument_list),
    ),

    attribute_name: _ => /@[_A-Za-z][_0-9A-Za-z]*/,

    function_definition: $ => seq(
      'fn',
      optional(seq(field('method_type', $._type_identifier), '.')),
      field('name', $.identifier),
      $.function_signature,
      choice(';', $.compound_statement),
    ),

    import_statement: $ => seq(
      'import',
      $._module_identifier,
      repeat(seq('::', $._module_identifier)),
      optional(
        seq(
          '::', 
          choice(
            $.import_list,
            '*',
          ),
        ),
      ),
      ';'
    ),

    import_list: $ => seq(
      '{',
      commaSep1($._module_identifier),
      '}',
    ),

    module_definition: $ => seq(
      'mod',
      $._module_identifier,
      choice(
        ';',
        seq('{', repeat($.top_level), '}'),
      ),
    ),

    struct_union_definition: $ => seq(
      choice('struct', 'union'),
      optional($._type_identifier),
      '{',
      commaSep($.struct_member),
      optional(','),
      '}',
    ),

    struct_member: $ => seq(
      $._member_identifier,
      ':',
      $.type,
    ),

    enum_definition: $ => seq(
      'enum',
      optional('distinct'),
      $._type_identifier,
      optional(seq(':', $.type)),
      '{',
      commaSep($.enum_member),
      optional(','),
      '}',
    ),

    enum_member: $ => seq(
      field('member', $.identifier),
      optional(seq('=', $.expression)),
    ),

    typedef: $ => seq(
      'typedef',
      optional('distinct'),
      $._type_identifier,
      '=',
      $.type,
      ';'
    ),

    function_type: $ => seq(
      'fn',
      $.function_signature,
    ),

    function_signature: $ => seq(
      '(',
      commaSep(choice($.param_declaration, '...')),
      ')',
      field('return_type', $.type,),
    ),

    param_declaration: $ => seq(
      optional(seq(choice('_', field('name', $.identifier)), ':')),
      $.type,
    ),

    statement: $ => choice(
      $.compound_statement,
      $.switch_statement,
      $.while_statement,
      $.if_statement,
      $.for_statement,
      $.break_statement,
      $.continue_statement,
      $.result_statement,
      $.return_statement,
      $.declaration_statement,
      $.expression_statement,
      $.label_statement,
      $.ct_assert_statement,
      '#unreachable',
      ';',
    ),

    compound_statement: $ => seq(
      '{',
      repeat($.statement),
      '}',
    ),

    if_statement: $ => prec.right(1, seq(
      'if',
      field('condition', $.expression),
      field('then', $.compound_statement),
      optional(seq(
        'else', 
        field('else', 
          choice(
            $.compound_statement,
            $.if_statement,
          )
        )
      )),
    )),

    switch_statement: $ => seq(
      'switch',
      field('condition', $.expression),
      field('body', $.switch_body),
    ),

    switch_body: $ => seq(
      '{',
      repeat(choice(
        $.statement,
        $.case_statement,
        $.default_statement,
      )),
      '}'
    ),

    case_statement: $ => seq(
      'case',
      field('value', $.expression),
      ':'
    ),

    default_statement: _ => seq(
      'default',
      ':'
    ),

    while_statement: $ => seq(
      'while',
      field('condition', $.expression),
      field('body', $.compound_statement),
    ),

    // TODO: This will be subject to change
    for_statement: $ => seq(
      'for',
      field('loop_var', $.identifier),
      'in',
      field('range', $.expression),
      field('body', $.compound_statement),
    ),

    result_statement_no_semi: $ => seq(
      '=>',
      $.expression,
    ),

    result_statement: $ => seq(
      '=>',
      $.expression,
      ';'
    ),

    return_statement: $ => seq(
      'return',
      optional($.expression),
      ';'
    ),

    break_statement: $ => seq(
      'break',
      optional($._label_identifier),
      ';',
    ),

    continue_statement: $ => seq(
      'continue',
      optional($._label_identifier),
      ';',
    ),

    declaration_statement: $ => seq(
      choice('#const', 'const', 'var'),
      field('name', $.identifier),
      optional(seq(':', field('type', $.type))),
      optional(seq(
        '=',
        choice($.expression, $.void_expression),
      )),
      ';'
    ),

    expression_statement: $ => seq(
      $.expression,
      optional(seq(
        '<->',
        $.expression,
      )),
      ';'
    ),

    label_statement: $ => seq(
      $._label_identifier,
      ':',
    ),

    ct_assert_statement: $ => seq(
      '#assert',
      '(',
      field('condition', $.expression),
      ',',
      field('message', $.expression),
      ')',
    ),

    expression: $ => choice(
      $.if_expression,
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.postfix_expression,
      $.cast_expression,
      $.pointer_expression,
      $.call_expression,
      $.member_access_expression,
      $.inferred_member_expression,
      $.array_access_expression,
      $.array_init_expression,
      $.struct_init_expression,
      $.range_expression,
      $.ct_type_arg_expression,
      $.ct_type_equal_expression,
      $.ct_offsetof_expression,
      $.string,
      $.boolean_literal,
      $.number_literal,
      $.char_literal,
      $.null,
      $.parenthesized_expression,
      $.identifier_expression,
    ),
    
    if_expression: $ => prec.right(seq(
      'if',
      field('condition', $.expression),
      field('then', choice(
        $.compound_statement,
        $.result_statement_no_semi
      )),
      seq(
        'else', 
        field('else', 
          choice(
            $.compound_statement,
            $.if_statement,
            $.result_statement_no_semi
          )
        )
      ),
    )),

    assignment_expression: $ => prec.right(PREC.ASSIGN, seq(
      field('left', choice(
          $.identifier,
          $.member_access_expression,
          $.pointer_expression,
          $.array_access_expression,
          $.parenthesized_expression,
        ),
      ),
      field('operator', choice(
        '=',
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
        '|=',
        '^=',
        '&=',
        '<<=',
        '>>=',
        '>>>=',
      )),
      field('right', $.expression),
    )),

    binary_expression: $ => {
      const table = [
        ['+', PREC.ADD],
        ['-', PREC.ADD],
        ['*', PREC.MULT],
        ['/', PREC.MULT],
        ['%', PREC.MULT],
        ['||', PREC.LOG_OR],
        ['&&', PREC.LOG_AND],
        ['|', PREC.BIT_OR],
        ['^', PREC.BIT_XOR],
        ['&', PREC.BIT_AND],
        ['==', PREC.RELATIONAL],
        ['!=', PREC.RELATIONAL],
        ['>', PREC.RELATIONAL],
        ['>=', PREC.RELATIONAL],
        ['<=', PREC.RELATIONAL],
        ['<', PREC.RELATIONAL],
        ['<<', PREC.SHIFT],
        ['>>', PREC.SHIFT],
        ['>>>', PREC.SHIFT],
      ];

      return choice(...table.map(([operator, precedence]) => {
        return prec.left(precedence, seq(
          field('left', $.expression),
          // @ts-ignore
          field('operator', operator),
          field('right', $.expression),
        ));
      }));
    },
    
    unary_expression: $ => prec.left(PREC.UNARY, seq(
      field('operator', choice('!', '~', '-', '+', '++', '--')),
      field('argument', $.expression),
    )),

    postfix_expression: $ => prec.right(PREC.UNARY, seq(
      field('argument', $.expression),
      field('operator', choice('++', '--', '!')),
    )),

    cast_expression: $ => prec(PREC.CAST, seq(
      'cast',
      '<',
      field('type', $.type),
      '>',
      '(',
      field('value', $.expression),
      ')',
    )),

    pointer_expression: $ => prec.left(PREC.UNARY, seq(
      field('operator', choice('*', '&')),
      field('argument', $.expression),
    )),

    call_expression: $ => prec(PREC.CALL, seq(
      field('function', $.expression),
      field('arguments', $.argument_list),
    )),

    argument_list: $ => seq('(', commaSep($.expression), ')'),

    member_access_expression: $ => seq(
      prec(PREC.MEMBER_ACCESS, seq(
        field('parent', $.expression),
        choice('.', '->'),
      )),
      field('member', $._member_identifier),
    ),

    inferred_member_expression: $ => seq(
      '.',
      field('member', $._member_identifier),
    ),

    array_access_expression: $ => prec.left(PREC.ARRAY_ACCESS, seq(
      field('argument', $.expression),
      '[',
      field('index', $.expression),
      ']',
    )),

    array_init_expression: $ => seq(
      '[',
      commaSep(seq(optional(seq($.expression, ':')), $.expression)),
      optional(','),
      ']',
    ),

    struct_init_expression: $ => seq(
      repeat(seq($._module_identifier, '::')),
      $._type_identifier,
      '{',
      commaSep(seq($._member_identifier, ':', $.expression)),
      optional(','),
      '}',
    ),

    range_expression: $ => prec.right(PREC.RANGE, seq(
      field('start', $.expression),
      '..',
      field('end', $.expression),
    )),

    ct_type_arg_expression: $ => prec(PREC.CT_EXPR, seq(
      choice('#alignof', '#sizeof', '#type_max', '#type_min'),
      '(',
      field('type', $.type),
      ')'
    )),

    ct_type_equal_expression: $ => prec(PREC.CT_EXPR, seq(
      '#type_equal',
      '(',
      field('first', $.type),
      ',',
      field('second', $.type),
      ')'
    )),

    ct_offsetof_expression: $ => prec(PREC.CT_EXPR, seq(
      '#offsetof',
      '(',
      field('struct', $.type),
      ',',
      field('member', $._member_identifier),
      ')'
    )),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')',
    ),

    identifier_expression: $ => seq(
      repeat(seq($._module_identifier, '::')),
      $.identifier
    ),

    void_expression: _ => token('void'),

    type: $ => seq(
      repeat($.type_modifier),
      $._base_type,
    ),

    type_modifier: $ => choice(
      '*',
      seq('[', optional(choice('*', $.expression)), ']'),
      '?',
      'const',
    ),

    _base_type: $ => choice(
      $.primitive_type,
      $.typeof_type,
      seq(
        repeat(seq($._module_identifier, '::')),
        $._type_identifier,
      ),
      $.function_type,
    ),

    primitive_type: _ => token(choice(
      'void',
      'bool',
      'char',
      'byte',
      'ubyte',
      'short',
      'ushort',
      'int',
      'uint',
      'long',
      'ulong',
      'float',
      'double',
      'usize',
      'isize',
      'iptr',
      'uptr',
    )),

    typeof_type: $ => seq(
      '#typeof',
      '(',
      $.expression,
      ')',
    ),

    number_literal: _ => {
      const hex = /[0-9a-fA-F]/;
      const decimal = /[0-9]/;
      const hexDigits = seq(hex, repeat(choice('_', hex)));
      const decimalDigits = seq(decimal, repeat(choice('_', decimal)));
      return token(seq(
        optional('-'),
        choice(
          seq(
            choice(
              decimalDigits,
              seq(/0[bo]/, decimalDigits),
              seq('0x', hexDigits),
            ),
            optional(seq('.', hexDigits)),
          ),
          seq('.', decimalDigits),
        ),
        optional(seq(
          /[eEpP]/,
          optional(seq(
            optional('-'),
            hexDigits,
          )),
        )),
        /[fF]?/,
      ));
    },

    string: $ => choice(
      repeat1($.string_literal),
      $.raw_string_literal,
    ),

    string_literal: $ => seq(
      choice('u"', 'U"', '"'),
      repeat(choice(
        $.escape_sequence,
        token.immediate(prec(1, /[^\\"\n]+/)),
      )),
      '"',
    ),

    raw_string_literal: $ => seq(
      '`',
      repeat(token.immediate(prec(1, /[^`]+/))),
      '`',
    ),

    char_literal: $ => seq(
      choice('u\'', 'U\'', '\''),
      repeat1(choice(
        $.escape_sequence,
        token.immediate(/[^\n']/),
      )),
      '\'',
    ),

    escape_sequence: _ => token(seq(
      '\\',
      // FIXME: Temporary
      choice(
        /[abefnrtv'"0\\?]/,
        /o\d{1,3}/,
        /x[0-9a-fA-F]{1,4}/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/,
      ),
    )),


    _label_identifier: $ => alias($.identifier, $.label_identifier),
    _module_identifier: $ => alias($.identifier, $.module_identifier),
    _type_identifier: $ => alias($.identifier, $.type_identifier),
    _member_identifier: $ => alias($.identifier, $.member_identifier),

    visibility_token: _ => token(choice('priv', 'pub')),
    boolean_literal: _ => token(choice('true', 'false')),
    null: _ => token('null'),

    identifier: _ => /[_A-Za-z][_0-9A-Za-z]*/,
    enum_value_ident: _ => /[A-Z][_0-9A-Za-z]*/,

    comment: _ => token(choice(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),
  },
});

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
