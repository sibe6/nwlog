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
  let datalen = ret.info.totallen - ret.hdrlen;
  console.log('Decoding TCP...');

  ret = decoders.TCP(buffer, ret.offset);
  packet.header = {
    src_port: ret.info.srcport,
    dst_port: ret.info.dstport,
    seq: ret.info.seq,
    ack: ret.info.ack,
    flags: ret.info.flags,
  };

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