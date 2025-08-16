const REQUEST_TIMEOUT = 10000

async function customFetch(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const cacheBustUrl = url

    const tryFetch = (attemptsLeft, fetchMethod) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      fetch(cacheBustUrl, {
        method: fetchMethod,
        signal: controller.signal,
        headers: fetchMethod === 'GET' ? { Range: 'bytes=0-1' } : {},
      })
        .then((response) => {
          clearTimeout(timeoutId)
          if (response.status >= 200 && response.status < 300) {
            resolve({
              headers: {
                date: response.headers.get('date'),
                contentLength: response.headers.get('content-length'),
                server: response.headers.get('server'),
                age: response.headers.get('age'),
                etag: response.headers.get('etag'),
                lastModified: response.headers.get('last-modified'),
              },
            })
          } else {
            throw new Error(
              `Failed to fetch ${cacheBustUrl}: ${response.status}`
            )
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          if (attemptsLeft > 0) {
            const nextFetchMethod = fetchMethod === 'HEAD' ? 'GET' : fetchMethod
            tryFetch(attemptsLeft - 1, nextFetchMethod)
          } else {
            reject(
              new Error(`Failed to fetch after all retries: ${error.message}`)
            )
          }
        })
    }

    tryFetch(retries, 'HEAD')
  })
}


function getContentTimestamps(arr) {
  const GAP = 24 * 3600 * 1000 // in milliseconds
  if (arr.length === 0) return []

  const sorted = [...arr].sort((a, b) => a - b)

  const groups = []
  if (sorted.length > 0) {
    let currentGroup = [sorted[0]]
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] < GAP) {
        currentGroup.push(sorted[i])
      } else {
        groups.push(currentGroup)
        currentGroup = [sorted[i]]
      }
    }
    groups.push(currentGroup)
  }

  if (groups.length === 0) {
    return []
  }

  // Find the largest group
  const largestGroup = groups.reduce(
    (largest, current) => (current.length > largest.length ? current : largest),
    []
  )

  return largestGroup
}


async function process(url, playlist) {

  const discontinuityMarker = '#EXT-X-DISCONTINUITY'
  const chunks = playlist.split(discontinuityMarker)
  const firstChunk = chunks.shift() // Keep the header and first segment

  const chunkData = await Promise.all(
    chunks.map(async (chunk) => {
      const ts_urls = chunk.match(/^.*[.](ts|jpg|png|jpeg).*$/gm)
      let lastModified = null
      if (ts_urls) {
        const ts_url = ts_urls[Math.floor(Math.random() * ts_urls.length)]
        const fullurl = new URL(ts_url, url)
        try {
          const resp = await customFetch(fullurl.href)
          lastModified = Date.parse(resp.headers.lastModified)
        } catch (e) {
          console.error(e)
          lastModified = new Date(0) // Mark as failed
        }
      }
      return { chunk, lastModified }
    })
  )

  const allLastModifiedTimes = chunkData
    .map((cd) => cd.lastModified)
    .filter((t) => t !== null && t > 0)

  const contentTimestamps = getContentTimestamps(allLastModifiedTimes)

  const contentChunks = []
  for (const data of chunkData) {
    const { chunk, lastModified } = data
    let isAd = false

    const extinfs = [...chunk.matchAll(/EXTINF:\s*([0-9.]+)\s*,/gm)].map(
      (match) => match[1]
    )
    if (extinfs.length === 0) {
      contentChunks.push(chunk) // Not a media chunk, keep it.
      continue
    }
    const chunkDuration = extinfs.reduce((acc, val) => acc + parseFloat(val), 0)

    if (new Set(extinfs).size > 1) {
      isAd = true
    }


    if (!isAd) {
      contentChunks.push(chunk)
    }
  }

  let new_playlist =
    firstChunk + contentChunks.map((c) => discontinuityMarker + c).join('')

  if (playlist.includes('#EXT-X-ENDLIST')) {
    new_playlist += '\n#EXT-X-ENDLIST'
  }

  return new_playlist
}

export class pLoader {
  constructor(config) {
    this.loader = new config.loader(config)
    this.load = this.load.bind(this)
  }

  load(context, config, callbacks) {
    if (context.type === 'manifest' || context.type === 'level') {
      const originalOnSuccess = callbacks.onSuccess
      callbacks.onSuccess = (response, stats, context) => {
        process(response.url, response.data)
          .then((data) => {
            response.data = data
            originalOnSuccess(response, stats, context)
          })
          .catch((e) => {
            console.error(
              'AD REMOVER: Error processing playlist, falling back to original.',
              e
            )
            originalOnSuccess(response, stats, context)
          })
      }
    }
    this.loader.load(context, config, callbacks)
  }

  destroy() {
    this.loader.destroy()
  }
}
