import styled from 'styled-components';

export const SidebarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100%;
  background: #b8b775;
  border-right: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 6px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const List = styled.ul`
  list-style: none;
  width: 100%;
  margin-top: 20px;
`;

export const ListItem = styled.li`
  width: 100%;
  height: 50px;
  margin: 5px 0;
  display: flex;
  align-items: center;
  background: pink;
  border-radius: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;
