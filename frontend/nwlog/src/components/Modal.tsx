
import { useState } from 'react';
import { Packet } from '../constants/Types';
import { HTTPFormat } from './HTTPFormat';
import './css/Modal.css';
import protocols from '../constants/Protocols';
import { toLocaleTime } from '../utils/Helper';

interface ModalProps {
  handleModal: (action: string) => void;
  packet: Packet;
}


export function Modal( props: ModalProps) {
  const { packet } = props;
  const { handleModal } = props;
  const [toggleRaw, setToggleRaw] = useState(false);

  console.log('Modal packet:', packet);

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <span className="close" onClick={() => handleModal('close')}>&times;</span>
{/*           <button 
            onClick={() => setToggleRaw(!toggleRaw)}
          >
            Switch to raw/text
          </button> */}
        </div>
        {toggleRaw ? (
          <div className="modal-body">
            <h2>Raw Data</h2>
            <pre>{packet.data}</pre>
          </div>
        ) : (
          <div className="modal-body">
          <table className="modal-table">
            <tbody>
                <tr>
                  <td>Time</td>
                  <td>{toLocaleTime(packet.time)}</td>
                </tr>
                <tr>
                  <td>From</td>
                  <td>{packet.src}</td>
                </tr>
                <tr>
                  <td>To</td>
                  <td>{packet.dst}</td>
                </tr>
                <tr>
                  <td>Length</td>
                  <td>{packet.len} bytes</td>
                </tr>
                <tr>
                  <td>Protocol</td>
                  <td>{protocols[parseInt(packet.protocol)] || packet.protocol}</td>
                </tr>
                <tr>
                  <td>Source Port</td>
                  <td>{packet.header.srcPort}</td>
                </tr>
                <tr>
                  <td>Destination port</td>
                  <td>{packet.header.dstPort}</td>
                </tr>
                <tr>
                  <td>Sequence Number</td>
                  <td>{packet.header.seq}</td>
                </tr>
                <tr>
                  <td>Ack Number</td>
                  <td>{packet.header.ack}</td>
                </tr>
                <tr>
                  <td>Flags</td>
                  <td>{packet.header.flags}</td>
                </tr>
                <tr>
                  <td>Payload</td>
                  <td>{HTTPFormat(packet.data)}</td>
{/*                   format payload */}
                </tr>
            </tbody>
          </table>
          </div>
        )}
{/*       {identifyPayload()} */}
      </div>
    </div>
);
}