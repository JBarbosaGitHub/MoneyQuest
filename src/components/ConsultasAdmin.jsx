import React, { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

const CONSULTATION_TYPES = [
  { value: 'planeamento-financeiro', label: 'Planeamento Financeiro', emoji: '📊' },
  { value: 'investimentos', label: 'Investimentos', emoji: '💼' },
  { value: 'reforma', label: 'Reforma', emoji: '🌴' },
  { value: 'credito', label: 'Crédito', emoji: '🏠' },
  { value: 'negocios', label: 'Negócios', emoji: '🏢' },
  { value: 'fiscal', label: 'Fiscal', emoji: '📋' },
  { value: 'seguros', label: 'Seguros', emoji: '🛡️' },
  { value: 'outros', label: 'Outros', emoji: '✨' }
]

export default function ConsultasAdmin() {
  const { currentUser } = useAuth()
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'planeamento-financeiro',
    duration: '',
    features: '',
    priceNote: '',
    active: true,
    order: 0
  })

  useEffect(() => {
    fetchConsultas()
  }, [])

  async function fetchConsultas() {
    try {
      setLoading(true)
      const snapshot = await getDocs(collection(db, 'consultas'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      data.sort((a, b) => (a.order || 0) - (b.order || 0))
      setConsultas(data)
    } catch (err) {
      console.error('Error fetching consultas:', err)
      alert('Erro ao carregar consultas')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      price: '',
      type: 'planeamento-financeiro',
      duration: '',
      features: '',
      priceNote: '',
      active: true,
      order: 0
    })
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(consulta) {
    setFormData({
      title: consulta.title || '',
      description: consulta.description || '',
      price: consulta.price || '',
      type: consulta.type || 'planeamento-financeiro',
      duration: consulta.duration || '',
      features: Array.isArray(consulta.features) ? consulta.features.join('\n') : '',
      priceNote: consulta.priceNote || '',
      active: consulta.active !== false,
      order: consulta.order || 0
    })
    setEditing(consulta.id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.price) {
      alert('Preencha os campos obrigatórios: título, descrição e preço')
      return
    }

    try {
      const consultaData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        type: formData.type,
        duration: formData.duration,
        features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
        priceNote: formData.priceNote,
        active: formData.active,
        order: parseInt(formData.order) || 0,
        updatedAt: new Date().toISOString()
      }

      if (editing) {
        await updateDoc(doc(db, 'consultas', editing), consultaData)
        alert('Consulta atualizada com sucesso!')
      } else {
        consultaData.createdAt = new Date().toISOString()
        await addDoc(collection(db, 'consultas'), consultaData)
        alert('Consulta criada com sucesso!')
      }

      resetForm()
      fetchConsultas()
    } catch (err) {
      console.error('Error saving consulta:', err)
      if (err.code === 'permission-denied') {
        alert('Erro de permissões: Verifique as regras do Firestore.')
      } else {
        alert('Erro ao guardar consulta: ' + err.message)
      }
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Tem a certeza que deseja eliminar esta consulta?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'consultas', id))
      alert('Consulta eliminada com sucesso!')
      fetchConsultas()
    } catch (err) {
      console.error('Error deleting consulta:', err)
      alert('Erro ao eliminar consulta: ' + err.message)
    }
  }

  async function toggleActive(id, currentActive) {
    try {
      await updateDoc(doc(db, 'consultas', id), {
        active: !currentActive,
        updatedAt: new Date().toISOString()
      })
      fetchConsultas()
    } catch (err) {
      console.error('Error toggling active:', err)
      alert('Erro ao atualizar estado: ' + err.message)
    }
  }

  if (!currentUser) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Admin - Consultas Financeiras</h2>
        <p>Faça login para aceder ao painel de administração</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>Admin - Consultas Financeiras</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '12px 24px',
            background: '#5DAD9E',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Fechar Formulário' : '+ Nova Consulta'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: '#f8f9fa',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '2px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: 0 }}>{editing ? 'Editar Consulta' : 'Nova Consulta'}</h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Preço (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Duração
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="ex: 60 minutos"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Ordem
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    fontSize: '16px'
                  }}
                >
                  {CONSULTATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Nota de Preço
                </label>
                <input
                  type="text"
                  value={formData.priceNote}
                  onChange={(e) => setFormData({ ...formData, priceNote: e.target.value })}
                  placeholder="ex: por sessão"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ced4da',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Características (uma por linha)
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={5}
                placeholder="Análise completa&#10;Relatório detalhado&#10;Acompanhamento"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold' }}>Ativa (visível no website)</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                padding: '12px 32px',
                background: '#5DAD9E',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {editing ? 'Atualizar' : 'Criar'} Consulta
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '12px 32px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>A carregar...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {consultas.map(consulta => (
            <div
              key={consulta.id}
              style={{
                background: 'white',
                border: '2px solid #dee2e6',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                opacity: consulta.active ? 1 : 0.6
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>
                    {CONSULTATION_TYPES.find(t => t.value === consulta.type)?.emoji || '✨'}
                  </span>
                  <h3 style={{ margin: 0 }}>{consulta.title}</h3>
                  {!consulta.active && (
                    <span style={{
                      background: '#dc3545',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      INATIVA
                    </span>
                  )}
                </div>
                <p style={{ margin: '8px 0', color: '#6c757d' }}>{consulta.description}</p>
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6c757d' }}>
                  <span><strong>Preço:</strong> {consulta.price}€</span>
                  {consulta.duration && <span><strong>Duração:</strong> {consulta.duration}</span>}
                  <span><strong>Ordem:</strong> {consulta.order || 0}</span>
                </div>
                {consulta.features && consulta.features.length > 0 && (
                  <div style={{ marginTop: '12px', fontSize: '14px' }}>
                    <strong>Características:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                      {consulta.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', marginLeft: '20px' }}>
                <button
                  onClick={() => handleEdit(consulta)}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(consulta.id, consulta.active)}
                  style={{
                    padding: '8px 16px',
                    background: consulta.active ? '#ffc107' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  {consulta.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleDelete(consulta.id)}
                  style={{
                    padding: '8px 16px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {consultas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              Nenhuma consulta criada ainda. Clique em "Nova Consulta" para começar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
