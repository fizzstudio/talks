"use strict";

/*
Silver Bullet / Bulletproof: an SVG-based slideshow / presentation framework

usage:
  <script xlink:href="silverbullet.js"/>
  <style type="text/css">@import url(silverbullet.css);</style>
instructions:
 * right/left arrow keys move to next/previous slide
 * down arrow key steps forward through bullets
 * up arrow key steps backward through bullets
 * shift+t shows ToC
*/


window.onload = function () {
  function importScript() {
    var scriptEl = document.getElementsByTagName('script')[0];
    for (var i = 0, iLen = arguments.length; iLen > i; i++) {
      var filename = arguments[i];
      var docNS = document.documentElement.namespaceURI;
      var importEl = document.createElementNS(docNS, "script");
      if ("http://www.w3.org/1999/xhtml" === docNS) {
        importEl.src = filename;
        importEl.type = "text/javascript";
        importEl.defer = true;
      } else if ("http://www.w3.org/2000/svg" === docNS) {
        importEl.setAttributeNS( "http://www.w3.org/1999/xlink", "xlink:href", filename );
        importEl.setAttribute( "type", "text/ecmascript" );
      }
      scriptEl.parentNode.insertBefore( importEl, scriptEl );
    }
  }

  // import list of slides and list of colors
  importScript("slidelist.js");

  // extensions
  // importScript("colorbox.js");

  var sb = new silver_bullet(document.documentElement);
}


function silver_bullet(root) {
  this.root = root;


  var cb = new colorbox(document.documentElement);

  // constants
  this.svgns = "http://www.w3.org/2000/svg";
  this.xlinkns = "http://www.w3.org/1999/xlink";


  // focus properties
  this.b = 0; // the current bullet point
  this.lastBullet = 0; // the previous bullet point
  this.bullets = []; // the list of bullet points (clip?)


  this.root.addEventListener("click", bind(this, this.click), false );
  this.root.addEventListener("keydown", bind(this, this.trackKeys), false );

  // this.foo();

  var fire, forget, blank, load = null;
  var bulletEls = document.querySelectorAll("[data-fire]");
  for (var i = 0; i < bulletEls.length; ++i) {
    var eachBullet = bulletEls[i];

    if ("text" == eachBullet.localName ) {
      this.wrapText(eachBullet);
    }
    fire = +eachBullet.getAttribute("data-fire");
    forget = +eachBullet.getAttribute("data-forget");
    blank = eachBullet.getAttribute("data-blank");
    load = eachBullet.getAttribute("data-load");


    if (this.lastBullet < fire) {
      this.lastBullet = fire;
    }

    // TODO: allow multiple fire/forget values, comma-separated,
    // to allow a single item to show and hide more than once
    eachBullet.addEventListener( "next" + fire, bind(this, this.show), false);
    eachBullet.addEventListener( "back" + (fire - 1), bind(this, this.hide), false);

    if ( null != forget ) {
      eachBullet.addEventListener( "next" + forget, bind(this, this.hide), false);
      eachBullet.addEventListener( "back" + (forget - 1), bind(this, this.show), false);
    }

    if ( load ) {
      let load_index = load.split(`,`)[0].trim();
      eachBullet.addEventListener( "next" + load_index, bind(this, this.load), false);
      eachBullet.addEventListener( "back" + load_index, bind(this, this.unload), false);
    }

    if ( blank && "true" == blank ) {
      eachBullet.style.display = "none";
      eachBullet.style.visibility = "visible";
      eachBullet.addEventListener( "back0", bind(this, this.hide), false);
    } else {
      eachBullet.addEventListener( "back0", bind(this, this.show), false);
    }

    this.bullets.push(eachBullet);
  }

  var buttons = document.querySelectorAll("[role='button']");
  for (var button = 0; button < buttons.length; ++button) {
    var eachButton = buttons[button];
    eachButton.addEventListener( "click", bind(this, this.handleButton), false);
  }

}

silver_bullet.prototype.foo = function (event) {
  console.log("foo");
}

silver_bullet.prototype.trackKeys = function (e) {
   console.log("trackKeys");
 var keyCode = null;
  if (!e) {
    e = window.event;
  }

  if (window.event) {
    keyCode = window.event.keyCode;
  } else if (e.which) {
    keyCode = e.which;
  }
  else {
    return true;
  }

  if (37 == keyCode || 39 == keyCode) {
    this.changeSlide( keyCode );
  } else if (40 == keyCode) {
    this.b++;
    if (this.lastBullet < this.b) {
      this.b = this.lastBullet;
    } else {
      this.sendEvent("next");
    }
  } else if (38 == keyCode) {
    this.b--;
    if (0 > this.b) {
      this.b = 0;
    } else {
      this.sendEvent("back");
    }
  }
}

silver_bullet.prototype.handleButton = function (e) {
  console.log("handleButton");
  if ( "next" == e.target.parentNode.id ) {
    this.b++;
    if (this.lastBullet < this.b) {
      this.b = this.lastBullet;
    } else {
      this.sendEvent("next");
    }
  } else if ( "previous" == e.target.parentNode.id ) {
    this.b--;
    if (0 > this.b) {
      this.b = 0;
    } else {
      this.sendEvent("back");
    }
  }
}

