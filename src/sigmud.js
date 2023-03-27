const plotly = require("plotly")("username", "apiKey");
const math = require("mathjs");
const fs = require("fs");

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

const xValues = Array.from({ length: 31 }, (_, i) => i);
const yValues = xValues.map((x) => {
  if (x < 10) {
    return sigmoid(x - 5);
  } else if (x < 20) {
    return 1;
  } else {
    return sigmoid(25 - x);
  }
});

const data = {
  labels: xValues,
  datasets: [
    {
      label: "Rampa de Aceleración 'S'",
      data: yValues,
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};

const config = {
  type: "line",
  data,
  options: {
    animations: {
      tension: {
        duration: 1000,
        easing: "linear",
        from: 1,
        to: 0,
        loop: true,
      },
      plugins: { streaming: { duration: 20000, refresh: 1000 } },
    },
    scales: {
      y: {
        // defining min and max so hiding the dataset does not change scale range
        min: 0,
        max: 100,
      },
    },
  },
};

function onNewData(data) {
  config.data.datasets[0].data.push(data);
  myChart.update();
}

var myChart = new Chart(document.getElementById("myChart"), config);
