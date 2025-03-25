function getValues(pendingApproval, t, actions, _history, _data) {
  const { origin: snapId, snapName } = pendingApproval;

  const onCancel = () => {
    actions.resolvePendingApproval(pendingApproval.id, false);
  };

  return {
    content: [
      {
        element: 'CreateSnapAccount',
        key: 'create-snap-account',
        props: {
          snapId,
          snapName,
          onCancel,
        },
      },
    ],
    cancelText: t('cancel'),
    submitText: t('create'),
    onSubmit: () => {
      actions.resolvePendingApproval(pendingApproval.id, true);
    },
    onCancel,
  };
}

const createSnapAccount = {
  getValues,
};

export default createSnapAccount;
