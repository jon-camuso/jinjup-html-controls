## The Server Side of jinjup

A JavaScript module for node.js that contains classes for programatic creation of HTML objects that are easily convertable to HTML and JSON.

## Example

Require jinjup HTML Controls in your Node.js application

	var jjHtml = require('jinjup-html-controls');


```js

	self.app.get('/*', function(req, res){

		var document = jjHtml.document('Website Title');
			
		res.send(document.outerHtml);
	});

```

## Classes


Currently supported class constructors are listed below.
Subclass these to create your own custom implementations

```js

	TextNode(text)

	Element(tagName)
	
	Title(titleText)

	Html(titleText)

	Head(titleText)

	Html(titleText)
	
	Document(titleText, declaration)
	
	Link(rel, type, href)
	
	Script(type, src)

	Image(src, alt)

	Anchor(href, text)

```

## Methods

Ofcourse the standard creation methods are supported 

```js

	createElement(tagName)

	createTextNode(text)

```

Methods also exist for more semantic object creation:

```js

	var div = jjHtml.div();
	div.attributes.class = 'content-div';


	var anchor = jjHtml.a('www.domain.com/about', 'about');
	var nav = jjHtml.nav();
	nav.appendChild(anchor);


	var article = jjHtml.article();
	article.appendChild(jjHtml.h2('Article Title'));
	article.appendChild(jjHtml.p('Paragraph one is the first paragraph of this article.')):
	article.appendChild(jjHtml.p('Paragraph two is the second paragraph of this article.')):

```


## More Examples

Comming soon...