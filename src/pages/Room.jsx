import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRoom } from '../hooks/useRoom'
import { usePresence } from '../hooks/usePresence'
import { useChat } from '../hooks/useChat'
import { usePlaybackSync } from '../hooks/usePlaybackSync'
import { useReactions } from '../hooks/useReactions'
import { deleteRoom, kickUser } from '../lib/rooms'
import { normalizeCode } from '../lib/roomCode'
import Logo from '../components/Logo'
import Curtain from '../components/Curtain'
import { FullScreenLoader } from '../components/ProtectedRoute'
import { ReactionBar, Screen, UrlBar } from '../components/room/VideoStage'
import ChatPanel from '../components/room/ChatPanel'
import PeoplePanel from '../components/room/PeoplePanel'
import RoomNotice from '../components/room/RoomNotice'

export default function Room() {
  const code = normalizeCode(useParams().code)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { status, room } = useRoom(code, user)
  const ok = status === 'ok'
  const live = ok ? code : null

  const [seated, setSeated] = useState(false)
  const [tab, setTab] = useState('chat')
  const [copied, setCopied] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  const sync = usePlaybackSync(live, user, ok && seated)
  const { messages, send } = useChat(live, user)
  const people = usePresence(live, user)
  const { floaters, react } = useReactions(live, user)

  if (status === 'loading') return <FullScreenLoader label="Finding your seat" />
  if (!ok) {
    return (
      <>
        <header className="border-b border-ink-700 px-6 py-4"><Logo to="/lobby" /></header>
        <RoomNotice kind={status} />
      </>
    )
  }

  const isHost = room.hostId === user.uid

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${code}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  const closeRoom = async () => {
    if (!confirmClose) return setConfirmClose(true)
    try {
      await deleteRoom(code, user.uid)
    } catch (e) {
      console.error(e)
    }
    navigate('/lobby')
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Curtain open={seated} onOpen={() => setSeated(true)} />

      <header className="flex items-center justify-between gap-4 border-b border-ink-700 px-4 py-3 sm:px-6">
        <Logo to="/lobby" size="text-xl" />
        <div className="flex items-center gap-4">
          <button
            onClick={copy}
            className="flex items-center gap-3 border border-ink-600 px-3 py-1.5 transition-colors hover:border-brass"
            title="Copy invite link"
          >
            <span className="eyebrow !text-[10px]">{copied ? 'Link copied' : 'Code'}</span>
            <span className="font-mono text-sm tracking-[0.18em]">{code}</span>
          </button>
          {isHost ? (
            <button onClick={closeRoom} onBlur={() => setConfirmClose(false)} className={`eyebrow ${confirmClose ? '!text-ember' : 'hover:!text-ember'}`}>
              {confirmClose ? 'Click again to close' : 'Close room'}
            </button>
          ) : (
            <Link to="/lobby" className="eyebrow hover:!text-paper">Leave</Link>
          )}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-6">
          <Screen containerRef={sync.containerRef} playback={sync.playback} ready={sync.ready} floaters={floaters} />
          <UrlBar onSubmit={sync.setVideo} />
          <ReactionBar onReact={react} />
        </section>

        <aside className="flex h-[70dvh] min-h-0 flex-col border border-ink-700 bg-ink-900 lg:h-[calc(100dvh-7.5rem)]">
          <div className="flex border-b border-ink-700">
            {[
              ['chat', 'Chat'],
              ['people', `In the room · ${people.length}`],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`eyebrow flex-1 border-b-2 py-3.5 transition-colors ${tab === id ? '!text-paper border-ember' : 'border-transparent hover:!text-paper'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            {tab === 'chat' ? (
              <ChatPanel messages={messages} send={send} uid={user.uid} />
            ) : (
              <PeoplePanel
                people={people}
                hostId={room.hostId}
                uid={user.uid}
                isHost={isHost}
                onKick={(uid) => kickUser(code, uid).catch(console.error)}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
