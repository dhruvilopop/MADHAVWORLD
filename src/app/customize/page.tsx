'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Palette, Ruler, ShoppingBag, RotateCw, Check, Loader2, 
  Phone, Mail, Send, ChevronRight, ChevronLeft
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Bag style options
const bagStyles = [
  { id: 'tote', name: 'Tote Bag', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400' },
  { id: 'shoulder', name: 'Shoulder Bag', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' },
  { id: 'clutch', name: 'Clutch', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400' },
  { id: 'backpack', name: 'Backpack', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
  { id: 'handbag', name: 'Handbag', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400' },
  { id: 'crossbody', name: 'Crossbody', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400' },
]

// Color options
const colors = [
  { id: 'black', name: 'Classic Black', hex: '#1a1a1a' },
  { id: 'brown', name: 'Rich Brown', hex: '#8B4513' },
  { id: 'tan', name: 'Tan', hex: '#D2B48C' },
  { id: 'navy', name: 'Navy Blue', hex: '#1e3a5f' },
  { id: 'red', name: 'Bold Red', hex: '#DC143C' },
  { id: 'pink', name: 'Soft Pink', hex: '#FFB6C1' },
  { id: 'green', name: 'Forest Green', hex: '#228B22' },
  { id: 'beige', name: 'Natural Beige', hex: '#F5F5DC' },
  { id: 'grey', name: 'Slate Grey', hex: '#708090' },
  { id: 'white', name: 'Pure White', hex: '#FFFFFF' },
  { id: 'maroon', name: 'Maroon', hex: '#800000' },
  { id: 'purple', name: 'Royal Purple', hex: '#6B3FA0' },
]

// Material options
const materials = [
  { id: 'leather', name: 'Genuine Leather', desc: 'Premium, durable, ages beautifully' },
  { id: 'vegan', name: 'Vegan Leather', desc: 'Cruelty-free, eco-friendly' },
  { id: 'canvas', name: 'Canvas', desc: 'Lightweight, casual style' },
  { id: 'nylon', name: 'Nylon', desc: 'Water-resistant, durable' },
  { id: 'suede', name: 'Suede', desc: 'Soft, luxurious texture' },
  { id: 'nonwoven', name: 'Non-Woven', desc: 'Eco-friendly, affordable' },
]

// Handle options
const handleTypes = [
  { id: 'double', name: 'Double Handle' },
  { id: 'single', name: 'Single Handle' },
  { id: 'crossbody', name: 'Crossbody Strap' },
  { id: 'loop', name: 'Loop Handle' },
  { id: 'chain', name: 'Chain Strap' },
  { id: 'none', name: 'No Handle (Clutch)' },
]

// Size options
const sizes = [
  { id: 'small', name: 'Small', dimensions: '20x15x8 cm', capacity: '~2L' },
  { id: 'medium', name: 'Medium', dimensions: '30x22x12 cm', capacity: '~5L' },
  { id: 'large', name: 'Large', dimensions: '40x30x15 cm', capacity: '~10L' },
  { id: 'xlarge', name: 'Extra Large', dimensions: '50x35x20 cm', capacity: '~15L' },
]

// Print options
const printOptions = [
  { id: 'none', name: 'No Print', desc: 'Clean, minimal look' },
  { id: 'logo', name: 'Logo Print', desc: 'Your brand or ours' },
  { id: 'pattern', name: 'Pattern', desc: 'Custom patterns available' },
  { id: 'emboss', name: 'Embossed', desc: 'Textured, elegant finish' },
]

export default function CustomizePage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [rotation, setRotation] = useState(0)
  const { toast } = useToast()

  const [config, setConfig] = useState({
    style: '',
    color: '',
    material: '',
    handleType: '',
    size: '',
    print: '',
    quantity: 1,
    customNotes: '',
    name: '',
    email: '',
    phone: '',
  })

  const totalSteps = 7

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!config.name || !config.email || !config.phone) {
      toast({ title: 'Please fill all contact details', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/custom-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          email: config.email,
          phone: config.phone,
          style: config.style,
          color: config.color,
          material: config.material,
          handleType: config.handleType,
          size: config.size,
          print: config.print,
          quantity: config.quantity,
          customNotes: config.customNotes,
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast({ title: 'Inquiry submitted successfully!' })
      }
    } catch {
      toast({ title: 'Error submitting inquiry', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSelectedOptions = () => {
    return {
      style: bagStyles.find(s => s.id === config.style)?.name || '',
      color: colors.find(c => c.id === config.color)?.name || '',
      material: materials.find(m => m.id === config.material)?.name || '',
      handle: handleTypes.find(h => h.id === config.handleType)?.name || '',
      size: sizes.find(s => s.id === config.size)?.name || '',
      print: printOptions.find(p => p.id === config.print)?.name || '',
    }
  }

  const selectedColor = colors.find(c => c.id === config.color)
  const selectedStyle = bagStyles.find(s => s.id === config.style)

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Inquiry Submitted!</h1>
            <p className="text-slate-600 mb-8 max-w-md">
              Thank you for your custom bag inquiry. Our team will contact you within 24 hours with pricing and details.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-rose-500 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-slate-900">Design Your Custom Bag</h1>
            <p className="text-slate-600 mt-2">Create a bag that's uniquely yours</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {['Style', 'Color', 'Material', 'Handle', 'Size', 'Print', 'Details'].map((label, i) => (
                <span key={label} className={`text-xs font-medium ${step >= i + 1 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {label}
                </span>
              ))}
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="overflow-hidden border border-slate-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-800">Preview</h3>
                      <button 
                        onClick={() => setRotation(r => r + 45)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <RotateCw className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>

                    {/* 3D-like Preview */}
                    <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden mb-4">
                      <motion.div
                        animate={{ rotateY: rotation }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full flex items-center justify-center"
                        style={{ perspective: '1000px' }}
                      >
                        <div
                          className="relative w-48 h-48 rounded-xl shadow-2xl transition-all duration-300"
                          style={{
                            background: selectedColor?.hex || '#e5e5e5',
                            transform: `rotateY(${rotation}deg)`,
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          {/* Bag Shape Indicator */}
                          <div className="absolute inset-4 border-2 border-white/30 rounded-lg" />
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/20 rounded-full" />
                          {selectedStyle && (
                            <img
                              src={selectedStyle.image}
                              alt={selectedStyle.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay rounded-xl"
                            />
                          )}
                        </div>
                      </motion.div>

                      {/* Color overlay */}
                      <div 
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ background: selectedColor?.hex || 'transparent' }}
                      />
                    </div>

                    {/* Selected Options Summary */}
                    <div className="space-y-2 text-sm">
                      {Object.entries(getSelectedOptions()).map(([key, value]) => (
                        value && (
                          <div key={key} className="flex justify-between">
                            <span className="text-slate-500 capitalize">{key}:</span>
                            <span className="text-slate-700 font-medium">{value}</span>
                          </div>
                        )
                      ))}
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-slate-500">Quantity:</span>
                        <span className="text-slate-700 font-medium">{config.quantity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Selection Panel */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Style */}
                {step === 1 && (
                  <motion.div
                    key="style"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Bag Style</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {bagStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setConfig({ ...config, style: style.id })}
                          className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                            config.style === style.id 
                              ? 'border-rose-500 ring-2 ring-rose-200' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={style.image} alt={style.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white font-semibold">{style.name}</p>
                          </div>
                          {config.style === style.id && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Color */}
                {step === 2 && (
                  <motion.div
                    key="color"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Color</h2>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      {colors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setConfig({ ...config, color: color.id })}
                          className={`group p-4 rounded-2xl border-2 transition-all ${
                            config.color === color.id 
                              ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div 
                            className="w-16 h-16 rounded-xl mx-auto mb-3 shadow-inner border border-slate-100"
                            style={{ backgroundColor: color.hex }}
                          />
                          <p className="text-sm font-medium text-slate-700">{color.name}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Material */}
                {step === 3 && (
                  <motion.div
                    key="material"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Material</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {materials.map((material) => (
                        <button
                          key={material.id}
                          onClick={() => setConfig({ ...config, material: material.id })}
                          className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            config.material === material.id 
                              ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">{material.name}</p>
                              <p className="text-sm text-slate-500 mt-1">{material.desc}</p>
                            </div>
                            {config.material === material.id && (
                              <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Handle */}
                {step === 4 && (
                  <motion.div
                    key="handle"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Handle Type</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {handleTypes.map((handle) => (
                        <button
                          key={handle.id}
                          onClick={() => setConfig({ ...config, handleType: handle.id })}
                          className={`p-6 rounded-2xl border-2 text-center transition-all ${
                            config.handleType === handle.id 
                              ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <p className="font-medium text-slate-800">{handle.name}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Size */}
                {step === 5 && (
                  <motion.div
                    key="size"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Size</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setConfig({ ...config, size: size.id })}
                          className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            config.size === size.id 
                              ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <p className="font-semibold text-slate-800 text-lg">{size.name}</p>
                          <p className="text-slate-500 text-sm mt-1">{size.dimensions}</p>
                          <p className="text-slate-400 text-xs mt-1">Capacity: {size.capacity}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Print */}
                {step === 6 && (
                  <motion.div
                    key="print"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Print Options</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {printOptions.map((print) => (
                        <button
                          key={print.id}
                          onClick={() => setConfig({ ...config, print: print.id })}
                          className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            config.print === print.id 
                              ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <p className="font-semibold text-slate-800">{print.name}</p>
                          <p className="text-sm text-slate-500 mt-1">{print.desc}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 7: Contact Details */}
                {step === 7 && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Details</h2>
                    <div className="space-y-6 max-w-xl">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={config.name}
                            onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={config.email}
                            onChange={(e) => setConfig({ ...config, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={config.phone}
                            onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={config.quantity}
                            onChange={(e) => setConfig({ ...config, quantity: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={config.customNotes}
                          onChange={(e) => setConfig({ ...config, customNotes: e.target.value })}
                          placeholder="Any specific requirements or customizations..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                
                {step < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 gap-2"
                    disabled={
                      (step === 1 && !config.style) ||
                      (step === 2 && !config.color) ||
                      (step === 3 && !config.material) ||
                      (step === 4 && !config.handleType) ||
                      (step === 5 && !config.size) ||
                      (step === 6 && !config.print)
                    }
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit Inquiry
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
