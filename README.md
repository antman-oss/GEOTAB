# GeoJSON_Inspect
View|Filter|Export|Host GeoJSON files

# Description:
When dealing with Large GeoJSON files it can be difficult to troubleshoot when your local text editor is unable to open such large files typically files over 60MB. Use this tool to help troubleshoot your GeoJSON files. You can export small subsets of data when working with large files to understand the attributes. You can export subsets of data based on certain filters.
You can export GeoJSON as a flattened Tab text file and you can host your exported file to make them available to other webservices.
Exported files are available as Physical: /public/exports/filename URL: host/exports/filename 

# Usage:

Build from source or download the executable from the dist folder.

The node application runs an ExpressJS web application from the source computer. By default the application will start your default browser and navigate to the web application.

Upload: The first step is to upload your GeoJSON file to the web application. Select your local file, your desired sample size and press Upload. A sample of your file will be displayed if it can read.Use geojsonlint.com to validate your file if it is not accepted.

Filter: Now that you can view the properties of the GeoJson file and the geometry you wish to search and filter by Property. Type you Keyname exactly as shown in the sample and then use comma separated search parametes in the keyvalue. Wildcards are not required. Ensure that Filter is your action option and then press Submit. The sample should now display a sample based on your filter.

Filter & Export: Using the above instruction you may filter for records and export the subset of records as a new GeoJson file. Change the action option to Filer & Export then press Submit. Exports are saved in a subfolder called 'export' under the same folder as your node application.

Filter & Export Separate Files: Using the above instructions you may want to filter for records and then export the subset of records as individual GeoJson files. Change the action option to Filer & Export Separate Files then press Submit. CAUTION: This may create an excessive amount of files. Folder location is the same 'export'.

Limit Export Count: As the option implies you can limit the number of records exported to file starting from the 1st record. Sample Size has no impact on the Limit Export Count option.

Export as Geo Tab File: GeoTab file is JSON.stringified tab delimeter (flattened) version of your GeoJson file. In some applications this may be more preferrable than using a complext structed format like GeoJson. The filename created is the same as the source GeoJSON with the extra extension of .txt



# Typical GeoJson File:

mygeojsonfile.json
{"type":"FeatureCollection","features":[
    {   
        "type":"Feature",
        "geometry":{
            "type":"Polygon",
            "coordinates":[[[.......]]]
        },
        "properties":{
            "NAME":"sydney",
            "EXTENT":"land"
        }
    },
    {   
        "type":"Feature",
        "geometry":{
            "type":"Polygon",
            "coordinates":[[[.......]]]
        },
        "properties":{
            "NAME":"brisbane",
            "EXTENT":"land"
        }
    }
  ]
}

# Conversion Tools:

## ESRI Shape Files
If you have Esri Shape Files you can easily convert these with Online or Offline Conversion tools to GeoJSON format before using with this tool. Some of the tools that I have haved used previously and that can handle larger files are mapshaper.org (online) and GDAL.org (offline).

## OGR2OGR Conversion Example
Once installed open the GDAL Command Prompt. Navigate to your PATHtoFiLE. Run a command line such as the following and replace [name] with source and destination path\filesname. I normally deal with WGS84 Datum, read through GDAL for other options.

ogr2ogr -f GeoJSON -t_srs crs:84 [name].geojson [name].shp

