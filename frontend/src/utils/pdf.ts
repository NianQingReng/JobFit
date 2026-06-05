import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function downloadPDF(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = 210
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  let heightLeft = pdfHeight
  let position = 0
  const pageHeight = 297

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = -(pdfHeight - heightLeft)
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}
