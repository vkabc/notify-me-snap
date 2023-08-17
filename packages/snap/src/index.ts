import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';

import { rpcErrors } from '@metamask/rpc-errors';
import type { OnCronjobHandler } from '@metamask/snaps-types';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `fetch`: Fetch a JSON document from the provided URL. This demonstrates
 * that a snap can make network requests through the `fetch` function. Note that
 * the `endowment:network-access` permission must be enabled for this to work.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentnetwork-access
 */

import type { FetchParams } from './types';

/**
 * Handle cronjob execution requests from MetaMask. This handler handles one
 * method:
 *
 * - `execute`: The JSON-RPC method that is called by MetaMask when the cronjob
 * is triggered. This method is specified in the snap manifest under the
 * `endowment:cronjob` permission. If you want to support more methods (e.g.,
 * with different times), you can add them to the manifest there.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#oncronjob
 */

/**
 * Fetch a JSON file from the provided URL. This uses the standard `fetch`
 * function to get the JSON data. Because of CORS, the server must respond with
 * an `Access-Control-Allow-Origin` header set to either `*` or `null`.
 *
 * Note that `fetch` is only available with the `endowment:network-access`
 * permission.
 *
 * @param url - The URL to fetch the data from. This function assumes that the
 * provided URL is a JSON document. Defaults to
 * `https://metamask.github.io/snaps/test-snaps/latest/test-data.json`.
 * @returns There response as JSON.
 * @throws If the provided URL is not a JSON document.
 */

const notify = (message: string) => {
  snap.request({
    method: 'snap_notify',
    params: {
      type: 'native',
      message: message,
    },
  });

  snap.request({
    method: 'snap_notify',
    params: {
      type: 'inApp',
      message: message,
    },
  });
};

async function getJson() {
  const response = await fetch(
    'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR',
  );
  return await response.json();
}

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const currentState = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
  switch (request.method) {
    case 'hello': {
      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: { ...currentState, threshold: request.params.to },
        },
      });

      notify(`threshold set to $${request.params.to}`);
      break;
    }

    case 'toggle_stop': {
      if (request.params.to) {
        if ('stop' in currentState && currentState.stop) {
          await snap.request({
            method: 'snap_manageState',
            params: {
              operation: 'update',
              newState: { ...currentState, stop: false },
            },
          });
          notify('Stopped monitoring for stop loss ⛔');
        } else {
          await snap.request({
            method: 'snap_manageState',
            params: {
              operation: 'update',
              newState: { ...currentState, stop: true },
            },
          });

          notify('Started monitoring for stop loss ✅');
        }
      }

      return await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      break;
    }

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'execute':
      // At a later time, get the data stored.

      const data = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      // If the stop flag is not set or stop is false, return.
      if (!('stop' in data) || ('stop' in data && !data.stop)) {
        return;
      }

      if ('threshold' in data && data.threshold) {
        const price: number = (await getJson('')).USD;
        if (parseFloat(price) < parseFloat(data.threshold)) {
          const message: string = `Price $${price.toString()} below $${data.threshold.toString()}`;

          notify(message);
        }
      } else {
        notify('threshold not set');
      }
      break;

    default:
      throw new Error('Method not found.');
  }
};
