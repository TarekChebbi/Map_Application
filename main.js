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
// Map
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
    layers:layerArray/*[new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 19
        })
      }),]*//* new ol.layer.Tile({
        source:new ol.source.Stamen({
            layer:'terrain'
        })
    })*/,
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
                    var result = JSON.parse(dataResult)
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


function clearDrawSource (){
    drawSource.clear()
}


  var geolocation = new ol.Geolocation({
    tracking: true,
    projection : map.getView().getProjection(),
    enableHighAccuracy: true,
  });

  geolocation.on('change:position', function() {
    myview.setCenter(geolocation.getPosition());
    addmarker(geolocation.getPosition())
  });
  var marker = new ol.Overlay({
    element: document.getElementById('currentLocation'),
    positioning: 'center-center',
  });
  map.addOverlay(marker);

  function addmarker(array){
  marker.setPosition(array);
   }

  var deviceOrientation = new ol.DeviceOrientation({
    tracking: true
  });
  deviceOrientation.on('change:heading', onChangeHeading);
  function onChangeHeading(event) {
    var heading = event.target.getHeading();
    view.setRotation(-heading);
  }

/*var scaleControl = new ol.control.ScaleLine({
    bar: true,
    text: true
});
map.addControl(scaleControl);*/


var scale_line = new ol.control.ScaleLine({
    units: 'metric',
    bar: true,
    steps: 6,
    text: true,
    minWidth: 140,
    target: 'scale_bar'
});
map.addControl(scale_line);









$("#spanLatLong").html(ol.proj.toLonLat(map.getView().getCenter())[1].toFixed(6) + ", " + ol.proj.toLonLat(map.getView().getCenter())[0].toFixed(6));
var onPointerMoveMap = function (e) {
    $("#spanLatLong").html(ol.proj.toLonLat(map.getView().getCenter())[1].toFixed(6) + ", " + ol.proj.toLonLat(map.getView().getCenter())[0].toFixed(6));
};


var continuePolygonMsg = 'Click to continue polygon, Double click to complete';
var continueLineMsg = 'Click to continue line, Double click to complete';

var draw;

var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33',
            }),
        }),
    }),
});

map.addLayer(vector);

function addInteraction(intType) {

    draw = new ol.interaction.Draw({
        source: source,
        type: intType,
        style: interactionStyle
    });
    map.addInteraction(draw);

    createMeasureTooltip();
    createHelpTooltip();

    var sketch;
    var pointerMoveHandler = function (evt) {
        if (evt.dragging) {
            return;
        }
        var helpMsg = 'Click to start drawing';
        if (sketch) {
            var geom = sketch.getGeometry();

        }
    };

    map.on('pointermove', pointerMoveHandler);

    draw.on('drawstart', function (evt) {
        sketch = evt.feature;
        var tooltipCoord = evt.coordinate;
        sketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });

    draw.on('drawend', function () {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip();
    });
}

var helpTooltipElement;
var helpTooltip;

function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'ol-tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
    });
    map.addOverlay(helpTooltip);
}

var measureTooltipElement;
var measureTooltip;

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
    });
    map.addOverlay(measureTooltip);
}

var formatLength = function (line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
};

var formatArea = function (polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
};


$(function () {
    map.on('pointerdrag', onPointerMoveMap);
   $("#btnMeasureLength").click(function () {
    $("#btnMeasureLength").toggleClass("clicked");
    if ($("#btnMeasureLength").hasClass("clicked")) {
        map.removeInteraction(draw);
        addInteraction('LineString');
    } else {
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
    }
    });
});



var lengthButton = document.createElement('button');
lengthButton.innerHTML = '<img src="pngegg.png" alt="" style="width:17px;height:17px;filter:brightness(0) invert(1);vertical-align:middle"></img>';
lengthButton.className = 'myButton';
lengthButton.id = 'lengthButton';

var lengthElement = document.createElement('div');
lengthElement.className = 'lengthButtonDiv';
lengthElement.appendChild(lengthButton);

