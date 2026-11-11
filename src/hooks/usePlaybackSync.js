import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { loadYouTubeApi } from '../lib/youtube'
import { serverNow } from '../lib/serverClock'

const DRIFT = 1.5 // seconds of drift tolerated before we hard-seek
const ECHO = 1.2 // a local event within this of the shared state is not a "user action"

/**
 * One Firestore doc (rooms/{code}/meta/playback) is the single source of truth:
 *   { videoId, state: 'playing'|'paused', position, updatedAt (server), updatedBy }
 * Live position = position + (serverNow - updatedAt) while playing.
 * Local player events become writes; remote writes become player commands.
 * Volume is intentionally local, since nobody wants a stranger changing their speakers.
 */
export function usePlaybackSync(code, user, enabled) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const readyRef = useRef(false)
  const pbRef = useRef(null)
  const loadedVideo = useRef(null)
  const suppressUntil = useRef(0)
  const [playback, setPlayback] = useState(null)
  const [ready, setReady] = useState(false)

  const expected = (pb) => {
    if (!pb) return 0
    if (pb.state === 'playing' && pb.updatedAt) {
      return pb.position + Math.max(0, serverNow() - pb.updatedAt.toMillis()) / 1000
    }
    return pb.position
  }

  const apply = (pb) => {
    const p = playerRef.current
    if (!p || !readyRef.current || !pb?.videoId) return
    suppressUntil.current = Date.now() + 900
    const target = expected(pb)

    if (loadedVideo.current !== pb.videoId) {
      loadedVideo.current = pb.videoId
      const args = { videoId: pb.videoId, startSeconds: target }
      if (pb.state === 'playing') p.loadVideoById(args)
      else p.cueVideoById({ videoId: pb.videoId, startSeconds: pb.position })
      return
    }

    const cur = p.getCurrentTime?.() ?? 0
    const st = p.getPlayerState?.()
    if (pb.state === 'playing') {
      if (Math.abs(cur - target) > DRIFT) p.seekTo(target, true)
      if (st !== 1 && st !== 3) p.playVideo()
    } else {
      if (Math.abs(cur - pb.position) > 0.5) p.seekTo(pb.position, true)
      if (st === 1 || st === 3) p.pauseVideo()
    }
  }

  const push = useCallback(
    (next) =>
      setDoc(doc(db, 'rooms', code, 'meta', 'playback'), {
        videoId: pbRef.current?.videoId ?? null,
        ...next,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      }).catch((e) => console.warn('playback write failed', e)),
    [code, user.uid],
  )

  // 1. Listen to shared state
  useEffect(() => {
    if (!code) return
    return onSnapshot(
      doc(db, 'rooms', code, 'meta', 'playback'),
      (snap) => {
        if (!snap.exists() || snap.metadata.hasPendingWrites) return
        const pb = snap.data()
        if (!pb.updatedAt) return
        pbRef.current = pb
        setPlayback(pb)
        apply(pb)
      },
      () => {},
    )
  }, [code])

  // 2. Create the YouTube player once the user has taken a seat
  useEffect(() => {
    if (!code || !enabled) return
    let dead = false

    loadYouTubeApi().then((YT) => {
      if (dead || !containerRef.current) return
      const mount = document.createElement('div')
      containerRef.current.appendChild(mount)

      playerRef.current = new YT.Player(mount, {
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, playsinline: 1, modestbranding: 1, origin: window.location.origin },
        events: {
          onReady: () => {
            readyRef.current = true
            setReady(true)
            apply(pbRef.current)
          },
          onStateChange: (e) => {
            if (Date.now() < suppressUntil.current) return
            if (e.data !== 1 && e.data !== 2) return // only PLAYING / PAUSED
            const p = playerRef.current
            const pb = pbRef.current
            const cur = p.getCurrentTime()
            const want = e.data === 1 ? 'playing' : 'paused'
            // If this matches shared state, it's an echo of a remote command.
            if (pb && pb.state === want && Math.abs(cur - expected(pb)) < ECHO) return
            push({ state: want, position: cur })
          },
        },
      })
    })

    // Drift correction: handles buffering, tab throttling and slow devices.
    const timer = setInterval(() => {
      const p = playerRef.current
      const pb = pbRef.current
      if (!p || !readyRef.current || !pb || pb.state !== 'playing' || p.getPlayerState() !== 1) return
      const target = expected(pb)
      if (Math.abs(p.getCurrentTime() - target) > DRIFT) {
        suppressUntil.current = Date.now() + 900
        p.seekTo(target, true)
      }
    }, 3000)

    return () => {
      dead = true
      clearInterval(timer)
      readyRef.current = false
      loadedVideo.current = null
      setReady(false)
      try {
        playerRef.current?.destroy()
      } catch {
        /* already gone */
      }
      playerRef.current = null
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [code, enabled])

  const setVideo = useCallback(
    (videoId) => push({ videoId, state: 'playing', position: 0 }),
    [push],
  )

  return { containerRef, playback, ready, setVideo }
}
