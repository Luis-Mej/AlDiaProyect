import { LoginForm } from '../components/Auth/AuthForms';
import './LoginPage.css';

export const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-page-content">
        <LoginForm />
      </div>
    </div>
  );
};
