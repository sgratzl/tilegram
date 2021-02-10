/* eslint-disable @typescript-eslint/no-var-requires */
const { geoIdentity } = require('d3-geo');
const us = require('us-atlas/states-albers-10m.json');
const { tilegramTopology } = require('../build/index.umd.js');
const fs = require('fs');

const out = tilegramTopology(
  us,
  'states',
  () => {
    return 1;
  },
  {
    canvasWidth: 975,
    canvasHeight: 610,
    projection: geoIdentity(),
  }
);

fs.writeFileSync('./test.topo.json', JSON.stringify(out.toTopoJSON()));
fs.writeFileSync('./test.topo.svg', out.toSVG());
