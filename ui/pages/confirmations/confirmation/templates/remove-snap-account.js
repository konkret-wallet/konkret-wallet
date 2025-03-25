function getValues(pendingApproval, t, actions, _history, _data, _contexts) {
  const { origin: snapId, snapName } = pendingApproval;
  const { publicAddress } = pendingApproval.requestData;

  const onCancel = () => {
    actions.resolvePendingApproval(pendingApproval.id, false);
  };

  return {
    content: [
      {
        element: 'RemoveSnapAccount',
        key: 'remove-snap-account',
        props: {
          snapId,
          snapName,
          publicAddress,
          onCancel,
        },
      },
    ],
    cancelText: t('cancel'),
    submitText: t('remove'),
    onSubmit: () => {
      actions.resolvePendingApproval(pendingApproval.id, true);
    },
    onCancel,
  };
}

const removeSnapAccount = {
  getValues,
};

export default removeSnapAccount;
