/* eslint-disable @typescript-eslint/no-var-requires */
const { geoAlbersUsa } = require('d3-geo');
const us = require('./us-110m.topo.json');
const { tilegramTopology, toTransformedSVG } = require('../build/index.umd.js');
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
    iterations: 10,
    tileScaleFactor: 0.75,
    projection: geoAlbersUsa().scale(1300).translate([487.5, 305]),
  }
);

fs.writeFileSync('./test.topo.json', JSON.stringify(out.toTopoJSON()));
fs.writeFileSync('./test.svg', out.toSVG());
fs.writeFileSync('./transformed.geo.json', JSON.stringify(out.transformed));
fs.writeFileSync('./transformed.svg', toTransformedSVG(out.transformed));
