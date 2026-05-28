import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import { ArrowLeft, Check, Share2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { setUserData } from '../redux/userSlice'

function Dashboard() {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const displayName = userData?.name || userData?.displayName || 'User'
  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(null)

  const getShareUrl = (site) => {
    const rawUrl = typeof site?.deployUrl === 'string' ? site.deployUrl.trim() : ''

    if (rawUrl && /^https?:\/\//i.test(rawUrl) && !rawUrl.includes('undefinedsite/')) {
      return rawUrl
    }

    if (site?.slug) return `${window.location.origin}/site/${site.slug}`
    return ''
  }

  const handleDeploy = async (id) => {
    try {
      const result = await axiosInstance.get(`/api/websites/${id}/deploy`)
      const deployUrl = result.data?.url

      if (deployUrl) {
        window.open(deployUrl, '_blank', 'noopener,noreferrer')
        setWebsites((prev) =>
          prev.map((website) =>
            website._id === id
              ? { ...website, deployed: true, deployUrl: result.data.url }
              : website
          )
        )
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Deployment failed.')
    }
  }

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id')

    if (sessionId && userData?._id) {
      const confirmPayment = async () => {
        try {
          const { data } = await axiosInstance.post('/api/billing/confirm-payment', { sessionId })
          if (data?.user) {
            dispatch(setUserData(data.user))
            localStorage.setItem('user', JSON.stringify(data.user))
          }
        } catch (err) {
          console.error('Failed to confirm payment:', err)
        }
      }

      confirmPayment()
    }
  }, [dispatch, location.search, userData?._id])

  useEffect(() => {
    const fetchWebsites = async () => {
      setLoading(true)
      try {
        const result = await axiosInstance.get('/api/websites/get-all')
        setWebsites(result.data?.websites || [])
      } catch (error) {
        console.log(error)
        setError(error.response?.data?.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWebsites()
  }, [])

  const handleCopy = async (site) => {
    const shareUrl = getShareUrl(site)
    if (!shareUrl) return

    await navigator.clipboard.writeText(shareUrl)
    setCopied(site._id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className='min-h-screen bg-[#050505] text-white'>
      <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button className='p-2 rounded-lg hover:bg-white/10 transition' onClick={() => navigate("/")} ><ArrowLeft size={16} /></button>
            <h1 className='text-lg font-semibold'>Dashboard</h1>
          </div>
          <button className='px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition' onClick={() => navigate("/generate")}>
            +New Website
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className='text-xm text-zinc-400 mb-1'>Welcome Back</p>
          <h1 className='text-3xl font-bold'>{displayName}</h1>
        </motion.div>
        {loading && (
          <div className="mt-24 text-center text-zinc-400">Loading Your Websites...</div>
        )}
        {error && !loading && (
          <div className="mt-24 text-center text-zinc-400">{error}</div>
        )}

        {!loading && !error && websites?.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
            {websites.map((w, i) => {
              const isCopied = copied === w._id

              return (
                <motion.div
                  key={w._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/editor/${w._id}`)}
                  className='rounded-2xl bg-white/5 border-white/10 overflow-hidden hover:bg-white/10 transition flex flex-col'
                >
                <div className='relative h-40 bg-black cursor-pointer'>
                  <iframe srcDoc={w.latestCode || ""} className='absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white' />
                  <div className='absolute inset-0 bg-black/30' />
                </div>

                <div className='p-5 flex flex-col gap-4 flex-1'>
                  <h3 className='text-base font-semibold line-clamp'>{w.title}</h3>
                  <p className='text-xs text-zinc-400'>Last Updated {""}
                    {new Date(w.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className='p-4 border-t border-white/5 bg-black/5 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => navigate(`/editor/${w._id}`)}
                      className='px-3 py-1 rounded-lg bg-white/10 text-sm hover:bg-white/20'
                    >
                      Open
                    </button>

                    {w.deployed ? (
                      <button
                        onClick={() => {
                          const shareUrl = getShareUrl(w)
                          if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer')
                        }}
                        className='px-3 py-1 rounded-lg bg-emerald-600 text-sm text-white'
                      >
                        Deployed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeploy(w._id)}
                        className='px-3 py-1 rounded-lg bg-green-600 text-sm text-white hover:scale-105 transition'
                      >
                        Deploy
                      </button>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCopy(w)}
                      className={`mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/10 hover:bg-white/20 border border-white/10'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} />
                          Link Copied
                        </>
                      ) : (
                        <>
                          <Share2 size={14} />
                          Share Link
                        </>
                      )}
                    </motion.button>
                  </div>

                  {getShareUrl(w) && (
                    <a
                      href={getShareUrl(w)}
                      target="_blank"
                      rel="noreferrer"
                      className='text-xs text-zinc-400 hover:underline'
                    >
                      Visit live site
                    </a>
                  )}
                </div>
              </motion.div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard
