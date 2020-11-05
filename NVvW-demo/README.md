# NVvW Demo

This folder contains an interactive demo for the [NVvW study
day](https://nvvw.nl/jaarvergadering/jaarvergadering-studiedag-2020/). It is
hosted on <https://tcastermans.win.tue.nl/network/>, which has its own `app.js`
that calls the main `route` function from the `app.js` file in this directory.

To run the demo on your own machine, try `DEBUG=true PORT=8080 node app.js` and
then open `localhost:8080` (or use another port if you wish) in your browser.
