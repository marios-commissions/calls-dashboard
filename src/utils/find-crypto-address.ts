const patterns = {
	EVM: /0x[a-fA-F0-9]{40}/,
	Solana: /[1-9A-HJ-NP-Za-km-z]{32,44}/
};

function findCryptoAddress(address) {
	for (const regex of Object.values(patterns)) {
		const matches = address.match(regex);
		if (!matches?.[0]) continue;

		return matches[0]; // Return the address if it matches
	}

	return null; // Return null if no match is found
}

export default findCryptoAddress;