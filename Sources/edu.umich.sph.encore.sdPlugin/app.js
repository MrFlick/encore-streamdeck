/* global $CC, Utils, $SD */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    // Subscribe to the willAppear and other events
    $SD.on('edu.umich.sph.encore.status.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('edu.umich.sph.encore.status.action.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('edu.umich.sph.encore.status.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
    $SD.on('edu.umich.sph.encore.status.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('edu.umich.sph.encore.status.action.propertyInspectorDidAppear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
    });
    $SD.on('edu.umich.sph.encore.status.action.propertyInspectorDidDisappear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
    });
};

// ACTIONS

const action = {
    settings:{},
    onDidReceiveSettings: function(jsn) {
        console.log('%c%s', 'color: white; background: red; font-size: 15px;', '[app.js]onDidReceiveSettings:');

        this.settings = Utils.getProp(jsn, 'payload.settings', {});
        this.doSomeThing(this.settings, 'onDidReceiveSettings', 'orange');
        this.refreshData(jsn);
    },


    onWillAppear: function (jsn) {
        console.log("You can cache your settings in 'onWillAppear'", jsn.payload.settings);
        this.settings = jsn.payload.settings;

        this.setTitle(jsn, "");

        if (!this.settings || Object.keys(this.settings).length === 0) {
            this.settings.apitoken = '';
        }
    },

    onKeyUp: function (jsn) {
        this.doSomeThing(jsn, 'onKeyUp', 'green');
        this.refreshData(jsn);
    },

    onSendToPlugin: function (jsn) {
        const sdpi_collection = Utils.getProp(jsn, 'payload.sdpi_collection', {});
        if (sdpi_collection.value && sdpi_collection.value !== undefined) {
            this.doSomeThing({ [sdpi_collection.key] : sdpi_collection.value }, 'onSendToPlugin', 'fuchsia');            
        }
    },

    refreshData: function(jsn) {
        let url = "https://encore.sph.umich.edu/api/jobs/counts?by=status";
        let headers = {
            "Authorization": "Bearer " + this.settings.apitoken
        };
        fetch(url, {headers: headers})
          .then(resp => {if(!resp.ok) throw(reps); else return(resp)})
          .then(resp => resp.json())
          .then((data) => {
            let counts = {queued: 0, started: 0};
            data.data.forEach(count => {
                if (count.status == "started") {
                    counts.started = count.count
                }
                if (count.status == "queued") {
                    counts.queued = count.count
                }
            });
            this.setStatusDisplay(jsn, counts);
            })
          .catch(resp => {
              this.showAlert(jsn);
          })
    },



    saveSettings: function (jsn, sdpi_collection) {
        console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                console.log('setSettings....', this.settings);
                $SD.api.setSettings(jsn.context, this.settings);
            }
        }
    },


    setTitle: function(jsn, title) {
        $SD.api.setTitle(jsn.context, title);
    },
    showAlert: function(jsn) {
        $SD.api.showAlert(jsn.context);
    },


    doSomeThing: function(inJsonData, caller, tagColor) {
        console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]doSomeThing from: ${caller}`);
        console.log(inJsonData);
    },

    setStatusDisplay: function(jsn, status) {
        var canvas = document.createElement("canvas");
        canvas.width = 144;
        canvas.height = 144;
        var ctx = canvas.getContext('2d');
        base_image = new Image();
        base_image.src = 'action/images/action@2x.png';
        base_image.onload = function(){
          ctx.drawImage(base_image, 0, 0);
          var imgdata = ctx.getImageData(0, 0, 144, 72) 
          var pixels = imgdata.data;
          for(var i=0; i<pixels.length; i+=4) {
              pixels[i] = 62;
              pixels[i+1] = 181;
              pixels[i+2] = 149;
          }
          ctx.putImageData(imgdata, 0,0)
          var imgdata = ctx.getImageData(0, 73, 144, 144) 
          var pixels = imgdata.data;
          for(var i=0; i<pixels.length; i+=4) {
              pixels[i] = 201;
              pixels[i+1] = 201;
              pixels[i+2] = 201;
          }
          ctx.putImageData(imgdata, 0, 73)
          ctx.textAlign = "center";
          ctx.font = "bold 40px Impact";
          ctx.fillStyle = "#eeeeee";
          ctx.shadowColor = "#333333";
          ctx.shadowBlur = 7;
          ctx.fillText(status.started, 72, 58);
          ctx.fillText(status.queued, 72, 112);
          $SD.api.setImage(jsn.context, canvas.toDataURL("image/png"));
        }
    }
};