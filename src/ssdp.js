import SSDP from 'node-ssdp';

export const usnRegex = /uuid:([a-f0-9-]+)::urn:(.+)/;
export const serviceType = 'urn:schemas-uniclip-com:service:ConnectionManager:1';

export default ({ uuid, port }) => {
  let udn = `uuid:${uuid}`;
  let usn = `${udn}::${serviceType}`;

  let server = new SSDP.Server({
    location: {
      protocol: 'http://', // TODO: Move to HTTPS
      port,
      path: '',
    },
    udn,
  });

  server.addUSN(serviceType);

  server.start();

  return {
    server,
    usn,
  };
};
