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

function plotRating (points, games, currentUser, playersMap, labelColorThreshold) {
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
                    // label:'Сыграно игр',
                    ticks: ticks,
                    tickInterval: 1,
                    tickOptions: {
                        formatString: '%d'
                    }
                },
                yaxis: {
                    label: 'Рейтинг',
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
                    var players = [];
                    var outcome = '';
                    var own = '';
                    var winds = ['東', '南', '西', '北'];

                    players.push('<table class="table table-condensed table-bordered table-plot-rating">');
                    for (var i = 0; i < 4; i++) {
                        outcome = g[i].rating_delta < labelColorThreshold ? 'important' : 'success';
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
}

function plotHands (handValueStats, yakuStats) {
    $.jqplot('chart_hands', [handValueStats], {
        title: 'Ценность собранных рук',
        series:[{renderer:$.jqplot.BarRenderer}],
        axesDefaults: {
            tickOptions: {
                fontSize: '12pt'
            }
        },
        axes: {
            xaxis: {
                label: 'Хан',
                renderer: $.jqplot.CategoryAxisRenderer
            }
        }
    });

    $.jqplot('chart_yaku', [yakuStats], {
        height: 400,
        title: 'Собранные яку (за все время)',
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
