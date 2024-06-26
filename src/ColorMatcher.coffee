Color = require("color")
convert = require("color-convert")

# Uses CIE76 from https://en.wikipedia.org/wiki/Color_difference
# The smaller the return value, the more similar the colors--2.6 is the minimum
# perceptable difference.
colorDifference = (firstColor, secondColor) ->
  firstColorLabComponents = convert.rgb.lab.raw(firstColor.rgb().array())
  secondColorLabComponents = convert.rgb.lab.raw(secondColor.rgb().array())

  sumOfDifferencesSqaured = firstColorLabComponents.map (value, index) ->
    value - secondColorLabComponents[index]
  .map (value) ->
    value ** 2
  .reduce (sum, value) ->
    sum + value
  , 0

  return sumOfDifferencesSqaured ** 0.5

module.exports = (colorToMatch, maxDifference = 0.1) ->

  (color) ->
    difference = colorDifference(colorToMatch, color)
    return difference <= maxDifference
