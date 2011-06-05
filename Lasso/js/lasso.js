/*
 * Copyright (c) 2011, Timothy Boronczyk
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 *
 *  1. Redistributions of source code must retain the above copyright notice, 
 *     this list of conditions and the following disclaimer.
 *
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *  3. The names of the authors may not be used to endorse or promote products 
 *     derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT ANY EXPRESS OR IMPLIED 
 * WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF 
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 */

// Lasso - the lasso object
function Lasso(imgId, callback) {

    // find absolute position of an object, adapted from
    // http://www.quirksmode.org/js/findpos.html
    function findPos(obj) {
        var currLeft = 0;
        var currTop = 0;
        if (obj.offsetParent) {
            do {
                currLeft += obj.offsetLeft;
                currTop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return {"x": currLeft, "y": currTop};
    }

    var prevMousePos = {"x": 0, "y": 0};

    var lso = document.createElement('div');
    var lsoBounds = {"top": 0, "right": 0, "bottom": 0, "left": 0};
    var lsoIsSizable = false;

    var img = document.getElementById(imgId);
    var imgPos = findPos(img);
    var imgBounds = {"top": imgPos.y, "right": imgPos.x + img.offsetWidth,
                     "bottom": imgPos.y + img.offsetHeight, "left": imgPos.x};

    function getMouseCoords(evt) {
        evt = evt || window.event;
        var mouseX, mouseY;
        if (evt.pageX || evt.pageY) {
            mouseX = evt.pageX;
            mouseY = evt.pageY;
        } else {
            mouseX = evt.clientX + document.body.scrollLeft -
                document.body.clientLeft;
            mouseY = evt.clientY + document.body.scrollTop -
                document.body.clientTop;
        }
        return {"x": mouseX, "y": mouseY};
    }

    function imageOnMouseMove(evt) {
        var coords = getMouseCoords(evt);
        var bdrOffset = parseInt(lso.style.borderWidth, 10) * 2;
        var deltaX = prevMousePos.x - coords.x;
        var deltaY = prevMousePos.y - coords.y;

        // resize lasso if only lsoIsSizable
        if (lsoIsSizable == true) {
            lsoBounds.right -= deltaX;
            lsoBounds.bottom -= deltaY;

            // constrain the lasso to the image's boundaries
            if (lsoBounds.right < imgBounds.left) {
                lsoBounds.right = imgBounds.left;
            }
            if (lsoBounds.right > imgBounds.right) {
                lsoBounds.right = imgBounds.right;
            }
            if (lsoBounds.bottom < imgBounds.top) {
                lsoBounds.bottom = imgBounds.top;
            }
            if (lsoBounds.bottom > imgBounds.bottom) {
                lsoBounds.bottom = imgBounds.bottom;
            }

            // render lasso
            if (lsoBounds.right > lsoBounds.left) {
                lso.style.left = lsoBounds.left + "px";
                lso.style.width = (lsoBounds.right - lsoBounds.left - bdrOffset) + "px";
            }
            else {
                lso.style.left = lsoBounds.right + "px";
                lso.style.width = (lsoBounds.left - lsoBounds.right - bdrOffset) + "px";
            }

            if (lsoBounds.bottom > lsoBounds.top) {
                lso.style.top = lsoBounds.top + "px";
                lso.style.height = (lsoBounds.bottom - lsoBounds.top - bdrOffset) + "px";
            }
            else {
                lso.style.top = lsoBounds.bottom + "px";
                lso.style.height = (lsoBounds.top - lsoBounds.bottom - bdrOffset) + "px";
            }
        }
        // preserve mouse pointer position as prevMousePos
        prevMousePos.x = coords.x;
        prevMousePos.y = coords.y;
    }

    function imageOnMouseUp() {
        lsoIsSizable = false;
        if (lsoBounds.top == lsoBounds.bottom || lsoBounds.right == lsoBounds.left) {
            lso.style.display = "none";
        }
        var x = (lsoBounds.right > lsoBounds.left) ?
                lsoBounds.left - imgBounds.left: lsoBounds.right - imgBounds.left;
        var y = (lsoBounds.bottom > lsoBounds.top) ?
                lsoBounds.top - imgBounds.top: lsoBounds.bottom - imgBounds.top;
        var width = (lsoBounds.right > lsoBounds.left) ?
                lsoBounds.right - lsoBounds.left : lsoBounds.left - lsoBounds.right;
        var height = (lsoBounds.bottom > lsoBounds.top) ?
                lsoBounds.bottom - lsoBounds.top : lsoBounds.top - lsoBounds.bottom;
        if (typeof callback === "function") {
            callback(x, y, width, height);
        }
    }

    function imageOnMouseDown(evt) {
        var coords = getMouseCoords(evt);
        lsoBounds.left = lsoBounds.right = prevMousePos.x = coords.x;
        lsoBounds.top = lsoBounds.bottom = prevMousePos.y = coords.y;
        lsoIsSizable = true;
        lso.style.top = lsoBounds.top + "px";
        lso.style.left = lsoBounds.left + "px";
        lso.style.width = (lsoBounds.left - lsoBounds.right) + "px";
        lso.style.height = (lsoBounds.top - lsoBounds.bottom) + "px";
        lso.style.display = "";
        return false;
    }

    function imageOnMouseOut(evt) {
        if (lsoIsSizable) {
            var coords = getMouseCoords(evt);
            if (coords.x < imgBounds.left || coords.x > imgBounds.right ||
                coords.y < imgBounds.top  || coords.y > imgBounds.bottom) {
                imageOnMouseUp();
            }
        }
    }

    lso.className = "lasso";
    document.getElementsByTagName('body').item(0).appendChild(lso);
    // these styles are necessary
    lso.style.display = "none";
    lso.style.position = "absolute";
    lso.style.zIndex = 100000;

    // these styles are cosmetic
    lso.style.borderColor = "#000000";
    lso.style.borderStyle = "dashed";
    lso.style.borderWidth = "2px";

    // assign callback to image to trigger lasso
    img.onmousedown = imageOnMouseDown;
    img.onmouseup = imageOnMouseUp;
    img.onmousemove = imageOnMouseMove;
    img.onmouseout = imageOnMouseOut;

    // wrap calls to img.onmouse* so lasso appears "hollow"
    lso.onmousedown = function (evt) {
        img.onmousedown(evt);
        return false;
    };
    lso.onmouseup = function () {
        img.onmouseup();
    };
    lso.onmousemove = function (evt) {
        img.onmousemove(evt);
    };
    // do not wrap img.onmouseout
}

