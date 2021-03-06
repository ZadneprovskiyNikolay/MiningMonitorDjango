var workArchiveChart = null;

$(function() {    
    updateDeviceSelector(archive=true, nonarchive=true);

    $('#apply-btn').click(function(e) {
        e.preventDefault();

        // Load and check device id
        deviceId = $('#device-selector').val();
        if (!deviceId || deviceId <= 0) { 
            printMessage('Incorrect device id');
            return;
        }
        
        loadPaybackChartPromise(deviceId).then(function() { 
            printMessage('');
        })
        .catch(function(error) {
            printMessage('Can not load payback chart');
        });
    })
})

function loadPaybackChartPromise(deviceId) {
    return new Promise(function (resolve, reject) { 
        loadPaybackJsonPromise(deviceId).done(function(data, textStatus, jqXHR) {                         
            if (!data) { 
                printMessage('This device was not working yet')
            } else {
                drowPaybackChart(data);
                resolve(data);
            }
        }).fail(function(jqxhr, textStatus, error) {
            console.error(`Error loading payback for device ${deviceId}: ${error}`);
            reject();
        });
    })
}

function loadPaybackJsonPromise(deviceId) {     
    return $.getJSON(`/payback/${deviceId}/payback.json`)    
}

function drowPaybackChart(data) {         
    var timeFormat = 'YYYY-MM-DD';    

    // Prepare chart data  
    var points = []
    for (dateValue of data) {
        var point = {x: dateValue[0], y: dateValue[1]}
        points.push(point)
    }        
    chart_data = {
        datasets: [
            {
                data: points, 
                fill: true, 
                borderColor: 'black',
                backgroundColor: 'white'
            }
        ]
    }

    var config = {
        type:    'line',
        data: chart_data,
        options: {
            responsive: true,
            title:      {
                display: true,
                text:    "Payback Chart", 
                fontColor: 'white'
            },
            legend: {
                display: false
            },
            scales:     {
                xAxes: [{
                    type: "time",
                    time: {
                        format: timeFormat,  
                        displayFormats: {
                            'day': 'MMM D',                            
                            'hour': 'MMM D'
                        }                      
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Date', 
                        fontColor: 'black'                        
                    },
                    ticks: {
                        fontColor: "white",                        
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Payback %',
                        fontColor: 'black' 
                    },
                    ticks: {
                        fontColor: "white",                        
                    }
                }],                 
            },        
            maintainAspectRatio: false
        }
    };

    // Update chart if it's already drown
    if (workArchiveChart) {
        workArchiveChart.data = chart_data;
        workArchiveChart.update();
        return;
    }
    
    var ctx = document.getElementById("payback-chart").getContext("2d");    
    workArchiveChart = new Chart(ctx, config);
}

