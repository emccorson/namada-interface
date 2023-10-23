import { useEffect, useState, useContext, CSSProperties, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "styled-components";
import BigNumber from "bignumber.js";

import { getIntegration } from "@namada/hooks";
import { Signer, Tokens, TokenType, Account, TxProps, TransferProps } from "@namada/types";
import { ColorMode, DesignConfiguration, assertNever, NonEmptyArray } from "@namada/utils";
import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  Input,
  InputVariants,
} from "@namada/components";
import { chains } from "@namada/chains";
import { Query } from "@namada/shared";

import { CoinsState } from "slices/coins";
import { useAppSelector } from "store";

import {
  BackButton,
  ButtonsContainer,
  GasButtonsContainer,
  InputContainer,
  TokenSendFormContainer,
} from "./TokenSendForm.components";
import { parseTarget } from "./TokenSend";
import { SettingsState } from "slices/settings";
import { TopLevelRoute } from "App/types";
import { TransferType, TxTransferArgs } from "../types";

const submitTransferTransaction = async (
  account: Account,
  amount: BigNumber,
  token: TokenType,
  gasPrice: BigNumber,
  gasLimit: BigNumber,
  recipient: string,
  chainId: string
): Promise<void> => {
  const integration = getIntegration(chainId);
  const signer = integration.signer() as Signer;

  const tokenAddress = Tokens[token].address;

  const { type: accountType, publicKey, address: sourceAddress } = account;

  const txArgs: TxProps = {
    gasToken: tokenAddress,
    gasPrice,
    gasLimit,
    chainId,
    publicKey,
  };

  const transferArgs: TransferProps = {
    source: sourceAddress,
    target: recipient,
    token: tokenAddress,
    amount,
    nativeToken: Tokens.NAM.address
  };

  console.log(transferArgs);
  console.log(txArgs);
  console.log(accountType);

  return signer.submitTransfer(transferArgs, txArgs, accountType);

  //const {
  //  account: { address, chainId, publicKey, type },
  //  amount,
  //  faucet,
  //  target,
  //  token,
  //  feeAmount = new BigNumber(0),
  //} = txTransferArgs;
  //const integration = getIntegration(chainId);
  //const signer = integration.signer() as Signer;

  //const transferArgs = {
  //  source: faucet || address,
  //  target,
  //  //token: Tokens[token].address || Tokens.NAM.address || "",
  //  token: Tokens[token].address,
  //  amount,
  //  nativeToken: Tokens.NAM.address || "",
  //};

  //const txArgs = {
  //  token: Tokens.NAM.address || "",
  //  feeAmount,
  //  gasLimit: new BigNumber(20_000),
  //  chainId,
  //  publicKey: publicKey,
  //  signer: faucet ? target : undefined,
  //};

  //await signer.submitTransfer(transferArgs, txArgs, type);
};

export type BalanceEntry = {
  account: Account,
  balance: BigNumber,
  token: TokenType
}

const GAS_LIMIT = new BigNumber(20_000);

const AccountSelect: React.FC<{
  value: BalanceEntry;
  onChange: (account: BalanceEntry) => void;
  accounts: NonEmptyArray<BalanceEntry>;
}> = ({
  value,
  onChange,
  accounts,
}) => {
  const selectedIndex = accounts.findIndex(a => a === value);

  return (
    <label>
      <select
        value={selectedIndex}
        onChange={event => onChange(accounts[Number(event.target.value)])}
      >
        {accounts.map(({ account, balance, token }, i) =>
          <option
            key={i}
            value={i}
          >
            {account.alias} {balance.toString()} {token}
          </option>
        )}
      </select>
      Token
    </label>
  );
}

const AmountInput: React.FC<{
  value: BigNumber;
  onChange: (amount: BigNumber) => void;
  isAmountValid: boolean;
}> = ({
  value,
  onChange,
  isAmountValid
}) => {
  const [lastKnownValue, setLastKnownValue] = useState<BigNumber>();
  const [inputString, setInputString] = useState<string>();

  if (value !== lastKnownValue) {
    setLastKnownValue(value);
    setInputString(value.isNaN() ? "" : value.toString());
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputString(inputValue);

    const asBigNumber = new BigNumber(inputValue);
    setLastKnownValue(asBigNumber);
    onChange(asBigNumber);
  }

  const error = isAmountValid ? undefined : "Invalid amount!";

  return (
    <label>
      <input
        type="text"
        value={inputString}
        onChange={handleChange}
      ></input>
      Amount
      {error}
    </label>
  );
};

enum GasPrice {
  Low = "Low",
  Medium = "Medium",
  High = "High"
};

