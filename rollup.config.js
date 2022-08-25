module.exports = {
    entry: 'src/ol-popup.js',
    targets: [
        {
            dest: 'dist/ol-popup.js',
            format: 'umd',
            moduleName: 'Popup'
        }
    ],
    plugins: [
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-commonjs')()
    ],
    external: function(id) {
        return /ol\//.test(id);
    },
    globals: {
        'ol/Map': 'ol.Map',
        'ol/Overlay': 'ol.Overlay'
    }
};
