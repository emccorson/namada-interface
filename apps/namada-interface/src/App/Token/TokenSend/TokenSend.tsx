import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";

import { Account, AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TransferType } from "App/Token/types";
import { useAppSelector } from "store";

import { TokenType, Tokens } from "@namada/types";
import {
  Heading,
  HeadingLevel,
  NavigationContainer,
  Select,
  Option,
  TabsGroup,
  Tab,
} from "@namada/components";
import TokenSendForm from "./TokenSendForm";
import { useSanitizedParams } from "@namada/hooks";
import { isNonEmpty, NonEmptyArray } from "@namada/utils";
import { Query } from "@namada/shared";

import { TokenSendContainer, TokenSendContent } from "./TokenSend.components";
import {
  PAYMENT_ADDRESS_LENGTH,
  PAYMENT_ADDRESS_PREFIX,
  ESTABLISHED_ADDRESS_LENGTH,
  ESTABLISHED_ADDRESS_PREFIX,
} from "./types";
import { chains } from "@namada/chains";

import { BalanceEntry } from "./TokenSendForm";

export const parseTarget = (target: string): TransferType | undefined => {
  if (
    target.startsWith(PAYMENT_ADDRESS_PREFIX) &&
    target.length === PAYMENT_ADDRESS_LENGTH
  ) {
    return TransferType.Shielded;
  } else if (
    target.startsWith(ESTABLISHED_ADDRESS_PREFIX) &&
    target.length === ESTABLISHED_ADDRESS_LENGTH
  ) {
    return TransferType.Transparent;
  }

  // likely we can unify the form errors and return an object describing the error here
  return undefined;
};

type Params = {
  target: string;
};

const accountsWithBalanceIntoSelectData = (
  accountsWithBalance: Account[]
): Option<string>[] =>
  accountsWithBalance.flatMap(({ details, balance }) =>
    Object.entries(balance)
      .filter(([tokenType]) => !Tokens[tokenType as TokenType].isNut)
      .map(([tokenType, amount]) => ({
        value: `${details.address}|${tokenType}`,
        label: `${details.alias} ${amount} (${tokenType})`,
      }))
  );

const transform = (accounts: Account[]): NonEmptyArray<BalanceEntry> | undefined => {
  const result = accounts.flatMap(({ details, balance }) =>
    Object.entries(balance)
      .map(([tokenType, amount]) => ({
        account: details,
        balance: amount,
        token: tokenType as TokenType
      }))
  );

  return isNonEmpty(result) ? result : undefined;
}

const TokenSend = (): JSX.Element => {
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { target } = useSanitizedParams<Params>();

  const accounts = Object.values(derived[chainId]);

  const shieldedAccountsWithBalance = accounts.filter(
    ({ details }) => details.isShielded
  );
  const transparentAccountsWithBalance = accounts.filter(
    ({ details }) => !details.isShielded
  );

  const shieldedTokenData = accountsWithBalanceIntoSelectData(
    shieldedAccountsWithBalance
  );
  const transparentTokenData = accountsWithBalanceIntoSelectData(
    transparentAccountsWithBalance
  );

  const [
    selectedTransparentAccountAddress,
    setSelectedTransparentAccountAddress,
  ] = useState<string | undefined>();

  const [selectedShieldedAccountAddress, setSelectedShieldedAccountAddress] =
    useState<string | undefined>();

  useEffect(() => {
    setSelectedShieldedAccountAddress(
      shieldedAccountsWithBalance?.[0]?.details.address
    );
    setSelectedTransparentAccountAddress(
      transparentAccountsWithBalance?.[0]?.details.address
    );
  }, [derived[chainId]]);

  const tabs = ["Shielded", "Transparent"];
  let defaultTab = 0;

  // Load the correct form if coming from URL in QR code:
  if (target && target.startsWith("atest")) {
    defaultTab = 1;
  }

  const [activeTab, setActiveTab] = useState(tabs[defaultTab]);
  const [token, setToken] = useState<TokenType>(
    chains[chainId].currency.symbol
  );

  const handleTokenChange =
    (selectAccountFn: (accId: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      const { value } = e.target;
      const [accountId, tokenSymbol] = value.split("|");

      selectAccountFn(accountId);
      setToken(tokenSymbol as TokenType);
    };

  const [minimumGasPrices, setMinimumGasPrices] = useState<Record<TokenType, BigNumber>>();
  useEffect(() => {
    (async () => {
      const { rpc } = chains[chainId];
      const query = new Query(rpc);
      const queryResult = await query.query_gas_costs() as [string, string][];
      const namEntry =
        queryResult.find(([address]) => address === Tokens["NAM"].address);

      if (namEntry) {
        setMinimumGasPrices({
          "NAM": new BigNumber(namEntry[1]),
          // TODO: query the real minimum gas prices for non-NAM tokens
          "ATOM": new BigNumber(0),
          "ETH": new BigNumber(0),
          "TESTERC20": new BigNumber(0),
          "NUTTESTERC20": new BigNumber(0),
        });
      }
    })();
  }, []);

  const transparentTransformed = transform(transparentAccountsWithBalance);
  const shieldedTransformed = transform(shieldedAccountsWithBalance);

  return (
    <TokenSendContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Send</Heading>
      </NavigationContainer>

      <TabsGroup>
        {tabs.map((tab) => (
          <Tab
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </Tab>
        ))}
      </TabsGroup>

      {activeTab === "Shielded" && shieldedTransformed && minimumGasPrices && (
        <TokenSendContent>
          {shieldedTokenData.length > 0 ? (
            <>
              {selectedShieldedAccountAddress && (
                <TokenSendForm
                  accounts={shieldedTransformed}
                  minimumGasPrices={minimumGasPrices}
                />
              )}
            </>
          ) : (
            <p>You have no shielded token balances.</p>
          )}
        </TokenSendContent>
      )}

      {activeTab === "Transparent" && transparentTransformed && minimumGasPrices && (
        <TokenSendContent>
          {transparentTokenData.length > 0 ? (
            <>
              {selectedTransparentAccountAddress && (
                <TokenSendForm
                  accounts={transparentTransformed}
                  minimumGasPrices={minimumGasPrices}
                />
              )}
            </>
          ) : (
            <p>You have no transparent token balances.</p>
          )}
        </TokenSendContent>
      )}
    </TokenSendContainer>
  );
};

export default TokenSend;
