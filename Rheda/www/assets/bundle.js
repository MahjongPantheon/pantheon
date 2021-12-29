/*  Rheda: visualizer and control panel
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

!function (wnd) {
  function plotRating(points, games, currentUser, playersMap, labelColorThreshold, i18n) {
    var ticks = [];
    for (var idx = 0; idx < points.length; idx++) {
      ticks.push(idx);
    }

    var gamesIdx = [];
    for (var id in games) {
      if (!games.hasOwnProperty(id)) {
        continue;
      }
      gamesIdx.push(id);
    }

    $.jqplot.eventListenerHooks.push(['jqplotClick', function () {
      $('#chart_rating_info').html('');
    }]);

    $.jqplot(
      'chart_rating',
      [points],
      {
        title: i18n['_RATING_GRAPH'],
        axes: {
          xaxis: {
            ticks: ticks,
            tickInterval: 1,
            tickOptions: {
              formatString: '%d'
            }
          }
        },
        cursor: {
          show: false
        },
        highlighter: {
          show: true,
          showTooltip: false,
          sizeAdjust: 10
        },
        seriesDefaults: {
          rendererOptions: {
            smooth: true
          }
        }
      }
    );

    $('#chart_rating').bind('jqplotDataClick',
      function (ev, seriesIndex, pointIndex) {
        var g = games[gamesIdx[pointIndex - 1]];
        if (!g) {
          return '';
        }
        var players = [];
        var outcome = '';
        var own = '';
        var score;
        var winds = ['東', '南', '西', '北'];
        players.push('<div class="container">');

        var gameHash = g[0]['session_hash'];
        var eventId = g[0]['event_id'];
        var url = '/eid' + eventId + '/game/' + gameHash;
        players.push('<div class="row m-3"><a href="' + url + '">' + i18n._GAME_DETAILS + '</a></div>');

        for (var i = 0; i < 4; i++) {
          outcome = g[i].rating_delta < labelColorThreshold ? 'badge-danger' : 'badge-success';
          own = g[i].player_id == currentUser ? 'own' : '';
          score = $.jqplot.sprintf("%'i", g[i].score);
          players.push(
            '<div class="row ' + own + '">' +
            '<div class="col-6">' +
            winds[i] + ' ' +
            playersMap[g[i].player_id].title +
            '</div>' +
            '<div class="col-3">' +
            '<span class="score">' + score + '</span>' +
            '</div><div class="col-3">' +
            '<span class="badge ' + outcome + '">' + (
              g[i].rating_delta > labelColorThreshold ? '+' : ''
            ) + parseFloat(g[i].rating_delta).toFixed(1) + '</span>' +
            '</div></div>'
          );
        }
        $('#chart_rating_info').html(players.join(''));
      }
    );
  }

  function plotHands(handValueStats, yakuStats, i18n) {
    $.jqplot('chart_hands', [handValueStats], {
      title: i18n['_HANDS_VALUE'],
      series: [{renderer: $.jqplot.BarRenderer}],
      axesDefaults: {
        tickOptions: {
          fontSize: '12pt'
        }
      },
      axes: {
        xaxis: {
          label: i18n['_HAN'],
          renderer: $.jqplot.CategoryAxisRenderer
        }
      }
    });

    $.jqplot('chart_yaku', [yakuStats], {
      height: 400,
      title: i18n['_YAKU_OVERALLTIME'],
      series: [{
        renderer: $.jqplot.BarRenderer,
        rendererOptions: {
          barWidth: 7,
          shadowOffset: 1,
          barDirection: 'horizontal'
        }
      }],
      axesDefaults: {
        tickOptions: {
          fontSize: '12pt'
        }
      },
      axes: {
        yaxis: {
          renderer: $.jqplot.CategoryAxisRenderer
        },
        xaxis: {
          min: 0,
          tickInterval: 1,
          tickOptions: {
            formatString: '%d'
          }
        }
      }
    });
  }

  function saveLocalIds(selectorClass, targetInputId, formId) {
    var sourceInputs = $('.' + selectorClass);
    var targetInput = $('#' + targetInputId);
    var form = $('#' + formId);
    var mapping = {};
    for (var i = 0; i < sourceInputs.length; i++) {
      mapping[parseInt(sourceInputs[i].getAttribute('data-player-id'), 10)] = parseInt(sourceInputs[i].value, 10) || null;
    }

    targetInput.get(0).value = JSON.stringify(mapping);
    form.submit();
    return true; // called on submit, should return true
  }

  function saveTeamNames(selectorClass, targetInputId, formId) {
    var sourceInputs = $('.' + selectorClass);
    var targetInput = $('#' + targetInputId);
    var form = $('#' + formId);
    var mapping = {};
    for (var i = 0; i < sourceInputs.length; i++) {
      mapping[parseInt(sourceInputs[i].getAttribute('data-player-id'), 10)] = sourceInputs[i].value || '';
    }

    targetInput.get(0).value = JSON.stringify(mapping);
    form.submit();
    return true; // called on submit, should return true
  }

////////////////////////// Access rules ajax management ///////////////////////////////

  var ICON_PROGRESS = 'icon-access-save-progress';
  var ICON_OK = 'icon-access-save-success';
  var ICON_FAIL = 'icon-access-save-fail';

  /**
   * Call this on document ready in those pages which contain _AccessTypeSelector partial
   */
  function registerAccessTypeSelectors() {
    $('.access-rule-value-selector .ctrl')
      .on('focus', backupCurrentAccessRuleValue)
      .on('change', updateAccessRule);
  }

  /**
   * Rule updater func for _AccessTypeSelector partial.
   * Requirements:
   * - Current context should be DOM node (bind this function on input change)
   * - Current context should have data-id and data-type attrs
   * - data-type should be either int, bool or enum
   * - Values are taken either from this.value or this.checked (for boolean).
   */
  function updateAccessRule() {
    var context = this;
    var dataHolder = $(context).parents('.access-rule-value-selector');
    var data = {};
    var target = '/privileges/ajax';

    switch (dataHolder.attr('data-type')) {
      case 'bool':
        data.id = dataHolder.attr('data-id');
        data.type = dataHolder.attr('data-type');
        data.value = context.checked;
        break;
      case 'int':
      case 'enum':
        data.id = dataHolder.attr('data-id');
        data.type = dataHolder.attr('data-type');
        data.value = context.value;
        break;
    }

    setIcon.call(context, ICON_PROGRESS);
    context.disabled = true;
    $.post(target, data, function (reply) {
      if (reply.success) {
        backupCurrentAccessRuleValue.call(context);
        setIcon.call(context, ICON_OK, 1000);
      } else {
        restoreCurrentAccessRuleValue.call(context);
        setIcon.call(context, ICON_FAIL, 1000);
      }

      context.disabled = false;
    });
  }

