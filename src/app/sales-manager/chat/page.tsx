
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Send, User, MessagesSquare, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { Chat, ChatMessage, UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

function ChatList({ chats, activeChatId, onSelectChat }: { chats: Chat[], activeChatId: string | null, onSelectChat: (chatId: string) => void }) {
    const { user } = useUser();
    
    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-2">
                {chats.map(chat => {
                    const otherParticipantId = chat.participants.find(p => p !== user!.uid);
                    const otherParticipantName = otherParticipantId ? chat.participantNames[otherParticipantId] : 'Unknown';
                    const isUnread = chat.lastMessageSenderId !== user!.uid;

                    return (
                        <button
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id!)}
                            className={cn(
                                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                                activeChatId === chat.id && "bg-accent"
                            )}
                        >
                            <div className="flex w-full items-center justify-between">
                                <div className="font-semibold">{otherParticipantName}</div>
                                {chat.lastMessageAt && (
                                     <div className={cn("text-xs", activeChatId === chat.id ? "text-foreground" : "text-muted-foreground")}>
                                        {formatDistanceToNow(chat.lastMessageAt.toDate(), { addSuffix: true })}
                                    </div>
                                )}
                            </div>
                            <div className="line-clamp-2 text-xs text-muted-foreground">
                                {chat.lastMessageSenderId === user!.uid && <span className="font-medium">You: </span>}
                                {chat.lastMessage}
                            </div>
                        </button>
                    )
                })}
            </div>
        </ScrollArea>
    )
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
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading && <div className="flex justify-center"><LoaderCircle className="animate-spin"/></div>}
                {messages && messages.map(msg => {
                    const isCurrentUser = msg.senderId === currentUser.uid;
                    return (
                        <div key={msg.id} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                            {!isCurrentUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials('Client')}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-xs md:max-w-md rounded-lg px-4 py-2", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-background border")}>
                                <p className="text-sm">{msg.text}</p>
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
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4 border-t">
                <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit">
                    <Send className="h-4 w-4"/>
                </Button>
            </form>
        </div>
    );
}

export default function SalesManagerChatPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const chatsQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'chats'), where('participants', 'array-contains', user.uid));
    }, [user, firestore]);

    const { data: chats, loading: chatsLoading, error: chatsError } = useCollection<Chat>(chatsQuery);
    
    const sortedChats = useMemo(() => {
        if (!chats) return [];
        return chats.sort((a,b) => {
            if (!a.lastMessageAt) return 1;
            if (!b.lastMessageAt) return -1;
            return b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis();
        })
    }, [chats]);
    
     useEffect(() => {
        if (!activeChatId && sortedChats && sortedChats.length > 0) {
            setActiveChatId(sortedChats[0].id!);
        }
    }, [activeChatId, sortedChats]);

    const loading = chatsLoading || userLoading;

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-4rem)]">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] h-full gap-4">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MessagesSquare /> Conversations
                        </CardTitle>
                    </CardHeader>
                    <Separator />
                     <CardContent className="p-0 flex-1">
                        {loading ? (
                             <div className="flex items-center justify-center h-full">
                                <LoaderCircle className="animate-spin" />
                            </div>
                        ) : chatsError ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
                                <AlertCircle className="w-10 h-10 mb-2"/>
                                <p className="font-medium">Error Loading Chats</p>
                                <p className="text-sm">Could not load conversations due to a permission error. This can happen if the page loads before your user profile is fully authenticated. Please try refreshing.</p>
                            </div>
                        ) : sortedChats && sortedChats.length > 0 ? (
                            <ChatList chats={sortedChats} activeChatId={activeChatId} onSelectChat={setActiveChatId} />
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                                <User className="w-10 h-10 mb-2"/>
                                <p className="font-medium">No Chats Yet</p>
                                <p className="text-sm">When a client starts a conversation, it will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="h-full flex flex-col">
                    {activeChatId && user ? (
                        <ChatRoom chatId={activeChatId} currentUser={user} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <MessagesSquare className="w-12 h-12 mb-4"/>
                            <h3 className="text-lg font-semibold">Select a chat</h3>
                            <p>Choose a conversation from the left to start messaging.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

    