/**
 * To minimise the client app:
 * 
 *   > npm install requirejs
 *   > node_modules/requirejs/bin/r.js -o app.build.js 
 *   
 */
({  
    appDir:         "./public/",
    baseUrl:        "js",
    dir:            "public-build",
    modules:        [{name: "main"}],
    mainConfigFile: "public/js/main.js",
    preserveLicenseComments: false,
    pragmasOnSave: {
    	  excludeJade: true
    }
})
