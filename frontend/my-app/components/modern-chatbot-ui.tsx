'use client'

import React, { useState, useRef, useEffect } from 'react'
// import { useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
// import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
// import { Progress } from '@/components/ui/progress'
// import { Switch } from '@/components/ui/switch'
// import { Mic, Play, Pause, Send, Upload, X, ChevronRight, ChevronLeft, List } from 'lucide-react'
import { Send, Upload, X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { useTypewriter } from './useTypewriter'
import { AnimatedEllipsis } from './AnimatedEllipsis'
import { VisualizeButton } from './VisualizeButton'
import { VisualizationModal } from './VisualizationModal'
import { VisualizationPopup } from './VisualizationPopup'
import { SqlQueryPopup } from './SqlQueryPopup'
import { MessageContent } from './MessageContent'
import { ToggleViewButton } from './ToggleViewButton'
import { ScrollableOverlay } from './ScrollableOverlay'
import { FixedOverlay } from './FixedOverlay'
import { handleFileUpload } from './handleFileUpload'
import { v4 as uuidv4 } from 'uuid'

interface VisualizeData {
  chartType: 'Bar Chart' | 'Line Chart' | 'Pie Chart' | 'Scatter Plot' | 'Histogram'
  labels: string[]
  data: number[]
  title: string
}

interface Message {
  type: 'user' | 'bot'
  content: string
  visualize_data: VisualizeData | null
  sql_query: string | null  // Add this line
}

export function ModernChatbotUi() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScrollableOverlayVisible, setIsScrollableOverlayVisible] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(isSidebarOpen ? 256 : 32); // 256px for open, 32px for closed
  const [isVisualizationVisible, setIsVisualizationVisible] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentVisualization, setCurrentVisualization] = useState<VisualizeData | null>(null)
  const [sqlQuery, setSqlQuery] = useState<string | null>(null)
  const [isSqlQueryVisible, setIsSqlQueryVisible] = useState(false)

  useEffect(() => {
    setSidebarWidth(isSidebarOpen ? 256 : 32);
  }, [isSidebarOpen]);

  useEffect(() => {
    // Check if a session ID exists in localStorage
    let existingSessionId = localStorage.getItem('chatSessionId');
    
    if (!existingSessionId) {
      // If no session ID exists, generate a new one
      existingSessionId = uuidv4();
      localStorage.setItem('chatSessionId', existingSessionId);
    }
    
    setSessionId(existingSessionId);
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const scrollPageToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Scroll to bottom when messages change or when overlay is toggled
  useEffect(() => {
    scrollPageToBottom();
  }, [messages, isScrollableOverlayVisible]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setFileUploaded(true);
      console.log('File set:', file.name);  // For debugging

      setIsUploading(true);
      // Simulating file upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setMessages(prev => [...prev, { type: 'user', content: `File uploaded successfully: ${file.name}`, visualize_data: null, sql_query: null }]);
        }
      }, 200);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleMouseMove = (event: React.MouseEvent) => {
    cursorX.set(event.clientX)
    cursorY.set(event.clientY)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' && !uploadedFile) return;

    setMessages(prev => [...prev, { type: 'user', content: input || 'File uploaded', visualize_data: null, sql_query: null }]);
    setInput('');
    setIsLoading(true);

    let body;
    let headers = {};

    if (uploadedFile) {
      // If there's a file, use FormData
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('query', input);
      formData.append('session_id', sessionId);
      body = formData;
    } else {
      // If there's no file, send JSON
      body = JSON.stringify({
        query: input,
        session_id: sessionId
      });
      headers = {
        'Content-Type': 'application/json'
      };
    }

    try {
      const response = await fetch('http://localhost:8000/upload_and_query', {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.sql_query) {
        setSqlQuery(data.sql_query)
      }
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: data.response, 
        visualize_data: data.visualize_data,
        sql_query: data.sql_query || null  // Add this line
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Sorry, there was an error processing your request. Error details: ${error.message}`, 
        visualize_data: null, 
        sql_query: null  // Add this line
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Here you would implement actual voice recording logic
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleScrollableOverlay = (e) => {
    // Prevent toggling when clicking on the file upload area
    if (e.target.closest('.file-upload-area')) return;
    setIsScrollableOverlayVisible(!isScrollableOverlayVisible);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFileUploaded(false);
    setUploadedFile(null);
  };

  const handleVisualize = (visualize_data: VisualizeData) => {
    setCurrentVisualization(visualize_data)
    setIsVisualizationVisible(true)
  }

  const closeVisualization = () => {
    setIsVisualizationVisible(false)
    setCurrentVisualization(null)
  }

  const handleShowSqlQuery = useCallback((query: string | null) => {
    if (query) {
      setSqlQuery(query);
      setIsSqlQueryVisible(true);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-black">
      <FixedOverlay 
        isFileUploaded={fileUploaded}
        fileName={uploadedFile?.name}
        onToggleView={(e) => {
          e.stopPropagation();
          toggleScrollableOverlay(e);
        }}
        onRemoveFile={handleRemoveFile}
        sidebarWidth={sidebarWidth}
      />

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`bg-[#F4EBD0] transition-all duration-300 ease-in-out flex flex-col ${
            isSidebarOpen ? 'w-64' : 'w-8'
          }`}
        >
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-4 bg-black text-[#F4EBD0] hover:bg-gray-800 transition-colors self-end"
          >
            {isSidebarOpen ? '<<' : '>>'}
          </button>
          {isSidebarOpen && (
            <div className="p-4 flex-grow flex flex-col justify-between overflow-y-auto text-black">
              <div>
                <h2 className="text-2xl font-bold mb-4">TableTalk</h2>
                <p className="mb-4">Version: 1.0.0</p>

                <h3 className="text-xl font-semibold mb-2">About</h3>
                <p className="mb-4">An advanced AI-powered chatbot for intelligent table data analysis and query.</p>

                <h3 className="text-xl font-semibold mb-2">How it Works</h3>
                <p className="mb-4">
                  TableTalk uses advanced AI agents to understand user queries, generate appropriate database queries, 
                  process and summarize results, and ensure accuracy and relevance.
                </p>
              </div>

              <div className="mt-auto">
                <h3 className="text-xl font-semibold mb-2">Developer</h3>
                <p>Sarthak Vajpayee</p>
                <p className="mb-4">AI Engineer</p>
                <div className="flex flex-col space-y-2">
                  <a
                    href="mailto:sarthak.vajpayee05@gmail.com"
                    className="flex items-center text-black hover:text-sap-green transition-colors"
                  >
                    <Mail size={20} className="mr-2" />
                    <span>Email</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/sarthak-vajpayee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-black hover:text-sap-green transition-colors"
                  >
                    <Linkedin size={20} className="mr-2" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://github.com/sarthakv7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-black hover:text-sap-green transition-colors"
                  >
                    <Github size={20} className="mr-2" />
                    <span>Github</span>
                  </a>
                  <a
                    href="https://sarthakv7.github.io/my-portfilio/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-black hover:text-sap-green transition-colors"
                  >
                    <Globe size={20} className="mr-2" />
                    <span>Portfolio</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-grow flex flex-col relative pt-4"> {/* Added pt-16 for top padding */}
          <div className="flex-grow p-6 overflow-y-auto">
            <motion.div 
              className="w-full h-full bg-black bg-opacity-50 backdrop-blur-lg border-[#F4EBD0] border-opacity-50 rounded-lg overflow-hidden flex flex-col"
              animate={{ scale: isScrollableOverlayVisible ? 0.0001 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6" style={{ minHeight: '60vh' }}>
                {!fileUploaded && (
                  <div {...getRootProps()} className="file-upload-area border-2 border-dashed border-[#F4EBD0] rounded-lg p-4 text-center cursor-pointer hover:border-opacity-100 transition-colors mb-4 mt-4"> {/* Added mt-4 */}
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-16 mx-auto mb-2 text-[#F4EBD0]" />
                    {isDragActive ? (
                      <p className="text-[#F4EBD0]">Drop the files here ...</p>
                    ) : (
                      <p className="text-[#F4EBD0]">Drag 'n' drop some files here, or click to select files</p>
                    )}
                  </div>
                )}

                {/* Messages area */}
                <div className="space-y-4 relative" style={{ height: `${Math.max(messages.length, 3) * 20 + 100}px` }}>
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`absolute w-full transition-all duration-300 ease-in-out ${
                        index === messages.length - 1 || (index === messages.length - 2 && message.type === 'user') ? 'z-10' : 'z-0'
                      }`}
                      style={{
                        top: `${index * 20}px`,
                        filter: index === messages.length - 1 || (index === messages.length - 2 && message.type === 'user') ? 'none' : 'blur(2px)',
                        opacity: 1 - (messages.length - 1 - index) * 0.2,
                      }}
                    >
                      <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-2xl ${
                          message.type === 'user' 
                            ? 'bg-[#F4EBD0] text-black' 
                            : 'bg-black bg-opacity-30 backdrop-blur-md text-[#F4EBD0] border-2 border-[#F4EBD0]'
                        }`}>
                          <MessageContent 
                            content={message.content} 
                            isUser={message.type === 'user'} 
                            visualize_data={message.visualize_data}
                            sql_query={message.sql_query}
                            onVisualize={() => handleVisualize(message.visualize_data)}
                            onShowSqlQuery={() => handleShowSqlQuery(message.sql_query)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="absolute w-full" style={{ top: `${messages.length * 20}px` }}>
                      <div className="flex justify-start">
                        <div className="max-w-[70%] p-3 rounded-2xl bg-black bg-opacity-70 backdrop-blur-md text-[#F4EBD0] border-2 border-[#F4EBD0] flex items-center">
                          <span className="mr-2">Thinking</span>
                          <AnimatedEllipsis />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Scrollable Overlay */}
            <ScrollableOverlay 
              messages={messages}
              isVisible={isScrollableOverlayVisible}
              onToggle={toggleScrollableOverlay}
              scrollPageToBottom={scrollPageToBottom}
            />
          </div>

          {/* Bottom input area */}
          <div className="bg-[#F4EBD0] p-4 h-24">
            <form onSubmit={handleSend} className="flex items-center space-x-2 h-full max-w-6xl mx-auto">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask questions about your data..."
                className="flex-grow bg-black border-black text-[#F4EBD0] text-lg placeholder-[#F4EBD0] placeholder-opacity-50 h-full rounded-full px-4"
              />
              {/* <Button 
                type="button" 
                onClick={toggleRecording} 
                className={`bg-black hover:bg-gray-800 text-[#F4EBD0] h-full aspect-square rounded-full ${isRecording ? 'animate-pulse' : ''}`}
              >
                <Mic className="w-6 h-6" />
              </Button> */}
              <Button type="submit" className="bg-black hover:bg-gray-800 text-[#F4EBD0] h-full aspect-square rounded-full">
                <Send className="w-6 h-6" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Visualization Popup */}
      {isVisualizationVisible && (
        <VisualizationPopup data={currentVisualization} onClose={closeVisualization} />
      )}
      {isSqlQueryVisible && sqlQuery && (
        <SqlQueryPopup
          query={sqlQuery}
          onClose={() => setIsSqlQueryVisible(false)}
        />
      )}
    </div>
  );
}
```
</rewritten_file>