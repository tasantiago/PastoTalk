import { List, ListItem, SidebarContainer } from '../styles/dashBoard.style';

const Dashboard = () => {
  return (
    <SidebarContainer>
      <List>
        <ListItem>Cadastros</ListItem>
        <ListItem>Local</ListItem>
        <ListItem>Animal</ListItem>
        <ListItem>Leite</ListItem>
        <ListItem>Receitas</ListItem>
        <ListItem>Despesas</ListItem>
      </List>
    </SidebarContainer>
  );
};

export default Dashboard;
