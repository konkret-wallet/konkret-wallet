import React, { useCallback } from 'react';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { openWindow } from '../../../../helpers/utils/window';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Box,
  ModalFooter,
  ButtonPrimary,
  ButtonPrimarySize,
  ModalBody,
  Text,
  ButtonSecondary,
  ButtonSecondarySize,
} from '../../../component-library';
import {
  Display,
  TextVariant,
  BlockSize,
} from '../../../../helpers/constants/design-system';
import { SUPPORT_LINK } from '../../../../../shared/lib/ui-utils';

type VisitSupportDataConsentModalProps = {
  onClose: () => void;
  isOpen: boolean;
};

const VisitSupportDataConsentModal: React.FC<
  VisitSupportDataConsentModalProps
> = ({ isOpen, onClose }) => {
  const t = useI18nContext();

  const handleClickContactSupportButton = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_params: any) => {
      onClose();
      let supportLinkWithUserId = SUPPORT_LINK as string;

      const queryString = queryParams.toString();
      if (queryString) {
        supportLinkWithUserId += `?${queryString}`;
      }

      openWindow(supportLinkWithUserId);
    },
    [onClose],
  );

  const handleClickNoShare = useCallback(() => {
    onClose();
    openWindow(SUPPORT_LINK as string);
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      data-testid="visit-support-data-consent-modal"
      className="visit-support-data-consent-modal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('visitSupportDataConsentModalTitle')}</ModalHeader>
        <ModalBody
          paddingLeft={4}
          paddingRight={4}
          className="visit-support-data-consent-modal__body"
        >
          <Text variant={TextVariant.bodyMd}>
            {t('visitSupportDataConsentModalDescription')}
          </Text>
        </ModalBody>

        <ModalFooter>
          <Box display={Display.Flex} gap={4}>
            <ButtonSecondary
              size={ButtonSecondarySize.Lg}
              width={BlockSize.Half}
              onClick={handleClickNoShare}
              data-testid="visit-support-data-consent-modal-reject-button"
            >
              {t('visitSupportDataConsentModalReject')}
            </ButtonSecondary>
            <ButtonPrimary
              size={ButtonPrimarySize.Lg}
              width={BlockSize.Half}
              onClick={() => handleClickContactSupportButton({})}
              data-testid="visit-support-data-consent-modal-accept-button"
            >
              {t('visitSupportDataConsentModalAccept')}
            </ButtonPrimary>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VisitSupportDataConsentModal;
