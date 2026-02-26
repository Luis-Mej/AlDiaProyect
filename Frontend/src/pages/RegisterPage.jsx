import { RegisterForm } from '../components/Auth/AuthForms';
import './RegisterPage.css';

export const RegisterPage = () => {
  return (
    <div className="register-page">
      <div className="register-page-content">
        <RegisterForm />
      </div>
    </div>
  );
};
