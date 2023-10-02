import { useState, useEffect, useContext, FC } from 'react';
import { getDatabase, ref, onValue, push } from 'firebase/database';
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
    const { usernames, setUsername } = useContext(UsernamesContext)!;
    const [fetchingUserIds, setFetchingUserIds] = useState(new Set());
  
    const db = getDatabase();
    const auth = getAuth();
  
    useEffect(() => {
      console.log('Chat useEffect triggered due to db or usernames change');
        const messagesRef = ref(db, 'messages');
        onValue(messagesRef, (snapshot) => {
            const fetchedMessages = snapshot.val();
            const loadedMessages: MessageType[] = [];
            for (let id in fetchedMessages) {
                loadedMessages.push({ id, ...fetchedMessages[id] });
            }
        
            const enhancedMessages = loadedMessages.map(msg => ({
                ...msg,
                username: usernames[msg.userId] || 'Loading...'
            }));
        
            setMessages(enhancedMessages);
        
            // Extract unique user IDs from the loaded messages.
            const uniqueUserIds = new Set(loadedMessages.map(msg => msg.userId));
        
            // Filter out user IDs for which we already have usernames.
            const userIdsToFetch = Array.from(uniqueUserIds).filter(userId => !usernames[userId]);
        
            // Fetch usernames for the remaining user IDs.
            userIdsToFetch.forEach(userId => {
              if (userId === 'SYSTEM') {
                  return;
              }
              
              if (!usernames[userId] && !fetchingUserIds.has(userId)) { 
                  setFetchingUserIds(prev => new Set(prev).add(userId));
                  fetch(`http://localhost:5000/api/get-username?uid=${userId}`)
                  .then(response => response.json())
                  .then(data => {
                      setUsername(userId, data.username);
                      setFetchingUserIds(prev => {
                          const updated = new Set(prev);
                          updated.delete(userId);
                          return updated;
                      });
                  })
                  .catch(error => {
                      console.error("Error fetching username:", error);
                  });
              }
          });
        });
    }, [db, usernames]);
    
  
    const sendMessage = () => {
      const messagesRef = ref(db, 'messages');
      const message = {
        text: newMessage,
        userId: auth.currentUser?.uid,
      };
      push(messagesRef, message);
      setNewMessage('');
    };

    const sendSystemMessage = (message: string) => {
      const messagesRef = ref(db, 'messages');
      const systemMessage = {
          text: `System: ${message}`,
          userId: 'SYSTEM', // A constant ID for system messages
      };
      push(messagesRef, systemMessage);
  };
  
    return (
        <div>
          <div className="flex flex-col h-[500px] border border-black bg-slate-100 p-4 overflow-y-auto">
            {messages.map(message => (
              message.userId === auth.currentUser?.uid ? (
                // Message from the current user
                <div key={message.id} className="chat chat-end mb-4">
                  <div className="chat-bubble">
                    {message.text}
                  </div>
                </div>
              ) : (
                // Message from another user
                <div key={message.id} className="chat chat-start mb-4">
                  <div className="chat-bubble">
                    {message.username}: {message.text}
                  </div>
                </div>
              )
            ))}
          </div>
      
          <div className="flex items-center border p-2 rounded-md shadow-md">
            <input 
                type="text" 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                className="flex-grow px-2 py-1 outline-none rounded-l-md"
                placeholder="Type a message..."
            />
            <button 
                onClick={sendMessage} 
                className="bg-indigo-500 text-white px-4 py-1 rounded-r-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700"
            >
                Send
            </button>
          </div>
        </div>
      );
      

  };
  
  export default Chat;
  
