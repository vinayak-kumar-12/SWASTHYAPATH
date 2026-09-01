module.exports = {
  testEnvironment: "node",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  coveragePathIgnorePatterns: ["/node_modules/"],
  testTimeout: 10000,
};
