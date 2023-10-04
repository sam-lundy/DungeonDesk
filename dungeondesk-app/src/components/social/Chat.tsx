import { useState, useEffect, useContext, useRef, FC } from 'react';
import { getDatabase, ref, onValue, push, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { UsernamesContext } from '../../contexts/UsernameContext';


type MessageType = {
    id: string;
    text: string;
    userId: string;
    username?: string;
};

  const Chat: FC = () => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const systemUserIds = new Set(messages.filter(msg => msg.userId === 'SYSTEM').map(msg => msg.userId));
    const nonSystemUserIds = new Set(messages.filter(msg => msg.userId !== 'SYSTEM').map(msg => msg.userId));
    const db = getDatabase();
    const auth = getAuth();


    const handleClearChat = async () => {
      const messagesRef = ref(db, 'messages');
      await remove(messagesRef);
  };


    const contextValue = useContext(UsernamesContext);
    if (!contextValue) {
        throw new Error("Chat component must be used within a UsernamesProvider");
    }
    const { usernames, setUsernames } = contextValue;

  
    useEffect(() => {
      const messagesRef = ref(db, 'messages');
      onValue(messagesRef, (snapshot) => {
          const fetchedMessages = snapshot.val();
          const loadedMessages: MessageType[] = [];
          for (let id in fetchedMessages) {
              loadedMessages.push({ id, ...fetchedMessages[id] });
          }
  
          const userIdsToFetch = loadedMessages
              .map(message => message.userId)
              .filter(userId => userId !== 'SYSTEM' && !usernames[userId] && userId !== auth.currentUser?.uid);
  
          if (userIdsToFetch.length > 0) {
              // Fetch usernames from the backend
              fetch(`http://localhost:5000/api/get-usernames?uids=${userIdsToFetch.join(",")}`)
                  .then(res => res.json())
                  .then(data => {
                      setUsernames(prevUsernames => ({ ...prevUsernames, ...data }));
                  });
          }
          setMessages(loadedMessages);
      });
  
      if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [db, usernames, setUsernames]);
  


    useEffect(() => {
      if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [messages]);


      const sendMessage = () => {
        const currentUserId = auth.currentUser?.uid;

        if (!currentUserId) {
          console.error("No current user ID found.");
          return;
        }

        const messagesRef = ref(db, 'messages');
        const message = {
            text: newMessage,
            userId: currentUserId,
        };

        push(messagesRef, message)
          .then(() => {
            setNewMessage('');
          })
          .catch(error => {
            console.error("Error sending message:", error);
          });
    };


  
    return (
        <div>
          <div className="flex flex-col h-[400px] w-full bg-slate-100 p-1 overflow-y-auto">
          {messages.map(message => (
            <div key={message.id} className={message.userId === auth.currentUser?.uid ? "chat chat-end mb-4 text-sm" : "chat chat-start mb-4 text-sm"}>
                <div className="chat-bubble">
                  {message.userId === 'SYSTEM' ? message.text : `${usernames[message.userId] || 'Unknown User'}: ${message.text}`}
                </div>
                <div ref={chatEndRef} />
            </div>
        ))}


          </div>
      
          <div className="flex items-center border p-2 rounded-md shadow-md">
            <input 
                type="text" 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                className="flex-grow w-1/2 px-2 py-1 outline-none text-sm rounded-l-md"
                placeholder="Type a message..."
            />
            <button 
                onClick={sendMessage} 
                className="bg-indigo-500 text-white text-sm px-4 py-1 rounded-r-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700"
            >
                Send
            </button>
          </div>
          <button onClick={handleClearChat}>Clear Chat</button>
        </div>
      );
  };
export default Chat;