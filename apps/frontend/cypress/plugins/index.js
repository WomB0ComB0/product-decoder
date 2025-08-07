/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // Log console output from the browser to terminal
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
  });

  return config;
}
