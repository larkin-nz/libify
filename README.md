<p align="center"> 
  <a href="https://github.com/larkin-nz/libify" target="_blank">
    <img src="https://i.imgur.com/P6vLRDN.png">
  </a> 
</p>

<hr>

Bundle up your npm package dependencies into a single file libraries

## Why

Unfortunately, the [npm registry](https://www.npmjs.com) has the potential for some major security breaches

Most packages have a number of package dependencies that could [at any moment be exploited](https://medium.com/hackernoon/im-harvesting-credit-card-numbers-and-passwords-from-your-site-here-s-how-9a8cb347c5b5)

Someone could slip in a bit of exploititive code into any one of your package dependencies without you knowing

Next time you update your package dependencies and rebuild your code you could get fucked by some malicious code

This project was created to help reduce the number of potential vulnerabilites in code by bundling up the npm packages required by your codebase into single file libraries

Instead of installing your packages from the npm registry, you can instead libify them and import them from a local file

## Usage

[libify.js](https://github.com/larkin-nz/libify) is available through [yarn](https://yarn.pm/libify)

```bash
$ yarn global add libify
```

Alternatively (and ironically) it is also on the [npm registry](https://www.npmjs.com/package/libify):
```bash
$ npm i -g libify
```

Once installed you can now package any npm package into a library

```bash
# Bundle up the `restt` package (https://www.npmjs.com/package/restt)

$ libify restt
```

That's it, you'll now have a bundled library in you current working directory called `restt.js` 

You can now import this library file into your code instead of installing the npm package

```js
// Import restt from the library file
import { Restt } from './restt.js'

```

Check out the [tests folder](https://github.com/larkin-nz/libify/blob/master/tests) for example usage

## Options

#### Build target

Define the webpack build target to use:

* `--node`      - builds the library for a nodejs environment (default)
* `--web`       - builds the library for a web browser environmet
* `--webworker` - builds the library for a web / edge worker environment

```bash
# Example usage of building 'restt' for a web browser environment

libify --web restt
```

## Security

While this package aims to help reduce the risks of the npm registry it cannot guarantee anything

This utility relies on [webpack](https://webpack.js.org) and there's always a chance that webpack could be exploited (however unlikely it may be)

Bundling will be prevented from occuring if any vulnerabilities are found in the package or any of its dependencies

Always be sure to check the code of your bundled libraries for anything suspicious

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, Daniel Larkin
