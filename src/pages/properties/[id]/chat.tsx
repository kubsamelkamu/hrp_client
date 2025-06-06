import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import socket from '@/utils/socket';
import type { ServerToClientEvents } from '@/utils/socket';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPropertyById } from '@/store/slices/propertySlice';
import UserLayout from '@/components/userLayout/Layout';
import MessageList, { Message } from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';
import { ThemeContext } from '@/components/context/ThemeContext';
import Head from 'next/head';

interface RawMessage {
  id: string;
  content: string;
  sender: { id: string; name: string };
  createdAt?: string | Date | null;
  sentAt?: string | Date | null;
  deleted?: boolean | null;
  editedAt?: string | Date | null;
}

const PropertyChatPage: React.FC = () => {
  const router = useRouter();
  const propertyId = typeof router.query.id === 'string' ? router.query.id : null;
  const dispatch = useAppDispatch();
  const { current } = useAppSelector((s) => s.properties);
  const authUser = useAppSelector((s) => s.auth.user);
  const { theme } = useContext(ThemeContext)!;

  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [presence, setPresence] = useState<Record<string, 'online' | 'offline'>>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const normalizeDate = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    return new Date().toISOString();
  };

  useEffect(() => {
    if (!propertyId) return;

    dispatch(fetchPropertyById(propertyId))
      .unwrap()
      .then((prop) => {
        if (Array.isArray(prop.messages)) {
          const normalized: Message[] = (prop.messages as RawMessage[]).map((m) => ({
            id: m.id,
            content: m.content,
            sender: { id: m.sender.id, name: m.sender.name },
            createdAt: m.createdAt ? normalizeDate(m.createdAt) : new Date().toISOString(),
            sentAt: m.sentAt ? normalizeDate(m.sentAt) : undefined,
            deleted: m.deleted ?? false,
            editedAt: m.editedAt ? normalizeDate(m.editedAt) : undefined,
          }));
          setMessages(normalized);
        }
      });

    socket.emit('joinRoom', propertyId);
    return () => {
      socket.emit('leaveRoom', propertyId);
      setMessages([]);
      setTypingUsers(new Set());
      setPresence({});
      setEditingMessageId(null);
      setEditText('');
    };
  }, [dispatch, propertyId]);

  useEffect(() => {
    const onNewMessage: ServerToClientEvents['newMessage'] = (msg) => {
      setMessages((prev) => [...prev, { ...msg, deleted: msg.deleted ?? false }]);
    };
    socket.on('newMessage', onNewMessage);
    return () => {
      socket.off('newMessage', onNewMessage);
    };
  }, []);

  useEffect(() => {
    const onDeleted: ServerToClientEvents['messageDeleted'] = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, deleted: true } : m))
      );
    };
    socket.on('messageDeleted', onDeleted);
    return () => {
      socket.off('messageDeleted', onDeleted);
    };
  }, []);

  useEffect(() => {
    const onEdited: ServerToClientEvents['messageEdited'] = (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
      );
    };
    socket.on('messageEdited', onEdited);
    return () => {
      socket.off('messageEdited', onEdited);
    };
  }, []);

  useEffect(() => {
    const onTyping: ServerToClientEvents['typingStatus'] = ({ userId, isTyping }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) next.add(userId);
        else next.delete(userId);
        return next;
      });
    };
    socket.on('typingStatus', onTyping);
    return () => {
      socket.off('typingStatus', onTyping);
    };
  }, []);

  useEffect(() => {
    const onPresence: ServerToClientEvents['presence'] = ({ userId, status }) => {
      setPresence((prev) => ({ ...prev, [userId]: status }));
    };
    socket.on('presence', onPresence);
    return () => {
      socket.off('presence', onPresence);
    };
  }, []);

  // Handlers
  const handleSend = useCallback(
    (content: string) => {
      if (!authUser) return toast.error('Login required');
      if (!current?.id || !socket.connected) return toast.error('Chat not ready');

      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          content,
          sender: { id: authUser.id, name: authUser.name },
          createdAt: now,
          sentAt: now,
          deleted: false,
        },
      ]);

      socket.emit('sendMessage', { propertyId: current.id, content }, () => {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      });
    },
    [authUser, current?.id]
  );

  const handleDelete = useCallback(
    (messageId: string) => {
      if (!current?.id) return;
      socket.emit('deleteMessage', { propertyId: current.id, messageId }, (res) => {
        if (!res.success) toast.error(res.error || 'Delete failed');
      });
    },
    [current?.id]
  );

  const handleEdit = useCallback(
    (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (msg) {
        setEditingMessageId(messageId);
        setEditText(msg.content);
      }
    },
    [messages]
  );

  const handleEditSave = useCallback(() => {
    if (!authUser || !current?.id || !editingMessageId) return;
    socket.emit('editMessage', { propertyId: current.id, messageId: editingMessageId, newContent: editText }, (res) => {
      if (!res.success) toast.error(res.error || 'Edit failed');
      else {
        setEditingMessageId(null);
        setEditText('');
      }
    });
  }, [authUser, current?.id, editingMessageId, editText]);

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  if (!current) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading chat…</p>
        </div>
      </UserLayout>
    );
  }

  const otherTyping = Array.from(typingUsers).filter((uid) => uid !== authUser?.id);

  return (
    <UserLayout>
      <Head>
        <title> Rentify | Chat</title>
        <meta
          name="description"
          content="Chat with landlords and tenants about properties, manage bookings, and discuss details in real-time."
        />
        <link rel="canonical" href="/properties\[id]\chat" />
      </Head>
      <div
        className={`min-h-screen p-6 ${
            theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
          }`}
      >
        <div className="max-w-4xl mx-auto">
          <Link href={`/properties/${current.id}`} className="text-blue-500 hover:underline">
            ← Back to property
          </Link>

          <div className="flex items-center my-2">
            <span
              className={`h-2 w-2 rounded-full mr-2 ${
                  presence[current.landlord?.id || ''] === 'online'
                    ? 'bg-green-500'
                    : 'bg-gray-400'
                }`}
            />
            <span className="font-semibold">{current.landlord?.name}</span>
          </div>

          <div className="border rounded-lg flex flex-col h-[60vh] overflow-hidden">
            <MessageList
              messages={messages}
              currentUserId={authUser?.id || null}
              onDelete={handleDelete}
              onEdit={handleEdit}
              editingMessageId={editingMessageId}
              editText={editText}
              onEditChange={setEditText}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
            />

            {otherTyping.length > 0 && (
              <div className="p-2 italic text-gray-500">Someone is typing…</div>
            )}

            <ChatInput
              propertyId={current.id}
              onSend={handleSend}
              disabled={!socket.connected}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PropertyChatPage;
