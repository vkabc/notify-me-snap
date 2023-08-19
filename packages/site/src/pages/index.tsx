import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap, getStopLossToggle,
  getThemePreference,
  sendHello,
  sendToggleStop,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
  Toggle,
  ToggleGeneric,
} from '../components';
import { InputPlaceholder } from '../components/Input';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;

  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 2rem;

  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }

  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const InfoMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.success.default};
  color: ${({ theme }) => theme.colors.success.default};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);


  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const [data, setData] = useState({
    threshold: '',
  });
  const sendData = (data) => {
    setData(data);
  };

  const containsOnlyNumbers = (str) => /\d+(\.\d+)*$/.test(str);
  const handleSendHelloClick = async () => {
    try {
      if (!data.threshold || !containsOnlyNumbers(data.threshold)) {
        dispatch({
          type: MetamaskActions.SetError,
          payload: { message: 'Please enter a valid threhsold (eg: 1232.2)' },
        });
        return
      }
       sendHello(data.threshold);

      dispatch({ type: MetamaskActions.SetInfo, payload: {message: `Stop Loss has been Set to $${  data.threshold}!`} });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        <Span>Notify Me</Span>
      </Heading>
      {!state.installedSnap && <Subtitle>
        Get started by clicking <code>Install MetaMask Flask</code>
      </Subtitle> }
      Notify Me is a snap extension that allows crypto holders to be alerted when a token price has crashed.
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}

        {state.info && (
          <InfoMessage>
            <b>Info Message:</b> {state.info.message}
          </InfoMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Stop Loss',
            description:
              'When the price of ethereum drops below a certain threshold (eg: $2000), you will be notified.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
              />
            ),
            input: <InputPlaceholder setThreshold={sendData} />,
            toggle: (
              <ToggleGeneric
                shouldLoad={state.installedSnap}
                onToggle={async () => {
                  try {
                     const data = await sendToggleStop(true);
                    dispatch({ type: MetamaskActions.SetInfo, payload: { message: data.stop?'Stop Loss Alert is Turned On!': 'Stop Loss ALert is Turned Off!' } });
                  } catch (e) {
                    console.error(e);
                    dispatch({ type: MetamaskActions.SetError, payload: e });
                  }
                }}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
        <Notice>
          <p>
            Please note that this is a proof of concept and is not meant to be{' '}
            <b>production ready </b>
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
