require.config({
    
    packages: [
        {
            name: 'openlayers',
            location: '../bower_components/openlayers',
            main: 'ol-debug'
        },
        {
            name: 'jquery',
            location: '../bower_components/jquery',
            main: 'dist/jquery'
        },
    ],
    
    callback: () => {
   } 
});
