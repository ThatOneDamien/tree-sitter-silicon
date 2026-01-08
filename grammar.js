/**
 * @file Tree-sitter parser for my language, silicon.
 * @author Damien Wilson <djwilson7704@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "silicon",

  extras: $ => [
    /\s/,
    $.comment,
  ],

  inline: $ => [
    $._module_identifier,
  ],

  // supertypes: $ => [
  //   $.expression,
  //   $.statement,
  // ],

  word: $ => $.identifier,

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($.top_level),

    top_level: $ => choice(
      $.function_definition,
      $.import_statement,
    ),

    function_definition: $ => seq(
      'fn',
      field('symbol', $.identifier),
      '(',
      // Params,
      ')',
      '{',
      '}'
    ),

    import_statement: $ => seq(
      'import',
      repeat(seq($._module_identifier, '::')),
      $.identifier,
      ';'
    ),

    _module_identifier: $ => alias($.identifier, $.module_identifier),

    identifier: _ => /[_A-Za-z][_0-9A-Za-z]*/,

    comment: _ => token(choice(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
  },
});
