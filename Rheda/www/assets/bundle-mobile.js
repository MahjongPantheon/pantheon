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

    $.jqplot.eventListenerHooks.push(['jqplotClick', function() {
        $('#chart_rating_info').html('');
    }]);

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
            var players = [];
            var outcome = '';
            var own = '';
            var score;
            var winds = ['東', '南', '西', '北'];
            players.push('<div class="rating-chart-details">');
            for (var i = 0; i < 4; i++) {
                outcome = g[i].rating_delta < labelColorThreshold ? 'important' : 'success';
                own = g[i].player_id == currentUser ? 'own' : '';
                score = $.jqplot.sprintf("%'i", g[i].score);
                players.push(
                    '<div class="player-item ' + own + '">' +
                    '<div class="player-name">' +
                        winds[i] + ' ' +
                        playersMap[g[i].player_id].display_name +
                    '</div>' +
                    '<div class="player-score">' +
                    '<span class="score">' + score + '</span> ' +
                    '<span class="badge ' + outcome + '">' + (
                        g[i].rating_delta > labelColorThreshold ? '+' : ''
                    ) + parseFloat(g[i].rating_delta).toFixed(1) + '</span>' +
                    '</div></div>'
                );
            }
            players.push('</table>');
            $('#chart_rating_info').html(players.join(''));
        }
    );
}

function plotHands (handValueStats, yakuStats) {
    $.jqplot('chart_hands', [handValueStats], {
        series:[{
            renderer: $.jqplot.BarRenderer,
            rendererOptions: {
                barWidth: 10
            }
        }],
        axesDefaults: {
            tickOptions: {
                fontSize: '10pt'
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
                fontSize: '10pt'
            }
        },
        axes: {
            yaxis: {
                renderer: $.jqplot.CategoryAxisRenderer
            },
            xaxis: {
                tickOptions: {
                    formatString: " "
                }
            }
        }
    });
}
