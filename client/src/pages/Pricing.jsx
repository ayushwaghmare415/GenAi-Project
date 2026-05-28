import { ArrowLeft } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import axiosInstance from '../api/axiosInstance'

const plans = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    creadits: "100",
    description: "Perfect to explore GenWeb.ai",
    features: [
      "Ai website generation",
      "Responsive HTML output",
      "Basic animations"
    ],
    popular: false,
    button: "Get Started"
  },{
    key: "pro",
    name: "Pro",
    price: "₹499",
    creadits: "500",
    description: "For serious creators and professionals",
    features: [
      "Everything in Free",
      "Fast generation",
      "Edit & regenerate",
      "Download source code",
    ],
    popular: true,
    button: "Upgrade to Pro",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "₹1499",
    creadits: "1000",
    description: "For teams & power users",
    features: [
      "Unlimited iterations",
      "High priority",
      "Team collaboration",
      "Dedicated support"
    ],
    popular: false,
    button: "Contact Sales"
  }
]
function Pricing() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(null)

  const handleBuy = async (planType) => {
    if (!userData) {
      navigate('/')
      return
    }

    if (planType === 'free') {
      navigate('/dashboard')
      return
    }

    setLoading(planType)

    try {
      const result = await axiosInstance.post('/api/billing', { planType })

      if (result?.data?.sessionUrl) {
        window.location.href = result.data.sessionUrl
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(null)
    }
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white px-6 pt-16 pb-24">

      <div className="absolute inset-0 pointer-events-none">
        <div className='absolute -top-40 -left-40 w-125 h-125 bg-indigo-600/20 rounded-full blur-[120px]' />
        
        {/* Fixed h[400px] → h-[400px] */}
        <div className='absolute bottom-0 right-0 w-100 h-100 bg-purple-600/20 rounded-full blur-[120px]' />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl">
        <button
          className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-12 mb-14 max-w-4xl text-center"
        >
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Simple, transparent pricing</h1>
          <p className="text-lg text-zinc-400">Buy credits once. Build anytime.</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.key}
              onClick={() => handleBuy(plan.key)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className={`relative rounded-3xl border p-6 shadow-2xl backdrop-blur-xl transition-all ${
                plan.popular
                  ? "border-indigo-500 bg-linear-to-b from-indigo-500/20 to-transparent shadow-indigo-500/30"
                  : "border-white/10 bg-white/5 hover:border-indigo-400 hover:bg-white/10"
              }`}
            >
              {plan.popular && (
                <span className="absolute right-5 top-5 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">{plan.name}</p>
              <h2 className="mt-3 text-3xl font-semibold">{plan.price}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-coins text-yellow-400" aria-hidden="true">
                  <path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"></path>
                  <path d="M15 6h1v4"></path>
                  <path d="m6.134 14.768.866-.5 2 3.464"></path>
                  <circle cx="16" cy="8" r="6"></circle>
                </svg>
                {plan.creadits} Credits
              </p>
              <p className="mt-4 text-zinc-300">{plan.description}</p>

              <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  plan.popular
                    ? "bg-indigo-500 text-white hover:bg-indigo-400"
                    : "bg-white/8 text-white hover:bg-white/12"
                } ${loading === plan.key ? "cursor-not-allowed opacity-70" : ""}`}
                type="button"
                onClick={() => handleBuy(plan.key)}
                disabled={loading === plan.key}
              >
                {loading === plan.key ? "Processing..." : plan.button}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Pricing