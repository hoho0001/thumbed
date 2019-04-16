import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MediaCapture, MediaFile, CaptureError, CaptureVideoOptions } from '@ionic-native/media-capture';
import { Storage } from '@ionic/storage';
import { Media, MediaObject } from '@ionic-native/media';
import { File } from '@ionic-native/file';

const MEDIA_FILES_KEY = 'mediaFiles';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  mediaFiles = [];
  @ViewChild('myvideo') myVideo: any;
  
  constructor(public navCtrl: NavController, private mediaCapture: MediaCapture, private storage: Storage, private file: File, private media: Media) {}

  ionViewDidLoad() {
    this.storage.get(MEDIA_FILES_KEY).then(res => {
      this.mediaFiles = JSON.parse(res) || [];
    })
  }

  

  captureVideo() {
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 30
    }
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      let capturedFile = res[0];
      let fileName = capturedFile.name;
      let dir = capturedFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');      
      var toDirectory = this.file.dataDirectory;
      
      this.file.copyFile(fromDirectory , fileName , toDirectory , fileName).then((res) => {
        this.storeMediaFiles([{name: fileName, size: capturedFile.size}]);
      },err => {
        console.log('err: ', err);
      });
          },
    (err: CaptureError) => console.error(err));
  }

  play(myFile) {
    if (myFile.name.indexOf('.wav') > -1) {
      const audioFile: MediaObject = this.media.create(myFile.localURL);
      audioFile.play();
    } else {
      let path = this.file.dataDirectory + myFile.name;
      let url = path.replace(/^file:\/\//, '');
      let video = this.myVideo.nativeElement;
      video.src = url;
      video.play();
    }
  }

  
}



//COPY FILE
   var wwwDirEntry;

   //resolve url for directory entry for putting in copied file
   window.resolveLocalFileSystemURL(cordova.file.dataDirectory+'phonegapdevapp/www/', function success(dirEntry) {
       wwwDirEntry = dirEntry;
   });

   //resolve file URL to file entry to enable copying
   //
   //Desired URL: file:///data/user/0/com.adobe.phonegap.app/files/phonegapdevapp/www/my_awesome_file.doc
   //BASE URL: cordova.file.dataDirectory / file:///data/user/0/com.adobe.phonegap.app/files/
   //
   //alert(JSON.stringify(cordova.file.dataDirectory));
   //
   window.resolveLocalFileSystemURL(cordova.file.dataDirectory+'phonegapdevapp/www/my_awesome_file.doc',
      function onSuccess(fileEntry)
      {
          //alert(JSON.stringify(fileEntry));
          fileEntry.copyTo(wwwDirEntry, 'a_copy_of_my_awesome_file.doc',
          function()
          {
              alert('copying was successful');
          },
          function()
          {
              alert('copying FAILED');
          });
     }, function (e) { alert(JSON.stringify(e)); });