import { ActionButton, TableRow } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { WalletAddress } from "App/Common/WalletAddress";
import { myValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { MyValidator, Validator } from "types";
import { ValidatorCard } from "./ValidatorCard";
import { ValidatorsTable } from "./ValidatorsTable";
import StakingRoutes from "./routes";

export const MyValidatorsTable = (): JSX.Element => {
  const navigate = useNavigate();
  const myValidators = useAtomValue(myValidatorsAtom);
  const myValidatorsObj: Record<string, MyValidator> =
    myValidators.isSuccess ?
      myValidators.data.reduce(
        (acc: Record<string, MyValidator>, current: MyValidator) => {
          return { ...acc, [current.validator.address]: current };
        },
        {}
      )
    : {};

  const head = [
    "My Validators",
    "Address",
    <div key="my-validators-staked-amount" className="text-right">
      Staked Amount
    </div>,
    <div key="my-validators-vp" className="text-right">
      Voting Power
    </div>,
    <div key="my-validators-comission" className="text-right">
      Commission
    </div>,
  ];

  const renderRow = (validator: Validator): TableRow => {
    const stakedAmount = myValidatorsObj[validator.address].stakedAmount;
    return {
      className: "",
      cells: [
        <ValidatorCard
          key={`my-validator-${validator.address}`}
          validator={validator}
          showAddress={false}
        />,
        <WalletAddress
          key={`address-${validator.address}`}
          address={validator.address}
        />,
        <div
          key={`my-validator-currency-${validator.address}`}
          className="text-right leading-tight"
        >
          <NamCurrency amount={stakedAmount || new BigNumber(0)} />
        </div>,
        <div
          className="flex flex-col text-right leading-tight"
          key={`my-validator-voting-power-${validator.address}`}
        >
          {validator.votingPowerInNAM && (
            <NamCurrency
              amount={validator.votingPowerInNAM}
              forceBalanceDisplay
            />
          )}
          <span className="text-neutral-600 text-sm">
            {formatPercentage(BigNumber(validator.votingPowerPercentage || 0))}
          </span>
        </div>,
        <div
          key={`comission-${validator.address}`}
          className="text-right leading-tight"
        >
          {formatPercentage(validator.commission)}
        </div>,
      ],
    };
  };

  return (
    <>
      <nav className="sm:absolute top-6 right-4 flex gap-2 flex-1 z-50">
        <ActionButton
          className="basis-[content] py-1"
          backgroundColor="cyan"
          size="md"
          borderRadius="sm"
          onClick={() => navigate(StakingRoutes.incrementBonding().url)}
        >
          Stake
        </ActionButton>
        <ActionButton
          className="basis-[content] py-1"
          backgroundColor="white"
          size="md"
          borderRadius="sm"
          onClick={() => navigate(StakingRoutes.redelegateBonding().url)}
        >
          Re-delegate
        </ActionButton>
        <ActionButton
          className="basis-[content] py-1 hover:before:border-pink"
          backgroundColor="transparent"
          outlineColor="white"
          textColor="white"
          textHoverColor="white"
          backgroundHoverColor="pink"
          size="md"
          borderRadius="sm"
          onClick={() => navigate(StakingRoutes.unstake().url)}
        >
          Unstake
        </ActionButton>
      </nav>
      <AtomErrorBoundary
        result={myValidators}
        niceError="Unable to load your validators list"
        containerProps={{ className: "pb-16" }}
      >
        <ValidatorsTable
          id="my-validators"
          tableClassName="mt-2"
          validatorList={
            myValidators.isSuccess ?
              myValidators.data.map((v: MyValidator) => v.validator)
            : []
          }
          headers={head}
          renderRow={renderRow}
        />
      </AtomErrorBoundary>
    </>
  );
};