const GasPriceSelect: React.FC<{
  value: GasPrice;
  onChange: (gasPrice: GasPrice) => void;
  gasPriceTable: Record<GasPrice, BigNumber>;
  token: TokenType;
  gasLimit: BigNumber;
}> = ({
  value,
  onChange,
  gasPriceTable,
  token,
  gasLimit,
}) => {
  return (
    <fieldset>
      <legend>Gas price</legend>

      {[GasPrice.Low, GasPrice.Medium, GasPrice.High].map((gasPrice, i) =>
        <label key={i}>
          <input
            name="gas-price"
            type="radio"
            onChange={() => onChange(gasPrice)}
            checked={value === gasPrice}
          ></input>
          {gasPrice} {gasPriceTable[gasPrice].toString()} {token} / unit
          = {gasPriceTable[gasPrice].multipliedBy(gasLimit).toString()} {token}
        </label>
      )}
    </fieldset>
  );
}

const TokenSendForm: React.FC<{
  accounts: NonEmptyArray<BalanceEntry>
  minimumGasPrices: Record<TokenType, BigNumber>
  //address: string;
  //defaultTarget?: string;
  //tokenType: TokenType;
}> = ({
  accounts,
  minimumGasPrices
}) => {
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(NaN));
  const [selectedAccount, setSelectedAccount] = useState<BalanceEntry>(
    accounts.find(({ token }) => token === "NAM") || accounts[0]
  );
  const [gasPrice, setGasPrice] = useState<GasPrice>(GasPrice.Low);

  const token = selectedAccount.token;
  const gasLimit = GAS_LIMIT;

  const minGasPrice = minimumGasPrices[token];
  const gasPriceTable: Record<GasPrice, BigNumber> = {
    [GasPrice.Low]: minGasPrice,
    [GasPrice.Medium]: minGasPrice.multipliedBy(1.5),
    [GasPrice.High]: minGasPrice.multipliedBy(2),
  };

  const gasFees = gasPriceTable[gasPrice].multipliedBy(GAS_LIMIT);
  const balanceMinusFees = selectedAccount.balance.minus(gasFees);
  const isAmountValid = amount.isGreaterThanOrEqualTo(0) &&
    balanceMinusFees.isGreaterThanOrEqualTo(amount);

  const isFormValid = isAmountValid && recipient !== "";

  // TODO: is there something better than this?
  const { chainId } = useAppSelector<SettingsState>(state => state.settings);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    //if ((isShieldedTarget && target) || (target && token.address)) {
      submitTransferTransaction(
        selectedAccount.account,
        amount,
        token,
        gasPriceTable[gasPrice],
        gasLimit,
        recipient,
        chainId
      );
    //}
  };

  return (
    <form onSubmit={handleSubmit}>
      <AccountSelect
        accounts={accounts}
        value={selectedAccount}
        onChange={setSelectedAccount}
      />
      <br />

      <label>
        <input
          type="text"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        ></input>
        Recipient
      </label>
      <br />

      <AmountInput
        value={amount}
        onChange={setAmount}
        isAmountValid={isAmountValid}
      />
      <br />

      <button onClick={e => {
        e.preventDefault();
        setAmount(BigNumber.maximum(balanceMinusFees, 0));
      }}>
        USE EVERYTHING!
      </button>
      <br />

      <GasPriceSelect
        value={gasPrice}
        onChange={setGasPrice}
        gasPriceTable={gasPriceTable}
        token={token}
        gasLimit={gasLimit}
      />

      <button
        type="submit"
        disabled={!isFormValid}
      >
        Submit
      </button>
      <br />

      selectedAccount {selectedAccount.account.alias}
      <br />
      gasPrice {gasPrice}
      <br />
      gasFees {gasFees.toString()}
      <br />
      amount {amount.toString()}
      <br />
      recipient {recipient}
      <br />
    </form>
  );
};

