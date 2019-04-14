// User logged in
let USERNAME_LOGGED_IN = '';

const SocketIOServer = {
    host: '127.0.0.1',
    port: 9090
}
const URLServerSocketIO = `http://${SocketIOServer.host}:${SocketIOServer.port}`

// URLsAPI
const URLsAPI = {
    namespaces: `${URLServerSocketIO}/namespaces`,
    channels: `${URLServerSocketIO}/channels`,
    messages: `${URLServerSocketIO}/messages`,
    namespacesById: `${URLServerSocketIO}/namespaces-by-id`,
    namespacesByCode: `${URLServerSocketIO}/namespaces-by-code`,
    channelsByNamespace: `${URLServerSocketIO}/channels-by-namespace`
}

// Socket.io: try to connect
let socketNSP;

// Buttons
listenersButton();

// FORMS
preventInFormsEventSubmit();

// Clicks
async function clickNamespace(e) {

    const namespaceHTML = e.target;
    // console.log('namespaceHTML', namespaceHTML);
    const idNS = namespaceHTML.dataset.namespace;
    const codeNS = namespaceHTML.dataset.code;
    // console.log('idNS', idNS);
    // console.log('code', codeNS);

    const namespacesByCode = await apiNamespacesFindByCode(codeNS);

    if (namespacesByCode.length > 0){
        // HTML
        const namespace = namespacesByCode[0];
        // console.log('namespace', namespace);

        if (namespace.channels !== undefined){
            const channels = namespace.channels;
            // console.log('channels', channels);
        
            // DOM
            const channelListHTML = document.getElementById("channels-list");
            channelListHTML.innerHTML = '';
        
            // DOM Channels
            const channelTitle = document.getElementById('channel-title');
            channelTitle.innerHTML = '';
            const listChannelByNS = document.getElementById("sidebar-column-2");
            listChannelByNS.style.display = 'block';
            // DATA
            listChannelByNS.dataset.namespace = namespace._id;
            listChannelByNS.dataset.code = namespace.code;
            // Chat
            const channelChat = document.getElementById('channel-chat');
            channelChat.innerHTML = '';
        
            // DOM Messenger
            const messenger = document.getElementById('messenger');
            messenger.style.display = 'none';
            const messengerText = document.getElementById('messenger-text');
            messengerText.value = '';
        
            channels.forEach(channel => {
                generateHTMLOneChannel(channel);
            });
        } else {
            console.log('This namespace does not have any channels....')
        }


    } else {
        console.log(`Do not exist any namespace with ${code} code...`);
    }
    
}

async function clickChannel(e){

    // CHANNEL
    const channelHTML = e.target;
    // console.log('channelHTML', channelHTML);
    const _id = channelHTML.id;
    const namespace_id = channelHTML.dataset.namespace;
    const codeNS = channelHTML.dataset.namespaceCode;

    // console.log('ID Channel', _id);
    // console.log('ID Namespace', namespace_id);
    // console.log('Code Namespace', codeNS);

    // Emit
    socketNSP.emit('join-room', { 
        _id,
        username: USERNAME_LOGGED_IN
    });

    // Listen
    socketNSP.on('success-join', (channel) => {
        // console.log('channel', channel);
        generateHTMLChatByChannel(channel);
    });

    socketNSP.on('new-user-connected', data => {
        console.log('data', data);
    })

    socketNSP.on('user-joined', data => {
        console.log('data', data);
    })

    // Broadcast
    socketNSP.on('new-message-send', (message) => {
        console.log("Listening 'new-message-send' event")
        console.log('message', message);
        generateHTMLOneMessage(message);
    })

}

// API
async function apiNamespacesFindByCode(code){
    // Resource: Channels
    const resource = URLsAPI.namespacesByCode;
    const apiNamespaceByCode = `${resource}/${code}`;
    console.log(`API: ${apiNamespaceByCode}`);

    try {

        const response = await fetch(apiNamespaceByCode, {
            method: 'GET'
        });
        return await response.json();
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function apiChannelFindById(idCH){
    // Resource: Channels
    const resource = URLsAPI.channels;
    const apiNamespaceById = `${resource}/${idCH}`;
    console.log(`API: ${apiNamespaceById}`);

    try {

        const response = await fetch(apiNamespaceById, {
            method: 'GET'
        });
        return await response.json();
    } catch (error) {
        console.log(error);
        return [];
    }
}

async function apiSaveNewChannelToNamespaceDB(idNS, channel){
    // Resource: Channels
    const apiSaveNewChannelToNamespace = `${URLsAPI.namespaces}/${idNS}/channels`;
    console.log(`apiSaveNewChannelToNamespaceDB: ${apiSaveNewChannelToNamespace}`);

    try {

        const response = await fetch(apiSaveNewChannelToNamespace, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(channel)
        });
        return await response.json();
    } catch (error) {
        console.log(error);
        return {};
    }
}

async function apiSaveNewChannel(channel){

    try {

        const response = await fetch(URLsAPI.channels, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(channel)
        });
        return await response.json();
    } catch (error) {
        console.log(error);
        return {};
    }
}

