<p align="center"> 
  <a href="https://github.com/larkin-nz/libify" target="_blank">
    <img src="https://i.imgur.com/P6vLRDN.png">
  </a> 
</p>

<hr>

Bundle up your npm package dependencies into a single file libraries

## The Square Root

The square root application relies on the npm package [sqrt](https://www.npmjs.com/package/sqrt)

Firstly you'll want to libify the sqrt package

```bash
# Install the package using libify

libify sqrt

# You can run alternatively 'npm run setup' for this application
```

Once this completes `sqrt` will now be bundled up in `sqrt.js`

You can now go ahead and run the application

```bash
# Start up the application

node index.js

# You can alternatively run 'npm run start' for this application
```

If everything ran correctly you should get the following output

```bash
The square root of 25 is 5
```

Congratulations, you've built your first application using libify