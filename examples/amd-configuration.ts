require.config({
    
    baseUrl: '../src',
    
    packages: [
        {
            name: 'openlayers',
            //location: 'https://cdnjs.cloudflare.com/ajax/libs/ol3/3.14.0',
            location: '../bower_components/openlayers',
            main: 'ol-debug'
        }
    ],
    
    paths: {
        "ol3-popup": "amd-popup"
    },
    
    callback: () => {
   } 
});