async function apiSaveNewMessageDB(message){
    // Resource: Channels
    // console.log(`API: ${URLsAPI.messages}`);

    try {

        const response = await fetch(URLsAPI.messages, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });
        return await response.json();
    } catch (error) {
        console.log(error);
        return {};
    }
}

// HTML
function generateHTMLOneNamespace(namespace) {

    const {
        _id,
        name,
        code,
        host,
        port
    } = namespace;

    // DOM
    const namespaceListHTML = document.getElementById("namespaces-list");

    // LI
    const li = document.createElement('li');
    li.classList.add('namespace-item');
    // A
    const a = document.createElement('a');
    a.href = '#';
    a.id = _id;
    a.classList.add('namespace-link');
    a.innerHTML = name;
    // DATA
    a.dataset.namespace = _id;
    a.dataset.code = code;
    a.dataset.host = host;
    a.dataset.port = port;

    li.appendChild(a);
    namespaceListHTML.appendChild(li);

    // Add EventListener
    a.addEventListener('click',clickNamespace);
}

function generateHTMLOneChannel(channel){
    const { _id, name, namespace } = channel;

    // DOM
    const listChannels = document.getElementById('sidebar-column-2');
    const codeNS = listChannels.dataset.code;

    // DOM
    const channelListHTML = document.getElementById("channels-list");

    // LI
    const li = document.createElement('li');
    li.classList.add('channel-item');
    // A
    const a = document.createElement('a');
    a.href = '#';
    a.id = _id;
    // DATA
    a.dataset.namespace = namespace;
    a.dataset.namespaceCode = codeNS;
    a.innerHTML = name;
    a.classList.add('channel-link');

    li.appendChild(a);
    channelListHTML.appendChild(li);

    // Add EventListener
    a.addEventListener('click', clickChannel);
}

function generateHTMLOneMessage(message){
    const { _id, user, channel, text, created } = message;

    // DOM
    const channelChat = document.getElementById('channel-chat');
    let copyALLChatStr = channelChat.innerHTML;

    //console.log('ALL CHAT HTML', channelChat);
    //console.log('ALL CHAT HTML Inner', channelChat.innerHTML);

    const TagMessage = document.createElement('div');
    TagMessage.id = _id;
    // Data
    TagMessage.dataset.channel = channel;
    TagMessage.classList.add('channel-message');

    // 1. Profile
    const profileTAG = document.createElement('div');
    profileTAG.classList.add('message-profile');

    // 1.1. Photo
    const photoTAG = document.createElement('img');
    photoTAG.classList.add('message-photo');
    photoTAG.src = 'https://cdn.pixabay.com/photo/2012/04/13/21/07/user-33638_960_720.png';

    // 1.2. Append
    profileTAG.append(photoTAG);

    // 2. Information Message
    const infoMessageTAG = document.createElement('div');
    infoMessageTAG.classList.add('message-infoMessage');

    // 2.1. First row
    const firstRowTAG = document.createElement('div');
    firstRowTAG.classList.add('message-row');

    // 2.1.1. USERNAME
    const usernameTAG = document.createElement('span');
    usernameTAG.classList.add('message-username');
    usernameTAG.innerHTML = user;

    // 2.1.2. DATE: Created 
    const createdTAG = document.createElement('span');
    createdTAG.classList.add('message-created');
    createdTAG.innerHTML = created;

    // 2.1.3 Append
    firstRowTAG.append(usernameTAG);
    firstRowTAG.append(createdTAG);

    // 2.2. First row
    const secondRowTAG = document.createElement('div');
    secondRowTAG.classList.add('message-row');

    // 2.2.1 TEXT
    const textTAG = document.createElement('span');
    textTAG.classList.add('message-text');
    textTAG.innerHTML = text;

    // 2.2.2 Append
    secondRowTAG.append(textTAG);

    // Append
    infoMessageTAG.append(firstRowTAG);
    infoMessageTAG.append(secondRowTAG);

    // Append all
    TagMessage.append(profileTAG);
    TagMessage.append(infoMessageTAG);

    // console.log('TagMessage', TagMessage);

    // Append new message
    copyALLChatStr += TagMessage.outerHTML;
    channelChat.innerHTML = copyALLChatStr;
}

