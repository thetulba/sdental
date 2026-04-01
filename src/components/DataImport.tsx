import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  collection, 
  writeBatch, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export const DataImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (json.length > 0) {
          const sheetHeaders = json[0] as string[];
          setHeaders(sheetHeaders);
          setPreviewData(XLSX.utils.sheet_to_json(worksheet).slice(0, 5));
          
          // Auto-mapping attempt
          const newMapping: Record<string, string> = {};
          const targetFields = ['name', 'email', 'phone', 'amount', 'date', 'status', 'invoiceNumber'];
          
          sheetHeaders.forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('name')) newMapping[header] = 'name';
            else if (lowerHeader.includes('email')) newMapping[header] = 'email';
            else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) newMapping[header] = 'phone';
            else if (lowerHeader.includes('amount') || lowerHeader.includes('payment')) newMapping[header] = 'amount';
            else if (lowerHeader.includes('date')) newMapping[header] = 'date';
            else if (lowerHeader.includes('status')) newMapping[header] = 'status';
            else if (lowerHeader.includes('invoice')) newMapping[header] = 'invoiceNumber';
          });
          setMapping(newMapping);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const startImport = async () => {
    if (!file) return;
    setLoading(true);
    setStats(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        // Process in chunks of 400 (Firestore limit is 500)
        const chunkSize = 400;
        for (let i = 0; i < jsonData.length; i += chunkSize) {
          const chunk = jsonData.slice(i, i + chunkSize);
          const batch = writeBatch(db);

          for (const row of chunk) {
            try {
              // Extract mapped data
              const mappedRow: any = {};
              for (const [excelHeader, targetField] of Object.entries(mapping)) {
                if (targetField) {
                  (mappedRow as any)[targetField as string] = (row as any)[excelHeader as string];
                }
              }

              // 1. Create/Update Patient (User)
              const email = mappedRow.email || `patient_${Math.random().toString(36).substr(2, 9)}@example.com`;
              const name = mappedRow.name || 'Unknown Patient';
              
              // Check if user exists by email (simplified for demo)
              // In a real app, we'd query first, but here we'll generate a consistent ID
              const patientId = btoa(email).replace(/=/g, ''); 
              const patientRef = doc(db, 'users', patientId);
              
              batch.set(patientRef, {
                uid: patientId,
                email,
                name,
                phone: mappedRow.phone || '',
                role: 'patient',
                updatedAt: Timestamp.now()
              }, { merge: true });

              // 2. Create Invoice if amount exists
              if (mappedRow.amount || mappedRow.invoiceNumber) {
                const invoiceId = doc(collection(db, 'invoices')).id;
                const invoiceRef = doc(db, 'invoices', invoiceId);
                const amount = parseFloat(mappedRow.amount) || 0;
                
                batch.set(invoiceRef, {
                  patientId,
                  patientName: name,
                  date: mappedRow.date ? Timestamp.fromDate(new Date(mappedRow.date)) : Timestamp.now(),
                  totalAmount: amount,
                  status: mappedRow.status === 'paid' ? 'paid' : 'unpaid',
                  invoiceNumber: mappedRow.invoiceNumber || `INV-${Date.now()}-${successCount}`,
                  createdAt: Timestamp.now()
                });

                // 3. Create Payment if status is paid
                if (mappedRow.status === 'paid') {
                  const paymentId = doc(collection(db, 'payments')).id;
                  const paymentRef = doc(db, 'payments', paymentId);
                  batch.set(paymentRef, {
                    patientId,
                    invoiceId,
                    amount,
                    date: mappedRow.date ? Timestamp.fromDate(new Date(mappedRow.date)) : Timestamp.now(),
                    method: 'cash', // Default
                    createdAt: Timestamp.now()
                  });
                }
              }

              successCount++;
            } catch (err: any) {
              failedCount++;
              errors.push(`Row ${i + chunk.indexOf(row) + 1}: ${err.message}`);
            }
          }

          await batch.commit();
        }

        setStats({
          total: jsonData.length,
          success: successCount,
          failed: failedCount,
          errors: errors.slice(0, 10) // Show first 10 errors
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setStats({
        total: 0,
        success: 0,
        failed: 0,
        errors: [err.message]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-[32px] border border-surface-variant shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-headline">Bulk Data Import</h3>
            <p className="text-on-surface-variant text-sm">Upload your Excel or CSV file to backup and sync patient records, payments, and invoices.</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* File Upload Area */}
          <div 
            className={cn(
              "border-2 border-dashed rounded-[24px] p-12 text-center transition-all cursor-pointer",
              file ? "border-primary bg-primary/5" : "border-surface-variant hover:border-primary/50 hover:bg-surface-container-low"
            )}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              id="file-upload"
              type="file" 
              className="hidden" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant">
                {file ? <CheckCircle2 className="w-8 h-8 text-primary" /> : <Upload className="w-8 h-8" />}
              </div>
              <div>
                <p className="font-bold text-lg">{file ? file.name : "Click to upload Excel or CSV"}</p>
                <p className="text-sm text-on-surface-variant">Supports .xlsx, .xls, and .csv files</p>
              </div>
            </div>
          </div>

          {file && headers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-variant">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Column Mapping
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {headers.map(header => (
                    <div key={header} className="flex items-center justify-between p-3 bg-white rounded-xl border border-surface-variant">
                      <span className="text-sm font-medium truncate max-w-[150px]">{header}</span>
                      <select 
                        value={mapping[header] || ''}
                        onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                        className="text-xs font-bold bg-surface-container-low border border-surface-variant rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="">Skip Column</option>
                        <option value="name">Patient Name</option>
                        <option value="email">Email Address</option>
                        <option value="phone">Phone Number</option>
                        <option value="amount">Amount / Payment</option>
                        <option value="date">Date</option>
                        <option value="status">Status (Paid/Unpaid)</option>
                        <option value="invoiceNumber">Invoice Number</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => { setFile(null); setHeaders([]); setStats(null); }}
                  className="px-6 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={startImport}
                  disabled={loading}
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-primary-container transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                  {loading ? "Importing..." : "Start Import"}
                </button>
              </div>
            </motion.div>
          )}

          {stats && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-6 rounded-[24px] border",
                stats.failed === 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
              )}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  stats.failed === 0 ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                )}>
                  {stats.failed === 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-lg">Import Complete</h4>
                  <p className="text-sm opacity-80">Processed {stats.total} records.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/50 p-4 rounded-xl">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Success</p>
                  <p className="text-2xl font-headline text-green-600">{stats.success}</p>
                </div>
                <div className="bg-white/50 p-4 rounded-xl">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Failed</p>
                  <p className="text-2xl font-headline text-red-600">{stats.failed}</p>
                </div>
              </div>

              {stats.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">Error Log (First 10)</p>
                  <div className="bg-white/50 p-4 rounded-xl space-y-1">
                    {stats.errors.map((err, i) => (
                      <p key={i} className="text-[10px] text-red-600 font-mono">{err}</p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
