const { Cap, decoders } = require('cap');

class PacketSniffer {
  constructor(device, filter = 'tcp and dst port 80') {
    this.device = device;
    this.filter = filter;
    this.bufSize = 10 * 1024 * 1024;
    this.buffer = Buffer.alloc(65535);
    this.cap = new Cap();
    this.PROTOCOL = decoders.PROTOCOL;
  }

  start(packetCallback) {
    //const device = Cap.findDevice(this.deviceIP);
    const linkType = this.cap.open(this.device, this.filter, this.bufSize, this.buffer);
    console.log('linkType: ' + linkType);
    console.log('device: ' + this.device);
    this.cap.setMinBytes && this.cap.setMinBytes(0);

    this.cap.on('packet', (nbytes, trunc) => {
      const packet = {};
      console.log(
        'packet: length ' + nbytes + ' bytes, truncated? ' + (trunc ? 'yes' : 'no')
      );

      if (linkType === 'ETHERNET') {
        let ret = decoders.Ethernet(this.buffer);

        if (ret.info.type === this.PROTOCOL.ETHERNET.IPV4) {
          console.log('Decoding IPv4...');
          ret = decoders.IPV4(this.buffer, ret.offset);
          console.log('from: ' + ret.info.srcaddr + ' to ' + ret.info.dstaddr);

          packet.time = new Date().toISOString();
          packet.src = ret.info.srcaddr;
          packet.dst = ret.info.dstaddr;
          packet.protocol = ret.info.protocol;
          packet.len = ret.info.totallen;
          if (ret.info.protocol === this.PROTOCOL.IP.TCP) {
            packetCallback(handleTCP(ret, packet, this.buffer));
          } else if (ret.info.protocol === this.PROTOCOL.IP.UDP) {
            console.log("No implemented yet");
            //packetCallback(handleUDP(ret, packet));
          } else {
            console.log(
              'Unsupported IPv4 protocol: ' + this.PROTOCOL.IP[ret.info.protocol]
            );
          }
        } else {
          console.log(
            'Unsupported Ethertype: ' + this.PROTOCOL.ETHERNET[ret.info.type]
          );
        }
      }
    });
  }

  close() {
    this.cap.close();
    console.log('Sniffer closed');
  }

  getDevices() {
    Cap.deviceList().forEach((device) => {
      deviceList.push(device);
    });
  }

}

function handleTCP(ret, packet, buffer) {
  const rawTCPHeader = buffer.slice(ret.offset, ret.offset + 20);
  const ack = rawTCPHeader.readUInt32BE(8);
  const seq = rawTCPHeader.readUInt32BE(4);
  const reserved = (rawTCPHeader[12] & 0b11100000) >> 5;
  const urgentPointer = rawTCPHeader.readUInt16BE(18);
  const dataOffset = (rawTCPHeader[12] >> 4) * 4;
  let options = null;
  if (dataOffset > 20) {
    options = buffer.slice(ret.offset + 20, ret.offset + dataOffset).toString('hex');
  }
  console.log('Raw TCP header:', buffer.slice(ret.offset, ret.offset + 20).toString('hex'));

  let datalen = ret.info.totallen - ret.hdrlen;
  console.log('Decoding TCP...');

  ret = decoders.TCP(buffer, ret.offset);
  packet.header = {
    srcPort: ret.info.srcport,
    dstPort: ret.info.dstport,
    seq: seq,
    ack: ack,
    dataOffset: dataOffset,
    reserved: reserved,
    flags: getFlagsString(ret.info.flags),
    window: ret.info.window,
    checksum: ret.info.checksum,
    urgentPointer: urgentPointer,
    options: options
  };

  console.log("------->", packet.header.seq);
  console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
  datalen -= ret.hdrlen;
  const data = buffer.toString('binary', ret.offset, ret.offset + datalen);
  console.log(data);
  packet.data = data;
  return packet;
}


function handleUDP(ret, packet) {
  console.log('Decoding UDP...');
  ret = decoders.UDP(this.buffer, ret.offset);
  console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
  console.log(
    this.buffer.toString('binary', ret.offset, ret.offset + ret.info.length)
  );
}

function getFlagsString(flags) {
  const flagNames = [
    { bit: 0x20, name: 'URG' },
    { bit: 0x10, name: 'ACK' },
    { bit: 0x08, name: 'PSH' },
    { bit: 0x04, name: 'RST' },
    { bit: 0x02, name: 'SYN' },
    { bit: 0x01, name: 'FIN' },
  ];

  return flagNames
    .filter(flag => flags & flag.bit)
    .map(flag => flag.name)
    .join(', ');
}
/* var packet = {
  time: "",
  src: "",
  dst: "",
  header: {
    src_port: "",
    dst_port: "",
    seq: "",
    ack: "",
    dataOffset: "",
    reserved: "",
    flags: {
      urg: "",
      ack: "",
      psh: "",
      rst: "",
      syn: "",
      fin: ""
    },
    window: "",
    checksum: "",
    urgentPointer: "",
    options: "",
  },
  data: "" */

module.exports = PacketSniffer;