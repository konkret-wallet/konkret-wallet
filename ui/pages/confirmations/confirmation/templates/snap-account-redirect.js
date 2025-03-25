function getValues(pendingApproval, t, actions, _history, _data, _contexts) {
  const { origin: snapId, snapName } = pendingApproval;
  const { url, message, isBlockedUrl } = pendingApproval.requestData;

  const hasValidNonBlockedUrl = () => {
    return (
      url !== undefined &&
      url !== null &&
      url.length > 0 &&
      isBlockedUrl === false
    );
  };

  // We can only submit if the URL is valid and non-blocked
  const onSubmit = () => {
    return hasValidNonBlockedUrl()
      ? {
          submitText: t('goToSite'),
          onSubmit: () => {
            actions.resolvePendingApproval(pendingApproval.id, true);
          },
        }
      : {};
  };

  return {
    content: [
      {
        element: 'SnapAccountRedirect',
        key: 'snap-account-redirect',
        props: {
          url,
          message,
          snapId,
          snapName,
          isBlockedUrl,
          ...onSubmit(),
        },
      },
    ],
    cancelText: t('close'),
    onCancel: () => {
      actions.resolvePendingApproval(pendingApproval.id, false);
    },
    ...onSubmit(),
  };
}

const createSnapAccount = {
  getValues,
};

export default createSnapAccount;
