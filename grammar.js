/**
 * @file Tree-sitter parser for my language, silicon.
 * @author Damien Wilson <djwilson7704@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  PAREN_DECLARATOR: -10,
  ASSIGNMENT: -2,
  TERNARY: -1,
  DEFAULT: 0,
  LOGICAL_OR: 1,
  LOGICAL_AND: 2,
  BIT_OR: 3,
  BIT_XOR: 4,
  BIT_AND: 5,
  EQUAL: 6,
  RELATIONAL: 7,
  OFFSETOF: 8,
  ADD: 9,
  SHIFT: 10,
  MULTIPLY: 11,
  CAST: 12,
  SIZEOF: 13,
  UNARY: 14,
  CALL: 15,
  FIELD: 16,
  SUBSCRIPT: 17,
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
      optional($.visibility_token),
      choice(
        $.function_definition,
        $.import_statement,
        $.module_definition,
        ';',
    )),

    function_definition: $ => seq(
      'fn',
      field('symbol', $.identifier),
      $.function_signature,
      choice(';', $.compound_statement),
    ),

    import_statement: $ => seq(
      'import',
      repeat(seq($._module_identifier, '::')),
      choice(
        $.identifier,
        $.import_list,
        '*',
      ),
      ';'
    ),

    import_list: $ => seq(
      '{',
      commaSep1($.identifier),
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

    function_signature: $ => seq(
      '(',
      commaSep(choice($.param_declaration, '...')),
      ')',
      optional(seq('->', $.type, optional(field('return_value', $.identifier)))),
    ),

    param_declaration: $ => seq(
      $.type,
      optional(field('symbol', $.identifier)),
    ),

    statement: $ => choice(
      $.compound_statement,
      $.break_statement,
      $.continue_statement,
      $.nop_statement,
    ),

    compound_statement: $ => seq(
      '{',
      repeat($.statement),
      '}',
    ),

    for_statement: $ => seq(
      'for',

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

    nop_statement: _ => token(';'),

    expression: $ => choice(
      $.boolean_literal,
      $.number_literal,
      $.char_literal,
      $.nullptr,
      $.parenthesized_expression,
      $.identifier,
    ),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')',
    ),

    type: $ => seq(
      $.base_type,
      repeat($.type_modifier),
    ),

    type_modifier: $ => choice(
      '*',
      seq('[', $.expression, ']'),
    ),

    base_type: $ => choice(
      $.primitive_type,
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

    char_literal: $ => seq(
      '\'',
      repeat1(choice(
        $.escape_sequence,
        alias(token.immediate(/[^\n']/), $.character),
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
