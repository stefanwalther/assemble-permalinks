'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('isobject', 'isObject');
require('mixin-deep', 'merge');
require('placeholders');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
