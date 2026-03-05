import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Paperclip,
  CheckCheck,
  Search,
  ArrowLeft,
  Activity,
  ClipboardList,
  Home,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
interface Message {
  id: number;
  sender: 'therapist' | 'parent';
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: number;
  parentName: string;
  childName: string;
  childAge: number;
  therapyType: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

// ─── Dummy Data ──────────────────────────────────────────
const conversations: Conversation[] = [
  {
    id: 1,
    parentName: 'Mrs. Babar',
    childName: 'Rabia Babar',
    childAge: 4,
    therapyType: 'Speech Therapy',
    lastMessage: 'Thank you for the update on Rabia\'s session today.',
    lastTime: '11:30 AM',
    unread: 2,
    messages: [
      {
        id: 1,
        sender: 'therapist',
        text: 'Assalamoalaikum Mrs. Babar! I wanted to share Rabia\'s session update from today. She did really well with picture-word matching — she correctly identified 7 out of 10 cards, up from 5 last week.',
        time: '10:45 AM',
        read: true,
      },
      {
        id: 2,
        sender: 'therapist',
        text: 'She also maintained eye contact for 8 seconds during the name-calling drills, which is a great improvement. I recommend continuing the name-calling practice at home during playtime.',
        time: '10:46 AM',
        read: true,
      },
      {
        id: 3,
        sender: 'parent',
        text: 'Walaikumassalam! That\'s wonderful to hear. We\'ve been practicing the name-calling exercise every evening. She seems to enjoy it when we do it during her favorite songs.',
        time: '11:15 AM',
        read: true,
      },
      {
        id: 4,
        sender: 'parent',
        text: 'Thank you for the update on Rabia\'s session today. Should we also try the picture cards at home?',
        time: '11:30 AM',
        read: false,
      },
      {
        id: 5,
        sender: 'therapist',
        text: 'Yes, absolutely! Start with 5 familiar objects (ball, cup, shoe, cat, car). Show her the picture and say the word clearly. Wait 5 seconds for her to respond before prompting. Do this for 10 minutes during a calm moment — not right before nap time.',
        time: '11:45 AM',
        read: true,
      },
    ],
  },
  {
    id: 2,
    parentName: 'Mr. Fatima',
    childName: 'Amman Fatima',
    childAge: 3,
    therapyType: 'Occupational Therapy',
    lastMessage: 'We\'ll start the playdough exercises tonight.',
    lastTime: '2:00 PM',
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'therapist',
        text: 'Hello Mr. Fatima, I wanted to share a home activity plan for Amman this week. We\'re focusing on strengthening her pincer grasp.',
        time: '1:30 PM',
        read: true,
      },
      {
        id: 2,
        sender: 'therapist',
        text: 'Home Activity: Playdough Pinch & Roll\n\n1. Give Amman a small ball of playdough\n2. Show her how to pinch small pieces off\n3. Roll the pieces into tiny balls\n4. Try for 10-15 minutes daily\n\nThis helps develop the same muscles she needs for bead stringing and later, writing.',
        time: '1:32 PM',
        read: true,
      },
      {
        id: 3,
        sender: 'parent',
        text: 'Thank you, doctor. The bead activity at the center has been really helpful — she tries to copy it at home with her necklace beads! We\'ll start the playdough exercises tonight.',
        time: '2:00 PM',
        read: true,
      },
    ],
  },
  {
    id: 3,
    parentName: 'Mrs. Hassan',
    childName: 'Ahmed Hassan',
    childAge: 2,
    therapyType: 'Behavioral Therapy',
    lastMessage: 'Can we discuss the visual schedule for next week?',
    lastTime: '4:15 PM',
    unread: 1,
    messages: [
      {
        id: 1,
        sender: 'therapist',
        text: 'Assalamoalaikum Mrs. Hassan. I wanted to update you on Ahmed\'s session today. We worked on turn-taking and emotion recognition.',
        time: '3:00 PM',
        read: true,
      },
      {
        id: 2,
        sender: 'therapist',
        text: 'Ahmed struggled a bit with turn-taking — he left the activity twice. However, he showed great interest in the emotion flashcards and correctly identified "happy" and "sad" faces! This is a positive sign.',
        time: '3:02 PM',
        read: true,
      },
      {
        id: 3,
        sender: 'therapist',
        text: 'For home, please try this:\n\n🏠 Emotion Mirror Game:\n- Stand with Ahmed in front of a mirror\n- Make a happy face and say "happy!"\n- Then make a sad face and say "sad"\n- Encourage Ahmed to copy you\n- Do this 2-3 times daily for 5 minutes\n\nThis builds on his progress with the flashcards.',
        time: '3:05 PM',
        read: true,
      },
      {
        id: 4,
        sender: 'parent',
        text: 'Thank you for the detailed update. He has been a bit difficult this week at home too — we think it might be because his sleep schedule changed. Can we discuss the visual schedule for next week?',
        time: '4:15 PM',
        read: false,
      },
    ],
  },
];

