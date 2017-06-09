/* eslint-disable new-cap, no-unused-expressions, no-undef, global-require */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const mockery = require('mockery');

const expect = chai.expect;
chai.use(sinonChai);
let config;
let onValueChangedCallback;
let interfaceFile;
let openzwaveMock;
let connectStub;
let disconnectStub;
let setValueStub;

describe('interface structure', () => {
    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        connectStub = sinon.stub();
        disconnectStub = sinon.stub();
        setValueStub = sinon.stub();

        openzwaveMock = class OZW {
            constructor() {
                this.events = {};
            }
            connect(args) {
                connectStub(args);
            }
            disconnect(args) {
                disconnectStub(args);
            }
            on(event, cb) {
                this.events[event] = cb;
            }
            emit(event) {
                if (this.events[event]) {
                    this.events[event]();
                }
            }
            setValue(a, b) {
                setValueStub(a, b);
            }
        };

        mockery.registerMock('openzwave-shared', openzwaveMock);
        interfaceFile = require('../index');
        config = {
            hardwareLocation: 'hardwareLocation'
        };
        onValueChangedCallback = sinon.stub();
    });

    afterEach(() => {
        mockery.deregisterMock('openzwave-shared');
    });

    describe('core interface methods', () => {
        it('should be exposed as a class', () => {
            expect(interfaceFile.interface).to.be.a.class;
            const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
            expect(interfaceInstance instanceof interfaceFile.interface).to.equal(true);
        });

        it('should expose the type of comms that the interface is built to deal with', () => {
            expect(interfaceFile.type).to.equal('zwave');
        });

        describe('connect', () => {
            it('should have a connect method that connects to openzwave', () => {
                const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
                expect(typeof interfaceInstance.connect).to.equal('function');

                const p = interfaceInstance.connect().then(() => {
                    expect(connectStub).to.have.been.calledWith('hardwareLocation');
                });
                interfaceInstance.zwave.emit('driver ready');
                interfaceInstance.zwave.emit('scan complete');
                return p;
            });

            it('should gracefully fail the promise when there\'s an error connecting', (done) => {
                const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
                expect(typeof interfaceInstance.connect).to.equal('function');

                interfaceInstance.connect().catch(() => {
                    expect(disconnectStub).to.have.been.calledOnce;
                    done();
                });
                interfaceInstance.zwave.emit('driver failed');
            });
        });

        it('should have a disconnect method that disconnects from openzwave', () => {
            const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
            expect(typeof interfaceInstance.disconnect).to.equal('function');

            return interfaceInstance.disconnect().then(() => {
                expect(disconnectStub).to.have.been.calledOnce;
            });
        });

        it('should have a getAllNodes method that returns a list of all zwave devices', () => {
            const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
            expect(typeof interfaceInstance.disconnect).to.equal('function');

            return interfaceInstance.getAllNodes().then((nodes) => {
                expect(nodes).to.deep.equal([]);
                interfaceInstance.nodes = {
                    a: {
                        id: 'a'
                    },
                    b: {
                        id: 'b'
                    },
                    c: {
                        id: 'c'
                    }
                };
                return interfaceInstance.getAllNodes();
            }).then((nodes) => {
                expect(nodes).to.deep.equal([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
            });
        });

        it(`should have a getUnclaimedNodes method that returns a list of
            all zwave devices not claimed by drivers`, () => {
            const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
            expect(typeof interfaceInstance.disconnect).to.equal('function');

            return interfaceInstance.getUnclaimedNodes().then((nodes) => {
                expect(nodes).to.deep.equal([]);
                interfaceInstance.nodes = {
                    a: {
                        id: 'a',
                        driverid: null
                    },
                    b: {
                        id: 'b',
                        driverid: '1'
                    },
                    c: {
                        id: 'c',
                        driverid: '2'
                    }
                };
                return interfaceInstance.getUnclaimedNodes();
            }).then((nodes) => {
                expect(nodes).to.deep.equal([{ id: 'a', driverid: null }]);
            });
        });

        it(`should have a getNodesClaimedByDriver method that returns a list of all zwave devices claimed
            by a driver`, () => {
            const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
            expect(typeof interfaceInstance.disconnect).to.equal('function');

            return interfaceInstance.getNodesClaimedByDriver().then((nodes) => {
                expect(nodes).to.deep.equal([]);
                interfaceInstance.nodes = {
                    a: {
                        id: 'a',
                        driverid: null
                    },
                    b: {
                        id: 'b',
                        driverid: '1'
                    },
                    c: {
                        id: 'c',
                        driverid: '2'
                    }
                };
                return interfaceInstance.getNodesClaimedByDriver('1');
            }).then((nodes) => {
                expect(nodes).to.deep.equal([{ id: 'b', driverid: '1' }]);
            });
        });

        it('should have a claimNode method that claims a device for a particular driver', () => {
            const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
            expect(typeof interfaceInstance.disconnect).to.equal('function');

            return interfaceInstance.claimNode('1', 'a').then(() => {
                expect(interfaceInstance.nodes).to.deep.equal({});

                interfaceInstance.nodes = {
                    a: {
                        id: 'a',
                        driverid: null
                    },
                    b: {
                        id: 'b',
                        driverid: '1'
                    },
                    c: {
                        id: 'c',
                        driverid: '2'
                    }
                };
                return interfaceInstance.claimNode('1', 'a');
            }).then(() => {
                expect(interfaceInstance.nodes).to.deep.equal({
                    a: {
                        id: 'a',
                        driverid: '1'
                    },
                    b: {
                        id: 'b',
                        driverid: '1'
                    },
                    c: {
                        id: 'c',
                        driverid: '2'
                    }
                });
            });
        });

        it('should have a setValue method that sets the value on a particular zwave device', () => {
            const interfaceInstance = new interfaceFile.interface(config, onValueChangedCallback);
            expect(typeof interfaceInstance.disconnect).to.equal('function');

            return interfaceInstance.setValue('a', 'class1', 1, 0, 123).then(() => {
                expect(setValueStub).to.have.been.calledWith({
                    node_id: 'a', class_id: 'class1', instance: 1, index: 0
                }, 123);
            });
        });
    });
});
