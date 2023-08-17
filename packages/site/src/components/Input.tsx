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
  margin-bottom: 2em;
  color: ${props => props.$inputColor || 'black'};
  border-radius: 3px;
`;

export const InputPlaceholder = (props) => {
  return (
    <div>
      <Input placeholder="alert when < " onChange={(e) => props.setThreshold({threshold: e.target.value})}  type='text' />
    </div>
  );
};
