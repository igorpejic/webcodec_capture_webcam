![image](demo.png)

## Description

This is an experiment with the novel [WebCodec API](https://developer.chrome.com/articles/webcodecs/).

This demo uses a Service worker to encode and decode the video stream coming from a web camera.
The background of the page is changed to mimic changes in the lighting of the scene.


The main code lives in src/ directory and contains:
- home.html - the main and only html file
- worker.js - Service Worker to encode and decode the video stream
- webcodecs\_capture.js - Main file with function to start the video camera capturing, toggle lighting and display the frames.


## Run locally

Will work only in Google Chrome.

Grant video camera capture permission to run this experiment.

Run a local server using either:

### Running locally using Python

```
python -m http.server
```

or

```
python -m SimpleHTTPServer 8000
```

and navigate to http://localhost:8000/src/home.html 

### Running locally using Node


```
npm install
npx http-server
```

and navigate to http://localhost:8000/src/home.html 
