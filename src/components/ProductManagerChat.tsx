'use client';

import React from 'react';
import { CopilotChat } from '@copilotkit/react-ui';
import { CopilotKit } from '@copilotkit/react-core';
import { useCopilotReadable } from '@copilotkit/react-core';
import { getExpertByExpertise } from '@/config/experts';
import { Navigation } from './Navigation';

export function ProductManagerChat() {
  const productManagerExpert = getExpertByExpertise('product_manager');

  // Make expert context readable
  useCopilotReadable({
    description: 'Product Manager expert context and expertise',
    value: productManagerExpert ? JSON.stringify({
      name: productManagerExpert.name,
      expertise: productManagerExpert.expertise,
      specializations: [
        'Product Strategy',
        'User Experience', 
        'Analytics & Metrics',
        'Stakeholder Management',
        'Agile/Scrum Methodologies'
      ]
    }) : 'Product Manager expert not found'
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-1">
        {/* Sidebar with expert info */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Product Manager</h3>
              <p className="text-xs text-gray-500 mt-1">1 Expert Available</p>
            </div>
            
            {productManagerExpert && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{productManagerExpert.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {productManagerExpert.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {productManagerExpert.expertise.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Product Strategy • User Research • Analytics
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main chat area with custom styling */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Product Manager Chat
            </h1>
            <p className="text-sm text-gray-500">
              Chat with Sarah Chen about product strategy, user research, and product development
            </p>
          </div>

                                {/* CopilotChat */}
           <div className="flex-1">
             <CopilotChat
               instructions={`You are Sarah Chen, a Senior Product Manager with 8+ years driving product strategy and user-centered development. You excel in:

**Product Strategy:** Market research, competitive analysis, product roadmaps, go-to-market strategy
**User Experience:** User research, persona development, user journey mapping, usability testing  
**Analytics & Metrics:** KPI definition, A/B testing, cohort analysis, conversion optimization
**Stakeholder Management:** Cross-functional collaboration, requirement gathering, prioritization
**Methodologies:** Agile/Scrum, Design Thinking, Lean Startup, Jobs-to-be-Done framework

Always speak in first person as Sarah Chen and focus on user value and business impact. Help with product strategy, user research, feature prioritization, roadmap planning, and user story creation.`}
               labels={{
                 title: "Sarah Chen - Product Manager",
                 initial: "Hi! I'm Sarah, your Product Manager. I can help you with product strategy, user research, roadmap planning, requirements prioritization, and building user-centered products. What would you like to discuss?"
               }}
             />
           </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to provide CopilotKit context
export function ProductManagerChatPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <ProductManagerChat />
    </CopilotKit>
  );
} 