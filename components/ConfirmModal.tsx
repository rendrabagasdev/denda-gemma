'use client'

import { motion } from 'framer-motion'
import CartoonButton from './CartoonButton'
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Ya, Lanjutkan', 
  cancelText = 'Batal', 
  onConfirm, 
  onCancel,
  type = 'warning'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertTriangle size={48} className="text-secondary" />
      case 'info': return <Info size={48} className="text-accent" />
      default: return <AlertTriangle size={48} className="text-primary" />
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/40">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="cartoon-card w-full max-w-sm bg-white p-8 text-center relative border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)]"
      >
        <div className="flex justify-center mb-6">
          <div className={`p-5 rounded-[2rem] shadow-sm ${
            type === 'danger' ? 'bg-red-50' : type === 'info' ? 'bg-blue-50' : 'bg-yellow-50'
          }`}>
            {getIcon()}
          </div>
        </div>

        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-zinc-900">{title}</h3>
        <p className="font-medium text-zinc-500 mb-8 leading-relaxed px-2">{message}</p>

        <div className="space-y-3">
          <CartoonButton 
            variant={type === 'danger' ? 'secondary' : 'primary'} 
            className="w-full py-5 text-lg rounded-2xl shadow-lg"
            onClick={onConfirm}
          >
            {confirmText}
          </CartoonButton>
          <button 
            className="w-full py-2 font-bold uppercase text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors tracking-widest"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
