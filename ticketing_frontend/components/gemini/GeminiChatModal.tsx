
import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import * as geminiService from '../../services/geminiService';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const GeminiChatModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await geminiService.generateGeminiResponse(userMessage.text);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: response.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      addNotification(err.message || 'Error communicating with AI assistant.', 'error');
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: "Sorry, I couldn't get a response. Please try again.", sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Assistant" size="lg">
      <div className="flex flex-col h-[60vh]">
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-700 rounded-md mb-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              <SparklesIcon className="h-12 w-12 mx-auto mb-2 text-primary dark:text-primary-light" />
              <p>Ask me anything about the ticketing system or general IT queries!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.sender === 'ai' && <SparklesIcon className="h-6 w-6 text-primary dark:text-primary-light mr-2 flex-shrink-0" />}
                {msg.sender === 'user' && <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0" />}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.sender === 'user' 
                    ? 'bg-primary text-white dark:bg-primary-dark' 
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center space-x-2 border-t border-gray-200 dark:border-gray-600 pt-4">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} isLoading={isLoading} disabled={isLoading || !inputValue.trim()} icon={<PaperAirplaneIcon className="h-5 w-5"/>}>
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GeminiChatModal;
