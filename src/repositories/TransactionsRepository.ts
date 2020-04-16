import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  // trocar void por Balance
  public async getBalance(): Promise<void> {
    /* const income = this.transactions.reduce((result, transaction) => {
      if (transaction.type === 'income') return result + transaction.value;

      return result;
    }, 0);
    const outcome = this.transactions.reduce((result, transaction) => {
      if (transaction.type === 'outcome') return result + transaction.value;

      return result;
    }, 0);

    const total = income - outcome;

    const balance = {
      income,
      outcome,
      total,
    };

    return balance; */
  }
}

export default TransactionsRepository;
