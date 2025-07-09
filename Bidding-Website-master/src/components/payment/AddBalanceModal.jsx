// This component now uses the Bank Payment System
// Redirects to BankAddBalanceModal for consistency
import BankAddBalanceModal from './BankAddBalanceModal';

const AddBalanceModal = (props) => {
  return <BankAddBalanceModal {...props} />;
};

export default AddBalanceModal;