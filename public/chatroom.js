document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const roomName = document.getElementById('room-name').textContent.trim();
  const username = document.getElementById('username').value;

  const socket = io();

  // Emit joinRoom event with the room name (and optionally, username)
  socket.emit('joinRoom', { room: roomName, username });

  // Function to add a message to the chat box
  function addMessage(messageData, type) {
    // If a simple string is passed, convert it into an object
    let msgData;
    msgData = messageData;

    // Create a new element for the message
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    msgDiv.innerHTML = `<p class="meta">${msgData.username} <span>${msgData.time}</span></p>
      <p class="text">${msgData.text}</p>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Listen for messages from the server
  socket.on('message', (data) => {
    addMessage(data, 'received');
  });

  // Send message on button click
  sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text) {
      // Create a message object for display
      const messageData = {
        username,
        time: new Date()
          .toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          })
          .toLowerCase(),
        text: text,
      };
      addMessage(messageData, 'sent');
      // Emit the chatMessage event with the room and text
      socket.emit('chatMessage', {
        room: roomName,
        username,
        message: messageData.text,
      });
      messageInput.value = '';
    }
  });

  // Allow sending message on Enter key press
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });
});