function generateHTMLChatByChannel(channel){
    //console.log('channel', channel);
    const { _id, name, namespace, messages } = channel;

    // DOM 
    const channelTitle = document.getElementById('channel-title');
    channelTitle.innerHTML = name;
    channelTitle.dataset.namespace = namespace;
    channelTitle.dataset.channel = _id;

    // Chat
    const channelChat = document.getElementById('channel-chat');
    channelChat.innerHTML = '';

    // DOM Messenger
    const messenger = document.getElementById('messenger');
    messenger.style.display = 'block';
    const messengerText = document.getElementById('messenger-text');
    messengerText.value = '';

    messages.forEach(message => {
        // console.log(message);
        generateHTMLOneMessage(message);
    });
}

// Buttons
function listenersButton() {

    // DOM Forms
    const btnAddNewConnection = document.getElementById('namespaces-btnAddNewConnection');
    const btnAddNewChannel = document.getElementById('channels-btnAddNewChannel');

    btnAddNewConnection.addEventListener('click', function(e) {
        // DOM
        const namespaceEnterNS = document.getElementById('namespace-EnterNS');

        if (namespaceEnterNS.style.display === "none") {
            namespaceEnterNS.style.display = "block";
        } else {
            namespaceEnterNS.style.display = "none";
        }
    });

    btnAddNewChannel.addEventListener('click', function(e) {
        // DOM
        const namespaceNewChannel = document.getElementById('channel-new');

        if (namespaceNewChannel.style.display === "none") {
            namespaceNewChannel.style.display = "block";
        } else {
            namespaceNewChannel.style.display = "none";
        }
    });
}

// FORMS
function preventInFormsEventSubmit() {

    // DOM
    const formLogin = document.getElementById('session-formLogin');
    const formJoinToNamespaceForm = document.getElementById('namespace-JoinForm');
    const formJoinToChannelForm = document.getElementById('channel-NewForm');
    const formMessenger = document.getElementById('messenger-form');

    formLogin.addEventListener("submit", function(e) {
        e.preventDefault();

        // DOM
        const usernameTAG = document.getElementById("session-username");
        const listNamespaces = document.getElementById("list-namespaces");

        USERNAME_LOGGED_IN = usernameTAG.value;
        USERNAME_LOGGED_IN = USERNAME_LOGGED_IN.trim();

        // clean
        usernameTAG.value = '';

        if (USERNAME_LOGGED_IN.length > 0){
            //console.log(`USERNAME_LOGGED_IN '${USERNAME_LOGGED_IN}' logged in...`);            
            listNamespaces.style.display = 'block';
        } else {
            console.log('Error, username is invalid...')
        }


    });

    formJoinToNamespaceForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        // DOM
        const nsCode = document.getElementById('namespace-code');

        let code = nsCode.value.trim();

        if (code.length > 0) {
            // CLEAN
            nsCode.value = '';

            const namespacesByCode = await apiNamespacesFindByCode(code);

            if (namespacesByCode.length > 0){
                // HTML
                const namespace = namespacesByCode[0];
                generateHTMLOneNamespace(namespace);

                // URL
                const URL_NSP = `${URLServerSocketIO}/${code}`;
                // console.log('URL_NSP', URL_NSP);

                // Socket.io
                socketNSP = io(URL_NSP);
            } else {
                console.log(`Do not exist any namespace with ${code} code...`);
            }
        } else {
            console.log('Error, values are invalid... please, fix them');
        }
    })

    formJoinToChannelForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        // DOM
        const listChannels = document.getElementById('sidebar-column-2');
        const chName = document.getElementById('channel-name');
        const nameCH = chName.value;

        // CLEAN
        chName.value = '';

        const idNs = listChannels.dataset.namespace;
        //console.log('idNs', idNs);

        // Channel
        const channel = {
            namespace: idNs,
            name: nameCH,
            messages: []
        }

        // API
        const channelWithID = await apiSaveNewChannel(channel);
        // console.log('channelWithID', channelWithID);
        generateHTMLOneChannel(channelWithID);

        // Update Namespace
        const namespace = await apiSaveNewChannelToNamespaceDB(idNs, channelWithID);
        console.log('namespace', namespace);

    });

    formMessenger.addEventListener("submit", async function(e) {
        e.preventDefault();

        // DOM
        const chatTitle = document.getElementById('channel-title');
        const messengerText = document.getElementById('messenger-text');
        const textMSG = messengerText.value;

        // Clean
        messengerText.value = '';
        
        // SOCKET.io
        socketNSP.emit('send-message', {
            channel: chatTitle.dataset.channel,
            user: USERNAME_LOGGED_IN,
            text: textMSG
        });    
        
        socketNSP.on('html-new-message', (message) => {
            console.log("Listening 'html-new-message' event")
            console.log('message', message);

            generateHTMLOneMessage(message);
        })
    });
}


