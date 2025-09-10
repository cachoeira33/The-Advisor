import Papa from 'papaparse';

// Define a structure for the transaction
interface Transaction {
  description: string;
  amount: number;
  date: string; // ISO string format
  type: 'INCOME' | 'EXPENSE';
  currency: string;
}

export function parseCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const result = Papa.parse(csvText, { header: true });
        const transactions: Transaction[] = [];

        // Assuming headers are 'description', 'amount', 'date'
        // This part needs adjustment based on actual CSV headers
        for (const row of result.data as any[]) {
          const amount = parseFloat(row.amount);
          if (!row.description || isNaN(amount) || !row.date) {
              continue; // Skip invalid rows
          }

          const transaction: Transaction = {
            description: row.description,
            amount: amount,
            date: new Date(row.date).toISOString(),
            type: amount > 0 ? 'INCOME' : 'EXPENSE',
            currency: 'USD', // Or determine from data
          };
          transactions.push(transaction);
        }
        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}