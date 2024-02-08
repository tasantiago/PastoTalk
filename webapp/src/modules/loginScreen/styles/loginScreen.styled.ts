import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled, { keyframes } from 'styled-components';

export const BackgroundImage = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
  object-position: left;
`;

export const LogoImage = styled.img``;

export const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const GlassDiv = styled.div`
  display: flex;
  justify-content: center;
  width: 90%;
  height: 100%;
  max-width: 1294px;
  max-height: 728px;
  margin: auto;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  overflow: hidden;

  @media (max-width: 768px) {
    max-width: 95%;
    max-height: 100%;
    flex-direction: column;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 100%;

    padding: 10px;
  }
`;

export const LeftContainer = styled.div`
  flex-grow: 1;
  flex: 0 0 33%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    flex: 0 0 20%;
    border-radius: 30px 30px 0px 0px;
    width: 100%;
  }
`;

export const ResponsiveContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: auto auto;
    width: 100%;
  }
`;

export const WelcomeText = styled.div`
  font-size: 48px;
  color: #313056;
  text-align: center;

  font-family: 'Century Gothic';
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 4.8px;

  @media (max-width: 768px) {
    font-size: 24px;

    grid-column: 1;
    grid-row: 1;

    align-self: center;
    justify-self: center;

    max-width: 80%;
  }
`;

export const Logo = styled.img`
  padding-top: 100px;
  padding-bottom: 100px;
  max-width: 100%;
  height: auto;

  @media (max-width: 768px) {
    padding-top: 0px;
    padding-bottom: 0px;

    grid-column: 2; // Ocupa a segunda coluna
    grid-row: 1 / 3; // Estende-se da primeira à segunda linha
    align-self: center; // Centraliza verticalmente
    justify-self: center; // Centraliza horizontalmente
  }
`;

export const CreateAccountButton = styled.button`
  margin-top: 20px;
  width: 284px;
  height: 65px;
  color: #313056;
  border: none;
  border-radius: 65px;
  background: rgba(255, 255, 255, 0.35);
  box-shadow: -10px 10px 20px 0px rgba(0, 0, 0, 0.15);
  cursor: pointer;

  text-align: center;
  font-family: 'Century Gothic', sans-serif;
  font-size: 24;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 3.6px;

  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: 2;

    align-self: center;
    justify-self: center;
    max-width: 80%;
  }
`;

export const RightContainer = styled.div`
  flex-grow: 1;
  flex: 1;
  width: 866px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0px 0px 30px 30px;
  }
`;

export const LoginConteiner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  max-width: 200px;
  margin: auto;
`;

export const TopText = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
`;

export const InputField = styled.div`
  position: relative;
  margin-bottom: 20px; // Exemplo de espaçamento, ajuste conforme necessário
`;

export const Input = styled.input`
  width: 450px;
  height: 65px;
  border-radius: 65px;
  background: rgba(255, 255, 255, 0.35);
  box-shadow: -10px 10px 20px 0 rgba(0, 0, 0, 0.15);
  border: none;
  padding-left: 60px; // Ajustado para acomodar o ícone à esquerda
  padding-right: 60px; // Ajustado para acomodar o ícone à direita
  font-size: 16px; // Ajuste conforme necessário

  ::placeholder {
    color: #aaa;
  }
  @media (max-width: 768px) {
    height: 50px; // Ajustar a altura para telas menores
    padding: 0 25px; // Reduzir o padding para telas menores
    font-size: 14px; // Reduzir o tamanho da fonte para telas menores
  }
`;

// Ícone de estilos
export const Icon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 25px; // Ajustado para alinhar com a borda interna do Input
  transform: translateY(-50%);
  color: #aaa;
`;

export const SubmitButton = styled.button`
  width: 311px;
  height: 65px;
  flex-shrink: 0;
  border-radius: 65px;
  background: #313056;
  box-shadow: -10px 10px 20px 0 rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: none;
  cursor: pointer;

  color: #fff;
  font-family: 'Century Gothic', sans-serif;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 7.2px;

  &:focus {
    outline: none;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: ${rotate} 2s linear infinite;
`;
