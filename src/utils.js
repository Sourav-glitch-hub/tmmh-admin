// src/utils.js — shared helper functions

export const statusBadge = (status) => {
  switch (status) {
    case 'Received':  return 'badge-amber'
    case 'Checking':  return 'badge-blue'
    case 'Repairing': return 'badge-orange'
    case 'Completed': return 'badge-green'
    default:          return 'badge-gray'
  }
}

export const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export const formatDateTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : ''