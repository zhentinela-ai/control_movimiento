const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { ipcRenderer } = require("electron");
const fs = require("fs");

let stringToSend;
const conn = document.getElementById("conn");

const listPorts = async () => {
  return await SerialPort.list();
};

listPorts().then((ports) => {
  // console.log(ports[0]);
});

const port = new SerialPort(
  {
    path: "COM4",
    baudRate: 115200,
  },
  (err) => {
    if (err) return console.log("Error al abrir el puerto: ", err.message);
  }
);

const parser = port.pipe(new ReadlineParser({ delimiter: "\n\r" }));
const receive = document.getElementById("receive");
let receiveSerial = "";

// const parserPlot = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
// let receiveSerialPlot;
// parserPlot.on("data", (data) => {
//   console.log(data);
// });

window.addEventListener("beforeunload", () => {
  port.close((err) => {
    if (err) return console.log("Error al cerrar el puerto: ", err.message);
  });
});

window.addEventListener("load", () => {
  port.open(() => {
    // port.write("001p001");
    if (port) conn.innerHTML = "Conexión abierta";

    parser.on("data", (data) => {
      receiveSerial = data;
      publicarSerial();
      console.log(receiveSerial);
    });
  });
});

let data = [];
let json;
const left = document.getElementById("left");
const right = document.getElementById("right");
const receiveSerialTIMEElement = document.createElement("p");
const receiveSerialRPMElement = document.createElement("p");
const publicarSerial = () => {
  const cut = receiveSerial.indexOf("|");
  const receiveSerialRPM = receiveSerial.slice(cut + 1) + "seg";
  receiveSerialRPMElement.innerHTML = receiveSerialRPM;
  receive.insertBefore(receiveSerialRPMElement, receive.lastChild);

  const receiveSerialTIME = receiveSerial.split("|")[0] + "rpm";
  receiveSerialTIMEElement.innerHTML = receiveSerialTIME;
  receive.insertBefore(receiveSerialTIMEElement, receive.firstChild);

  data.push({
    time: parseInt(
      receiveSerial
        .slice(cut + 1)
        .split(":")[1]
        .trim()
    ),
    rpm: receiveSerial.split("|")[0].split(":")[1].trim(),
  });
  json = JSON.stringify(data);
  console.log(json);

  fs.writeFile("data.json", json, "utf-8", function (err) {
    if (err) throw err;
    console.log("Los datos han sido guardados.");
  });
};

const control = document.getElementById("control");
control.addEventListener("submit", (e) => {
  e.preventDefault();

  let timeValue = time.value;
  let rpmValue = rpm.value;

  if (timeValue.length == 1) timeValue = "00" + timeValue;
  if (rpmValue.length == 1) rpmValue = "00" + rpmValue;
  if (timeValue.length == 2) timeValue = "0" + timeValue;
  if (rpmValue.length == 2) rpmValue = "0" + rpmValue;

  if (left.checked) stringToSend = rpmValue + "i" + timeValue;
  else if (right.checked) stringToSend = rpmValue + "d" + timeValue;
  else stringToSend = rpmValue + "p" + timeValue;

  if (timeValue < 101 && timeValue > -1 && rpmValue < 121 && rpmValue > -1) {
    port.write(stringToSend);
    console.log(stringToSend);
    if (
      receive.contains(receiveSerialTIMEElement) &&
      receive.contains(receiveSerialRPMElement)
    ) {
      receive.removeChild(receiveSerialTIMEElement);
      receive.removeChild(receiveSerialRPMElement);
    }
  }
  // window.location.href = "./plot.html";
});

ipcRenderer.on("data-from-server", (e, d) => {
  console.log(d);
});

port.on("error", (err) => {
  console.error(err);

  if (err.message.search("File not found")) {
    conn.innerHTML = "Conexión cerrada";
  }
});

module.exports = {
  port,
  msg: "HW",
};
