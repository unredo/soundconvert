import { join } from 'path'

import { Decoder, Demuxer, Encoder, Muxer } from 'node-av/api'
import { FF_ENCODER_LIBOPUS, FF_ENCODER_LIBVORBIS, type FFAudioEncoder } from 'node-av/constants'

import { changeEnding } from './filename.js'

function checkCodec(): [string, FFAudioEncoder] {
  switch (process.env.CODEC) {
    case 'vorbis':
      return ['ogg', FF_ENCODER_LIBVORBIS]
    default:
      return ['ogg', FF_ENCODER_LIBOPUS]
  }
}

const [ending, codec] = checkCodec()

async function convert(outPath: string, file: string) {
  let input: Demuxer | null = null
  let decoder: Decoder | null = null
  let encoder: Encoder | null = null
  let output: Muxer | null = null

  const outFile = changeEnding(file, ending)

  try {
    input = await Demuxer.open(join(outPath, file), { format: 'wav' })
    const audio = input.audio()
    if (!audio) {
      throw new Error('No audio stream')
    }

    decoder = await Decoder.create(audio)
    encoder = await Encoder.create(codec, {
      decoder,
      autoResample: true,
      bitrate: '128k',
    })

    output = await Muxer.open(join(outPath, outFile))
    const outputIndex = output.addStream(encoder)

    for await (using packet of input.packets(outputIndex)) {
      for await (using frame of decoder.frames(packet)) {
        for await (using encFrame of encoder.packets(frame)) {
          await output.writePacket(encFrame, outputIndex)
        }
      }
    }

    return outFile
  } catch (err) {
    console.error(err)
  } finally {
    await input?.close()
    await decoder?.close()
    await encoder?.close()
    await output?.close()
  }
}

export { convert }
