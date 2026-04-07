import Expenses from '../src/pages/Expenses';

function ExpensesPage() {
  return <Expenses />;
}

ExpensesPage.requireAuth = true;

export default ExpensesPage;
