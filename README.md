# Neutrino Sass loader middleware

[![npm](https://img.shields.io/npm/v/neutrino-middleware-sass-loader.svg)](https://www.npmjs.com/package/neutrino-middleware-sass-loader)
[![npm](https://img.shields.io/npm/dt/neutrino-middleware-sass-loader.svg)](https://www.npmjs.com/package/neutrino-middleware-sass-loader)

`neutrino-middleware-sass-loader` is a [Neutrino](https://neutrino.js.org) middleware for compiling styles with [Dart Sass](https://sass-lang.com/dart-sass). This middleware only transforms Sass to CSS. It is recommended to have `@neutrinojs/style-loader` (or its substitution) in the configuration to be able to compile Sass styles to JavaScript modules. Both SCSS and SASS syntaxes are supported.

## Requirements

* Node.js v10.13+
* Neutrino v9

## Installation

`neutrino-middleware-sass-loader` can be installed from NPM. You should install it to `"dependencies"` (--save) or `"devDependncies"` (--save-dev) depending on your goal.

```bash
npm install --save-dev neutrino-middleware-sass-loader
```

## Usage

`neutrino-middleware-sass-loader` can be consumed from the Neutrino API, middleware, or presets.

### In preset

Require this package and plug it into Neutrino. The following shows how you can pass an options object to the middleware, showing the defaults:

```js
let sassLoader = require('neutrino-middleware-sass-loader')

neutrino.use(sassLoader({
   include: ['src', 'tests'],
   exclude: [],
   sass   : {}
}))
```

* `include`: optional array of paths to include in the compilation. Maps to Webpack's rule.include.
* `exclude`: optional array of paths to exclude from the compilation. Maps to Webpack's rule.include.
* `sass`: optional [Sass options](https://github.com/sass/dart-sass/blob/master/README.md#javascript-api) config that is passed to the loader.

It is recommended to call this middleware after the `neutrino.config.module.rule('style')` initialization to avoid unexpected overriding. More information about usage of Neutrino middlewares can be found in the [documentation](https://neutrino.js.org/middleware).

### In **neutrinorc**

The middleware also may be used together with another presets in Neutrino rc-file, e.g.:

**.neutrinorc.js**

```js
let web        = require('@neutrino/web')
let sassLoader = require('neutrino-middleware-sass-loader')

module.exports = {
   use: [
      web(),
      sassLoader()
   ]
}
```

### Imports paths

The loader can resolve paths in one of two modes: Sass or Webpack.

Webpack's resolver is used by default. To use its advantages to look up the `modules` you need to prepend `~` to the path:

```css
@import "~bootstrap/sass/bootstrap";
```

Otherwise the path will be determined as a relative URL, `@import "file"` is the same as `@import "./file"`

If you specify the `includePaths` option, the Webpack's resolver will not be used. Modules, that can't be resolved in the local folder, will be searched in the given `includePaths`. This is Sass' default behavior. `includePaths` should be an array with absolute paths:

```js
let sassLoader = require('neutrino-middleware-sass-loader')

neutrino.use(sassLoader({
   sass: {
      includePaths: [
         path.resolve(__dirname, 'node_modules')
      ]
   }
}))
```

### Importing variables from JS

SASS files can import variables from JS modules. Example:

**vars.js**

```js
module.exports = {
   'default-color': 'yellow',
   'border'       : '2px solid red'
}
```

**main.sass**

```sass
require('./vars.js');

@import "./other.sass";

.box:extend(.darkgreen) {
  color: @default-color;
  border: @border;
  width: 200px;
  height: 200px;
}
```

It is recommended to `require` all JS modules before any `@import` rules.

## Rules

This is a list of rules that are used by `neutrino-middleware-sass-loader`:

* `sass`: Compiles Sass styles to CSS styles. Contains loaders named: `resolve-url`, `sass` and `sass-var`.
* `style`: Only necessary file extension added. CSS loader should be provided to correctly compile styles to JavaScript.
