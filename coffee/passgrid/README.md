passgrid.coffee
===============
### Purpose
This is a really simple library/snippet that makes it easy to include pattern-passwords on a website.
It is not dependent on any other libraries, but is compatible with jQuery and even more useful with CryptoJS.

The source is forfeited to Public Domain, or otherwise uses a modified [WTFPL License](http://www.wtfpl.net/about/).

For my purposes, work on this script is more or less over, but I would love to hear if someone else uses it [[kestred@riotcave.com](mailto:kestred@riotcave.com)], and will happily fix any reported bugs.
Also, if anyone is interested in adding UI elements like edges between selected vertices, or if anyone tries to improve touch-swipe/mouse-swipe/etc functionality then I will be around to accept pull-requests.

### Example
http://rawgithub.com/kestred/passgrid.coffee/master/examples/basic.html

### Basic Usage
```html
<script src="js/passgrid.js"></script>
<script type="text/javascript">
  var foo = PasswordGrid(6, 6);
  document.body.appendChild(foo);
  var password = foo.pattern.toHash(<hash-function>);
</script>
```

### More realistic example
```html
<script src="http://codeorigin.jquery.com/jquery-2.0.3.min.js"></script>
<script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha3.js"></script>
<script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js"></script>
<script src="js/passgrid.js"></script>
<script type="text/javascript">
  var passgrid = PasswordGrid(6, 6);
  $('#form').prepend(passgrid);
  $('#form input[type="submit"]').click(function() {
    password = passgrid.pattern.toHash(CryptoJS.SHA3).toString(CryptoJS.enc.Base64);
    $.post("<domain>", { user: username, pwd: password })
  });
</script>
```
