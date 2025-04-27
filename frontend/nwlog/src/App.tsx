import { useState, useEffect } from 'react'
import './App.css'
import { Row, Modal } from './components'
import { NetworkInterface, Packet } from './constants/Types';
import updateIcon from './assets/update.svg';

export default function App() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [devices, setDevices] = useState<NetworkInterface[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<NetworkInterface | null>(null);
  const apiServer = '/api';
  const [modal, setModal] = useState(false);
  const [modalPacket, setModalPacket] = useState<Packet>();
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!selectedDevice) {
      return;
    }

    const eventSource = new EventSource(`${apiServer}/sse`);
    console.log('SSE connection established');
    setIsConnected(true)

    eventSource.onmessage = (event) => {
      const newPacket = JSON.parse(event.data);
      setPackets((prevPacket) => [...prevPacket, newPacket]);
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      setIsConnected(false)
      eventSource.close();
    };

    return () => {
      setIsConnected(false)
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

  const initResize = (e: any, idx: any) => {
    const th = e.target.parentElement;
    const startX = e.clientX;
    const startWidth = th.offsetWidth;
  
    const onMouseMove = (eMove: any) => {
      const newWidth = startWidth + (eMove.clientX - startX);
      if (newWidth < 100 || newWidth > 500) return;
      th.style.width = `${newWidth}px`;
    };
  
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleRowClick = (packet: Packet) => {
    setModalPacket(packet);
    handleModal('open');
    console.log('Row clicked:', packet);
  }

  const handleModal = (action: string) => {
    if (action === 'open') {
      setModal(true);
    } else {
      setModal(false);
    }
  }

  return (
    <>
      <div className="button-container">
        <div className='header-left'>
          <button className='button shadow' onClick={() => setPackets([])}>Clear</button>
          <div className='is-connected'>
            <span className="status-circle" style={{ backgroundColor: isConnected ? 'green' : 'red' }} />
            <p>{isConnected ? 'SSE Connected' : 'SSE Disconnected'}</p>
          </div>
        </div>
        <div className='header-right'>
          <select
            className="dropdown shadow"
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
          <button onClick={() => getDevices()} className="button shadow">
            <img src={updateIcon} alt='Refresh'/>
          </button>
        </div>
      </div>
      <div className='container shadow'>
        <table className="equal-table">
        <thead>
          <tr>
            {['Time', 'From', 'To', 'Length (bytes)', 'Protocol'].map((header, idx) => (
              <th key={idx} style={{ position: 'relative' }}>
                {header}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '5px',
                    height: '100%',
                    cursor: 'col-resize',
                    userSelect: 'none',
                  }}
                  onMouseDown={(e) => initResize(e, idx)}
                />
              </th>
            ))}
          </tr>
        </thead>
          <tbody>
            {packets.map((item, index) => (
                <Row key={index} packet={item} onRowClick={() => handleRowClick(item)} />
            ))}
          </tbody>
        </table>
      </div>

      {modal && modalPacket && (
        <Modal handleModal={handleModal} packet={modalPacket} />
      )}
    </>
  )
}