// ─── Quick Templates ─────────────────────────────────────
const quickTemplates = [
  {
    label: 'Session Feedback',
    icon: <ClipboardList className="w-4 h-4" />,
    text: 'Today\'s session went well. Here are the key observations and activities we covered...',
  },
  {
    label: 'Home Activity',
    icon: <Home className="w-4 h-4" />,
    text: 'Here is a home activity to practice this week:\n\nActivity: \nDuration: 10-15 minutes\nFrequency: Daily\nInstructions: ',
  },
  {
    label: 'Progress Update',
    icon: <Activity className="w-4 h-4" />,
    text: 'I wanted to share an update on your child\'s progress. Over the past week, we\'ve seen improvements in...',
  },
];

// ─── Component ───────────────────────────────────────────
export function TherapistMessages() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMobileShowChat(true);
  };

  const handleBack = () => {
    setMobileShowChat(false);
  };

  const handleSend = () => {
    if (!messageText.trim()) return;
    setMessageText('');
    // In real app, would send to backend
  };

  const handleTemplate = (text: string) => {
    setMessageText(text);
  };

  // ─── Conversation List ────────────────────────────────
  const ConversationList = () => (
    <div className={`w-full lg:w-[340px] border-r border-gray-200 bg-white flex flex-col ${mobileShowChat ? 'hidden lg:flex' : 'flex'}`}>
      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const isActive = selectedConversation?.id === conv.id;
          return (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className={`w-full text-left p-4 border-b border-gray-50 transition-colors ${isActive ? 'bg-purple-50' : 'hover:bg-gray-50'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                  }`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{conv.parentName}</h4>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{conv.lastTime}</span>
                  </div>
                  <p className="text-xs text-gray-500">Re: {conv.childName} ({conv.childAge} yrs)</p>
                  <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── Chat Area ────────────────────────────────────────
  const ChatArea = () => {
    if (!selectedConversation) {
      return (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50/50">
          <div className="text-center text-gray-400 space-y-3">
            <MessageSquare className="w-16 h-16 mx-auto opacity-30" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a parent from the list to view messages</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex-1 flex flex-col bg-gray-50/30 ${!mobileShowChat ? 'hidden lg:flex' : 'flex'}`}>
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
          <button onClick={handleBack} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{selectedConversation.parentName}</h4>
            <p className="text-xs text-gray-500">
              Parent of {selectedConversation.childName} • {selectedConversation.therapyType}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map((msg) => {
            const isTherapist = msg.sender === 'therapist';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isTherapist ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${isTherapist
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                    }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center gap-1.5 mt-2 ${isTherapist ? 'justify-end' : 'justify-start'}`}>
                    <Clock className={`w-3 h-3 ${isTherapist ? 'text-purple-200' : 'text-gray-400'}`} />
                    <span className={`text-[10px] ${isTherapist ? 'text-purple-200' : 'text-gray-400'}`}>{msg.time}</span>
                    {isTherapist && msg.read && <CheckCheck className="w-3.5 h-3.5 text-purple-200" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Templates */}
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickTemplates.map((tpl) => (
              <Button
                key={tpl.label}
                variant="outline"
                size="sm"
                className="shrink-0 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                onClick={() => handleTemplate(tpl.text)}
              >
                {tpl.icon}
                <span className="ml-1">{tpl.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleSend}
              className="bg-purple-600 hover:bg-purple-700 h-11 w-11 p-0 rounded-xl shrink-0"
              disabled={!messageText.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-purple-600 text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Messages
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Communicate with parents about sessions, home activities, and progress updates
        </p>
      </div>

      {/* Chat Container */}
      <Card className="overflow-hidden">
        <div className="flex h-[600px]">
          <ConversationList />
          <ChatArea />
        </div>
      </Card>
    </motion.div>
  );
}
