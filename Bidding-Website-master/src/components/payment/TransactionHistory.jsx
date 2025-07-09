// This component now uses the Bank Payment System
// Redirects to BankTransactionHistory for consistency
import BankTransactionHistory from './BankTransactionHistory';

const TransactionHistory = (props) => {
  return <BankTransactionHistory {...props} />;
};

export default TransactionHistory;