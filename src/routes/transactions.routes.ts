import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  const printTransaction = {
    transactions,
    balance,
  };

  return response.json(printTransaction);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  // criando o objeto de criação da transaçãod com o conceito de Dependency Invertion
  // para que sempre a lista de transações abertas e não novas criadas
  const createTransaction = new CreateTransactionService();

  // chamada da execução do servço para que os dados da transação sejam deveras adicionado
  // no array de transações, para que o principío de cada arquivo realizar apenas seu papel
  // manipulações de dados serão enviadas aos serviços, porém adicionadas através do repositório
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.json({ message: 'Transaction removed with success.' });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const file = request.file.filename;

    const importTransactions = new ImportTransactionsService();

    /* const transactions = */ await importTransactions.execute(file);

    return response.json({ message: 'Arquivo importado' });
  },
);

export default transactionsRouter;
