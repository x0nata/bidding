// This component now uses the Bank Payment System
// Redirects to BankBalanceDisplay for consistency
import BankBalanceDisplay from './BankBalanceDisplay';

const BalanceDisplay = (props) => {
  return <BankBalanceDisplay {...props} />;
};

export default BalanceDisplay;