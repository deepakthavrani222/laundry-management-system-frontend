'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Ticket,
  CheckCircle,
  Clock,
  AlertTriangle,
  Key,
  Edit
} from 'lucide-react'
import { toast } from '@/components/ui/toast'

interface SupportUser {
  _id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  assignedBranch?: {
    _id: string
    name: string
  }
  ticketStats: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
  createdAt: string
  recentTickets?: Array<{
    _id: string
    ticketNumber: string
    title: string
    status: string
    priority: string
    createdAt: string
    raisedBy: {
      name: string
      email: string
    }
  }>
}

interface SupportUserDetailsModalProps {
  user: SupportUser
  onClose: () => void
  onUpdate: () => void
}

export default function SupportUserDetailsModal({ user, onClose, onUpdate }: SupportUserDetailsModalProps) {
  const [userDetails, setUserDetails] = useStat