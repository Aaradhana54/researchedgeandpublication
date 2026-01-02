
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, setDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Send, UserCircle, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import type { Chat, ChatMessage, UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';


// This component will find or create a chat between the client and their assigned sales manager.
// For this demo, we'll assume a client chats with the *first* sales manager found.
// In a real app, this should be tied to an actual assignment (e.g., on a project).
export default function ClientChatPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [chatId, setChatId] = useState<string | null>(null);
  const [salesManager, setSalesManager] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Find a sales manager
  const salesManagerQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'sales-manager'), orderBy('name'), limit(1));
  }, [firestore]);

  const { data: managers, loading: managersLoading } = useCollection<UserProfile>(salesManagerQuery);

  // 2. Once we have a manager, find or create the chat
  useEffect(() => {
    if (userLoading || managersLoading || !user || !managers) return;
    
    const manager = managers[0];
    if (!manager) {
        setLoading(false);
        return;
    }
    setSalesManager(manager);

    const generatedChatId = [user.uid, manager.uid].sort().join('_');
    setChatId(generatedChatId);

    const chatDocRef = doc(firestore, 'chats', generatedChatId);
    setDoc(chatDocRef, {
        participants: [user.uid, manager.uid],
        participantNames: {
            [user.uid]: user.name,
            [manager.uid]: manager.name
        }
    }, { merge: true }).finally(() => setLoading(false));

  }, [user, managers, userLoading, managersLoading, firestore]);
  

  if (loading || userLoading || managersLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!salesManager) {
     return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertCircle /> No Sales Manager Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">We're sorry, but there are no sales managers available to chat with at the moment. Please check back later.</p>
                </CardContent>
            </Card>
        </div>
     )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Chat with Support</CardTitle>
          <CardDescription>You are chatting with {salesManager.name}.</CardDescription>
        </CardHeader>
        <CardContent>
            {chatId && <ChatRoom chatId={chatId} currentUser={user!} />}
        </CardContent>
      </Card>
    </div>
  );
}


function ChatRoom({ chatId, currentUser }: { chatId: string, currentUser: UserProfile }) {
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const messagesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, `chats/${chatId}/messages`), orderBy('createdAt', 'asc'));
    }, [firestore, chatId]);

    const { data: messages, loading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firestore || newMessage.trim() === '') return;

        const messagesColRef = collection(firestore, `chats/${chatId}/messages`);
        const chatDocRef = doc(firestore, 'chats', chatId);

        await addDoc(messagesColRef, {
            senderId: currentUser.uid,
            text: newMessage,
            createdAt: serverTimestamp()
        });

        await setDoc(chatDocRef, {
            lastMessage: newMessage,
            lastMessageAt: serverTimestamp(),
            lastMessageSenderId: currentUser.uid
        }, { merge: true });

        setNewMessage('');
    }
    
    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="flex flex-col h-[65vh]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50 rounded-md">
                {messagesLoading && <div className="flex justify-center"><LoaderCircle className="animate-spin"/></div>}
                {messages && messages.map(msg => {
                    const isCurrentUser = msg.senderId === currentUser.uid;
                    return (
                        <div key={msg.id} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                            {!isCurrentUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(currentUser.role === 'client' ? 'SM' : 'C')}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-xs md:max-w-md rounded-lg px-4 py-2", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-background border")}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                    {msg.createdAt ? format(msg.createdAt.toDate(), 'p') : ''}
                                </p>
                            </div>
                             {isCurrentUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    )
                })}
                 <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-4">
                <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button type="submit">
                    <Send className="h-4 w-4"/>
                </Button>
            </form>
        </div>
    );
}

