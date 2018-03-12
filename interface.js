const setupNodeManagementEvents = (zwave, config, commsInterface) => {
  zwave.on("node added", nodeId => {
    commsInterface.addNode(nodeId, {});
  });

  zwave.on("value added", (nodeId, comClass, value) => {
    commsInterface.valueAdded(nodeId, comClass, value.index, value);
  });

  zwave.on("node event", (nodeId, value) => {
    commsInterface.nodeEvent(nodeId, 0, 0, value);
  });

  zwave.on("value changed", (nodeId, comClass, value) => {
    commsInterface.valueChanged(nodeId, comClass, value.index, value);
  });

  zwave.on("value removed", (nodeId, comClass, index) => {
    commsInterface.valueRemoved(nodeId, comClass, index);
  });

  zwave.on("node ready", (nodeId, nodeInfo) => {
    commsInterface.updateNode(nodeId, {
      manufacturer: nodeInfo.manufacturer,
      manufacturerId: nodeInfo.manufacturerId,
      product: nodeInfo.product,
      productType: nodeInfo.productType,
      productId: nodeInfo.productId,
      type: nodeInfo.type,
      name: nodeInfo.name,
      loc: nodeInfo.loc,
      ready: true
    });
  });
};

const disconnect = (zwave, config) => {
  if (config.debug) {
    console.log("Disconnecting from zwave hardware");
  }

  return new Promise(resolve => {
    zwave.disconnect(config.hardwareLocation);
    resolve();
  });
};

const connect = (zwave, config, commsInterface) =>
  new Promise((resolve, reject) => {
    setupNodeManagementEvents(zwave, config, commsInterface);
    zwave.on("driver ready", () => {
      if (config.debug) {
        console.log("Driver ready.. starting scan");
      }
    });

    zwave.on("scan complete", () => {
      if (config.debug) {
        console.log("zwave network scan completed");
      }
      resolve();
    });

    zwave.on("driver failed", () => {
      if (config.debug) {
        console.log("Driver failed..");
      }
      disconnect(zwave, config).then(() => {
        reject();
      });
    });
    zwave.connect(config.hardwareLocation);
  });

const setConfig = async (nodeId, instanceId, index, value, zwave) => {
  zwave.setConfigParam(nodeId, instanceId, index, value);
};

const setValue = async (nodeId, classId, instanceId, index, value, zwave) => {
  zwave.setValue(
    {
      node_id: parseInt(nodeId, 10),
      class_id: parseInt(classId, 10),
      instance: parseInt(instanceId, 10),
      index: parseInt(index, 10)
    },
    value
  );
};

module.exports = async (config, ZWave, commsInterface) => {
  const zwave = new ZWave({
    ConsoleOutput: config.debug || false,
    Logging: false,
    saveconfig: true
  });

  return {
    connect: async () => connect(zwave, config, commsInterface),
    disconnect: async () => disconnect(zwave, config),
    setConfig: async (nodeId, instanceId, index, value) =>
      setConfig(nodeId, instanceId, index, value, zwave),
    setValue: async (nodeId, classId, instanceId, index, value) =>
      setValue(nodeId, classId, instanceId, index, value, zwave)
  };
};
