'use server'

export async function convertDocxToPdf(base64Docx: string) {
  const secret = process.env.CONVERT_API_SECRET
  
  if (!secret) {
    console.error('SERVER ERROR: CONVERT_API_SECRET is missing in .env')
    return { success: false, error: 'Konfigurasi API Secret belum lengkap di server (.env).' }
  }

  try {
    const response = await fetch(`https://v2.convertapi.com/convert/docx/to/pdf?Secret=${secret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Parameters: [
          {
            Name: 'File',
            FileValue: {
              Name: 'undangan.docx',
              Data: base64Docx
            }
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('ConvertAPI Error:', errorData)
      throw new Error('Gagal mengonversi dokumen ke PDF via API')
    }

    const result = await response.json()
    return { 
      success: true, 
      pdfUrl: result.Files[0].Url 
    }
  } catch (error: any) {
    console.error('Server Action Error:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}
