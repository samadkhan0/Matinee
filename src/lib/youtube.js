const ID = /^[\w-]{11}$/
const valid = (id) => (id && ID.test(id) ? id : null)

export function parseVideoId(input) {
  const s = (input || '').trim()
  if (!s) return null
  if (ID.test(s)) return s
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`)
    const host = u.hostname.replace(/^(www|m|music)\./, '')
    if (host === 'youtu.be') return valid(u.pathname.slice(1).split('/')[0])
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') return valid(u.searchParams.get('v'))
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{11})/)
      if (m) return m[2]
    }
  } catch {
    /* not a URL */
  }
  return null
}

let apiPromise
export function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        resolve(window.YT)
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    })
  }
  return apiPromise
}