// Should be bound on focus event of input dom node
  function backupCurrentAccessRuleValue() {
    var dataHolder = $(this).parents('.access-rule-value-selector');
    switch (dataHolder.attr('data-type')) {
      case 'bool':
        dataHolder.attr('data-prev-value', this.checked);
        break;
      case 'int':
      case 'enum':
        dataHolder.attr('data-prev-value', this.value);
        break;
    }
  }

  function restoreCurrentAccessRuleValue() {
    var dataHolder = $(this).parents('.access-rule-value-selector');
    switch (dataHolder.attr('data-type')) {
      case 'bool':
        this.checked = dataHolder.attr('data-prev-value');
        break;
      case 'int':
      case 'enum':
        this.value = dataHolder.attr('data-prev-value');
        break;
    }
  }

  function setIcon(type, timeout) {
    var dataHolder = $(this).parents('.access-rule-value-selector');

    if (dataHolder.iconTimer) {
      clearTimeout(dataHolder.iconTimer);
      dataHolder.iconTimer = null;
    }

    dataHolder.children('.icon').each(function (idx, icon) {
      $(icon).css('display', 'none');

      if (type && $(icon).hasClass(type)) {
        $(icon).css('display', 'block');
      }
    });

    if (timeout) {
      dataHolder.iconTimer = setTimeout(setIcon.bind(this), timeout); // reset icon
    }
  }

  function resetToDefault(idList) {
    idList.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) {
        return;
      }
      if (el.type === 'number') {
        el.value = el.getAttribute('data-default');
      } else if (el.type === 'checkbox') {
        el.checked = el.getAttribute('data-default') === 'true';
      }
    });

    return false;
  }

  function buildRulesetsTable(rulesets, targetDiv, currentRuleset, resetTitle) {
    currentRuleset = currentRuleset || 'ema';
    let fields = [];

    for (let field in rulesets[currentRuleset].fields) {
      if (!rulesets[currentRuleset].fieldsNames[field]) {
        continue;
      }
      let value = (rulesets[currentRuleset].changes || {})[field] || rulesets[currentRuleset].original[field];
      switch (rulesets[currentRuleset].fields[field]) {
        case 'int':
          fields.push('<div class="form-group">\n' +
            '<label for="tuning_' + field + '">' + rulesets[currentRuleset].fieldsNames[field] +
            ' (<a href="#" onclick="return resetToDefault([\'tuning_' + field + '\'])">' + resetTitle + '</a>)</label>\n' +
            '<input type="number" class="form-control"\n' +
            '       id="tuning_' + field + '"\n' +
            '       data-default="' + rulesets[currentRuleset].original[field] + '"\n' +
            '       value="' + value + '"\n' +
            '       name="tuning_' + field + '">\n' +
            '</div>');
          break;
        case 'bool':
          fields.push('<div class="form-group"><div class="form-check">\n' +
            '<input type="checkbox" class="form-check-input"\n' +
            '       id="tuning_' + field + '"\n' +
            '       ' + (value ? 'checked="checked"\n' : '') +
            '       data-default="' + rulesets[currentRuleset].original[field] + '"\n' +
            '       name="tuning_' + field + '">\n' +
            '<label for="tuning_' + field + '">' + rulesets[currentRuleset].fieldsNames[field] +
            ' (<a href="#" onclick="return resetToDefault([\'tuning_' + field + '\'])">' + resetTitle + '</a>)</label>\n' +
            '</div></div>');
          break;
        case 'int[]':
          if (value) {
            fields.push(
              '<div class="form-group">\n' +
              '<label for="tuning_' + field + '_1">' + rulesets[currentRuleset].fieldsNames[field] +
              ' (<a href="#" onclick="return resetToDefault([\'tuning_' + field + '_1\', \'tuning_' + field + '_2\', \'tuning_' + field + '_3\', \'tuning_' + field + '_4\'])">' + resetTitle + '</a>)</label>\n' +
              '<input type="number" class="form-control"\n' +
              '       id="tuning_' + field + '_1"\n' +
              '       value="' + value[1] + '"\n' +
              '       data-default="' + rulesets[currentRuleset].original[field][1] + '"\n' +
              '       name="tuning_' + field + '[]">\n' +
              '<input type="number" class="form-control"\n' +
              '       id="tuning_' + field + '_2"\n' +
              '       value="' + value[2] + '"\n' +
              '       data-default="' + rulesets[currentRuleset].original[field][2] + '"\n' +
              '       name="tuning_' + field + '[]">\n' +
              '<input type="number" class="form-control"\n' +
              '       id="tuning_' + field + '_3"\n' +
              '       value="' + value[3] + '"\n' +
              '       data-default="' + rulesets[currentRuleset].original[field][3] + '"\n' +
              '       name="tuning_' + field + '[]">\n' +
              '<input type="number" class="form-control"\n' +
              '       id="tuning_' + field + '_3"\n' +
              '       value="' + value[4] + '"\n' +
              '       data-default="' + rulesets[currentRuleset].original[field][4] + '"\n' +
              '       name="tuning_' + field + '[]">\n' +
              '</div>'
            );
          }
          break;
        case 'select':
          // TODO
      }
    }

    targetDiv.innerHTML = fields.join('');
  }

  function disableTemporarily(what) {
    $(what).attr('disabled', true);
    var timer = window.setTimeout(function() {
      $(what).attr('disabled', false);
      window.clearTimeout(timer);
    }, 3000);
    $(what).parents('form').submit();
    return true;
  }


