/* eslint-disable class-methods-use-this */
const interfaceModule = require("./interface");

const getEventListenerCallback = (eventName, spyCalls) => {
  const scanCompleteCallback = spyCalls.find(
    listener => listener[0] === eventName
  );
  return scanCompleteCallback;
};
describe("interface structure", () => {
  describe("interface methods", () => {
    it("should be exposed as a function that returns a list of methods", async () => {
      const config = {};
      const constructorSpy = jest.fn();
      class ZWave {
        constructor(arg1) {
          constructorSpy(arg1);
        }
      }
      const commsInterface = {};

      const interfaceObj = await interfaceModule(config, ZWave, commsInterface);
      expect(Object.keys(interfaceObj)).toEqual([
        "connect",
        "disconnect",
        "setConfig",
        "setValue"
      ]);
      expect(constructorSpy).toHaveBeenCalledWith({
        ConsoleOutput: false,
        Logging: false,
        saveconfig: true
      });
    });

    describe("connect", () => {
      it("should have a connect method that connects to openzwave and resolves on scan completion", async () => {
        const connectSpy = jest.fn();
        const onSpy = jest.fn();

        const config = {
          hardwareLocation: "/foo"
        };
        class ZWave {
          on(arg1, arg2) {
            onSpy(arg1, arg2);
          }
          connect(arg1) {
            connectSpy(arg1);
          }
        }
        const commsInterface = {};

        const interfaceObj = await interfaceModule(
          config,
          ZWave,
          commsInterface
        );
        const promise = interfaceObj.connect();
        const scanCompleteCallback = getEventListenerCallback(
          "scan complete",
          onSpy.mock.calls
        );
        scanCompleteCallback[1]();
        await promise;
        expect(connectSpy).toHaveBeenCalledTimes(1);
        expect(connectSpy).toHaveBeenCalledWith("/foo");
      });
      it("should listen to all the openzwave events", async () => {
        const onSpy = jest.fn();

        const config = {
          hardwareLocation: "/foo"
        };
        class ZWave {
          on(arg1, arg2) {
            onSpy(arg1, arg2);
          }
          connect() {}
        }
        const commsInterface = {};

        const interfaceObj = await interfaceModule(
          config,
          ZWave,
          commsInterface
        );
        const promise = interfaceObj.connect();
        const scanCompleteCallback = getEventListenerCallback(
          "scan complete",
          onSpy.mock.calls
        );
        scanCompleteCallback[1]();
        await promise;
        expect(onSpy).toHaveBeenCalledTimes(9);
        expect(onSpy.mock.calls.map(call => call[0])).toEqual([
          "node added",
          "value added",
          "node event",
          "value changed",
          "value removed",
          "node ready",
          "driver ready",
          "scan complete",
          "driver failed"
        ]);
      });

      it("should disconnect and gracefully fail when there's an error connecting", async () => {
        const onSpy = jest.fn();
        const disconnectSpy = jest.fn();

        const config = {
          hardwareLocation: "/foo"
        };
        class ZWave {
          on(arg1, arg2) {
            onSpy(arg1, arg2);
          }
          connect() {}
          disconnect(arg1) {
            disconnectSpy(arg1);
          }
        }
        const commsInterface = {};

        const interfaceObj = await interfaceModule(
          config,
          ZWave,
          commsInterface
        );
        const promise = interfaceObj.connect();
        const driverFailedCallback = getEventListenerCallback(
          "driver failed",
          onSpy.mock.calls
        );
        driverFailedCallback[1]();
        try {
          await promise;
          expect(true).toEqual(false);
        } catch (err) {
          expect(disconnectSpy).toHaveBeenCalledTimes(1);
          expect(disconnectSpy).toHaveBeenCalledWith("/foo");
        }
      });
    });

    describe("disconnect", () => {
      it("should have a disconnect method that disconnects from openzwave", async () => {
        const onSpy = jest.fn();
        const disconnectSpy = jest.fn();

        const config = {
          hardwareLocation: "/foo"
        };
        class ZWave {
          on(arg1, arg2) {
            onSpy(arg1, arg2);
          }
          connect() {}
          disconnect(arg1) {
            disconnectSpy(arg1);
          }
        }
        const commsInterface = {};

        const interfaceObj = await interfaceModule(
          config,
          ZWave,
          commsInterface
        );
        const promise = interfaceObj.connect();
        const scanCompleteCallback = getEventListenerCallback(
          "scan complete",
          onSpy.mock.calls
        );
        scanCompleteCallback[1]();
        await promise;
        await interfaceObj.disconnect();
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
        expect(disconnectSpy).toHaveBeenCalledWith("/foo");
      });
    });

    describe("setConfig", () => {
      it("should set the config param on a particular zwave device when called", async () => {
        const onSpy = jest.fn();
        const setConfigParamSpy = jest.fn();

        const config = {
          hardwareLocation: "/foo"
        };
        class ZWave {
          on(arg1, arg2) {
            onSpy(arg1, arg2);
          }
          connect() {}
          setConfigParam(arg1, arg2, arg3, arg4) {
            setConfigParamSpy(arg1, arg2, arg3, arg4);
          }
        }
        const commsInterface = {};

        const interfaceObj = await interfaceModule(
          config,
          ZWave,
          commsInterface
        );
        const connectPromise = interfaceObj.connect();
        const scanCompleteCallback = getEventListenerCallback(
          "scan complete",
          onSpy.mock.calls
        );
        scanCompleteCallback[1]();
        await connectPromise;

        const nodeId = 1;
        const instance = 2;
        const index = 3;
        const value = 4;
        interfaceObj.setConfig(nodeId, instance, index, value);
        expect(setConfigParamSpy).toHaveBeenCalledTimes(1);
        expect(setConfigParamSpy).toHaveBeenCalledWith(
          nodeId,
          instance,
          index,
          value
        );
      });
    });

    describe("setValue", () => {
      it("should set the value on a particular zwave device when called", async () => {
        const onSpy = jest.fn();
        const setValueSpy = jest.fn();

        const config = {
          hardwareLocation: "/foo"
        };
        class ZWave {
          on(arg1, arg2) {
            onSpy(arg1, arg2);
          }
          connect() {}
          setValue(arg1, arg2) {
            setValueSpy(arg1, arg2);
          }
        }
        const commsInterface = {};

        const interfaceObj = await interfaceModule(
          config,
          ZWave,
          commsInterface
        );
        const connectPromise = interfaceObj.connect();
        const scanCompleteCallback = getEventListenerCallback(
          "scan complete",
          onSpy.mock.calls
        );
        scanCompleteCallback[1]();
        await connectPromise;

        const nodeId = 1;
        const classId = 2;
        const instanceId = 3;
        const index = 4;
        const value = 5;
        interfaceObj.setValue(nodeId, classId, instanceId, index, value);
        expect(setValueSpy).toHaveBeenCalledTimes(1);
        expect(setValueSpy).toHaveBeenCalledWith(
          {
            node_id: nodeId,
            class_id: classId,
            instance: instanceId,
            index
          },
          value
        );
      });
    });
  });

  describe("comms interface", () => {
    it("should call 'addNode' when a node is added to openzwave", async () => {
      const onSpy = jest.fn();

      const config = {
        hardwareLocation: "/foo"
      };
      class ZWave {
        on(arg1, arg2) {
          onSpy(arg1, arg2);
        }
        connect() {}
      }
      const commsInterface = {
        addNode: jest.fn()
      };

      const interfaceObj = await interfaceModule(config, ZWave, commsInterface);
      const promise = interfaceObj.connect();
      const scanCompleteCallback = getEventListenerCallback(
        "scan complete",
        onSpy.mock.calls
      );
      scanCompleteCallback[1]();
      await promise;
      const nodeAddedCallback = getEventListenerCallback(
        "node added",
        onSpy.mock.calls
      );
      const nodeId = 123;
      nodeAddedCallback[1](nodeId);
      expect(commsInterface.addNode).toHaveBeenCalledTimes(1);
      expect(commsInterface.addNode).toHaveBeenCalledWith(nodeId, {});
    });
    it("should call 'valueAdded' when a value is added to openzwave", async () => {
      const onSpy = jest.fn();

      const config = {
        hardwareLocation: "/foo"
      };
      class ZWave {
        on(arg1, arg2) {
          onSpy(arg1, arg2);
        }
        connect() {}
      }
      const commsInterface = {
        valueAdded: jest.fn()
      };

      const interfaceObj = await interfaceModule(config, ZWave, commsInterface);
      const promise = interfaceObj.connect();
      const scanCompleteCallback = getEventListenerCallback(
        "scan complete",
        onSpy.mock.calls
      );
      scanCompleteCallback[1]();
      await promise;
      const valueAddedCallback = getEventListenerCallback(
        "value added",
        onSpy.mock.calls
      );
      const nodeId = 123;
      const comClass = 234;
      const value = {
        index: 1
      };
      valueAddedCallback[1](nodeId, comClass, value);
      expect(commsInterface.valueAdded).toHaveBeenCalledTimes(1);
      expect(commsInterface.valueAdded).toHaveBeenCalledWith(
        nodeId,
        comClass,
        value.index,
        value
      );
    });
    it("should call 'nodeEvent' when a node event is triggered on openzwave", async () => {
      const onSpy = jest.fn();

      const config = {
        hardwareLocation: "/foo"
      };
      class ZWave {
        on(arg1, arg2) {
          onSpy(arg1, arg2);
        }
        connect() {}
      }
      const commsInterface = {
        nodeEvent: jest.fn()
      };

      const interfaceObj = await interfaceModule(config, ZWave, commsInterface);
      const promise = interfaceObj.connect();
      const scanCompleteCallback = getEventListenerCallback(
        "scan complete",
        onSpy.mock.calls
      );
      scanCompleteCallback[1]();
      await promise;
      const nodeEventCallback = getEventListenerCallback(
        "node event",
        onSpy.mock.calls
      );
      const nodeId = 123;
      const value = { foo: "bar" };
      nodeEventCallback[1](nodeId, value);
      expect(commsInterface.nodeEvent).toHaveBeenCalledTimes(1);
      expect(commsInterface.nodeEvent).toHaveBeenCalledWith(
        nodeId,
        0,
        0,
        value
      );
    });
    it("should call 'valueChange' when a value is changed on openzwave", async () => {
      const onSpy = jest.fn();

      const config = {
        hardwareLocation: "/foo"
      };
      class ZWave {
        on(arg1, arg2) {
          onSpy(arg1, arg2);
        }
        connect() {}
      }
      const commsInterface = {
        valueChanged: jest.fn()
      };

      const interfaceObj = await interfaceModule(config, ZWave, commsInterface);
      const promise = interfaceObj.connect();
      const scanCompleteCallback = getEventListenerCallback(
        "scan complete",
        onSpy.mock.calls
      );
      scanCompleteCallback[1]();
      await promise;
      const valueChangedCallback = getEventListenerCallback(
        "value changed",
        onSpy.mock.calls
      );
      const nodeId = 123;
      const comClass = 234;
      const value = { index: 1 };
      valueChangedCallback[1](nodeId, comClass, value);
      expect(commsInterface.valueChanged).toHaveBeenCalledTimes(1);
      expect(commsInterface.valueChanged).toHaveBeenCalledWith(
        nodeId,
        comClass,
        value.index,
        value
      );
    });
    it("should call 'valueRemoved' when a value is removed from openzwave", async () => {
      const onSpy = jest.fn();

      const config = {
        hardwareLocation: "/foo"
      };
      class ZWave {
        on(arg1, arg2) {
          onSpy(arg1, arg2);
        }
        connect() {}
      }
      const commsInterface = {
        valueRemoved: jest.fn()
      };

      const interfaceObj = await interfaceModule(config, ZWave, commsInterface);
      const promise = interfaceObj.connect();
      const scanCompleteCallback = getEventListenerCallback(
        "scan complete",
        onSpy.mock.calls
      );
      scanCompleteCallback[1]();
      await promise;
      const valueRemovedCallback = getEventListenerCallback(
        "value removed",
        onSpy.mock.calls
      );
      const nodeId = 123;
      const comClass = 234;
      const index = 1;
      valueRemovedCallback[1](nodeId, comClass, index);
      expect(commsInterface.valueRemoved).toHaveBeenCalledTimes(1);
      expect(commsInterface.valueRemoved).toHaveBeenCalledWith(
        nodeId,
        comClass,
        index
      );
    });
    it("should call 'updateNode' when a node is ready on openzwave", async () => {
      const onSpy = jest.fn();

      const config = {
        hardwareLocation: "/foo"
      };
      class ZWave {
        on(arg1, arg2) {
          onSpy(arg1, arg2);
        }
        connect() {}
      }
      const commsInterface = {
        updateNode: jest.fn()
      };

      const interfaceObj = await interfaceModule(config, ZWave, commsInterface);
      const promise = interfaceObj.connect();
      const scanCompleteCallback = getEventListenerCallback(
        "scan complete",
        onSpy.mock.calls
      );
      scanCompleteCallback[1]();
      await promise;
      const valueChangedCallback = getEventListenerCallback(
        "node ready",
        onSpy.mock.calls
      );
      const nodeId = 123;
      const nodeInfo = {
        manufacturer: "Aeotec",
        manufacturerId: "1x00",
        product: "Multisensor",
        productType: "Sensor",
        productId: "123",
        type: "Sensor",
        name: "Multisensor",
        loc: "Unknown"
      };
      valueChangedCallback[1](nodeId, nodeInfo);
      expect(commsInterface.updateNode).toHaveBeenCalledTimes(1);
      expect(commsInterface.updateNode).toHaveBeenCalledWith(nodeId, {
        manufacturer: "Aeotec",
        manufacturerId: "1x00",
        product: "Multisensor",
        productType: "Sensor",
        productId: "123",
        type: "Sensor",
        name: "Multisensor",
        loc: "Unknown",
        ready: true
      });
    });
  });
});
