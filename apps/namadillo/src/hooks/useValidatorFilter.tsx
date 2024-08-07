import { useMemo } from "react";
import { Validator } from "types";

type Props = {
  validators: Validator[];
  myValidatorsAddresses: string[];
  searchTerm: string;
  onlyMyValidators: boolean;
};

const filterValidators = (validator: Validator, search: string): boolean => {
  if (!search) return true;
  const preparedSearch = search.toLowerCase().trim();
  return (
    validator.address.toLowerCase().indexOf(preparedSearch) > -1 ||
    (validator.alias ?
      validator.alias.toLowerCase().indexOf(preparedSearch) > -1
    : false)
  );
};

export const useValidatorFilter = ({
  validators,
  myValidatorsAddresses,
  searchTerm,
  onlyMyValidators,
}: Props): Validator[] => {
  return useMemo(() => {
    return validators.filter((v) => {
      const keep = filterValidators(v, searchTerm);
      if (keep && onlyMyValidators) {
        return myValidatorsAddresses.indexOf(v.address) >= 0;
      }
      return keep;
    });
  }, [validators, searchTerm, onlyMyValidators]);
};
