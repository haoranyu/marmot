/**
*@author: 
*cyhello��cyhello@gmail.com��
*seven (remember2015@gmail.com)
*rank��ranklau@gmail.com��
 */
(function(){
/**
 * @method	_marmotGetParam
 * ��ȡurl����
 */
var _marmot_js_href = null;
function _marmotGetParam(param) {
	if (!_marmot_js_href) {
		var js = document.getElementsByTagName('script');
		for (var i = 0, len = js.lenth; i < len; i++) {
			if (js[i].getAttribute('marmot') == 'true') {
				_marmot_js_href = js[i].src;
				break;
			}
		}
		if (!_marmot_js_href) 
			_marmot_js_href = js[js.length - 1].src;
	}
	var match = _marmot_js_href.match(new RegExp(param+'=([^\?\#\&\=]*)','i'));
	if (match) return match[1];
	return null;
}
/**
 * ���������
 */
var _ratio = _marmotGetParam('ratio');
if(_ratio !== null) {
	var _rnd = _ratio * Math.random();
	if (_rnd > 1) return;
}

/**
 * @class	Marmot
 * Marmot��̬��
 */
window.Marmot = Marmot = {
	_pageID: _marmotGetParam('id'),
	//�û���Ϊ���ݵ���ʵ��������������
	_logData: [],
	//��������߳�
	_grid: 7,
	_align: _marmotGetParam('align') || 'middle',
	//���ɼ����������ﵽ�����������Զ��ύ
	_maxEvt: 50,
	//��һ���¼������ڴ������ĵ���Զ�����focus�¼����
	_preEvt: {t:'f',path:[]},
	//refer����󳤶�
	_maxRef: 100,
	//log���͵�ַ
	_logUrl: "http://www.marmotu.com/resource/marmot.gif",

	//��ȡҳ���С
	_getPageWidth: function () { 
	    var doc = document,
	        body = doc.body,
	        html = doc.documentElement,
	        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;
	
	    return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
	},
	//log����
	log: function(arg) {

		//�������ﵽ���ֵ���Զ��ύ
		if (Marmot._logData.length >= Marmot._maxEvt) {
			Marmot.pushLog();
			Marmot.pushLog = function(){};
			return ;
		}
		//���ݵ��������װ��
		if (arg.x != '') {
			var midLine = (Marmot._align == 'middle') ? parseInt(Marmot._getPageWidth() / 2) : 0;
			arg.x = arg.x - midLine != 0 ? arg.x - midLine : 1;
			arg.x = parseInt(arg.x / Marmot._grid) * Marmot._grid + (arg.x / Math.abs(arg.x)) * (parseInt(Marmot._grid / 2) + 1);
			arg.y = parseInt(arg.y / Marmot._grid) * Marmot._grid + (parseInt(Marmot._grid / 2) + 1);
		} 
		//console.log(Marmot._preEvt.t, arg.t, Marmot._preEvt.path.join(''), arg.path.join(''))
		//�������ĵ���¼���focus�¼��ظ�
		if (arg.t == 'c' && Marmot._preEvt !== null && Marmot._preEvt.t == 'f' && arg.path.join('') == Marmot._preEvt.path.join('')) {
			//console.log('pop')
			Marmot._logData.pop();
		}
		Marmot._logData.push(arg.x + '*' + arg.y + '*' + arg.path.join(''));
		Marmot._preEvt = arg;
	},
	stop: function() {
		Marmot.pushLog = function(){};
	},
	//���û�������ݷ��͵������
	pushLog: function() {
		var data = Marmot._logData.join('!');
		var refer = document.referrer;
		if (refer.length > 100) {
			refer = refer.split('?')[0];
		}
		var img= document.createElement('img');
		img.src = Marmot._logUrl + '?mid=' + encodeURIComponent(this._pageID) + '&data=' + data + '&ref=' + encodeURIComponent(refer.substr(0, this._maxRef)) + '&px=' + window.screen.width + '*' + window.screen.height;
		document.body.appendChild(img);
	},
	//�������ݼ�⹦�ܣ������û���Ϊ
	inspect: function() {
		//�����¼���target
		function getTarget(e) {
			return e.target || e.srcElement;
		};
		//�����¼�����
		function getEvent(event, element) {
			if (event) {
				return event;
			} else if (element) {
				if (element.document) return element.document.parentWindow.event;
				if (element.parentWindow) return element.parentWindow.event;
			}
			return window.event || null;
		};
		//�����¼�
		var listen = function () {
			if (document.addEventListener) {
				return function (element, name, handler) {
					element.addEventListener(name, handler, true);
				};
			} else if (document.attachEvent) {
				return function (element, name, handler) {
					element.attachEvent('on' + name, handler);
				};
			}
		}();
		function getDoc(evt) {
			var target = getTarget(evt), doc = document;
			if (target) {
				doc = target.document || target.ownerDocument || (target.window || target.defaultView) && target || document;
			}
			return doc;
		};
		//�����¼��Ĵ�������
		function getXY(evt) {
			var e = evt, doc = getDoc(evt);
			var x = ('pageX' in e) ? e.pageX : (e.clientX + (doc.documentElement.scrollLeft || doc.body.scrollLeft) - 2);
			var y = ('pageY' in e) ? e.pageY : (e.clientY + (doc.documentElement.scrollTop || doc.body.scrollTop) - 2);
			return {
				x: x,
				y: y
			}
		};
		//����Ԫ�صľ�������
		function getPos(el) {
			var x = el.offsetTop;
			var y = el.offsetLeft;
			while (el = el.offsetParent) {
				x += el.offsetTop;
				y += el.offsetLeft;
			}
			return {
				x: x,
				y: y
			};
		};
		try {
			listen(document, 'mousedown', function(e) {
				var evt = getEvent(e, this);
				var target = getTarget(evt);
				var path = Marmot.getPath(target);
				var pos = getXY(evt);
				Marmot.log({
					x: pos.x,
					y: pos.y,
					path: path,
					t: 'c'
				})
			});
			listen(document, 'focus', function(e) {
				var evt = getEvent(e, this);
				var target = getTarget(evt);
				if (target.tagName) {
					var tag = target.tagName.toUpperCase();
					if (tag == 'INPUT' || tag == 'TEXTAREA' || tag == 'BUTTON' || tag == 'SELECT' || tag == 'OBJECT' || tag == 'EMBED') {
						var path = Marmot.getPath(target);
						var pos = getPos(target);
						Marmot.log({
							x: pos.x,
							y: pos.y,
							path: path,
							t: 'f'
						})
					} else {
						return;
					}
				}
			});
			listen(window, 'beforeunload', function(e) {
				Marmot.pushLog();
			});
		} catch(e) {};
	},
	//����Ԫ�ص�MDP·��
	getPath: function(node, path) {
		path = path || [];
		if (node == document.body || (node.tagName && node.tagName.toUpperCase() == "HTML")) {
			return path;
		};
		if (node.getAttribute && node.getAttribute('id') != '' && node.getAttribute('id') != null) {
			path.push(node.nodeName.toLowerCase() + '.' + node.getAttribute('id'));
			return path;
		};
		if (node.parentNode && node.parentNode.tagName.toUpperCase() !="BODY") {
			path = Marmot.getPath(node.parentNode, path);
		}
		if(node.previousSibling) {
			var count = 1;
			var sibling = node.previousSibling
			do {
				//if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
				if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
					count++;
				}
				sibling = sibling.previousSibling;
			} while(sibling);	
		}
		if(node.nodeType == 1) {
			path.push('~' + (count > 1 ? count : 1) + node.nodeName.toLowerCase());
		}
		return path;
	}
}

/**
 * ����Marmot
 */
Marmot.inspect();
})();