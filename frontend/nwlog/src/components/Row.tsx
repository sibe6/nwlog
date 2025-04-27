import './css/Row.css'
import { Packet } from '../constants/Types';
import protocols from '../constants/Protocols';
import { toLocaleTime } from '../utils/Helper';

type RowProps = {
  packet: Packet;
  onRowClick: () => void;
};

export function Row( props : RowProps) {
  const { packet } = props;
  const { onRowClick } = props;

  return (
    <tr onClick={onRowClick} style={{ cursor: 'pointer' }}>
      <td>{toLocaleTime(packet.time)}</td>
      <td>{packet.src}</td>
      <td>{packet.dst}</td>
      <td>{packet.len}</td>
      <td>{protocols[parseInt(packet.protocol)] || packet.protocol}</td>
    </tr>
  );
}