silver_bullet.prototype.sendEvent = function (dir) {
  console.log("sendEvent");
  if (window.CustomEvent) {
    var bulletEvent = new CustomEvent( dir + this.b, {
      detail: {
        message: dir + this.b,
        time: new Date(),
      },
      bubbles: false,
      cancelable: true
    });

    if (!dir) {
      dir = "next";
    }

    console.log("sendEvent");


    for (var i = 0; i < this.bullets.length; ++i) {
      if ( 1 == this.b && "next" == dir) {
        this.bullets[i].style.display = "none";
      }

      this.bullets[i].dispatchEvent(bulletEvent);
    }
  }
}

silver_bullet.prototype.show = function (e) {
  console.log("show");
  if (this.b > 23) {
    console.log("beep", this.b)
  }
  e.currentTarget.style.display = "inline";


  // var bullet = e.currentTarget;
  // let load_class = bullet.getAttribute("data-load");
  // bullet.classList.add(load_class);

  /*
  var bulletClass = bullet.getAttribute("class");
  var ani = bulletClass.indexOf("animate");
  if ( -1 != ani ) {
    var bulletEls = bullet.getElementsByTagName("*");
    for (var b = 0, bLen = bulletEls.length; bLen > b; b++) {
      var eachEl = bulletEls[b];
      if ( eachEl.beginElement ) {
        eachEl.beginElement();
      }
    }
  }
  */
}

silver_bullet.prototype.hide = function (e) {
  console.log("hide");
  e.currentTarget.style.display = "none";
  //
  // var bullet = e.currentTarget;
  // let load_class = bullet.getAttribute("data-load");
  // bullet.classList.remove(load_class);
}


silver_bullet.prototype.load = function (e) {
  console.log("load");
  var bullet = e.currentTarget;
  let load = bullet.getAttribute("data-load");
  let load_arr = load.split(`,`);
  let load_index = load_arr[0].trim();
  let load_class = load_arr[1].trim();

  bullet.classList.add(load_class);
}


silver_bullet.prototype.unload = function (e) {
  console.log("unload");
  var bullet = e.currentTarget;
  let load = bullet.getAttribute("data-load");
  let load_arr = load.split(`,`);
  let load_index = load_arr[0].trim();
  let load_class = load_arr[1].trim();

  bullet.classList.remove(load_class);
}

silver_bullet.prototype.wrapText = function (el) {
  console.log("wrapText");
  var width = +el.getAttribute("width");
  if ( !width ) {
    width = parseFloat(el.style.width);
  }
  if ( width ) {
    var words = el.textContent;
    if ( words ) {
      var words = words.trim().replace("\s\s/gi", " ").split(' ');
      el.textContent = "";
      var x = el.getAttribute("x");
      if ( !x ) {
        x= 0;
      }

      var tspanEl = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      tspanEl.setAttribute( "x", x);
      tspanEl.appendChild( document.createTextNode( words[0] ) );
      el.appendChild( tspanEl );

      for (var w = 1; w < words.length; ++w ) {
        var eachWord = words[w];
        var len = tspanEl.textContent.length;
        tspanEl.textContent += " " + eachWord;

        if (tspanEl.getComputedTextLength() > width) {
          tspanEl.textContent = tspanEl.textContent.slice(0, len);

          var tspanEl = tspanEl.cloneNode();
          tspanEl.setAttribute( "dy", "1.2em");
          tspanEl.appendChild( document.createTextNode( words[w] ) );
          el.appendChild( tspanEl );
        }
      }
    }
  }
}

silver_bullet.prototype.changeSlide = function (keyCode) {
  var loc = window.location.href;
  var file = loc.split("/").pop();
  file = file.split("?")[0];
  file = file.split("#")[0];

  if (file === "") {
    file = "index.html";
  }

  var newfile = slidelist[0];

  for (var fi = 0, fiLen = slidelist.length; fiLen > fi; fi++) {
    var eachSlide = slidelist[fi];
    if (file == eachSlide) {
      var ni = fi;
     switch (keyCode) {
        case 37:
          // left
          ni--;
          if (0 > ni) {
            ni = slidelist.length - 1;
          }
          break;

        case 39:
          // right
          ni++;
          if (slidelist.length <= ni) {
            ni = 0;
          }
          break;
      }
      newfile = slidelist[ni];
      fiLen = fi;
    }
  }
  window.location = newfile;
}


/****
* Helper methods
****/

Array.prototype.max = function () {
  return Math.max.apply(null, this)
}

Array.prototype.min = function () {
  return Math.min.apply(null, this)
}

function bind (scope, fn) {
  return function () {
    return fn.apply( scope, arguments );
  }
}


function colorbox(root) {
  this.root = root;

  // constants
  this.svgns = "http://www.w3.org/2000/svg";

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

  var colorIndex = randomNum(0, this.boxColors.length - 1);
  var color = this.boxColors[ colorIndex ];
  this.boxColors.splice( colorIndex, 1);

  var box = document.createElementNS(this.svgns, "polygon" );
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
