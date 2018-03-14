#thinglator-interface-openzwave

An interface that allows Thinglator to talk to zwave devices using openzwave

## Requirements

* node.js 8.9+
* Thinglator - https://github.com/richardwillars/thinglator
* openzwave
* An openzwave compatible dongle such as Aeotec z-stick - https://github.com/OpenZWave/open-zwave/wiki/Controller-Compatibility-List

## Installation for usage

Navigate to the root of your Thinglator installation and run:

> yarn add thinglator-interface-openzwave

> yarn dev

# Installation for development

Navigate to the root of the thinglator-interface-openzwave project and run:

> yarn install

> yarn link

Navigate to the root of your Thinglator installation and run:

> yarn add thinglator-interface-openzwave

Go to the thinglator project and run:

> yarn link thinglator-interface-openzwave

This will point thinglator/node_modules/thinglator-interface-openzwave to the directory where you just installed thinglator-interface-openzwave. This makes it easier for development and testing of the module.

> yarn dev

## Test

> yarn test
> or
> yarn test:watch
