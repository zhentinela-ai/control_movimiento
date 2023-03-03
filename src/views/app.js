const { SerialPort } = require("serialport");
const { ipcRenderer } = require("electron");
const { ReadlineParser } = require("@serialport/parser-readline");

const port = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n\r" }));

parser.on("data", (data) => {
  const receive = document.getElementById("receive");
  receive.innerHTML = data;
  console.log(data);
});

ipcRenderer.on("data-from-server", (event, arg) => {
  // console.log(typeof arg);
});

const conn = document.getElementById("conn");
port.open(() => {
  port.write("-");
  conn.innerHTML = "Conexión abierta";
});

const izq = document.getElementById("izq");
izq.addEventListener("click", () => {
  ipcRenderer.send("direct", "izq");
  port.write("d");
});

const der = document.getElementById("der");
der.addEventListener("click", () => {
  ipcRenderer.send("direct", "der");
  port.write("i");
});

const slider = document.getElementById("velocity");
const velocityValue = document.querySelector("span");
let lastNum = 0;
slider.oninput = (e) => {
  let value = e.target.value;
  // let velocity = slider.value / 10 - 1;
  // velocity = velocity.toFixed(0);
  // if (velocity >= 0) port.write(velocity);
  // else port.write("-");

  if (lastNum < value) {
    port.write("s");
    console.log("increasing");
  } else {
    port.write("w");
    console.log("decreasing");
  }
  lastNum = value;

  value = slider.value;
  value = parseInt(value);
  velocityValue.textContent = value + "%";
  velocityValue.style.left = value + "%";
  velocityValue.classList.add("show");
};

let add = document.getElementById("add");
add.addEventListener("click", () => {
  let actValue = parseInt(slider.value);
  port.write("w");
  if (actValue < 100) {
    actValue += 10;
    slider.value = actValue.toString();
    console.log(actValue);
  }
  
  let value = actValue;
  value = parseInt(value);
  velocityValue.textContent = value + "%";
  velocityValue.style.left = value + "%";
  velocityValue.classList.add("show");
});

document.getElementById("subtract").addEventListener("click", () => {
  let actValue = parseInt(slider.value);
  if (actValue > 0) {
    port.write("s");
    actValue -= 10;
    slider.value = actValue.toString();
    console.log(actValue);
  }

  let value = actValue;
  value = parseInt(value);
  velocityValue.textContent = value + "%";
  velocityValue.style.left = value + "%";
  velocityValue.classList.add("show");
});

port.on("error", (err) => {
  console.error(err);

  if (err.message.search("File not found")) {
    conn.innerHTML = "Conexión cerrada";
  }
});
