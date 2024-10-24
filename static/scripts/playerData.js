// Store chart instances globally
const chartInstances = {};

function getLuminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getOutlineColorBasedOnLuminance(color) {
    var num = color.match(/\d+/g);
    var r = parseInt(num[0], 10);
    var g = parseInt(num[1], 10);
    var b = parseInt(num[2], 10);

    var luminance = getLuminance(r, g, b);
    return luminance < 0.5 ? 'white' : 'black';
}

function adjustBrightness(color, percent) {
    var num = color.match(/\d+/g);
    var r = parseInt(num[0], 10);
    var g = parseInt(num[1], 10);
    var b = parseInt(num[2], 10);

    r = Math.min(255, Math.max(0, r + (r * percent / 100)));
    g = Math.min(255, Math.max(0, g + (g * percent / 100)));
    b = Math.min(255, Math.max(0, b + (b * percent / 100)));

    return `rgb(${r}, ${g}, ${b})`;
}

function updateChart(i, cardColor, seasonData, maxParam, param) {
    const seasons = seasonData.map(season => season.seasonName).reverse();
    const paramValues = seasonData.map(season => season[param] === 'NaN' ? '0' : season[param]).reverse();

    var canvas = document.getElementById(`player_${i}_chart`);

    if (!canvas) {
        console.error(`Canvas for player_${i}_chart not found`);
        return;
    }

    var ctx = canvas.getContext('2d');
    var lighterCardColor = adjustBrightness(cardColor, 50);
    var outlineColor = getOutlineColorBasedOnLuminance(cardColor);

    var gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, lighterCardColor);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    // Check if the chart already exists
    if (chartInstances[`chart_${i}`]) {
        chartInstances[`chart_${i}`].data.labels = seasons; // Update the labels (season names)
        chartInstances[`chart_${i}`].data.datasets[0].data = paramValues; // Update the data for the selected parameter
        chartInstances[`chart_${i}`].data.datasets[0].backgroundColor = gradient;
        chartInstances[`chart_${i}`].data.datasets[0].borderColor = outlineColor;
        chartInstances[`chart_${i}`].data.datasets[0].pointBackgroundColor = outlineColor;

        // Update the tooltip and other visual aspects
        chartInstances[`chart_${i}`].options.plugins.tooltip.borderColor = outlineColor;
        chartInstances[`chart_${i}`].options.plugins.tooltip.titleColor = outlineColor;

        // Set the same max value for the y-axis in both charts
        chartInstances[`chart_${i}`].options.scales.y.max = maxParam;

        // Force chart to update with the new colors and data
        chartInstances[`chart_${i}`].update();
    } else {
        // Create a new chart if it doesn't exist
        var config = {
            type: 'line',
            data: {
                labels: seasons,
                datasets: [{
                    label: param,
                    data: paramValues,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: outlineColor,
                    tension: 0.55,
                    pointBackgroundColor: outlineColor,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: 'white',
                    pointHoverBorderColor: outlineColor,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 20,
                        bottom: 20
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxParam,  // Set the max value for the y-axis
                        grid: {
                            display: false
                        },
                        ticks: {
                            stepSize: 10,
                            color: '#a0aec0',
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                size: 12
                            },
                            // Show only every nth label
                            callback: function(value, index) {
                                return index % 2 === 0 ? this.getLabelForValue(value) : ''; // Show every 2nd label
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: outlineColor,
                        borderWidth: 1,
                        titleColor: outlineColor,
                        bodyColor: '#4a5568',
                        bodyFont: {
                            size: 14
                        },
                        displayColors: false,
                        cornerRadius: 10,
                        callbacks: {
                            label: function(context) {
                                return `${context.raw} ${param}`;
                            },
                            title: function(tooltipItems) {
                                return `Season ${tooltipItems[0].label}`;
                            }
                        }
                    }
                }
            }
        };

        // Create new chart and store it in the global chartInstances object
        chartInstances[`chart_${i}`] = new Chart(ctx, config);
    }
}

function displayCharts(player1SeasonData, player2SeasonData, params) {
    const player1Param = player1SeasonData.map(season => season[params[0]]);
    const player2Param = player2SeasonData.map(season => season[params[1]]);

    const maxParam = Math.max(...player1Param, ...player2Param) + 5;

    displayChart(1, player1SeasonData, maxParam, params[0]);
    displayChart(2, player2SeasonData, maxParam, params[1]);
}

function displayChart(i, seasonData, maxParam, param) {
    let card = document.getElementById(`player_${i}_card`);

    if (!card) {
        console.error(`Card for player_${i} not found.`);
    }

    // Initial chart render
    let initialCardColor = window.getComputedStyle(card).backgroundColor;
    updateChart(i, initialCardColor, seasonData, maxParam, param);

    // Event listeners for hover to change chart color dynamically
    card.addEventListener('mouseover', function() {
        let hoverCardColor = window.getComputedStyle(card).backgroundColor;
        updateChart(i, hoverCardColor, seasonData, maxParam, param); // Update chart with hover color
    });

    card.addEventListener('mouseout', function() {
        let originalCardColor = window.getComputedStyle(card).backgroundColor;
        updateChart(i, originalCardColor, seasonData, maxParam, param); // Revert chart to original color
    });
}

// Add event listeners to dropdowns
function setupDropdownListeners(player1SeasonData, player2SeasonData, params) {
    for (let i = 1; i <= 2; i++) {
        const dropdown = document.getElementById(`player_${i}_stat_dropdown`);
        dropdown.addEventListener('change', function() {
            const selectedStat = dropdown.value; // Get the selected stat
            params[i-1] = selectedStat; 
            displayCharts(player1SeasonData, player2SeasonData, params); // Update charts for both players with the same stat
        });
    }
}

export { displayCharts, setupDropdownListeners };

