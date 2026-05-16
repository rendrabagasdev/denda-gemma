'use server'

import fs from 'fs'
import path from 'path'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

export async function generateInvitation(member: { nama: string; rt: string }) {
  try {
    const templatePath = path.resolve(process.cwd(), 'public/templates/undangan_template.docx')
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error('Template file not found. Please upload undangan_template.docx to public/templates/')
    }

    const content = fs.readFileSync(templatePath, 'binary')
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })

    // Set the data to replace in {{nama}} and {{rt}}
    doc.render({
      nama: member.nama,
      rt: member.rt,
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    })

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })

    // Return as base64 so it can be passed through Server Action
    return {
      success: true,
      data: buf.toString('base64'),
      filename: `Undangan_${member.nama.replace(/\s+/g, '_')}.docx`
    }
  } catch (error: any) {
    console.error('Error generating document:', error)
    return { success: false, error: error.message }
  }
}
