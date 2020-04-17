// import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  // substituir por Transaction[]
  async execute(filename: string): Promise<Transaction[]> {
    const parsers = csvParse({ delimiter: ', ', from_line: 2 });

    const csvFilePath = path.join(uploadConfig.directory, filename);
    const csvReadStream = fs.createReadStream(csvFilePath);
    // console.log(csvReadStream);

    const parse = csvReadStream.pipe(parsers);

    const transactions: Request[] = [];

    // parse.on('data', async data => console.log(data));
    parse.on('data', async line => {
      const [title, type, value, category] = line;
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parse.on('end', resolve));

    const createTransaction = new CreateTransactionService();
    const transactionsDB: Transaction[] = [];

    for (const itemTransaction of transactions) {
      const transaction = await createTransaction.execute(itemTransaction);
      transactionsDB.push(transaction);
    }

    return transactionsDB;
  }
}
export default ImportTransactionsService;
