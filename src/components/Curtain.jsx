import { AnimatePresence, motion } from 'framer-motion'

const ease = [0.76, 0, 0.24, 1]

// Full-screen curtains that part when you take your seat. The click also gives
// the browser the user gesture it needs to allow autoplay with sound.
export default function Curtain({ open, onOpen, title = 'The house is open' }) {
  return (
    <AnimatePresence>
      {!open && (
        <motion.div className="fixed inset-0 z-50" exit={{ transition: { duration: 1.3 } }}>
          <motion.div
            className="curtain-fabric absolute inset-y-0 left-0 w-1/2 shadow-[8px_0_40px_rgba(0,0,0,0.6)]"
            initial={{ x: 0 }}
            exit={{ x: '-100%', transition: { duration: 1.3, ease } }}
          />
          <motion.div
            className="curtain-fabric absolute inset-y-0 right-0 w-1/2 shadow-[-8px_0_40px_rgba(0,0,0,0.6)]"
            initial={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 1.3, ease } }}
          />
          <motion.div
            className="relative z-10 grid h-full place-items-center px-6 text-center"
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <div>
              <p className="eyebrow !text-paper/70">Private screening</p>
              <h2 className="mt-4 font-display text-5xl italic sm:text-7xl">{title}</h2>
              <button onClick={onOpen} className="btn-ember mt-10">
                Take your seat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
