![image](demo.png)

## Description

This is an experimentation with the novel [WebCodec API](https://developer.chrome.com/articles/webcodecs/).

This demo uses a: Service worker to encode and decode video stream coming from a web camera.
The background of the page is changed to mimic changes in lighting of the scene.


The main code lives in src/ directory and contains:
- home.html - the main and only html file
- worker.js - Service Worker to encode and decode the video stream
- webcodecs\_capture.js - Main file with function to start the video camera capturing, toggle lighting and display the frames.


## Run locally

Unfortunately, Chrome does not allow service worker communication using file:// protocol (see: https://stackoverflow.com/q/21408510), so please run a local server using either:

### Running locally using Python

```
python -m http.server
```

or

```
python -m SimpleHTTPServer 8000
```

And navigate to http://localhost:8000/src/home.html 

### Running locally using Node


```
npm install
npx http-server
```

And navigate to http://localhost:8000/src/home.html 
