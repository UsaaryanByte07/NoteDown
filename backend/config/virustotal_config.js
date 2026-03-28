const fs = require('fs');
const FormData = require('form-data');

const VIRUSTOTAL_API_BASE_URL = 'https://www.virustotal.com/api/v3';

const submitFileForVirusScan = async (filePath) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await fetch(`${VIRUSTOTAL_API_BASE_URL}/files`, {
        method: 'POST',
        headers: {
            'x-apikey': process.env.VIRUSTOTAL_API_KEY,
            ...form.getHeaders(),
        },
        body: form,
    });

    if(!response.ok) {
        throw new Error(`Failed to submit file for scanning: ${response.status}`);
    }

    const data = await response.json();
    return data.data.id;
}

const getAnalysisResults   = async (analysisId) => {
    const response = await fetch(`${VIRUSTOTAL_API_BASE_URL}/analyses/${analysisId}`, {
        method: 'GET',
        headers: {
            'x-apikey': process.env.VIRUSTOTAL_API_KEY,
        },
    });

    if(!response.ok) {
        throw new Error(`Failed to get scan results: ${response.status}`);
    }

    const data = await response.json();

    return {
        status: data.data.attributes.status,
        stats: data.data.attributes.stats || null,
    }
}

module.exports = {
    submitFileForVirusScan,
    getAnalysisResults,
}