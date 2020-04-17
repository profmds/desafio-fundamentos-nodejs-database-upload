import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // Quando o repositório não existe nenhuma regra de negócios específica podemos usar o getRepository
    // Neste caso que temos uma regra de negócios pra tratar devemos usar o Custom
    // Isso garante que não sejam inicializados repositórios diferentes para que possamos sempre acessar os mesmos dados
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const balance = transactionsRepository.getBalance();

    // antes de tentar criar uma nova transação de retirada é preciso verificar e existe saldo

    if (type === 'outcome' && value >= (await balance).total) {
      throw new AppError('Invalid value, you cannot have a negative balance');
    }

    // verificar se a categoria já existe
    // como neste caso não temos um atributo com o mesmo nome que o parâmetro da tabela no banco
    // é necessário criar uma cláusula where
    const categoryExists = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    // utilizando o operador ternário verifico se a categoria existe, se existir armazeno o id
    // contudo não declaramos como constante, pois ela poderá ser alterada
    let category_id = categoryExists?.id;

    if (!categoryExists) {
      const newCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(newCategory);

      category_id = newCategory.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
