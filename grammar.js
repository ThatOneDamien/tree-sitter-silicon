/**
 * @file Tree-sitter parser for my language, silicon.
 * @author Damien Wilson <djwilson7704@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
const PREC = {
  PAREN: -10,
  ASSIGN: -2,
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

  conflicts: $ => [
    [$.type, $.expression],
  ],

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

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($.top_level),

    top_level: $ => seq(
      repeat($.attribute),
      optional($.visibility_token),
      choice(
        $.function_definition,
        $.import_statement,
        $.module_definition,
        $.struct_union_definition,
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
      repeat($.struct_member),
      '}',
    ),

    struct_member: $ => seq(
      $.type,
      commaSep1($._member_identifier),
      ';',
    ),

    enum_definition: $ => seq(
      'enum',
      optional('distinct'),
      $._type_identifier,
      '{',
      // $.enum_member,
      '}',
    ),

    typedef: $ => seq(
      'typedef',
      optional('distinct'),
      $._type_identifier,
      '=',
      choice(
        $.type,
        $.function_type,
      ),
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
      optional(seq('->', $.type, optional(field('return_value', $.identifier)))),
    ),

    param_declaration: $ => seq(
      $.type,
      optional(field('name', $.identifier)),
    ),

    statement: $ => choice(
      $.compound_statement,
      $.if_statement,
      $.switch_statement,
      $.while_statement,
      $.break_statement,
      $.continue_statement,
      $.return_statement,
      $.declaration_statement,
      $.expression_statement,
      $.ct_assert_statement,
      '#unreachable',
      ';',
    ),

    compound_statement: $ => seq(
      '{',
      repeat($.statement),
      '}',
    ),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $.expression),
      field('then', $.compound_statement),
      optional(seq('else', field('else', $.compound_statement))),
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
      $.type,
      commaSep1(seq(
        $.identifier,
        optional(seq(
          '=',
          $.expression,
        )),
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

    ct_assert_statement: $ => seq(
      '#assert',
      '(',
      field('condition', $.expression),
      ',',
      field('message', $.expression),
      ')',
    ),

    expression: $ => choice(
      $.conditional_expression,
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.postfix_expression,
      $.cast_expression,
      $.pointer_expression,
      $.call_expression,
      $.member_access_expression,
      $.array_access_expression,

      $.ct_alignof_expression,
      $.ct_offsetof_expression,
      $.ct_sizeof_expression,
      $.string,
      $.boolean_literal,
      $.number_literal,
      $.char_literal,
      $.nullptr,
      $.parenthesized_expression,
      $.identifier,
    ),
    
    conditional_expression: $ => prec.right(PREC.CONDITIONAL, seq(
      field('condition', $.expression),
      '?',
      optional(field('then', $.expression)),
      ':',
      field('else', $.expression),
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
      field('operator', choice('++', '--')),
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
        field('argument', $.expression),
        field('operator', choice('.', '->')),
      )),
      field('field', $._member_identifier),
    ),

    array_access_expression: $ => prec(PREC.ARRAY_ACCESS, seq(
      field('argument', $.expression),
      '[',
      field('index', $.expression),
      ']',
    )),

    ct_alignof_expression: $ => prec(PREC.CT_EXPR, seq(
      '#alignof',
      '(',
      field('type', $.type),
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

    ct_sizeof_expression: $ => prec(PREC.CT_EXPR, seq(
      '#sizeof',
      '(',
      field('type', $.type),
      ')'
    )),


    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')',
    ),

    type: $ => seq(
      $._base_type,
      repeat($.type_modifier),
    ),

    type_modifier: $ => choice(
      '*',
      seq('[', optional(choice('*', $.expression)), ']'),
    ),

    _base_type: $ => choice(
      $.primitive_type,
      $.auto_type,
      $.typeof_type,
      seq(
        repeat(seq($._module_identifier, '::')),
        $._type_identifier,
      ),
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

    auto_type: _ => token('auto'),

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
            optional(seq('.', optional(hexDigits))),
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

    string: $ => repeat1(
      $.string_literal
    ),

    string_literal: $ => seq(
      choice('u"', 'U"', '"'),
      repeat(choice(
        $.escape_sequence,
        token.immediate(prec(1, /[^\\"\n]+/)),
      )),
      '"',
    ),

    char_literal: $ => seq(
      '\'',
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
    nullptr: _ => token('nullptr'),

    identifier: _ => /[_A-Za-z][_0-9A-Za-z]*/,

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
