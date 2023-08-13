import { ReactNode } from 'react';
import styled from 'styled-components';

type CardProps = {
  content: {
    title?: string;
    description: ReactNode;
    button?: ReactNode;
  };
  disabled?: boolean;
  fullWidth?: boolean;
};
const Input = styled.input<{ $inputColor?: string; }>`
  padding: 0.5em;
  margin: 0.5em;
  color: ${props => props.$inputColor || 'gray'};
  border-radius: 3px;
`;

export const InputPlaceholder = (props) => {
  return (
    <div>
      <Input placeholder="1000" onChange={(e) => props.setThreshold({threshold: e.target.value})}  type='text' />
    </div>
  );
};
