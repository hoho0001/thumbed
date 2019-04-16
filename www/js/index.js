'use strict'

let app = {
  permissions: null,
  canvas: null,
  init: function () {
    if (window.hasOwnProperty("cordova")) {
      console.log("You're on a mobile device");
    }
    let isReady = (window.hasOwnProperty("cordova")) ? 'deviceready' : 'DOMContentLoaded';
    document.addEventListener(isReady, () => {
      console.log("ready");
      app.permissions = cordova.plugins.permissions;
      
      app.permissions.requestPermission("android.permission.READ_EXTERNAL_STORAGE", function (status) {
        console.log('success requesting READ_EXTERNAL_STORAGE permission');
    }, function (err) {
        console.log('failed to set permission');
    });
    app.permissions.requestPermission("android.permission.READ_MEDIA_IMAGES", function (status) {
      console.log('success requesting READ_MEDIA_IMAGES permission');
  }, function (err) {
      console.log('failed to set permission');
  });
    })
    document.getElementById('btnTake').addEventListener('click', app.takeVideo);
          
    player.addEventListener('canplaythrough', app.captureImages);
          
    player.addEventListener('load', (ev)=>{
              //video has loaded entirely
              console.log('video loaded');
    });
          
    player.addEventListener('error', (err) => console.log('Failed to load video', err.message) );
  },
  
  takeVideo: function () {
    console.log(`Take video`)
    let opts = {
      limit: 1,
      duration: 10,
      quality: 1
    };
    //limit is ignored for iOS
    //duration is in seconds
    //quality is ignored for iOS. 1 means high quality. 0 means low quality
    navigator.device.capture.captureVideo(app.ftw, app.wtf, opts);

  },
  ftw: function (mediaFiles) {
    let path, len;
    console.log(`record successfully`)
    for (let i = 0, len = mediaFiles.length; i < len; i++) {
      path = mediaFiles[i].fullPath;
      document.getElementById('player').src = path;
    }
  },
  wtf: function (msg) {
    document.getElementById('msg').textContent = msg;
  },
  
  captureImages:  function(){
    let player = document.getElementById('player')
    app.canvas = document.createElement('canvas');
    let ctx = app.canvas.getContext('2d');
    app.canvas.width = player.videoWidth;
    app.canvas.height = player.videoHeight;

    let milestone = (player.duration-1)/4;
    console.log(milestone);
    player.currentTime = 0.001;
    player.removeEventListener('canplaythrough', app.captureImages);

     setTimeout( function(){
      ctx.drawImage(player,0,0,player.videoWidth, player.videoHeight, 0, 0, app.canvas.width/2, app.canvas.height/2);
      player.currentTime += milestone;
    
       setTimeout(  function(){
        ctx.drawImage(player,0,0,player.videoWidth, player.videoHeight, app.canvas.width/2, 0, app.canvas.width/2, app.canvas.height/2);
        player.currentTime += milestone;
   
         setTimeout(  function(){
          ctx.drawImage(player,0,0,player.videoWidth, player.videoHeight, 0, app.canvas.height/2, app.canvas.width/2, app.canvas.height/2);
          player.currentTime += milestone;

           setTimeout( function(){
             ctx.drawImage(player,0,0,player.videoWidth, player.videoHeight, app.canvas.width/2, app.canvas.height/2, app.canvas.width/2, app.canvas.height/2);
             //draw from canvas
             app.makeBlob();
          }, 500);
        }, 500);
      }, 500);
    }, 500);
    
  
  },
  makeBlob: function(){
    let player = document.getElementById('player');
    player.currentTime = 0;
    let blob = app.canvas.toBlob((blob) => {
      let player = document.getElementById('player');
      let uri = window.URL.createObjectURL(blob);
      player.poster = uri;
      // document.getElementById('image').src = uri;
      console.log(uri);
      
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

        console.log('file system open: ' + fs.name);
        fs.root.getFile("newPersistentFile.png", 
        { create: true, exclusive: false }, 
        function (fileEntry) {

            console.log("fileEntry is file?" + fileEntry.isFile.toString());
            app.writeFile(fileEntry, blob);

        }, app.error);
    
      }, app.error);

  }, 'image/png'); //create binary png from canvas contents
  
  },
  error: function(err){
    console.log(err);
  },
  writeFile: function(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            let player = document.getElementById('player');
            player.poster = fileEntry.toInternalURL();
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'image/png' });
            console.log("BLOD empty");
        }
          fileWriter.write(dataObj);
        
    });
  }
};
app.init();