'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, Send, Mail, Linkedin, Github, Globe, Layers, X, BarChart, Code } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { v4 as uuidv4 } from 'uuid';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

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

export function useTypewriter(text: string, speed: number = 10) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, speed);

    return () => clearInterval(typingEffect);
  }, [text, speed]);

  return displayedText;
}

const AnimatedEllipsis = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((dot) => (
        <div
          key={dot}
          className="w-2 h-2 bg-[#F4EBD0] rounded-full animate-bounce"
          style={{
            animationDelay: `${dot * 0.1}s`,
            animationDuration: '0.6s',
          }}
        ></div>
      ))}
    </div>
  );
};

const VisualizeButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
  >
    <BarChart size={16} className="text-[#F4EBD0]" />
  </button>
);

const VisualizationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#F4EBD0] p-6 rounded-lg w-3/4 h-3/4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Data Visualization</h2>
        <div className="w-full h-5/6 bg-gray-200 flex items-center justify-center">
          <p className="text-xl text-gray-600">Dummy Visualization Placeholder</p>
        </div>
      </div>
    </div>
  );
};

const VisualizationPopup = ({ data, onClose }) => {
  if (!data) return null

  const colorPalette = [
    '#A4863D',
    '#E6E6FA',
    '#EDE7C7',
    '#E8C9CF',
    '#B76E79',
    '#A25524',
    '#808000',
    '#EBE6DE'
  ]

  const getRandomColors = (count: number) => {
    const shuffled = [...colorPalette].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const randomColors = getRandomColors(data.data.length);

  const chartConfig = {
    labels: data.labels,
    datasets: [
      {
        label: data.title,
        data: data.data,
        backgroundColor: randomColors.map(color => `${color}CC`),
        borderColor: randomColors,
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#F4EBD0',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: data.title,
        color: '#F4EBD0',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#F4EBD0', font: { size: 10 } },
        grid: { color: 'rgba(244, 235, 208, 0.1)' },
      },
      y: {
        ticks: { color: '#F4EBD0', font: { size: 10 } },
        grid: { color: 'rgba(244, 235, 208, 0.1)' },
      },
    },
  }

  const pieOptions = {
    ...options,
    plugins: {
      ...options.plugins,
      legend: {
        ...options.plugins.legend,
        position: 'bottom' as const,
      },
    },
    scales: undefined,
  }

  const renderChart = () => {
    switch (data.chartType) {
      case 'Bar Chart':
        return <Bar data={chartConfig} options={options} />
      case 'Line Chart':
        return <Line data={chartConfig} options={options} />
      case 'Pie Chart':
        return <Pie data={chartConfig} options={pieOptions} />
      case 'Scatter Plot':
        return <Scatter data={chartConfig} options={options} />
      case 'Histogram':
        return <Bar data={chartConfig} options={options} />
      default:
        return <p className="text-[#F4EBD0]">Unsupported chart type</p>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black bg-opacity-70 border border-[#A4863D] rounded-lg p-6 w-[70vw] h-[70vh] flex flex-col shadow-2xl backdrop-filter backdrop-blur-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-[#F4EBD0]">{data.title}</h2>
          <button
            onClick={onClose}
            className="text-[#F4EBD0] hover:text-[#A25524] transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow bg-black bg-opacity-50 rounded-lg p-4 overflow-hidden backdrop-filter backdrop-blur-md" style={{ height: 'calc(80vh - 4rem)' }}>
          <div className="w-full h-full">
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  )
}

const SqlQueryPopup = ({ query, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black bg-opacity-70 border border-[#A4863D] rounded-lg p-6 w-[70vw] h-[30vh] flex flex-col shadow-2xl backdrop-filter backdrop-blur-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-[#F4EBD0]">SQL Query</h2>
          <button
            onClick={onClose}
            className="text-[#F4EBD0] hover:text-[#A25524] transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow bg-black bg-opacity-50 rounded-lg p-4 overflow-auto backdrop-filter backdrop-blur-md" style={{ height: 'calc(95vh - 4rem)' }}>
          <pre className="text-[#F4EBD0] whitespace-pre-wrap font-mono text-sm">{query}</pre>
        </div>
      </div>
    </div>
  )
}

const MessageContent = ({ content, isUser, visualize_data, sql_query, onVisualize, onShowSqlQuery }) => {
  const typedContent = useTypewriter(content, 5);

  if (isUser) {
    return <p className="text-black">{content}</p>;
  }

  return (
    <div className="relative">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-2"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-800 rounded px-1" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {typedContent}
      </ReactMarkdown>
      <div className="absolute bottom-0 right-0 flex space-x-2 mt-2">
        {sql_query && (
          <button
            onClick={onShowSqlQuery}
            className="p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4EBD0]"
          >
            <Code size={16} className="text-[#F4EBD0]" />
          </button>
        )}
        {visualize_data && (
          <button
            onClick={onVisualize}
            className="p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4EBD0]"
          >
            <BarChart size={16} className="text-[#F4EBD0]" />
          </button>
        )}
      </div>
    </div>
  );
};

const ToggleViewButton = ({ onClick, isOverlayVisible }) => (
  <motion.button
    onClick={onClick}
    className="mr-4 text-[#F4EBD0] hover:text-white bg-black bg-opacity-30 p-2 rounded-full"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <Layers size={24} />
  </motion.button>
);

const ScrollableOverlay = ({ 
  messages, 
  isVisible, 
  onToggle, 
  scrollPageToBottom
}) => {
  useEffect(() => {
    if (isVisible) {
      scrollPageToBottom();
    }
  }, [isVisible, scrollPageToBottom]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="absolute inset-0 bottom-28 z-20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full h-full bg-black bg-opacity-30 backdrop-filter backdrop-blur-md border-[#F4EBD0] border-opacity-50 rounded-lg overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto p-6" style={{ minHeight: '60vh' }}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-[#F4EBD0] text-black' 
                        : 'bg-black bg-opacity-30 backdrop-blur-md text-[#F4EBD0] border-2 border-[#F4EBD0]'
                    }`}>
                      <MessageContent content={message.content} isUser={message.type === 'user'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FixedOverlay = ({ isFileUploaded, fileName, onToggleView, onRemoveFile, sidebarWidth }) => (
  <div 
    className="fixed top-0 z-50 flex items-center justify-between bg-black bg-opacity-70 backdrop-blur-md rounded-lg p-2"
    style={{
      left: `calc(${sidebarWidth}px + 1.5rem)`,
      right: '1.5rem',
      maxWidth: 'calc(100% - 3rem - ${sidebarWidth}px)',
    }}
  >
    <h1 className="text-2xl font-bold text-[#F4EBD0]">TableTalk</h1>
    <div className="flex items-center">
      <ToggleViewButton onClick={onToggleView} isOverlayVisible={false} />
      {isFileUploaded && (
        <div className="text-[#F4EBD0] text-sm ml-2 truncate">
          File: {fileName}
          <button 
            onClick={onRemoveFile}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            X
          </button>
        </div>
      )}
    </div>
  </div>
);

const handleFileUpload = async (file: File, sessionId: string | null) => {
  if (!sessionId) return; // Ensure we have a session ID

  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

  try {
    const response = await fetch('http://localhost:8000/upload_and_query', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    console.log('Upload successful:', result);

    setFileUploaded(true);
    setUploadedFile(file);

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Upload aborted');
    } else {
      console.error('Upload error:', error);
    }
    // Handle the error (e.g., show error message to user)
  } finally {
    clearTimeout(timeoutId);
  }
};

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

  const toggleScrollableOverlay = (_e) => {
    // Prevent toggling when clicking on the file upload area
    if (_e.target.closest('.file-upload-area')) return;
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