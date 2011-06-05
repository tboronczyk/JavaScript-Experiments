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

// This code is used to generate modal and non-modal dialog windows in
//JavaScript. drag.js should be included prior for dialogs to be draggable.

// Dialog - the dialog object
function Dialog(dialogType, title, message) {
    var dialog;
    var pThis = this; // duplicate reference to Dialog object so it will be
                      // available to anonymous functions (ex. when assigning
                      // event handlers)
    // events
    this.onResponseYes = function (dlg) { };
    this.onResponseNo  = function (dlg) { };
    this.onResponseOk  = function (dlg) { };
    this.onBeforeShow  = function (dlg) { };
    this.onAfterShow   = function (dlg) { };
    this.onBeforeExit  = function (dlg) { };
    this.onAfterExit   = function (dlg) { };

    // recursively remove DOM elements
    function removeNode(node) {
        while (node.childNodes.length) {
            removeNode(node.childNodes[0]);
        }
        node.parentNode.removeChild(node);
    }

    // traverse the DOM and find the maximum z-index
    function getMaxZIndex() {
        var els = document.getElementsByTagName('*');
        var max = 0;
        for (var i = 0; i < els.length; i++) {
            var zIndex = (els[i].style.zIndex) ?
                parseInt(els[i].style.zIndex, 10) : 0;
            max = (zIndex > max) ? zIndex : max;
        }
        return max;
    }

    // position the dialog window within the browser window
    function positionDialog() {
        var cw = window.innerWidth ||
                document.getElementsByTagName('html').item(0).clientWidth;
        var ch = window.innerHeight ||
                document.getElementsByTagName('html').item(0).clientHeight;
        var dw = dialog.offsetWidth;
        var dh = dialog.offsetHeight;

        dialog.style.top  = (ch - dh) / 3 + 'px';
        dialog.style.left = (cw - dw) / 2 + 'px';
        dialog.style.zIndex = getMaxZIndex() + 1;
    }

    // close the dialog
    function closeDialog() {
        if (pThis.onBeforeExit(dialog) === false) {
            return;
        }

        // remove modal screen
        if (dialog.modalScreen) {
            removeNode(dialog.modalScreen);
        }

        // obviously cannot pass dialog to onAfterExit if removeNode(dialog) is
        // is called, so hide the dialog first, call the event handler, and then
        // call removeNode
        dialog.style.display = 'none';
        pThis.onAfterExit(dialog);
        removeNode(dialog);
    }

    // build the title area of the dialog window
    function buildTitle() {
        var titleArea = document.createElement('div');
        titleArea.className = 'titleArea';

        // The title area should not be selectable
        titleArea.unselectable = 'on';
        titleArea.style.MozUserSelect = 'none';
        titleArea.style.cursor = 'default';
        titleArea.onselectstart = function () {
            return false;
        };

        // enable drag and drop
        titleArea.onmousedown = function () {
            document.dragObject = dialog;
            if (document.dragObject.style.zIndex != getMaxZIndex()) {
                document.dragObject.style.zIndex = getMaxZIndex() + 1;
            }
            this.style.cursor = 'move';
            return false;
        };
        titleArea.onmouseup = function () {
            document.dragObject = null;
            this.style.cursor = '';
        };

        // title text
        var t1 = document.createElement('div');
        t1.className = 'text';
        t1.style.cursor = 'default';
        t1.appendChild(document.createTextNode(title));
        titleArea.appendChild(t1);

        // exit button
        var t2 = document.createElement('div');
        t2.className = 'exitButton';
        t2.onclick = function () {
            closeDialog();
        };
        titleArea.appendChild(t2);
        dialog.appendChild(titleArea);
    }

    // build the message area of the dialog window
    function buildMessage() {
        var messageArea = document.createElement('div');
        messageArea.className = 'messageArea';

        var m = document.createElement('div');
        switch (dialogType) {
        case Dialog.TYPE_CUSTOM:
            m.className = 'icoCustom';
            break;

        case Dialog.TYPE_CONFIRM:
            m.className = 'icoConfirm';
            break;

        case Dialog.TYPE_INFO:
            m.className = 'icoInfo';
            break;

        case Dialog.TYPE_WARNING:
            m.className = 'icoWarn';
            break;

        case Dialog.TYPE_ERROR:
            m.className = 'icoError';
            break;
        }
        m.innerHTML = message;
        messageArea.appendChild(m);

        dialog.appendChild(messageArea);
    }

    // fill the button area (called by buildButtons)
    function fillButtons(buttonArea, buttonMask) {
        if (buttonMask & Dialog.BTN_TYPE_YES) {
            var btnYes = document.createElement('input');
            btnYes.type = 'button';
            btnYes.value = 'YES';
            btnYes.onclick = function () {
                if (pThis.onResponseYes(dialog) !== false) {
                    closeDialog();
                }
            };
            buttonArea.appendChild(btnYes);
        }

        if (buttonMask & Dialog.BTN_TYPE_NO) {
            var btnNo = document.createElement('input');
            btnNo.type = 'button';
            btnNo.value = 'NO';
            btnNo.onclick = function () {
                if (pThis.onResponseNo(dialog) !== false) {
                    closeDialog();
                }
            };
            buttonArea.appendChild(btnNo);
        }

        if (buttonMask & Dialog.BTN_TYPE_OK) {
            var btnOk = document.createElement('input');
            btnOk.type = 'button';
            btnOk.value = 'OK';
            btnOk.onclick = function () {
                if (pThis.onResponseOk(dialog) !== false) {
                    closeDialog();
                }
            };
            buttonArea.appendChild(btnOk);
        }
    }

    // build the button area of the dialog window
    function buildButtons() {
        var buttonArea = document.createElement('div');
        buttonArea.className = 'buttonArea';

        switch (dialogType) {
        case Dialog.TYPE_CUSTOM:
        case Dialog.TYPE_CONFIRM:
            fillButtons(buttonArea, Dialog.BTN_TYPE_YES | Dialog.BTN_TYPE_NO);
            break;

        case Dialog.TYPE_INFO:
        case Dialog.TYPE_WARNING:
        case Dialog.TYPE_ERROR:
            fillButtons(buttonArea, Dialog.BTN_TYPE_OK);
            break;
        }

        dialog.appendChild(buttonArea);
    }
    
    // build up the dialog window
    function buildDialog() {
        dialog = document.createElement('div');
        dialog.className = 'dialog';
        dialog.onclick = function () {
            if (this.style.zIndex != getMaxZIndex()) {
                this.style.zIndex = getMaxZIndex() + 1;
            }
        };

        // The dialog should not be selectable unless dialogType is TYPE_CUSTOM
        if (dialogType != Dialog.TYPE_CUSTOM) {
            dialog.unselectable = 'on';
            dialog.style.MozUserSelect = 'none';
            dialog.style.cursor = 'default';
            dialog.onselectstart = function () {
                return false;
            };
        }

        buildTitle();
        buildMessage();
        buildButtons();
    }

    // construct modal screen
    function buildModal() {
        var screen = document.createElement('div');
        screen.className = 'modalScreen';
        screen.onmousedown = function () {
            return false;
        };
        // attach to dialog so it can be accessed later
        dialog.modalScreen = screen;
    }

    // render the dialog window
    this.show = function (isModal) {

        buildDialog();

        this.onBeforeShow(dialog);

        // render modal screen if necessary
        if (Boolean(isModal)) {
            buildModal();
            document.getElementsByTagName('body').item(0).appendChild(
                dialog.modalScreen);
        }

        document.getElementsByTagName('body').item(0).appendChild(dialog);
        positionDialog();
        this.onAfterShow(dialog);
    };
}

// button types
Dialog.BTN_TYPE_YES  = 1;
Dialog.BTN_TYPE_NO   = 2;
Dialog.BTN_TYPE_OK   = 4;

// Dialog window types
Dialog.TYPE_CUSTOM  = 0;
Dialog.TYPE_CONFIRM = 1;
Dialog.TYPE_INFO    = 2;
Dialog.TYPE_WARNING = 3;
Dialog.TYPE_ERROR   = 4;

