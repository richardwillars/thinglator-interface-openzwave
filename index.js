const ZWave = require('openzwave-shared');

const openzwaveInterface = class OpenZWaveInterface {
    constructor(config, onValueChangedCallback) {
        this.onValueChanged = onValueChangedCallback;
        this.config = config;
        this.nodes = {};
        this.zwave = new ZWave({
            ConsoleOutput: this.config.debug,
            Logging: false
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.setupNodeManagementEvents();
            this.zwave.on('driver ready', () => {
                if (this.config.debug) {
                    console.log('Driver ready.. starting scan');
                }
            });

            this.zwave.on('scan complete', () => {
                if (this.config.debug) {
                    console.log('zwave network scan completed');
                }
                resolve();
            });

            this.zwave.on('driver failed', () => {
                if (this.config.debug) {
                    console.log('Driver failed..');
                }
                this.disconnect().then(() => {
                    reject();
                });
            });

            this.zwave.connect(this.config.hardwareLocation);
        });
    }

    disconnect() {
        if (this.config.debug) {
            console.log('Disconnecting from zwave hardware');
        }

        return new Promise((resolve) => {
            this.zwave.disconnect(this.config.hardwareLocation);
            resolve();
        });
    }

    setupNodeManagementEvents() {
        this.zwave.on('node added', (nodeid) => {
            if (this.config.debug) {
                console.log('node added', nodeid);
            }
            this.nodes[nodeid] = {
                nodeid,
                driverid: null,
                manufacturer: '',
                manufacturerid: '',
                product: '',
                producttype: '',
                productid: '',
                type: '',
                name: '',
                loc: '',
                classes: {},
                ready: false
            };
        });

        this.zwave.on('value added', (nodeid, comclass, value) => {
            // console.log('value added', nodeid, comclass, value);
            if (!this.nodes[nodeid].classes[comclass]) {
                this.nodes[nodeid].classes[comclass] = {};
            }
            this.nodes[nodeid].classes[comclass][value.index] = value;
        });

        this.zwave.on('node event', (nodeid, nodeEvt) => {
            if (this.config.debug === true) {
                console.log('node event', nodeid, nodeEvt);
            }
            if (this.nodes[nodeid].driverid !== null) {
                this.onValueChanged(this.nodes[nodeid].driverid, nodeid, 0, 0, nodeEvt);
            }
        });

        this.zwave.on('value changed', (nodeid, comclass, value) => {
            // console.log('value changed', nodeid, comclass, value);
            if (this.nodes[nodeid].ready) {
                console.log('node%d: changed: %d:%s:%s->%s',
                  nodeid,
                  comclass,
                  value.label,
                  this.nodes[nodeid].classes[comclass][value.index].value,
                  value.value
                );
            }
            this.nodes[nodeid].classes[comclass][value.index] = value;
            if (this.nodes[nodeid].driverid !== null) {
                this.onValueChanged(this.nodes[nodeid].driverid, nodeid, comclass, value.index, value.value);
            }
        });

        this.zwave.on('value removed', (nodeid, comclass, index) => {
            if (this.nodes[nodeid].classes[comclass] && this.nodes[nodeid].classes[comclass][index]) {
                delete this.nodes[nodeid].classes[comclass][index];
            }
        });

        this.zwave.on('node ready', (nodeid, nodeinfo) => {
            this.nodes[nodeid].manufacturer = nodeinfo.manufacturer;
            this.nodes[nodeid].manufacturerid = nodeinfo.manufacturerid;
            this.nodes[nodeid].product = nodeinfo.product;
            this.nodes[nodeid].producttype = nodeinfo.producttype;
            this.nodes[nodeid].productid = nodeinfo.productid;
            this.nodes[nodeid].type = nodeinfo.type;
            this.nodes[nodeid].name = nodeinfo.name;
            this.nodes[nodeid].loc = nodeinfo.loc;
            this.nodes[nodeid].ready = true;
            if (this.config.debug) {
                console.log(
                  'node%d: %s, %s',
                  nodeid,
                  nodeinfo.manufacturer ? nodeinfo.manufacturer : `id=${nodeinfo.manufacturerid}`,
                  nodeinfo.product ? nodeinfo.product : `product=${nodeinfo.productid}, type=${nodeinfo.producttype}`
                );
            }
            if (this.config.debug) {
                console.log(
                  'node%d: name="%s", type="%s", location="%s"',
                  nodeid,
                  nodeinfo.name,
                  nodeinfo.type,
                  nodeinfo.loc
                );
            }
        });
    }

    addDevices() {
    // not implemented yet
    }

    getAllNodes() {
        return Promise.resolve().then(() => Object.keys(this.nodes).map(key => this.nodes[key]));
    }

    getUnclaimedNodes() {
        return Promise.resolve().then(() => Object.keys(this.nodes)
          .map(key => this.nodes[key])
          .filter(node => node.driverid === null)
        );
    }

    getNodesClaimedByDriver(driverId) {
        return Promise.resolve().then(() => Object.keys(this.nodes)
          .map(key => this.nodes[key])
          .filter(node => node.driverid === driverId)
        );
    }

    claimNode(driverId, nodeId) {
        return Promise.resolve().then(() => {
            if (this.nodes[nodeId]) {
                if (this.nodes[nodeId].driverid !== driverId) {
                    this.nodes[nodeId].driverid = driverId;
                }
            }
        });
    }

    setValue(nodeId, classId, instance, index, value) {
        return Promise.resolve().then(() => {
            this.zwave.setValue({
                node_id: nodeId,
                class_id: classId,
                instance,
                index
            }, value);
        });
    }
};

module.exports = {
    interface: openzwaveInterface,
    type: 'zwave'
};
