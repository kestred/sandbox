passgrid.coffee
===============

### Example
http://rawgithub.com/kestred/passgrid.coffee/master/examples/basic.html

### Basic Usage
```
<script src="js/passgrid.js"></script>
<script type="text/javascript">
  var foo = PasswordGrid(6, 6);
  document.body.appendChild(foo);
  var password = foo.pattern.toHash(<hash-function>);
</script>
```

### More realistic example
```
<script src="http://codeorigin.jquery.com/jquery-2.0.3.min.js"></script>
<script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha3.js"></script>
<script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js"></script>
<script src="js/passgrid.js"></script>
<script type="text/javascript">
  var passgrid = PasswordGrid(6, 6);
  $('#form').prepend(passgrid);
  $('#form input[type="submit"]).click(function() {
    password = passgrid.pattern.toHash(CryptoJS.SHA3).toString(CryptoJS.enc.Base64);
    $.post("<domain>", { user: username, pwd: password })
  });
</script>
```
