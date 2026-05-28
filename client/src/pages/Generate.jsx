import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import axiosInstance from '../api/axiosInstance'

const PHASES = [
  "Analyzing Your idea...",
  "Designing Layout & structure...",
  "Writing HTML & CSS...",
  "Adding animation & interactions...",
  "Final quality checks...",
]

function Generate() {
  const navigate = useNavigate()

  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [phaseIndex, setPhaseIndex] = useState(0)

  const handleGenerateWebsite = async () => {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      setError("Please enter a description for your website")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await axiosInstance.post(
        '/api/websites/generate',
        {
          prompt: trimmedPrompt,
        }
      )

      console.log(result)

      setPrompt("")

      setProgress(100)

      if (result.data?.website?._id) {
        navigate(`/editor/${result.data.website._id}`)
      }
    } catch (error) {
      console.error("Generation error:", error)

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate website"

      setError(errorMessage)
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      setPhaseIndex(0)
      setProgress(0)
      return
    }

    let value = 0

    const interval = setInterval(() => {
      const increment =
        value < 20
          ? Math.random() * 8
          : value < 60
          ? Math.random() * 5
          : Math.random() * 2

      value += increment

      if (value >= 93) value = 93

      const phase = Math.floor(
        (value / 93) * (PHASES.length - 1)
      )

      setProgress(Math.floor(value))
      setPhaseIndex(phase)
    }, 400)

    return () => clearInterval(interval)
  }, [loading])

  return (
    <div className="min-h-screen bg-linear-to-b from-[#050505] via-[#0b0b0b] to-[#050505] text-white">

      {/* Navbar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} />
            </button>

            <h1 className="text-lg font-semibold">
              Genweb.<span className="text-zinc-400">ai</span>
            </h1>
          </div>

          <button
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition"
            onClick={() => navigate("/generate")}
          >
            + New Website
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Build Websites with{" "}
            <span className="block bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Real AI Power
            </span>
          </h1>

          <p className="text-zinc-400 max-w-2xl mx-auto">
            This process may take several minutes.
            genweb.ai focuses on quality, not shortcuts.
          </p>
        </motion.div>

        {/* Input */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold mb-4">
            Describe your website
          </h2>

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              placeholder="Describe the website in detail..."
              className="w-full h-56 p-6 rounded-3xl bg-black/60 border border-white/10 outline-none resize-none text-sm leading-relaxed focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleGenerateWebsite}
            disabled={!prompt.trim() || loading}
            className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              prompt.trim() && !loading
                ? "bg-white text-black hover:shadow-xl"
                : "bg-white/20 text-zinc-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Generating..." : "Generate Website"}
          </motion.button>
        </div>

        {/* Progress */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto mt-12"
          >
            <div className="flex justify-between mb-2 text-sm text-zinc-400">
              <span>{PHASES[phaseIndex]}</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-white to-zinc-300"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.5 }}
              />
            </div>

            <div className="text-center text-xs text-zinc-400 mt-4">
              Estimated time remaining...
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Generate