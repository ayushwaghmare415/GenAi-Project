import React, { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"

function LiveSite() {
  const { id } = useParams()
  const [website, setWebsite] = useState(null)
  const [code, setCode] = useState("")
  const [message, setMessage] = useState([])
  const [error, setError] = useState("")
  const iframeRef = useRef(null)

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axiosInstance.get(`/api/websites/get-by-slug/${id}`, {
          withCredentials: true,
        })

        setWebsite(result.data?.website || null)
        setCode(result.data?.website?.latestCode || "")
        setMessage(result.data?.website?.conversation || [])
      } catch (error) {
        console.log(error)
        setError(error.response?.data?.message || "Something went wrong")
      }
    }

    if (id) {
      handleGetWebsite()
    }
  }, [id])

  

  useEffect(() => {
    if (!iframeRef.current || !code) return

    const blob = new Blob([code], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    iframeRef.current.src = url

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [code])

  if(error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        {error}
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      title="Live Site"
      className="w-screen h-screen border-none"
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  )
}

export default LiveSite
