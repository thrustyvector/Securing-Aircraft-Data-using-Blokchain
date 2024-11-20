// migrations/2_deploy_contract.js

const AircraftMaintenance = artifacts.require("AircraftMaintenance");

module.exports = function (deployer) {
  deployer.deploy(AircraftMaintenance);
};

