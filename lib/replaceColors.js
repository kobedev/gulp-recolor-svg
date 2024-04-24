// Generated by CoffeeScript 1.12.7
(function() {
  var Color, INLINE_PROPERTY_MATCHER, SPECIAL_PAINT_TYPES, cheerio, css, parseInlineStyleSheet, stringifyInlineStyleSheet,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  cheerio = require("cheerio");

  Color = require("color");

  css = require("css");

  INLINE_PROPERTY_MATCHER = /^\s*([^:\s]+)\s*:\s*(.*?)\s*$/;

  SPECIAL_PAINT_TYPES = ["none", "currentcolor", "inherit"];

  parseInlineStyleSheet = function(inlineStyle) {
    return inlineStyle.split(";").map(function(rawProperty) {
      return rawProperty.match(INLINE_PROPERTY_MATCHER);
    }).filter(function(match) {
      return match != null;
    }).map(function(arg) {
      var i, property, value;
      i = arg.length - 2, property = arg[i++], value = arg[i++];
      return {
        property: property,
        value: value
      };
    });
  };

  stringifyInlineStyleSheet = function(declarations) {
    if (!(declarations.length > 0)) {
      return "";
    }
    return declarations.map(function(arg) {
      var property, value;
      property = arg.property, value = arg.value;
      return property + ":" + value;
    }).concat("").join(";");
  };

  module.exports = function(stringData, matchers, destColors) {
    var $, getNewColor, handleStyleSheet, i, len, propertiesToReplace, propertyToReplace, replacePropertiesInDeclarations;
    $ = cheerio.load(stringData, {
      xmlMode: true
    });
    propertiesToReplace = ["fill", "stroke"];
    getNewColor = function(stringColorValue) {
      var color, i, index, len, matcher, outputColor, ref;
      if (ref = stringColorValue.toLowerCase(), indexOf.call(SPECIAL_PAINT_TYPES, ref) >= 0) {
        return stringColorValue;
      }
      color = Color(stringColorValue);
      outputColor = stringColorValue;
      for (index = i = 0, len = matchers.length; i < len; index = ++i) {
        matcher = matchers[index];
        if (matcher(color)) {
          outputColor = destColors[index].hex();
        }
      }
      return outputColor;
    };
    replacePropertiesInDeclarations = function(declarations) {
      var declaration, i, len, ref, results;
      results = [];
      for (i = 0, len = declarations.length; i < len; i++) {
        declaration = declarations[i];
        if (ref = declaration.property, indexOf.call(propertiesToReplace, ref) >= 0) {
          results.push(declaration.value = getNewColor(declaration.value));
        }
      }
      return results;
    };
    handleStyleSheet = function(element) {
      var data, i, len, outputData, ref, rule;
      stringData = element.text();
      data = css.parse(stringData, {});
      ref = data.stylesheet.rules;
      for (i = 0, len = ref.length; i < len; i++) {
        rule = ref[i];
        replacePropertiesInDeclarations(rule.declarations);
      }
      outputData = css.stringify(data, {
        compress: true
      });
      return element.text(outputData);
    };
    $("style").each(function(index, element) {
      return handleStyleSheet($(element));
    });
    $("[style]").each(function(index, _element) {
      var data, element, inlineStyle, outputData;
      element = $(_element);
      inlineStyle = element.attr("style");
      data = parseInlineStyleSheet(inlineStyle);
      replacePropertiesInDeclarations(data);
      outputData = stringifyInlineStyleSheet(data);
      return element.attr("style", outputData);
    });
    for (i = 0, len = propertiesToReplace.length; i < len; i++) {
      propertyToReplace = propertiesToReplace[i];
      $("[" + propertyToReplace + "]").each(function(index, _element) {
        var element;
        element = $(_element);
        return element.attr(propertyToReplace, getNewColor(element.attr(propertyToReplace)));
      });
    }
    return $.xml();
  };

}).call(this);