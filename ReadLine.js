/**
 * ReadLine.js
 * Copyright (c) 2011, Yoshinori Kohyama (http://algobit.jp/)
 * all rights reserved.
 */
try { Algobit } catch (e) { Algobit = {}; }
Algobit.dp = function (m) {
	var e = document.getElementsByTagName('body')[0];
	e.appendChild(document.createTextNode(m));
	e.appendChild(document.createElement('br'));
}

Algobit.ReadLine = function (cols, rows) {
	/*
	 * local variables
	 */
	var buf = []; // history lines, 前に追加
	var current = ""; // current
	var historyIndex = -1;
	var instance = this; // ネストした関数内部から
						// このインスタンスにアクセスするための変数

	/*
	 * properties
	 */
	this.getc = null;
	this.gets = null;
	this.history = 100;
	this.textarea = document.createElement('textarea');
	this.__defineGetter__('cols', function () {
		return this.textarea.getAttribute('cols');});
	this.__defineSetter__('cols', function (cols) {
		this.textarea.setAttribute('cols', cols);});
	this.__defineGetter__('rows', function () {
		return this.textarea.getAttribute('rows');});
	this.__defineSetter__('rows', function (rows) {
		this.textarea.setAttribute('rows', rows);});
	this.cols = cols;
	this.rows = rows;
	this.prompt = "";
	function lastCrOrLfOf(s) {
		var m = s.lastIndexOf('\r');
		var n = s.lastIndexOf('\n');
		if (m < n)
			return n;
		return m;
	}
	function home() {
		var s = instance.textarea.value;

		return lastCrOrLfOf(s) + 1 + instance.prompt.length;
	}
	function setCursorPosition(i) {
		instance.textarea.selectionStart = i;
		instance.textarea.selectionEnd = instance.textarea.selectionStart;
	}
	function incCursorPosition() {
		instance.textarea.selectionStart += 1;
		instance.textarea.selectionEnd = instance.textarea.selectionStart;
	}
	function decCursorPosition() {
		instance.textarea.selectionStart -= 1;
		instance.textarea.selectionEnd = instance.textarea.selectionStart;
	}
	this.print = function (s) {
		instance.textarea.value += s;

		// 最後の改行から, 最後までをプロンプトだと思う.
		var j = s.length;
		var i = lastCrOrLfOf(s);
		instance.prompt = s.substring(i + 1, j);
	};
	this.f_return = function() {
		if (instance.getc)
			getc('\n');
		else if (instance.gets) {
			var s = instance.textarea.value;
			var t = s.substring(home(), s.length);
			instance.textarea.value += '\n';
			instance.gets(t);
			buf.unshift(t);
			while (instance.history < buf.length)
				buf.pop();
			current = "";
			historyIndex = -1;
		} else {
			instance.print('\n');
		}
	};
	this.f_backspace = function() {
		var s = instance.textarea.value;
		var l = s.length;
		var i = instance.textarea.selectionStart;
		if (home() < i) {
			instance.textarea.value = s.substring(0, i - 1) + s.substring(i, l);
			setCursorPosition(i - 1);
		}
	};
	this.f_delete = function() {
		var s = instance.textarea.value;
		var l = s.length;
		var i = instance.textarea.selectionStart;
		if (i < l) {
			instance.textarea.value = s.substring(0, i) + s.substring(i + 1, l);
			setCursorPosition(i);
		}
	};
	this.f_deleteToEnd = function () {
		var s = instance.textarea.value;
		var l = s.length;
		var i = instance.textarea.selectionStart;
		if (i < l) {
			instance.textarea.value = s.substring(0, i);
			setCursorPosition(i);
		}
	};
	this.f_back = function () {
		if (home() < instance.textarea.selectionStart)
			decCursorPosition();
	};
	this.f_forward = function () {
		if (instance.textarea.selectionStart < instance.textarea.value.length)
			incCursorPosition();
	};
	this.f_home = function () {
		var h = home();
		if (h < instance.textarea.selectionStart)
			setCursorPosition(h);
	};
	this.f_end = function () {
		var l = instance.textarea.value.length;
		if (instance.textarea.selectionStart < l)
			setCursorPosition(l);
	};
	this.f_next = function () {
		if (0 < historyIndex) {
			var s = instance.textarea.value;
			historyIndex -= 1;
			instance.textarea.value =
				s.substring(0, home()) + buf[historyIndex];
			setCursorPosition(instance.textarea.value.length);
		} else if (historyIndex == 0) {
			var s = instance.textarea.value;
			historyIndex -= 1;
			instance.textarea.value =
				s.substring(0, home()) + current;
			setCursorPosition(instance.textarea.value.length);
			current = "";
		}
	};
	this.f_prev = function () {
		var buflen = buf.length;
		if (buflen <= 0)
			return;
		if (historyIndex < 0) {
			var s = instance.textarea.value;
			var h = home();
			var l = s.length;
			historyIndex += 1;
			current = s.substring(home(), l);
			instance.textarea.value =
				s.substring(0, home()) + buf[historyIndex];
			setCursorPosition(instance.textarea.value.length);
		} else if (historyIndex + 1 < buflen) {
			var s = instance.textarea.value;
			historyIndex += 1;
			instance.textarea.value =
				s.substring(0, home()) + buf[historyIndex];
			setCursorPosition(instance.textarea.value.length);
		}
	};

	/*
	 * sck: array of short cut keys
	 *      each element are array: [keyCode, ctrl, shift, alt]
	 *      ctrl, shift, alt, mcmd
	 * fb: function body
	 */
	this.functions = {
		'return': {fb: this.f_return, sck: [[13, false, false, false]
		]}, 'backspace': {fb: this.f_backspace, sck: [
			[8, false, false, false] // BS
			, [72, true, false, false] // Ctrl-H

		]}, 'delete': {fb: this.f_delete, sck: [
			[46, false, false, false] // Delete
			, [68, true, false, false] // Ctrl-D

		]}, 'deleteToEnd': {fb: this.f_deleteToEnd, sck: [
			[75, true, false, false] // Ctrl-K

		]}, 'back': {fb: this.f_back, sck: [
			[37, false, false, false] // left-arrow
			, [66, true, false, false] // Ctrl-B

		]}, 'forward': {fb: this.f_forward, sck: [
			[39, false, false, false] // RIGHT-ARROW
			, [70, true, false, false] // Ctrl-F

		]}, 'home': {fb: this.f_home, sck: [
			[36, false, false, false] // HOME
			, [65, true, false, false] // Ctrl-A

		]}, 'end': {fb: this.f_end, sck: [
			[35, false, false, false] // END
			, [69, true, false, false] // Ctrl-E

		]}, 'prev': {fb: this.f_prev, sck: [
			[38, false, false, false] // UP-ARROW
			, [80, true, false, false] // Ctrl-P

		]}, 'next': {fb: this.f_next, sck: [
			[40, false, false, false] // Down-ARROW
			, [78, true, false, false] // Ctrl-N

		]}
	};
	
	function performKeyEvent(event) {
		var i;

		/*
		Algobit.dp(event.type + ":" + event.keyCode + ", " +
			event.ctrlKey + ", " +
			event.shiftKey + ", " + event.altKey);
		*/
 		for (i in instance.functions) {
			var si, sl, sk;

			sl = instance.functions[i].sck.length;
			for (si = 0; si < sl; si++) {
				sck = instance.functions[i].sck[si];
				if (event.keyCode == sck[0] &&
					(!sck[1] || event.ctrlKey) &&
					(!sck[2] || event.shiftKey) &&
					(!sck[3] || event.altKey)) {
					if (event.type == 'keyup')
						instance.functions[i].fb();
					return false;
				}
			}
		}
	};
	this.textarea.onkeyup = performKeyEvent;
	this.textarea.onkeydown = performKeyEvent;
}
Algobit.ReadLine.prototype.print = function(s) {
	this.textarea.value += s;
}
