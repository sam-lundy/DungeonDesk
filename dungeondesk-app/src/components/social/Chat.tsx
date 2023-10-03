import { useState, useEffect, useContext, FC } from 'react';
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
  
    const db = getDatabase();
    const auth = getAuth();


    const handleClearChat = async () => {
      const messagesRef = ref(db, 'messages');
      await remove(messagesRef);
  };
  
    useEffect(() => {
      const messagesRef = ref(db, 'messages');
      onValue(messagesRef, (snapshot) => {
          const fetchedMessages = snapshot.val();
          const loadedMessages: MessageType[] = [];
          for (let id in fetchedMessages) {
              loadedMessages.push({ id, ...fetchedMessages[id] });
          }
          
          setMessages(loadedMessages);
      });
  }, [db]);  

      const contextValue = useContext(UsernamesContext);
      if (!contextValue) {
        throw new Error("Chat component must be used within a UsernamesProvider");
      }
      const { usernames } = contextValue;

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
          <div className="flex flex-col h-[500px] border border-black bg-slate-100 p-4 overflow-y-auto">
          {messages.map(message => (
            <div key={message.id} className={message.userId === auth.currentUser?.uid ? "chat chat-end mb-4" : "chat chat-start mb-4"}>
                <div className="chat-bubble">
                    {message.text.startsWith("System:") ? message.text : `${usernames[message.userId] || 'Unknown User'}: ${message.text}`}
                </div>
            </div>
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
          <button onClick={handleClearChat}>Clear Chat</button>
        </div>
      );
  };
export default Chat;