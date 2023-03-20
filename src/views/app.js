const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
// const { ipcRenderer } = require("electron");

// ipcRenderer.on("data-from-server", (event, arg) => {
//   console.log(typeof arg);
// });

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

window.addEventListener("beforeunload", () => {
  port.close((err) => {
    if (err) return console.log("Error al cerrar el puerto: ", err.message);
  });
});

let stringToSend;
let positionValuePrevious = "";
window.addEventListener("load", () => {
  const conn = document.getElementById("conn");
  port.open(() => {
    port.write("000p000");
    conn.innerHTML = "Conexión abierta";

    setTimeout(() => {
      parser.on("data", (data) => {
        receive.innerHTML = data;
        console.log(data);
      });
    }, 200);
  });
});

const control = document.getElementById("control");
control.addEventListener("submit", (e) => {
  let positionValue = position.value;
  let rpmValue = rpm.value;

  positionValuePrevious = receive.innerHTML.split(":")[2].trim();
  console.log(positionValuePrevious);
  e.preventDefault();

  if (positionValue.length == 1) positionValue = "00" + positionValue;
  if (rpmValue.length == 1) rpmValue = "00" + rpmValue;
  if (positionValue.length == 2) positionValue = "0" + positionValue;
  if (rpmValue.length == 2) rpmValue = "0" + rpmValue;

  if (positionValuePrevious - positionValue > 0)
    stringToSend = rpmValue + "i" + positionValue;
  else if (positionValuePrevious - positionValue < 0)
    stringToSend = rpmValue + "d" + positionValue;
  else stringToSend = rpmValue + "p" + positionValue;

  if (
    positionValue < 821 &&
    positionValue > -1 &&
    rpmValue < 121 &&
    rpmValue > -1
  )
    port.write(stringToSend);
  console.log(stringToSend);
});

port.on("error", (err) => {
  console.error(err);

  if (err.message.search("File not found")) {
    conn.innerHTML = "Conexión cerrada";
  }
});
