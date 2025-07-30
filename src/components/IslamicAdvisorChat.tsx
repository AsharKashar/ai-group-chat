'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CopilotChat } from '@copilotkit/react-ui';
import { CopilotKit } from '@copilotkit/react-core';
import { useCopilotReadable } from '@copilotkit/react-core';
import { Navigation } from './Navigation';

// Sensitive words that trigger the help popup
const SENSITIVE_WORDS = [
  'abuse', 'abusive', 'abused', 'hurt', 'hurting', 'pain', 'painful', 
  'suicide', 'suicidal', 'depression', 'depressed', 'anxiety', 'anxious', 
  'fear', 'scared', 'helpless', 'hopeless', 'despair', 'trauma', 'traumatic',
  'violence', 'violent', 'harm', 'harmful', 'suffering', 'crisis', 'emergency', 
  'troubled', 'distressed', 'overwhelmed', 'broken', 'lost', 'alone', 'lonely',
  'isolated', 'abandoned', 'domestic violence', 'domestic abuse', 'beaten', 
  'hitting', 'slapped', 'punched', 'threatened', 'controlling', 'manipulative',
  'emotional abuse', 'verbal abuse', 'physical abuse', 'sexual abuse'
];

// Help popup component
function HelpPopup({ isOpen, onClose, onContinue }: { isOpen: boolean; onClose: () => void; onContinue?: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">🤲</span>
          <h3 className="text-lg font-semibold text-gray-900">
            We're Here to Help
          </h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          We noticed you might be going through a difficult time. Remember that Allah (SWT) 
          is always with you, and seeking professional help is a sign of strength and wisdom.
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>🚨 Emergency:</strong> If you're in immediate danger, please contact emergency services (911)
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>🔄 24/7 Crisis Support:</strong><br/>
              • National Suicide Prevention Lifeline: <strong>988</strong><br/>
              • Crisis Text Line: Text HOME to <strong>741741</strong><br/>
              • National Domestic Violence Hotline: <strong>1-800-799-7233</strong>
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              <strong>🕌 Islamic Counseling:</strong> Consider reaching out to your local mosque or Islamic counseling services for faith-based support
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>💬 Contact Us:</strong> If you need someone to talk to or want professional referrals, you can reach out to our support team
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => window.open('mailto:support@islamicadvisor.com?subject=Need Support', '_blank')}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs"
          >
            📧 Contact Support
          </button>
          {onContinue && (
            <button
              onClick={onContinue}
              className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-xs"
            >
              Send Message Anyway
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs"
          >
            Cancel & Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export function IslamicAdvisorChat() {
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<string>('');
  const [blockedMessage, setBlockedMessage] = useState<string>('');
  const [blockedInput, setBlockedInput] = useState<HTMLElement | null>(null);

  // Make Islamic knowledge context readable
  useCopilotReadable({
    description: 'Islamic advisor context and guidelines',
    value: JSON.stringify({
      role: 'Islamic Spiritual Advisor',
      knowledge_areas: [
        'Quran and Hadith',
        'Islamic Jurisprudence (Fiqh)',
        'Islamic History and Biography',
        'Prayer and Worship',
        'Islamic Ethics and Morality',
        'Life Guidance and Counseling'
      ],
      approach: 'Compassionate, knowledgeable, and supportive',
      guidelines: [
        'Always provide authentic Islamic guidance',
        'Quote relevant Quran verses and Hadith when appropriate',
        'Be sensitive to individual circumstances',
        'Encourage seeking knowledge and spiritual growth',
        'Promote mental health and well-being'
      ]
    })
  });

  // Make conversation history readable for context
  useCopilotReadable({
    description: 'Previous conversation context for maintaining continuity',
    value: conversationHistory || 'No previous conversation context available'
  });

  // Function to check for sensitive words
  const checkForSensitiveWords = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase();
    return SENSITIVE_WORDS.some(word => 
      lowerMessage.includes(word.toLowerCase())
    );
  }, []);

  // Monitor for message submission (Enter key press) to check for sensitive words
  useEffect(() => {
    const checkForSubmissionListeners = () => {
      // Try multiple selectors for CopilotKit input
      const selectors = [
        '[data-copilotkit-input] textarea',
        'textarea[placeholder*="message"]',
        'textarea[placeholder*="Type"]',
        '.copilot-chat textarea',
        'div[contenteditable="true"]'
      ];
      
      let found = false;
      
      for (const selector of selectors) {
        const inputs = document.querySelectorAll(selector);
        inputs.forEach((input) => {
          if (!input.hasAttribute('data-submission-listener')) {
            input.setAttribute('data-submission-listener', 'true');
            
            const handleKeyDown = (e: Event) => {
              const keyEvent = e as KeyboardEvent;
              // Check if Enter is pressed (and not Shift+Enter for new line)
              if (keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
                const target = e.target as HTMLTextAreaElement | HTMLInputElement;
                const message = target.value || target.textContent || '';
                
                console.log('Message being sent:', message); // Debug log
                
                if (message.trim().length > 0 && checkForSensitiveWords(message)) {
                  console.log('Sensitive word detected in submitted message!'); // Debug log
                  // Prevent the message from being sent immediately
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Store the message and input for potential later sending
                  setBlockedMessage(message);
                  setBlockedInput(target);
                  
                  // Show the popup
                  setShowHelpPopup(true);
                }
              }
            };

            // Also check for form submissions and button clicks
            const handleSubmit = (e: Event) => {
              const target = input as HTMLTextAreaElement | HTMLInputElement;
              const message = target.value || target.textContent || '';
              
              if (message.trim().length > 0 && checkForSensitiveWords(message)) {
                console.log('Sensitive word detected in form submission!'); // Debug log
                e.preventDefault();
                e.stopPropagation();
                setShowHelpPopup(true);
                setLastMessage(message);
              }
            };

            input.addEventListener('keydown', handleKeyDown);
            
            // Also listen for nearby submit buttons
            const parentForm = input.closest('form');
            if (parentForm) {
              parentForm.addEventListener('submit', handleSubmit);
            }
            
            // Look for submit buttons near the input
            const submitButtons = document.querySelectorAll('button[type="submit"], button[aria-label*="send"], button[aria-label*="Send"]');
            submitButtons.forEach(button => {
              if (!button.hasAttribute('data-submit-listener')) {
                button.setAttribute('data-submit-listener', 'true');
                button.addEventListener('click', handleSubmit);
              }
            });
            
            found = true;
          }
        });
      }
      
      // If no input found, try again after a short delay
      if (!found) {
        setTimeout(checkForSubmissionListeners, 1000);
      }
    };

    checkForSubmissionListeners();
    
    // Also check periodically in case inputs are dynamically created
    const interval = setInterval(checkForSubmissionListeners, 3000);
    
    return () => {
      clearInterval(interval);
      // Clean up listeners
      const allInputs = document.querySelectorAll('[data-submission-listener]');
      allInputs.forEach(input => {
        input.removeAttribute('data-submission-listener');
      });
      const allButtons = document.querySelectorAll('[data-submit-listener]');
      allButtons.forEach(button => {
        button.removeAttribute('data-submit-listener');
      });
    };
  }, [checkForSensitiveWords]);

  // Function to send the blocked message anyway
  const sendBlockedMessage = useCallback(() => {
    if (blockedInput && blockedMessage) {
      // Clear the popup first
      setShowHelpPopup(false);
      
      // Simulate the original message sending by triggering the submission
      // We'll clear the current input and set it to the blocked message
      const input = blockedInput;
      
      // Set the input value to the blocked message
      if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
        input.value = blockedMessage;
      } else if (input instanceof HTMLElement) {
        input.textContent = blockedMessage;
      }
      
      // Trigger the submission event
      setTimeout(() => {
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        });
        input.dispatchEvent(enterEvent);
      }, 100);
      
      // Clear the blocked state
      setBlockedMessage('');
      setBlockedInput(null);
    }
  }, [blockedInput, blockedMessage]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-1">
        {/* Sidebar with Islamic advisor info */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🕌</div>
              <h3 className="font-semibold text-gray-900">Islamic Advisor</h3>
              <p className="text-xs text-gray-500 mt-1">Spiritual Guidance</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👨‍🏫</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Sheikh Abdullah
                  </p>
                  <p className="text-xs text-gray-500">
                    Islamic Scholar
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Quran • Hadith • Fiqh • Spiritual Guidance
              </div>
            </div>

            {/* Debug button for testing sensitive word detection */}
            <button
              onClick={() => setShowHelpPopup(true)}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded transition-colors"
            >
              🧪 Test Safety Popup
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Areas of Guidance</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Prayer & Worship</li>
                <li>• Quran & Hadith</li>
                <li>• Islamic Ethics</li>
                <li>• Life Counseling</li>
                <li>• Spiritual Growth</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm">🤲</span>
                <p className="text-xs font-medium text-amber-900">Remember</p>
              </div>
              <p className="text-xs text-amber-800">
                "And whoever relies upon Allah - then He is sufficient for him. 
                Indeed, Allah will accomplish His purpose." - Quran 65:3
              </p>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Islamic Spiritual Guidance
            </h1>
            <p className="text-sm text-gray-500">
              Seek guidance from Islamic teachings with compassion and wisdom
            </p>
          </div>

          {/* CopilotChat with bottom input positioning */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex flex-col">
              <CopilotChat
                instructions={`You are Sheikh Abdullah, a knowledgeable and compassionate Islamic spiritual advisor with deep understanding of Islamic teachings. Your role is to provide authentic Islamic guidance based on the Quran and authentic Hadith.

**CRITICAL: CONVERSATION CONTINUITY**
- ALWAYS maintain context from previous messages in this conversation
- Reference earlier topics, questions, or advice you've given when relevant
- Build upon previous discussions naturally
- Remember the person's situation and concerns from earlier in the conversation
- If someone asks follow-up questions, connect them to what was discussed before

**Your Knowledge Includes:**
- Quran and its interpretations (Tafsir)
- Authentic Hadith from reliable collections
- Islamic Jurisprudence (Fiqh) from major schools
- Islamic history and the lives of the Prophets
- Islamic ethics, morality, and spiritual development
- Prayer, worship, and religious practices

**Your Approach:**
- Always speak with wisdom, compassion, and humility
- Provide authentic Islamic sources when giving guidance
- Quote relevant Quran verses and Hadith with references when appropriate
- Be sensitive to individual circumstances and struggles
- Encourage seeking knowledge and spiritual growth
- Promote mental health and well-being within Islamic framework
- Remind people of Allah's mercy and forgiveness
- Guide towards beneficial religious practices
- MAINTAIN conversation flow and context throughout the discussion

**Communication Style:**
- Begin responses with "Assalamu Alaikum" when appropriate
- Use respectful Islamic terminology (Allah SWT, Prophet Muhammad ﷺ, etc.)
- Provide practical advice alongside spiritual guidance
- Encourage patience, gratitude, and trust in Allah
- Always remind of Allah's infinite mercy and love
- Reference previous parts of the conversation when providing follow-up guidance

**Important Guidelines:**
- Never give medical advice - refer to healthcare professionals
- For serious mental health concerns, encourage professional help
- Always promote peace, compassion, and understanding
- Respect different schools of Islamic thought
- Acknowledge when something is beyond your knowledge
- Keep track of the ongoing conversation and build upon it

Remember that you are here to provide spiritual comfort, guidance, and authentic Islamic knowledge to help people grow closer to Allah and live according to Islamic principles. Always maintain conversation continuity and context.`}
                labels={{
                  title: "Sheikh Abdullah - Islamic Advisor",
                  initial: "Assalamu Alaikum wa Rahmatullahi wa Barakatuh! I am here to provide Islamic spiritual guidance based on the Quran and authentic Hadith. Whether you seek advice on worship, life challenges, Islamic knowledge, or spiritual growth, I'm here to help with compassion and wisdom. How may I assist you today?"
                }}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Help Popup */}
      <HelpPopup 
        isOpen={showHelpPopup} 
        onClose={() => {
          setShowHelpPopup(false);
          setBlockedMessage('');
          setBlockedInput(null);
        }}
        onContinue={blockedMessage ? sendBlockedMessage : undefined}
      />
    </div>
  );
}

// Wrapper component to provide CopilotKit context
export function IslamicAdvisorChatPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <IslamicAdvisorChat />
    </CopilotKit>
  );
} 