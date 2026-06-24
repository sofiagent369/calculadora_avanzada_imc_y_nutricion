document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const bmiValue = document.getElementById('bmi-value');
    const nutritionalStatus = document.getElementById('nutritional-status');
    const calculationList = document.getElementById('calculation-list');
    const exportPdfButton = document.getElementById('export-pdf');
    const bmiChartCanvas = document.getElementById('bmi-chart').getContext('2d');

    let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

    function calculateBMI(weight, height) {
        return (weight / ((height / 100) * (height / 100))).toFixed(2);
    }

    function determineNutritionalStatus(bmi) {
        if (bmi < 18.5) {
            return 'Underweight';
        } else if (bmi >= 18.5 && bmi < 24.9) {
            return 'Normal weight';
        } else if (bmi >= 25 && bmi < 30) {
            return 'Overweight';
        } else {
            return 'Obesity';
        }
    }

    function updateHistory(weight, height, bmi) {
        const entry = { weight, height, bmi, date: new Date().toLocaleString() };
        history.push(entry);
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        calculationList.innerHTML = '';
        history.forEach(entry => {
            const li = document.createElement('li');
            li.classList.add('calculation-item');
            li.textContent = `Date: ${entry.date}, Weight: ${entry.weight} kg, Height: ${entry.height} cm, BMI: ${entry.bmi}`;
            calculationList.appendChild(li);
        });
    }

    function renderChart() {
        const bmiData = history.map(entry => entry.bmi);
        const dates = history.map(entry => new Date(entry.date).toLocaleDateString());

        const chartConfig = {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'BMI History',
                    data: bmiData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'BMI'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        };

        if (bmiChart) {
            bmiChart.destroy();
        }

        bmiChart = new Chart(bmiChartCanvas, chartConfig);
    }

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text('BMI and Nutrition Calculator History', 14, 20);

        // Add history
        let yPos = 30;
        calculationList.querySelectorAll('.calculation-item').forEach(item => {
            const itemText = item.textContent;
            doc.text(itemText, 14, yPos);
            yPos += 10;
        });

        // Add chart
        const imgData = bmiChartCanvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 14, yPos + 5, 180, 80);

        // Save the PDF
        doc.save('bmi_history.pdf');
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);

        if (!isNaN(weight) && !isNaN(height)) {
            const bmi = calculateBMI(weight, height);
            const status = determineNutritionalStatus(bmi);

            bmiValue.textContent = bmi;
            nutritionalStatus.textContent = status;

            updateHistory(weight, height, bmi);
            renderChart();
        } else {
            alert('Please enter valid weight and height.');
        }
    });

    exportPdfButton.addEventListener('click', generatePDF);

    renderHistory();
    renderChart();
});