var lengthControl = new ol.control.Control({
    element: lengthElement
})

var lengthFlag = false;
lengthButton.addEventListener("click", () => {
    // disableOtherInteraction('lengthButton');
    lengthButton.classList.toggle('clicked');
    lengthFlag = !lengthFlag;
    document.getElementById("map").style.cursor = "default";
    if (lengthFlag) {
        map.removeInteraction(draw);
        addInteraction('LineString');
    } else {
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
    }

})

map.addControl(lengthControl);

var areaButton = document.createElement('button');
areaButton.innerHTML = '<img src="pngegg.png" alt="" style="width:17px;height:17px;filter:brightness(0) invert(1);vertical-align:middle"></img>';
areaButton.className = 'myButton';
areaButton.id = 'areaButton';


var areaElement = document.createElement('div');
areaElement.className = 'areaButtonDiv';
areaElement.appendChild(areaButton);

var areaControl = new ol.control.Control({
    element: areaElement
})

var areaFlag = false;
areaButton.addEventListener("click", () => {
    areaButton.classList.toggle('clicked');
    areaFlag = !areaFlag;
    document.getElementById("map").style.cursor = "default";
    if (areaFlag) {
        map.removeInteraction(draw);
        addInteraction('Polygon');
    } else {
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
        while (elements.length > 0) elements[0].remove();
    }
})

map.addControl(areaControl);

/**
 * 
 * @type {string}
 */
var continuePolygonMsg = 'Click to continue polygon, Double click to complete';

/**
 * 
 * @type {string}
 */
var continueLineMsg = 'Click to continue line, Double click to complete';

var draw; 

var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33',
            }),
        }),
    }),
});

map.addLayer(vector);

function addInteraction(intType) {

    draw = new ol.interaction.Draw({
        source: source,
        type: intType,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(200, 200, 200, 0.6)',
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2,
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)',
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
            }),
        }),
    });
    map.addInteraction(draw);

    createMeasureTooltip();
    createHelpTooltip();

    /**
     * 
     * @type {import("../src/ol/Feature.js").default}
     */
    var sketch;

    /**
     * 
     * @param {import("../src/ol/MapBrowserEvent").default} evt The event.
     */
    var pointerMoveHandler = function (evt) {
        if (evt.dragging) {
            return;
        }
        /** @type {string} */
        var helpMsg = 'Click to start drawing';

        if (sketch) {
            var geom = sketch.getGeometry();
        }

    
    };

    map.on('pointermove', pointerMoveHandler);

    draw.on('drawstart', function (evt) {
        sketch = evt.feature;

        /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
        var tooltipCoord = evt.coordinate;

        sketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });

    draw.on('drawend', function () {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip();
    });
}


/**
 * 
 * @type {HTMLElement}
 */
var helpTooltipElement;

/**
 * 
 * @type {Overlay}
 */
var helpTooltip;

/**
 * 
 */
function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'ol-tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
    });
    map.addOverlay(helpTooltip);
}


// });

/**
* 
* @type {HTMLElement}
*/
var measureTooltipElement;


/**
*
* @type {Overlay}
*/
var measureTooltip;

/**
 * 
 */

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
    });
    map.addOverlay(measureTooltip);
}





/**
 *
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function (line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
};

/**
 * 
 * @param {Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
var formatArea = function (polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
};






var zoom_ex = new ol.control.ZoomToExtent({
    extent: [
        
        65.90, 7.48,
        98.96, 40.30
    ]
});
map.addControl(zoom_ex);


var mouse_position = new ol.control.MousePosition();
map.addControl(mouse_position);
var slider = new ol.control.ZoomSlider();
map.addControl(slider);








const scaleBarOptionsContainer = document.getElementById('scaleBarOptions');
const unitsSelect = document.getElementById('units');
const typeSelect = document.getElementById('type');
const stepsRange = document.getElementById('steps');
const scaleTextCheckbox = document.getElementById('showScaleText');
const invertColorsCheckbox = document.getElementById('invertColors');

let control;
