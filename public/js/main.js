const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let player;
let timeStart = 0;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    width: 600,
    height: 400,
    videoId: 'Dm9Zf1WYQ_A',
    playerVars: {
      color: 'white',
      //controls: 0
      // playlist: 'YR5ApYxkU-U,Tj75Arhq5ho'
    },
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  event.target.seekTo(timeStart);
  event.target.playVideo();


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});


const socket = io();

// Join chatroom
console.log("player current time", player)
socket.emit('joinRoom', { username, room});


// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);
  console.log("player", player)
  socket.emit("currentHostTime", {currentHostTime: player.getCurrentTime()})


  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('player-message', time => {
  timeStart = time;
  console.log("haiii ")
});
socket.on("currentHostTime", time=>{
  event.target.seekTo(time.currentHostTime);
  event.target.playVideo();
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
}


