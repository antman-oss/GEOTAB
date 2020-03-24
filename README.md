# GeoJSON_Inspect
View|Filter|Export|Host GeoJSON files

# Description:
When dealing with Large GeoJSON files it can be difficult to troubleshoot when your local text editor is unable to open such large files typically files over 60MB. Use this tool to help troubleshoot your GeoJSON files. You can export small subsets of data when working with large files to understand the attributes. You can export subsets of data based on certain filters.
You can export GeoJSON as a flattened Tab text file and you can host your exported file to make them available to other webservices.
Exported files are available as Physical: /public/exports/filename URL: host/exports/filename 

# Usage:
The following paragraph will walk through typical usage of the tool.

Build from source or download the executable from the dist folder.

The node application runs an ExpressJS web application from the source computer. By default.


When you want to know what is in your GeoJSON file you can just grab the first x number of object and export to separate files.

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

> GeoJSON_Inspect.exe mygeojsonfile.json 0 1
Result: First geo object is extracted and saved as e.g. 1_mygeojsonfile.json
This file will most likely be small and you will be able to interrogate the file with a text editor.

>GeoJSON_Inspect.exe mygeojsonfile.json properties.NAME 0
Result: Every geo object is extracted and saved with using value from object Key called properties.SHAPENAME e.g. 1_sydney_mygeojsonfile.json
2_brisbane_mygeojsonfile.json
This is helpful to find a particular geo object by using a geojson Key Value in the filename.

>GeoJSON_Inspect.exe mygeojsonfile.json properties.EXTENT 1 1
Result: First geo object is extracted and saved as e.g. 
1_land_mygeojsonfile.json 
["land":2] - console displays number entries per value.
The Key properties.EXTENT in analysed and duplicate values are printed to the console. This is a common issue in GIS where you need to ensure that your object primary key is actually unique.

# Conversion Tools:

## ESRI Shape Files
If you have Esri Shape Files you can easily convert these with Online or Offline Conversion tools to GeoJSON format before using with this tool. Some of the tools that I have haved used previously and that can handle larger files are mapshaper.org (online) and GDAL.org (offline).

## OGR2OGR Conversion Example
Once installed open the GDAL Command Prompt. Navigate to your PATHtoFiLE. Run a command line such as the following and replace [name] with source and destination path\filesname. I normally deal with WGS84 Datum, read through GDAL for other options.

ogr2ogr -f GeoJSON -t_srs crs:84 [name].geojson [name].shp

