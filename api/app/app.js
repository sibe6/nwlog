const cors = require('cors');
const express = require('express');
const app = express();
const port = 3000;
const { Cap, decoders} = require('cap');
const PacketSniffer = require('./sniffer');

const deviceList = [];
var selectedDevice = "";

//app.use(cors());
app.use(express.json());

app.get('/sse', (req, res) => {
  if (selectedDevice === "") {
    console.log('No selected device!');
    res.status(400).end();
    return;
  }

  const filter = 'tcp and dst port 80';
  console.log('PacketSniffer, devide:', selectedDevice);
  const sniffer = new PacketSniffer(selectedDevice, filter);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  sniffer.start((packet) => {
    console.log('Packet:', packet);
    res.write(`data: ${JSON.stringify(packet)}\n\n`);
  });

  req.on('close', () => {
    console.log('Client disconnected');
    sniffer.close();
  });
});

app.get('/api/devices', (req, res) => {
  deviceList.length = 0;

  Cap.deviceList().forEach((device) => {
    deviceList.push(device);
  });
  res.json(deviceList);
});

app.post('/api/select-device', (req, res) => {
  console.log(req.body)
  const { deviceName } = req.body;
  const device = deviceList.find(device => device.name === deviceName);
  selectedDevice = device.name;
  console.log("Server:", selectedDevice)
  if (selectedDevice) {
    res.json({ message: 'Device selected successfully', device: selectedDevice });
  } else {
    res.status(404).json({ message: 'Device not found, refresh device list' });
  }
})

app.get('/', (req, res) => {
  res.send('Hello, Node.js backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
