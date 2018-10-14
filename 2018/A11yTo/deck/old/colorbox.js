/*
 colorbox bullets extension for Silver Bullet
*/

window.onload = function () {
  console.log("colorbox");
  var cb = new colorbox(document.documentElement);
}


function colorbox(root) {
  this.root = root;
 
  this.boxColors = ["#ea4a21", "#852919", "#46872a", "#30a1c7", "#6b2f55", "#095628", "#472aaa", "#d85962", "#a01183", "#22598d", "#671126", "#4e48d9", "#00a100", "#ea4a21", "#472aaa", "#46872a", "#30a1c7"];

  var bulletEls = document.querySelectorAll(".colorbox");
  console.log(bulletEls);

  for (var i = 0; i < bulletEls.length; ++i) {
    var eachBullet = bulletEls[i];
    this.createBox( eachBullet );
  }
}

colorbox.prototype.createBox = function ( bulletEl ) {
  var bbox = bulletEl.getBBox();
  var x = [];
  var y = [];
  x[0] = bbox.x - randomNum( -3, 20);
  y[0] = bbox.y - randomNum( -3, 20);
  x[1] = Number(bbox.x + bbox.width) + randomNum( -3, 20);
  y[1] = bbox.y - randomNum( -3, 20);
  x[2] = Number(bbox.x + bbox.width) + randomNum( -3, 20);
  y[2] = Number(bbox.y + bbox.height) + randomNum( -3, 20);
  x[3] = bbox.x - randomNum( -3, 20);
  y[3] = Number(bbox.y + bbox.height) + randomNum( -3, 20);

  var points = x[0] + "," + y[0] + " " + x[1] + "," + y[1] + " " + x[2] + "," + y[2] + " " + x[3] + "," + y[3];

  var colorIndex = randomNum(0, boxColors.length - 1);
  var color = this.boxColors[ colorIndex ];
  this.boxColors.splice( colorIndex, 1);
  
  var box = document.createElementNS(svgns, "polygon" );
  box.setAttribute( "points", points );
  box.setAttribute( "fill", color );
  // box.setAttribute( "fill", "rgb(" + randomNum(0, 255) + "," + randomNum(0, 255) + "," + randomNum(0, 255) + ")" );

  bulletEl.insertBefore( box, bulletEl.firstChild );

}

//generates a quasi-random number in the ranges between the two parameters
randomNum.today = new Date();
randomNum.seed = randomNum.today.getTime();
function randomNum(min, max) {
  var range = Number(max) - Number(min);
  var offset = 0;
  if (0 == min) {
    range = max + 1;
    offset = 1;
  }
  else if (0 > min) {
    range += 1;
    offset = 1;
  }
  randomNum.seed = (randomNum.seed * 9301 + 49297) % 233280;
  var result = Math.ceil(randomNum.seed / (233280.0) * range);
  return Number(result) + Number(min) - Number(offset);
};

