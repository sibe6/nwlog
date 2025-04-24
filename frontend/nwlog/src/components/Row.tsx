import './Row.css'
import { Packet } from '../constants/Types';
import protocols from '../constants/Protocols';

export default function Row( packet : Packet) {
  return (
    <tr>
      <td>{packet.time}</td>
      <td>{packet.src}</td>
      <td>{packet.dst}</td>
      <td>{packet.len}</td>
      <td>{protocols[parseInt(packet.protocol)] || packet.protocol}</td>
    </tr>
  );
}
