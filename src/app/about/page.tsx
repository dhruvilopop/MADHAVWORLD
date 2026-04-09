'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Target, Users, Leaf, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AboutContent {
  id: string
  section: string
  title: string | null
  content: string | null
  image: string | null
}

const stats = [
  { value: '28+', label: 'Years of Excellence' },
  { value: '500+', label: 'Products' },
  { value: '10K+', label: 'Happy Customers' },
  { value: '50+', label: 'Countries Served' },
]

const values = [
  {
    icon: Award,
    title: 'Quality First',
    description: 'We never compromise on the quality of our products. Every bag is crafted with precision and care.'
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'We constantly evolve with new designs, techniques, and materials to stay ahead of trends.'
  },
  {
    icon: Users,
    title: 'Customer Focus',
    description: 'Our customers are at the heart of everything we do. Your satisfaction is our priority.'
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    description: 'We are committed to eco-friendly manufacturing practices and sustainable sourcing.'
  },
]

const milestones = [
  { year: '1995', title: 'Founded', description: 'Started as a small workshop with a vision' },
  { year: '2000', title: 'First Export', description: 'Began exporting to international markets' },
  { year: '2010', title: 'Factory Expansion', description: 'Expanded to state-of-the-art facility' },
  { year: '2020', title: 'Digital Transformation', description: 'Embraced modern technology and e-commerce' },
]

export default function AboutPage() {
  const [content, setContent] = useState<Record<string, AboutContent>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/about')
      .then(r => r.json())
      .then((data: AboutContent[]) => {
        const contentMap: Record<string, AboutContent> = {}
        data.forEach(item => {
          contentMap[item.section] = item
        })
        setContent(contentMap)
        setIsLoading(false)
      })
      .catch(console.error)
  }, [])

  const heroContent = content['hero']
  const storyContent = content['story']
  const valuesContent = content['values']

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-amber-600 font-medium">About Us</span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6">
                <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                  {heroContent?.title || 'Crafting Excellence Since 1995'}
                </span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {heroContent?.content || 'Madhav World Bags Industry has been a pioneer in manufacturing premium quality bags for over two decades. Our commitment to quality, innovation, and customer satisfaction has made us a trusted name in the industry.'}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={heroContent?.image || 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800'}
                  alt="Our Factory"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-600">28+</p>
                  <p className="text-gray-600">Years of Excellence</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-amber-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <img
                src={storyContent?.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'}
                alt="Our Team"
                className="w-full rounded-3xl shadow-2xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="text-amber-600 font-medium">Our Journey</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-gray-900">
                {storyContent?.title || 'Our Story'}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {storyContent?.content || 'Founded in 1995, Madhav World Bags Industry started as a small workshop with a vision to create beautiful, high-quality bags. Today, we have grown into a state-of-the-art manufacturing facility, but our core values remain the same - quality, craftsmanship, and customer satisfaction.'}
              </p>
              <ul className="space-y-3">
                {['Premium quality materials', 'Skilled craftsmanship', 'Innovative designs', 'Global presence'].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-amber-600 font-medium">What Drives Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900">Our Core Values</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-amber-600 font-medium">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900">Key Milestones</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-amber-200" />
              
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center mb-8 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <span className="text-amber-600 font-bold text-lg">{milestone.year}</span>
                      <h3 className="text-xl font-semibold text-gray-900 mt-1">{milestone.title}</h3>
                      <p className="text-gray-600 mt-2">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-amber-600 rounded-full border-4 border-white" />
                  <div className="w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Work With Us?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/90 text-lg mb-8 max-w-2xl mx-auto"
          >
            Whether you need custom bags for your business or want to explore our collection, we're here to help.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/contact">
              <Button size="lg" className="bg-white text-amber-700 hover:bg-gray-100 px-8 gap-2">
                Get in Touch <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
