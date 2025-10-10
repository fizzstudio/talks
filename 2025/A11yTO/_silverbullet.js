"use strict";

/*
Silver Bullet / Bulletproof: an SVG-based slideshow / presentation framework

usage:
  <script href="_silverbullet.js"/>
  <style type="text/css">@import url(_silverbullet.css);</style>
instructions:
 * right/left arrow keys move to next/previous slide
 * down arrow key steps forward through bullets
 * up arrow key steps backward through bullets
 * shift+t shows ToC
*/

var SilverBullet = null;
window.addEventListener('load', () => initSilverBullet());

function initSilverBullet () {
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
        importEl.setAttributeNS( "http://www.w3.org/1999/xlink", "href", filename );
        importEl.setAttribute( "type", "text/ecmascript" );
      }
      scriptEl.parentNode.insertBefore( importEl, scriptEl );
    }
  }

  // import list of slides and list of colors
  importScript("_slidelist.js");

  // extensions
  // importScript("colorbox.js");

  SilverBullet = new silver_bullet(document.documentElement);
  // alert(SilverBullet)
}


function silver_bullet(root) {
  this.root = root;
  this.show_all_slides = false;


  var cb = new colorbox(document.documentElement);

  // constants
  this.svgns = "http://www.w3.org/2000/svg";
  this.xlinkns = "http://www.w3.org/1999/xlink";

  let prefs = window.location.search;
  if (prefs && prefs.includes("show_all=true")) {
    this.show_all_slides = true;
  }

  // focus properties
  this.b = 0; // the current bullet point
  this.lastBullet = 0; // the previous bullet point
  this.bullets = []; // the list of bullet points (clip?)


  // this.root.addEventListener("click", bind(this, this.click), false );
  // this.root.addEventListener("keydown", bind(this, this.trackKeys), false );
  this.root.addEventListener("click", this.click.bind(this), false );
  this.root.addEventListener("keydown", this.trackKeys.bind(this), false );

  // this.foo();
  this.load_bullets();
}

silver_bullet.prototype.click = function (event) {
}

silver_bullet.prototype.load_bullets = function () {

  var fire, forget, blank, draw, fade, remove_class = null;
  var bulletEls = document.querySelectorAll("[data-fire], [data-draw], [data-fade]");
  // var bulletEls = document.querySelectorAll("[data-fire], [data-draw], [data-fade], [data-remove_class]");
  for (var i = 0; i < bulletEls.length; ++i) {
    var eachBullet = bulletEls[i];

    if ("text" == eachBullet.localName ) {
      this.wrapText(eachBullet);
    }
    fire = +eachBullet.getAttribute("data-fire");
    forget = +eachBullet.getAttribute("data-forget");
    blank = eachBullet.getAttribute("data-blank");
    draw = eachBullet.getAttribute("data-draw");

    fade = +eachBullet.getAttribute("data-fade");
    remove_class = +eachBullet.getAttribute("data-remove_class");

    if (this.lastBullet < fire) {
      this.lastBullet = fire;
    }

    // TODO: allow multiple fire/forget values, comma-separated,
    // to allow a single item to show and hide more than once
    // eachBullet.addEventListener( "next" + fire, bind(this, this.show), false);
    // eachBullet.addEventListener( "back" + (fire - 1), bind(this, this.hide), false);
    eachBullet.addEventListener( "next" + fire, this.show.bind(this), false);
    eachBullet.addEventListener( "back" + (fire - 1), this.hide.bind(this), false);

    // new fade test
    // eachBullet.addEventListener( "next" + fade, bind(this, this.fade), false);
    eachBullet.addEventListener( "next" + fade, this.fade.bind(this), false);

    if ( null != forget ) {
      // eachBullet.addEventListener( "next" + forget, bind(this, this.hide), false);
      // eachBullet.addEventListener( "back" + (forget - 1), bind(this, this.show), false);
      eachBullet.addEventListener( "next" + forget, this.hide.bind(this), false);
      eachBullet.addEventListener( "back" + (forget - 1), this.show.bind(this), false);
    }

    // if ( null != remove_class ) {
    //   console.log("remove_class loop")
    //   eachBullet.addEventListener( "next" + remove_class, this.remove_class.bind(this), false);
    // }

    if ( draw ) {
      let draw_index = draw.split(`,`)[0].trim();
      // eachBullet.addEventListener( "next" + draw_index, bind(this, this.draw), false);
      // eachBullet.addEventListener( "back" + draw_index, bind(this, this.undraw), false);
      eachBullet.addEventListener( "next" + draw_index, this.draw.bind(this), false);
      eachBullet.addEventListener( "back" + draw_index, this.undraw.bind(this), false);
    }

    if ( blank && "true" == blank ) {
      if (!this.show_all_slides) {
        eachBullet.style.visibility = "hidden";
      }
      // eachBullet.style.visibility = "visible";
      // eachBullet.addEventListener( "back0", bind(this, this.hide), false);
      eachBullet.addEventListener( "back0", this.hide.bind(this), false);
    } else {
      // eachBullet.addEventListener( "back0", bind(this, this.show), false);
      eachBullet.addEventListener( "back0", this.show.bind(this), false);
    }

    if (this.show_all_slides) {
      eachBullet.style.visibility = "visible";
    }

    this.bullets.push(eachBullet);
  }

  var buttons = document.querySelectorAll("[role='button']");
  for (var button = 0; button < buttons.length; ++button) {
    var eachButton = buttons[button];
    // eachButton.addEventListener( "click", bind(this, this.handleButton), false);
    eachButton.addEventListener( "click", this.handleButton.bind(this), false);
  }

}

