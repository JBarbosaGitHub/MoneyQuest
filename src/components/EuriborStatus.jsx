import React, { useEffect, useState } from 'react'
import EuriborService from '../services/EuriborService'

export default function EuriborStatus({ onRatesUpdate }) {
  const [lastUpdate, setLastUpdate] = useState(EuriborService.getLastUpdate())
  const [isFresh, setIsFresh] = useState(EuriborService.isDataFresh())
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    await EuriborService.forceUpdate()
    setLastUpdate(EuriborService.getLastUpdate())
    setIsFresh(EuriborService.isDataFresh())
    setLoading(false)
    onRatesUpdate?.()
  }

  useEffect(() => {
    let timer = setInterval(() => {
      setIsFresh(EuriborService.isDataFresh())
      setLastUpdate(EuriborService.getLastUpdate())
    }, 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', border:'1px solid #e9ecef', borderRadius:8, marginBottom:12}}>
      <div>
        <small className="h-12 fw-500" style={{color: isFresh ? '#198754' : '#d63384'}}>
          Última atualização: {lastUpdate}
        </small>
      </div>
      <button className="cus-btn" onClick={refresh} disabled={loading} style={{padding:'6px 12px'}}>
        {loading ? 'A atualizar…' : 'Atualizar taxas'}
      </button>
    </div>
  )
}
