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

            //2 stycznia 2002
            date1.min = "2002-01-02"

            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            var formattedDate = yesterday.toISOString().split('T')[0];
            date1.max = formattedDate;


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
    var date1 = document.getElementById('date1');
    var date2 = document.getElementById('date2');

    switch(dateObject.id){
        case 'date1':
            date2.disabled = false;
            date2.value = null;

            var today = new Date();
            var date = new Date(date1.value);
            date2.min = date.toISOString().split('T')[0];
            
            
            date.setDate(date.getDate() + 367);
            if(date >= today){
                date2.max = today.toISOString().split('T')[0];
            } else {
                date2.max = date.toISOString().split('T')[0];
            }
            break;
        case 'date2':
            getExchangeRates(true, date1.value, date2.value)
            break;
    }
}

// Funkcja sterująca zmianą waluty
function handleCurrencyChange(currencyOption){
    currency = currencyOption.value;

    document.getElementById('inputCurrency').textContent = "PLN";
    document.getElementById('outputCurrency').textContent = currency;
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


function calculateCurrency(){
    var inputField = document.getElementById("inputField");
    var outputField = document.getElementById("outputField");
    if(inputField.value == "") return;

    fetch(`http://api.nbp.pl/api/exchangerates/rates/A/${currency}/last/1/?format=json`)
    .then(response => response.json())
    .then(data => {
        console.log(data.rates[0].mid);
        if(document.getElementById("inputCurrency").textContent == "PLN"){
            outputField.value = (data.rates[0].mid * inputField.value).toFixed(2);
        } else {
            outputField.value = (inputField.value / data.rates[0].mid).toFixed(2);;
        }
    });
}

function swapCurrency(){
    var inputCurrency = document.getElementById("inputCurrency");
    var outputCurrency = document.getElementById("outputCurrency");
    
    if(inputCurrency.textContent == "PLN"){
        inputCurrency.textContent = currency;
        outputCurrency.textContent = "PLN";
    } else {
        inputCurrency.textContent = "PLN";
        outputCurrency.textContent = currency;
    }
}

// 
document.getElementById('inputField').addEventListener('input', function(event) {
    const enteredValue = event.target.value;
    const sanitizedValue = enteredValue.replace(/[^0-9.]/g, ''); // Remove non-numeric and non-dot characters
    const dotCount = sanitizedValue.split('.').length - 1;
    
    if (dotCount > 1) {
        event.target.value = enteredValue.replace(/(\.)(?=.*\1)/g, ''); // Remove extra dots
    } else {
        event.target.value = sanitizedValue;
    }
});

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