//enum ComponentColor {
//  GasButtonBorder,
//  GasButtonBorderActive,
//}
//
//const getColor = (
//  color: ComponentColor,
//  theme: DesignConfiguration
//): string => {
//  const { colorMode } = theme.themeConfigurations;
//
//  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
//    light: {
//      [ComponentColor.GasButtonBorder]: theme.colors.secondary.main,
//      [ComponentColor.GasButtonBorderActive]: theme.colors.secondary.main,
//    },
//    dark: {
//      [ComponentColor.GasButtonBorder]: theme.colors.primary.main,
//      [ComponentColor.GasButtonBorderActive]: theme.colors.primary.main,
//    },
//  };
//
//  return colorMap[colorMode][color];
//};
//
//
//type Props = {
//  address: string;
//  defaultTarget?: string;
//  tokenType: TokenType;
//};
//
///**
// * Validates the form for a correct data. This needs more after containing also the shielded transfers
// * Spend more time doing proper feedback for the user and priorities when the user has several issues
// * in the form
// *
// * @param target recipient of the transfer
// * @param amount amount to transfer, in format as the user sees it
// * @param balance - balance of user
// * @param isTargetValid - pre-validated target, TODO: partly naive and likely better to call from within this function
// * @returns
// */
//const getIsFormInvalid = (
//  target: string | undefined,
//  amount: BigNumber,
//  balance: BigNumber,
//  isTargetValid: boolean
//): boolean => {
//  return (
//    target === "" ||
//    amount.isNaN() ||
//    amount.isGreaterThan(balance) ||
//    amount.isEqualTo(0) ||
//    !isTargetValid
//  );
//};
//
///**
// * gives the description above submit button to make it move obvious for the user
// * that the transfer might be a shielding/unshielding transfer
// */
//const AccountSourceTargetDescription = (props: {
//  isShieldedSource: boolean;
//  isShieldedTarget: boolean;
//}): React.ReactElement => {
//  const { isShieldedSource, isShieldedTarget } = props;
//  const source = isShieldedSource ? <b>Shielded</b> : <b>Transparent</b>;
//  const target = isShieldedTarget ? <b>Shielded</b> : <b>Transparent</b>;
//  return (
//    <>
//      {source} → {target}
//    </>
//  );
//};

