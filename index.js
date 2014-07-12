/*
jinjup-html-controls v0.0.4
jinjup.com 
Copyright (c) 2013-2014 Jon Camuso <jcamuso@exechos.com>
MIT Licensed
*/


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

	}

	Element.prototype = new tempNode();
	Element.prototype.constructor = Element;

	// A void Element is an element whose content model never allows it 
	// to have contents under any circumstances.  Void elements only have
	// a start tag; end tags must not be specified for void elements.
	//
	Element.prototype.isVoid = function ()
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

	Element.prototype.setAttribute = function (name, value)
	{
		if (!this.attributes)
		{
			this.attributes = {};
		}
		this.attributes[name] = value;
	}
	Element.prototype.removeAttribute = function (name)
	{
		if (this.attributes)
		{
			delete this.attributes[name];
		}
	}

	Element.prototype.getElementById = function (searchId)
	{
		var element = null;
		var child = null;

		if ('attributes' in this
		&& 'id' in this.attributes
		&& this.attributes.id === searchId)
		{
			element = this;
		}
		else if ('childNodes' in this)
		{
			for (var index = 0; index < this.childNodes.length; ++index)
			{
				child = this.childNodes[index];
				if ('getElementById' in child
					&& (element = child.getElementById(searchId)) != null)
				{
					break;
				}
			}
		}
		return element;
	}

	Element.prototype.buildElementsByTagName = function (tagName, elements)
	{
		if ('childNodes' in this)
		{
			for (var index = 0; index < this.childNodes.length; ++index)
			{
				child = this.childNodes[index];

				if (child instanceof Element)
				{
					if (child.tagName === tagName)
					{
						console.log('Match on ' + tagName + ' [' + index + ']');
						elements.push(child);
					}
					else
					{
						console.log('tagName ' + tagName + ' does not match ' + child.tagName + ' [' + index + ']');
					}
					if (child.buildElementsByTagName)
					{
						child.buildElementsByTagName(tagName, elements);
					}
					else
					{
						console.log('error no buildElementsByTagName [' + index + ']');
					}
				}
				else
				{
					console.log(' no tagName for nodeType ' + child.nodeType + ' [' + index + ']');
				}
			}
		}
	}

	Element.prototype.getElementsByTagName = function (tagName)
	{
		var elements = [];
		var child = null;

		if (this.tagName
		&& this.tagName === tagName)
		{
			elements.push(this);
		}
		else
		{
			console.log('tagName ' + tagName + ' does not match ' + this.tagName);
		}

		if (this.buildElementsByTagName)
		{
			this.buildElementsByTagName(tagName, elements);
		}
		else
		{
			console.log('no buildElementsByTagName');
		}

		return elements;
	}
	Element.prototype.appendChild = function (child)
	{
		if (child instanceof TextNode
		|| child instanceof Element)
		{
			this.childNodes.push(child);
		}
	}
	Element.prototype.insertBefore = function (newNode, existingNode)
	{
		if (newNode instanceof TextNode
		|| newNode instanceof Element)
		{
			var length = this.childNodes.length;
			if (length && existingNode)
			{
				var child;
				for (var index = 0; index < length; ++index)
				{
					child = this.childNodes[index];
					if (Object.is(child, existingNode))
					{
						this.childNodes.splice(index, 0, newNode);
						break;
					}
				}
			}
			else
			{
				this.childNodes.push(newNode);
			}
		}
	}
	Element.prototype.removeChild = function (child)
	{
		if (this.childNodes)
		{
			var length = this.childNodes.length;

			var item;
			for (var index = 0; index < length; ++index)
			{
				item = this.childNodes[index];

				if (child.outerHtml === item.outerHtml)
				{
					this.childNodes.splice(index, 1);
					break;
				}
			}
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

	function Document(titleText, declaration)
	{
		if (!declaration)
		{
			declaration = 'html';
		}
		this.declaration = declaration;
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
			var body = null;
			if (this.html)
			{
				if (this.html.body)
				{
					body = this.html.body;
				}
				/*
				else if (this.html.getElementsByTagName)
				{
				console.log('found getElementsByTagName');

				var elements = this.html.getElementsByTagName('body');

				this.html.body = elements.length > 0 ? elements[0] : null;
				body = this.html.body;
				}
				else
				{
				console.log('no getElementsByTagName');
				}
				*/
			}
			return body;
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
		if (type)
		{
			this.attributes.type = type;
		}
		if (src)
		{
			this.attributes.src = src;
		}
	}
	Script.prototype = new tempElement();
	Script.prototype.constructor = Script;

	function Image(src, alt)
	{
		Element.call(this, 'img');
		if (!alt)
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

	function Input(type, name, value, disabled, readonly, placeholder)
	{
		Element.call(this, 'input');
		if (typeof type === 'string')
		{
			this.attributes.type = type;
		}
		if (typeof name === 'string')
		{
			this.attributes.name = name;
		}
		if (typeof value === 'string')
		{
			this.attributes.value = value;
		}
		if (typeof disabled === 'string')
		{
			this.attributes.disabled = disabled;
		}
		if (typeof readonly === 'string')
		{
			this.attributes.readonly = readonly;
		}
		if (typeof placeholder === 'string')
		{
			this.attributes.placeholder = placeholder;
		}
	}
	Input.prototype = new tempElement();
	Input.prototype.constructor = Input;

	var tempInput = function () { };
	tempInput.prototype = Input.prototype;

	function InputButton(name, value, disabled, readonly)
	{
		Input.call(this, 'button', name, value, disabled, readonly);
	}
	InputButton.prototype = new tempInput();
	InputButton.prototype.constructor = InputButton;

	function InputCheckbox(name, value, disabled, readonly)
	{
		Input.call(this, 'checkbox', name, value, disabled, readonly);
	}
	InputCheckbox.prototype = new tempInput();
	InputCheckbox.prototype.constructor = InputCheckbox;

	function InputColor(name, value, disabled, readonly)
	{
		Input.call(this, 'color', name, value, disabled, readonly);
	}
	InputColor.prototype = new tempInput();
	InputColor.prototype.constructor = InputColor;

	function InputDate(name, value, disabled, readonly)
	{
		Input.call(this, 'date', name, value, disabled, readonly);
	}
	InputDate.prototype = new tempInput();
	InputDate.prototype.constructor = InputDate;

	function InputDatetime(name, value, disabled, readonly)
	{
		Input.call(this, 'datetime', name, value, disabled, readonly);
	}
	InputDatetime.prototype = new tempInput();
	InputDatetime.prototype.constructor = InputDatetime;

	function InputDatetimeLocal(name, value, disabled, readonly)
	{
		Input.call(this, 'datetime-local', name, value, disabled, readonly);
	}
	InputDatetimeLocal.prototype = new tempInput();
	InputDatetimeLocal.prototype.constructor = InputDatetimeLocal;

	function InputEmail(name, value, disabled, readonly)
	{
		Input.call(this, 'email', name, value, disabled, readonly);
	}
	InputEmail.prototype = new tempInput();
	InputEmail.prototype.constructor = InputEmail;

	function InputFile(name, value, disabled, readonly)
	{
		Input.call(this, 'file', name, value, disabled, readonly);
	}
	InputFile.prototype = new tempInput();
	InputFile.prototype.constructor = InputFile;

	function InputHidden(name, value, disabled, readonly)
	{
		Input.call(this, 'hidden', name, value, disabled, readonly);
	}
	InputHidden.prototype = new tempInput();
	InputHidden.prototype.constructor = InputHidden;

	function InputImage(name, value, disabled, readonly)
	{
		Input.call(this, 'image', name, value, disabled, readonly);
	}
	InputImage.prototype = new tempInput();
	InputImage.prototype.constructor = InputImage;

	function InputMonth(name, value, disabled, readonly)
	{
		Input.call(this, 'month', name, value, disabled, readonly);
	}
	InputMonth.prototype = new tempInput();
	InputMonth.prototype.constructor = InputMonth;

	function InputNumber(name, value, disabled, readonly)
	{
		Input.call(this, 'number', name, value, disabled, readonly);
	}
	InputNumber.prototype = new tempInput();
	InputNumber.prototype.constructor = InputNumber;

	function InputPassword(name, value, disabled, readonly)
	{
		Input.call(this, 'password', name, value, disabled, readonly);
	}
	InputPassword.prototype = new tempInput();
	InputPassword.prototype.constructor = InputPassword;

	function InputRadio(name, value, disabled, readonly)
	{
		Input.call(this, 'radio', name, value, disabled, readonly);
	}
	InputRadio.prototype = new tempInput();
	InputRadio.prototype.constructor = InputRadio;

	function InputRange(name, value, disabled, readonly)
	{
		Input.call(this, 'range', name, value, disabled, readonly);
	}
	InputRange.prototype = new tempInput();
	InputRange.prototype.constructor = InputRange;

	function InputReset(name, value, disabled, readonly)
	{
		Input.call(this, 'reset', name, value, disabled, readonly);
	}
	InputReset.prototype = new tempInput();
	InputReset.prototype.constructor = InputReset;

	function InputSearch(name, value, disabled, readonly)
	{
		Input.call(this, 'search', name, value, disabled, readonly);
	}
	InputSearch.prototype = new tempInput();
	InputSearch.prototype.constructor = InputSearch;

	function InputSubmit(name, value, disabled, readonly)
	{
		Input.call(this, 'submit', name, value, disabled, readonly);
	}
	InputSubmit.prototype = new tempInput();
	InputSubmit.prototype.constructor = InputSubmit;

	function InputTel(name, value, disabled, readonly)
	{
		Input.call(this, 'tel', name, value, disabled, readonly);
	}
	InputTel.prototype = new tempInput();
	InputTel.prototype.constructor = InputTel;

	function InputText(name, value, disabled, readonly, placeholder)
	{
		Input.call(this, 'text', name, value, disabled, readonly, placeholder);
	}
	InputText.prototype = new tempInput();
	InputText.prototype.constructor = InputText;

	function InputTime(name, value, disabled, readonly)
	{
		Input.call(this, 'time', name, value, disabled, readonly);
	}
	InputTime.prototype = new tempInput();
	InputTime.prototype.constructor = InputTime;

	function InputUrl(name, value, disabled, readonly)
	{
		Input.call(this, 'url', name, value, disabled, readonly);
	}
	InputUrl.prototype = new tempInput();
	InputUrl.prototype.constructor = InputUrl;

	function InputWeek(name, value, disabled, readonly)
	{
		Input.call(this, 'week', name, value, disabled, readonly);
	}
	InputWeek.prototype = new tempInput();
	InputWeek.prototype.constructor = InputWeek;


	return {
		TextNode: TextNode,
		Element: Element,
		Title: Title,
		Head: Head,
		Html: Html,
		Document: Document,
		Link: Link,
		Script: Script,
		Image: Image,
		Anchor: Anchor,
		Input: Input,

		create: function (json)
		{
			var result = null;
			var jsonObject = null;
			if (typeof json === 'string')
			{
				json = JSON.parse(json);
			}
			if (typeof json === 'object')
			{
				if (json.nodeType === 'element')
				{
					if (json.tagName === 'html')
					{
						result = this.html('');
						result.childNodes = [];
					}
					else if (json.tagName === 'head')
					{
						result = this.head();
						result.childNodes = [];
					}
					else if (json.tagName === 'title')
					{
						result = this.title();
					}
					else
					{
						result = this.createElement(json.tagName);
					}
					if ('attributes' in json)
					{
						for (name in json.attributes)
						{
							result.setAttribute(name, json.attributes[name]);
						}
					}
					var length = json.childNodes.length;
					for (var index = 0; index < length; ++index)
					{
						var child = this.create(json.childNodes[index]);
						result.appendChild(child);
					}
				}
				if (json.nodeType === "text")
				{
					result = this.createTextNode(json.nodeValue);
				}
				else if ('html' in json)
				{
					var jsonDeclaration = null;
					if ('declaration' in json)
					{
						jsonDeclaration = json.declaration;
					}
					result = this.document('', jsonDeclaration);
					result.html = this.create(json.html);
				}
			}
			return result;
		},

		createElement: function (tagName)
		{
			return new Element(tagName);
		},
		createTextNode: function (text)
		{
			return new TextNode(text);
		},
		document: function (titleText, declaration)
		{
			return new Document(titleText, declaration);
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
		html: function (titleText)
		{
			return new Html(titleText);
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
			if (src)
			{
				element.attributes.src = src;
			}
			return element;
		},
		img: function (src, alt)
		{
			return new Image(src, alt);
		},

		input: function (type, name, value, disabled, readonly, placeholder)
		{
			return new Input(type, name, value, disabled, readonly, placeholder);
		},

		button: function (name, value, disabled, readonly, placeholder)
		{
			return new InputButton(name, value, disabled, readonly, placeholder);
		},

		checkbox: function (name, value, disabled, readonly, placeholder)
		{
			return new InputCheckbox(name, value, disabled, readonly, placeholder);
		},

		color: function (name, value, disabled, readonly, placeholder)
		{
			return new InputColor(name, value, disabled, readonly, placeholder);
		},

		date: function (name, value, disabled, readonly, placeholder)
		{
			return new InputDate(name, value, disabled, readonly, placeholder);
		},

		datetime: function (name, value, disabled, readonly, placeholder)
		{
			return new InputDatetime(name, value, disabled, readonly, placeholder);
		},

		datetimeLocal: function (name, value, disabled, readonly, placeholder)
		{
			return new InputDatetimeLocal(name, value, disabled, readonly, placeholder);
		},

		email: function (name, value, disabled, readonly, placeholder)
		{
			return new InputEmail(name, value, disabled, readonly, placeholder);
		},

		file: function (name, value, disabled, readonly, placeholder)
		{
			return new InputFile(name, value, disabled, readonly, placeholder);
		},

		hidden: function (name, value, disabled, readonly, placeholder)
		{
			return new InputHidden(name, value, disabled, readonly, placeholder);
		},

		image: function (name, value, disabled, readonly, placeholder)
		{
			return new InputImage(name, value, disabled, readonly, placeholder);
		},

		month: function (name, value, disabled, readonly, placeholder)
		{
			return new InputMonth(name, value, disabled, readonly, placeholder);
		},

		number: function (name, value, disabled, readonly, placeholder)
		{
			return new InputNumber(name, value, disabled, readonly, placeholder);
		},

		password: function (name, value, disabled, readonly, placeholder)
		{
			return new InputPassword(name, value, disabled, readonly, placeholder);
		},

		radio: function (name, value, disabled, readonly, placeholder)
		{
			return new InputRadio(name, value, disabled, readonly, placeholder);
		},

		range: function (name, value, disabled, readonly, placeholder)
		{
			return new InputRange(name, value, disabled, readonly, placeholder);
		},

		reset: function (name, value, disabled, readonly), placeholder
		{
			return new InputReset(name, value, disabled, readonly, placeholder);
		},

		search: function (name, value, disabled, readonly, placeholder)
		{
			return new InputSearch(name, value, disabled, readonly, placeholder);
		},

		submit: function (name, value, disabled, readonly, placeholder)
		{
			return new InputSubmit(name, value, disabled, readonly, placeholder);
		},

		tel: function (name, value, disabled, readonly, placeholder)
		{
			return new InputTel(name, value, disabled, readonly, placeholder);
		},

		text: function (name, value, disabled, readonly, placeholder)
		{
			return new InputText(name, value, disabled, readonly, placeholder);
		},

		time: function (name, value, disabled, readonly, placeholder)
		{
			return new InputTime(name, value, disabled, readonly, placeholder);
		},

		url: function (name, value, disabled, readonly, placeholder)
		{
			return new InputUrl(name, value, disabled, readonly, placeholder);
		},

		week: function (name, value, disabled, readonly, placeholder)
		{
			return new InputWeek(name, value, disabled, readonly, placeholder);
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
		label: function (text)
		{
			var element = new Element('label');
			if (text)
			{
				element.textContent = text;
			}
			return element;
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

