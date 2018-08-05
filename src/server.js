import EventEmitter from 'events';
import uuidv4 from 'uuid/v4';
import jayson from 'jayson';
import getPortSync from 'get-port-sync';
import { clipboard } from 'electron';
import ssdp, { usnRegex, serviceType } from './ssdp';
import objectHas from './utils/objectHas';
import { ALIVE_SERVICE, ESTABLISHED_CONNECTION } from './constants/server-notifications';

// Used to broacast specific server events to the outside
const emitter = new EventEmitter();

const processUUID = uuidv4();
const port = getPortSync();

let aliveServices = {};
let issuedConnections = {}; // Client context: Logs connection attempts to available services
let receivedConnections = {};  // Server context: Logs client connection attempts
let establishedConnections = {}; // Server context: Both end machines attemped to connect to each other
let previousClipboardValue = null;

// Set up JSON RPC stuff
function handleGetNameRequest() {
  console.log(Date.now(), `${processUUID} responding to 'getName' request`);

  return {
    name: processUUID, // TODO: The user should be able to set its own discovery name
  };
}

function handleConnectRequest({ uuid }) {
  console.log(Date.now(), `${processUUID} handling connection request from ${uuid}`);

  if (issuedConnections[uuid]) {
    delete issuedConnections[uuid];
    establishedConnections[uuid] = {};

    emitter.emit(ESTABLISHED_CONNECTION, uuid);
  }
  else {
    receivedConnections[uuid] = {};
  }

  return true;
}

function handleSetClipboardValueRequest({ uuid, value }) {
  console.log(Date.now(), `${processUUID} has new value '${value}' from ${uuid}`);

  clipboard.writeText(value);
  previousClipboardValue = value; // This avoids the just-received value from being sent out

  return true;
}

let jsonRpcServer = jayson.server({
  getName(args, callback) {
    callback(null, handleGetNameRequest());
  },
  connect(args, callback) {
    if (!objectHas(args, ['uuid'])) {
      callback(() => ({
        error: 'Invalid request',
      }));
    }
    else {
      callback(null, handleConnectRequest(args));
    }
  },
  setClipboardValue(args, callback) {
    if (!objectHas(args, ['uuid', 'value'])) {
      callback(() => ({
        error: 'Invalid request',
      }));
    }
    // Only connected users can make this request!
    else if (!establishedConnections[args.uuid]) {
      callback(() => ({
        error: 'Forbidden request',
      }));
    }
    else {
      callback(null, handleSetClipboardValueRequest(args));
    }
  },
});

jsonRpcServer.http().listen(port); // TODO: Move to HTTPS

// Set up SSDP
let ssdpInstance = ssdp({
  uuid: processUUID,
  port,
});

// Triggered by all advertisers including this process
ssdpInstance.server.on('advertise-alive', (headers, body) => {
  if (headers.NT === serviceType // Look for the same service
      && headers.USN !== ssdpInstance.usn // But ignore this process
  ) {
    let results = usnRegex.exec(headers.USN);

    let uuid = results[1];

    // The service will try to advertise itself through all its available interfaces.
    // Only the first one is stored which is enough to establish a connection.
    if (aliveServices[uuid]) {
      return;
    }

    console.log(Date.now(), 'ADVERTISE-ALIVE', headers, body);

    aliveServices[uuid] = {
      location: headers.LOCATION,
      client: jayson.client.http(headers.LOCATION), // TODO: Move to HTTPS
    };

    aliveServices[uuid].client.request('getName', null, (err, { result: { name } }) => {
      if (err) {
        console.error(Date.now(), `Response error to 'getName' request at ${aliveServices[uuid].LOCATION} (${uuid})}`, err);

        return;
      }

      aliveServices[uuid].name = name;

      console.log(Date.now(), `New alive service registered at ${uuid}`, aliveServices[uuid]);

      emitter.emit(ALIVE_SERVICE, {
        uuid,
        name,
      });
    });
  }
});

ssdpInstance.server.on('advertise-bye', (...args) => {
  console.log(Date.now(), 'ADVERTISE-BYE', args);

  // TODO: Clear up after a device/service advertises to go away
});

// Poll the clipboard indefinitely for new values and multicast them
setInterval(() => {
  let currentValue = clipboard.readText();

  if (currentValue !== previousClipboardValue && previousClipboardValue !== null) {
    Object.keys(establishedConnections).forEach(uuid => {
      console.log(Date.now(), `${processUUID} sends ${uuid} its new clipboard value '${currentValue}'`);

      aliveServices[uuid].client.request('setClipboardValue', { uuid: processUUID, value: currentValue }, err => {
        if (err) {
          console.error(Date.now(), `Response error to 'setClipboardValue' request at ${aliveServices[uuid].LOCATION} (${uuid})}`, err);
        }
      });
    });
  }

  previousClipboardValue = currentValue;
}, 1000);

export const connectToService = uuid => {
  console.log(Date.now(), `${processUUID} requests connection to ${uuid}`);

  aliveServices[uuid].client.request('connect', { uuid: processUUID }, err => {
    if (err) {
      console.error(Date.now(), `Response error to 'connect' request at ${aliveServices[uuid].LOCATION} (${uuid})}`, err);

      return;
    }

    if (receivedConnections[uuid]) {
      delete receivedConnections[uuid];
      establishedConnections[uuid] = {};

      console.log(Date.now(), `Connection established between ${processUUID} and ${uuid}`);

      emitter.emit(ESTABLISHED_CONNECTION, uuid);
    }
    else {
      issuedConnections[uuid] = {};

      console.log(Date.now(), `First step of connection starting from ${processUUID} to ${uuid} done`);
    }
  });
};

export default emitter;
