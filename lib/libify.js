#!/usr/bin/env node

// Import required node packages
const { exec } = require('child_process');
const { tmpdir } = require('os');
const { mkdtempSync, existsSync, writeFileSync} = require('fs');

// Import webpack
const webpack = require('webpack');

// Extract the arguments
const args = process.argv.slice(2);

// Extract whether there is a debug flag
const debug = (args.length > 0 && args.find(arg => (arg.indexOf(`-h`) == 0 || arg.indexOf(`-h`) == 1)));

// Extract whether there is a help flag
const help = (args.length == 0 || args.find(arg => (arg.indexOf(`-h`) == 0 || arg.indexOf(`-h`) == 1)));

// Extract the target flag
const target = (args.length > 1) ? args.find(arg => ~arg.indexOf(`--`)).substr(2) : 'node';

// Extract the package
const package = (!help && args.length > 0) ? args.find(arg => arg.indexOf(`-`) !== 0) : null;

// Extract the path, name and version from the package
const details = /(@[^\/]*)*(?:\/*)([^@\/]*)*(?:\@{0,1}([^\/]*))/.exec(package);

// Extract the package namespace
const namespace = (details[1]) ? details[1].substr(1) : '';

// Extract the package name
const name = (details[2]) ? details[2] : '';

// Extract the version
const version = (details[3]) ? details[3] : '';

// Define the full package scope
const fullname = (namespace.length > 0) ? `@${namespace}/${name}` : name;

// Define the output file
const output = `${[namespace, name, version].filter(v => v != '').join('-')}.js`;

// Define the temp directory
const temp = mkdtempSync(`${tmpdir()}/libify-`);

// Define the source path
const source = `${temp}/${name}-${Date.now()}.js`;

// Define the module install path
const install = `${temp}/node_modules/${fullname}`;

// Define a function for spawing processes
const execute = (command) => {
  
  // Promisify the function
  return new Promise(resolve => exec(command, { 
    
    // Configure the encoding
    encoding: 'utf8',

    // Configure the directory
    cwd: temp
  
  // Handle the output
  }, (error, stdout, stderr) => {

    // Return if the output is silent
    if (!debug) return resolve(`${error} ${stdout} ${stderr}`);

    // Log out any output
    [error, stdout, stderr].map(output => {

      // Check there is output
      if (!output) return;
      
      // Reset the logs
      process.stdout.write(`\r\x1b[0m`);

      // Clear the line
      process.stdout.clearLine();

      // Log out the output
      process.stdout.write(`\x1b[0m\x1b[2m  ${output.replace(/\n/igm, `\n  `)}`);
    });

    // Resolve once completed
    return resolve(`${error} ${stdout} ${stderr}`);
  }));
}

// Define a function for loading animations
const animate = (message, package, final) => {

  // Define the frames to use
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  // Define the index of which frame is selected
  let i = 0;

  // Define the frame
  const frame = () => frames[(i = ++i % frames.length)];

  // Create a new line for every log but the last
  if (!final) console.log();

  // Define the animated loop to run
  const animation = setInterval(() => process.stdout.write(`\r\x1b[0m\x1b[34m\x1b[2m${frame()} ${message} \x1b[1m${package}\x1b[0m\x1b[34m\x1b[2m...\x1B[?25l`), 100);

  // Return a function to stop animation
  return {

    // Stop the animation
    stop() {

      // Stop the animation
      clearInterval(animation);

      // Reset the logs
      process.stdout.write(`\r\x1b[0m`);

      // Clear the line
      process.stdout.clearLine();
    }
  }
}

// Clean up everything
const cleanup = async() => {

  // Log a message for cleanup
  const animation = animate(`Cleaning up temporary npm resources`, '', true);

  // Log out the install path
  if (debug) console.log(`\x1b[0m\x1b[2m  Removing temporary directory \x1b[1m${temp}\x1b[0m\n`);

  // Remove the source file (safe check path)
  if (~temp.indexOf(`/tmp/libify`)) await execute(`rm -rf ${temp}`);

  // Stop the animation
  animation.stop();

  // Exit the process
  process.exit(0);
}

// Define the main function
(async() => {

  // Check the CLI for a package name
  if (package) {

    // Log out the debug welcome message
    if (debug) console.log(`\n\x1b[0m\x1b[2m  Running \x1b[1mlibify.js\x1b[0m\x1b[2m version \x1b[2m\x1b[1m${require(`${__dirname}/../package.json`).version}\x1b[0m\x1b[2m in debug mode\x1b[0m\n`)

    // Log out the install path
    if (debug) console.log(`\x1b[0m\x1b[2m  Package will be temporarily installed to \x1b[1m${install}\x1b[0m`);

    // Start finding the package
    let animation = animate(`Searching for and downloading package`, package);

    // Install the npm package
    const response = await execute(`npm install ${package} --no-save`);

    // Check if there are any vulnerabilities
    if (!~response.indexOf(`found 0 vulnerabilities`) && !~response.indexOf('npm ERR')) {

      // Stop the animation
      animation.stop();

      // Count the number of vulnerabilities
      const [, vulnerabilities] = /(?:found\ )(\d+)(?:\ vulnerabilities)/igm.exec(response);

      // Log out a message about the vulnerabilities
      console.log(`\x1b[31m✘ Found ${vulnerabilities} vulnerabilites in the package \x1b[1m${package}\x1b[0m\x1b[31m and its dependencies\n\n  \x1b[0m\x1b[31m\x1b[2mPlease visit \x1b[0m\x1b[31m\x1b[1mhttps://snyk.io/vuln/search?q=${package}&type=npm\x1b[0m\x1b[31m\x1b[2m for more information\x1b[0m\n`);

      // Cleanup and exit due to the vulnerabilities
      return await cleanup();
    }

    // Check that the module exists
    if (existsSync(install)) {

      // Stop the animation
      animation.stop();

      // Log out a success message
      console.log(`\x1b[32m✔ Successfully found and downloaded the package \x1b[1m${package}\x1b[0m`);

      // Log out a message for building
      animation = animate(`Bundling the library for package`, package);

      // Log out the script source path
      if (debug) console.log(`\x1b[0m\x1b[2m  Creating temporary module entry at \x1b[1m${source}\x1b[0m\n`);

      // Create a script for exporting the module
      writeFileSync(source, `module.exports = require('${fullname}');`);

      // Log out the webpack started message
      if (debug) console.log(`\x1b[0m\x1b[2m  Begining webpacking of \x1b[1m${source}\x1b[0m\x1b[2m with target \x1b[1m${target}\x1b[0m\n`);

      // Webpack the source
      webpack({
        mode: `production`,
        target: target,
        entry: [source],
        output: {
          filename: output,
          path: process.cwd(),
          libraryTarget: `umd`,
          globalObject: `this`,
        }

      // Handle the response to webpack
      }, async(error, stats) => {

        // Stop the animation
        animation.stop();

        // Check if there are any errors
        if (error || stats.hasErrors()) {

          // Log out a message about the errors
          console.log(`\x1b[31m✘ The following errors occured when attempting to build \x1b[1m${package}\x1b[0m`);
          
          // Iterate through each of the error messages
          [error, ...stats.toJson().errors].map(message => {

            // Check there is a message
            if (!message) return;

            // Extract the message if there is one
            if (message.message) ({ message } = message);

            // Add the spacing to linebreaks
            message = message.replace(/\n/igm, `\n  `);
            
            // Log out the error messages if they aren't empty
            console.log(`\n\x1b[31m\x1b[2m  ${message}\n`);
          });

          // Cleanup and exit as there was an error
          return await cleanup();
        }

        // Log out a success message
        console.log(`\x1b[32m✔ Successfully bundled \x1b[1m${package}\x1b[0m\n`)
        console.log(`\x1b[34m\x1b[2m  Saved library bundle to \x1b[0m\x1b[34m${process.cwd()}/${output}\x1b[0m\n`);

        // Cleanup and exit
        return await cleanup();
      });

    } else {

      // Stop the animation
      animation.stop();

      // Log out a message about the failed install
      console.log(`\x1b[31m✘ Failed to find package \x1b[1m${package}\x1b[0m\x1b[31m on npm\x1b[0m\n`);

      // Cleanup and exit as the package could not be found
      return await cleanup();
    }

  } else {

    // Log out a message with help
    console.log(`\n\x1b[34m\x1b[2m\x1b[1mlibify.js\n\n  \x1b[0m\x1b[34m\x1b[2mBundle up your npm package dependencies into a single file libraries\x1b[0m`);
    console.log(`\n\x1b[34m\x1b[2m\x1b[1m  libify \x1b[0m\x1b[34m\x1b[2m[--node | --web | --webworker]\x1b[0m \x1b[34m\x1b[2mpackage\x1b[0m\n`)
  }
})();