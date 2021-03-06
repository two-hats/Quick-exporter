﻿/*
 * Quick-exporter.jsx V1.3
 *
 * Copyright (c) 2015 Yasutsugu Sasaki
 * http://2-hats.hateblo.jp
 *
 * Released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 *
 * If you want to modify this code in ExtendScript Toolkit,
 * please comment out the "#targetengine quickexporter" line and
 * the "var palette = Window.find..." line.
 * Then uncomment the "var palette = null" line.
 * This is because ExtendScript Toolkit can't create 
 * any javascript engines except for "main".
 */

#target illustrator
#targetengine quickexporter

$.localize = true;
$.locale = null;

var palette = Window.find("palette","Quick exporter");
/* var palette = null; */
if(!palette){
  var initFileObj = new File($.fileName.match(/(.*)(?:\.([^.]+$))/)[1] + "-init.xml");
  var defaultXml = <init><left/><top/><extension>PNG24</extension><dpi>@2x / xhdpi</dpi><x1>false</x1><x2>false</x2><x3>false</x3><mdpi>false</mdpi><hdpi>false</hdpi><xhdpi>false</xhdpi><xxhdpi>false</xxhdpi><xxxhdpi>false</xxxhdpi><naming>auto</naming><prefix>image-</prefix><digits>3</digits><destination></destination><chkObjName>false</chkObjName><chkImageArea>false</chkImageArea><chkImageList>false</chkImageList></init>;
  var xml = null;
  var destination = Folder.desktop;
  var destinationPath = destination.fullName;

  function save(){
    if(initFileObj.open("w")){
      initFileObj.write(xml.toXMLString());
      initFileObj.close();
    }
  }

  function selfTalk(func, args, cb){
    var bt = new BridgeTalk();
    bt.target = BridgeTalk.appName;
    args = (args !== undefined) ? args.toSource().toString().slice(1, -1) : "";
    bt.body = func.toSource()+"("+ args +");";
    bt.onResult = function(res){
      if(cb !== undefined) cb(res.body);
    };
    bt.send();
  };

  function convertIntoString(item){
    var row = item.name + ',';
    row += item.extension + ',';
    switch(item.dpi){
      case "mdpi":
        row += '=HYPERLINK("drawable-mdpi/' + item.name + '"),';
        break;
      case "hdpi":
        row += '=HYPERLINK("drawable-hdpi/' + item.name + '"),';
        break;
      case "xhdpi":
        row += '=HYPERLINK("drawable-xhdpi/' + item.name + '"),';
        break;
      case "xxhdpi":
        row += '=HYPERLINK("drawable-xxhdpi/' + item.name + '"),';
        break;
      case "xxxhdpi":
        row += '=HYPERLINK("drawable-xxxhdpi/' + item.name + '"),';
        break;
      default:
        row += '=HYPERLINK("' + item.name + '"),';
        break;
    }
    row += item.dpi + ',';
    row += item.w + ',';
    row += item.h + ',';
    return row;
  }

  function exportCSV(list, folderPath){
    var now = new Date();
    var today = localize ({ en: "%2/%3/%1", ja: "%1/%2/%3"}, now.getFullYear(), now.getMonth() + 1, now.getDate());
    var fileObj = new File(folderPath + "list.csv");
    fileObj.encoding = "UTF-8";
    
    var flag = fileObj.open("e");
    var offset = 0;
    if(flag){
      if(!fileObj.length){
        fileObj.writeln(localize({ en: "\uFEFFNo.,Name,Type,Image,dpi,Width(px),Height(px),Date created", ja: "\uFEFFNo.,ファイル名,拡張子,画像,dpi,幅(px),高さ(px),作成日"}));
      } else {
        while(!fileObj.eof){
          fileObj.readln();
          offset++;
        }
        offset--;
      }
      fileObj.seek(0,2);
      for(var i = 0, il = list.length; i < il; i++){
        fileObj.writeln((i + 1 + offset) + "," + convertIntoString(list[i]) + today);
      }
      fileObj.close();
    } else {
      alert({en: "It couldn't make a list file.", ja: "ファイルを作成できませんでした。"});
    }
  }
  
  palette = new Window("palette", "Quick exporter");
  var pnlMain = palette.add("group { orientation: 'column', alignment :'left', alignChildren :'right'}");
  var grExtension = pnlMain.add("group");
  var rbtnPNG24 = grExtension.add("radiobutton", undefined, "PNG24");
  var rbtnPNG8 = grExtension.add("radiobutton", undefined, "PNG8");
  var rbtnGIF = grExtension.add("radiobutton", undefined, "GIF");
  var rbtnJPEG = grExtension.add("radiobutton", undefined, "JPEG");
  var rbtnSVG = grExtension.add("radiobutton", undefined, "SVG");
  var grBtn = pnlMain.add("group {spacing: 30}");
  var btnExport = grBtn.add("button", undefined, {en: "Export", ja: "書き出し"});
  btnExport.minimumSize = [200,0];
  var btnOption = grBtn.add("iconbutton", undefined, new File ((new File($.fileName)).path + "/img/down.png"), {style: "toolbutton", toggle: true});
  
  var pnlOption = palette.add("group { orientation: 'column', alignment :'fill', alignChildren :'left'}");
  pnlOption.add("panel {alignment :'fill'}");
  var grDpi = pnlOption.add("group");
  var dpi = grDpi.add("dropdownlist");
  dpi.title = {en: "Base resolution :", ja:"ベース解像度 :"};
  dpi.add("item","@1x / mdpi");
  dpi.add("item","hdpi");
  dpi.add("item","@2x / xhdpi");
  dpi.add("item","@3x / xxhdpi");
  dpi.add("item","xxxhdpi");
  
  var griOS = pnlOption.add("group { alignment: 'left' }");
  var txiOS = griOS.add("statictext", undefined, "iOS:");
  txiOS.minimumSize = [57, 0];
  var x1 = griOS.add("checkbox", undefined, "@1x");
  x1.minimumSize = [60, 0];
  var x2 = griOS.add("checkbox", undefined, "@2x");
  x2.minimumSize = [53, 0];
  var x3 = griOS.add("checkbox", undefined, "@3x");
  var grAndroid1 = pnlOption.add("group { alignment: 'left' }");
  grAndroid1.margins = [0,0,0,-7];
  var txAnd1 = grAndroid1.add("statictext", undefined, "Android:");
  txAnd1.minimumSize = [57, 0];
  var mdpi = grAndroid1.add("checkbox", undefined, "mdpi");
  mdpi.minimumSize = [60, 0];
  var hdpi = grAndroid1.add("checkbox", undefined, "hdpi");
  hdpi.minimumSize = [53, 0];
  var xhdpi = grAndroid1.add("checkbox", undefined, "xhdpi");
  var grAndroid2= pnlOption.add("group { alignment: 'left' }");
  var txAnd2 = grAndroid2.add("statictext", undefined, " ");
  txAnd2.minimumSize = [57, 0];
  var xxhdpi = grAndroid2.add("checkbox", undefined, "xxhdpi");
  xxhdpi.minimumSize = [60, 0];
  var xxxhdpi = grAndroid2.add("checkbox", undefined, "xxxhdpi");
  pnlOption.add("panel {alignment :'fill'}");

  var grNaming = pnlOption.add("group");
  var grRadio = grNaming.add("group { orientation: 'column'}");
  var rbtnAuto = grRadio.add("radiobutton", undefined, "");
  rbtnAuto.value = true;
  var rbtnManual = grRadio.add("radiobutton", undefined, "");
  var grDetail = grNaming.add("group { orientation: 'column', alignChildren :'left'}");
  grDetail.margins = [-8,-8,0,0];
  var grAutoDetails = grDetail.add("group");
  grAutoDetails.add("statictext",undefined, "Prefix:");
  var edPrefix = grAutoDetails.add("edittext", undefined);
  edPrefix.minimumSize = [80, 0];
  var digits = grAutoDetails.add("dropdownlist");
  digits.text = {en: "+", ja:"+ 連番:"};
  digits.add("item",{en: "1 digit", ja: "1桁"});
  digits.add("item",{en: "2 digits", ja: "2桁"});
  digits.add("item",{en: "3 digits", ja: "3桁"});
  digits.add("item",{en: "4 digits", ja: "4桁"});
  digits.add("item",{en: "5 digits", ja: "5桁"});
  digits.selection = digits.items[2];
  grDetail.add("statictext", undefined, {en: "Give each image a name.", ja:"名前をつけて書き出し"});

  pnlOption.add("panel {alignment :'fill'}");
  var chkObjName = pnlOption.add("checkbox", undefined, {en: "Give names from object names.", ja:"オブジェクト名を優先して命名する"});
  var chkImageArea = pnlOption.add("checkbox", undefined, {en: "Draw a rect indicating each image area.", ja:"画像領域を表す四角形パスを描く"});
  var chkImageList = pnlOption.add("checkbox", undefined, {en: "Export an image list.", ja:"画像リストを書き出し"});
  var grDestination = pnlOption.add("group { orientation: 'column', alignChildren :'left'}");
  var grDstTitle = grDestination.add("group { margins: [0,0,0,-7]}");
  grDstTitle.add("statictext", undefined, {en: "Destination:", ja:"保存先:"});
  var btnBrowse = grDstTitle.add("button", undefined, {en: "Browse", ja:"参照"});
  var edDestination = grDestination.add("edittext", undefined);
  edDestination.minimumSize = [250, 0];
  var btnReset = pnlOption.add("button", undefined, {en: "Reset", ja:"リセット"});
  
  palette.onShow = function(){
    if(initFileObj.exists){
      if(initFileObj.open("r")){
        xml = new XML(initFileObj.read());
        initFileObj.close();
      }
    } else {
      xml = defaultXml.copy();
    }
  
    if(xml.left != "" && xml.top != ""){
      this.frameLocation = [parseInt(xml.left), parseInt(xml.top)];
    }
    refresh();
    closePnlOption();
  };

  palette.onMove = function(){
    xml.left = this.frameLocation[0];
    xml.top = this.frameLocation[1];
    save();
  };
  
  btnExport.onClick = function(){
    var extension = null;
    for(var i = 0, il = grExtension.children.length; i < il; i++){
      if(grExtension.children[i].value) {
        extension = grExtension.children[i].text;
      }
    }
    selfTalk(function(extension, dpi, x1, x2, x3, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi, naming, prefix, digits, dstPath, chkObjName, chkImageArea, chkImageList){
      $.localize = true;
      $.locale = null;
      app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
      dstPath = dstPath.replace(/(\u)([0-9A-F]{4})/g, function(match,p1,p2){
        return String.fromCharCode(parseInt(p2, 16));
      });
      var destination = new Folder(dstPath);
      var folderPath = destination + "/Images/";
      var folderiOSPath = destination + "/Images-iOS/";
      var folderMdpiPath = destination + "/Images-Android/drawable-mdpi/";
      var folderHdpiPath = destination + "/Images-Android/drawable-hdpi/";
      var folderXhdpiPath = destination + "/Images-Android/drawable-xhdpi/";
      var folderXxhdpiPath = destination + "/Images-Android/drawable-xxhdpi/";
      var folderXxxhdpiPath = destination + "/Images-Android/drawable-xxxhdpi/";
      
      var zeroPadding = "";
      for(var i = digits; i > 0; i--){
        zeroPadding += "0";
      }
      
      var info = {
        normal: [],
        iOS: [],
        android: []
      };
    
      var dp = DocumentPreset;
      dp.colorMode = DocumentColorSpace.RGB;
      dp.width = 2000;
      dp.height = 2000;
      dp.previewMode = DocumentPreviewMode.PixelPreview;
      dp.rasterResolution = DocumentRasterResolution.ScreenResolution;
      dp.units = RulerUnits.Pixels;
      
      var options = null;
      var exportType = null;

      var optionsPNG24 = new ExportOptionsPNG24();
      optionsPNG24.artBoardClipping = true;
      
      var optionsPNG8 = new ExportOptionsPNG8();
      optionsPNG8.artBoardClipping = true;
      optionsPNG8.colorCount = 256;
      
      var optionsGIF = new ExportOptionsGIF();
      optionsGIF.artBoardClipping = true;
      optionsGIF.colorCount = 256;
      
      var optionsJPEG = new ExportOptionsJPEG();
      optionsJPEG.artBoardClipping = true;
      optionsJPEG.qualitySetting = 80;
      
      var optionsSVG = new ExportOptionsSVG();
      optionsSVG.coordinatePrecision = 1;
      optionsSVG.cssProperties = SVGCSSPropertyLocation.STYLEELEMENTS;
      optionsSVG.documentEncoding = SVGDocumentEncoding.UTF8;
      optionsSVG.embedRasterImages = true;
      optionsSVG.fontSubsetting = SVGFontSubsetting.None;
      optionsSVG.fontType = SVGFontType.SVGFONT;
      
      switch(extension){
        case "PNG24":
          exportType = ExportType.PNG24;
          options = optionsPNG24;
          extension = "png";
          break;
        case "PNG8":
          exportType = ExportType.PNG8;
          options = optionsPNG8;
          extension = "png";
          break;
        case "GIF":
          exportType = ExportType.GIF;
          options = optionsGIF;
          extension = "gif";
          break;
        case "JPEG":
          exportType = ExportType.JPEG;
          options = optionsJPEG;
          extension = "jpg";
          break;
        case "SVG":
          exportType = ExportType.SVG;
          options = optionsSVG;
          extension = "svg";
          break;
      }
    
      switch(dpi){
        case "@1x / mdpi":
          dpi = 1;
          break;
        case "hdpi":
          dpi = 1.5;
          break;
        case "@2x / xhdpi":
          dpi = 2;
          break;
        case "@3x / xxhdpi":
          dpi = 3;
          break;
        case "xxxhdpi":
          dpi = 4;
          break;
      } 
    
      function newRect(x, y, width, height){ 
        var l = 0, t = 1, r = 2, b = 3;    
        var rect = [];
        rect[l] = x;
        rect[t] = y;
        rect[r] = width + x;
        rect[b] = -(height - rect[t]);   
        return rect;
      }
      
      var sel = app.activeDocument.selection;
      if(sel.length > 0){
        var folderObj = new Folder(folderPath);
        var folderiOSObj = new Folder(folderiOSPath);
        var folderMdpiObj = new Folder(folderMdpiPath);
        var folderHdpiObj = new Folder(folderHdpiPath);
        var folderXhdpiObj = new Folder(folderXhdpiPath);
        var folderXxhdpiObj = new Folder(folderXxhdpiPath);
        var folderXxxhdpiObj = new Folder(folderXxxhdpiPath);
        if(!folderObj.exists) {
          folderObj.create();
        }
        if((x1 || x2 || x3) && !folderiOSObj.exists) {
          folderiOSObj.create();
        }
        if(mdpi && !folderMdpiObj.exists){
          folderMdpiObj.create();
        }
        if(hdpi && !folderHdpiObj.exists){
          folderHdpiObj.create();
        }
        if(xhdpi && !folderXhdpiObj.exists){
          folderXhdpiObj.create();
        }
        if(xxhdpi && !folderXxhdpiObj.exists){
          folderXxhdpiObj.create();
        }
        if(xxxhdpi && !folderXxxhdpiObj.exists){
          folderXxxhdpiObj.create();
        }
      
        var imageAreaLayer = null;
        if(chkImageArea){
          var myDoc = app.activeDocument;
          var imageAreaLayerName = "Image area";
          for(var i = 0, il = myDoc.layers.length; i < il; i++){ 
            if(myDoc.layers[i].name == imageAreaLayerName){
              imageAreaLayer = myDoc.layers[i];
              imageAreaLayer.locked = false;
              imageAreaLayer.visible = true;
              break;
            }
          }
          if(!imageAreaLayer){
            imageAreaLayer = myDoc.layers.add();
            imageAreaLayer.name = imageAreaLayerName;
          }
        }

        for(var i = 0, il = sel.length; i < il; i++){
          var doc = app.documents.addDocument(DocumentColorSpace.RGB, dp);
          var selectedItem = sel[i];
          var duplicatedItem = null;
          var tx = null;
          var ty = null;
          var width = null;
          var height = null;
          
          if(selectedItem.clipped){
            var clippingPath = selectedItem.pageItems[0];
            tx = Math.round(clippingPath.geometricBounds[0]);
            ty = Math.round(clippingPath.geometricBounds[1]);
            width = Math.round(clippingPath.geometricBounds[2]) - tx;
            height = -(Math.round(clippingPath.geometricBounds[3]) - ty);
            clippingPath.width = width;
            clippingPath.height = height;
            clippingPath.position = [tx, ty];

            var dx = selectedItem.left - tx;
            var dy = selectedItem.top - ty;
            duplicatedItem = selectedItem.duplicate(doc, ElementPlacement.PLACEATEND);
            duplicatedItem.left = dx;
            duplicatedItem.top = dy;
            duplicatedItem.pageItems[0].remove();
          } else {
            tx = Math.floor(selectedItem.visibleBounds[0]);
            ty = Math.ceil(selectedItem.visibleBounds[1]);
            width = Math.ceil(selectedItem.visibleBounds[2]) - tx;
            height = -(Math.floor(selectedItem.visibleBounds[3]) - ty);
            duplicatedItem = selectedItem.duplicate(doc, ElementPlacement.PLACEATEND);
            duplicatedItem.left = 0;
            duplicatedItem.top = 0;
          }
        
          if(chkImageArea){
            var green = new RGBColor();
            green.red = green.blue = 0;
            green.green = 255;
            var rect = imageAreaLayer.pathItems.rectangle(ty, tx, width, height);
            rect.filled = true;
            rect.fillColor = green;
            rect.stroked = false;
            rect.opacity = 30;
          }
          doc.artboards.add(newRect(0, 0, width, height));
          doc.artboards.remove(0);
          
          function exportImage(fileName, scale){
            if(exportType !== ExportType.SVG){
              options.horizontalScale = scale;
              options.verticalScale = scale;
            }
            var fileObj = new File(fileName);
            doc.exportFile(fileObj, exportType, options);
          }
      
          var nextFileName = null;
          if(chkObjName  && selectedItem.name){
            var reg = new RegExp("(.*)(?:\.([^.]+$))");
            var sname = selectedItem.name;
            var matched = sname.match(reg);
            if(matched){
              nextFileName = matched[1];
            } else {
              nextFileName = selectedItem.name;
            }
          }
          var cnt = 0;
          while(!nextFileName){
            var tempName =  prefix + (zeroPadding + (i + cnt)).slice(-digits);
            var fileObjPNG = new File(folderPath + tempName + ".png");
            var fileObjGIF = new File(folderPath + tempName + ".gif");
            var fileObjJPEG = new File(folderPath + tempName + ".jpg");
            var fileObjSVG = new File(folderPath + tempName + ".svg");
            if(fileObjPNG.exists || fileObjGIF.exists || fileObjJPEG.exists || fileObjSVG.exists ){
              cnt++;
            } else {
              nextFileName = tempName;
            }
          }
        
          if(naming){
            var dialog = new Window("dialog", "Rename");
            var stDirection = dialog.add("statictext", undefined, {en:"Enter its file name.", ja:"ファイル名を入力してください。"});
            stDirection.alignment = "Left";
            var edName = dialog.add("edittext", undefined, nextFileName);
            edName.minimumSize = [300,20];
            edName.alignment = "fill";
            edName.active = true;
            var grBtn = dialog.add("group");
            var btnOK = grBtn.add("button", undefined, "OK", {name: "ok"});
            var btnCancel = grBtn.add("button", undefined, {en: "Cancel", ja: "キャンセル"}, {name: "cancel"});
            dialog.onShow = function(){
              this.frameLocation[1] = this.frameLocation[1] + 200;
            }
            if(dialog.show() == 1){
              nextFileName = edName.text;
            }
          }
          
          var fileName = nextFileName + "." + extension;
          exportImage(folderPath + fileName, 100);
          info.normal.push({name: fileName, dpi: "N/A", extension: extension, w: width, h: height});
          
          if(exportType !== ExportType.SVG){
            if(x1){
              var fileName = nextFileName + "." + extension;
              exportImage(folderiOSPath + fileName, 100 / dpi);
              info.iOS.push({name: fileName, dpi: "@1x", extension: extension, w: Math.round(width * 1 / dpi), h: Math.round(height * 1 / dpi)});
            }
            if(x2){
              var fileName = nextFileName + "@2x." + extension;
              exportImage(folderiOSPath + fileName, 200 / dpi);
              info.iOS.push({name: fileName, dpi: "@2x", extension: extension, w: Math.round(width * 2 / dpi), h: Math.round(height * 2 / dpi)});
            }
            if(x3){
              var fileName = nextFileName + "@3x." + extension;
              exportImage(folderiOSPath + fileName, 300 / dpi);
              info.iOS.push({name: fileName, dpi: "@3x", extension: extension, w: Math.round(width * 3 / dpi), h: Math.round(height * 3 / dpi)});
            }
            if(mdpi){
              var fileName = nextFileName + "." + extension;
              exportImage(folderMdpiPath + fileName, 100 / dpi);
              info.android.push({name: fileName, dpi: "mdpi", extension: extension, w: Math.round(width * 1 / dpi), h: Math.round(height * 1 / dpi)});
            }
            if(hdpi){
              var fileName = nextFileName + "." + extension;
              exportImage(folderHdpiPath + fileName, 150 / dpi);
              info.android.push({name: fileName, dpi: "hdpi", extension: extension, w: Math.round(width * 1.5 / dpi), h: Math.round(height * 1.5 / dpi)});
            }
            if(xhdpi){
              var fileName = nextFileName + "." + extension;
              exportImage(folderXhdpiPath + fileName, 200 / dpi);
              info.android.push({name: fileName, dpi: "xhdpi", extension: extension, w: Math.round(width * 2 / dpi), h: Math.round(height * 2 / dpi)});
            }
            if(xxhdpi){
              var fileName = nextFileName + "." + extension;
              exportImage(folderXxhdpiPath + fileName, 300 / dpi);
              info.android.push({name: fileName, dpi: "xxhdpi", extension: extension, w: Math.round(width * 3 / dpi), h: Math.round(height * 3 / dpi)});
            }
            if(xxxhdpi){
              var fileName = nextFileName + "." + extension;
              exportImage(folderXxxhdpiPath + fileName, 400 / dpi);
              info.android.push({name: fileName, dpi: "xxxhdpi", extension: extension, w: Math.round(width * 4 / dpi), h: Math.round(height * 4 / dpi)});
            }
          }
          doc.close(SaveOptions.DONOTSAVECHANGES);
        }
      } else {
        alert({en: "You need to select at least one artwork.", ja: "アートワークを1つ以上選択してください。"});
      }
      return info.toSource();
    },
    [extension, dpi.selection.toString(), x1.value, x2.value, x3.value, mdpi.value, hdpi.value, xhdpi.value, xxhdpi.value, xxxhdpi.value, !rbtnAuto.value, edPrefix.text, parseInt(digits.selection + 1), destinationPath, chkObjName.value, chkImageArea.value, chkImageList.value],
    function(body){
      if(body !== undefined){
        if(chkImageList.value){
          var info = eval(body);
          if(info.normal.length){
            exportCSV(info.normal, destination.fullName + "/Images/");
          }
          if(info.iOS.length){
            exportCSV(info.iOS, destination.fullName+ "/Images-iOS/");
          }
          if(info.android.length){
            exportCSV(info.android, destination.fullName + "/Images-Android/");
          }
        }
      }
    });
  };
  
  btnOption.onClick = function(){
    if(pnlOption.visible){
      closePnlOption();
    } else {
      openPnlOption();
    }
  };

  rbtnPNG24.onClick = function(){ 
    xml.extension = "PNG24";
    grDpi.enabled = true;
    griOS.enabled = true;
    grAndroid1.enabled = true;
    grAndroid2.enabled = true;
    save();
  };
  rbtnPNG8.onClick = function(){ 
    xml.extension = "PNG8";
    grDpi.enabled = true;
    griOS.enabled = true;
    grAndroid1.enabled = true;
    grAndroid2.enabled = true;
    save();
  };
  rbtnGIF.onClick = function(){ 
    xml.extension = "GIF";
    grDpi.enabled = true;
    griOS.enabled = true;
    grAndroid1.enabled = true;
    grAndroid2.enabled = true;
    save();
  };
  rbtnJPEG.onClick = function(){ 
    xml.extension = "JPEG";
    grDpi.enabled = true;
    griOS.enabled = true;
    grAndroid1.enabled = true;
    grAndroid2.enabled = true;
    save();
  };
  rbtnSVG.onClick = function(){ 
    xml.extension = "SVG";
    grDpi.enabled = false;
    griOS.enabled = false;
    grAndroid1.enabled = false;
    grAndroid2.enabled = false;
    x1.value = false;
    x2.value = false;
    x3.value = false;
    mdpi.value = false;
    hdpi.value = false;
    xhdpi.value = false;
    xxhdpi.value = false;
    xxxhdpi.value = false;
    save();
  };

  dpi.onChange = function(){
    switch(this.selection.toString()){
      case "@1x / mdpi":
        xml.dpi = "@1x / mdpi";
        x1.enabled = true;
        x2.enabled = true;
        x3.enabled = true;
        break;
      case "@2x / xhdpi":
        xml.dpi = "@2x / xhdpi";
        x1.enabled = true;
        x2.enabled = true;
        x3.enabled = true;
        break;
      case "@3x / xxhdpi":
        xml.dpi = "@3x / xxhdpi";
        x1.enabled = true;
        x2.enabled = true;
        x3.enabled = true;
        break;
      case "hdpi":
        xml.dpi = "hdpi";
        xml.x1 = false;
        xml.x2 = false;
        xml.x3 = false;
        x1.enabled = false;
        x1.value = false;
        x2.enabled = false;
        x2.value = false;
        x3.enabled = false;
        x3.value = false;
        break;
      case "xxxhdpi":
        xml.dpi = "xxxhdpi";
        xml.x1 = false;
        xml.x2 = false;
        xml.x3 = false;
        x1.enabled = false;
        x1.value = false;
        x2.enabled = false;
        x2.value = false;
        x3.enabled = false;
        x3.value = false;
        break;
    }
    save();
  };

  x1.onClick = function(){ 
    xml.x1 = this.value ? true: false;
    save();
  };
  x2.onClick = function(){
    xml.x2 = this.value ? true: false;
    save();
  };
  x3.onClick = function(){ 
    xml.x3 = this.value ? true: false;
    save();
  };
  mdpi.onClick = function(){
    xml.mdpi = this.value ? true: false;
    save();
  };
  hdpi.onClick = function(){ 
    xml.hdpi = this.value ? true: false;
    save();
  };
  xhdpi.onClick = function(){ 
    xml.xhdpi = this.value ? true: false;
    save();
  };
  xxhdpi.onClick = function(){ 
    xml.xxhdpi = this.value ? true: false;
    save();
  };
  xxxhdpi.onClick = function(){ 
    xml.xxxhdpi = this.value ? true: false;
    save();
  };

  rbtnAuto.onClick = function(){ 
    xml.naming = "auto";
    save();
  };
  rbtnManual.onClick = function(){ 
    xml.naming = "manual"; 
    save();
  };
  edPrefix.onChange = function(){
    if(this.text == "") {
      this.text = "image";
      xml.prefix = "image";
    } else {
      xml.prefix = this.text;
    }
    save();
  };
  digits.onChange = function(){ 
    xml.digits = parseInt(this.selection) + 1;
    save();
  };

  btnBrowse.onClick = function(){
    var result = Folder.selectDialog();
    if(result){
      destination = result
      destinationPath = destination.fullName;
      edDestination.text = result.fsName;
      xml.destination = destination.fullName;
      save();
    }
  }

  edDestination.onChange = function(){
    var folder = new Folder(edDestination.text);
    if(folder.exists){
      destination = folder;
      destinationPath = destination.fullName;
      xml.destination = destination.fullName;
      save();
    }
    else {
      alert({en: "This folder path couldn't be found. Please enter a path of an existing folder.", ja: "フォルダがありません。正しいフォルダパスを入力してください。"});
      edDestination.text = destination.fsName;
    }
  }
  
  chkObjName.onClick = function(){
    xml.chkObjName = this.value ? true: false;
    save();
  }
  chkImageArea.onClick = function(){ 
    xml.chkImageArea = this.value ? true: false; 
    save();
  };
  chkImageList.onClick = function(){ 
    xml.chkImageList = this.value ? true: false; 
    save();
  };

  btnReset.onClick = function(){
    xml = defaultXml.copy();
    refresh();
    save();
  };
}

