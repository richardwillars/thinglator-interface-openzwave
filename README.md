#thinglator-interface-openzwave

An interface that allows Thinglator to talk to zwave devices using openzwave

## Requirements

* node.js 8.9+
* Thinglator - https://github.com/richardwillars/thinglator
* openzwave
* An openzwave compatible dongle such as Aeotec z-stick - https://github.com/OpenZWave/open-zwave/wiki/Controller-Compatibility-List

## Installation

Navigate to the root of your Thinglator installation and run

> yarn add thinglator-interface-openzwave

Go to the thinglator project and run:

> yarn link thinglator-interface-openzwave
> This will point thinglator/node_modules/thinglator-interface-openzwave to the directory where you just installed thinglator-interface-openzwave. This makes it easier for development and testing of the module.

Go to thinglator and update config/default.json to include the following JSON:

```
"interfaces": {
  "zwave": {
    "hardwareLocation": "/dev/cu.usbmodem1411",
    "debug": true
  }
}
```

The value '/dev/cu.usbmodel1411' may vary on your computer - it should be the path to the zwave USB device. If you're on a mac, you can run 'ls /dev' and you should see a /dev/cu.usbmodemXXXX device.

Save that config file and launch Thinglator by running

> yarn dev

## Test

> yarn test
> or
> yarn test:watch
