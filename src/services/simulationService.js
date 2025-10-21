import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Service for managing user simulations in Firestore
 */
export const simulationService = {
  /**
   * Save a simulation to the user's account
   * @param {string} userId - The user's Firebase UID
   * @param {Object} simulationData - The simulation data to save
   * @returns {Promise<string>} - The saved simulation's ID
   */
  async saveSimulation(userId, simulationData) {
    try {
      const docRef = await addDoc(collection(db, 'simulations'), {
        userId,
        ...simulationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      return docRef.id
    } catch (error) {
      console.error('Error saving simulation:', error)
      throw new Error('Erro ao guardar simulação: ' + error.message)
    }
  },

  /**
   * Get all simulations for a user
   * @param {string} userId - The user's Firebase UID
   * @returns {Promise<Array>} - Array of user's simulations
   */
  async getUserSimulations(userId) {
    try {
      const q = query(
        collection(db, 'simulations'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const simulations = []
      querySnapshot.forEach((doc) => {
        simulations.push({
          id: doc.id,
          ...doc.data()
        })
      })
      return simulations
    } catch (error) {
      console.error('Error fetching simulations:', error)
      throw new Error('Erro ao carregar simulações: ' + error.message)
    }
  },

  /**
   * Delete a simulation
   * @param {string} simulationId - The simulation's ID
   */
  async deleteSimulation(simulationId) {
    try {
      await deleteDoc(doc(db, 'simulations', simulationId))
    } catch (error) {
      console.error('Error deleting simulation:', error)
      throw new Error('Erro ao eliminar simulação: ' + error.message)
    }
  },

  /**
   * Export simulations to CSV format
   * @param {Array} simulations - Array of simulations to export
   * @param {string} simulatorType - Type of simulator (for filename)
   * @returns {string} - CSV content
   */
  exportToCSV(simulations, simulatorType = 'simulacoes') {
    if (!simulations || simulations.length === 0) {
      return ''
    }

    // Get all unique keys from all simulations
    const allKeys = new Set()
    simulations.forEach(sim => {
      Object.keys(sim).forEach(key => {
        if (key !== 'userId' && key !== 'id') {
          allKeys.add(key)
        }
      })
    })

    const headers = Array.from(allKeys)
    const csvRows = []

    // Add header row
    csvRows.push(headers.join(','))

    // Add data rows
    simulations.forEach(sim => {
      const values = headers.map(header => {
        const value = sim[header]
        // Escape commas and quotes in values
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      csvRows.push(values.join(','))
    })

    return csvRows.join('\n')
  },

  /**
   * Download CSV file
   * @param {string} csvContent - CSV content to download
   * @param {string} filename - Name of the file
   */
  downloadCSV(csvContent, filename = 'simulacoes.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
