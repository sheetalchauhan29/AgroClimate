  const tips = [
  "Use mulch to retain soil moisture during dry seasons.",
  "Plant nitrogen-fixing crops like legumes after cereals.",
  "Harvest rainwater for irrigation in dry months.",
  "Use weather forecasts to plan sowing dates.",
  "Rotate crops to reduce pest build-up.",
  "Use drought-tolerant seed varieties when needed.",
  "Add compost to improve soil health.",
  "Avoid burning crop residue — compost it instead.",
  "Intercrop to maximize land use and reduce risk.",
  "Use drip irrigation to conserve water.",
  "Monitor for pests regularly using traps.",
  "Use cover crops to prevent erosion in off-seasons."
];

let currentIndex = 0;
const tipsContainer = document.getElementById("quick-tips-container");

function renderTips() {
  tipsContainer.innerHTML = ''; // Clear previous tips

  for (let i = 0; i < 4; i++) {
    const tipIndex = (currentIndex + i) % tips.length;
    const tipElement = document.createElement('div');
    tipElement.className = 'tip';
    tipElement.textContent = tips[tipIndex];
    tipsContainer.appendChild(tipElement);
  }

  currentIndex = (currentIndex + 4) % tips.length;
}

// Initial load
renderTips();

// Rotate every 10 seconds
setInterval(renderTips, 5000);
    
    const sendBtn = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') sendMessage();
    });

    function getTimeString() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function sendMessage() {
      const message = userInput.value.trim();
      if (!message) return;

      appendMessage('user', message);
      userInput.value = '';

      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'typing-indicator';
      typingIndicator.textContent = '...';
      typingIndicator.id = 'typing-indicator';
      chatWindow.appendChild(typingIndicator);
      chatWindow.scrollTop = chatWindow.scrollHeight;

      fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
        .then(response => response.json())
        .then(data => {
          typingIndicator.remove();
          appendMessage('bot', data.reply);
        })
        .catch(error => {
          typingIndicator.remove();
          appendMessage('bot', 'Error contacting the server.');
          console.error(error);
        });
    }

    function appendMessage(sender, text) {
      const wrapper = document.createElement('div');
      wrapper.className = `message-wrapper ${sender}`;

      const avatar = document.createElement('img');
      avatar.className = 'avatar';
      avatar.src = sender === 'user'
        ? '/static/images/farmer.png'
        : '/static/images/robot.png'; ;
      avatar.alt = sender;

      const msgDiv = document.createElement('div');
      msgDiv.className = `message ${sender}`;

      const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;
      const match = text.match(imageRegex);

      if (match) {
        const [imgUrl] = match;
        text = text.replace(imgUrl, '');
        msgDiv.textContent = text.trim();
        const img = document.createElement('img');
        img.src = imgUrl;
        msgDiv.appendChild(img);
      } else {
        msgDiv.textContent = text;
      }

      const timestamp = document.createElement('div');
      timestamp.className = 'timestamp';
      timestamp.textContent = getTimeString();

      msgDiv.appendChild(timestamp);

      if (sender === 'user') {
        wrapper.appendChild(msgDiv);
        wrapper.appendChild(avatar);
      } else {
        wrapper.appendChild(avatar);
        wrapper.appendChild(msgDiv);
      }

      chatWindow.appendChild(wrapper);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }