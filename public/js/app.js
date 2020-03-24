var express = require("express");
var bodyParser = require("body-parser");
var fs = require('fs')
var path = require('path')
var opn = require('opn')

//Application Settings
function getConfig(v,d){ //value and default if missing config
    if (fs.existsSync('config.json')) {
        var file_contents = fs.readFileSync('config.json')
        var file_json = JSON.parse(file_contents)
        if (file_json[v]){
            return file_json[v];
        }else{
            return d ;
        }
    }else{
        return d ;
    }
}

/*
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,POST")
    next();
});


process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

app.use(express.static('public'));
 
app.get("/v1/about", function(req, res, next){
    res.end('GEOJSON Filter Splitter Tool.');
});


app.post("/v1/inspect", function(req, res, next){
	var filename = req.body.filename
    var field = req.body.keyname
    var fieldfilter = req.body.keyvalue
    var fieldlimit = req.body.limit
    var exportcombine = req.body.separate
    var fieldtest = 0
    console.log(JSON.stringify(req.body))
    res.sendStatus(200)
    //res.end()


    /*
    console.log('GeoJSON Separator. Separate GeoJSON into a single file for GeoJSON object.')
    console.log('Command Line Arguments')
    console.log('Arg 1: Enter Json PATHtoFile to read')
    console.log('Arg 2: Enter JSON Keyname to use in exported filename. e.g. Starting under features Key Name use properties.geofieldnamehere - Use 0 if not required.')
    console.log('Arg 3: Enter optional Filters E.G. value1,value2 for above JSON Keyname, Use 0 if not required. Do not search for commas.')
    console.log('Arg 4: Limit to export to first X records (0=all)')
    console.log('Arg 5: Combine all exports into single json export file. Set to 1 to Combine, 0 to Separate')
    console.log('Arg 6: Enter 1 to count number of unique entries for above JSON Key Name.')
    console.log('Example: GeoJSON_Inspect.exe countyshapes.json properties.NAME 10 1   (inspect countyshapes.json, use properties.NAME in export naming convention, limit to first 10 records and show break down of properties.NAME')
    */

    /*
    var fs = require('fs'), fieldvalue,fieldlabel, exportfile,count = 0,fieldarray = {};
    var filename = process.argv[2]
    var field = process.argv[3] || '_limited_';
    var fieldfilter = process.argv[4].split(',') || 0;
    var fieldlimit = process.argv[5] || 0;
    var exportcombine = process.argv[6] || 1;
    var fieldtest = process.argv[7] || 0;
    */
*/
    var fieldvalue,fieldlabel, exportfile,count = 0,fieldarray = {};

    function exportRoutine(){
        console.log('export routine')
        console.log(JSON.stringify(json_template))
        //Export GeoJSON Elements either All or First X number  
        if(fieldlimit > 0){
            if(count <= parseInt(fieldlimit) ){ //Export first X number
                fs.writeFileSync(exportfile,JSON.stringify(json_template))
                console.log('Creating (Limited Set) ' + exportfile)
            } 
        }else{//Export All
            fs.writeFileSync(exportfile,JSON.stringify(json_template))
            console.log('Creating (All) ' + exportfile)
        }  

    }

    function filtercheck(fieldvalue,fieldfilter){
        var searchcount = 0;
        for(var i=0;i<fieldfilter.length;i++){
            var reg = new RegExp(fieldfilter[i],'i')
            if(fieldvalue.search(reg) > -1){
                searchcount++
            }
        }
        if (searchcount > 0){ 
            return true
        }else{
            return false
        }
    }

    function combinecheck(){
        if( exportcombine) {
            return true
        }else{
            return false
        }
    }


    if(filename != null){ //Only Run if Filename given.
        var contents = JSON.parse(fs.readFileSync(filename));
        var json_template = {"type":"FeatureCollection", "features": []} //GeoJSON Standard 2016
        contents.features.forEach(element => {
            
            //Create Export Naming Convention
            if( field != 0 ){ //Check if JSON Key Provided
                try{
                    fieldvalue = eval('element.'+field);
                    fieldlabel = '_' + fieldvalue + '_'
                }catch(e){
                    console.log('JSON Key does not exist ' + field)
                    fieldlabel = '_limited_';
                } 
            }else{
                fieldlabel = '_all_';
            }

            exportfile = ++count + fieldlabel + filename //Create valid export name
            //Export Routine is Separated Files
            if(fieldfilter[0] == '0'){ //No Filter
        
                json_template.features.push(element) //Push element into blank GeoJSON Template
                if(!combinecheck()){
                    exportRoutine(); 
                    json_template = {"type":"FeatureCollection", "features": []} //reset
                };
            }else if (filtercheck(fieldvalue,fieldfilter)){ //Apply Filter

                json_template.features.push(element) //Push element into blank GeoJSON Template
                if(!combinecheck()){
                exportRoutine(); 
                json_template = {"type":"FeatureCollection", "features": []} //reset
                };
            }
            
            //Summarise Keyname 
            if(fieldtest == 1){
                try{
                    if(isNaN(fieldarray[fieldvalue])){ //If not exist set to 1
                        fieldarray[fieldvalue]= 1
                    }else{ //Else increment number
                        fieldarray[fieldvalue]= fieldarray[fieldvalue] + 1
                    }
                }catch(e){
                    console.log('JSON Key does not exist ' + field)
                }
            }
        });

        //Export Routine if Combined File
        if(combinecheck()){
            exportfile = 'combined_' + filename //Create valid export name
            exportRoutine();
        }

        //Print Keyname Summary
        console.log(JSON.stringify(fieldarray))
    }

//});

/*
//Easier Exit for non-node users. Press q to exit
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
    if (key.name === 'q') {
        process.exit();
    }
})

app.listen(getConfig('port',3035), () => {
 console.log("Application: QVD Rest API")
 console.log("Author: A Garbin")
 console.log("Server running on port " + getConfig('port',3035));
 console.log("Press 'q' to QUIT.")
});

opn('http://localhost:'+getConfig('port',3035))
*/



