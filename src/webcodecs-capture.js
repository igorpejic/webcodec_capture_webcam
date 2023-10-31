'use strict';
(function () {
  const frameWidth = 640
  const frameHeight = 480

  // Webcam hardware can be slow to start, so we will capture and ignore a few initial frames.
  const realFramePattern = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]
  const initializationPattern = [0, 0]
  const framePattern = initializationPattern.concat(realFramePattern)

  const container = document.getElementById('container')
  let worker = new Worker('worker.js')

  class Canvas2DRenderer {
    #canvas = null
    #ctx = null
    constructor (canvas) {
      this.#canvas = canvas
      this.#ctx = canvas.getContext('2d')
    }

    draw (frame) {
      this.#canvas.width = frame.displayWidth
      this.#canvas.height = frame.displayHeight
      this.#ctx.drawImage(frame, 0, 0, frame.displayWidth, frame.displayHeight)
      frame.close()
    }
  };

  const resetContainer = () => {
    // Reset the state of the container that holds images.
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
  }
  const toggleScreenColor = (frameIndex) => {
    // Toggle screen color to mimic light changing.
    const lighting = document.body
    lighting.style.background = framePattern[frameIndex] ? 'white' : 'black'
  }

  async function getCameraWithHighestResolution () {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === 'videoinput')
      if (videoDevices.length === 0) {
        console.error('No video input devices found.')
        return null
      }
      let highestResolutionCamera = videoDevices[0]
      for (let i = 1; i < videoDevices.length; i++) {
        const currentDevice = videoDevices[i]
        if (
          currentDevice.label.includes('front') ||
          currentDevice.deviceId === 'default'
        ) {
          continue
        }
        if (
          currentDevice.getCapabilities &&
          currentDevice.getCapabilities.mediaStreamTrack
        ) {
          const { width } = currentDevice.getCapabilities.mediaStreamTrack
          const highestResolutionDevice = highestResolutionCamera.getCapabilities.mediaStreamTrack

          if (width > highestResolutionDevice.width) {
            highestResolutionCamera = currentDevice
          }
        }
      }
      console.debug('Selected camera:', highestResolutionCamera.label)
      return navigator.mediaDevices.getUserMedia({ video: { deviceId: highestResolutionCamera.deviceId } })
    } catch (error) {
      console.error('Error while selecting camera:', error)
      return null
    }
  }

  const run = () => {
    resetContainer()
    // Check if WebCodecs is supported in the current browser.
    if ('VideoEncoder' in window) {
      // Select the user's front-facing camera with the best resolution.

      const captureFrames = async () => {
        const videoStream = await getCameraWithHighestResolution()
        const videoTrack = videoStream.getVideoTracks()[0]
        videoTrack.applyConstraints({ frameRate: 2 })

        let trackProcessor = new MediaStreamTrackProcessor(videoTrack)
        let frameStream = trackProcessor.readable

        // Start frame capturing
        worker.postMessage({ type: 'start', frameStream: frameStream, frameWidth: frameWidth, frameHeight: frameHeight }, [frameStream])

        // Draw the captured frames once capturing is done
        worker.addEventListener('message', (e) => {
          const framesCollected = e.data.readyFrames
          for (let i = initializationPattern.length; i < Math.min(framesCollected.length, framePattern.length); i++) {
            let frameCollected = framesCollected[i]
            const canvasElement = document.createElement('canvas')
            const renderer = new Canvas2DRenderer(canvasElement)
            canvasElement.width = frameWidth
            canvasElement.height = frameHeight
            renderer.draw(frameCollected)
            container.appendChild(canvasElement)
          }
        })

        let frameIndex = 0
        const fetchFrame = async () => {
          if (frameIndex < framePattern.length) {
            toggleScreenColor(frameIndex)
            frameIndex++
            setTimeout(() => {
              fetchFrame()
            }, 500)
          } else {
            videoTrack.stop()
            return
          }
        }
        fetchFrame()
      }
      // Start the process.
      captureFrames()
    } else {
      console.error('WebCodecs is not supported in this browser. Please use Chrome.')
    }
  }
  document.getElementById('run').addEventListener('click', run)
})()
