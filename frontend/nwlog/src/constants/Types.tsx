
//Packet (only TCP for now)
export interface Packet {
  time: string;
  src: string;
  dst: string;
  protocol: string;
  len: string;
  header: TCPHeader;
  data: string;
}

interface TCPHeader {
  srcPort: string;
  dstPort: string;
  seq: string;
  ack: string;
  flags: string
  window: string;
  checksum: string;
  urgentPointer: string;
  options: string;
}

//Get Devices
export interface NetworkInterface {
  name: string;
  description?: string;
  flags?: string;
  addresses: NetworkAddress[];
}

interface NetworkAddress {
    addr: string;
    netmask: string;
    broadaddr?: string;
  }