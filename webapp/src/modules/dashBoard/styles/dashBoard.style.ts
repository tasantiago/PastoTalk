import styled, { css } from 'styled-components';

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

export const UserProfilePicture = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 10px;
  margin-top: 40px;
`;

export const UserDisplayName = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 20px;
`;

export const List = styled.ul<{ marginTop?: string; isActive?: boolean }>`
  list-style: none;
  width: 100%;
  background-color: ${({ isActive }) => (isActive ? 'rgba(91, 156, 129, 0.5)' : 'transparent')};
  ${({ marginTop }) =>
    marginTop &&
    css`
      margin-top: ${marginTop};
    `}
  margin-top: 20px;
`;

export const Typography = styled.p`
  margin: 0;
  padding: 5px 0;
`;

export const ListItem = styled.li`
  width: 100%;
  height: 40px;
  margin: 5px 0;
  display: flex;
  align-items: center;
  border-radius: 6px;

  &:hover {
    background: rgba(91, 156, 129, 0.2);
  }
`;

interface AccordionContentProps {
  $expanded: boolean;
}

export const AccordionContent = styled.div<AccordionContentProps>`
  width: 100%;
  max-height: ${({ $expanded }) => ($expanded ? '1000px' : '0')};
  transition: max-height 0.3s ease-in-out;
  overflow: hidden;
`;

export const Icon = styled.img`
  width: 25px;
  max-width: 100%;
  height: auto;
  margin-right: 15px;
`;
