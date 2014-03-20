
var jinjupHtmlControls = (function ()
{

	function Node(nodeType)
	{
		this.nodeType = nodeType;
	};
	var tempNode = function () { };
	tempNode.prototype = Node.prototype;


	function TextNode(text)
	{
		Node.call(this, 'text');
		this.nodeValue = '';
		if (text)
		{
			this.nodeValue = text;
		}
	}
	TextNode.prototype = new tempNode();
	TextNode.prototype.constructor = TextNode;

	Object.defineProperty(TextNode.prototype, 'textContent', {
		get: function ()
		{
			return this.nodeValue;
		},
		set: function (value)
		{
			this.nodeValue = value;
		}
	});

	Object.defineProperty(TextNode.prototype, 'outerHtml', {
		get: function ()
		{
			return this.nodeValue;
		}
	});

	function Element(tagName)
	{
		this.tagName = tagName;
		this.childNodes = [];
		this.attributes = {};
		Node.call(this, 'element');

		// A void Element is an element whose content model never allows it 
		// to have contents under any circumstances.  Void elements only have
		// a start tag; end tags must not be specified for void elements.
		//
		this.isVoid = function ()
		{
			isVoid = false;
			switch (this.tagName)
			{
				case 'area':
				case 'base':
				case 'br':
				case 'col':
				case 'embed':
				case 'hr':
				case 'img':
				case 'input':
				case 'keygen':
				case 'link':
				case 'menuitem':
				case 'meta':
				case 'param':
				case 'source':
				case 'track':
				case 'wbr':
					isVoid = true;
					break;
				default:
					isVoid = false;
					break;
			}
			return isVoid;
		}

	}

	Element.prototype = new tempNode();
	Element.prototype.constructor = Element;

	Element.prototype.appendChild = function (child)
	{
		if (child instanceof TextNode
		|| child instanceof Element)
		{
			this.childNodes.push(child);
		}
	}

	Object.defineProperty(Element.prototype, 'id', {
		get: function ()
		{
			if (!this.attributes)
			{
				this.attributes = { id: '' };
			}
			else if (!this.attributes.id)
			{
				this.attributes.id = '';
			}
			return this.attributes.id;
		},
		set: function (value)
		{
			if (typeof value === 'string')
			{
				this.attributes.id = value;
			}
		}

	});

	Object.defineProperty(Element.prototype, 'textContent', {
		get: function ()
		{
			var text = '';
			for (var index = 0; index < this.childNodes.length; ++index)
			{
				if (this.childNodes[index] instanceof TextNode)
				{
					text += this.childNodes[index].textContent;
				}
			}
			if (text === '')
			{
				text = null;
			}
			return text;
		},
		set: function (value)
		{
			if (typeof value === 'string')
			{
				this.childNodes = [];
				this.appendChild(new TextNode(value));
			}
			else if (value instanceof TextNode)
			{
				this.childNodes = [];
				this.appendChild(value);
			}
		}

	});

	Object.defineProperty(Element.prototype, 'innerHtml', {
		get: function ()
		{
			var innerHtml = '';
			if (this.childNodes)
			{
				for (var index = 0; index < this.childNodes.length; ++index)
				{
					if (this.childNodes[index])
					{
						innerHtml += this.childNodes[index].outerHtml;
					}
				}
			}
			return innerHtml;
		}
	});

	Object.defineProperty(Element.prototype, 'outerHtml', {
		get: function ()
		{
			var html = '<' + this.tagName;

			if (this.attributes)
			{
				for (name in this.attributes)
				{
					html += ' ' + name + '="' + this.attributes[name] + '"';
				}
			}

			if (this.isVoid())
			{
				html += ' />';
			}
			else
			{
				html += '>';
				html += this.innerHtml;
				html += '</' + this.tagName + '>';
			}
			return html;
		}
	});

	var tempElement = function () { };
	tempElement.prototype = Element.prototype;

	function Title(titleText)
	{
		Element.call(this, 'title');
		this.textContent = titleText;
	}
	Title.prototype = new tempElement();
	Title.prototype.constructor = Title;

	function Head(titleText)
	{
		Element.call(this, 'head');
		this.appendChild(new Title(titleText));
	}
	Head.prototype = new tempElement();
	Head.prototype.constructor = Head;

	Object.defineProperty(Head.prototype, 'title', {
		get: function ()
		{
			var titleNode = null;
			for (var index = 0; index < this.childNodes.length; ++index)
			{
				if (this.childNodes[index] instanceof Title)
				{
					titleNode = this.childNodes[index];
					break;
				}
			}
			if (titleNode === null)
			{
				titleNode = new Title();
				this.appendChild(titleNode);
			}
			return titleNode;
		}
	});


	function Html(titleText)
	{
		Element.call(this, 'html');
		this.appendChild(new Head(titleText));
		this.appendChild(new Element('body'));
	};
	Html.prototype = new tempElement();
	Html.prototype.constructor = Html;

	Object.defineProperty(Html.prototype, 'head', {
		get: function ()
		{
			var found = false;
			for (var index = 0; index < this.childNodes.length; ++index)
			{
				if (this.childNodes[index] instanceof Head)
				{
					found = true;
					break;
				}
			}
			if (!found)
			{
				this.childNodes.unshift(new Head());
				index = 0;
			}
			return this.childNodes[index];
		}
	});
	Object.defineProperty(Html.prototype, 'body', {
		get: function ()
		{
			var found = false;
			for (var index = 0; index < this.childNodes.length; ++index)
			{
				if (this.childNodes[index].tagName === 'body')
				{
					found = true;
					break;
				}
			}
			if (!found)
			{
				this.appendChild(new Element('body'));
				index = this.childNodes.length - 1;
			}
			return this.childNodes[index];
		}
	});

	function Document(titleText)
	{
		this.declaration = 'html';
		this.html = new Html(titleText);
	}
	Object.defineProperty(Document.prototype, 'title', {
		get: function ()
		{
			return this.html.head.title.textContent;
		}
	});
	Object.defineProperty(Document.prototype, 'body', {
		get: function ()
		{
			return this.html.body;
		}
	});

	Object.defineProperty(Document.prototype, 'outerHtml', {
		get: function ()
		{
			var html = '<!DOCTYPE ' + this.declaration + ' >';
			html += this.html.outerHtml;
			return html;
		}
	});


	function Link(rel, type, href)
	{
		Element.call(this, 'link');
		this.attributes = { rel: rel, type: type, href: href };
	}
	Link.prototype = new tempElement();
	Link.prototype.constructor = Link;

	function Script(type, src)
	{
		Element.call(this, 'script');
		this.attributes = { type: type, src: src };
	}
	Script.prototype = new tempElement();
	Script.prototype.constructor = Script;

	function Image(src, alt)
	{
		Element.call(this, 'img');
		if(!alt)
		{
			alt = src;
		}
		this.attributes = { src: src, alt: alt };
	}
	Image.prototype = new tempElement();
	Image.prototype.constructor = Image;

	function Anchor(href, text)
	{
		Element.call(this, 'a');
		this.attributes = { href: href };
		if (text)
		{
			if (typeof text === 'string')
			{
				this.textContent = text;
			}
			else if (text instanceof TextNode)
			{
				this.appendChild(text);
			}
		}
	}
	Anchor.prototype = new tempElement();
	Anchor.prototype.constructor = Anchor;

	return {
		TextNode: TextNode,
		Element: Element,
		Head: Head,
		Html: Html,
		Document: Document,
		Link: Link,
		Script: Script,
		Image: Image,
		Anchor: Anchor,

		createElement: function (tagName)
		{
			return new Element(tagName);
		},
		createTextNode: function (text)
		{
			return new TextNode(text);
		},
		document: function (titleText)
		{
			return new Document(titleText);
		},
		a: function (href, text)
		{
			return new Anchor(href, text);
		},
		abbr: function ()
		{
			return new Element('abbr');
		},
		address: function (text)
		{
			var element = new Element('address');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		area: function ()
		{
			return new Element('area');
		},
		article: function ()
		{
			return new Element('article');
		},
		aside: function ()
		{
			return new Element('aside');
		},
		audio: function ()
		{
			return new Element('audio');
		},
		b: function (text)
		{
			var element = new Element('b');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		base: function ()
		{
			return new Element('base');
		},
		bdi: function ()
		{
			return new Element('bdi');
		},
		bdo: function ()
		{
			return new Element('bdo');
		},
		blockquote: function ()
		{
			return new Element('blockquote');
		},
		body: function ()
		{
			return new Element('body');
		},
		br: function ()
		{
			return new Element('br');
		},
		canvas: function ()
		{
			return new Element('canvas');
		},
		caption: function (text)
		{
			var element = new Element('caption');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		cite: function (text)
		{
			var element = new Element('cite');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		code: function ()
		{
			return new Element('code');
		},
		col: function ()
		{
			return new Element('col');
		},
		colgroup: function ()
		{
			return new Element('colgroup');
		},
		command: function ()
		{
			return new Element('command');
		},
		datalist: function ()
		{
			return new Element('datalist');
		},
		dd: function ()
		{
			return new Element('dd');
		},
		del: function ()
		{
			return new Element('del');
		},
		details: function ()
		{
			return new Element('details');
		},
		dfn: function ()
		{
			return new Element('dfn');
		},
		dialog: function ()
		{
			return new Element('dialog');
		},
		div: function ()
		{
			return new Element('div');
		},
		dl: function ()
		{
			return new Element('dl');
		},
		dt: function ()
		{
			return new Element('dt');
		},
		em: function (text)
		{
			var element = new Element('em');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		embed: function ()
		{
			return new Element('embed');
		},
		fieldset: function ()
		{
			return new Element('fieldset');
		},
		figcaption: function (text)
		{
			var element = new Element('figcaption');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		figure: function ()
		{
			return new Element('figure');
		},
		footer: function ()
		{
			return new Element('footer');
		},
		form: function ()
		{
			return new Element('form');
		},
		h1: function (text)
		{
			var element = new Element('h1');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		h2: function (text)
		{
			var element = new Element('h2');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		h3: function (text)
		{
			var element = new Element('h3');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		h4: function (text)
		{
			var element = new Element('h4');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		h5: function (text)
		{
			var element = new Element('h5');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		h6: function (text)
		{
			var element = new Element('h6');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		head: function (titleText)
		{
			return new Head(titleText);
		},
		header: function ()
		{
			return new Element('header');
		},
		hgroup: function ()
		{
			return new Element('hgroup');
		},
		hr: function ()
		{
			return new Element('hr');
		},
		i: function (text)
		{
			var element = new Element('i');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		iframe: function (src)
		{
			var element = new Element('iframe');
			if(src)
			{
				element.attributes.src = src;
			}
			return element;
		},
		img: function (src, alt)
		{
			return new Image(src, alt);
		},
		input: function ()
		{
			return new Element('input');
		},
		ins: function (text)
		{
			var element = new Element('ins');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		kbd: function ()
		{
			return new Element('kbd');
		},
		keygen: function ()
		{
			return new Element('keygen');
		},
		label: function ()
		{
			return new Element('label');
		},
		legend: function ()
		{
			return new Element('legend');
		},
		li: function ()
		{
			return new Element('li');
		},
		link: function (rel, type, href)
		{
			return new Link(rel, type, href);
		},
		map: function ()
		{
			return new Element('map');
		},
		mark: function ()
		{
			return new Element('mark');
		},
		menu: function ()
		{
			return new Element('menu');
		},
		meta: function ()
		{
			return new Element('meta');
		},
		meter: function ()
		{
			return new Element('meter');
		},
		nav: function ()
		{
			return new Element('nav');
		},
		noscript: function ()
		{
			return new Element('noscript');
		},
		object: function ()
		{
			return new Element('object');
		},
		ol: function ()
		{
			return new Element('ol');
		},
		optgroup: function ()
		{
			return new Element('optgroup');
		},
		option: function ()
		{
			return new Element('option');
		},
		output: function ()
		{
			return new Element('output');
		},
		p: function (text)
		{
			var element = new Element('p');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		param: function ()
		{
			return new Element('param');
		},
		pre: function ()
		{
			return new Element('pre');
		},
		progress: function ()
		{
			return new Element('progress');
		},
		q: function ()
		{
			return new Element('q');
		},
		rp: function ()
		{
			return new Element('rp');
		},
		rt: function ()
		{
			return new Element('rt');
		},
		ruby: function ()
		{
			return new Element('ruby');
		},
		s: function (text)
		{
			var element = new Element('s');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		samp: function ()
		{
			return new Element('samp');
		},
		script: function (type, src)
		{
			return new Script(type, src);
		},
		section: function ()
		{
			return new Element('section');
		},
		select: function ()
		{
			return new Element('select');
		},
		small: function (text)
		{
			var element = new Element('small');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		source: function ()
		{
			return new Element('source');
		},
		span: function (text)
		{
			var element = new Element('span');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		strong: function ()
		{
			return new Element('strong');
		},
		style: function ()
		{
			return new Element('style');
		},
		sub: function ()
		{
			return new Element('sub');
		},
		summary: function ()
		{
			return new Element('summary');
		},
		sup: function (text)
		{
			var element = new Element('sup');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		table: function ()
		{
			return new Element('table');
		},
		tbody: function ()
		{
			return new Element('tbody');
		},
		td: function ()
		{
			return new Element('td');
		},
		textarea: function ()
		{
			return new Element('textarea');
		},
		tfoot: function ()
		{
			return new Element('tfoot');
		},
		th: function ()
		{
			return new Element('th');
		},
		thead: function ()
		{
			return new Element('thead');
		},
		time: function ()
		{
			return new Element('time');
		},
		title: function (titleText)
		{
			return new Title(titleText);
		},
		tr: function ()
		{
			return new Element('tr');
		},
		track: function ()
		{
			return new Element('track');
		},
		u: function (text)
		{
			var element = new Element('u');
			if (text)
			{
				element.textContent = text;
			}
			return element;
		},
		ul: function ()
		{
			return new Element('ul');
		},
		variable: function ()
		{
			return new Element('var');
		},
		video: function ()
		{
			return new Element('video');
		},
		wbr: function ()
		{
			return new Element('wbr');
		}

	};


} ());

module.exports = jinjupHtmlControls;


