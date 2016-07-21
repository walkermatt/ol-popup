var dts = require('dts-bundle');

dts.bundle({
    name: 'ol3-popup',
    main: 'src/ol3-popup.d.ts',
    out: '~/index.d.ts',
    outputAsModuleFolder: true,
    referenceExternals: false,
    removeSource: true
});