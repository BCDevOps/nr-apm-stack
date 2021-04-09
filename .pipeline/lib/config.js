'use strict';
process.on('unhandledRejection', (reason) => {
  console.log(reason);
  process.exit(1);
});

module.exports = class {
  constructor(options) {
    this.options = options
  }
  build() {
    const options = this.options
    const name = 'nress'
    //const phases = ['build', 'dev', 'test', 'prod']
    const changeId = options.pr //aka pull-request

    const phases0 = {
      transient: {build: true                          , dev: true                                                            , test: false                                                         , prod: false},
      name:      {build: `${name}`                     , dev: `${name}`                                                       , test: `${name}`                                                     , prod: `${name}`},
      suffix:    {build: `-build-${changeId}`          , dev: `-dev-${changeId}`                                              , test: `-test`                                                       , prod: `-prod`},
      phase:     {build: 'build'                       , dev: 'dev'                                                           , test: 'test'                                                        , prod: 'prod'},
      keycloak:  {
        build: null,
        dev: {baseURL: process.env.KEYCLOAK_BASEURL, realmName:process.env.KEYCLOAK_REALM_NAME, clientId: process.env.KEYCLOAK_CLIENT_ID, clientSecret: process.env.KEYCLOAK_CLIENT_SECRET},
        test: {baseURL: process.env.KEYCLOAK_BASEURL, realmName:process.env.KEYCLOAK_REALM_NAME, clientId: process.env.KEYCLOAK_CLIENT_ID, clientSecret: process.env.KEYCLOAK_CLIENT_SECRET},
        prod: {baseURL: process.env.KEYCLOAK_BASEURL, realmName:process.env.KEYCLOAK_REALM_NAME, clientId: process.env.KEYCLOAK_CLIENT_ID, clientSecret: process.env.KEYCLOAK_CLIENT_SECRET},
      },
    };
    const phases = {};
    // Pivot configuration table, so that `phase name` becomes a top-level property
    // { namespace: { build: '-tools',  dev: '-dev'}}   ->  { build: { namespace: '-tools' }, dev: { namespace: '-dev' } }
    Object.keys(phases0).forEach((properyName) => {
      const property = phases0[properyName];
      Object.keys(property).forEach((phaseName) => {
        phases[phaseName] = phases[phaseName] || {};
        phases[phaseName][properyName] = property[phaseName];
      });
    });

    return {phases, options, environments: ['dev', 'test', 'prod']}
  }
}