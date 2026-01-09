
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { UserProfile, Chat, ChatMessage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Send, MessageSquare, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function SalesManagerChatPage() {
  const { user: manager, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for all chats where the manager is a participant
  useEffect(() => {
    if (!firestore || !manager) return;

    setLoadingChats(true);
    const chatsQuery = query(collection(firestore, 'chats'), where('participants', 'array-contains', manager.uid));
    
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const allChats = snapshot.docs.map(doc => ({ ...doc.data() as Chat, id: doc.id }));
      setChats(allChats);
      setLoadingChats(false);
    }, (err) => {
      console.error("Failed to fetch chats:", err);
      setError("Could not load your conversations.");
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, [firestore, manager]);

  // Listen for messages when a chat is selected
  useEffect(() => {
    if (!firestore || !selectedChat) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const messagesQuery = query(collection(firestore, 'chats', selectedChat.id, 'messages'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data() as ChatMessage, id: doc.id }));
      setMessages(msgs);
      setLoadingMessages(false);
    }, (err) => {
      console.error(`Failed to fetch messages for chat ${selectedChat.id}:`, err);
      setError(`Could not load messages for this chat.`);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [firestore, selectedChat]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !manager || !selectedChat || !newMessage.trim()) return;

    try {
      const messagesColRef = collection(firestore, 'chats', selectedChat.id, 'messages');
      await addDoc(messagesColRef, {
        senderId: manager.uid,
        text: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message.");
    }
  };

  const getInitials = (name = '') => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const getClientNameFromChat = (chat: Chat) => {
    const clientParticipantId = chat.participants.find(p => p !== manager?.uid);
    return chat.participantNames[clientParticipantId!] || 'Unknown Client';
  }

  if (userLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
       <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Client Chats</h1>
            <p className="text-muted-foreground">Manage all your conversations with clients.</p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1">
        <Card className="lg:col-span-1 xl:col-span-1 flex flex-col shadow-soft">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                {loadingChats ? (
                    <div className="flex justify-center items-center h-full">
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary"/>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="text-center text-muted-foreground pt-12">
                        <p>No active chats with clients yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chats.map(chat => (
                            <Button
                                key={chat.id}
                                variant={selectedChat?.id === chat.id ? 'secondary' : 'ghost'}
                                className="w-full justify-start h-auto py-3 px-4"
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{getInitials(getClientNameFromChat(chat))}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="font-semibold">{getClientNameFromChat(chat)}</p>
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
        <Card className="lg:col-span-2 xl:col-span-3 flex flex-col shadow-soft">
            {selectedChat ? (
                 <>
                    <CardHeader className="border-b">
                        <CardTitle>{getClientNameFromChat(selectedChat)}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loadingMessages ? (
                           <div className="flex justify-center items-center h-full">
                             <LoaderCircle className="h-8 w-8 animate-spin text-primary"/>
                           </div>
                        ) : messages.map(msg => (
                            <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === manager?.uid ? "justify-end" : "justify-start")}>
                                {msg.senderId !== manager?.uid && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{getInitials(getClientNameFromChat(selectedChat))}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2",
                                    msg.senderId === manager?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                {msg.senderId === manager?.uid && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{getInitials(manager?.name)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </CardContent>
                    <div className="border-t p-4">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                 </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <MessageSquare className="w-16 h-16 mb-4"/>
                    <h3 className="text-xl font-semibold">Select a Conversation</h3>
                    <p>Choose a client from the left panel to view the chat history.</p>
                </div>
            )}
        </Card>
      </div>
    </div>
  );
}

export default SalesManagerChatPage;
