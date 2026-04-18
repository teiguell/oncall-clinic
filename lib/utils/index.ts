import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ConsultationStatus, ServiceType, SERVICES } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

export function formatCurrencyFromEuros(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function calculateCommission(price: number, rate: number = 0.15) {
  const commission = Math.round(price * rate)
  const doctorAmount = price - commission
  return { commission, doctorAmount }
}

export function getStatusLabel(status: ConsultationStatus): string {
  const labels: Record<ConsultationStatus, string> = {
    pending: 'Buscando médico',
    accepted: 'Médico asignado',
    in_progress: 'En camino',
    arrived: 'Médico llegó',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }
  return labels[status]
}

export function getStatusColor(status: ConsultationStatus): string {
  const colors: Record<ConsultationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-indigo-100 text-indigo-800',
    arrived: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

export function getStatusStep(status: ConsultationStatus): number {
  const steps: Record<ConsultationStatus, number> = {
    pending: 0,
    accepted: 1,
    in_progress: 2,
    arrived: 3,
    completed: 4,
    cancelled: -1,
  }
  return steps[status]
}

export function getService(type: ServiceType) {
  return SERVICES.find(s => s.value === type)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { locale: es, addSuffix: true })
}

export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function estimateArrivalTime(distanceKm: number): number {
  // Asume velocidad promedio en ciudad: 30 km/h
  const minutes = (distanceKm / 30) * 60
  return Math.ceil(minutes)
}

export function generateConsultationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'OC-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
