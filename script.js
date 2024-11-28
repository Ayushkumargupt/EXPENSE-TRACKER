// script.js

document.getElementById('processFileBtn').addEventListener('click', processFile);

function processFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please upload a file!');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const data = parseCSV(text);

    if (data.length > 0) {
      displaySummary(data);
      renderCharts(data);
    } else {
      alert('No data found in the file!');
    }
  };
  reader.readAsText(file);
}

function parseCSV(csvText) {
  const rows = csvText.split('\n');
  const headers = rows[0].split(',');
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(',');
    if (values.length === headers.length) {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header.trim()] = values[index].trim();
      });
      data.push(entry);
    }
  }
  return data;
}

function displaySummary(data) {
  const totalExpenses = data.reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0);
  const categoryTotals = {};

  data.forEach(item => {
    const category = item.Category || 'Others';
    categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(item.Amount || 0);
  });

  const highestCategory = Object.entries(categoryTotals).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0]);

  document.getElementById('totalExpenses').textContent = `Total Expenses: ₹${totalExpenses.toFixed(2)}`;
  document.getElementById('highestCategory').textContent = `Highest Spending Category: ${highestCategory[0]} (₹${highestCategory[1].toFixed(2)})`;

  document.getElementById('summarySection').style.display = 'block';
}

function renderCharts(data) {
  const categories = {};
  const months = {};

  data.forEach(item => {
    const category = item.Category || 'Others';
    const date = new Date(item.Date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = parseFloat(item.Amount || 0);

    categories[category] = (categories[category] || 0) + amount;
    months[month] = (months[month] || 0) + amount;
  });

  // Category Chart
  const categoryChartCtx = document.getElementById('categoryChart').getContext('2d');
  new Chart(categoryChartCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        label: 'Expenses by Category',
        data: Object.values(categories),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4caf50', '#e91e63'],
      }]
    }
  });

  // Monthly Chart
  const monthlyChartCtx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(monthlyChartCtx, {
    type: 'line',
    data: {
      labels: Object.keys(months),
      datasets: [{
        label: 'Monthly Expenses',
        data: Object.values(months),
        borderColor: '#ffdd59',
        fill: false
      }]
    }
  });

  document.getElementById('chartsSection').style.display = 'block';
}

