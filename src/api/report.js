import axiosInstance from '@/axios/axios'

export const reportApi = {
    getReports() {
        return axiosInstance.get('/report/list')
    },
    
    generateReport(reportType) {
        return axiosInstance.post('/report/generate', {
            report_type: reportType
        })
    },
    
    getReport(reportId) {
        return axiosInstance.get(`/report/${reportId}`)
    },
    
    downloadReport(reportId) {
        return axiosInstance.get(`/report/${reportId}/download`, {
            responseType: 'blob'
        })
    }
} 