const app = require('electron').remote;
const dialog = app.dialog;
const fs = require('fs');
const dir = require('node-dir');
const path = require('path');
const readfiles = require('readfiles');
let $ = require('jquery')
let data = [];
let dataPoints=[];
let index = 0;
let count = 0;

let options = {
    exportEnabled: true,
    animationEnabled: true,
    title: {
        text: "Графік"
    },
    data: [{
		type: "spline",
		dataPoints: []
	}]
};


function compare(a,b) {
    if (a.x < b.x)
      return -1;
    if (a.x > b.x)
      return 1;
    return 0;
}
function countWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");
    s = s.replace(/[ ]{2,}/gi, " ");
    s = s.replace(/\n /, "\n");
    return s.split(' ').length;
}

function getCountOfFiles(path){
    
    readfiles('/path/to/dir/', {
        filter: '*.json',
        readContents: false
      }, function (err, content, filename) {
        if (err) throw err;
        console.log('File ' + filename);
      });
}
function readFilesFromDir(path) {
    
    index = 0;
    $('.loader-wrap').css('display', 'block');
    data = [];
    dataPoints=[];
    $("#myTable > tbody:last").children().empty();
    dir.readFiles(path, {
        match: /.txt$/,
        exclude: /^\./
    }, function (err, content, filename, next) {
        if (err) {
            $('.loader-wrap').css('display', 'none');
            dialog.showErrorBox('Помилка', err.toString());
            throw err
        };
        index++;
        $('.count').text(index.toString()+"/"+count.toString);
        $('#myTable tr:last').after('<tr><td>' +
            filename +
            '</td><td>' +
            +fs.statSync(filename).size +
            '</td><td>' +
            countWords(content) +
            '</td></tr>');
        dataPoints.push({
            x:countWords(content),
            y:fs.statSync(filename).size,
        })
        data.push({
            name: filename,
            size: fs.statSync(filename).size,
            text: content,
            count: countWords(content)
        })
        next();
    },
        function (err, files) {
            if (err) {
                dialog.showErrorBox('Помилка', err.toString());
                $('.loader-wrap').css('display', 'none')
                throw err
            };
            console.log('finished reading files:');
            dataPoints.sort(compare)
            options.data[0].dataPoints=dataPoints;
            $("#chartContainer").CanvasJSChart(options);
            
            $('.loader-wrap').css('display', 'none')
        });
}


$('#chooseFolder').on('click', function () {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, function (filename) {
        if (filename) {
            $('#path').text(filename.toString());
            getCountOfFiles(filename.toString());
            readFilesFromDir(filename.toString());
        } else {
            $('#path').text('Папку не вибрано');

        }
    });
})
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    if($('#chartContainer').CanvasJSChart()){
        if(e.target.hash=='#menu1'){
            $('#chartContainer').CanvasJSChart().render();
        }
        
    }
   
})