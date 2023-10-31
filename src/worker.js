'use strict'

let readyFrames = []
let frameReader
let encoder
let decoder
let frameCounter = 0
async function startProcessing(frameStream, frameWidth, frameHeight, postMessageCallback) {
  frameReader = frameStream.getReader()
  const config = {
    codec: 'vp8',
    width: frameWidth,
    height: frameHeight,
    framerate: 2
  }
  decoder = new VideoDecoder({
    output: (frame) => {
      readyFrames.push(frame)
    },
    error: (error) => {
      console.log(error)
    }
  })

  decoder.configure(config)

  encoder = new VideoEncoder({
    output: (chunk) => {
      decoder.decode(chunk)
    },
    error(error) {
      console.log(error)
    }
  })

  encoder.configure(config)
  frameReader.read().then(async function processFrame({ done, value }) {
    let frame = value
    if (done) {
      await decoder.flush()
      await encoder.flush()
      postMessageCallback({ readyFrames: readyFrames })
      stopProcessing()
      return
    }
    if (encoder.encodeQueueSize <= 30) {
      const insertKeyframe = (frameCounter % 150) === 0
      encoder.encode(frame, { keyFrame: insertKeyframe })
    } else {
      console.debug('dropping frame, encoder falling behind')
    }
    frameCounter++

    frame.close()
    frameReader.read().then(processFrame)
  })
  await encoder.flush()
  await decoder.flush()
}

const stopProcessing = () => {
  console.debug('Stop Webcodec and closing down decoder and encoder.')
  decoder.close()
  encoder.close()
  frameReader.cancel()
  frameReader = null
  readyFrames = []
}

self.addEventListener('message', async (e) => {
  switch (e.data.type) {
    case 'start':
      await startProcessing(e.data.frameStream, e.data.frameWidth, e.data.frameHeight, this.postMessage)
      break
    case 'stop':
      stopProcessing()
      break
  }
})
