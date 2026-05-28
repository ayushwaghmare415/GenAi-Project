import axiosInstance from "../api/axiosInstance"
import React, { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import {
  Code2,
  Monitor,
  Rocket,
  Send,
  X,
  MessageSquare,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Editor from "@monaco-editor/react"

function WebsiteEditor() {
  const { id } = useParams()
  const [showFullPreview, setShowFullPreview] = useState(false)

  const [website, setWebsite] = useState(null)
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [thinkingIndex, setThinkingIndex] =
    useState(0)
  const [showcode, setShowCode] = useState(false)
  const [showchat, setShowChat] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const iframeRef = useRef(null)
  const thinkingSteps = [
    "Understanding your request...",
    "Planning layout changes...",
    "Improving responsiveness...",
    "Applying animations...",
    "Finalizing updates...",
  ]

  // Fetch website data
  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        setUpdateLoading(true)

        const response = await axiosInstance.get(
          `/api/websites/get-by-id/${id}`,
          {
            withCredentials: true,
          }
        )

        setWebsite(response.data.website)
        setCode(
          response.data.website.latestCode || ""
        )
        setMessage(
          response.data.website.conversation || []
        )
      } catch (error) {
        console.log(error)

        setError(
          error.response?.data?.message ||
            "Something went wrong"
        )
      } finally {
        setUpdateLoading(false)
      }
    }

    handleGetWebsite()
  }, [id])

  // Thinking animation
  useEffect(() => {
    if (!updateLoading) return

    const interval = setInterval(() => {
      setThinkingIndex(
        (i) => (i + 1) % thinkingSteps.length
      )
    }, 1200)

    return () => clearInterval(interval)
  }, [updateLoading])

  // Send message
  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      role: "user",
      content: input,
    }

    setMessage((prev) => [...prev, userMessage])

    setSending(true)
    setUpdateLoading(true)

    try {
      const response = await axiosInstance.post(
        `/api/websites/${id}/update`,
        {
          prompt: input,
        },
        {
          withCredentials: true,
        }
      )

      setMessage(response.data.conversation || [])
      setCode(response.data.latestCode || "")
      setInput("")
    } catch (error) {
      console.log(error)

      setError(
        error.response?.data?.message ||
          "Failed to send message"
      )
    } finally {
      setSending(false)
      setUpdateLoading(false)
    }
  }

  const handleDeploy = async () => {
    try {
      const result = await axiosInstance.get(`/api/websites/${id}/deploy`, {
        withCredentials: true,
      })

      const deployUrl = result.data?.url

      if (deployUrl) {
        window.open(deployUrl, "_blank", "noopener,noreferrer")
        setWebsite((prev) =>
          prev && prev._id === id
            ? { ...prev, deployed: true, deployUrl }
            : prev
        )
      }
    } catch (error) {
      console.error(error)
      setError(error.response?.data?.message || "Deployment failed.")
    }
  }






  // Update iframe preview
  useEffect(() => {
    if (!iframeRef.current || !code) return

    const blob = new Blob([code], {
      type: "text/html",
    })

    const url = URL.createObjectURL(blob)

    iframeRef.current.src = url

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [code])

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-400">
        {error}
      </div>
    )
  }

  // Loading state
  if (!website) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  function Header({ onBack, showBack }) {
    return (
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
        <span className="font-semibold truncate">
          {website.title}
        </span>

        {showBack && (
          <button
            onClick={onBack}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
          >
            Back
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={
          sidebarOpen
            ? "hidden lg:flex w-[320px] min-h-0 flex-col border-r border-white/10 bg-black/80"
            : "hidden lg:hidden"
        }
      >
        <Header onBack={() => setSidebarOpen(false)} showBack={sidebarOpen} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
            {message.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] ${
                  m.role === "user"
                    ? "ml-auto"
                    : "mr-auto"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/10 text-zinc-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Thinking Loader */}
            {updateLoading && (
              <div className="max-w-[85%] mr-auto">
                <div className="px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic">
                  {thinkingSteps[thinkingIndex]}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                disabled={sending}
                placeholder="Describe changes..."
                className="flex-1 rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />

              <button
                onClick={handleSendMessage}
                disabled={
                  sending ||
                  updateLoading ||
                  !input.trim()
                }
                className="px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Preview */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80">
          <span className="text-xs text-zinc-400">
            Live Preview
          </span>

          <div className="flex gap-2">
            {!website.deployed && (
              <button
                onClick={handleDeploy}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition"
              >
                <Rocket size={14} />
                Deploy
              </button>
            )}

            {!sidebarOpen && (
              <button
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                onClick={() => setSidebarOpen(true)}
              >
                <MessageSquare size={18} />
                Open Chat
              </button>
            )}

            <button className="p-2 lg:hidden" onClick={() => setShowChat(true)}>
              <MessageSquare size={18} />
            </button>
            <button
              className="p-2"
              onClick={() => setShowCode(true)}
            >
              <Code2 size={18} />
            </button>

            <button className="p-2" onClick={() => setShowFullPreview(true)}>
              <Monitor size={18} />
            </button>
          </div>

        </div>

        <iframe
          ref={iframeRef}
          className="w-full h-full bg-white"
          title="preview"
        />
      </div>

      <AnimatePresence>
        {showchat && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-9999 bg-black/95 flex flex-col lg:hidden"
          >
            <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-semibold truncate">
                {website.title}
              </span>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {message.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] ${
                    m.role === "user"
                      ? "ml-auto"
                      : "mr-auto"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-white text-black"
                        : "bg-white/5 border border-white/10 text-zinc-200"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {updateLoading && (
                <div className="max-w-[85%] mr-auto">
                  <div className="px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic">
                    {thinkingSteps[thinkingIndex]}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                  placeholder="Describe changes..."
                  className="flex-1 rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={
                    sending ||
                    updateLoading ||
                    !input.trim()
                  }
                  className="px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showcode && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full lg:w-[45%] z-9999 bg-[#1e1e1e] flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm font-medium">
                index.html
              </span>

              <button
                onClick={() => setShowCode(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="html"
                value={code}
                theme="vs-dark"
                onChange={(value) =>
                  setCode(value || "")
                }
                options={{
                  fontSize: 14,
                  minimap: {
                    enabled: false,
                  },
                  wordWrap: "on",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-9999 bg-black/95 flex flex-col"
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowFullPreview(false)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <iframe
              className="flex-1 w-full bg-white"
              srcDoc={code}
              title="full-preview"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WebsiteEditor