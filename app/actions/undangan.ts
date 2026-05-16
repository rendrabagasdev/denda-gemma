'use server'

export async function convertDocxToPdf(base64Docx: string) {
  const secret = process.env.CONVERT_API_SECRET
  
  if (!secret) {
    console.error('SERVER ERROR: CONVERT_API_SECRET is missing in .env')
    return { success: false, error: 'Konfigurasi API Secret belum lengkap di server (.env).' }
  }

  console.log(`PDF Conversion started. Base64 length: ${base64Docx.length} chars (~${Math.round(base64Docx.length * 0.75 / 1024)} KB)`)

  try {
    const formData = new FormData();
    formData.append('File', new Blob([Buffer.from(base64Docx, 'base64')], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'undangan.docx');
    formData.append('StoreFile', 'true');

    const response = await fetch(`https://v2.convertapi.com/convert/docx/to/pdf?Secret=${secret}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = 'Gagal mengonversi dokumen ke PDF via API';
      try {
        const errorData = await response.json();
        console.error('ConvertAPI Error:', errorData);
        errorMessage = errorData.Message || errorMessage;
      } catch (e) {
        const errorText = await response.text();
        console.error('ConvertAPI Raw Error:', errorText);
      }
      return { success: false, error: errorMessage };
    }

    const result = await response.json();
    if (!result.Files || !result.Files[0]) {
      throw new Error('Respon API tidak valid: Data file tidak ditemukan.');
    }

    return { 
      success: true, 
      pdfUrl: result.Files[0].Url 
    }
  } catch (error: any) {
    console.error('Server Action Error:', error);
    return { 
      success: false, 
      error: error.message || 'Terjadi kesalahan internal pada server'
    }
  }
}
