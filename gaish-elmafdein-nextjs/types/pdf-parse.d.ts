declare module 'pdf-parse' {
  interface PDFInfo {
    numpages: number
    numrender: number
    info: Record<string, unknown>
    metadata?: unknown
    version?: string
    text: string
  }
  // pageData shape depends on internal pdf.js types; using unknown to avoid any
  // Accept unknown pageData (library passes internal pdf.js page object)
  type Pagerender = (pageData: unknown) => Promise<string> | string
  interface Options { pagerender?: Pagerender }
  function pdfParse(dataBuffer: Buffer | Uint8Array, options?: Options): Promise<PDFInfo>
  export = pdfParse
}
