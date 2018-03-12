const ZWave = require("openzwave-shared");
const interfaceModule = require("./interface");

module.exports = {
  initialise: async (config, commsInterface) =>
    interfaceModule(config, ZWave, commsInterface),
  commsType: "zwave",
  interfaceId: "thinglator-interface-openzwave"
};
