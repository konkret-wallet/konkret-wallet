import React from 'react';
import {
  BackgroundColor,
  FontWeight,
  IconColor,
  TextColor,
} from '../../../helpers/constants/design-system';
import { Box, Icon, IconName, IconSize, Text } from '../../component-library';
import { getPortfolioUrl } from '../../../helpers/utils/portfolio';
import { useI18nContext } from '../../../hooks/useI18nContext';

type StakeableLinkProps = {
  chainId: string;
  symbol?: string;
};

export const StakeableLink = ({ chainId }: StakeableLinkProps) => {
  const t = useI18nContext();
  return (
    <Box
      as="button"
      backgroundColor={BackgroundColor.transparent}
      data-testid={`staking-entrypoint-${chainId}`}
      gap={1}
      paddingInline={0}
      paddingInlineStart={1}
      paddingInlineEnd={1}
      tabIndex={0}
      onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        const url = getPortfolioUrl('stake');
        global.platform.openTab({ url });
      }}
    >
      <Text as="span">•</Text>
      <Text
        as="span"
        color={TextColor.primaryDefault}
        paddingInlineStart={1}
        paddingInlineEnd={1}
        fontWeight={FontWeight.Medium}
      >
        {t('stake')}
      </Text>
      <Icon
        name={IconName.Stake}
        size={IconSize.Sm}
        color={IconColor.primaryDefault}
      />
    </Box>
  );
};