silver_bullet.prototype.foo = function (event) {
  // console.log("foo");
}

silver_bullet.prototype.trackKeys = function (e) {
   // console.log("trackKeys");
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
  // console.log("handleButton");
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
  // console.log("sendEvent");
  if (window.CustomEvent) {
    const bulletEvent = new CustomEvent( dir + this.b, {
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

    // console.log("sendEvent");

    for (var i = 0; i < this.bullets.length; ++i) {
      if ( 1 == this.b && "next" == dir) {
        this.bullets[i].style.visibility = "hidden";
      }

      this.bullets[i].dispatchEvent(bulletEvent);
    }
  }
}

silver_bullet.prototype.show = function (e) {
  // console.log("show");
  var bullet_el = e.currentTarget;
  if (this.b > 23) {
    // console.log("beep", this.b)
  }
  bullet_el.style.visibility = "visible";

  if ( bullet_el.beginElement ) {
    bullet_el.beginElement();
  }

  // var bullet = e.currentTarget;
  // let draw_class = bullet.getAttribute("data-draw");
  // bullet.classList.add(draw_class);

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
  // console.log("hide");
  e.currentTarget.style.visibility = "hidden";


  // HACK: fix by dispatching an `unfade` event!
  e.currentTarget.style.opacity = 1;

  //
  // var bullet = e.currentTarget;
  // let draw_class = bullet.getAttribute("data-draw");
  // bullet.classList.remove(draw_class);
}

silver_bullet.prototype.fade = function (e) {
  // // console.log("%cfade", "color:white; font-size:2rem; background-color:purple; padding:5px; font-weight:bold;");
  e.currentTarget.style.opacity = 0.4;
}

silver_bullet.prototype.remove_class = function (e) {
  console.log("remove_class fn");
  console.log(e.currentTarget);

  // e.currentTarget.style.visibility = "hidden";
  // e.currentTarget.className = '';


  // HACK: fix by dispatching an `unfade` event!
  // e.currentTarget.style.opacity = 1;
}


silver_bullet.prototype.draw = function (e) {
  // console.log("draw");
  var bullet_el = e.currentTarget;
  let draw = bullet_el.getAttribute("data-draw");
  let draw_arr = draw.split(`,`);
  let draw_index = draw_arr[0].trim();
  let draw_class = draw_arr[1].trim();

  // console.log("draw", draw_class);

  bullet_el.style.visibility = "visible";
  bullet_el.classList.add(draw_class);
}


silver_bullet.prototype.undraw = function (e) {
  // console.log("undraw");
  var bullet = e.currentTarget;
  let draw = bullet.getAttribute("data-draw");
  let draw_arr = draw.split(`,`);
  let draw_index = draw_arr[0].trim();
  let draw_class = draw_arr[1].trim();

  bullet.classList.remove(draw_class);
}


silver_bullet.prototype.wrapText = function (el) {
  // console.log("wrapText");
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

  let new_url = newfile;
  if (this.show_all_slides) {
    new_url += "?show_all=true"
  }
  window.location = new_url;
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

// function bind (scope, fn) {
//   return function () {
//     return fn.apply( scope, arguments );
//   }
// }


function colorbox(root) {
  this.root = root;

  // constants
  this.svgns = "http://www.w3.org/2000/svg";

  this.boxColors = ["#ea4a21", "#852919", "#46872a", "#30a1c7", "#6b2f55", "#095628", "#472aaa", "#d85962", "#a01183", "#22598d", "#671126", "#4e48d9", "#00a100", "#ea4a21", "#472aaa", "#46872a", "#30a1c7"];

  var bulletEls = document.querySelectorAll(".colorbox");
  // console.log(bulletEls);

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
