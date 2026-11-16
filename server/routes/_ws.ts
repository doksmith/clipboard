export default defineWebSocketHandler({
  open(peer) {
    // Client connected
    peer.send(JSON.stringify({ type: 'connected', peerId: peer.id }))
  },
  message(peer, message) {
    try {
      const data = JSON.parse(message.text())
      const { type, room, payload } = data

      if (type === 'join' && room) {
        peer.subscribe(room)
        peer.publish(room, JSON.stringify({
          type: 'peer:joined',
          peerId: peer.id,
          timestamp: Date.now(),
        }))
        peer.send(JSON.stringify({ type: 'joined', room }))
        return
      }

      if (type === 'leave' && room) {
        peer.unsubscribe(room)
        peer.publish(room, JSON.stringify({
          type: 'peer:left',
          peerId: peer.id,
          timestamp: Date.now(),
        }))
        return
      }

      if (type === 'clip:sync' && room) {
        // Broadcast clipboard update to everyone else in this room
        peer.publish(room, JSON.stringify({
          type: 'clip:synced',
          peerId: peer.id,
          payload,
          timestamp: Date.now(),
        }))
        return
      }

      if (type === 'cursor:move' && room) {
        peer.publish(room, JSON.stringify({
          type: 'cursor:moved',
          peerId: peer.id,
          payload,
        }))
        return
      }
    } catch {
      // Ignore invalid JSON
    }
  },
  close(peer) {
    // crossws automatically cleans up subscriptions on close
  },
  error(peer, error) {
    console.error('[WS Error]', peer.id, error)
  },
})
