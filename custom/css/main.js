var draw
var flagIsDrawingOn = false
var PointType = ['Arbre', 'Rochers', 'Algue','Autre'];
var LineType = ['Route', 'Fleuve', 'Rive','Autre'];
var PolygonType = ['îles', 'Eaux', 'Montagne', 'Marais','Autre'];
var selectedGeomType
var map, geojson, featureOverlay, overlays, style;
var selected, features, layer_name, layerControl;
var content;
var selectedFeature;
var popup = new ol.Overlay.Popup ({
    popupClass: "default anim", 
    closeBox: true,
    onclose: function(){ console.log("You close the box"); },
    positioning: 'auto',
    autoPan: true,
    autoPanAnimation: { duration: 100 }
  });

 /**
       * 
       */
      window.app = {};
      var app = window.app;


      //
      // 
      //


      /**
       * @constructor
       * @extends {ol.control.Control}
       * @param {Object=} opt_options Control options.
       */
      app.DrawingApp = function(opt_options) {

        var options = opt_options || {};

        var button = document.createElement('button');
        button.id = 'drawbtn'
        button.innerHTML = '<i class="fas fa-pencil-ruler"></i>';

        var this_ = this;
        var startStopApp = function() {
            if (flagIsDrawingOn == false){
       $('#startdrawModal').modal('show')
       
            } else {
                map.removeInteraction(draw)
                flagIsDrawingOn = false
                document.getElementById('drawbtn').innerHTML = '<i class="fas fa-pencil-ruler"></i>'
                defineTypeofFeature()
                $("#enterInformationModal").modal('show')

            }
        };

        button.addEventListener('click', startStopApp, false);
        button.addEventListener('touchstart', startStopApp, false);

        var element = document.createElement('div');
        element.className = 'draw-app ol-unselectable ol-control';
        element.appendChild(button);

        ol.control.Control.call(this, {
          element: element,
          target: options.target
        });

      };
      ol.inherits(app.DrawingApp, ol.control.Control);


      //
      // 
      //








var myview = new ol.View({
    center : [1047107.9196110901, 4227277.561036036],
    zoom:7
})

var baseLayer = new ol.layer.Tile({
    source : new ol.source.OSM({
        attributions:'Surveyor Application'
    })
})
var drawSource = new ol.source.Vector()
var drawLayer = new ol.layer.Vector({
    source : drawSource
})
var layerArray = [baseLayer,drawLayer]
var base_maps = new ol.layer.Group({
    'title': 'Map Layers',
    layers: [
        new ol.layer.Tile({
            title: 'Satellite',
            type: 'base',
            visible: false,
            source: new ol.source.XYZ({
                attributions: ['Powered by Esri',
                    'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
                ],
                attributionsCollapsible: false,
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                maxZoom: 23
            })
        }),
        new ol.layer.Tile({
            title: 'Terrain',
            type: 'base',
            visible: false,
            source: new ol.source.Stamen({
                layer:'terrain'
            })
        })


    ]
});
var map = new ol.Map({
    controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }).extend([
        new app.DrawingApp()
      ]),
    target : 'mymap',
    view: myview,
    layers:layerArray,
    overlays: [popup]
})
map.addLayer(base_maps);

layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: true,
    tipLabel: 'Layers', 
    groupSelectStyle: 'children', 
    collapseTipLabel: 'Collapse layers',
});
map.addControl(layerSwitcher);

layerSwitcher.renderPanel();
function startDraw(geomType){
    selectedGeomType = geomType
    draw = new ol.interaction.Draw({
        type:geomType,
        source:drawSource
    })
    $('#startdrawModal').modal('hide')
   
    map.addInteraction(draw)
    flagIsDrawingOn = true
    document.getElementById('drawbtn').innerHTML = '<i class="far fa-stop-circle"></i>'
}


function defineTypeofFeature(){
    var dropdownoftype = document.getElementById('typeofFeatures')
    dropdownoftype.innerHTML = ''
    if (selectedGeomType == 'Point'){
        for (i=0;i<PointType.length;i++){
            var op = document.createElement('option')
            op.value = PointType[i]
            op.innerHTML = PointType[i]
            dropdownoftype.appendChild(op)
        }
    } else if (selectedGeomType == 'LineString'){
        for (i=0;i<LineType.length;i++){
            var op = document.createElement('option')
            op.value = LineType[i]
            op.innerHTML = LineType[i]
            dropdownoftype.appendChild(op)
        }
    }else{
        for (i=0;i<PolygonType.length;i++){
            var op = document.createElement('option')
            op.value = PolygonType[i]
            op.innerHTML = PolygonType[i]
            dropdownoftype.appendChild(op)
        }
    }
}
function clearDrawSource (){
    drawSource.clear()
}

function savetodb(){
    var featureArray = drawSource.getFeatures()
    var geogJONSformat = new ol.format.GeoJSON()
    var featuresGeojson = geogJONSformat.writeFeaturesObject(featureArray)
    var geojsonFeatureArray = featuresGeojson.features

   
    for (i=0;i<geojsonFeatureArray.length;i++){
        var type = document.getElementById('typeofFeatures').value
        var name = document.getElementById('exampleInputtext1').value
        var geom = JSON.stringify(geojsonFeatureArray[i].geometry)
        if (type != ''){
            $.ajax({
                url:'save.php',
                type:'POST',
                data :{
                    typeofgeom : type,
                    nameofgeom : name,
                    stringofgeom : geom
                },
                success : function(dataResult){
                    var result = parse(dataResult)
                    if (result.statusCode == 200){
                        console.log('data added successfully')
                    } else {
                        console.log('data not added successfully')
                    }

                }
            })
        } else {
            alert('please select type')
        }
    }

}