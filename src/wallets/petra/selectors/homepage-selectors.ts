export const homepageSelectors = {
    depositButton: "button:has-text('Deposit')",
    sendButton: "button:has-text('Send')",
    receiveButton: "button:has-text('Receive')",
    settingsMenu: "button[aria-label='Settings']",
    lockButton: "global-menu-lock",
    accountMenuButton: "button[data-part='trigger']",
    accountDialog: "div[role='dialog']",
    backButton: "button[id='back-button']",
};

export const unlockWalletSelectors = {
    passwordInput: "input[name='password']",
    unlockButton: "button:has-text('Unlock')",
};

export const accountSelectors = {
    accountOptionsMenuButton: "button[data-part='trigger']",
    editAccountButton: "button[aria-label='Edit account name']",
    renameAccountInput: "input[name='name']",
    saveButton: "button:has-text('Save')",
    cancelButton: "button:has-text('Cancel')",
    renameAccountLabel: "Rename",
    addressesLabel: "Addresses",
    pinToTopLabel: "Pin to top",
    hideAccountLabel: "Hide account",
};
