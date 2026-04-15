export function triggerBackupDownload() {
  const backup = {
    freelog_settings: JSON.parse(localStorage.getItem('freelog_settings') || 'null'),
    freelog_data: JSON.parse(localStorage.getItem('freelog_data') || '{}'),
    freelog_favourites: JSON.parse(localStorage.getItem('freelog_favourites') || '{}'),
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const today = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `freelog_backup_${today}.json`
  a.click()
  URL.revokeObjectURL(url)
  localStorage.setItem('freelog_backup_date', new Date().toISOString())
}
