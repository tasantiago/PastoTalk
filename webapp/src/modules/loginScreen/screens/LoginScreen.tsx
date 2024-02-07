import { faEye, faEyeSlash, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthProvider/useAuth';
import {
  BackgroundImage,
  CenteredContainer,
  CreateAccountButton,
  GlassDiv,
  Icon,
  IconButton,
  Input,
  InputField,
  LeftContainer,
  LoginConteiner,
  Logo,
  ResponsiveContainer,
  RightContainer,
  Spinner,
  SubmitButton,
  TopText,
  WelcomeText,
} from '../styles/loginScreen.styled';

const LoginScreen = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onFinish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await auth.authenticate(username, password);
      navigate('/dashboard');
    } catch (error) {
      alert('invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div>
      <BackgroundImage src="./bgloginpage.png" />
      <CenteredContainer>
        <GlassDiv>
          <LeftContainer>
            <ResponsiveContainer>
              <WelcomeText>BEM VINDO</WelcomeText>
              <Logo src="./PastoTalkLogo.svg" />
              <CreateAccountButton>CRIAR CONTA</CreateAccountButton>
            </ResponsiveContainer>
          </LeftContainer>
          <RightContainer>
            <LoginConteiner as="form" onSubmit={onFinish}>
              <TopText>FAÇA LOGIN</TopText>
              <InputField>
                <Icon icon={faUser} />
                <Input
                  type="text"
                  placeholder="Usuário"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </InputField>
              <InputField>
                <Icon icon={faLock} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </IconButton>
              </InputField>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Entrar'}
              </SubmitButton>
            </LoginConteiner>
          </RightContainer>
        </GlassDiv>
      </CenteredContainer>
    </div>
  );
};

export default LoginScreen;
