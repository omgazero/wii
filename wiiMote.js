//import { findRemotes, Remote } from 'node_modules/wiinode/lib/index.js';
var wii = require('wiinode');
var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/WiiTest.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

remote = wii.findRemotes();
if(remote!=undefined){
  console.log('yeah!!');
  remote[0].setLed(1);
  enableIR();
}
else{
  console.log('NOOOO!!');
}

io.on('connection', function(socket){
  var ir = { x:remote[0].irx, y:remote[0].iry};
  setInterval(function(){
    console.log('irx = ' + ir.x);
    console.log('iry = ' + ir.y);
    io.emit('ir', ir);
  }, 20);


  remote[0].on("a", function(pressed){
    if(pressed == true){
      console.log('buttonA pressed!');
      io.emit('a', true);
    }
  });

});
function enableIR(){
  remote[0].hid.write([0x13, 0x04]);
  remote[0].hid.write([0x1a, 0x04]);
  writeData(0x04b00030, 1, [0x08]);
  writeData(0x04b00000, 9, [0x02, 0x00, 0x00, 0x71, 0x01, 0x00, 0xaa, 0x00, 0x64]);
  writeData(0x04b0001a, 2, [0x63, 0x03]);
  writeData(0x04b00033, 1, [0x01]);
  writeData(0x04b00030, 1, [0x08]);
}
function writeData(address, size, buff){
  var mBuff = [];

  mBuff[0] = 0x16;
	mBuff[1] = ((address & 0xff000000) >> 24) ;
	mBuff[2] = ((address & 0x00ff0000)  >> 16);
	mBuff[3] = ((address & 0x0000ff00)  >>  8);
	mBuff[4] = (address & 0x000000ff);
	mBuff[5] = size;
  var newBuff = mBuff.concat(buff);
  console.log(newBuff);
  remote[0].hid.write(newBuff);

}
