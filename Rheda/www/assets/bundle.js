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
  function plotRating (points, games, currentUser, playersMap, labelColorThreshold, i18n) {
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

    $.jqplot(
      'chart_rating',
      [points],
      {
        axes: {
          xaxis: {
            ticks: ticks,
            tickInterval: 1,
            tickOptions: {
              formatString: '%d'
            }
          },
          yaxis: {
            label: i18n['_LABEL_RATING'],
            tickOptions: {
              formatString: "%'i"
            }
          }
        },
        highlighter: {
          show: true,
          sizeAdjust: 7,
          tooltipContentEditor: function (str, seriesIndex, pointIndex) {
            var g = games[gamesIdx[pointIndex - 1]];
            if (!g) {
                      return '';
                    }var players = [];
            var outcome = '';
            var own = '';
            var winds = ['東', '南', '西', '北'];

            players.push('<table class="table table-condensed table-bordered table-plot-rating">');
            for (var i = 0; i < 4; i++) {
              outcome = g[i].rating_delta < labelColorThreshold ? 'danger' : 'success';
              own = g[i].player_id == currentUser ? 'own' : '';
              var rating_delta = $.jqplot.sprintf("%'i", g[i].rating_delta);
              var scores = $.jqplot.sprintf("%'i", g[i].score);
              players.push(
                '<tr class="' + own + '">' +
                '<td>' + winds[i] + ' <b>' + playersMap[g[i].player_id].display_name + '</b>: ' +
                '</td><td>' +
                scores + ' <span class="badge badge-' + outcome + '">' + rating_delta + '</span>' +
                '</td></tr>'
              );
            }
            players.push('</table>');
            return players.join('');
          }
        },
        cursor: {
          show: false
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
            var gameHash = g[0]['session_hash'];
            var eventId = g[0]['event_id'];
            window.location = '/eid' + eventId + '/game/' + gameHash;
        }
    );
}

  function plotHands (handValueStats, yakuStats, i18n) {
    $.jqplot('chart_hands', [handValueStats], {
      title: i18n['_HANDS_VALUE'],
      series:[{renderer:$.jqplot.BarRenderer}],
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
      series:[{
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
    $.post(target, data, function(reply) {
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

    dataHolder.children('.icon').each(function(idx, icon) {
      $(icon).css('display', 'none');

      if (type && $(icon).hasClass(type)) {
        $(icon).css('display', 'block');
      }
    });

    if (timeout) {
      dataHolder.iconTimer = setTimeout(setIcon.bind(this), timeout); // reset icon
    }
  }


  //// Exports to global object ////
  wnd.plotRating = plotRating;
  wnd.plotHands = plotHands;
  wnd.saveLocalIds = saveLocalIds;
  wnd.registerAccessTypeSelectors = registerAccessTypeSelectors;
  wnd.dispatchEvent(new CustomEvent('bundleLoaded'));
}(window);

