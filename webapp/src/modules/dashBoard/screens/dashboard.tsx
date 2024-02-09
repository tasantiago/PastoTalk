import { useState } from 'react';

import {
  AccordionContent,
  Icon,
  List,
  ListItem,
  SidebarContainer,
  Typography,
  UserDisplayName,
  UserProfilePicture,
} from '../styles/dashBoard.style';

const Dashboard = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleClick = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };
  return (
    <SidebarContainer>
      <UserDisplayName>
        <UserProfilePicture src="./defaultuser.png" />
        <Typography>Nome do Usuário</Typography>
      </UserDisplayName>
      <List onClick={() => handleClick('panel1')} isActive={expanded === 'panel1'}>
        <Typography>CADASTRO</Typography>
      </List>
      <AccordionContent $expanded={expanded === 'panel1'}>
        <ListItem>
          <Icon src="./icons/locicon.svg" />
          LOCAL
        </ListItem>

        <ListItem>
          <Icon src="./icons/aniicon.svg" />
          ANIMAL
        </ListItem>
        <ListItem>
          <Icon src="./icons/milkicon.svg" />
          LEITE
        </ListItem>
        <ListItem>
          <Icon src="./icons/recicon.svg" />
          RECEITA
        </ListItem>
        <ListItem>
          <Icon src="./icons/despicon.svg" />
          DESPESA
        </ListItem>
      </AccordionContent>
      <List onClick={() => handleClick('panel2')} isActive={expanded === 'panel2'}>
        <Typography>ITEM 2</Typography>
      </List>
      <AccordionContent $expanded={expanded === 'panel2'}>
        <ListItem>Conteúdo do ITEM 2</ListItem>
      </AccordionContent>
      <List onClick={() => handleClick('panel3')} isActive={expanded === 'panel3'}>
        <Typography>ITEM 3</Typography>
      </List>
      <AccordionContent $expanded={expanded === 'panel3'}>
        <ListItem>Conteúdo do ITEM 3</ListItem>
      </AccordionContent>
    </SidebarContainer>
  );
};

export default Dashboard;
