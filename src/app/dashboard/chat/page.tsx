
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, onSnapshot, addDoc, serverTimestamp, orderBy, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { UserProfile, Chat, ChatMessage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Send, User, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function ClientChatPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [manager, setManager] = useState<UserProfile | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firestore || !user) return;

    const findOrCreateChat = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Find the sales manager
        const managerQuery = query(collection(firestore, 'users'), where('role', '==', 'sales-manager'));
        const managerSnap = await getDocs(managerQuery);
        if (managerSnap.empty) {
          throw new Error('No Sales Manager found in the system.');
        }
        const salesManager = { ...managerSnap.docs[0].data() as UserProfile, uid: managerSnap.docs[0].id };
        setManager(salesManager);

        // 2. Create a consistent, unique chat ID
        const chatId = [user.uid, salesManager.uid].sort().join('_');
        const chatDocRef = doc(firestore, 'chats', chatId);

        // 3. Create or update the chat document to ensure it exists
        await setDoc(chatDocRef, {
            participants: [user.uid, salesManager.uid],
            participantNames: {
                [user.uid]: user.name,
                [salesManager.uid]: salesManager.name,
            },
        }, { merge: true });

        // 4. Set up real-time listener for the chat document itself
        const chatUnsubscribe = onSnapshot(chatDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setChat({ ...docSnap.data() as Chat, id: docSnap.id });
            } else {
                // This case should theoretically not be hit due to the setDoc above
                throw new Error("Chat could not be created or found.");
            }
        });

        // 5. Set up real-time listener for messages
        const messagesQuery = query(collection(chatDocRef, 'messages'), orderBy('createdAt', 'asc'));
        const messagesUnsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
          const msgs = querySnapshot.docs.map(doc => ({ ...doc.data() as ChatMessage, id: doc.id }));
          setMessages(msgs);
        });

        setLoading(false);
        return () => {
            chatUnsubscribe();
            messagesUnsubscribe();
        };

      } catch (err: any) {
        console.error("CHAT LOAD ERROR:", err);
        setError(err.message || "An unexpected error occurred while loading the chat.");
        setLoading(false);
      }
    };

    const unsubscribePromise = findOrCreateChat();

    return () => {
        unsubscribePromise.then(unsubscribe => {
            if (unsubscribe) {
                unsubscribe();
            }
        });
    }

  }, [firestore, user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !chat || !newMessage.trim()) return;

    try {
      const messagesColRef = collection(firestore, 'chats', chat.id!, 'messages');
      await addDoc(messagesColRef, {
        senderId: user.uid,
        text: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please check your connection or permissions.");
    }
  };

  const getInitials = (name = '') => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (userLoading || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Chat Unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Chat with Sales Manager</h1>
            <p className="text-muted-foreground">Your direct line of communication for any questions.</p>
        </div>
        <Card className="flex-1 flex flex-col shadow-soft min-h-0">
            <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>{getInitials(manager?.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{manager?.name || 'Sales Manager'}</CardTitle>
                        <CardDescription>Online</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mb-4"/>
                        <h3 className="text-lg font-semibold">Start the Conversation</h3>
                        <p>Send a message to your sales manager.</p>
                    </div>
                ): (
                    messages.map(msg => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                            {msg.senderId !== user?.uid && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(manager?.name)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2",
                                msg.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                             {msg.senderId === user?.uid && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))
                )}
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
        </Card>
    </div>
  );
}

export default ClientChatPage;