/*
const TokenSendForm = ({
  address,
  tokenType,
  defaultTarget,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  //const [amount, setAmount] = useState<BigNumber>(new BigNumber(0));
  const [inputAmount, setInputAmount] = useState<string>("");
  const amount = new BigNumber(inputAmount);

  const [isTargetValid, setIsTargetValid] = useState(true);
  const [isShieldedTarget, setIsShieldedTarget] = useState(false);

  enum GasFee {
    "Low",
    "Medium",
    "High",
  }

  const [gasFee, setGasFee] = useState<GasFee>(GasFee.Low);

  const { chainId, fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const { rates } = useAppSelector<CoinsState>((state) => state.coins);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const derivedAccounts = derived[chainId];

  const { rpc } = chains[chainId];
  const query = new Query(rpc);

  const [minGasPrice, setMinGasPrice] = useState<BigNumber | undefined>();

  // TODO: what is the correct value for these numbers?
  const mediumGasPrice = minGasPrice?.multipliedBy(1.1);
  const highGasPrice = minGasPrice?.multipliedBy(1.2);

  useEffect(() => {
    (async () => {
      const gasTable = await query.query_gas_costs() as [string, string][];
      const namGasEntry = gasTable.find(
         entry => entry[0] === Tokens.NAM.address
      );
      if (namGasEntry) {
        const namGasPrice = namGasEntry[1];
        setMinGasPrice(new BigNumber(namGasPrice));
      }
    })();
  }, []);

  const { details, balance } = derivedAccounts[address];
  const isShieldedSource = details.isShielded;
  const token = Tokens[tokenType];

  const isFormInvalid = getIsFormInvalid(
    target,
    amount,
    balance[tokenType] || new BigNumber(0),
    isTargetValid
  );

  const accountSourceTargetDescription = isFormInvalid ? (
    ""
  ) : (
    <AccountSourceTargetDescription
      isShieldedSource={!!isShieldedSource}
      isShieldedTarget={isShieldedTarget}
    />
  );

  const handleFocus = (e: React.ChangeEvent<HTMLInputElement>): void =>
    e.target.select();

  const getFiatForCurrency = (gasPrice: BigNumber): BigNumber => {
    const rate =
      rates[tokenType] && rates[tokenType][fiatCurrency]
        ? rates[tokenType][fiatCurrency].rate
        : 1;
    return gasPrice.multipliedBy(rate).decimalPlaces(5);
  };

  const gasFees = {
    [GasFee.Low]: {
      fee: minGasPrice,
      fiat: minGasPrice && getFiatForCurrency(minGasPrice),
    },
    [GasFee.Medium]: {
      fee: mediumGasPrice,
      fiat: mediumGasPrice && getFiatForCurrency(mediumGasPrice),
    },
    [GasFee.High]: {
      fee: highGasPrice,
      fiat: highGasPrice && getFiatForCurrency(highGasPrice),
    },
  };

  useEffect(() => {
    // Validate target address
    (async () => {
      if (target) {
        // if the target is PaymentAddress, we toggle the transfer to shielded
        // TODO: take care of all case
        const transferTypeBasedOnAddress = parseTarget(target);
        if (transferTypeBasedOnAddress === TransferType.Shielded) {
          setIsShieldedTarget(true);
          setIsTargetValid(true);
          return;
        } else if (transferTypeBasedOnAddress === TransferType.Transparent) {
          setIsShieldedTarget(false);
        } else {
          setIsShieldedTarget(false);
        }
        // we dont allow the funds to be sent to source address
        if (target === address) {
          setIsTargetValid(false);
        } else {
          // We can add any other methods of validation here.
          setIsTargetValid(true);
        }
      }
    })();
  }, [target]);

  const handleOnSendClick = (): void => {
    if ((isShieldedTarget && target) || (target && token.address)) {
      submitTransferTransaction({
        chainId,
        account: details,
        target,
        amount,
        token: tokenType,
        feeAmount: new BigNumber(gasFee),
      });
    }
  };

  // if the transfer target is not TransferType.Shielded we perform the validation logic
  const isAmountValid = (
    address: string,
    token: TokenType,
    transferAmount: BigNumber,
    targetAddress: string | undefined
  ): string | undefined => {
    const balance = derivedAccounts[address].balance[token] || 0;

    const transferTypeBasedOnTarget =
      targetAddress && parseTarget(targetAddress);

    if (transferTypeBasedOnTarget === TransferType.Shielded) {
      return undefined;
    }
    return transferAmount.isLessThanOrEqualTo(balance)
      ? undefined
      : "Invalid amount!";
  };

  // these are passed to button for the custom gas fee buttons
  const gasFeeButtonActiveStyleOverride: CSSProperties = {
    backgroundColor: themeContext.colors.utility1.main60,
    color: themeContext.colors.utility2.main,
    border: `solid 1px ${getColor(
      ComponentColor.GasButtonBorderActive,
      themeContext
    )}`,
  };
  const gasFeeButtonStyleOverride: CSSProperties = {
    backgroundColor: themeContext.colors.utility1.main70,
    color: themeContext.colors.utility2.main80,
  };

  return (
    <>
      {minGasPrice &&
        <>
      <TokenSendFormContainer>
        <InputContainer>
          <Input
            variant={InputVariants.Text}
            label={"Recipient"}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setTarget(value);
            }}
            value={target}
            error={isTargetValid ? undefined : "Target is invalid"}
          />
        </InputContainer>
        <InputContainer>
          <Input
            variant={InputVariants.Number}
            label={"Amount"}
            value={inputAmount}
            onChangeCallback={(e) => {
              const { value } = e.target;
              setInputAmount(value);
            }}
            onFocus={handleFocus}
            error={isAmountValid(address, tokenType, amount, target)}
          />
        </InputContainer>
        <InputContainer>{accountSourceTargetDescription}</InputContainer>

        <GasButtonsContainer>
          <Button
            variant={ButtonVariant.Outlined}
            onClick={() => setGasFee(GasFee.Low)}
            style={
              gasFee === GasFee.Low
                ? gasFeeButtonActiveStyleOverride
                : gasFeeButtonStyleOverride
            }
            className={gasFee === GasFee.Low ? "active" : ""}
          >
            <p>
              <span>Low</span>
              <br />
              &lt; {gasFees[GasFee.Low].fee?.toString()} {tokenType}
              <br />
              &lt; {gasFees[GasFee.Low].fiat?.toString()} {fiatCurrency}
            </p>
          </Button>
          <Button
            variant={ButtonVariant.Outlined}
            onClick={() => setGasFee(GasFee.Medium)}
            style={
              gasFee === GasFee.Medium
                ? gasFeeButtonActiveStyleOverride
                : gasFeeButtonStyleOverride
            }
          >
            <p>
              <span>Medium</span>
              <br />
              &lt; {gasFees[GasFee.Medium].fee?.toString()} {tokenType}
              <br />
              &lt; {gasFees[GasFee.Medium].fiat?.toString()} {fiatCurrency}
            </p>
          </Button>
          <Button
            variant={ButtonVariant.Outlined}
            onClick={() => setGasFee(GasFee.High)}
            style={
              gasFee === GasFee.High
                ? gasFeeButtonActiveStyleOverride
                : gasFeeButtonStyleOverride
            }
          >
            <p>
              <span>High</span>
              <br />
              &lt; {gasFees[GasFee.High].fee?.toString()} {tokenType}
              <br />
              &lt; {gasFees[GasFee.High].fiat?.toString()} {fiatCurrency}
            </p>
          </Button>
        </GasButtonsContainer>
      </TokenSendFormContainer>

      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
        <Button
          variant={ButtonVariant.Contained}
          disabled={isFormInvalid}
          onClick={handleOnSendClick}
        >
          Continue
        </Button>
      </ButtonsContainer>
        </>
        }
    </>
  );
};
*/

export default TokenSendForm;