function openPnlOption(){
  var b = palette.bounds;
  var s = palette.preferredSize;
  palette.bounds = [b[0], b[1], b[0] + s[0], b[1] + s[1]];
  pnlOption.visible = true;
}

function closePnlOption(){
  var b = palette.bounds;
  var s = pnlMain.preferredSize;
  palette.bounds = [b[0], b[1], b[0] + s[0] + 30, b[1] + s[1] + 30];
  pnlOption.visible = false;
}

function refresh(){
  switch(xml.extension.toString()){
    case "PNG24":
      rbtnPNG24.value = true;
      grDpi.enabled = true;
      griOS.enabled = true;
      grAndroid1.enabled = true;
      grAndroid2.enabled = true;
      break;
    case "PNG8" :
      rbtnPNG8.value = true;
      grDpi.enabled = true;
      griOS.enabled = true;
      grAndroid1.enabled = true;
      grAndroid2.enabled = true;
      break;
    case "GIF"  :
      rbtnGIF.value = true;
      grDpi.enabled = true;
      griOS.enabled = true;
      grAndroid1.enabled = true;
      grAndroid2.enabled = true;
      break;
    case "JPEG" :
      rbtnJPEG.value = true;
      grDpi.enabled = true;
      griOS.enabled = true;
      grAndroid1.enabled = true;
      grAndroid2.enabled = true;
      break;
    case "SVG"  :
      rbtnSVG.value = true;
      grDpi.enabled = false;
      griOS.enabled = false;
      grAndroid1.enabled = false;
      grAndroid2.enabled = false;
      break;
  }
  switch(xml.dpi.toString()){
    case "@1x / mdpi":
      dpi.selection = dpi.items[0];
      break;
    case "hdpi":
      dpi.selection = dpi.items[1];
      break;
    case "@2x / xhdpi":
      dpi.selection = dpi.items[2];
      break;
    case "@3x / xxhdpi":
      dpi.selection = dpi.items[3];
      break;
    case "xxxhdpi":
      dpi.selection = dpi.items[4];
      break;
  }
  x1.value = (xml.x1.toString() == "true") ? true : false;
  x2.value = (xml.x2.toString() == "true") ? true : false;
  x3.value = (xml.x3.toString() == "true") ? true : false;
  mdpi.value = (xml.mdpi.toString() == "true") ? true : false;
  hdpi.value = (xml.hdpi.toString() == "true") ? true : false;
  xhdpi.value = (xml.xhdpi.toString() == "true") ? true : false;
  xxhdpi.value = (xml.xxhdpi.toString() == "true") ? true : false;
  xxxhdpi.value = (xml.xxxhdpi.toString() == "true") ? true : false;
  if(xml.naming.toString() == "auto"){
    rbtnAuto.value = true;
  } else {
    rbtnManual.value = true;
  }
  edPrefix.text = xml.prefix.toString();
  digits.selection = digits.items[parseInt(xml.digits) - 1];
  if(xml.destination.toString() != ""){
    destination = new Folder(xml.destination.toString());
    if(!destination.exists){
      destination = Folder.desktop;
    }
  } else {
    destination = Folder.desktop;
  }
  destinationPath = destination.fullName;
  edDestination.text = destination.fsName;
  chkObjName.value = (xml.chkObjName.toString() == "true") ? true : false;
  chkImageArea.value = (xml.chkImageArea.toString() == "true") ? true : false;
  chkImageList.value = (xml.chkImageList.toString() == "true") ? true : false;
}

palette.show();