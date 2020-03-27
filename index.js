const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const opn = require('opn-url')

//Application Settings
function getConfig(v,d){ //value and default if missing config
    if (fs.existsSync('config.json')) {
        var file_contents = fs.readFileSync(process.cwd()+'/config.json')
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


 
app.get("/v1/about", function(req, res, next){
    res.end('GEOJSON Filter Splitter Tool.');
});

var sampleArray = []
var sourceFields = function(obj){
    if (obj){ // Write
        fields = []
        for (const kv_pair of Object.entries(obj)) {
            fields.push(kv_pair[0])
        }
    }else{ // Read
        return fields
    }
}
var uploadedFile
app.post('/v1/file_upload/:sample', function(req, res, next){
    const sampleSize = req.params.sample

    new formidable.IncomingForm().parse(req, (err, fields, files) => {
        if (Object.entries(files).length == 0){
            res.sendStatus(405)
        }
        
        if (err) {
          console.error('Error', err)
          res.sendStatus(406)
          throw err
        }
        
        for (const file of Object.entries(files)) {
            try{
                uploadedFile = file[1].name
                var contents = JSON.parse(fs.readFileSync(file[1].path));
                var json_template = {"type":"FeatureCollection", "features": []} //GeoJSON Standard 2016
                sampleArray = []
                if (contents['type'] == "FeatureCollection" && contents['features'].length > 0){
                                
                    var sampleCount = 0;
                    contents.features.forEach(element => {
                        //Scan 
                        const ele_obj = {}
                        for (const kv_pair of Object.entries(element.properties)) {
                            ele_obj[kv_pair[0]] = kv_pair[1];
                        }
                        for (const kv_pair of Object.entries(element.geometry)) {
                            ele_obj[kv_pair[0]] = kv_pair[1];
                        }
                        ++sampleCount
                        sampleArray.push(ele_obj)

                    })
                    sourceFields(sampleArray[0])
                    response = {"msg": `File upload Successful. [${sampleCount} records]`,
                            "update": true,
                            "rows": sampleArray.slice(0,sampleSize)
                    }
                    res.send(response)
                }else{
                    res.sendStatus(407)
                }
            }catch(e){
                res.sendStatus(407)
            }
        }
      })
      
});


app.post("/v1/filter/:sample", function(req, res, next){
    const sampleSize = req.params.sample
    const keyname = req.body.keyname
    var keyvalue = req.body.keyvalue; keyvalue = keyvalue ? keyvalue.split(',') : null;
    const limit = req.body.limit
    const filter_export = req.body.filter_export
    const exportType = req.body.export
    const exportTab = req.body.tab
    
    function filterCheck(fieldvalue,fieldfilter){
        var searchcount = 0;
        for(var i=0;i<fieldfilter.length;i++){
            var searchType;
            if(fieldfilter[i].slice(0,1) == '*' && fieldfilter[i].slice(-1) == '*'){
                searchType = 1
            }else if(fieldfilter[i].slice(-1) == '*'){
                searchType = 2
            }else if(fieldfilter[i].slice(0,1) == '*'){
                searchType = 3
            }else{
                searchType =4
            }
            var term = fieldfilter[i].replace(/\*/g,'')
            var strLen = fieldvalue.length
            var termLen = term.length
            var search = fieldvalue.search(term)
            switch(searchType){
                case 1:
                    if(search > 0){
                        searchcount++
                    }
                break;
                case 2:
                    if(search == 0){
                        searchcount++
                    }
                break;
                case 3:
                    if(search >= 0 && search == (strLen - termLen)) {
                        searchcount++
                    }
                break;
                case 4:
                    if(search == 0 && strLen == termLen){
                        searchcount++
                    }
                break;
            }
        }
        if (searchcount > 0){ 
            return true
        }else{
            return false
        }
    }

    function exportFile(geojson_contents,exportName,exportNo){
        fs.writeFileSync(exportName,JSON.stringify(geojson_contents))
        console.log('Creating ' + exportName)
        
        if (exportNo == 1){ // Ensure we only response once
            response = {"msg": `Export Successful ${exportName}` ,
                        "update": true,
                        "rows": filterArray.slice(0,sampleSize)
                }
            res.send(response)
        }
    }

    function exportTabFile(filterArray,exportName,exportNo){
        var tabfile=''
        sourceFields().forEach(f => {
            tabfile += f + "\t" //header
        })
        tabfile += "\r\n" //end of line
        filterArray.forEach(element => {
            sourceFields().forEach(f => {
                tabfile += JSON.stringify(element[f]) + "\t" //each column
            })
            tabfile += "\r\n" //End of line
        })
        fs.writeFileSync(exportName+'.txt',tabfile)
        console.log('Creating ' + exportName+'.txt')

        if (exportNo == 1){ // Ensure we only response once
            response = {"msg": `Export Successful. First Export is ${exportName}.txt [${exportNo} files]`,
                        "update": false,
                        "rows": ''
                }
            res.send(response)
        }
    }

    var filterArray = []
    const geojson_template = {"type":"FeatureCollection", "features": []} 
    
    if(filter_export == 1){
        //Filter
        var filterCount=0
        sampleArray.forEach(item =>{
            
            if (keyname && keyvalue){ //Filter
                try{
                    var fieldvalue = eval('item.'+keyname);
                }catch(e){
                    console.log('JSON Key does not exist ' + field)
                    res.sendStatus(405)
                } 
                if (filterCheck(fieldvalue,keyvalue)){
                    filterArray.push(item)
                    ++filterCount
                }
            }else{
                filterArray = sampleArray
            }
        })
    
        response = {"msg": `Filter Successful. [${filterCount} Records]`,
                    "update": true,
                    "rows": filterArray.slice(0,sampleSize)
                }
        res.send(response) // Return only sample size
    }else{
        //Export
        var limitCount = 0;
        separateFileCount = 0
        filterArray.forEach(item =>{
            
            if (++limitCount <= limit || limit == 0){
                //Append to buffer
                var obj = {
                    "type": "Feature",
                    "geometry": {},
                    "properties":{}
                }
                const tmp_item = Object.assign({},item)
                Object.assign(obj.geometry, {'type': tmp_item.type})
                Object.assign(obj.geometry, {'coordinates': tmp_item.coordinates})
                delete tmp_item.type
                delete tmp_item.coordinates
                
                Object.assign(obj.properties, tmp_item)
                geojson_template.features.push(obj)
                
                // Separated Export - run after every object
                if (exportType){
                    if (exportTab){
                        tabArray = [item]
                        exportTabFile(tabArray,`export/limited_${limitCount}_${uploadedFile}`,++separateFileCount)
                    }else{
                        exportFile(geojson_template,`export/limited_${limitCount}_${uploadedFile}`,++separateFileCount)
                    }
                        // reset
                    geojson_template.features=[]
                    tabArray = []
                }
            }
        })

        // Combined Export - run after all object appended
        if (!exportType){
            if (exportTab){
                exportTabFile(filterArray,`export/combined_${limit}_${uploadedFile}`,1)
            }else{
                exportFile(geojson_template,`export/combined_${limit}_${uploadedFile}`,1)
            }
        }
    }       
});

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
 console.log("Application: GeoJSON Utility. Filter,Split,Flatten & Host.")
 console.log("Author: A Garbin")
 console.log("Server running on port " + getConfig('port',3035));
 console.log("Press 'q' to QUIT.")
});

app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(process.cwd()))
var dir = 'export';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

app.post("/v1/exit", function(req, res, next){
    res.sendStatus(200)
    process.exit(0);
})

if (getConfig('autoStartBrowser', true)){
    opn.open('http://localhost:'+getConfig('port',3035))
}