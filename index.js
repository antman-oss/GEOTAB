console.log('GeoJSON Separator. Separate GeoJSON into a single file for GeoJSON object.')
console.log('Command Line Arguments')
console.log('Arg 1: Enter Json PATHtoFile to read')
console.log('Arg 2: Enter JSON Key Name to use in exported filename. e.g. Starting under features Key Name use properties.geofieldnamehere - Use 0 if not required.')
console.log('Arg 3: Limit to export to first X records (0=all)')
console.log('Arg 4: Enter 1 to count number of unique entries for above JSON Key Name.')
console.log('Example: GeoJSON_Inspect.exe countyshapes.json properties.NAME 10 1   (inspect countyshapes.json, use properties.NAME in export naming convention, limit to first 10 records and show break down of properties.NAME')

var fs = require('fs'), fieldvalue, exportfile,count = 0,fieldarray = {};
var filename = process.argv[2]
var field = process.argv[3] || '_limited_'
var fieldlimit = process.argv[4] || 0;
var fieldtest = process.argv[5] || 0;

if(filename != null){ //Only Run if Filename given.
    var contents = JSON.parse(fs.readFileSync(filename));

    contents.features.forEach(element => {
        var json_template = {"type":"FeatureCollection", "features": []} //GeoJSON Standard 2016
        json_template.features.push(element) //Push element into blank GeoJSON Template
        

        //Create Export Naming Convention
        if( field != 0 ){ //Check if JSON Key Provided
            try{
                fieldvalue = '_' + eval('element.'+field) + '_'
            }catch(e){
                console.log('JSON Key does not exist ' + field)
                fieldvalue = '_limited_';
            } 
         }else{
            fieldvalue = '_limited_';
         }
         
         exportfile = ++count + fieldvalue + filename //Create valid export name
     
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
     console.log(JSON.stringify(fieldarray))
}






