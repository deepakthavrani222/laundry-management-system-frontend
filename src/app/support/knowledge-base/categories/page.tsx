'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Category {
  _id: string
  name: string
  description?: string
  color: string
  icon: stri