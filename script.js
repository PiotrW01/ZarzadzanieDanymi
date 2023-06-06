Chart.defaults.backgroundColor = '#BB86FC';
Chart.defaults.borderColor = '#123123';
Chart.defaults.color = 'rgb(205, 205, 205)';

var chart;
var currency = 'USD';
var lastdays = 7;
var days = 7;
const dates = [];
const rates = [];

// Funkcja sterująca zmianą zakresu
function handleOptionChange(radioButton) {
    if (radioButton.checked) {
        var date1 = document.getElementById('date1');
        var date2 = document.getElementById('date2');

        if(Number(radioButton.value) == 0){
            days = 0;
            date1.disabled = false;

            // ZROBIĆ

            maxDate1 = new Date();
            maxDate.setDate(maxDate.getDate() - 1).toISOString().split("T")[0];

            date1.max = maxDate;
            date2.max = maxDate2;


        } else {
            days = Number(radioButton.value);
            lastdays = days;

            date1.disabled = true;
            date2.disabled = true;
            if(date2.value != ""){
                getExchangeRates(false);
                return;
            }
            updateChart(dates.slice(-days), rates.slice(-days));
        }
    }
}

// Funkcja sterująca zmianą daty
function handleDateChange(dateObject) {
    switch(dateObject.id){
        case 'date1':
            var date2 = document.getElementById('date2');
            date2.disabled = false;
            date2.value = null;
            break;
        case 'date2':
            var date1 = document.getElementById('date1').value;
            var date2 = document.getElementById('date2').value;
            getExchangeRates(true, date1, date2)
            break;
    }
}

// Funkcja sterująca zmianą waluty
function handleCurrencyChange(currencyOption){
    currency = currencyOption.value;
    var date1 = document.getElementById('date1').value;
    var date2 = document.getElementById('date2').value;
    if(days == 0 && date2 !== ""){
        if(date2 !== "") getExchangeRates(true, date1, date2);
    } else {
        days = lastdays;
        getExchangeRates(false);
    }
}

// Funkcja pobierająca dane z API NBP
function getExchangeRates(isCustom, startDay = '', endDay = '') {
    if(isCustom) var url = `http://api.nbp.pl/api/exchangerates/rates/A/${currency}/${startDay}/${endDay}/?format=json`;
    else var url = `http://api.nbp.pl/api/exchangerates/rates/A/${currency}/last/90/?format=json`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            dates.length = 0;
            rates.length = 0;
            
            data.rates.forEach(rate => {
                dates.push(rate.effectiveDate);
                rates.push(rate.mid);
            });
            if(isCustom) updateChart(dates, rates);
            else updateChart(dates.slice(-days), rates.slice(-days));        
        })
        .catch(error => {
            console.log('Błąd pobierania danych:', error);
        });
}

// Funkcja aktualizująca wykres
function updateChart(dates, rates) {
    chart.data.labels = dates;
    chart.data.datasets[0].data = rates;
    chart.update();
}

// Funkcja tworząca wykres, wywoływana na samym początku
function createChart(){
    var url = 'http://api.nbp.pl/api/exchangerates/rates/A/USD/last/90/?format=json';

    fetch(url)
    .then(response => response.json())
    .then(data => {
        data.rates.forEach(rate => {
            dates.push(rate.effectiveDate);
            rates.push(rate.mid);
        });
        
        var ctx = document.getElementById('chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.slice(-days),
                datasets: [{
                    label: 'Kurs USD',
                    data: rates.slice(-days),
                    fill: false,
                    borderColor: '#BB86FC',
                    pointBackgroundColor: '#a762fc',
                    pointBorderColor: '#a762fc',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    })
    .catch(error => {
        console.log('Błąd pobierania danych:', error);
    });
}

// Stworzenie wykresu
createChart();