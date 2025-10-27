import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const client = new OpenAI({apiKey: apiKey, dangerouslyAllowBrowser: true});
const usage_model = 'o4-mini';

const conversationHistory = [{
  role: 'system',
  content:
      'You are a professional Abilene Christian University (ACU) assistant for the College of Business Administration. You can help with academic and recruiting inquiries.'
}];

async function loadInfoFile() {
  try {
    const response = await fetch('/info.txt');
    if (!response.ok) {
      throw new Error(`Failed to load info: ${response.status}`);
    }
    const infoFile = await response.text();
    console.log('info loaded successfully');
    return infoFile;
  } catch (error) {
    console.error('Error loading info:', error);
    return '';
  }
}

const supportBtn = document.getElementById('supportBtn');
const chatWindow = document.getElementById('chatWindow');
const closeBtn = document.getElementById('closeBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const typingIndicator = document.getElementById('typingIndicator');

supportBtn.addEventListener('click', () => {
  chatWindow.classList.toggle('active');
  if (chatWindow.classList.contains('active')) {
    chatInput.focus();
  }
});

closeBtn.addEventListener('click', () => {
  chatWindow.classList.remove('active');
});

function addMessage(text, isBot = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setTyping(isTyping) {
  if (isTyping) {
    typingIndicator.classList.add('active');
  } else {
    typingIndicator.classList.remove('active');
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage(userMessage) {
  addMessage(userMessage, false);
  chatInput.value = '';
  setTyping(true);

  conversationHistory.push({role: 'user', content: userMessage});

  try {
    const response = await client.chat.completions.create(
        {model: usage_model, messages: conversationHistory, max_tokens: 500});

    setTyping(false);
    const botMessage = response.choices[0].message.content;

    conversationHistory.push({role: 'assistant', content: botMessage});

    addMessage(botMessage, true);
  } catch (error) {
    setTyping(false);
    console.error('Error:', error);
    addMessage('Sorry, I encountered an error. Please try again.', true);
  }
}

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && chatInput.value.trim()) {
    sendMessage(chatInput.value.trim());
  }
});

async function initInfoFile() {
  const infoFile = await loadInfoFile();

  if (infoFile) {
    conversationHistory[0].content =
        `You are a professional Abilene Christian University (ACU) assistant for the College of Business Administration. You can help with academic and recruiting inquiries.

Use the following knowledge base to answer questions accurately:

${infoFile}

Always provide helpful, accurate information based on the knowledge base above. If asked about something not in the knowledge base, politely say you don't have that specific information and offer to help with what you do know.`;

    console.log('AI assistant initialized with info');
  } else {
    console.log('AI assistant running without info');
  }
}

initInfoFile();
