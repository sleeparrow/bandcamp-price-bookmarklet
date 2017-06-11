(function() {
  function add(x, y) { return x + y; }
  function getLast(arr) { return arr[arr.length - 1]; }
  function getInnerText(el) { return el.innerText; }

  function stringifyWithTwoDigits(n) {
    if (n < 10) { return '0' + n; }
    return '' + n;
  }

  var whatToPay = (function() {
    // I would pay `d1` dollars for `m1` minutes of light ambient music.
    var d1 = 10;
    var m1 = 55;

    // I would pay `d2` dollars for `m2` minutes of dense progressive rock.
    var d2 = 10;
    var m2 = 25;

    // convert from dollars per minute to pennies per second.
    // the (100 / 60) is 100 pennies per dollar and 1/60 minute per second
    var penniesPerSecondLow = (d1 / m1) * (100 / 60);
    var penniesPerSecondHigh = (d2 / m2) * (100 / 60);

    return function(s) {
      return [s * penniesPerSecondLow, s * penniesPerSecondHigh].map(Math.floor);
    };
  })();

  function parseTimeToSeconds(timeString) {
    var components = timeString.split(':').reverse();
    var totalSeconds = 0;

    totalSeconds += +components[0];
    if (components.length === 1) { return totalSeconds; }

    totalSeconds += +components[1] * 60;
    if (components.length === 2) { return totalSeconds; }

    totalSeconds += +components[2] * 60 * 60;
    if (components.length === 3) { return totalSeconds; }

    totalSeconds += +components[3] * 24 * 60 * 60;
    if (components.length === 4) { return totalSeconds; }

    throw new RangeError("Track duration has too many components (items separated by ':')");
  }

  function extractComponent(n, unit) {
    var component = Math.floor(n / unit);
    return [component, n - component * unit];
  }

  function formatTimeFromSeconds(s) {
    var d, h, m;
    [d, s] = extractComponent(s, 24 * 60 * 60);
    [h, s] = extractComponent(s, 60 * 60);
    [m, s] = extractComponent(s, 60);
    var components = [s, m, h, d];
    for (;;) {
      var n = getLast(components);
      if (n !== 0) { break; }
      components.pop();
    }
    return components.reverse().map(stringifyWithTwoDigits).join(':');
  }

  function formatPriceFromPennies(pennies) {
    var dollars = Math.floor(pennies / 100);
    pennies -= dollars * 100;
    pennies = stringifyWithTwoDigits(pennies);
    return '$' + [dollars, pennies].join('.');
  }

  var timeStrings = Array.from($('.track_row_view .time')).map(getInnerText);
  var runtimeInSeconds = timeStrings.map(parseTimeToSeconds).reduce(add);
  var runtimeString = formatTimeFromSeconds(runtimeInSeconds);

  var lowPrice, highPrice;
  [lowPrice, highPrice] = whatToPay(runtimeInSeconds);

  var outputString = [
    '<br><br>This album has a total runtime of ', runtimeString, '.<br><br>',
    'Typically, I would pay ', formatPriceFromPennies(lowPrice), ' for it on ',
    'the low end, and ', formatPriceFromPennies(highPrice), ' for it on the ',
    'high end.'
  ].join('');
  $('.tralbum-credits').append(outputString);
})();
