// Based on
// https://github.com/smikes/test262-parser/blob/62944f8d000ce7685b917cb7c061301a391a949c/lib/parser.js
// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.
'use strict';

const yaml = require('js-yaml');
const yamlStart = '/*---';
const yamlEnd = '---*/';

/**
 * filename
 * @property {string} file
 */
/**
 * test code
 * @property {string} contents
 */
/**
 * parsed, normalized attributes
 * @property {Object} attrs
 */
/**
 * copyright message
 * @property {string} copyright
 */

/**
 * list of harness files to include
 * @attribute {Array} includes
 */
/**
 * test flags; valid values include:
 *   - onlyStrict
 *   - noStrict
 * @attribute {Object} flags
 */
/**
 * author name
 * @attribute {String} author
 * @optional
 */

class Test262File {
  constructor(descriptor) {

    if (!descriptor.file) {
      throw new Error('Test262File: descriptor is missing "file"');
    }

    if (!descriptor.contents) {
      throw new Error('Test262File: descriptor is missing "contents"');
    }

    Object.assign(this, descriptor);

    this.attrs = normalizeAttrs(loadAttrs(this));
    this.copyright = extractCopyright(this);
    this.contents = extractBody(this);
  }
}
/**
 * Extract copyright message
 *
 * @method extractCopyright
 * @param {Test262File} file - file object
 * @return {string} the copyright string extracted from contents
 * @private
 */
function extractCopyright(test262File) {
  const result = /^(?:(?:\/\/.*\n)*)/.exec(test262File.contents);

  return result ? result[0] : '';
}

/**
 * Extract YAML frontmatter from a test262 test
 * @method extractYAML
 * @param {string} text - text of test file
 * @return {string} the YAML frontmatter or empty string if none
 */
function extractYAML(text) {
  let start = text.indexOf(yamlStart);
  let end;

  if (start > -1) {
    end = text.indexOf(yamlEnd);
    return text.substring(start + 5, end);
  }

  return '';
}

/**
 * Extract test body
 *
 * @method extractBody
 * @param {Test262File} file - file object
 * @return {string} the test body (after all frontmatter)
 * @private
 */
function extractBody(file) {
  let start = file.contents.indexOf(yamlEnd);

  if (start > -1) {
    return file.contents.substring(start + 5);
  }

  return file.contents;
}

/**
 * Extract and parse frontmatter from a test
 * @method loadAttrs
 * @param {Test262File} file - file object
 * @return {Object} - raw, unnormalized attributes
 * @private
 */
function loadAttrs(file) {
  let extracted = extractYAML(file.contents);

  if (extracted) {
    try {
      return yaml.load(extracted);
    } catch (e) {
      throw new Error(`Error loading frontmatter from file ${file.file}\n${e.message}`);
    }
  }

  return {};
}

/**
 * Normalize attributes; ensure that flags, includes exist
 *
 * @method normalizeAttrs
 * @param {Object} attrs raw, unnormalized attributes
 * @return {Test262FileAttrs} normalized attributes
 * @private
 */
function normalizeAttrs(attrs) {
  attrs.flags = attrs.flags || [];
  attrs.flags = attrs.flags.reduce((acc, v) => {
    acc[v] = true;
    return acc;
  }, {});

  attrs.includes = attrs.includes || [];

  return attrs;
}

function parseFile(file) {
  return new Test262File(file);
}


parseFile.extractYAML = extractYAML;
module.exports = parseFile;

