import { useState, useEffect } from 'react'
import './App.css'
import Row from './components/Row'
import { NetworkInterface, Packet } from './constants/Types';
import updateIcon from './assets/update.svg';

export default function App() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [devices, setDevices] = useState<NetworkInterface[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<NetworkInterface | null>(null);
  const apiServer = '/api';

  useEffect(() => {
    if (!selectedDevice) {
      return;
    }

    const eventSource = new EventSource(`${apiServer}/sse`);
    console.log('SSE connection established');

    eventSource.onmessage = (event) => {
      //console.log('Incoming SSE data:', event.data);
      const newPacket = JSON.parse(event.data);
      setPackets((prevPacket) => [...prevPacket, newPacket]);
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [selectedDevice]);

  const getDevices = () => {
    fetch(`${apiServer}/devices`)
      .then((response) => response.json())
      .then((devices) => {
        setDevices(devices);
        console.log(devices);
      })
      .catch((error) => console.error('Error fetching devices:', error));
  }

  useEffect(() => {
    getDevices();
  }, []);

  const selectDevice = (device: NetworkInterface): void => {
    console.log(`Selected device: ${device.name}`);

    fetch(`${apiServer}/select-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceName: device.name }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to send device selection');
        }
        console.log('Device selection sent successfully');
        setSelectedDevice(device);
      })
      .catch((error) => console.error('Error sending device selection:', error));
  };

  return (
    <>
      <div className="button-container">
        <button className='button' onClick={() => setPackets([])}>Clear</button>
        <div className='right-buttons'>
          <select
            className="dropdown"
            onChange={(e) => {
              const selected = devices.find(device => device.name === e.target.value);
              if (selected) selectDevice(selected);
            }}
            defaultValue="">
            <option value="" disabled>
              Select a device
            </option>
            {devices.map((device) => (
              <option key={device.name} value={device.name}>
                {device.name}
              </option>
            ))}
          </select>
          <button onClick={() => getDevices()} className="button">
            <img src={updateIcon} alt='Refresh'/>
          </button>
        </div>
      </div>
      <div className='container'>
        <table className="equal-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>From</th>
              <th>To</th>
              <th>Length (bytes)</th>
              <th>Protocol</th>
            </tr>
          </thead>
            {packets.map((item, index) => (
                <Row key={index} {...item} />
            ))}
        </table>
      </div>
    </>
  )
}
