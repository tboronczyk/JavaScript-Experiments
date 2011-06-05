/*
 * Copyright (c) 2008, Timothy Boronczyk
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

// This code defines the event handler for mousemove events. Simply assign
// an element's reference to document.dragObject to make it drag.

document.onmousemove = function (evt) {
    this.prevMouseX = this.mouseX || 0;
    this.prevMouseY = this.mouseY || 0;

    evt = evt || window.event;
    if (evt.pageX || evt.pageY) {
        this.mouseX = evt.pageX;
        this.mouseY = evt.pageY;
    } else {
        this.mouseX = evt.clientX + document.body.scrollLeft -
            document.body.clientLeft;
        this.mouseY = evt.clientY + document.body.scrollTop -
            document.body.clientTop;
    }

    if (this.dragObject) {
        this.dragObject.style.top  = parseInt(this.dragObject.style.top, 10) -
            (this.prevMouseY - this.mouseY) + 'px';
        this.dragObject.style.left = parseInt(this.dragObject.style.left, 10) -
            (this.prevMouseX - this.mouseX) + 'px';
    }
};