//// Exports to global object ////
  wnd.plotRating = plotRating;
  wnd.plotHands = plotHands;
  wnd.saveLocalIds = saveLocalIds;
  wnd.saveTeamNames = saveTeamNames;
  wnd.registerAccessTypeSelectors = registerAccessTypeSelectors;
  wnd.dispatchEvent(new CustomEvent('bundleLoaded'));
  wnd.buildRulesetsTable = buildRulesetsTable;
  wnd.resetToDefault = resetToDefault;
  wnd.disableTemporarily = disableTemporarily;
}
(window);

/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
//
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
//
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
//
// About: Release History
//
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
//
// Topic: Note for non-jQuery users
//
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
//
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function (window, undefined) {
  '$:nomunge'; // Used by YUI compressor.

  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || (window.Cowboy = {}),

    // Internal method reference.
    jq_throttle;

  // Method: jQuery.throttle
  //
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  //
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  //
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // >
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  //
  // Usage:
  //
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // >
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  //
  // This also works in jQuery 1.4+:
  //
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  //
  // Arguments:
  //
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  //
  // Returns:
  //
  //  (Function) A new, throttled, function.

  $.throttle = jq_throttle = function (delay, no_trailing, callback, debounce_mode) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,

      // Keep track of the last time `callback` was executed.
      last_exec = 0;

    // `no_trailing` defaults to falsy.
    if (typeof no_trailing !== 'boolean') {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }

    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;

      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply(that, args);
      };

      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };

      if (debounce_mode && !timeout_id) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }

      // Clear any existing timeout.
      timeout_id && clearTimeout(timeout_id);

      if (debounce_mode === undefined && elapsed > delay) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();

      } else if (no_trailing !== true) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        //
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        //
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay);
      }
    };

    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ($.guid) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }

    // Return the wrapper function.
    return wrapper;
  };

  // Method: jQuery.debounce
  //
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  //
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  //
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // >
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  //
  // Usage:
  //
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // >
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  //
  // This also works in jQuery 1.4+:
  //
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  //
  // Arguments:
  //
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  //
  // Returns:
  //
  //  (Function) A new, debounced, function.

  $.debounce = function (delay, at_begin, callback) {
    return callback === undefined
      ? jq_throttle(delay, at_begin, false)
      : jq_throttle(delay, callback, at_begin !== false);
  };

})(this);
