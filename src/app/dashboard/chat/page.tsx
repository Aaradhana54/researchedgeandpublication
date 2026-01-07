
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, setDoc, addDoc, serverTimestamp, orderBy, limit, getDoc, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Send, UserCircle, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import type { Chat, ChatMessage, UserProfile, Project } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ClientChatPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [chatId, setChatId] = useState<string | null>(null);
  const [salesManager, setSalesManager] =useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user || !firestore) return;

    const findOrCreateChat = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Find the user's most recent project to get the assigned sales manager
            const projectsQuery = query(
                collection(firestore, 'projects'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(1)
            );
            const projectsSnap = await getDocs(projectsQuery);

            if (projectsSnap.empty) {
                setError("You don't have any projects yet. Please create a project to start a chat.");
                setLoading(false);
                return;
            }
            
            const latestProject = projectsSnap.docs[0].data() as Project;
            const assignedSalesId = latestProject.assignedSalesId;

            if (!assignedSalesId) {
                setError("Your project has not been assigned to a sales manager yet. Please check back later.");
                setLoading(false);
                return;
            }

            // 2. Fetch the sales manager's profile
            const managerDocRef = doc(firestore, 'users', assignedSalesId);
            const managerSnap = await getDoc(managerDocRef);

            if (!managerSnap.exists()) {
                setError("Could not find the assigned sales manager. Please contact support.");
                setLoading(false);
                return;
            }
            const manager = { ...managerSnap.data() as UserProfile, uid: managerSnap.id };
            setSalesManager(manager);

            // 3. Find or create the chat
            const generatedChatId = [user.uid, manager.uid].sort().join('_');
            setChatId(generatedChatId);

            const chatDocRef = doc(firestore, 'chats', generatedChatId);
            await setDoc(chatDocRef, {
                participants: [user.uid, manager.uid],
                participantNames: {
                    [user.uid]: user.name,
                    [manager.uid]: manager.name
                }
            }, { merge: true });

        } catch (err) {
            console.error("Error finding or creating chat:", err);
            setError("An error occurred while setting up the chat.");
        } finally {
            setLoading(false);
        }
    };
    
    findOrCreateChat();

  }, [user, userLoading, firestore]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertCircle /> Chat Unavailable</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        </div>
     )
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
            {chatId && user && <ChatRoom chatId={chatId} currentUser={user} />}
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
